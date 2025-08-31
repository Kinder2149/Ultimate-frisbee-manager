#!/usr/bin/env node
/*
  Script de baseline Prisma pour Render
  - Détecte les dossiers de migrations dans prisma/migrations
  - Marque chaque migration comme "applied" via `prisma migrate resolve --applied <dir>`
  - Ignore les erreurs si la migration est déjà appliquée
*/

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const migrationsDir = path.join(root, 'prisma', 'migrations');

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch (_) {
    return false;
  }
}

function main() {
  if (!fs.existsSync(migrationsDir)) {
    console.log('[baseline] Aucun dossier prisma/migrations, rien à faire');
    return;
  }

  const entries = fs
    .readdirSync(migrationsDir)
    .filter((name) => name !== 'migration_lock.toml')
    .map((name) => ({ name, full: path.join(migrationsDir, name) }))
    .filter((e) => isDir(e.full))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (entries.length === 0) {
    console.log('[baseline] Aucune migration détectée');
    return;
  }

  console.log(`[baseline] CWD: ${root}`);
  console.log(`[baseline] Migrations détectées: ${entries.map((e) => e.name).join(', ')}`);

  for (const e of entries) {
    console.log(`[baseline] Applying resolve --applied ${e.name} ...`);
    const res = spawnSync('npx', ['prisma', '--schema', 'prisma/schema.prisma', 'migrate', 'resolve', '--applied', e.name], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    if (res.status !== 0) {
      console.warn(`[baseline] Avertissement: échec/ignoré pour ${e.name} (peut-être déjà appliquée)`);
      // Continuer avec les autres
    }
  }

  console.log('[baseline] Terminé');
}

main();
