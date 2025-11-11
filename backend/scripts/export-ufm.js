import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TYPES = ['exercices', 'entrainements', 'echauffements', 'situations-matchs'];

function mapTypeForExport(t) {
  const x = String(t || '').toLowerCase();
  if (x === 'exercices') return 'exercice';
  if (x === 'entrainements') return 'entrainement';
  if (x === 'echauffements') return 'echauffement';
  if (x === 'situations-matchs') return 'situation';
  return x;
}

function getArgValue(name) {
  const p = `--${name}=`;
  const a = process.argv.find(x => x.startsWith(p));
  return a ? a.slice(p.length) : undefined;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function toInt(v, d) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
}

async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

function extractIds(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    if (item == null) return undefined;
    if (typeof item === 'string' || typeof item === 'number') return item;
    if (typeof item === 'object') {
      if ('id' in item) return item.id;
      if ('_id' in item) return item._id;
      if ('uuid' in item) return item.uuid;
      if ('slug' in item) return item.slug;
    }
    return undefined;
  }).filter(v => v !== undefined);
}

async function fetchWithRetry(makeRequest, retries, label) {
  let lastErr;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await makeRequest();
    } catch (e) {
      lastErr = e;
      const delay = Math.min(5000, 300 * attempt);
      console.error(`${label} - échec tentative ${attempt}/${retries + 1}: ${e.message || e}`);
      if (attempt <= retries) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let txt = '';
    try { txt = await res.text(); } catch {}
    const err = new Error(`HTTP ${res.status} ${res.statusText} for ${url} -> ${txt}`);
    err.status = res.status;
    err.body = txt;
    throw err;
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function normalizeBaseUrl(v) {
  if (!v) return v;
  return v.endsWith('/') ? v.slice(0, -1) : v;
}

async function loginForToken(baseUrl, email, password) {
  const body = JSON.stringify({ email, password });
  const data = await fetchJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body
  });
  if (!data) throw new Error('Réponse login vide');
  const token = data.accessToken || data.token || (data.data && (data.data.accessToken || data.data.token));
  if (!token) throw new Error('Token non trouvé dans la réponse de login');
  return token;
}

async function listIds(baseUrl, type, token, retries) {
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
  const dashUrl = `${baseUrl}/api/admin/list-${type}`;
  const underscoreUrl = `${baseUrl}/api/admin/list_${type}`;
  try {
    const list = await fetchWithRetry(() => fetchJson(dashUrl, { headers }), retries, `[${type}] list (dash)`);
    return extractIds(list);
  } catch {
    const list2 = await fetchWithRetry(() => fetchJson(underscoreUrl, { headers }), retries, `[${type}] list (underscore)`);
    return extractIds(list2);
  }
}

async function exportOne(baseUrl, type, id, token, retries) {
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
  const mapped = mapTypeForExport(type);
  const url = `${baseUrl}/api/admin/export-ufm?type=${encodeURIComponent(mapped)}&id=${encodeURIComponent(id)}`;
  const data = await fetchWithRetry(() => fetchJson(url, { headers }), retries, `[${type}] export id=${id}`);
  if (!data || typeof data !== 'object') throw new Error('Export vide ou invalide');
  return data;
}

async function main() {
  const argBaseUrl = getArgValue('baseUrl');
  const argToken = getArgValue('token');
  const argEmail = getArgValue('email');
  const argPassword = getArgValue('password');
  const argOutDir = getArgValue('outDir');
  const argRetry = getArgValue('retry');
  const dryRun = hasFlag('dryRun');

  const baseUrl = normalizeBaseUrl(argBaseUrl || process.env.API_BASE_URL || process.env.BACKEND_BASE_URL);
  const retryCount = toInt(argRetry, 3);
  const outDir = argOutDir
    ? path.resolve(process.cwd(), argOutDir)
    : path.resolve(process.cwd(), 'backend', 'exports');

  if (!baseUrl) {
    console.error('Erreur: --baseUrl est requis (ex: --baseUrl=http://localhost:3002).');
    process.exit(1);
  }

  let token = argToken || process.env.ADMIN_TOKEN;
  if (!token) {
    const email = argEmail || process.env.ADMIN_EMAIL;
    const password = argPassword || process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('Erreur: token introuvable. Fournissez --token ou --email et --password (ou ADMIN_EMAIL/ADMIN_PASSWORD).');
      process.exit(1);
    }
    console.log('Authentification en cours pour récupérer le token...');
    try {
      token = await fetchWithRetry(() => loginForToken(baseUrl, email, password), retryCount, 'login');
      console.log('Token récupéré.');
    } catch (e) {
      console.error(`Erreur login: ${e.message || e}`);
      process.exit(1);
    }
  }

  if (!dryRun) {
    try {
      await ensureDir(outDir);
    } catch (e) {
      console.error(`Erreur création du dossier de sortie: ${outDir} -> ${e.message || e}`);
      process.exit(1);
    }
  }

  console.log(`Début export UFM`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Dossier de sortie: ${outDir}${dryRun ? ' (dryRun)' : ''}`);
  console.log(`Types: ${TYPES.join(', ')}`);
  console.log(`Retry: ${retryCount}`);

  let totalFiles = 0;
  let hasErrors = false;

  for (const type of TYPES) {
    console.log(`\n[${type}] Récupération des IDs...`);
    let ids = [];
    try {
      ids = await listIds(baseUrl, type, token, retryCount);
      console.log(`[${type}] ${ids.length} élément(s) trouvé(s).`);
    } catch (e) {
      console.error(`[${type}] Échec de la récupération des IDs: ${e.message || e}`);
      hasErrors = true;
      continue;
    }

    for (const id of ids) {
      const filename = `${type}-${id}.ufm.json`;
      const outPath = path.join(outDir, filename);
      if (dryRun) {
        console.log(`[${type}] (dryRun) Export id=${id} -> ${outPath}`);
        totalFiles += 1;
        continue;
      }
      try {
        console.log(`[${type}] Export id=${id}...`);
        const data = await exportOne(baseUrl, type, id, token, retryCount);
        await fs.promises.writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');
        totalFiles += 1;
        console.log(`[${type}] OK -> ${filename}`);
      } catch (e) {
        hasErrors = true;
        console.error(`[${type}] Échec export id=${id}: ${e.message || e}`);
      }
    }
  }

  console.log(`\nExport terminé. Fichiers ${dryRun ? 'prévus' : 'générés'}: ${totalFiles}`);
  process.exit(hasErrors ? 1 : 0);
}

main().catch((e) => {
  console.error('Erreur fatale:', e);
  process.exit(1);
});