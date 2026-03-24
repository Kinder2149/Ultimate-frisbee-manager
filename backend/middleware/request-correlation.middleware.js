const { v4: uuidv4 } = require('uuid');
const { logRequest, logResponse } = require('../services/logger.service');

/**
 * Middleware de corrélation des requêtes
 * Génère un requestId unique pour chaque requête et l'ajoute aux headers de réponse
 * Permet de tracer une requête de bout en bout (frontend -> backend -> logs)
 */
const requestCorrelation = (req, res, next) => {
  // Générer ou récupérer le requestId
  // Si le client envoie déjà un X-Request-ID, on le réutilise (utile pour les retry)
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Attacher le requestId à la requête pour utilisation dans les controllers/services
  req.requestId = requestId;
  
  // Ajouter le requestId aux headers de réponse
  res.setHeader('X-Request-ID', requestId);
  
  // Enregistrer le timestamp de début pour calculer la durée
  const startTime = Date.now();
  
  // Logger la requête entrante
  logRequest(req);
  
  // Intercepter la fin de la réponse pour logger
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logResponse(req, res, duration);
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = requestCorrelation;
