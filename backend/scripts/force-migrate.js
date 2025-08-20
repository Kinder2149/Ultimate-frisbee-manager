/**
 * Script pour forcer l'application des migrations en production
 */

const { execSync } = require('child_process');

async function forceMigrate() {
  console.log('🔧 Application forcée des migrations...');
  
  try {
    console.log('📦 Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🗄️ Déploiement des migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('🌱 Exécution du seed...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('✅ Migration forcée terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration forcée:', error.message);
    console.log('⚠️ Tentative de reset complet...');
    
    try {
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
      console.log('✅ Reset complet réussi !');
    } catch (resetError) {
      console.error('❌ Échec du reset:', resetError.message);
      console.log('⚠️ Continuons sans initialisation des données');
    }
  }
}

forceMigrate();
