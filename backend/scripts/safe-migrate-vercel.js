#!/usr/bin/env node
/**
 * Script de migration Prisma SÉCURISÉ pour Vercel
 * Vérifie l'état de la base avant d'appliquer les migrations
 * EMPÊCHE la réinitialisation accidentelle des données
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let selectedEnvFile = null;

// Charger les variables d'environnement Vercel
try {
  const dotenv = require('dotenv');
  const repoRoot = path.resolve(__dirname, '..', '..');

  const ordered = ['.env.production', '.env.preview', '.env.local'];
  const selected = ordered.find((f) => fs.existsSync(path.join(repoRoot, f)));
  if (selected) {
    selectedEnvFile = path.join(repoRoot, selected);
    dotenv.config({ path: selectedEnvFile, override: true });
    console.log(`✅ Chargement env: ${selected}`);
  } else {
    console.warn('⚠️  Aucun fichier .env trouvé. Utilisation des env du process.');
  }
} catch (_) {
  console.warn('⚠️  dotenv indisponible, utilisation des env du process.');
}

console.log('🔄 Démarrage des migrations Prisma SÉCURISÉES pour Vercel...');

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

const prismaEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
};

try {
  console.log('\n🔍 VÉRIFICATION DE SÉCURITÉ : État de la base de données...');
  
  // Vérifier si des migrations ont déjà été appliquées
  const { Client } = require('pg');
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  async function checkDatabaseState() {
    try {
      await client.connect();
      
      // Vérifier si la table _prisma_migrations existe
      const migrationsTableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '_prisma_migrations'
        );
      `);
      
      const migrationsTableExists = migrationsTableCheck.rows[0].exists;
      
      if (!migrationsTableExists) {
        console.log('⚠️  Table _prisma_migrations n\'existe pas. Première migration.');
        return { safe: true, reason: 'first_migration' };
      }
      
      // Compter les migrations existantes
      const migrationsCount = await client.query(`
        SELECT COUNT(*) as count FROM "_prisma_migrations";
      `);
      
      const count = parseInt(migrationsCount.rows[0].count);
      console.log(`📊 Migrations existantes: ${count}`);
      
      if (count === 0) {
        console.log('⚠️  ATTENTION: Aucune migration enregistrée mais table existe.');
        console.log('⚠️  Cela pourrait indiquer un reset récent.');
        
        // Vérifier si des données existent
        const userCount = await client.query(`SELECT COUNT(*) as count FROM "User";`);
        const workspaceCount = await client.query(`SELECT COUNT(*) as count FROM "Workspace";`);
        
        const hasData = parseInt(userCount.rows[0].count) > 0 || parseInt(workspaceCount.rows[0].count) > 0;
        
        if (hasData) {
          console.log('🚨 DANGER: Des données existent mais aucune migration enregistrée!');
          console.log('🚨 Cela pourrait causer une perte de données.');
          return { safe: false, reason: 'data_without_migrations' };
        }
      }
      
      // Vérifier la dernière migration
      const lastMigration = await client.query(`
        SELECT migration_name, finished_at 
        FROM "_prisma_migrations" 
        ORDER BY finished_at DESC 
        LIMIT 1;
      `);
      
      if (lastMigration.rows.length > 0) {
        const last = lastMigration.rows[0];
        console.log(`✅ Dernière migration: ${last.migration_name}`);
        console.log(`✅ Appliquée le: ${last.finished_at}`);
      }
      
      return { safe: true, reason: 'migrations_exist', count };
      
    } finally {
      await client.end();
    }
  }

  // Exécuter la vérification de manière synchrone
  const checkResult = require('child_process').execSync(
    `node -e "
      const { Client } = require('pg');
      const client = new Client({ connectionString: '${process.env.DIRECT_URL}' });
      
      (async () => {
        try {
          await client.connect();
          const result = await client.query('SELECT COUNT(*) as count FROM \\"_prisma_migrations\\"');
          console.log(result.rows[0].count);
          await client.end();
        } catch (e) {
          console.log('0');
          await client.end();
        }
      })();
    "`,
    { encoding: 'utf-8', cwd: __dirname + '/..' }
  ).trim();

  const migrationCount = parseInt(checkResult);
  console.log(`📊 Migrations existantes dans la base: ${migrationCount}`);

  if (migrationCount > 0) {
    console.log('✅ Base de données déjà migrée. Application des nouvelles migrations uniquement.');
  } else {
    console.log('⚠️  ATTENTION: Aucune migration détectée. Vérification supplémentaire...');
    
    // Vérifier si des données existent
    const dataCheck = require('child_process').execSync(
      `node -e "
        const { Client } = require('pg');
        const client = new Client({ connectionString: '${process.env.DIRECT_URL}' });
        
        (async () => {
          try {
            await client.connect();
            const users = await client.query('SELECT COUNT(*) as count FROM \\"User\\"');
            const workspaces = await client.query('SELECT COUNT(*) as count FROM \\"Workspace\\"');
            console.log(parseInt(users.rows[0].count) + parseInt(workspaces.rows[0].count));
            await client.end();
          } catch (e) {
            console.log('0');
            await client.end();
          }
        })();
      "`,
      { encoding: 'utf-8', cwd: __dirname + '/..' }
    ).trim();

    const totalData = parseInt(dataCheck);
    
    if (totalData > 0 && migrationCount === 0) {
      console.error('🚨 ERREUR CRITIQUE: Des données existent mais aucune migration enregistrée!');
      console.error('🚨 Appliquer les migrations maintenant DÉTRUIRAIT les données.');
      console.error('🚨 MIGRATION ANNULÉE pour protection des données.');
      console.error('');
      console.error('📝 Action requise:');
      console.error('   1. Vérifier l\'état de la base de données manuellement');
      console.error('   2. Restaurer un backup si nécessaire');
      console.error('   3. Contacter l\'administrateur système');
      process.exit(1);
    }
  }

  console.log('\n📦 Génération du client Prisma...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: __dirname + '/..',
    env: prismaEnv,
  });
  
  console.log('\n🚀 Application des migrations (mode sécurisé)...');
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
