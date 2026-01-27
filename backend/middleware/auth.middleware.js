/**
 * Middleware d'authentification Supabase uniquement
 * Suppression du système JWT local pour simplification
 */
const { prisma } = require('../services/prisma');
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// Support vérification JWT Supabase (RS256 via JWKS)
let jose;
try {
  jose = require('jose');
} catch (_) {
  console.warn('[Auth] jose non installé - vérification Supabase désactivée');
  jose = null;
}

// Détection d'erreurs DB transitoires (connexion/timeout)
function isTransientDbError(e) {
  if (!e) return false;
  const codes = new Set(['P1000', 'P1001', 'P1002', 'P1003']);
  const sysNet = new Set(['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'ECONNREFUSED']);
  if (e.code && (codes.has(e.code) || sysNet.has(e.code))) return true;
  const name = String(e.name || '').toLowerCase();
  if (name.includes('initialization') || name.includes('knownrequesterror') || name.includes('unknownrequesterror')) return true;
  const msg = String(e.message || '').toLowerCase();
  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('could not connect') || msg.includes('connection')) return true;
  const metaCause = String(e.meta?.cause || '').toLowerCase();
  if (metaCause.includes('timeout') || metaCause.includes('connection')) return true;
  return false;
}

async function fetchUserWithRetry(where) {
  const attempts = [0, 200, 600]; // total ~800ms
  let lastErr;
  for (const delay of attempts) {
    if (delay) await sleep(delay);
    try {
      return await prisma.user.findUnique({ where });
    } catch (e) {
      lastErr = e;
      // Prisma P1001 (cannot reach DB) -> retry quickly
      if (e && e.code === 'P1001') continue;
      throw e;
    }
  }
  throw lastErr;
}

// Cache simple en mémoire pour les profils utilisateurs (15 min TTL)
const userCacheById = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const getSupabaseProjectRef = () => {
  const ref = process.env.SUPABASE_PROJECT_REF;
  if (!ref) {
    throw new Error('FATAL ERROR: SUPABASE_PROJECT_REF is not defined. Required for auth.');
  }
  return ref;
};

/**
 * Middleware de vérification du token Supabase uniquement
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const rawToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' && rawToken.trim().length > 0 ? rawToken : null;

    // Bypass en développement: si aucun token et NODE_ENV=development, autoriser la requête
    const isDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development';
    if (isDev && !token) {
      console.log('[Auth] Mode dev - bypass auth');
      req.user = {
        id: 'dev-user',
        email: 'dev@local',
        role: 'ADMIN',
        isActive: true,
      };
      return next();
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'authentification requis',
        code: 'NO_TOKEN'
      });
    }

    // Vérifier le token Supabase (RS256 via JWKS)
    if (!jose) {
      return res.status(500).json({
        error: 'Configuration serveur invalide (jose manquant)',
        code: 'SERVER_CONFIG_ERROR'
      });
    }

    const projectRef = getSupabaseProjectRef();
    let decoded;
    
    const jwksUrl = new URL(`https://${projectRef}.supabase.co/auth/v1/keys`);
    try {
      const JWKS = jose.createRemoteJWKSet(jwksUrl);
      const { payload } = await jose.jwtVerify(token, JWKS, {
        algorithms: ['RS256']
      });
      decoded = payload;
    } catch (verifyError) {
      console.error('[Auth] Token verification failed:', verifyError.message);
      return res.status(401).json({
        error: 'Token invalide ou expiré',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Vérifier si l'utilisateur existe dans notre base de données
    let user = null;

    // 1) Tenter depuis le cache mémoire (avec vérification TTL)
    const cachedEntry = userCacheById.get(decoded.sub);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
      user = cachedEntry.user;
    }

    // 2) Si pas trouvé en cache, interroger Prisma
    if (!user) {
      try {
        if (decoded.sub) {
          user = await fetchUserWithRetry({ id: decoded.sub });
        }

        // Si l'utilisateur n'existe pas via son ID Supabase, tenter de le trouver par email.
        if (!user && decoded.email) {
          user = await fetchUserWithRetry({ email: decoded.email });
        }
      } catch (dbError) {
        console.error('[Auth] Error while fetching user from database:', dbError);
        // Fallback toléré: si la DB est momentanément injoignable (erreur transitoire),
        // autoriser les requêtes GET non admin avec un utilisateur minimal issu du token.
        const isSafeRead = req.method === 'GET' && !String(req.path || '').startsWith('/api/admin');
        if (isSafeRead && isTransientDbError(dbError)) {
          req.user = {
            id: decoded.sub || decoded.user_id || decoded.email || 'anon',
            email: decoded.email || 'unknown@token',
            role: (decoded.role && String(decoded.role).toUpperCase()) || 'USER',
            isActive: true,
          };
          return next();
        }
        // Sinon, 503 explicite
        return res.status(503).json({
          error: 'Service d\'authentification temporairement indisponible',
          code: 'AUTH_DB_UNAVAILABLE'
        });
      }
    }

    // Si l'utilisateur n'existe pas en base, refuser l'accès
    // Le provisioning se fait maintenant via la route /api/auth/register
    if (!user) {
      console.warn('[Auth] User not found in database:', decoded.sub, decoded.email);
      return res.status(403).json({ 
        error: 'Compte non trouvé. Veuillez vous inscrire.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Mettre en cache l'utilisateur avec timestamp
    if (user.id) {
      userCacheById.set(user.id, {
        user,
        timestamp: Date.now()
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Utilisateur inactif',
        code: 'USER_INACTIVE'
      });
    }

    // Ajouter les infos utilisateur à la requête
    req.user = user;
    next();

  } catch (error) {
    console.error('[Auth] Middleware error:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur lors de l\'authentification',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware de vérification du rôle administrateur
 */
const requireAdmin = (req, res, next) => {
  const role = req.user?.role ? String(req.user.role).toLowerCase() : undefined;
  if (!req.user || role !== 'admin') {
    return res.status(403).json({
      error: 'Accès réservé aux administrateurs',
      code: 'FORBIDDEN'
    });
  }
  next();
};

/**
 * Nettoyer le cache utilisateur (utile pour les tests ou invalidation manuelle)
 */
const clearUserCache = (userId) => {
  if (userId) {
    userCacheById.delete(userId);
  } else {
    userCacheById.clear();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  clearUserCache,
};
