/**
 * Middleware d'authentification JWT
 */
const jwt = require('jsonwebtoken');
const { prisma } = require('../services/prisma');

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
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('[AUTH] No token found. Rejecting with 401.');
      return res.status(401).json({ 
        error: 'Token d\'authentification requis',
        code: 'NO_TOKEN'
      });
    }

    // Vérifier et décoder le token
    console.log('[AUTH] Token found, attempting to verify...');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Vérifier si l'utilisateur existe dans notre base de données
    let user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    // Si l'utilisateur n'existe pas via son ID Supabase, tenter de le trouver par email.
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });
    }

    // Si l'utilisateur n'existe toujours pas, le créer (provisioning).
    if (!user) {
      console.log(`[Auth] User with email ${decoded.email} not found. Creating new user.`);
      try {
        user = await prisma.user.create({
          data: {
            id: decoded.sub, // ID de Supabase
            email: decoded.email,
            nom: decoded.user_metadata?.last_name || '',
            prenom: decoded.user_metadata?.first_name || decoded.email.split('@')[0],
            iconUrl: decoded.user_metadata?.avatar_url || '',
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
    { expiresIn: '7d' } // Token valide 7 jours
  );
};

/**
 * Générer un refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    getJwtSecret(),
    { expiresIn: '30d' } // Refresh token valide 30 jours
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  generateRefreshToken,
};
