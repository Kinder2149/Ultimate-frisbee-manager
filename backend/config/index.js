const dotenv = require('dotenv');
const path = require('path');

// Chemin du .env backend
const envPath = path.resolve(__dirname, '..', '.env');

// Charge les variables d'environnement depuis le fichier .env à la racine du backend
// En production, ne pas override les variables fournies par la plateforme (Render)
const isProdRuntime = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const result = dotenv.config({
  path: envPath,
  override: !isProdRuntime
});

if (result.error) {
  // En production, les variables sont généralement définies directement sur le serveur
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[Config] Avertissement: Le fichier .env n'a pas été trouvé à ${envPath}. Assurez-vous que les variables d'environnement sont définies.`);
  }
}

// Validation préalable des secrets JWT
const isProd = process.env.NODE_ENV === 'production';
if (!process.env.JWT_SECRET) {
  console.error('[Config] FATAL: JWT_SECRET manquant.');
  process.exit(1);
}
if (!process.env.JWT_REFRESH_SECRET) {
  // Refresh optionnel: démarrage autorisé avec avertissement clair
  console.warn('[Config] Warning: JWT_REFRESH_SECRET absent — rafraîchissement de token désactivé.');
}

// Valider et exporter la configuration
const config = {
  port: process.env.PORT || 3002,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:4200',
  cloudinary: {
    url: process.env.CLOUDINARY_URL,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
    enabled: (process.env.RATE_LIMIT_ENABLED || 'true').toLowerCase() !== 'false'
  }
};

// Validation critique pour Cloudinary
if (!config.cloudinary.url && (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret)) {
  throw new Error('Configuration Cloudinary manquante ou incomplète. Définissez soit CLOUDINARY_URL, soit les clés séparées.');
}

// Aide au diagnostic: avertir si CLOUDINARY_URL manquante (fallback sur clés séparées possible)
if (!config.cloudinary.url) {
  console.warn('[Config] CLOUDINARY_URL non définie. Le système tentera d\'utiliser CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET si fournis.');
}

module.exports = config;
