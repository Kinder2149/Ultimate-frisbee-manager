// Charger la configuration centralisée au tout début du processus.
// Ce module gère dotenv et valide les variables d'environnement.
const config = require('./config');

const app = require('./app');
const { prisma } = require('./services/prisma');
const { testCloudinaryConnection } = require('./services/cloudinary');

const PORT = config.port;

// Log de diagnostic: afficher l'URL DB effective (sans mot de passe)
try {
  const raw = process.env.DATABASE_URL || '';
  const redacted = raw.replace(/:(.*?)@/, ':***@');
  // Parser grossier pour extraire host/port/base/flags
  const m = raw.match(/^\w+:\/\/[^:]+:(.+?)@([^:\/]+)(?::(\d+))?\/([^?]+)(?:\?(.*))?$/);
  const host = m?.[2] || 'unknown';
  const port = m?.[3] || 'default';
  const db = m?.[4] || 'unknown';
  const flags = m?.[5] || '';
  console.log('[Startup] DATABASE_URL (redacted):', redacted);
  console.log('[Startup] DB target => host:', host, 'port:', port, 'db:', db, 'flags:', flags);
} catch {}

const server = app.listen(PORT, '0.0.0.0', async () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[Startup] Server listening on http://0.0.0.0:${PORT} (local: http://localhost:${PORT})`);
    // Auth via Supabase
    console.log('[Startup] Auth: Supabase Auth enabled');
    // Vérification Cloudinary
    if (!config.cloudinary.url) {
      // Fallback possible via variables séparées; on avertit pour faciliter la config
      console.warn('[Startup] CLOUDINARY_URL non définie. Vérifiez que CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET sont bien présents ou définissez CLOUDINARY_URL.');
    }
    // Ping Cloudinary (API Admin)
    try {
      const ping = await testCloudinaryConnection();
      if (ping.ok) {
        console.log('✅ Cloudinary connecté (api.ping).');
      } else {
        console.warn('⚠️  Cloudinary ping a échoué. Vérifiez la configuration.', ping.error?.message || ping.error);
      }
    } catch (e) {
      console.warn('⚠️  Cloudinary ping non disponible.', e?.message || e);
    }

    try {
      await prisma.$connect();
      console.log('✅ Connexion à la base de données établie.');
    } catch (err) {
      console.error('❌ Impossible de se connecter à la base de données au démarrage.', err);
    }
  }
});

// Gestion de la fermeture propre
const gracefulShutdown = async () => {
  console.log('Signal de fermeture reçu, fermeture du serveur...');
  server.close(async () => {
    console.log('Serveur HTTP fermé.');
    await prisma.$disconnect();
    console.log('Connexion Prisma fermée.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
