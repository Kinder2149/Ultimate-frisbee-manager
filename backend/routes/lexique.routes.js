/**
 * Routes pour le lexique (vocabulaire commun du club)
 */
const express = require('express');
const router = express.Router();
const lexiqueController = require('../controllers/lexique.controller');
const { validate } = require('../middleware/validation.middleware');
const { createLexiqueSchema, updateLexiqueSchema } = require('../validators/lexique.validator');
const { requireWorkspaceWrite } = require('../middleware/workspace.middleware');

// GET /api/lexique - Récupérer tous les termes
router.get('/', lexiqueController.getAllLexiques);

// GET /api/lexique/:id - Récupérer un terme par son ID
router.get('/:id', lexiqueController.getLexiqueById);

// POST /api/lexique - Ajouter un nouveau terme
router.post('/', validate(createLexiqueSchema), requireWorkspaceWrite, lexiqueController.createLexique);

// PUT /api/lexique/:id - Mettre à jour un terme
router.put('/:id', validate(updateLexiqueSchema), requireWorkspaceWrite, lexiqueController.updateLexique);

// DELETE /api/lexique/:id - Supprimer un terme
router.delete('/:id', requireWorkspaceWrite, lexiqueController.deleteLexique);

module.exports = router;
