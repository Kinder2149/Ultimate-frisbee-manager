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

  // Afficher l'état des migrations avant baseline
  try {
    console.log('[baseline] État avant baseline:');
    spawnSync('npx', ['prisma', 'migrate', 'status', '--schema', 'prisma/schema.prisma'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
  } catch (_) {}

  for (const e of entries) {
    console.log(`[baseline] Applying resolve --applied ${e.name} ...`);
    let res = spawnSync('npx', ['prisma', 'migrate', 'resolve', '--applied', e.name, '--schema', 'prisma/schema.prisma'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    if (res.status !== 0) {
      // Fallback avec chemin complet (certains environnements exigent le chemin relatif complet)
      const fullRelPath = path.posix.join('prisma', 'migrations', e.name);
      console.log(`[baseline] Tentative fallback avec chemin: ${fullRelPath}`);
      res = spawnSync('npx', ['prisma', 'migrate', 'resolve', '--applied', fullRelPath, '--schema', 'prisma/schema.prisma'], {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
      if (res.status !== 0) {
        console.warn(`[baseline] Avertissement: échec/ignoré pour ${e.name} (peut-être déjà appliquée ou nom introuvable)`);
      }
    }
  }

  // Afficher l'état des migrations après baseline
  try {
    console.log('[baseline] État après baseline:');
    spawnSync('npx', ['prisma', 'migrate', 'status', '--schema', 'prisma/schema.prisma'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
  } catch (_) {}

  console.log('[baseline] Terminé');
}

main();
