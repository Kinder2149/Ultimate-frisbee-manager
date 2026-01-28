const express = require('express');
const router = express.Router();
const { prisma } = require('../services/prisma');

// GET /api/health
// Public: indique l'état du serveur et, optionnellement, la connectivité DB
router.get('/', async (req, res) => {
  const startedAt = process.hrtime.bigint();
  const now = new Date().toISOString();
  const uptimeSeconds = Math.round(process.uptime());
  const env = process.env.NODE_ENV || 'development';
  const version = process.env.APP_VERSION || null;
  const coldStart = uptimeSeconds < 60; // heuristique simple: moins d'une minute de vie

  // ENV par défaut puis override par query param
  const envWantsDb = String(process.env.HEALTH_CHECK_DB || 'true').toLowerCase() !== 'false';
  const q = String(req.query.db || '').toLowerCase();
  const queryOverride = q === 'true' ? true : q === 'false' ? false : undefined;
  const shouldCheckDb = queryOverride !== undefined ? queryOverride : envWantsDb;

  if (!shouldCheckDb) {
    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
    return res.status(200).json({
      status: 'ok',
      timestamp: now,
      db: null,
      uptime: process.uptime(),
      uptimeSeconds,
      env,
      version,
      coldStart,
      responseTimeMs: durationMs
    });
  }

  try {
    // Test rapide DB (léger et compatible Prisma)
    await prisma.$queryRaw`SELECT 1`;
    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
    return res.status(200).json({
      status: 'ok',
      timestamp: now,
      db: true,
      uptime: process.uptime(),
      uptimeSeconds,
      env,
      version,
      coldStart,
      responseTimeMs: durationMs
    });
  } catch (err) {
    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
    return res.status(503).json({
      status: 'degraded',
      timestamp: now,
      db: false,
      uptime: process.uptime(),
      uptimeSeconds,
      env,
      version,
      coldStart,
      responseTimeMs: durationMs,
      error: 'database_unreachable'
    });
  }
});

// GET /api/health/auth
// Public: diagnostic non sensible pour vérifier si le client envoie bien Authorization: Bearer ...
router.get('/auth', (req, res) => {
  const authHeader = req.headers['authorization'];
  const hasAuthorizationHeader = typeof authHeader === 'string' && authHeader.trim().length > 0;
  const isBearer = hasAuthorizationHeader && authHeader.toLowerCase().startsWith('bearer ');
  const tokenLength = isBearer ? authHeader.slice('bearer '.length).trim().length : 0;

  return res.status(200).json({
    hasAuthorizationHeader,
    isBearer,
    tokenLength
  });
});

module.exports = router;
