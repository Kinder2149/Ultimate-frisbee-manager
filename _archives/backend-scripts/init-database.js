/**
 * Script d'initialisation automatique de la base de données
 * Exécuté au démarrage du serveur en production
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function initializeDatabase() {
  console.log('🔄 Initialisation de la base de données...');
  
  try {
    // Vérifier la connexion à la base
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');
    
    // Appliquer les migrations
    console.log('📋 Application des migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations appliquées');
    
    // Vérifier si des données existent déjà
    const tagCount = await prisma.tag.count();
    const exerciceCount = await prisma.exercice.count();
    
    if (tagCount === 0 && exerciceCount === 0) {
      console.log('🌱 Base vide détectée, initialisation des données...');
      
      // Exécuter le seed
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('✅ Données initiales créées');
    } else {
      console.log(`ℹ️ Base déjà initialisée (${tagCount} tags, ${exerciceCount} exercices)`);
    }
    
    console.log('🎉 Initialisation terminée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    
    // En cas d'erreur, on continue quand même le démarrage
    // pour éviter que le serveur ne démarre pas
    console.log('⚠️ Démarrage du serveur malgré l\'erreur d\'initialisation');
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { initializeDatabase };
