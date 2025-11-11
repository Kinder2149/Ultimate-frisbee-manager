const fsp = require('fs').promises;
const path = require('path');

const TYPES = ['tags','exercices','entrainements','echauffements','situations-matchs'];

function getArgValue(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  let body;
  try { body = await res.json(); } catch { body = null; }
  if (!res.ok) {
    const text = body ? JSON.stringify(body) : await res.text().catch(() => '');
    const e = new Error(`HTTP ${res.status} ${res.statusText}`);
    e.status = res.status; e.body = text; e.headers = Object.fromEntries(res.headers.entries());
    throw e;
  }
  return { data: body, headers: Object.fromEntries(res.headers.entries()), status: res.status };
}

function bold(s){ return `\x1b[1m${s}\x1b[0m`; }
function green(s){ return `\x1b[32m${s}\x1b[0m`; }
function red(s){ return `\x1b[31m${s}\x1b[0m`; }

async function main(){
  const backendRoot = path.join(__dirname, '..');
  try { if (!process.env.API_BASE_URL || !process.env.ADMIN_TOKEN) { const dotenv = require('dotenv'); dotenv.config({ path: path.join(backendRoot, '.env') }); } } catch {}

  const baseUrl = process.env.API_BASE_URL || getArgValue('baseUrl');
  let token = process.env.ADMIN_TOKEN || getArgValue('token');
  const adminEmail = process.env.ADMIN_EMAIL || getArgValue('email');
  const adminPassword = process.env.ADMIN_PASSWORD || getArgValue('password');
  const frontendOrigin = process.env.FRONTEND_ORIGIN || getArgValue('frontendOrigin');
  const doImportTest = (process.env.IMPORT_TEST || getArgValue('importTest') || 'false').toLowerCase() === 'true';
  const uploadEndpoint = process.env.UPLOAD_TEST_ENDPOINT || getArgValue('uploadEndpoint');
  const testImageUrl = process.env.TEST_IMAGE_URL || getArgValue('testImageUrl');
  const uploadBodyField = process.env.UPLOAD_BODY_FIELD || getArgValue('uploadBodyField') || 'file';

  if (!baseUrl) { console.error('API_BASE_URL manquant'); process.exit(1); }

  const results = [];
  function addResult(name, ok, details){ results.push({ name, ok, details }); }

  try {
    const health = await fetchJson(`${baseUrl}/api/health`).catch(async (e)=>{
      const res = await fetch(`${baseUrl}/api/health`).catch(()=>null);
      if (res && res.ok) return { data: null, headers: Object.fromEntries(res.headers.entries()), status: res.status };
      throw e;
    });
    addResult('Health API', true, `status ${health.status}`);
  } catch(e){ addResult('Health API', false, e.body || e.message); }

  if (!token && adminEmail && adminPassword) {
    try {
      const login = await fetchJson(`${baseUrl}/api/auth/login`, { method:'POST', headers:{ 'Content-Type':'application/json','Accept':'application/json' }, body: JSON.stringify({ email: adminEmail, password: adminPassword }) });
      const d = login.data || {};
      token = d.accessToken || d.token || (d.data && d.data.accessToken) || null;
      addResult('Auth Login', !!token, token ? 'token reçu' : 'pas de token dans la réponse');
      if (!token) throw new Error('Token manquant après login');
      const profile = await fetchJson(`${baseUrl}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
      addResult('Auth Profile', true, 'profile OK');
      if (d.refreshToken) {
        try {
          const refresh = await fetchJson(`${baseUrl}/api/auth/refresh`, { method:'POST', headers:{ 'Content-Type':'application/json','Accept':'application/json' }, body: JSON.stringify({ refreshToken: d.refreshToken }) });
          const newToken = (refresh.data && (refresh.data.accessToken || refresh.data.token)) || refresh.accessToken || refresh.token || null;
          addResult('Auth Refresh', !!newToken, newToken ? 'refresh OK' : 'refresh sans token');
          if (newToken) token = newToken;
        } catch (e) { addResult('Auth Refresh', false, e.body || e.message); }
      } else {
        addResult('Auth Refresh', false, 'refreshToken absent, test ignoré');
      }
    } catch(e) { addResult('Auth Login', false, e.body || e.message); }
  } else if (token) {
    try { await fetchJson(`${baseUrl}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }); addResult('Auth Profile', true, 'profile OK'); }
    catch(e){ addResult('Auth Profile', false, e.body || e.message); }
    addResult('Auth Login', true, 'token fourni');
    addResult('Auth Refresh', false, 'non vérifié');
  } else {
    addResult('Auth Login', false, 'ni token ni email/password fournis');
    addResult('Auth Profile', false, 'non vérifié');
    addResult('Auth Refresh', false, 'non vérifié');
  }

  const counts = {};
  for (const type of TYPES) {
    try {
      const r = await fetchJson(`${baseUrl}/api/admin/list-${type}`, { headers: { Authorization: `Bearer ${token}` } });
      const list = Array.isArray(r.data) ? r.data : [];
      counts[type] = list.length;
      addResult(`CRUD List ${type}`, true, `${list.length} éléments`);
    } catch(e){ addResult(`CRUD List ${type}`, false, e.body || e.message); }
  }

  for (const type of TYPES.filter(t => t !== 'tags')) {
    try {
      const r = await fetchJson(`${baseUrl}/api/admin/list-${type}`, { headers: { Authorization: `Bearer ${token}` } });
      const list = Array.isArray(r.data) ? r.data : [];
      const id = list && list.length ? (typeof list[0]==='object' ? (list[0].id ?? list[0]._id ?? list[0].uuid ?? list[0].slug) : list[0]) : null;
      if (!id) { addResult(`Export ${type}`, false, 'aucun id'); continue; }
      const e1 = await fetchJson(`${baseUrl}/api/admin/export-ufm?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
      const ok = e1.data && typeof e1.data === 'object';
      addResult(`Export ${type}`, !!ok, ok ? 'export OK' : 'export vide');
    } catch(e){ addResult(`Export ${type}`, false, e.body || e.message); }
  }

  if (doImportTest) {
    for (const type of TYPES.filter(t => t !== 'tags')) {
      try {
        const r = await fetchJson(`${baseUrl}/api/admin/list-${type}`, { headers: { Authorization: `Bearer ${token}` } });
        const list = Array.isArray(r.data) ? r.data : [];
        const id = list && list.length ? (typeof list[0]==='object' ? (list[0].id ?? list[0]._id ?? list[0].uuid ?? list[0].slug) : list[0]) : null;
        if (!id) { addResult(`Import ${type}`, false, 'aucun id'); continue; }
        const ex = await fetchJson(`${baseUrl}/api/admin/export-ufm?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
        const url = `${baseUrl}/api/admin/import/${type}`;
        const imp = await fetchJson(url, { method:'POST', headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json', 'Accept':'application/json' }, body: JSON.stringify(ex.data) });
        const ok = !!imp && typeof imp === 'object';
        addResult(`Import ${type}`, !!ok, 'import OK');
      } catch(e){ addResult(`Import ${type}`, false, e.body || e.message); }
    }
  } else {
    addResult('Import Test', false, 'désactivé (IMPORT_TEST=false)');
  }

  if (frontendOrigin) {
    try {
      const res = await fetch(`${baseUrl}/api/health`, { headers: { 'Origin': frontendOrigin } });
      const allow = res.headers.get('access-control-allow-origin');
      const ok = allow === '*' || (allow && allow.toLowerCase() === frontendOrigin.toLowerCase());
      addResult('CORS Front→Back', !!ok, `Access-Control-Allow-Origin=${allow || 'n/a'}`);
    } catch(e){ addResult('CORS Front→Back', false, e.message); }
  } else {
    addResult('CORS Front→Back', false, 'FRONTEND_ORIGIN non fourni');
  }

  if (uploadEndpoint && testImageUrl) {
    try {
      const body = {}; body[uploadBodyField] = testImageUrl;
      const r = await fetchJson(`${baseUrl}${uploadEndpoint}`, { method:'POST', headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json', 'Accept':'application/json' }, body: JSON.stringify(body) });
      const url = (r.data && (r.data.secure_url || r.data.url)) || r.secure_url || r.url;
      addResult('Cloudinary Upload', !!url, url ? 'upload OK' : 'pas d’URL');
      if (url) {
        try { const head = await fetch(url, { method:'HEAD' }); addResult('Cloudinary Download', head.ok, head.ok ? 'download OK' : `HTTP ${head.status}`); }
        catch(e){ addResult('Cloudinary Download', false, e.message); }
      } else { addResult('Cloudinary Download', false, 'URL manquante'); }
    } catch(e){ addResult('Cloudinary Upload', false, e.body || e.message); addResult('Cloudinary Download', false, 'non vérifié'); }
  } else {
    addResult('Cloudinary Upload', false, 'UPLOAD_TEST_ENDPOINT/TEST_IMAGE_URL non fournis');
    addResult('Cloudinary Download', false, 'non vérifié');
  }

  const allCounts = Object.entries(counts).map(([k,v])=>`${k}:${v}`).join(', ');
  addResult('DB Supabase données présentes', Object.values(counts).some(v=>v>0), allCounts || '0 éléments');

  console.log('\n' + bold('Résumé des vérifications')); 
  for (const r of results) {
    const icon = r.ok ? '✅' : '❌';
    const color = r.ok ? green : red;
    console.log(`${icon} ${color(r.name)} - ${r.details || ''}`);
  }

  const okAll = results.every(r=>r.ok || ['Import Test','Auth Refresh','Cloudinary Download','Cloudinary Upload','CORS Front→Back'].includes(r.name));
  process.exit(okAll ? 0 : 1);
}

main().catch((e)=>{ console.error('Erreur fatale:', e); process.exit(1); });
