const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler.middleware');
const { writeMethodsRateLimit, readMethodsRateLimit } = require('./middleware/rateLimit.middleware');
const app = express();

// Behind Vercel/Cloudflare: trust proxy to let Express use X-Forwarded-* correctly
// This prevents express-rate-limit from warning about unexpected X-Forwarded-For
app.set('trust proxy', 1);

// Middlewares de sécurité avec CSP renforcée
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline nécessaire pour Angular Material
      imgSrc: ["'self'", "data:", "https:", "blob:"], // Cloudinary + data URLs
      connectSrc: ["'self'", "https://supabase.co", "https://*.supabase.co"], // API Supabase
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité Cloudinary
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permet ressources cross-origin
}));
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

// CORS dynamique sécurisé
const allowedExactOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function isLocalhost(originUrl) {
  try {
    const u = new URL(originUrl);
    return (
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1' ||
      u.hostname === '::1'
    );
  } catch { return false; }
}

function isVercelPreview(originUrl) {
  try {
    const u = new URL(originUrl);
    // Ex: 123-he112y0mx-kinder2149s-projects.vercel.app
    return u.hostname.endsWith('-kinder2149s-projects.vercel.app');
  } catch { return false; }
}

function isVercelProd(originUrl) {
  try {
    const u = new URL(originUrl);
    // Adapter au domaine de prod Vercel effectif du frontend
    return (
      u.hostname === 'ultimate-frisbee-manager-kinder.vercel.app' ||
      u.hostname === 'ultimate-frisbee-manager.vercel.app'
    );
  } catch { return false; }
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // requêtes server-to-server ou outils
  if (allowedExactOrigins.includes(origin)) return true; // exacts ENV
  if (isLocalhost(origin)) return true; // dev local
  if (isVercelProd(origin)) return true; // prod Vercel
  if (isVercelPreview(origin)) return true; // previews Vercel
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    const err = new Error('CORS not allowed');
    // hint non sensible en log
    console.warn('[CORS] Origin rejetée:', origin);
    return callback(err, false);
  },
  credentials: true
}));

// Rate limiting sur méthodes d'écriture (POST, PUT, PATCH, DELETE)
app.use(writeMethodsRateLimit);

// Rate limiting sur méthodes de lecture (GET) - 1000 req/15min
app.use(readMethodsRateLimit);

// Middleware pour parser le JSON
app.use(express.json());

// Documentation API Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Ultimate Frisbee Manager API'
}));

// Initialisation des routes
require('./routes')(app);

// Middleware de gestion des erreurs (doit être le dernier)
app.use(errorHandler);

module.exports = app;
