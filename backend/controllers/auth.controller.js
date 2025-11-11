/**
 * Contrôleur pour l'authentification et la gestion de profil
 */
const { prisma } = require('../services/prisma');
const bcrypt = require('bcryptjs');
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
  logout,
  /**
   * POST /api/auth/login
   * Body: { email, password }
   */
  async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Champs requis: email et password', code: 'BAD_REQUEST' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

      if (!user) {
        console.warn('[login] utilisateur introuvable', { email: normalizedEmail });
        return res.status(401).json({ error: 'Identifiants invalides', code: 'INVALID_CREDENTIALS' });
      }

      if (user.isActive === false) {
        console.warn('[login] utilisateur inactif', { id: user.id, email: normalizedEmail });
        return res.status(403).json({ error: 'Compte inactif', code: 'INACTIVE_ACCOUNT' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        console.warn('[login] mot de passe invalide', { id: user.id, email: normalizedEmail });
        return res.status(401).json({ error: 'Identifiants invalides', code: 'INVALID_CREDENTIALS' });
      }

      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      console.log('[login] succès', { id: user.id, role: user.role });

      return res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          isActive: user.isActive,
          iconUrl: user.iconUrl
        }
      });
    } catch (error) {
      console.error('Erreur login:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la connexion', code: 'LOGIN_ERROR' });
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
