const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspace.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const { workspaceGuard, requireWorkspaceOwner } = require('../middleware/workspace.middleware');

// Routes utilisateur (non admin)
router.get('/me', authenticateToken, workspaceController.getMyWorkspaces);

// Routes OWNER pour la gestion de SON workspace courant (basées sur X-Workspace-Id)
router.get('/members', authenticateToken, workspaceGuard, requireWorkspaceOwner, workspaceController.ownerGetWorkspaceMembers);
router.put('/members', authenticateToken, workspaceGuard, requireWorkspaceOwner, workspaceController.ownerSetWorkspaceMembers);
router.put('/settings', authenticateToken, workspaceGuard, requireWorkspaceOwner, workspaceController.ownerUpdateWorkspaceSettings);

// Routes admin pour la gestion des workspaces
router.get('/', authenticateToken, requireAdmin, workspaceController.adminListWorkspaces);
router.post('/', authenticateToken, requireAdmin, workspaceController.adminCreateWorkspace);
router.put('/:id', authenticateToken, requireAdmin, workspaceController.adminUpdateWorkspace);
router.delete('/:id', authenticateToken, requireAdmin, workspaceController.adminDeleteWorkspace);
router.post('/:id/duplicate', authenticateToken, requireAdmin, workspaceController.adminDuplicateWorkspace);

router.get('/:id/users', authenticateToken, requireAdmin, workspaceController.adminGetWorkspaceUsers);
router.put('/:id/users', authenticateToken, requireAdmin, workspaceController.adminSetWorkspaceUsers);

module.exports = router;
