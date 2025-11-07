const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const errorHandler = require('./middleware/errorHandler.middleware');
const app = express();

// Middlewares de sécurité
app.use(helmet());
// Logging HTTP (non intrusif) avec redaction des en-têtes sensibles
app.use(pinoHttp({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]'
    ],
    remove: true
  }
}));
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return allowedOrigins.includes(origin)
      ? callback(null, true)
      : callback(new Error('CORS not allowed'), false);
  },
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json());

// Initialisation des routes
require('./routes')(app);

// Middleware de gestion des erreurs (doit être le dernier)
app.use(errorHandler);

module.exports = app;
