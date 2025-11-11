const fsp = require('fs').promises;
const path = require('path');

const TYPES = [
  'exercices',
  'echauffements',
  'situations-matchs',
  'entrainements',
];

function getArgValue(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

async function listUfmFiles(dir, type) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => n.startsWith(`${type}-`) && n.endsWith('.ufm.json'))
    .map((n) => path.join(dir, n));
}

async function readJson(filePath) {
  const data = await fsp.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function postJson(url, token, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status} ${res.statusText} for ${url} -> ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json().catch(() => ({}));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const backendRoot = path.join(__dirname, '..');
  try {
    if (!process.env.ADMIN_TOKEN || !process.env.API_BASE_URL) {
      const dotenv = require('dotenv');
      dotenv.config({ path: path.join(backendRoot, '.env') });
    }
  } catch (_) {}

  const token = process.env.ADMIN_TOKEN || getArgValue('token');
  const baseUrl = process.env.API_BASE_URL || getArgValue('baseUrl');
  const batchSizeArg = getArgValue('batchSize');
  const batchSize = batchSizeArg ? Math.max(1, parseInt(batchSizeArg, 10)) : 1;

  if (!token) {
    console.error('Erreur: token manquant. Fournissez ADMIN_TOKEN ou --token=...');
    process.exit(1);
  }
  if (!baseUrl) {
    console.error('Erreur: API base URL manquante. Fournissez API_BASE_URL ou --baseUrl=...');
    process.exit(1);
  }

  const exportsDir = path.join(backendRoot, 'exports');
  console.log(`Début import UFM depuis: ${exportsDir}`);
  console.log(`Types: ${TYPES.join(', ')}`);

  let totalImported = 0;

  for (const type of TYPES) {
    try {
      console.log(`\n[${type}] Recherche des fichiers .ufm.json`);
      const files = await listUfmFiles(exportsDir, type);
      console.log(`[${type}] ${files.length} fichier(s) trouvé(s)`);
      if (files.length === 0) continue;

      if (batchSize > 1) {
        console.log(`[${type}] Mode batch activé (taille ${batchSize})`);
        const payloads = [];
        for (const file of files) {
          try {
            const data = await readJson(file);
            payloads.push({ data, file });
          } catch (e) {
            console.error(`[${type}] Échec lecture ${path.basename(file)}: ${e.message}`);
          }
        }
        const groups = chunk(payloads, batchSize);
        let batchSupported = true;
        for (let idx = 0; idx < groups.length; idx++) {
          const group = groups[idx];
          const urlBatch = `${baseUrl}/api/admin/import/${type}/batch`;
          const body = { items: group.map((g) => g.data) };
          try {
            console.log(`[${type}] Import batch ${idx + 1}/${groups.length} (${group.length} items)`);
            await postJson(urlBatch, token, body);
            totalImported += group.length;
            console.log(`[${type}] Batch ${idx + 1} OK`);
          } catch (e) {
            if (e.status === 404) {
              console.warn(`[${type}] Endpoint batch non disponible, bascule en import unitaire`);
              batchSupported = false;
            } else {
              console.error(`[${type}] Échec batch ${idx + 1}: ${e.message}`);
            }
            if (!batchSupported) {
              for (const item of group) {
                const url = `${baseUrl}/api/admin/import/${type}`;
                try {
                  await postJson(url, token, item.data);
                  totalImported += 1;
                  console.log(`[${type}] OK -> ${path.basename(item.file)}`);
                } catch (ee) {
                  console.error(`[${type}] Échec -> ${path.basename(item.file)}: ${ee.message}`);
                }
              }
            }
          }
        }
      } else {
        for (const file of files) {
          const url = `${baseUrl}/api/admin/import/${type}`;
          try {
            const data = await readJson(file);
            await postJson(url, token, data);
            totalImported += 1;
            console.log(`[${type}] OK -> ${path.basename(file)}`);
          } catch (e) {
            console.error(`[${type}] Échec -> ${path.basename(file)}: ${e.message}`);
          }
        }
      }
    } catch (e) {
      console.error(`[${type}] Erreur: ${e.message}`);
    }
  }

  console.log(`\nImport terminé. Éléments importés: ${totalImported}`);
}

main().catch((e) => {
  console.error('Erreur fatale:', e);
  process.exit(1);
});
