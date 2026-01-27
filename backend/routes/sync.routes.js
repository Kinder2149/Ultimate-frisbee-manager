const express = require('express');
const router = express.Router();
const { prisma } = require('../services/prisma');
const { authenticateToken } = require('../middleware/auth.middleware');
const { workspaceGuard } = require('../middleware/workspace.middleware');

/**
 * GET /api/sync/versions
 * Retourne les timestamps de dernière modification par type de données
 * Utilisé pour la synchronisation périodique côté client
 */
router.get('/versions', authenticateToken, workspaceGuard, async (req, res, next) => {
  try {
    const { workspaceId } = req;

    // Récupérer le timestamp le plus récent pour chaque type de données
    const [exercices, entrainements, tags, echauffements, situations] = await Promise.all([
      prisma.exercice.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.entrainement.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.tag.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.echauffement.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.situationMatch.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      })
    ]);

    res.json({
      exercices: exercices?.updatedAt?.toISOString() || null,
      entrainements: entrainements?.updatedAt?.toISOString() || null,
      tags: tags?.updatedAt?.toISOString() || null,
      echauffements: echauffements?.updatedAt?.toISOString() || null,
      situations: situations?.updatedAt?.toISOString() || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Sync] Error fetching versions:', error);
    next(error);
  }
});

/**
 * GET /api/sync/health
 * Endpoint de santé pour vérifier que le service de sync fonctionne
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
