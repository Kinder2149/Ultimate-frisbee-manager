/**
 * Middleware d'authentification JWT
 */
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Clé secrète JWT (à déplacer dans .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'ultimate-frisbee-secret-key-2024';

/**
 * Middleware de vérification du token JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'authentification requis',
        code: 'NO_TOKEN'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        iconUrl: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé ou inactif',
        code: 'USER_NOT_FOUND'
      });
    }

    // Ajouter les infos utilisateur à la requête
    req.user = user;
    next();

  } catch (error) {
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
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token valide 7 jours
  );
};

/**
 * Générer un refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' } // Refresh token valide 30 jours
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  generateRefreshToken,
  JWT_SECRET
};
