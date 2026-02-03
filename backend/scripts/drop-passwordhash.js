#!/usr/bin/env node

const path = require('path');

try {
  require('dotenv').config({
    path: path.resolve(__dirname, '..', '..', '.env.production'),
    override: true,
  });
} catch (e) {
  console.error('dotenv non disponible:', e?.message || e);
  process.exit(1);
}

const { Client } = require('pg');

async function main() {
  if (!process.env.DIRECT_URL) {
    throw new Error('DIRECT_URL manquante (attendue dans .env.production)');
  }

  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();

  // Vérification préalable
  const before = await client.query(
    "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'"
  );
  if (before.rows.length === 0) {
    console.log('OK: colonne passwordHash déjà absente. Rien à faire.');
    await client.end();
    return;
  }

  console.log('INFO: colonne passwordHash présente, suppression en cours...');

  // Action corrective
  await client.query('ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";');

  const after = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'"
  );

  if (after.rows.length === 0) {
    console.log('SUCCESS: colonne passwordHash supprimée.');
  } else {
    console.log('ERROR: colonne passwordHash toujours présente:', after.rows);
    process.exitCode = 1;
  }

  await client.end();
}

main().catch((e) => {
  console.error('Erreur:', e?.message || e);
  process.exit(1);
});
