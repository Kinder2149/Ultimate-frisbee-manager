const express = require('express');
const router = express.Router();
const { importExercices, importExercicesFromMarkdown, importEntrainements, importEchauffements, importSituationsMatchs } = require('../controllers/import.controller');
const { requireAdmin } = require('../middleware/auth.middleware');
const { requireWorkspaceWrite } = require('../middleware/workspace.middleware');

// Contrôle d'exposition des imports "publics" par variable d'environnement
const allowPublicImport = String(process.env.ALLOW_PUBLIC_IMPORT || 'false').toLowerCase() === 'true';

// POST /api/import/exercices?dryRun=true|false
// POST /api/import/markdown?dryRun=true|false (Body: { files: [{ name?: string, content: string }] })
if (allowPublicImport) {
  router.post('/exercices', express.json({ limit: '5mb' }), requireWorkspaceWrite, importExercices);
  router.post('/markdown', express.json({ limit: '10mb' }), requireWorkspaceWrite, importExercicesFromMarkdown);
}

// Protéger les opérations d'import par rôle admin
router.use(requireAdmin);

// Si les imports "publics" sont désactivés, on les expose ici mais protégés par admin
if (!allowPublicImport) {
  router.post('/exercices', express.json({ limit: '5mb' }), importExercices);
  router.post('/markdown', express.json({ limit: '10mb' }), importExercicesFromMarkdown);
}

// POST /api/import/entrainements?dryRun=true|false
router.post('/entrainements', express.json({ limit: '10mb' }), importEntrainements);

// POST /api/import/echauffements?dryRun=true|false
router.post('/echauffements', express.json({ limit: '10mb' }), importEchauffements);

// POST /api/import/situations-matchs?dryRun=true|false
router.post('/situations-matchs', express.json({ limit: '10mb' }), importSituationsMatchs);

module.exports = router;
