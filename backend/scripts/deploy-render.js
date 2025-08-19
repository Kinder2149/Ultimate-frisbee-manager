/**
 * Script de déploiement pour Render
 * Vérifie la configuration et prépare l'environnement
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkEnvironment() {
  console.log('🔍 Vérification de l\'environnement...');
  
  // Vérifier les variables d'environnement requises
  const requiredEnvVars = ['DATABASE_URL', 'NODE_ENV'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
    console.log('💡 Assurez-vous de configurer ces variables dans Render');
    return false;
  }
  
  console.log('✅ Variables d\'environnement OK');
  return true;
}

function checkDependencies() {
  console.log('📦 Vérification des dépendances...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['@prisma/client', 'pg', 'express', 'cors'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      console.error('❌ Dépendances manquantes:', missingDeps.join(', '));
      return false;
    }
    
    console.log('✅ Dépendances OK');
    return true;
  } catch (error) {
    console.error('❌ Erreur lecture package.json:', error.message);
    return false;
  }
}

function runPrismaSetup() {
  console.log('🗄️ Configuration Prisma...');
  
  try {
    // Générer le client Prisma
    console.log('Génération du client Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Appliquer les migrations
    console.log('Application des migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('✅ Prisma configuré');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration Prisma:', error.message);
    return false;
  }
}

function seedDatabase() {
  console.log('🌱 Initialisation des données...');
  
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Base de données initialisée');
    return true;
  } catch (error) {
    console.warn('⚠️ Erreur seeding (peut être normal si déjà fait):', error.message);
    return true; // Non bloquant
  }
}

async function deployToRender() {
  console.log('🚀 Déploiement Render - Vérifications préalables');
  
  // Vérifications
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  if (!checkEnvironment()) {
    console.log('⚠️ Variables d\'environnement manquantes - normal en local');
  }
  
  // Configuration Prisma
  if (!runPrismaSetup()) {
    process.exit(1);
  }
  
  // Seeding (optionnel)
  seedDatabase();
  
  console.log('🎉 Préparation terminée !');
  console.log('📋 Étapes suivantes :');
  console.log('1. Configurer les variables d\'environnement dans Render');
  console.log('2. DATABASE_URL sera fournie par PostgreSQL Render');
  console.log('3. Définir NODE_ENV=production');
  console.log('4. Build command: npm install');
  console.log('5. Start command: npm start');
}

// Exécution du script
if (require.main === module) {
  deployToRender();
}

module.exports = { checkEnvironment, checkDependencies, runPrismaSetup };
