/**
 * Routes d'authentification
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const { login, getProfile, refreshToken, logout, updateProfile, changePassword, setSecurityQuestion, getSecurityQuestion, resetPasswordWithAnswer } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { prisma } = require('../services/prisma');

const router = express.Router();

// Multer storage config for avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '').toLowerCase();
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base || 'avatar'}-${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Type de fichier non supporté'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

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
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/security-question', authenticateToken, setSecurityQuestion); // Protégée

// Upload d'avatar
router.post('/profile/icon', authenticateToken, upload.single('icon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu', code: 'NO_FILE' });
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { iconUrl: req.file.filename }
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
  } catch (err) {
    console.error('Erreur upload avatar:', err);
    return res.status(500).json({ error: 'Erreur serveur lors de l\'upload', code: 'UPLOAD_ERROR' });
  }
});

module.exports = router;
