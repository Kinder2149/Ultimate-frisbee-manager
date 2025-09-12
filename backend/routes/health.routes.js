const express = require('express');
const router = express.Router();
const { prisma } = require('../services/prisma');

// GET /api/health
// Public: indique l'état du serveur et la connectivité DB
router.get('/', async (req, res) => {
  const startedAt = process.hrtime.bigint();
  try {
    // Test rapide DB (léger et compatible Prisma)
    await prisma.$queryRaw`SELECT 1`;
    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
    return res.status(200).json({
      status: 'ok',
      db: true,
      uptime: process.uptime(),
      responseTimeMs: durationMs
    });
  } catch (err) {
    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
    return res.status(503).json({
      status: 'degraded',
      db: false,
      uptime: process.uptime(),
      responseTimeMs: durationMs,
      error: 'database_unreachable'
    });
  }
});

module.exports = router;
