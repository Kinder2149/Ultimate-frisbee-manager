/**
 * Contrôleur pour le dashboard - statistiques et compteurs
 */
const { prisma } = require('../services/prisma');

/**
 * Récupère les statistiques pour le dashboard
 * @route GET /api/dashboard/stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Compteurs principaux (série ou petits blocs pour limiter le parallélisme)
    const exercicesCount = await prisma.exercice.count();
    const entrainementsCount = await prisma.entrainement.count();
    const echauffementsCount = await prisma.echauffement.count();
    const situationsCount = await prisma.situationMatch.count();

    let tagsCount = 0;
    let tagsDetails = {};
    try {
      tagsCount = await prisma.tag.count();
      const tagsByCategory = await prisma.tag.groupBy({
        by: ['category'],
        _count: {
          id: true
        }
      });
      tagsDetails = tagsByCategory.reduce((acc, item) => {
        acc[item.category] = item._count.id;
        return acc;
      }, {});
    } catch (tagsError) {
      // En cas d'erreur sur les tags, on renvoie quand même les stats principales
      console.error('[Dashboard] Error while loading tag stats:', tagsError);
    }

    // 2. Activité récente (derniers 7 jours) – bloc séparé, best-effort
    let recentActivity = null;
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentExercices = await prisma.exercice.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      });
      const recentEntrainements = await prisma.entrainement.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      });
      const recentEchauffements = await prisma.echauffement.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      });
      const recentSituations = await prisma.situationMatch.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      });

      recentActivity = recentExercices + recentEntrainements + recentEchauffements + recentSituations;
    } catch (recentError) {
      console.error('[Dashboard] Error while loading recent activity stats:', recentError);
      recentActivity = null;
    }

    const totalElements = exercicesCount + entrainementsCount + echauffementsCount + situationsCount;

    res.json({
      exercicesCount,
      entrainementsCount,
      echauffementsCount,
      situationsCount,
      tagsCount,
      tagsDetails,
      totalElements,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};
