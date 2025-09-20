import { PrismaClient } from './generated/client/index.d.ts';

// Déclare une variable globale pour stocker l'instance de Prisma.
// Utiliser 'any' est une pratique courante pour les singletons dans cet environnement Deno/TS.
declare global {
  var prisma: PrismaClient | undefined;
}

// Crée une instance unique de PrismaClient et la met en cache.
// Cela évite d'épuiser les connexions à la base de données dans un environnement serverless.
const prisma = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: Deno.env.get('DATABASE_URL')!,
    },
  },
});

// En développement, attache l'instance à l'objet global pour la réutiliser lors des rechargements à chaud.
// Deno.env.get('NETLIFY_DEV') ou un autre indicateur local pourrait être utilisé ici.
// Pour l'instant, nous nous assurons simplement que le singleton est bien exporté.
globalThis.prisma = prisma;

export { prisma };
