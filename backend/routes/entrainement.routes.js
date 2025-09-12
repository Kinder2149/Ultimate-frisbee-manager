/**
 * Routes unifiées pour les entraînements simplifiés
 * Gère uniquement : titre, date optionnelle, thème global
 */
const express = require('express');
const router = express.Router();
const entrainementController = require('../controllers/entrainement.controller');
const { createUploader, handleUploadResponse } = require('../middleware/upload.middleware');

// Routes pour les entraînements
// GET /api/entrainements - Récupérer tous les entraînements
router.get('/', entrainementController.getAllEntrainements);

// GET /api/entrainements/:id - Récupérer un entraînement par son ID
router.get('/:id', entrainementController.getEntrainementById);

// POST /api/entrainements - Ajouter un nouvel entraînement
router.post('/', entrainementController.createEntrainement);

// PUT /api/entrainements/:id - Mettre à jour un entraînement
router.put('/:id', entrainementController.updateEntrainement);

// POST /api/entrainements/:id/duplicate - Dupliquer un entraînement
router.post('/:id/duplicate', entrainementController.duplicateEntrainement);

// DELETE /api/entrainements/:id - Supprimer un entraînement
router.delete('/:id', entrainementController.deleteEntrainement);

// POST /api/entrainements/upload-image - Uploader une image pour un entraînement
const uploadEntrainement = createUploader('entrainements');
router.post('/upload-image', uploadEntrainement.single('image'), handleUploadResponse('entrainements'));

module.exports = router;
