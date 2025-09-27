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
    // Compter tous les éléments en parallèle
    const [
      exercicesCount,
      entrainementsCount,
      echauffementsCount,
      situationsCount,
      tagsCount,
      tagsByCategory
    ] = await Promise.all([
      prisma.exercice.count(),
      prisma.entrainement.count(),
      prisma.echauffement.count(),
      prisma.situationMatch.count(),
      prisma.tag.count(),
      prisma.tag.groupBy({
        by: ['category'],
        _count: {
          id: true
        }
      })
    ]);

    // Calculer les ajouts récents (derniers 7 jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentExercices,
      recentEntrainements,
      recentEchauffements,
      recentSituations
    ] = await Promise.all([
      prisma.exercice.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.entrainement.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.echauffement.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.situationMatch.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      })
    ]);

    const recentActivity = recentExercices + recentEntrainements + recentEchauffements + recentSituations;
    const totalElements = exercicesCount + entrainementsCount + echauffementsCount + situationsCount;

    // Organiser les tags par catégorie
    const tagsDetails = tagsByCategory.reduce((acc, item) => {
      acc[item.category] = item._count.id;
      return acc;
    }, {});

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
