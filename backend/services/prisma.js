const { PrismaClient } = require('@prisma/client');

// Singleton Prisma pour éviter d'ouvrir trop de connexions
// Pattern compatible avec le rechargement à chaud (nodemon)
let prisma;

if (process.env.NODE_ENV === 'test') {
  // Pour les tests, toujours créer une nouvelle instance pour garantir l'isolement
  prisma = new PrismaClient();
} else if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En développement, utiliser le singleton pour le rechargement à chaud
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = { prisma };
