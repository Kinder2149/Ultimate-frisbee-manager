/**
 * Routes d'authentification
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const { getProfile, logout, updateProfile } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { createUploader } = require('../middleware/upload.middleware');

const router = express.Router();

// Routes publiques (ou gérées par le client Supabase)

// Routes protégées (nécessitent un token JWT valide de Supabase)
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout); // Route symbolique
router.put('/profile', authenticateToken, createUploader('icon', 'avatars'), updateProfile);

module.exports = router;
