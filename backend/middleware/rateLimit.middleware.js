const rateLimit = require('express-rate-limit');
const config = require('../config');

// Limiteur pour les méthodes d'écriture (POST, PUT, PATCH, DELETE)
const writeLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    error: 'Trop de requêtes d\'écriture, réessayez plus tard',
    code: 'TOO_MANY_REQUESTS_WRITE'
  }
});

// Limiteur pour les méthodes de lecture (GET)
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes max
  standardHeaders: true, // Headers RateLimit-*
  legacyHeaders: false,
  message: { 
    error: 'Trop de requêtes de lecture, réessayez dans quelques minutes',
    code: 'TOO_MANY_REQUESTS_READ'
  },
  // Exclure les health checks du rate limiting
  skip: (req) => {
    const path = req.path;
    return path === '/api/health' || path === '/api/health/db';
  }
});

/**
 * Middleware qui applique le rate limit uniquement sur les méthodes d'écriture
 * (POST, PUT, PATCH, DELETE)
 */
function writeMethodsRateLimit(req, res, next) {
  if (!config.rateLimit.enabled) return next();
  const method = req.method.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return writeLimiter(req, res, next);
  }
  return next();
}

/**
 * Middleware qui applique le rate limit uniquement sur les méthodes de lecture (GET)
 * Limite : 1000 requêtes / 15 minutes
 * Exclusions : /api/health, /api/health/db
 */
function readMethodsRateLimit(req, res, next) {
  if (!config.rateLimit.enabled) return next();
  const method = req.method.toUpperCase();
  if (method === 'GET') {
    return readLimiter(req, res, next);
  }
  return next();
}

module.exports = { 
  writeMethodsRateLimit,
  readMethodsRateLimit
};
