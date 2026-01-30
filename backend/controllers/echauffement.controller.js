const echauffementService = require('../services/business/echauffement.service');

/**
 * Récupère tous les échauffements avec leurs blocs (avec pagination)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @query page - Numéro de page (défaut: 1)
 * @query limit - Nombre d'éléments par page (défaut: 50)
 */
exports.getAllEchauffements = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { page, limit } = req.query;

    const result = await echauffementService.getAllEchauffements(workspaceId, { page, limit });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un échauffement spécifique par son ID avec ses blocs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getEchauffementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    
    const echauffement = await echauffementService.getEchauffementById(id, workspaceId);
    
    if (!echauffement) {
      const error = new Error('Échauffement non trouvé');
      error.statusCode = 404;
      return next(error);
    }
    
    res.json(echauffement);
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un nouvel échauffement avec ses blocs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.createEchauffement = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const data = req.body;
    const file = req.file;
    
    const nouvelEchauffement = await echauffementService.createEchauffement(data, workspaceId, file);
    
    res.status(201).json(nouvelEchauffement);
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour un échauffement existant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateEchauffement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    const data = req.body;
    const file = req.file;

    const echauffementMisAJour = await echauffementService.updateEchauffement(id, data, workspaceId, file);

    res.json(echauffementMisAJour);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un échauffement
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteEchauffement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    await echauffementService.deleteEchauffement(id, workspaceId);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Duplique un échauffement existant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.duplicateEchauffement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    
    const echauffementDuplique = await echauffementService.duplicateEchauffement(id, workspaceId);
    
    res.status(201).json(echauffementDuplique);
  } catch (error) {
    next(error);
  }
};
