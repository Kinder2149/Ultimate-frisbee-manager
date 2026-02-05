const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspace.controller');
const { requireAdmin } = require('../middleware/auth.middleware');
const { workspaceGuard, baseMutationGuard, requireWorkspaceManager } = require('../middleware/workspace.middleware');

// Routes utilisateur (non admin)
router.get('/me', workspaceController.getMyWorkspaces);
router.get('/:id/preload', workspaceController.preloadWorkspace);

// Routes OWNER pour la gestion de SON workspace courant (basées sur X-Workspace-Id)
router.get('/members', workspaceGuard, requireWorkspaceManager, workspaceController.ownerGetWorkspaceMembers);
router.put('/members', workspaceGuard, baseMutationGuard, requireWorkspaceManager, workspaceController.ownerSetWorkspaceMembers);
router.put('/settings', workspaceGuard, baseMutationGuard, requireWorkspaceManager, workspaceController.ownerUpdateWorkspaceSettings);

// Routes admin pour la gestion des workspaces
router.get('/', requireAdmin, workspaceController.adminListWorkspaces);
router.post('/', requireAdmin, workspaceController.adminCreateWorkspace);
router.put('/:id', requireAdmin, workspaceController.adminUpdateWorkspace);
router.delete('/:id', requireAdmin, workspaceController.adminDeleteWorkspace);
router.post('/:id/duplicate', requireAdmin, workspaceController.adminDuplicateWorkspace);

router.get('/:id/users', requireAdmin, workspaceController.adminGetWorkspaceUsers);
router.put('/:id/users', requireAdmin, workspaceController.adminSetWorkspaceUsers);

module.exports = router;
