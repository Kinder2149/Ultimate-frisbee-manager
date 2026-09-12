const express = require('express');
const router = express.Router();
const echauffementController = require('../controllers/echauffement.controller');
const { createUploader, renvoyerUrlImage } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createEchauffementSchema, updateEchauffementSchema } = require('../validators/echauffement.validator');
const { transformFormData } = require('../middleware/transform.middleware');
const { requireWorkspaceWrite } = require('../middleware/workspace.middleware');

// Routes pour les échauffements
router.get('/', echauffementController.getAllEchauffements);
router.get('/:id', echauffementController.getEchauffementById);

router.post('/', 
  requireWorkspaceWrite, 
  createUploader('image', 'echauffements'), 
  transformFormData, 
  validate(createEchauffementSchema),
  echauffementController.createEchauffement
);

router.put('/:id', 
  requireWorkspaceWrite, 
  createUploader('image', 'echauffements'), 
  transformFormData, 
  validate(updateEchauffementSchema),
  echauffementController.updateEchauffement
);
router.delete('/:id', requireWorkspaceWrite, echauffementController.deleteEchauffement);
router.post('/:id/duplicate', requireWorkspaceWrite, echauffementController.duplicateEchauffement);

// Galerie : envoi d'une image supplémentaire, renvoie son adresse
router.post('/images', requireWorkspaceWrite, createUploader('image', 'echauffements'), renvoyerUrlImage);

module.exports = router;
