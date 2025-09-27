/**
 * Contrôleur pour l'authentification et la gestion de profil
 */
const { prisma } = require('../services/prisma');
const { generateToken, generateRefreshToken } = require('../middleware/auth.middleware');

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
  // NOTE: Cette logique de refresh token est spécifique à l'ancien système JWT.
  // Avec Supabase Auth, le rafraîchissement est géré automatiquement par la bibliothèque client.
  // Cette route pourrait être dépréciée ou supprimée.
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
    
    // Avec Supabase, le 'sub' est l'ID utilisateur.
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.sub,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé pour ce token',
        code: 'USER_NOT_FOUND'
      });
    }

    // Générer un nouveau token d'accès
    const newAccessToken = generateToken(user);

    res.json({
      message: 'Token rafraîchi avec succès',
      token: newAccessToken
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
  // Avec Supabase Auth, la déconnexion est gérée par le client.
  // Cette route peut être conservée pour des raisons de cohérence de l'API, mais elle n'a pas d'effet côté serveur.
  try {
    res.json({
      message: 'Déconnexion initiée côté client.'
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
      // Gérer la mise à jour de l'avatar
      if (req.file) {
        // Si un nouveau fichier est uploadé, utiliser sa nouvelle URL
        data.iconUrl = req.file.cloudinaryUrl;
      } else if (typeof iconUrl !== 'undefined') {
        // Sinon, utiliser la valeur envoyée (peut être une URL existante ou null pour la supprimer)
        data.iconUrl = iconUrl || null;
      }

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
