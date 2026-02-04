/**
 * Contrôleur pour l'authentification et la gestion de profil
 * Authentification gérée par Supabase, ce contrôleur gère uniquement le profil local
 */
const { prisma } = require('../services/prisma');
const { clearUserCache } = require('../middleware/auth.middleware');

/**
 * Récupérer le profil utilisateur
 */
const getProfile = async (req, res) => {
  try {
    // L'utilisateur est déjà disponible via le middleware auth
    const user = req.user;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        iconUrl: user.iconUrl,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
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
   * POST /api/auth/register
   * Créer un utilisateur en base après inscription Supabase
   * Body: { supabaseUserId, email, nom?, prenom? }
   */
  async register(req, res) {
    try {
      const { supabaseUserId, email, nom, prenom } = req.body || {};

      if (!supabaseUserId || !email) {
        return res.status(400).json({ 
          error: 'Champs requis: supabaseUserId et email', 
          code: 'BAD_REQUEST' 
        });
      }

      const normalizedEmail = String(email).trim().toLowerCase();

      // Vérifier si l'utilisateur existe déjà
      const existing = await prisma.user.findUnique({ 
        where: { id: supabaseUserId } 
      });

      if (existing) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[register] Utilisateur déjà existant:', supabaseUserId);
        }
        return res.json({
          user: {
            id: existing.id,
            email: existing.email,
            nom: existing.nom,
            prenom: existing.prenom,
            role: existing.role,
            isActive: existing.isActive,
            iconUrl: existing.iconUrl,
            createdAt: existing.createdAt,
            updatedAt: existing.updatedAt
          }
        });
      }

      // Créer l'utilisateur en base
      // L'authentification est entièrement gérée par Supabase
      const userData = {
        id: supabaseUserId,
        email: normalizedEmail,
        nom: nom || '',
        prenom: prenom || normalizedEmail.split('@')[0],
        role: 'USER',
        isActive: true,
      };

      const user = await prisma.user.create({ data: userData });

      if (process.env.NODE_ENV !== 'production') {
        console.log('[register] Nouvel utilisateur créé:', user.id, user.email);
      }

      // Créer le workspace BASE pour le nouvel utilisateur
      try {
        const baseWorkspace = await prisma.workspace.findFirst({
          where: { name: 'BASE' }
        });

        if (baseWorkspace) {
          await prisma.workspaceUser.create({
            data: {
              workspaceId: baseWorkspace.id,
              userId: user.id,
              role: 'VIEWER'
            }
          });
          if (process.env.NODE_ENV !== 'production') {
            console.log('[register] Utilisateur ajouté au workspace BASE');
          }
        }
      } catch (workspaceError) {
        console.error('[register] Erreur ajout workspace BASE:', workspaceError);
        // Ne pas bloquer l'inscription si l'ajout au workspace échoue
      }

      return res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          isActive: user.isActive,
          iconUrl: user.iconUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('[register] Erreur:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur lors de l\'inscription', 
        code: 'REGISTER_ERROR' 
      });
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

      // Invalider le cache utilisateur après mutation
      clearUserCache(authUser.id);
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Auth] Cache invalidé pour utilisateur:', authUser.id);
      }

      return res.json({
        user: {
          id: updated.id,
          email: updated.email,
          nom: updated.nom,
          prenom: updated.prenom,
          role: updated.role,
          iconUrl: updated.iconUrl,
          isActive: updated.isActive,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt
        }
      });
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du profil', code: 'PROFILE_UPDATE_ERROR' });
    }
  },

  /**
   * Mise à jour du mot de passe via Supabase Auth
   * POST /api/auth/update-password
   * Body: { newPassword }
   */
  async updatePassword(req, res) {
    try {
      const { newPassword } = req.body || {};

      if (!newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ 
          error: 'Le nouveau mot de passe est requis', 
          code: 'MISSING_PASSWORD' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'Le mot de passe doit contenir au moins 6 caractères', 
          code: 'PASSWORD_TOO_SHORT' 
        });
      }

      // Le mot de passe est géré par Supabase Auth
      // Le frontend doit appeler directement supabase.auth.updateUser()
      // Cette route est conservée pour la cohérence de l'API mais redirige vers le client
      return res.json({
        message: 'Le changement de mot de passe doit être effectué via Supabase Auth côté client',
        code: 'USE_CLIENT_AUTH'
      });
    } catch (error) {
      console.error('Erreur updatePassword:', error);
      return res.status(500).json({ 
        error: 'Erreur serveur lors de la mise à jour du mot de passe', 
        code: 'PASSWORD_UPDATE_ERROR' 
      });
    }
  }
};
