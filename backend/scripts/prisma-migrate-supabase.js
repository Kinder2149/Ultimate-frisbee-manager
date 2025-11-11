const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

function log(msg) {
  console.log(msg);
}

function runNpxPrisma(args, opts = {}) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const child = spawn(cmd, ['prisma', ...args], {
      cwd: opts.cwd || process.cwd(),
      env: opts.env || process.env,
      shell: false,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      if (code === 0) return resolve({ stdout, stderr, code });
      const err = new Error(`Command failed: npx prisma ${args.join(' ')} (code ${code})`);
      err.stdout = stdout;
      err.stderr = stderr;
      err.code = code;
      reject(err);
    });
  });
}

async function replaceProvider(schemaPath) {
  const original = await fsp.readFile(schemaPath, 'utf8');
  const replaced = original.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  if (original !== replaced) {
    await fsp.writeFile(schemaPath, replaced, 'utf8');
    return true;
  }
  return false;
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function main() {
  const backendRoot = path.join(__dirname, '..');
  try {
    if (!process.env.DATABASE_URL) {
      const dotenv = require('dotenv');
      dotenv.config({ path: path.join(backendRoot, '.env') });
    }
  } catch (_) {}
  const prismaDir = path.join(backendRoot, 'prisma');
  const schemaPath = path.join(prismaDir, 'schema.prisma');
  const migrationsDir = path.join(prismaDir, 'migrations', '000_init');
  const migrationSqlPath = path.join(migrationsDir, 'migration.sql');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Erreur: DATABASE_URL manquant dans l\'environnement.');
    process.exit(1);
  }

  log('[1/5] Mise à jour du provider Prisma vers postgresql');
  const changed = await replaceProvider(schemaPath);
  log(changed ? 'Provider mis à jour.' : 'Provider déjà en postgresql.');

  log('[2/5] Génération du script de migration initiale via prisma migrate diff');
  await ensureDir(migrationsDir);
  const diff = await runNpxPrisma([
    'migrate', 'diff',
    '--from-schema-datamodel', path.relative(backendRoot, schemaPath),
    '--to-url', databaseUrl,
    '--script',
  ], { cwd: backendRoot });
  await fsp.writeFile(migrationSqlPath, diff.stdout, 'utf8');
  log(`Script de migration écrit: ${path.relative(backendRoot, migrationSqlPath)}`);

  log('[3/5] Déploiement des migrations sur Supabase (prisma migrate deploy)');
  await runNpxPrisma(['migrate', 'deploy'], { cwd: backendRoot });
  log('Migrations déployées.');

  log('[4/5] Génération du client Prisma (prisma generate)');
  await runNpxPrisma(['generate'], { cwd: backendRoot });
  log('Client Prisma généré.');

  log('[5/5] Terminé. Migration Supabase effectuée.');
}

main().catch((err) => {
  console.error('Erreur:', err.message || err);
  if (err.stdout) console.error('\nSTDOUT:\n', err.stdout);
  if (err.stderr) console.error('\nSTDERR:\n', err.stderr);
  process.exit(1);
});
