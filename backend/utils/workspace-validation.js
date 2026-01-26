const { prisma } = require('../services/prisma');

/**
 * Vérifie que tous les tags appartiennent au workspace spécifié
 * @param {string[]} tagIds - IDs des tags à vérifier
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<{valid: boolean, invalidIds: string[]}>}
 */
async function validateTagsInWorkspace(tagIds, workspaceId) {
  if (!tagIds || tagIds.length === 0) {
    return { valid: true, invalidIds: [] };
  }

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: tagIds },
      workspaceId
    },
    select: { id: true }
  });

  const foundIds = tags.map(t => t.id);
  const invalidIds = tagIds.filter(id => !foundIds.includes(id));

  return {
    valid: invalidIds.length === 0,
    invalidIds
  };
}

/**
 * Vérifie qu'un exercice appartient au workspace
 * @param {string} exerciceId - ID de l'exercice
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<boolean>}
 */
async function validateExerciceInWorkspace(exerciceId, workspaceId) {
  if (!exerciceId) return true;
  
  const exercice = await prisma.exercice.findFirst({
    where: { id: exerciceId, workspaceId }
  });
  return !!exercice;
}

/**
 * Vérifie qu'une situation de match appartient au workspace
 * @param {string} situationId - ID de la situation
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<boolean>}
 */
async function validateSituationMatchInWorkspace(situationId, workspaceId) {
  if (!situationId) return true;
  
  const situation = await prisma.situationMatch.findFirst({
    where: { id: situationId, workspaceId }
  });
  return !!situation;
}

/**
 * Vérifie qu'un échauffement appartient au workspace
 * @param {string} echauffementId - ID de l'échauffement
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<boolean>}
 */
async function validateEchauffementInWorkspace(echauffementId, workspaceId) {
  if (!echauffementId) return true;
  
  const echauffement = await prisma.echauffement.findFirst({
    where: { id: echauffementId, workspaceId }
  });
  return !!echauffement;
}

module.exports = {
  validateTagsInWorkspace,
  validateExerciceInWorkspace,
  validateSituationMatchInWorkspace,
  validateEchauffementInWorkspace
};
