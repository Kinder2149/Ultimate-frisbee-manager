/**
 * Routes pour les exercices
 */
const express = require('express');
const router = express.Router();
const exerciceController = require('../controllers/exercice.controller');
const { createUploader } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createExerciceSchema, updateExerciceSchema } = require('../validators/exercice.validator');

// GET /api/exercices - Récupérer tous les exercices avec leurs tags
router.get('/', exerciceController.getAllExercices);

// GET /api/exercices/:id - Récupérer un exercice par son ID
router.get('/:id', exerciceController.getExerciceById);

// POST /api/exercices - Ajouter un nouvel exercice avec des tags et une image (via Cloudinary)
router.post('/', createUploader('image', 'exercices'), validate(createExerciceSchema), exerciceController.createExercice);

// PUT /api/exercices/:id - Mettre à jour un exercice avec une image (via Cloudinary)
router.put('/:id', createUploader('image', 'exercices'), validate(updateExerciceSchema), exerciceController.updateExercice);

// POST /api/exercices/:id/duplicate - Dupliquer un exercice
router.post('/:id/duplicate', exerciceController.duplicateExercice);

// DELETE /api/exercices/:id - Supprimer un exercice
router.delete('/:id', exerciceController.deleteExercice);

module.exports = router;