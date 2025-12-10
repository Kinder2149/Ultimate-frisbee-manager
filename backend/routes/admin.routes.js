const express = require('express');
const router = express.Router();

const { getOverview, getUsers, updateUser, createUser, getAllContent, getAllTags, bulkDelete, bulkDuplicate, listExercices, listEntrainements, listEchauffements, listSituationsMatchs } = require('../controllers/admin.controller');
const { exportUfm } = require('../controllers/export.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { workspaceGuard } = require('../middleware/workspace.middleware');

// Toutes les routes admin sont protégées par l'authentification, le rôle ADMIN
// et, désormais, par le contexte de workspace courant (via X-Workspace-Id).
router.use(authenticateToken, requireAdmin, workspaceGuard);

// GET /api/admin/overview
router.get('/overview', getOverview);
router.get('/all-content', getAllContent);
router.get('/all-tags', getAllTags);

// Export UFM
router.get('/export-ufm', exportUfm);

// Listes pour export
router.get('/list-exercices', listExercices);
router.get('/list-entrainements', listEntrainements);
router.get('/list-echauffements', listEchauffements);
router.get('/list-situations-matchs', listSituationsMatchs);

// Gestion des utilisateurs (admin)
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.post('/users', createUser);

// Actions en masse
router.post('/bulk-delete', bulkDelete);
router.post('/bulk-duplicate', bulkDuplicate);

module.exports = router;
