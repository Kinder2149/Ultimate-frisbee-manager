const { prisma } = require('../prisma');

/**
 * Service métier pour le dashboard
 * Contient la logique de calcul des statistiques
 */

/**
 * Récupérer les statistiques du dashboard pour un workspace
 */
async function getDashboardStats(workspaceId) {
  let degraded = false;
  const whereByWorkspace = workspaceId ? { workspaceId } : {};

  // Compteurs principaux (tolérer les erreurs)
  let exercicesCount = 0;
  try {
    exercicesCount = await prisma.exercice.count({ where: whereByWorkspace });
  } catch (e) {
    degraded = true;
    exercicesCount = 0;
  }

  let entrainementsCount = 0;
  try {
    entrainementsCount = await prisma.entrainement.count({ where: whereByWorkspace });
  } catch (e) {
    degraded = true;
    entrainementsCount = 0;
  }

  let echauffementsCount = 0;
  try {
    echauffementsCount = await prisma.echauffement.count({ where: whereByWorkspace });
  } catch (e) {
    degraded = true;
    echauffementsCount = 0;
  }

  let situationsCount = 0;
  try {
    situationsCount = await prisma.situationMatch.count({ where: whereByWorkspace });
  } catch (e) {
    degraded = true;
    situationsCount = 0;
  }

  // Tags
  let tagsCount = 0;
  let tagsDetails = {};
  try {
    tagsCount = await prisma.tag.count({ where: whereByWorkspace });
    const tagsByCategory = await prisma.tag.groupBy({
      by: ['category'],
      where: whereByWorkspace,
      _count: { id: true },
    });
    tagsDetails = tagsByCategory.reduce((acc, item) => {
      acc[item.category] = item._count.id;
      return acc;
    }, {});
  } catch (tagsError) {
    degraded = true;
    console.error('[Dashboard] Error while loading tag stats:', tagsError);
  }

  // Activité récente (7 jours)
  let recentActivity = null;
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentWhere = {
      ...whereByWorkspace,
      createdAt: { gte: sevenDaysAgo },
    };

    const recentExercices = await prisma.exercice.count({ where: recentWhere });
    const recentEntrainements = await prisma.entrainement.count({ where: recentWhere });
    const recentEchauffements = await prisma.echauffement.count({ where: recentWhere });
    const recentSituations = await prisma.situationMatch.count({ where: recentWhere });
    recentActivity = recentExercices + recentEntrainements + recentEchauffements + recentSituations;
  } catch (recentError) {
    degraded = true;
    console.error('[Dashboard] Error while loading recent activity stats:', recentError);
    recentActivity = null;
  }

  const totalElements = exercicesCount + entrainementsCount + echauffementsCount + situationsCount;

  return {
    degraded,
    exercicesCount,
    entrainementsCount,
    echauffementsCount,
    situationsCount,
    tagsCount,
    tagsDetails,
    totalElements,
    recentActivity,
  };
}

module.exports = {
  getDashboardStats
};
