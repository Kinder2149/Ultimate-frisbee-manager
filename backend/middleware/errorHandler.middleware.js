const { logError } = require('../services/logger.service');

/**
 * Middleware de gestion des erreurs centralisé.
 * Ce middleware doit être le dernier à être ajouté à la chaîne de middlewares.
 */
const errorHandler = (err, req, res, next) => {
  // Définir un statut par défaut
  const statusCode = err.statusCode || 500;

  // Définir un message d'erreur par défaut
  let message = err.message || 'Une erreur interne est survenue sur le serveur.';

  // En mode production, ne pas exposer les détails de l'erreur au client
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Une erreur interne est survenue sur le serveur.';
  }

  // Logger l'erreur avec contexte complet
  logError(err, {
    requestId: req.requestId,
    userId: req.userId,
    workspaceId: req.workspaceId,
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection?.remoteAddress
  });

  // Construire la réponse d'erreur standardisée
  const errorResponse = {
    error: message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    requestId: req.requestId, // Ajouter le requestId pour traçabilité
    timestamp: new Date().toISOString()
  };

  // Ajouter les détails de validation s'ils existent
  if (err.details) {
    errorResponse.details = err.details;
  }

  // Ajouter les IDs invalides pour les erreurs de tags
  if (err.invalidIds) {
    errorResponse.invalidIds = err.invalidIds;
  }

  // Exposer la pile d'appels uniquement en développement
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Envoyer la réponse d'erreur formatée
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
