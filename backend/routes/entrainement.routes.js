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
const { transformFormData } = require('../middleware/transform.middleware');
const { requireWorkspaceWrite } = require('../middleware/workspace.middleware');

// Routes pour les entraînements
router.get('/', entrainementController.getAllEntrainements);
router.get('/:id', entrainementController.getEntrainementById);

router.post('/', 
  requireWorkspaceWrite, 
  ...createUploader('image', 'entrainements'), 
  transformFormData, 
  validate(createEntrainementSchema),
  entrainementController.createEntrainement
);

router.put('/:id', 
  requireWorkspaceWrite, 
  ...createUploader('image', 'entrainements'), 
  transformFormData, 
  validate(updateEntrainementSchema),
  entrainementController.updateEntrainement
);
router.post('/:id/duplicate', requireWorkspaceWrite, entrainementController.duplicateEntrainement);
router.delete('/:id', requireWorkspaceWrite, entrainementController.deleteEntrainement);

module.exports = router;
