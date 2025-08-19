/**
 * Routes pour les situations et matchs
 * Gère : type (Match/Situation), description, tags, temps
 */
const express = require('express');
const router = express.Router();
const situationMatchController = require('../controllers/situationmatch.controller');

// Routes pour les situations/matchs
// GET /api/situations-matchs - Récupérer toutes les situations/matchs
router.get('/', situationMatchController.getAllSituationsMatchs);

// GET /api/situations-matchs/:id - Récupérer une situation/match par son ID
router.get('/:id', situationMatchController.getSituationMatchById);

// POST /api/situations-matchs - Ajouter une nouvelle situation/match
router.post('/', situationMatchController.createSituationMatch);

// PUT /api/situations-matchs/:id - Mettre à jour une situation/match
router.put('/:id', situationMatchController.updateSituationMatch);

// POST /api/situations-matchs/:id/duplicate - Dupliquer une situation/match
router.post('/:id/duplicate', situationMatchController.duplicateSituationMatch);

// DELETE /api/situations-matchs/:id - Supprimer une situation/match
router.delete('/:id', situationMatchController.deleteSituationMatch);

module.exports = router;
