/**
 * Routes unifiées pour les entraînements simplifiés
 * Gère uniquement : titre, date optionnelle, thème global
 */
const express = require('express');
const router = express.Router();
const entrainementController = require('../controllers/entrainement.controller');
const { createUploader } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createEntrainementSchema, updateEntrainementSchema } = require('../validators/entrainement.validator');

// Middleware d'upload pour les images d'entraînements
const uploadMiddleware = createUploader('schemaUrl', 'entrainements');

// Routes pour les entraînements
router.get('/', entrainementController.getAllEntrainements);
router.get('/:id', entrainementController.getEntrainementById);
router.post('/', uploadMiddleware, validate(createEntrainementSchema), entrainementController.createEntrainement);
router.put('/:id', uploadMiddleware, validate(updateEntrainementSchema), entrainementController.updateEntrainement);
router.post('/:id/duplicate', entrainementController.duplicateEntrainement);
router.delete('/:id', entrainementController.deleteEntrainement);

module.exports = router;
