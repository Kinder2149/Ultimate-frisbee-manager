const lexiqueService = require('../services/business/lexique.service');

/**
 * Récupérer tous les termes du lexique (avec filtres optionnels)
 * @route GET /api/lexique
 * @query categorie (optionnel) — filtre par catégorie exacte
 * @query query (optionnel) — recherche texte dans le terme (contains, insensitive)
 */
exports.getAllLexiques = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { categorie, query } = req.query;

    const lexiques = await lexiqueService.getAllLexiques(workspaceId, { categorie, query });

    res.json(lexiques);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un terme du lexique par son ID
 * @route GET /api/lexique/:id
 */
exports.getLexiqueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const lexique = await lexiqueService.getLexiqueById(id, workspaceId);

    if (!lexique) {
      const error = new Error('Terme de lexique non trouvé');
      error.statusCode = 404;
      return next(error);
    }

    res.json(lexique);
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau terme de lexique
 * @route POST /api/lexique
 */
exports.createLexique = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const data = req.body;

    const nouveauLexique = await lexiqueService.createLexique(data, workspaceId);

    res.status(201).json(nouveauLexique);
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un terme de lexique
 * @route PUT /api/lexique/:id
 */
exports.updateLexique = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    const data = req.body;

    const lexiqueUpdated = await lexiqueService.updateLexique(id, data, workspaceId);

    res.json(lexiqueUpdated);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un terme de lexique
 * @route DELETE /api/lexique/:id
 */
exports.deleteLexique = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    await lexiqueService.deleteLexique(id, workspaceId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
