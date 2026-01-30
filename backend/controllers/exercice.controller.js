const exerciceService = require('../services/business/exercice.service');

/**
 * Récupérer tous les exercices avec leurs tags (avec pagination)
 * @route GET /api/exercices
 * @query page - Numéro de page (défaut: 1)
 * @query limit - Nombre d'éléments par page (défaut: 50)
 */
exports.getAllExercices = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { page, limit } = req.query;

    const result = await exerciceService.getAllExercices(workspaceId, { page, limit });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un exercice par son ID
 * @route GET /api/exercices/:id
 */
exports.getExerciceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    
    const exercice = await exerciceService.getExerciceById(id, workspaceId);

    if (!exercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    res.json(exercice);
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouvel exercice avec ses tags
 * @route POST /api/exercices
 */
exports.createExercice = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const data = req.body;
    const file = req.file;

    const newExercice = await exerciceService.createExercice(data, workspaceId, file);

    res.status(201).json(newExercice);
  } catch (error) {
    if (error.code === 'INVALID_TAGS') {
      return res.status(error.statusCode || 400).json({
        error: error.message,
        code: error.code,
        invalidIds: error.invalidIds
      });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    console.error('--- Erreur détaillée dans createExercice ---', error);
    next(error);
  }
};

/**
 * Mettre à jour un exercice
 * @route PUT /api/exercices/:id
 */
exports.updateExercice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    const data = req.body;
    const file = req.file;

    const exerciceUpdated = await exerciceService.updateExercice(id, data, workspaceId, file);

    res.json(exerciceUpdated);
  } catch (error) {
    if (error.code === 'INVALID_TAGS') {
      return res.status(error.statusCode || 400).json({
        error: error.message,
        code: error.code,
        invalidIds: error.invalidIds
      });
    }
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(`--- ERREUR FATALE dans updateExercice (ID: ${req.params.id}) ---`, error);
    next(error);
  }
};

/**
 * Dupliquer un exercice
 * @route POST /api/exercices/:id/duplicate
 */
exports.duplicateExercice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const duplicatedExercice = await exerciceService.duplicateExercice(id, workspaceId);

    res.status(201).json(duplicatedExercice);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    console.error(`--- Erreur détaillée dans duplicateExercice (ID original: ${req.params.id}) ---`, error);
    next(error);
  }
};

/**
 * Supprimer un exercice
 * @route DELETE /api/exercices/:id
 */
exports.deleteExercice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    await exerciceService.deleteExercice(id, workspaceId);

    res.status(204).send();
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};
