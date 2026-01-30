const entrainementService = require('../services/business/entrainement.service');

exports.getAllEntrainements = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { page, limit } = req.query;

    const result = await entrainementService.getAllEntrainements(workspaceId, { page, limit });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getEntrainementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const entrainement = await entrainementService.getEntrainementById(id, workspaceId);

    if (!entrainement) {
      const error = new Error('Entraînement non trouvé');
      error.statusCode = 404;
      return next(error);
    }

    res.json(entrainement);
  } catch (error) {
    next(error);
  }
};

exports.createEntrainement = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const data = req.body;
    const file = req.file;

    const nouvelEntrainement = await entrainementService.createEntrainement(data, workspaceId, file);

    res.status(201).json(nouvelEntrainement);
  } catch (error) {
    if (error.code === 'INVALID_TAGS' || error.code === 'INVALID_ECHAUFFEMENT' || 
        error.code === 'INVALID_SITUATION' || error.code === 'INVALID_EXERCICE') {
      return res.status(error.statusCode || 400).json({
        error: error.message,
        code: error.code,
        invalidIds: error.invalidIds
      });
    }
    console.error('[createEntrainement] erreur', error);
    next(error);
  }
};

exports.updateEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    const data = req.body;
    const file = req.file;

    const entrainementMisAJour = await entrainementService.updateEntrainement(id, data, workspaceId, file);

    res.json(entrainementMisAJour);
  } catch (error) {
    if (error.code === 'INVALID_TAGS' || error.code === 'INVALID_ECHAUFFEMENT' || 
        error.code === 'INVALID_SITUATION' || error.code === 'INVALID_EXERCICE') {
      return res.status(error.statusCode || 400).json({
        error: error.message,
        code: error.code,
        invalidIds: error.invalidIds
      });
    }
    next(error);
  }
};

exports.deleteEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    await entrainementService.deleteEntrainement(id, workspaceId);

    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      return next(error);
    }
    next(error);
  }
};

exports.duplicateEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const entrainementDuplique = await entrainementService.duplicateEntrainement(id, workspaceId);

    res.status(201).json(entrainementDuplique);
  } catch (error) {
    if (error.statusCode === 404) {
      return next(error);
    }
    next(error);
  }
};
