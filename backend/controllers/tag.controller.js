const { TAG_CATEGORIES } = require('@ufm/shared/constants/tag-categories');
const { prisma } = require('../services/prisma');

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

    const where = { workspaceId };
    if (category) {
      where.category = String(category);
    }
    if (query) {
      where.label = { contains: String(query), mode: 'insensitive' };
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { label: 'asc' }
      ]
    });
    
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
    
    const tag = await prisma.tag.findFirst({
      where: { id, workspaceId }
    });
    
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
    const { label, category, color, level } = req.body;

    const nouveauTag = await prisma.tag.create({
      data: {
        label,
        category,
        color: color || null,
        level: level !== undefined ? level : null,
        workspaceId
      }
    });
    
    res.status(201).json(nouveauTag);
  } catch (error) {
    if (error.code === 'P2002') {
      const customError = new Error('Ce tag existe déjà dans cette catégorie.');
      customError.statusCode = 409;
      return next(customError);
    }
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
    const { label, color, level } = req.body;

    const tag = await prisma.tag.findFirst({ where: { id, workspaceId } });
    if (!tag) {
      const error = new Error('Tag non trouvé');
      error.statusCode = 404;
      return next(error);
    }

    // La validation de `level` est gérée par Zod, mais on s'assure de ne l'appliquer que si la catégorie est correcte.
    const updateData = { label, color };
    if (tag.category === 'niveau' && level !== undefined) {
      updateData.level = level;
    }

    const tagUpdated = await prisma.tag.update({
      where: { id, workspaceId },
      data: updateData
    });
    
    res.json(tagUpdated);
  } catch (error) {
    if (error.code === 'P2002') {
      const customError = new Error('Ce libellé de tag existe déjà dans cette catégorie.');
      customError.statusCode = 409;
      return next(customError);
    }
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
    const tags = await prisma.tag.findMany({
      where: { workspaceId },
      orderBy: [
        { category: 'asc' },
        { label: 'asc' }
      ]
    });

    // Construire une base contenant toutes les catégories (même vides)
    const base = (TAG_CATEGORIES || []).reduce((acc, cat) => {
      acc[cat] = [];
      return acc;
    }, {});

    // Répartir les tags par catégorie
    const filled = tags.reduce((acc, tag) => {
      const { category } = tag;
      if (!acc[category]) acc[category] = [];
      acc[category].push(tag);
      return acc;
    }, {});

    // Logs de diagnostic: catégories présentes et comptages
    try {
      const presentCats = Object.keys(filled);
      const counts = presentCats.reduce((m, k) => { m[k] = filled[k].length; return m; }, {});
      // eslint-disable-next-line no-console
      console.log('[TAGS] Categories in DB:', presentCats);
      // eslint-disable-next-line no-console
      console.log('[TAGS] Counts per category:', counts);
      // eslint-disable-next-line no-console
      console.log('[TAGS] Expected categories (TAG_CATEGORIES):', TAG_CATEGORIES);
    } catch {}

    // Fusionner la base et les catégories remplies pour garantir la présence de toutes les clés
    res.json({ ...base, ...filled });
  } catch (error) {
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const force = String(req.query.force || '').toLowerCase() === 'true';
    const workspaceId = req.workspaceId;

    const tag = await prisma.tag.findUnique({
      where: { id, workspaceId },
      select: {
        _count: {
          select: { exercices: true, entrainements: true, situationsMatchs: true }
        }
      }
    });

    if (!tag) {
      const error = new Error('Tag non trouvé');
      error.statusCode = 404;
      return next(error);
    }

    const totalUsages = tag._count.exercices + tag._count.entrainements + tag._count.situationsMatchs;

    if (totalUsages > 0 && !force) {
      const error = new Error('Ce tag est utilisé. Forcez la suppression pour le détacher de toutes les entités.');
      error.statusCode = 409;
      error.details = { // Fournir plus de contexte à l'API consommatrice
        exercicesCount: tag._count.exercices,
        entrainementsCount: tag._count.entrainements,
        situationsCount: tag._count.situationsMatchs
      };
      return next(error);
    }

    // La suppression (avec ou sans force) est gérée par une transaction pour assurer l'atomicité
    await prisma.$transaction(async (tx) => {
      if (totalUsages > 0 && force) {
        // Déconnexion explicite non nécessaire avec Prisma, la suppression s'en charge si le schéma est bien fait.
        // Cependant, pour être explicite et sûr, on peut le faire.
        await tx.tag.update({
          where: { id },
          data: { exercices: { set: [] }, entrainements: { set: [] }, situationsMatchs: { set: [] } }
        });
      }
      await tx.tag.delete({ where: { id } });
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};