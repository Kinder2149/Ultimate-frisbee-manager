const pino = require('pino');

/**
 * Service de logging centralisé pour le backend
 * Utilise Pino pour des logs structurés et performants
 */

// Configuration du logger selon l'environnement
const isDevelopment = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

// Configuration Pino
const pinoConfig = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  // En test, désactiver les logs sauf si explicitement demandé
  enabled: !isTest || process.env.ENABLE_TEST_LOGS === 'true',
  // Format lisible en développement, JSON en production
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{levelLabel} [{requestId}] {msg}'
    }
  } : undefined,
  // Champs de base pour tous les logs
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'ufm-backend'
  },
  // Serializers pour formater certains objets
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err
  }
};

// Créer l'instance du logger
const logger = pino(pinoConfig);

/**
 * Enrichir le contexte de log avec des métadonnées
 * @param {Object} context - Contexte additionnel (userId, workspaceId, action, etc.)
 * @returns {Object} Logger avec contexte
 */
function withContext(context = {}) {
  return logger.child(context);
}

/**
 * Logger une requête HTTP entrante
 * @param {Object} req - Objet requête Express
 * @param {string} message - Message optionnel
 */
function logRequest(req, message = 'Incoming request') {
  const context = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    userId: req.userId,
    workspaceId: req.workspaceId,
    ip: req.ip || req.connection?.remoteAddress
  };
  
  logger.info(context, message);
}

/**
 * Logger une réponse HTTP
 * @param {Object} req - Objet requête Express
 * @param {Object} res - Objet réponse Express
 * @param {number} duration - Durée de traitement en ms
 */
function logResponse(req, res, duration) {
  const context = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.userId,
    workspaceId: req.workspaceId
  };
  
  const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
  logger[level](context, `Request completed`);
}

/**
 * Logger une erreur avec contexte complet
 * @param {Error} error - Objet erreur
 * @param {Object} context - Contexte additionnel
 */
function logError(error, context = {}) {
  const errorContext = {
    ...context,
    errorName: error.name,
    errorMessage: error.message,
    errorCode: error.code,
    errorStack: error.stack,
    statusCode: error.statusCode
  };
  
  logger.error(errorContext, `Error occurred: ${error.message}`);
}

/**
 * Logger une action métier
 * @param {string} action - Nom de l'action (ex: 'CREATE_EXERCICE')
 * @param {Object} context - Contexte (userId, workspaceId, resourceId, etc.)
 * @param {string} message - Message descriptif
 */
function logAction(action, context = {}, message = '') {
  const actionContext = {
    action,
    ...context
  };
  
  logger.info(actionContext, message || `Action: ${action}`);
}

/**
 * Logger un avertissement
 * @param {string} message - Message d'avertissement
 * @param {Object} context - Contexte additionnel
 */
function logWarning(message, context = {}) {
  logger.warn(context, message);
}

/**
 * Logger une information de debug
 * @param {string} message - Message de debug
 * @param {Object} context - Contexte additionnel
 */
function logDebug(message, context = {}) {
  logger.debug(context, message);
}

/**
 * Logger une information générale
 * @param {string} message - Message d'information
 * @param {Object} context - Contexte additionnel
 */
function logInfo(message, context = {}) {
  logger.info(context, message);
}

module.exports = {
  logger,
  withContext,
  logRequest,
  logResponse,
  logError,
  logAction,
  logWarning,
  logDebug,
  logInfo
};
