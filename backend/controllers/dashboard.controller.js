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
    let degraded = false;

    // 1. Compteurs principaux (exécuter en série et tolérer les erreurs)
    let exercicesCount = 0;
    try { exercicesCount = await prisma.exercice.count(); } catch (e) { degraded = true; exercicesCount = 0; }

    let entrainementsCount = 0;
    try { entrainementsCount = await prisma.entrainement.count(); } catch (e) { degraded = true; entrainementsCount = 0; }

    let echauffementsCount = 0;
    try { echauffementsCount = await prisma.echauffement.count(); } catch (e) { degraded = true; echauffementsCount = 0; }

    let situationsCount = 0;
    try { situationsCount = await prisma.situationMatch.count(); } catch (e) { degraded = true; situationsCount = 0; }

    // 1bis. Tags (best-effort)
    let tagsCount = 0;
    let tagsDetails = {};
    try {
      tagsCount = await prisma.tag.count();
      const tagsByCategory = await prisma.tag.groupBy({ by: ['category'], _count: { id: true } });
      tagsDetails = tagsByCategory.reduce((acc, item) => { acc[item.category] = item._count.id; return acc; }, {});
    } catch (tagsError) {
      degraded = true;
      console.error('[Dashboard] Error while loading tag stats:', tagsError);
    }

    // 2. Activité récente (7 jours) – best-effort
    let recentActivity = null;
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentExercices = await prisma.exercice.count({ where: { createdAt: { gte: sevenDaysAgo } } });
      const recentEntrainements = await prisma.entrainement.count({ where: { createdAt: { gte: sevenDaysAgo } } });
      const recentEchauffements = await prisma.echauffement.count({ where: { createdAt: { gte: sevenDaysAgo } } });
      const recentSituations = await prisma.situationMatch.count({ where: { createdAt: { gte: sevenDaysAgo } } });
      recentActivity = recentExercices + recentEntrainements + recentEchauffements + recentSituations;
    } catch (recentError) {
      degraded = true;
      console.error('[Dashboard] Error while loading recent activity stats:', recentError);
      recentActivity = null;
    }

    const totalElements = exercicesCount + entrainementsCount + echauffementsCount + situationsCount;

    res.json({
      degraded,
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
