const { prisma } = require('../prisma');
const { validateTagsInWorkspace } = require('../../utils/workspace-validation');

/**
 * Service métier pour la gestion des situations et matchs
 * Contient toute la logique métier liée aux situations/matchs
 */

/**
 * Récupérer toutes les situations/matchs avec pagination
 * @param {string} workspaceId - ID du workspace
 * @param {Object} pagination - Options de pagination { page, limit }
 * @returns {Promise<Object>} Résultat paginé { data, total, page, limit, totalPages }
 */
async function getAllSituationsMatchs(workspaceId, pagination = {}) {
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 50;
  const skip = (page - 1) * limit;

  // Compter le total de situations/matchs
  const total = await prisma.situationMatch.count({
    where: { workspaceId }
  });

  // Récupérer les situations/matchs paginés
  const situationsMatchs = await prisma.situationMatch.findMany({
    where: { workspaceId },
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  return {
    data: situationsMatchs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Récupérer une situation/match par son ID
 * @param {string} id - ID de la situation/match
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<Object|null>} Situation/match trouvée ou null
 */
async function getSituationMatchById(id, workspaceId) {
  const situationMatch = await prisma.situationMatch.findFirst({
    where: { id, workspaceId },
    include: { tags: true }
  });

  return situationMatch;
}

/**
 * Créer une nouvelle situation/match
 * @param {Object} data - Données de la situation/match { nom, type, description, temps, tagIds, imageUrl }
 * @param {string} workspaceId - ID du workspace
 * @param {Object} file - Fichier uploadé (optionnel)
 * @returns {Promise<Object>} Situation/match créée
 * @throws {Error} Si les tags n'appartiennent pas au workspace
 */
async function createSituationMatch(data, workspaceId, file = null) {
  const { nom, type, description, temps, tagIds, imageUrl } = data;

  // SÉCURITÉ: Valider que tous les tags appartiennent au workspace
  if (tagIds && tagIds.length > 0) {
    const tagValidation = await validateTagsInWorkspace(tagIds, workspaceId);
    if (!tagValidation.valid) {
      const error = new Error('Certains tags n\'appartiennent pas à ce workspace');
      error.statusCode = 400;
      error.code = 'INVALID_TAGS';
      error.invalidIds = tagValidation.invalidIds;
      throw error;
    }
  }

  const nouvelleSituationMatch = await prisma.situationMatch.create({
    data: {
      nom,
      type,
      description,
      temps,
      imageUrl: file ? file.cloudinaryUrl : (imageUrl || null),
      workspaceId,
      tags: { connect: (tagIds || []).map(id => ({ id })) }
    },
    include: { tags: true }
  });

  return nouvelleSituationMatch;
}

/**
 * Mettre à jour une situation/match
 * @param {string} id - ID de la situation/match
 * @param {Object} data - Données à mettre à jour { nom, type, description, temps, tagIds, imageUrl }
 * @param {string} workspaceId - ID du workspace
 * @param {Object} file - Fichier uploadé (optionnel)
 * @returns {Promise<Object>} Situation/match mise à jour
 * @throws {Error} Si les tags n'appartiennent pas au workspace
 */
async function updateSituationMatch(id, data, workspaceId, file = null) {
  const { nom, type, description, temps, tagIds, imageUrl } = data;

  // SÉCURITÉ: Valider que tous les tags appartiennent au workspace
  if (tagIds && tagIds.length > 0) {
    const tagValidation = await validateTagsInWorkspace(tagIds, workspaceId);
    if (!tagValidation.valid) {
      const error = new Error('Certains tags n\'appartiennent pas à ce workspace');
      error.statusCode = 400;
      error.code = 'INVALID_TAGS';
      error.invalidIds = tagValidation.invalidIds;
      throw error;
    }
  }

  const updateData = {
    nom,
    type,
    description,
    temps,
    imageUrl: file
      ? file.cloudinaryUrl
      : (imageUrl !== undefined
          ? (imageUrl === '' ? null : imageUrl)
          : undefined),
    tags: { set: (tagIds || []).map(id => ({ id })) }
  };

  const situationMatchMiseAJour = await prisma.situationMatch.update({
    where: { id, workspaceId },
    data: updateData,
    include: { tags: true }
  });

  return situationMatchMiseAJour;
}

/**
 * Supprimer une situation/match
 * @param {string} id - ID de la situation/match
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<void>}
 * @throws {Error} Si la situation/match n'existe pas (404)
 */
async function deleteSituationMatch(id, workspaceId) {
  const situationMatch = await prisma.situationMatch.findFirst({ where: { id, workspaceId } });

  if (!situationMatch) {
    const error = new Error('Situation/match non trouvée');
    error.statusCode = 404;
    throw error;
  }

  await prisma.situationMatch.delete({ where: { id, workspaceId } });
}

/**
 * Dupliquer une situation/match
 * @param {string} id - ID de la situation/match à dupliquer
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<Object>} Situation/match dupliquée
 * @throws {Error} Si la situation/match n'existe pas (404)
 */
async function duplicateSituationMatch(id, workspaceId) {
  const situationMatchOriginale = await prisma.situationMatch.findFirst({
    where: { id, workspaceId },
    include: { tags: true }
  });

  if (!situationMatchOriginale) {
    const error = new Error('Situation/match non trouvée');
    error.statusCode = 404;
    throw error;
  }

  const situationMatchDupliquee = await prisma.situationMatch.create({
    data: {
      nom: situationMatchOriginale.nom ? `${situationMatchOriginale.nom} (Copie)` : `Copie de ${situationMatchOriginale.type}`,
      type: situationMatchOriginale.type,
      description: situationMatchOriginale.description,
      temps: situationMatchOriginale.temps,
      imageUrl: situationMatchOriginale.imageUrl,
      workspaceId: situationMatchOriginale.workspaceId,
      tags: { connect: situationMatchOriginale.tags.map(tag => ({ id: tag.id })) }
    },
    include: { tags: true }
  });

  return situationMatchDupliquee;
}

module.exports = {
  getAllSituationsMatchs,
  getSituationMatchById,
  createSituationMatch,
  updateSituationMatch,
  deleteSituationMatch,
  duplicateSituationMatch
};
