/**
 * Routes unifiées pour les entraînements simplifiés
 * Gère uniquement : titre, date optionnelle, thème global
 */
const express = require('express');
const router = express.Router();
const entrainementController = require('../controllers/entrainement.controller');
const { createUploader } = require('../middleware/upload.middleware');

// Middleware d'upload pour les images d'entraînements
const uploadMiddleware = createUploader('schemaUrl', 'entrainements');

// Routes pour les entraînements
router.get('/', entrainementController.getAllEntrainements);
router.get('/:id', entrainementController.getEntrainementById);
router.post('/', uploadMiddleware, entrainementController.createEntrainement);
router.put('/:id', uploadMiddleware, entrainementController.updateEntrainement);
router.post('/:id/duplicate', entrainementController.duplicateEntrainement);
router.delete('/:id', entrainementController.deleteEntrainement);

module.exports = router;
