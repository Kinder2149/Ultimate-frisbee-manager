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
    
    // Reset et recréer la base complètement
    console.log('🗄️ Reset et création de la base...');
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    
    console.log('✅ Migration forcée terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration forcée:', error.message);
    // Ne pas faire échouer le build, continuer sans seed
    console.log('⚠️ Continuons sans initialisation des données');
  }
}

forceMigrate();
