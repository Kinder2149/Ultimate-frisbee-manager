/**
 * Routes pour les situations et matchs
 * Gère : type (Match/Situation), description, tags, temps
 */
const express = require('express');
const router = express.Router();
const situationMatchController = require('../controllers/situationmatch.controller');
const { createUploader } = require('../middleware/upload.middleware');

// Middleware d'upload pour les images de situations/matchs
const uploadMiddleware = createUploader('schemaUrl', 'situations');

// Routes pour les situations/matchs
router.get('/', situationMatchController.getAllSituationsMatchs);
router.get('/:id', situationMatchController.getSituationMatchById);
router.post('/', uploadMiddleware, situationMatchController.createSituationMatch);
router.put('/:id', uploadMiddleware, situationMatchController.updateSituationMatch);
router.post('/:id/duplicate', situationMatchController.duplicateSituationMatch);
router.delete('/:id', situationMatchController.deleteSituationMatch);

module.exports = router;
