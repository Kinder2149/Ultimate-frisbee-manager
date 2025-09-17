/**
 * Routes d'authentification
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, getProfile, refreshToken, logout, updateProfile, changePassword, setSecurityQuestion, getSecurityQuestion, resetPasswordWithAnswer } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { createUploader } = require('../middleware/upload.middleware');

const router = express.Router();

// Limitation du taux de requêtes pour les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 tentatives par IP
  message: {
    error: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
    code: 'TOO_MANY_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Routes publiques
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);

// Routes pour la réinitialisation par question de sécurité
router.get('/security-question', getSecurityQuestion); // Publique, prend l'email en query param
router.post('/reset-password-answer', resetPasswordWithAnswer); // Publique

// Routes protégées (nécessitent authentification)
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);
router.put('/profile', authenticateToken, createUploader('icon', 'avatars'), updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/security-question', authenticateToken, setSecurityQuestion); // Protégée



module.exports = router;
