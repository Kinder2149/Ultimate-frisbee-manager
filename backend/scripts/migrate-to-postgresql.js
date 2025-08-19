/**
 * Script de migration des données SQLite vers PostgreSQL
 * À exécuter avant le déploiement sur Render
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Configuration des bases de données
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

const postgresClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('🚀 Début de la migration SQLite → PostgreSQL');
  
  try {
    // Vérifier la connexion PostgreSQL
    await postgresClient.$connect();
    console.log('✅ Connexion PostgreSQL établie');
    
    // Vérifier la connexion SQLite
    await sqliteClient.$connect();
    console.log('✅ Connexion SQLite établie');
    
    // Migration des Tags
    console.log('📋 Migration des Tags...');
    const tags = await sqliteClient.tag.findMany();
    for (const tag of tags) {
      await postgresClient.tag.upsert({
        where: { id: tag.id },
        update: tag,
        create: tag
      });
    }
    console.log(`✅ ${tags.length} tags migrés`);
    
    // Migration des Exercices
    console.log('🏃 Migration des Exercices...');
    const exercices = await sqliteClient.exercice.findMany({
      include: { tags: true }
    });
    for (const exercice of exercices) {
      const { tags, ...exerciceData } = exercice;
      await postgresClient.exercice.upsert({
        where: { id: exercice.id },
        update: {
          ...exerciceData,
          tags: {
            connect: tags.map(tag => ({ id: tag.id }))
          }
        },
        create: {
          ...exerciceData,
          tags: {
            connect: tags.map(tag => ({ id: tag.id }))
          }
        }
      });
    }
    console.log(`✅ ${exercices.length} exercices migrés`);
    
    // Migration des Échauffements
    console.log('🔥 Migration des Échauffements...');
    const echauffements = await sqliteClient.echauffement.findMany({
      include: { blocs: true }
    });
    for (const echauffement of echauffements) {
      const { blocs, ...echauffementData } = echauffement;
      await postgresClient.echauffement.upsert({
        where: { id: echauffement.id },
        update: echauffementData,
        create: echauffementData
      });
      
      // Migration des blocs
      for (const bloc of blocs) {
        await postgresClient.blocEchauffement.upsert({
          where: { id: bloc.id },
          update: bloc,
          create: bloc
        });
      }
    }
    console.log(`✅ ${echauffements.length} échauffements migrés`);
    
    // Migration des Situations/Matchs
    console.log('⚽ Migration des Situations/Matchs...');
    const situationsMatchs = await sqliteClient.situationMatch.findMany({
      include: { tags: true }
    });
    for (const situation of situationsMatchs) {
      const { tags, ...situationData } = situation;
      await postgresClient.situationMatch.upsert({
        where: { id: situation.id },
        update: {
          ...situationData,
          tags: {
            connect: tags.map(tag => ({ id: tag.id }))
          }
        },
        create: {
          ...situationData,
          tags: {
            connect: tags.map(tag => ({ id: tag.id }))
          }
        }
      });
    }
    console.log(`✅ ${situationsMatchs.length} situations/matchs migrés`);
    
    // Migration des Entraînements
    console.log('🎯 Migration des Entraînements...');
    const entrainements = await sqliteClient.entrainement.findMany({
      include: { 
        exercices: true,
        tags: true
      }
    });
    for (const entrainement of entrainements) {
      const { exercices, tags, ...entrainementData } = entrainement;
      await postgresClient.entrainement.upsert({
        where: { id: entrainement.id },
        update: {
          ...entrainementData,
          tags: {
            connect: tags.map(tag => ({ id: tag.id }))
          }
        },
        create: {
          ...entrainementData,
          tags: {
            connect: tags.map(tag => ({ id: tag.id }))
          }
        }
      });
      
      // Migration des relations exercices
      for (const exerciceRel of exercices) {
        await postgresClient.entrainementExercice.upsert({
          where: { id: exerciceRel.id },
          update: exerciceRel,
          create: exerciceRel
        });
      }
    }
    console.log(`✅ ${entrainements.length} entraînements migrés`);
    
    console.log('🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    process.exit(1);
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Exécution du script
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
