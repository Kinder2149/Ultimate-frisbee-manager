/**
 * Middleware d'authentification JWT
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../services/prisma');
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

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

// Cache simple en mémoire pour les profils utilisateurs déjà résolus
// Clé principale: id (sub), fallback: email
const userCacheById = new Map();
const userCacheByEmail = new Map();
// Support vérification JWT Supabase (RS256 via JWKS)
let jose;
try {
  jose = require('jose');
} catch (_) {
  // jose non installé: la vérification Supabase sera ignorée
  jose = null;
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined at runtime.');
  }
  return secret;
};

/**
 * Middleware de vérification du token JWT
 */
const authenticateToken = async (req, res, next) => {
  console.log('[AUTH] Middleware authenticateToken triggered for path:', req.path);
  try {
    const JWT_SECRET = getJwtSecret();
    const authHeader = req.headers['authorization'];
    const rawToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' && rawToken.trim().length > 0 ? rawToken : null;

    // Bypass en développement: si aucun token et NODE_ENV=development, autoriser la requête
    const isDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development';
    if (isDev && !token) {
      console.warn('[AUTH] Dev bypass active: aucune Authorization fournie, accès autorisé avec utilisateur factice.');
      req.user = {
        id: 'dev-user',
        email: 'dev@local',
        role: 'ADMIN',
        isActive: true,
      };
      return next();
    }

    if (!token) {
      console.log('[AUTH] No token found. Rejecting with 401.');
      return res.status(401).json({ 
        error: 'Token d\'authentification requis',
        code: 'NO_TOKEN'
      });
    }

    // Vérifier et décoder le token
    console.log('[AUTH] Token found, attempting to verify...');
    let decoded;
    try {
      // Essai 1: token signé en interne (HS256)
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // Essai 2: token Supabase (RS256 via JWKS)
      if (!jose) throw e; // jose indisponible
      const projectRef = process.env.SUPABASE_PROJECT_REF;
      if (!projectRef) {
        console.warn('[AUTH] SUPABASE_PROJECT_REF non défini — impossible de vérifier le token via JWKS.');
        throw e;
      }
      const jwksUrl = new URL(`https://${projectRef}.supabase.co/auth/v1/keys`);
      try {
        const JWKS = jose.createRemoteJWKSet(jwksUrl);
        const { payload } = await jose.jwtVerify(token, JWKS, {
          algorithms: ['RS256']
        });
        decoded = payload;
        console.log('[AUTH] Token vérifié via Supabase JWKS.');
      } catch (e2) {
        console.log('[AUTH] Verification via Supabase JWKS failed.');
        throw e; // conserver l'erreur initiale pour la logique existante
      }
    }
    
    // Vérifier si l'utilisateur existe dans notre base de données
    let user = null;

    // 1) Tenter depuis le cache mémoire
    if (decoded.sub && userCacheById.has(decoded.sub)) {
      user = userCacheById.get(decoded.sub);
    } else if (decoded.email && userCacheByEmail.has(decoded.email)) {
      user = userCacheByEmail.get(decoded.email);
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
        // En cas d’erreur Prisma (ex: P2024), retourner un 503 explicite
        return res.status(503).json({
          error: 'Service d\'authentification temporairement indisponible',
          code: 'AUTH_DB_UNAVAILABLE'
        });
      }
    }

    // Si l'utilisateur n'existe toujours pas, le créer (provisioning).
    if (!user) {
      console.log(`[Auth] User with email ${decoded.email} not found. Creating new user.`);
      try {
        // Générer un mot de passe aléatoire uniquement pour satisfaire la contrainte de schéma
        // (l'authentification réelle est gérée par Supabase, ce mot de passe n'est jamais utilisé).
        const randomPassword = `supabase-${Math.random().toString(36).slice(2)}`;
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        user = await prisma.user.create({
          data: {
            id: decoded.sub, // ID de Supabase
            email: decoded.email,
            nom: decoded.user_metadata?.last_name || '',
            prenom: decoded.user_metadata?.first_name || decoded.email.split('@')[0],
            iconUrl: decoded.user_metadata?.avatar_url || '',
            passwordHash,
            role: 'USER',
            isActive: true,
          },
        });
        console.log(`[Auth] New user created successfully: ${user.email}`);
      } catch (creationError) {
        console.error('[Auth] Error creating new user from token:', creationError);
        return res.status(500).json({ 
          error: 'Impossible de créer le profil utilisateur local.',
          code: 'USER_PROVISIONING_ERROR'
        });
      }
    }

    // Mettre en cache l'utilisateur pour les prochaines requêtes
    if (user.id) {
      userCacheById.set(user.id, user);
    }
    if (user.email) {
      userCacheByEmail.set(user.email, user);
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
    console.log('[AUTH] Caught error:', error.name);
    const isDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development';
    if (isDev && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      console.warn('[AUTH] Dev bypass on JWT error:', error.name, '— accès autorisé avec utilisateur factice.');
      req.user = {
        id: 'dev-user',
        email: 'dev@local',
        role: 'ADMIN',
        isActive: true,
      };
      return next();
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token invalide',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Erreur middleware auth:', error);
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
 * Générer un token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Générer un refresh token
 */
const getJwtRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('FATAL ERROR: JWT_REFRESH_SECRET is not defined at runtime.');
  }
  return secret;
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    getJwtRefreshSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  generateRefreshToken,
};
