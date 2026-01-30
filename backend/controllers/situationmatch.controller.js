/**
 * Controller pour la gestion des situations et matchs
 * Gère : type (Match/Situation), description, tags, temps
 */
const situationMatchService = require('../services/business/situationmatch.service');

/**
 * Récupère toutes les situations/matchs (avec pagination)
 * @route GET /api/situations-matchs
 * @query page - Numéro de page (défaut: 1)
 * @query limit - Nombre d'éléments par page (défaut: 50)
 */
exports.getAllSituationsMatchs = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { page, limit } = req.query;

    const result = await situationMatchService.getAllSituationsMatchs(workspaceId, { page, limit });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère une situation/match par son ID
 * @route GET /api/situations-matchs/:id
 */
exports.getSituationMatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const situationMatch = await situationMatchService.getSituationMatchById(id, workspaceId);
    
    if (!situationMatch) {
      const error = new Error('Situation/match non trouvée');
      error.statusCode = 404;
      return next(error);
    }
    
    res.json(situationMatch);
  } catch (error) {
    next(error);
  }
};

/**
 * Crée une nouvelle situation/match
 * @route POST /api/situations-matchs
 */
exports.createSituationMatch = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const data = req.body;
    const file = req.file;

    const nouvelleSituationMatch = await situationMatchService.createSituationMatch(data, workspaceId, file);
    
    res.status(201).json(nouvelleSituationMatch);
  } catch (error) {
    if (error.code === 'INVALID_TAGS') {
      return res.status(error.statusCode || 400).json({
        error: error.message,
        code: error.code,
        invalidIds: error.invalidIds
      });
    }
    next(error);
  }
};

/**
 * Met à jour une situation/match existante
 * @route PUT /api/situations-matchs/:id
 */
exports.updateSituationMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    const data = req.body;
    const file = req.file;

    const situationMatchMiseAJour = await situationMatchService.updateSituationMatch(id, data, workspaceId, file);
    
    res.json(situationMatchMiseAJour);
  } catch (error) {
    if (error.code === 'INVALID_TAGS') {
      return res.status(error.statusCode || 400).json({
        error: error.message,
        code: error.code,
        invalidIds: error.invalidIds
      });
    }
    next(error);
  }
};

/**
 * Supprime une situation/match
 * @route DELETE /api/situations-matchs/:id
 */
exports.deleteSituationMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    await situationMatchService.deleteSituationMatch(id, workspaceId);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Duplique une situation/match existante
 * @route POST /api/situations-matchs/:id/duplicate
 */
exports.duplicateSituationMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    
    const situationMatchDupliquee = await situationMatchService.duplicateSituationMatch(id, workspaceId);
    
    res.status(201).json(situationMatchDupliquee);
  } catch (error) {
    next(error);
  }
};
