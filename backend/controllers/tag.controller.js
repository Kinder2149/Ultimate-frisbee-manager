const tagService = require('../services/business/tag.service');

/**
 * Récupérer tous les tags (avec filtres optionnels)
 * @route GET /api/tags
 * @query category (optionnel) — filtre par catégorie exacte
 * @query query (optionnel) — recherche texte dans le label (contains, insensitive)
 */
exports.getAllTags = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { category, query } = req.query;

    const tags = await tagService.getAllTags(workspaceId, { category, query });
    
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un tag par son ID
 * @route GET /api/tags/:id
 */
exports.getTagById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    
    const tag = await tagService.getTagById(id, workspaceId);
    
    if (!tag) {
      const error = new Error('Tag non trouvé');
      error.statusCode = 404;
      return next(error);
    }
    
    res.json(tag);
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau tag
 * @route POST /api/tags
 */
exports.createTag = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const data = req.body;

    const nouveauTag = await tagService.createTag(data, workspaceId);
    
    res.status(201).json(nouveauTag);
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un tag
 * @route PUT /api/tags/:id
 */
exports.updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    const data = req.body;

    const tagUpdated = await tagService.updateTag(id, data, workspaceId);
    
    res.json(tagUpdated);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les tags groupés par catégorie
 * @route GET /api/tags/grouped
 */
exports.getGroupedTags = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    
    const groupedTags = await tagService.getGroupedTags(workspaceId);
    
    res.json(groupedTags);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un tag
 * @route DELETE /api/tags/:id
 * @query force (optionnel) — forcer la suppression même si utilisé
 */
exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const force = String(req.query.force || '').toLowerCase() === 'true';
    const workspaceId = req.workspaceId;

    await tagService.deleteTag(id, workspaceId, force);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};