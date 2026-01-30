/**
 * Contrôleur pour le dashboard - statistiques et compteurs
 */
const dashboardService = require('../services/business/dashboard.service');

/**
 * Récupère les statistiques pour le dashboard, **scopées au workspace courant**.
 * @route GET /api/dashboard/stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;

    const stats = await dashboardService.getDashboardStats(workspaceId);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
