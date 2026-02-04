/**
 * Routes d'authentification
 * Authentification gérée par Supabase, routes pour la gestion du profil local
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const { getProfile, logout, updateProfile, register, updatePassword } = require('../controllers/auth.controller');
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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un profil utilisateur local
 *     description: Crée un profil utilisateur dans la base de données locale après authentification Supabase
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               nom:
 *                 type: string
 *                 example: Dupont
 *               prenom:
 *                 type: string
 *                 example: Jean
 *     responses:
 *       201:
 *         description: Profil créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', registerLimiter, express.json({ limit: '1mb' }), register);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Récupérer le profil utilisateur
 *     description: Récupère les informations du profil de l'utilisateur authentifié
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Mettre à jour le profil utilisateur
 *     description: Met à jour les informations du profil (nom, prénom, avatar)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Dupont
 *               prenom:
 *                 type: string
 *                 example: Jean
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: Image de profil (upload Cloudinary)
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/profile', authenticateToken, createUploader('icon', 'avatars'), updateProfile);

/**
 * @swagger
 * /api/auth/update-password:
 *   post:
 *     summary: Mettre à jour le mot de passe
 *     description: Change le mot de passe de l'utilisateur via Supabase Auth (côté client)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: nouveauMotDePasse123
 *     responses:
 *       200:
 *         description: Instructions pour changement de mot de passe
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/update-password', authenticateToken, express.json({ limit: '1mb' }), updatePassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion (symbolique)
 *     description: Route symbolique de déconnexion - La déconnexion réelle se fait côté client (suppression du token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Déconnexion réussie
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout', authenticateToken, logout);

module.exports = router;
