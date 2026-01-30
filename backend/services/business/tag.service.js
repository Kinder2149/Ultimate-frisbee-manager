const { TAG_CATEGORIES } = require('@ufm/shared/constants/tag-categories');
const { prisma } = require('../prisma');

/**
 * Service métier pour la gestion des tags
 * Contient toute la logique métier liée aux tags
 */

/**
 * Récupérer tous les tags avec filtres optionnels
 * @param {string} workspaceId - ID du workspace
 * @param {Object} filters - Filtres optionnels { category, query }
 * @returns {Promise<Array>} Liste des tags
 */
async function getAllTags(workspaceId, filters = {}) {
  const { category, query } = filters;

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

  return tags;
}

/**
 * Récupérer un tag par son ID
 * @param {string} id - ID du tag
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<Object|null>} Tag trouvé ou null
 */
async function getTagById(id, workspaceId) {
  const tag = await prisma.tag.findFirst({
    where: { id, workspaceId }
  });

  return tag;
}

/**
 * Créer un nouveau tag
 * @param {Object} data - Données du tag { label, category, color, level }
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<Object>} Tag créé
 * @throws {Error} Si le tag existe déjà (code P2002)
 */
async function createTag(data, workspaceId) {
  const { label, category, color, level } = data;

  try {
    const nouveauTag = await prisma.tag.create({
      data: {
        label,
        category,
        color: color || null,
        level: level !== undefined ? level : null,
        workspaceId
      }
    });

    return nouveauTag;
  } catch (error) {
    if (error.code === 'P2002') {
      const customError = new Error('Ce tag existe déjà dans cette catégorie.');
      customError.statusCode = 409;
      throw customError;
    }
    throw error;
  }
}

/**
 * Mettre à jour un tag
 * @param {string} id - ID du tag
 * @param {Object} data - Données à mettre à jour { label, color, level }
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<Object>} Tag mis à jour
 * @throws {Error} Si le tag n'existe pas (404) ou si le libellé existe déjà (409)
 */
async function updateTag(id, data, workspaceId) {
  const { label, color, level } = data;

  // Vérifier que le tag existe
  const tag = await prisma.tag.findFirst({ where: { id, workspaceId } });
  if (!tag) {
    const error = new Error('Tag non trouvé');
    error.statusCode = 404;
    throw error;
  }

  // Préparer les données de mise à jour
  // La validation de `level` est gérée par Zod, mais on s'assure de ne l'appliquer que si la catégorie est correcte
  const updateData = { label, color };
  if (tag.category === 'niveau' && level !== undefined) {
    updateData.level = level;
  }

  try {
    const tagUpdated = await prisma.tag.update({
      where: { id, workspaceId },
      data: updateData
    });

    return tagUpdated;
  } catch (error) {
    if (error.code === 'P2002') {
      const customError = new Error('Ce libellé de tag existe déjà dans cette catégorie.');
      customError.statusCode = 409;
      throw customError;
    }
    throw error;
  }
}

/**
 * Récupérer tous les tags groupés par catégorie
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<Object>} Tags groupés par catégorie
 */
async function getGroupedTags(workspaceId) {
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
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[TAGS] Categories in DB:', presentCats);
      // eslint-disable-next-line no-console
      console.log('[TAGS] Counts per category:', counts);
      // eslint-disable-next-line no-console
      console.log('[TAGS] Expected categories (TAG_CATEGORIES):', TAG_CATEGORIES);
    }
  } catch {}

  // Fusionner la base et les catégories remplies pour garantir la présence de toutes les clés
  return { ...base, ...filled };
}

/**
 * Supprimer un tag
 * @param {string} id - ID du tag
 * @param {string} workspaceId - ID du workspace
 * @param {boolean} force - Forcer la suppression même si utilisé
 * @returns {Promise<void>}
 * @throws {Error} Si le tag n'existe pas (404) ou est utilisé sans force (409)
 */
async function deleteTag(id, workspaceId, force = false) {
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
    throw error;
  }

  const totalUsages = tag._count.exercices + tag._count.entrainements + tag._count.situationsMatchs;

  if (totalUsages > 0 && !force) {
    const error = new Error('Ce tag est utilisé. Forcez la suppression pour le détacher de toutes les entités.');
    error.statusCode = 409;
    error.details = {
      exercicesCount: tag._count.exercices,
      entrainementsCount: tag._count.entrainements,
      situationsCount: tag._count.situationsMatchs
    };
    throw error;
  }

  // La suppression (avec ou sans force) est gérée par une transaction pour assurer l'atomicité
  await prisma.$transaction(async (tx) => {
    if (totalUsages > 0 && force) {
      // Déconnexion explicite des relations
      await tx.tag.update({
        where: { id },
        data: { exercices: { set: [] }, entrainements: { set: [] }, situationsMatchs: { set: [] } }
      });
    }
    await tx.tag.delete({ where: { id } });
  });
}

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  getGroupedTags,
  deleteTag
};
