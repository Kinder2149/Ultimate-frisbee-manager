/**
 * Contrôleur pour l'authentification
 */
const bcrypt = require('bcryptjs');
const { generateToken, generateRefreshToken } = require('../middleware/auth.middleware');
const { prisma } = require('../services/prisma');
const crypto = require('crypto');

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
    const normalizedEmail = (email || '').toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      console.warn('[AUTH] Login échec: utilisateur introuvable pour email=', normalizedEmail);
    }

    if (!user || !user.isActive) {
      if (user && !user.isActive) {
        console.warn('[AUTH] Login échec: utilisateur inactif email=', normalizedEmail);
      }
      return res.status(401).json({
        error: 'Identifiants invalides',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.warn('[AUTH] Login échec: mot de passe invalide pour email=', normalizedEmail);
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



const setSecurityQuestion = async (req, res) => {
    try {
        const { id } = req.user;
        const { securityQuestion, securityAnswer } = req.body;

        if (!securityQuestion || !securityAnswer) {
            return res.status(400).json({ error: 'La question et la réponse sont requises.', code: 'MISSING_FIELDS' });
        }

        const hashedAnswer = await bcrypt.hash(securityAnswer, 10);

        await prisma.user.update({
            where: { id },
            data: { securityQuestion, securityAnswer: hashedAnswer },
        });

        res.json({ message: 'Question de sécurité mise à jour avec succès.' });
    } catch (error) {
        console.error('Erreur setSecurityQuestion:', error);
        res.status(500).json({ error: 'Erreur serveur.', code: 'SERVER_ERROR' });
    }
};

const getSecurityQuestion = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Adresse e-mail requise.', code: 'EMAIL_REQUIRED' });
        }

        const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });

        if (!user || !user.securityQuestion) {
            return res.status(404).json({ error: 'Aucune question de sécurité trouvée pour cet utilisateur.', code: 'NO_SECURITY_QUESTION' });
        }

        res.json({ securityQuestion: user.securityQuestion });
    } catch (error) {
        console.error('Erreur getSecurityQuestion:', error);
        res.status(500).json({ error: 'Erreur serveur.', code: 'SERVER_ERROR' });
    }
};

const resetPasswordWithAnswer = async (req, res) => {
    try {
        const { email, securityAnswer, newPassword, confirmPassword } = req.body;

        if (!email || !securityAnswer || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'Tous les champs sont requis.', code: 'MISSING_FIELDS' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.', code: 'PASSWORD_MISMATCH' });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

        if (!user || !user.securityAnswer) {
            return res.status(401).json({ error: 'Réponse incorrecte ou utilisateur invalide.', code: 'INVALID_ANSWER' });
        }

        const isAnswerValid = await bcrypt.compare(securityAnswer, user.securityAnswer);

        if (!isAnswerValid) {
            return res.status(401).json({ error: 'Réponse incorrecte ou utilisateur invalide.', code: 'INVALID_ANSWER' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword },
        });

        res.json({ message: 'Mot de passe réinitialisé avec succès.' });

    } catch (error) {
        console.error('Erreur resetPasswordWithAnswer:', error);
        res.status(500).json({ error: 'Erreur serveur.', code: 'SERVER_ERROR' });
    }
};

module.exports = {
  login,
  getProfile,
  refreshToken,
  logout,
  setSecurityQuestion,
  getSecurityQuestion,
  resetPasswordWithAnswer,
  /**
   * Changement de mot de passe
   */
  async changePassword(req, res) {
    try {
      const authUser = req.user;
      const { newPassword, confirmPassword } = req.body;

      // Validation
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Tous les champs sont requis', code: 'MISSING_FIELDS' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Les nouveaux mots de passe ne correspondent pas', code: 'PASSWORD_MISMATCH' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères', code: 'PASSWORD_TOO_SHORT' });
      }



      // Mettre à jour le mot de passe
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: authUser.id },
        data: { password: hashedNewPassword }
      });

      return res.json({ message: 'Mot de passe mis à jour avec succès' });

    } catch (error) {
      console.error('Erreur changePassword:', error);
      return res.status(500).json({ error: 'Erreur serveur lors du changement de mot de passe', code: 'PASSWORD_CHANGE_ERROR' });
    }
  },
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
