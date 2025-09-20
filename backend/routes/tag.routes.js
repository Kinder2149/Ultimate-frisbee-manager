/**
 * Routes pour les tags
 */
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');
const { validate } = require('../middleware/validation.middleware');
const { createTagSchema, updateTagSchema } = require('../validators/tag.validator');

// GET /api/tags - Récupérer tous les tags
router.get('/', tagController.getAllTags);

// GET /api/tags/:id - Récupérer un tag par son ID
router.get('/:id', tagController.getTagById);

// POST /api/tags - Ajouter un nouveau tag
router.post('/', validate(createTagSchema), tagController.createTag);

// PUT /api/tags/:id - Mettre à jour un tag
router.put('/:id', validate(updateTagSchema), tagController.updateTag);

// DELETE /api/tags/:id - Supprimer un tag
router.delete('/:id', tagController.deleteTag);

module.exports = router;