const app = require('./app');
const { prisma } = require('./services/prisma');

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, '0.0.0.0', async () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
    console.log(`Accessible localement sur http://localhost:${PORT}`);
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
