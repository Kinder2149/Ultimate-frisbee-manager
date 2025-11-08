const rateLimit = require('express-rate-limit');
const config = require('../config');

// Limiteur générique basé sur la config
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_requests' }
});

/**
 * Middleware qui applique le rate limit uniquement sur les méthodes d'écriture
 * (POST, PUT, PATCH, DELETE). Les GET restent non limités par ce middleware.
 */
function writeMethodsRateLimit(req, res, next) {
  if (!config.rateLimit.enabled) return next();
  const method = req.method.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return limiter(req, res, next);
  }
  return next();
}

module.exports = { writeMethodsRateLimit };
