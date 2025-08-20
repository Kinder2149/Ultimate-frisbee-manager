/**
 * Script pour forcer l'application des migrations en production
 */

const { execSync } = require('child_process');

async function forceMigrate() {
  console.log('🔧 Application forcée des migrations...');
  
  try {
    console.log('📦 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🗄️ Push du schéma vers la base...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    console.log('🌱 Exécution du seed...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('✅ Migration forcée terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration forcée:', error.message);
    console.log('⚠️ Tentative alternative avec db push...');
    
    try {
      console.log('🔄 Push du schéma sans reset...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Push alternatif réussi !');
    } catch (pushError) {
      console.error('❌ Échec du push:', pushError.message);
      console.log('⚠️ Continuons sans initialisation des données');
    }
  }
}

forceMigrate();
