/**
 * Routes pour les situations et matchs
 * Gère : type (Match/Situation), description, tags, temps
 */
const express = require('express');
const router = express.Router();
const situationMatchController = require('../controllers/situationmatch.controller');
const { createUploader, renvoyerUrlImage } = require('../middleware/upload.middleware');
const { copierVersEspace } = require('../controllers/copie-espace.controller');
const { validate } = require('../middleware/validation.middleware');
const { createSituationMatchSchema, updateSituationMatchSchema } = require('../validators/situationmatch.validator');
const { transformFormData } = require('../middleware/transform.middleware');
const { requireWorkspaceWrite } = require('../middleware/workspace.middleware');

// Routes pour les situations/matchs
router.get('/', situationMatchController.getAllSituationsMatchs);
router.get('/:id', situationMatchController.getSituationMatchById);

router.post('/', 
  requireWorkspaceWrite, 
  createUploader('image', 'situations-matchs'), 
  transformFormData, 
  validate(createSituationMatchSchema),
  situationMatchController.createSituationMatch
);

router.put('/:id', 
  requireWorkspaceWrite, 
  createUploader('image', 'situations-matchs'), 
  transformFormData, 
  validate(updateSituationMatchSchema),
  situationMatchController.updateSituationMatch
);
router.post('/:id/duplicate', requireWorkspaceWrite, situationMatchController.duplicateSituationMatch);
router.delete('/:id', requireWorkspaceWrite, situationMatchController.deleteSituationMatch);

// Galerie : envoi d'une image supplémentaire, renvoie son adresse
router.post('/images', requireWorkspaceWrite, createUploader('image', 'situations-matchs'), renvoyerUrlImage);

// Copie de l'element vers un autre espace de travail
router.post('/:id/copier-vers-espace', copierVersEspace('situation'));

module.exports = router;
