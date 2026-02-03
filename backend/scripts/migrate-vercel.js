#!/usr/bin/env node
/**
 * Script de migration Prisma pour Vercel
 * Applique les migrations en utilisant DIRECT_URL
 */

const { execSync } = require('child_process');

console.log('🔄 Démarrage des migrations Prisma pour Vercel...');

// Vérifier que DIRECT_URL est définie
if (!process.env.DIRECT_URL) {
  console.error('❌ ERREUR: DIRECT_URL n\'est pas définie');
  console.error('Cette variable est requise pour les migrations Prisma');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ ERREUR: DATABASE_URL n\'est pas définie');
  process.exit(1);
}

console.log('✅ Variables d\'environnement détectées');
console.log('📍 DATABASE_URL:', process.env.DATABASE_URL.substring(0, 30) + '...');
console.log('📍 DIRECT_URL:', process.env.DIRECT_URL.substring(0, 30) + '...');

try {
  console.log('\n📦 Génération du client Prisma...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  
  console.log('\n🚀 Application des migrations...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    cwd: __dirname + '/..'
  });
  
  console.log('\n✅ Migrations appliquées avec succès!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Erreur lors des migrations:', error.message);
  process.exit(1);
}
