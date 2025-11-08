const express = require('express');
const router = express.Router();
const { importExercices, importExercicesFromMarkdown, importEntrainements, importEchauffements, importSituationsMatchs } = require('../controllers/import.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

// POST /api/import/exercices?dryRun=true|false
router.post('/exercices', express.json({ limit: '5mb' }), importExercices);

// POST /api/import/markdown?dryRun=true|false
// Body: { files: [{ name?: string, content: string }] }
router.post('/markdown', express.json({ limit: '10mb' }), importExercicesFromMarkdown);

// Protéger les opérations d'import par rôle admin
router.use(requireAdmin);

// POST /api/import/entrainements?dryRun=true|false
router.post('/entrainements', express.json({ limit: '10mb' }), importEntrainements);

// POST /api/import/echauffements?dryRun=true|false
router.post('/echauffements', express.json({ limit: '10mb' }), importEchauffements);

// POST /api/import/situations-matchs?dryRun=true|false
router.post('/situations-matchs', express.json({ limit: '10mb' }), importSituationsMatchs);

module.exports = router;
