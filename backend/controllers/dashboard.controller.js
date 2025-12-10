/**
 * Contrôleur pour le dashboard - statistiques et compteurs
 */
const { prisma } = require('../services/prisma');

/**
 * Récupère les statistiques pour le dashboard, **scopées au workspace courant**.
 * @route GET /api/dashboard/stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    let degraded = false;

    const whereByWorkspace = workspaceId ? { workspaceId } : {};

    // 1. Compteurs principaux (exécuter en série et tolérer les erreurs)
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

    // 1bis. Tags (best-effort)
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

    // 2. Activité récente (7 jours) – best-effort, par workspace
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

    res.json({
      degraded,
      exercicesCount,
      entrainementsCount,
      echauffementsCount,
      situationsCount,
      tagsCount,
      tagsDetails,
      totalElements,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};
