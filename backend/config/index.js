const dotenv = require('dotenv');
const path = require('path');

// Chemin du .env backend
const envPath = path.resolve(__dirname, '..', '.env');

// Charge les variables d'environnement depuis le fichier .env à la racine du backend
// En production, ne pas override les variables fournies par Vercel
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

// Note: JWT_SECRET et JWT_REFRESH_SECRET ne sont plus utilisés
// On utilise uniquement Supabase Auth maintenant

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
  supabase: {
    projectRef: process.env.SUPABASE_PROJECT_REF,
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
