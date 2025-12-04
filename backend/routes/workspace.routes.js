const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspace.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Routes utilisateur (non admin)
router.get('/me', authenticateToken, workspaceController.getMyWorkspaces);

// Routes admin pour la gestion des workspaces
router.get('/', authenticateToken, requireAdmin, workspaceController.adminListWorkspaces);
router.post('/', authenticateToken, requireAdmin, workspaceController.adminCreateWorkspace);
router.put('/:id', authenticateToken, requireAdmin, workspaceController.adminUpdateWorkspace);
router.delete('/:id', authenticateToken, requireAdmin, workspaceController.adminDeleteWorkspace);

router.get('/:id/users', authenticateToken, requireAdmin, workspaceController.adminGetWorkspaceUsers);
router.put('/:id/users', authenticateToken, requireAdmin, workspaceController.adminSetWorkspaceUsers);

module.exports = router;
