const express = require('express');
const dns = require('dns').promises;
const net = require('net');
const url = require('url');

const router = express.Router();

// GET /api/debug/db-net
// Test bas-niveau DNS + TCP vers la cible DB depuis le pod Render (sans Prisma)
// Query params optionnels: host, port (sinon dérivés de process.env.DATABASE_URL)
router.get('/db-net', async (req, res) => {
  const started = Date.now();
  let targetHost = req.query.host;
  let targetPort = req.query.port ? Number(req.query.port) : undefined;
  let parsedFromEnv = false;

  try {
    if (!targetHost || !targetPort) {
      const raw = process.env.DATABASE_URL || '';
      const u = new url.URL(raw);
      // u.host inclut possiblement :port, on prend séparément
      targetHost = targetHost || u.hostname;
      targetPort = targetPort || Number(u.port || (u.protocol.startsWith('postgres') ? 5432 : 0));
      parsedFromEnv = true;
    }
  } catch (e) {
    return res.status(400).json({ error: 'invalid_database_url', detail: e.message });
  }

  if (!targetHost || !targetPort) {
    return res.status(400).json({ error: 'missing_target', detail: 'host/port requis (via query ou DATABASE_URL)' });
  }

  const result = { targetHost, targetPort, parsedFromEnv, steps: [] };

  // 1) DNS lookup (A/AAAA)
  try {
    const lookupStart = Date.now();
    const addrs = await dns.lookup(targetHost, { all: true });
    result.steps.push({ step: 'dns.lookup', ms: Date.now() - lookupStart, addresses: addrs });
  } catch (e) {
    result.steps.push({ step: 'dns.lookup', error: e.message });
  }

  // 2) TCP connect
  const connectStart = Date.now();
  await new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    socket.setTimeout(6000);
    socket.once('connect', () => {
      result.steps.push({ step: 'net.connect', ms: Date.now() - connectStart, connected: true });
      settled = true;
      socket.destroy();
      resolve();
    });
    socket.once('timeout', () => {
      if (!settled) {
        result.steps.push({ step: 'net.connect', ms: Date.now() - connectStart, connected: false, error: 'timeout' });
        settled = true;
        socket.destroy();
        resolve();
      }
    });
    socket.once('error', (err) => {
      if (!settled) {
        result.steps.push({ step: 'net.connect', ms: Date.now() - connectStart, connected: false, error: err.message });
        settled = true;
        socket.destroy();
        resolve();
      }
    });
    socket.connect(targetPort, targetHost);
  });

  result.durationMs = Date.now() - started;
  const ok = result.steps.some(s => s.step === 'net.connect' && s.connected);
  return res.status(ok ? 200 : 503).json(result);
});

module.exports = router;
