const express = require('express');
const router = express.Router();
const echauffementController = require('../controllers/echauffement.controller');
const { createUploader, handleUploadResponse } = require('../middleware/upload.middleware');

// Routes pour les échauffements
router.get('/', echauffementController.getAllEchauffements);
router.get('/:id', echauffementController.getEchauffementById);
router.post('/', echauffementController.createEchauffement);
router.put('/:id', echauffementController.updateEchauffement);
router.delete('/:id', echauffementController.deleteEchauffement);
router.post('/:id/duplicate', echauffementController.duplicateEchauffement);

// Route pour l'upload d'image
const uploadEchauffement = createUploader('echauffements');
router.post('/upload-image', uploadEchauffement.single('image'), handleUploadResponse('echauffements'));

module.exports = router;
