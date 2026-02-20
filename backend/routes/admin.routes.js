const express = require('express');
const router = express.Router();

const { getOverview, getUsers, updateUser, createUser, getUserWorkspaces, getAllContent, getAllTags, bulkDelete, bulkDuplicate, listExercices, listEntrainements, listEchauffements, listSituationsMatchs } = require('../controllers/admin.controller');
const { exportUfm } = require('../controllers/export.controller');
const { adminListWorkspaces, adminCreateWorkspace, adminUpdateWorkspace, adminDeleteWorkspace, adminGetWorkspaceUsers, adminSetWorkspaceUsers } = require('../controllers/workspace.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { workspaceGuard } = require('../middleware/workspace.middleware');

// Toutes les routes admin sont protégées par l'authentification, le rôle ADMIN
router.use(authenticateToken, requireAdmin);

// GET /api/admin/overview
router.get('/overview', getOverview);
router.get('/all-content', workspaceGuard, getAllContent);
router.get('/all-tags', workspaceGuard, getAllTags);

// Export UFM
router.get('/export-ufm', exportUfm);

// Listes pour export
router.get('/list-exercices', listExercices);
router.get('/list-entrainements', listEntrainements);
router.get('/list-echauffements', listEchauffements);
router.get('/list-situations-matchs', listSituationsMatchs);

// Gestion des utilisateurs (admin)
router.get('/users', getUsers);
router.get('/users/:id/workspaces', getUserWorkspaces);
router.patch('/users/:id', updateUser);
router.post('/users', createUser);

// Gestion des workspaces (admin)
router.get('/workspaces', adminListWorkspaces);
router.post('/workspaces', adminCreateWorkspace);
router.put('/workspaces/:id', adminUpdateWorkspace);
router.delete('/workspaces/:id', adminDeleteWorkspace);
router.get('/workspaces/:id/users', adminGetWorkspaceUsers);
router.put('/workspaces/:id/users', adminSetWorkspaceUsers);

// Actions en masse
router.post('/bulk-delete', workspaceGuard, bulkDelete);
router.post('/bulk-duplicate', workspaceGuard, bulkDuplicate);

module.exports = router;
