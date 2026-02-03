#!/usr/bin/env node

const path = require('path');

try {
  // Charger .env.production à la racine du repo (un niveau au-dessus de backend)
  // override=true pour éviter d'utiliser backend/.env
  // eslint-disable-next-line global-require
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

  const res = await client.query(
    "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='User' AND column_name='passwordHash'"
  );

  if (res.rows.length === 0) {
    console.log('OK: colonne passwordHash ABSENTE de la table "User"');
  } else {
    console.log('KO: colonne passwordHash PRÉSENTE dans la table "User":', res.rows);
  }

  await client.end();
}

main().catch((e) => {
  console.error('Erreur:', e?.message || e);
  process.exit(1);
});
