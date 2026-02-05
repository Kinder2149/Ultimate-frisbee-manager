/**
 * Routes pour les situations et matchs
 * Gère : type (Match/Situation), description, tags, temps
 */
const express = require('express');
const router = express.Router();
const situationMatchController = require('../controllers/situationmatch.controller');
const { createUploader } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createSituationMatchSchema, updateSituationMatchSchema } = require('../validators/situationmatch.validator');
const { transformFormData } = require('../middleware/transform.middleware');
const { requireWorkspaceWrite } = require('../middleware/workspace.middleware');

// Routes pour les situations/matchs
router.get('/', situationMatchController.getAllSituationsMatchs);
router.get('/:id', situationMatchController.getSituationMatchById);

router.post('/', 
  createUploader('image', 'situations-matchs'), 
  transformFormData, 
  validate(createSituationMatchSchema), 
  requireWorkspaceWrite,
  situationMatchController.createSituationMatch
);

router.put('/:id', 
  createUploader('image', 'situations-matchs'), 
  transformFormData, 
  validate(updateSituationMatchSchema), 
  requireWorkspaceWrite,
  situationMatchController.updateSituationMatch
);
router.post('/:id/duplicate', requireWorkspaceWrite, situationMatchController.duplicateSituationMatch);
router.delete('/:id', requireWorkspaceWrite, situationMatchController.deleteSituationMatch);

module.exports = router;
