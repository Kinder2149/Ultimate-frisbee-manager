/**
 * Routes d'authentification
 * Authentification gérée par Supabase, routes pour la gestion du profil local
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const { getProfile, logout, updateProfile, register } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { createUploader } = require('../middleware/upload.middleware');

const router = express.Router();

// Route publique d'inscription (après création du compte Supabase)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 tentatives max
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives d\'inscription. Réessayez plus tard.', code: 'RATE_LIMIT' }
});
router.post('/register', registerLimiter, express.json({ limit: '1mb' }), register);

// Routes protégées (nécessitent un token JWT valide de Supabase)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, createUploader('icon', 'avatars'), updateProfile);
router.post('/logout', authenticateToken, logout); // Route symbolique côté serveur

module.exports = router;
