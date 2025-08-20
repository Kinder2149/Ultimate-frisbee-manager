/**
 * Script pour forcer l'application des migrations en production
 */

const { execSync } = require('child_process');

async function forceMigrate() {
  console.log('🔧 Application forcée des migrations...');
  
  try {
    // Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Appliquer les migrations
    console.log('🗄️ Application des migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Exécuter le seed
    console.log('🌱 Initialisation des données...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('✅ Migration forcée terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration forcée:', error.message);
    process.exit(1);
  }
}

forceMigrate();
