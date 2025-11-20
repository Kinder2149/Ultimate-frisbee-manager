// backend/scripts/validate-envs.js
// Valide la cohérence des variables d'environnement backend.

const fs = require('fs');
const path = require('path');

const USED_VARS = [
  'NODE_ENV',
  'DATABASE_URL',
  'PORT',
  'CORS_ORIGINS',
  'CLOUDINARY_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX',
  'RATE_LIMIT_ENABLED',
  'SUPABASE_PROJECT_REF',
  'SEED_DESTRUCTIVE',
  'API_BASE_URL',
  'BACKEND_BASE_URL',
  'API',
  'ADMIN_TOKEN',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'FRONTEND_ORIGIN',
  'IMPORT_TEST',
  'UPLOAD_TEST_ENDPOINT',
  'TEST_IMAGE_URL',
  'UPLOAD_BODY_FIELD'
];

// Sous-ensemble de variables qui doivent exister sur Render
// (celles que tu as effectivement configurées côté Render).
const RENDER_REQUIRED_VARS = [
  'NODE_ENV',
  'NODE_VERSION',
  'DATABASE_URL',
  'CORS_ORIGINS',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLOUDINARY_URL',
  'SUPABASE_PROJECT_REF',
  'PORT'
];

function parseEnvFile(content) {
  const vars = new Set();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const name = trimmed.slice(0, idx).trim();
    if (name) vars.add(name);
  }
  return vars;
}

function main() {
  const backendRoot = process.cwd();

  const envExamplePath = path.join(backendRoot, '.env.example');
  const renderEnvJsonPath = path.join(backendRoot, 'render.env.example.json');

  if (!fs.existsSync(envExamplePath)) {
    console.error('[env-check] backend/.env.example manquant');
    process.exit(1);
  }
  if (!fs.existsSync(renderEnvJsonPath)) {
    console.error('[env-check] backend/render.env.example.json manquant (liste des env Render attendues)');
    process.exit(1);
  }

  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  const envExampleVars = parseEnvFile(envExampleContent);

  const renderEnvRef = JSON.parse(fs.readFileSync(renderEnvJsonPath, 'utf8'));
  const renderVars = new Set(renderEnvRef.envVars || []);

  const missingInEnvExample = USED_VARS.filter(v => !envExampleVars.has(v));
  // Pour Render, on ne vérifie que le sous-ensemble réellement requis
  const missingInRenderRef = RENDER_REQUIRED_VARS.filter(v => !renderVars.has(v));

  const obsoleteInEnvExample = Array.from(envExampleVars).filter(v => !USED_VARS.includes(v));
  // Pour Render, on tolère des variables infra supplémentaires (ex: NODE_VERSION)
  const obsoleteInRenderRef = Array.from(renderVars).filter(
    v => !USED_VARS.includes(v) && !RENDER_REQUIRED_VARS.includes(v)
  );

  console.log('=== backend env-check summary ===');
  console.log('USED_VARS:', USED_VARS);
  console.log('RENDER_REQUIRED_VARS:', RENDER_REQUIRED_VARS);

  console.log('\nMissing in .env.example:', missingInEnvExample);
  console.log('Missing in render.env.example.json:', missingInRenderRef);

  console.log('\nObsolete in .env.example (définies mais pas utilisées dans le code):', obsoleteInEnvExample);
  console.log('Obsolete in render.env.example.json:', obsoleteInRenderRef);

  if (missingInEnvExample.length > 0 || missingInRenderRef.length > 0) {
    console.error('\n[env-check] Des variables manquent dans .env.example ou dans la référence Render.');
    process.exit(1);
  }

  console.log('\n[env-check] OK : toutes les variables requises sont présentes.');
}

main();
