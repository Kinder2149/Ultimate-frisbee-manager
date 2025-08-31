const express = require('express');
const router = express.Router();
const { importExercices, importExercicesFromMarkdown } = require('../controllers/import.controller');

// POST /api/import/exercices?dryRun=true|false
router.post('/exercices', express.json({ limit: '5mb' }), importExercices);

// POST /api/import/markdown?dryRun=true|false
// Body: { files: [{ name?: string, content: string }] }
router.post('/markdown', express.json({ limit: '10mb' }), importExercicesFromMarkdown);

module.exports = router;
