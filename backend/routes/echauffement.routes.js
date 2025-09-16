const express = require('express');
const router = express.Router();
const echauffementController = require('../controllers/echauffement.controller');
const { createUploader } = require('../middleware/upload.middleware');

// Middleware d'upload pour les images d'échauffements
// Le premier argument 'schemaUrl' doit correspondre au nom du champ dans le formulaire FormData
const uploadMiddleware = createUploader('schemaUrl', 'echauffements');

// Routes pour les échauffements
router.get('/', echauffementController.getAllEchauffements);
router.get('/:id', echauffementController.getEchauffementById);
// Appliquer le middleware d'upload à la création
router.post('/', uploadMiddleware, echauffementController.createEchauffement);
// Appliquer le middleware d'upload à la mise à jour
router.put('/:id', uploadMiddleware, echauffementController.updateEchauffement);
router.delete('/:id', echauffementController.deleteEchauffement);
router.post('/:id/duplicate', echauffementController.duplicateEchauffement);

module.exports = router;
