const dotenv = require('dotenv');
const path = require('path');

// Charge les variables d'environnement depuis le fichier .env à la racine du backend
const result = dotenv.config({ 
  path: path.resolve(__dirname, '..', '.env'),
  override: true // Force l'utilisation des variables du .env par-dessus celles du système
});

if (result.error) {
  // En production, les variables sont généralement définies directement sur le serveur
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[Config] Avertissement: Le fichier .env n'a pas été trouvé à ${envPath}. Assurez-vous que les variables d'environnement sont définies.`);
  }
}

// Validation préalable des secrets JWT
const isProd = process.env.NODE_ENV === 'production';
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  if (isProd) {
    console.error('[Config] FATAL: JWT secrets are missing in production (JWT_SECRET/JWT_REFRESH_SECRET).');
    process.exit(1);
  } else {
    console.warn('[Config] Warning: JWT secrets missing; provide them via backend/.env (not tracked).');
  }
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
  }
};

// Validation critique pour Cloudinary
if (!config.cloudinary.url && (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret)) {
  throw new Error('Configuration Cloudinary manquante ou incomplète. Définissez soit CLOUDINARY_URL, soit les clés séparées.');
}

module.exports = config;
