/**
 * Contrôleur pour l'authentification
 */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken, generateRefreshToken } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

/**
 * Connexion utilisateur
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Générer les tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Réponse avec les données utilisateur (sans le mot de passe)
    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        iconUrl: user.iconUrl
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la connexion',
      code: 'LOGIN_ERROR'
    });
  }
};

/**
 * Récupérer le profil utilisateur
 */
const getProfile = async (req, res) => {
  try {
    // L'utilisateur est déjà disponible via le middleware auth
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération du profil',
      code: 'PROFILE_ERROR'
    });
  }
};

/**
 * Rafraîchir le token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token requis',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Vérifier le refresh token
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth.middleware');
    
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Token de rafraîchissement invalide',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Vérifier que l'utilisateur existe (utiliser findFirst pour la condition composite)
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Générer un nouveau token
    const newToken = generateToken(user.id);

    res.json({
      message: 'Token rafraîchi avec succès',
      token: newToken
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token invalide ou expiré',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    console.error('Erreur refreshToken:', error);
    res.status(500).json({
      error: 'Erreur serveur lors du rafraîchissement',
      code: 'REFRESH_ERROR'
    });
  }
};

/**
 * Déconnexion (côté client principalement)
 */
const logout = async (req, res) => {
  try {
    // La déconnexion est principalement gérée côté client
    // (suppression des tokens du localStorage)
    res.json({
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la déconnexion',
      code: 'LOGOUT_ERROR'
    });
  }
};

module.exports = {
  login,
  getProfile,
  refreshToken,
  logout,
  /**
   * Mise à jour du profil utilisateur
   */
  async updateProfile(req, res) {
    try {
      const authUser = req.user; // injecté par authenticateToken
      const {
        email,
        nom,
        prenom,
        iconUrl,
        password,
        role,
        isActive
      } = req.body || {};

      // Préparer les données à mettre à jour (ignorer les chaînes vides)
      const data = {};
      if (typeof email === 'string' && email.trim().length > 0) data.email = email.trim().toLowerCase();
      if (typeof nom === 'string' && nom.trim().length > 0) data.nom = nom.trim();
      if (typeof prenom === 'string' && prenom.trim().length > 0) data.prenom = prenom.trim();
      if (typeof iconUrl === 'string' && iconUrl.trim().length > 0) data.iconUrl = iconUrl.trim();

      // Mot de passe optionnel
      if (password && typeof password === 'string' && password.length >= 6) {
        data.password = await bcrypt.hash(password, 10);
      }

      // Rôle et statut actif: uniquement si admin connecté
      const isAdmin = (authUser.role || '').toLowerCase() === 'admin';
      if (isAdmin) {
        if (typeof role === 'string') data.role = role;
        if (typeof isActive === 'boolean') data.isActive = isActive;
      }

      // Si e-mail fourni, vérifier l'unicité (et que ce n'est pas celui d'un autre user)
      if (data.email) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing && existing.id !== authUser.id) {
          return res.status(409).json({ error: 'Email déjà utilisé', code: 'EMAIL_TAKEN' });
        }
      }

      const updated = await prisma.user.update({
        where: { id: authUser.id },
        data
      });

      return res.json({
        user: {
          id: updated.id,
          email: updated.email,
          nom: updated.nom,
          prenom: updated.prenom,
          role: updated.role,
          iconUrl: updated.iconUrl,
          isActive: updated.isActive
        }
      });
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil', code: 'PROFILE_UPDATE_ERROR' });
    }
  }
};
