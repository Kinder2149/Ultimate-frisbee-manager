#!/usr/bin/env node
/**
 * Script de migration Prisma pour Vercel
 * Applique les migrations en utilisant DIRECT_URL
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let selectedEnvFile = null;

// Charger les variables d'environnement Vercel depuis les fichiers générés par `vercel env pull`
// IMPORTANT: on force override=true pour éviter d'utiliser les valeurs du backend/.env local.
try {
  // eslint-disable-next-line global-require
  const dotenv = require('dotenv');
  const repoRoot = path.resolve(__dirname, '..', '..');

  const ordered = ['.env.production', '.env.preview', '.env.local'];
  const selected = ordered.find((f) => fs.existsSync(path.join(repoRoot, f)));
  if (selected) {
    selectedEnvFile = path.join(repoRoot, selected);
    dotenv.config({ path: selectedEnvFile, override: true });
    console.log(`✅ Chargement env: ${selected}`);
  } else {
    console.warn('⚠️  Aucun fichier .env.production/.env.preview/.env.local trouvé à la racine. Utilisation des env du process.');
  }
} catch (_) {
  console.warn('⚠️  dotenv indisponible, utilisation des env du process.');
}

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
console.log('📍 DATABASE_URL: OK');
console.log('📍 DIRECT_URL: OK');

function safeDescribeDbUrl(label, raw) {
  if (!raw) return;
  try {
    const u = new URL(raw);
    const flags = u.search ? u.search.slice(1) : '';
    console.log(`[env] ${label} => host: ${u.hostname} port: ${u.port || '(default)'} db: ${u.pathname.replace('/', '')} flags: ${flags}`);
  } catch (e) {
    console.log(`[env] ${label} => (unparseable)`);
  }
}

safeDescribeDbUrl('DATABASE_URL', process.env.DATABASE_URL);
safeDescribeDbUrl('DIRECT_URL', process.env.DIRECT_URL);

// Important: Prisma CLI recharge automatiquement un fichier .env (ex: backend/.env) et peut écraser les variables.
// Pour garantir qu'on migre la bonne base (prod), on passe explicitement les env au process enfant.
const prismaEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
};

try {
  console.log('\n📦 Génération du client Prisma...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: __dirname + '/..',
    env: prismaEnv,
  });
  
  console.log('\n🚀 Application des migrations...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    cwd: __dirname + '/..',
    env: prismaEnv,
  });
  
  console.log('\n✅ Migrations appliquées avec succès!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Erreur lors des migrations:', error.message);
  process.exit(1);
}
