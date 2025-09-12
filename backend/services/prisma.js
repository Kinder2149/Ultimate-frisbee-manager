const { PrismaClient } = require('@prisma/client');

// Singleton Prisma pour éviter d'ouvrir trop de connexions
// Pattern compatible avec le rechargement à chaud (nodemon)
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = { prisma };
