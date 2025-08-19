const express = require('express');
const router = express.Router();
const echauffementController = require('../controllers/echauffement.controller');

// Routes pour les échauffements
router.get('/', echauffementController.getAllEchauffements);
router.get('/:id', echauffementController.getEchauffementById);
router.post('/', echauffementController.createEchauffement);
router.put('/:id', echauffementController.updateEchauffement);
router.delete('/:id', echauffementController.deleteEchauffement);
router.post('/:id/duplicate', echauffementController.duplicateEchauffement);

module.exports = router;
