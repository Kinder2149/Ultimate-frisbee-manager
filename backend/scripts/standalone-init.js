#!/usr/bin/env node
/**
 * Script d'initialisation standalone pour la base de données
 * Peut être exécuté manuellement : npm run db:init
 */

const { initializeDatabase } = require('./init-database');

async function main() {
  console.log('🚀 Initialisation manuelle de la base de données...');
  await initializeDatabase();
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
