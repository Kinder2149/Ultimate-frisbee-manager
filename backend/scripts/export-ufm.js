const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const TYPES = [
  'exercices',
  'entrainements',
  'echauffements',
  'situations-matchs',
];

function getArgValue(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

function extractIds(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    if (item == null) return undefined;
    if (typeof item === 'string' || typeof item === 'number') return item;
    if (typeof item === 'object') {
      if ('id' in item) return item.id;
      if ('_id' in item) return item._id;
    }
    return undefined;
  }).filter((v) => v !== undefined);
}

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url} -> ${text}`);
  }
  return res.json();
}

async function main() {
  const token = process.env.ADMIN_TOKEN || getArgValue('token');
  const baseUrl = process.env.API_BASE_URL || getArgValue('baseUrl');

  if (!token) {
    console.error('Erreur: token manquant. Fournissez ADMIN_TOKEN ou --token=...');
    process.exit(1);
  }
  if (!baseUrl) {
    console.error('Erreur: API base URL manquante. Fournissez API_BASE_URL ou --baseUrl=...');
    process.exit(1);
  }

  const exportsDir = path.join(__dirname, '..', 'exports');
  await ensureDir(exportsDir);

  console.log(`Début export UFM -> dossier: ${exportsDir}`);
  console.log(`Types: ${TYPES.join(', ')}`);

  let totalFiles = 0;

  for (const type of TYPES) {
    try {
      const listUrl = `${baseUrl}/api/admin/list-${type}`;
      console.log(`\n[${type}] Récupération des IDs via ${listUrl}`);
      const list = await fetchJson(listUrl, token);
      const ids = extractIds(list);
      console.log(`[${type}] ${ids.length} élément(s) trouvé(s)`);

      for (const id of ids) {
        const exportUrl = `${baseUrl}/api/admin/export-ufm?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
        const filename = `${type}-${id}.ufm.json`;
        const outPath = path.join(exportsDir, filename);
        try {
          console.log(`[${type}] Export id=${id} ...`);
          const data = await fetchJson(exportUrl, token);
          await fsp.writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');
          totalFiles += 1;
          console.log(`[${type}] OK -> ${filename}`);
        } catch (e) {
          console.error(`[${type}] Échec export id=${id}: ${e.message}`);
        }
      }
    } catch (e) {
      console.error(`[${type}] Échec récupération de la liste: ${e.message}`);
    }
  }

  console.log(`\nExport terminé. Fichiers générés: ${totalFiles}`);
}

main().catch((e) => {
  console.error('Erreur fatale:', e);
  process.exit(1);
});
