/**
 * Middleware de gestion des erreurs centralisé.
 * Ce middleware doit être le dernier à être ajouté à la chaîne de middlewares.
 */
const errorHandler = (err, req, res, next) => {
  // Log de l'erreur pour le débogage
  console.error('Erreur interceptée par le gestionnaire central:', err);

  // Définir un statut par défaut
  const statusCode = err.statusCode || 500;

  // Définir un message d'erreur par défaut
  let message = err.message || 'Une erreur interne est survenue sur le serveur.';

  // En mode production, ne pas exposer les détails de l'erreur au client
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Une erreur interne est survenue sur le serveur.';
  }

  // Envoyer la réponse d'erreur formatée
  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    details: err.details || undefined, // Ajouter les détails de validation s'ils existent
    // Exposer la pile d'appels uniquement en développement
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
