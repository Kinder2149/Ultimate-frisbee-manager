const express = require('express');
const router = express.Router();

const { getOverview, getUsers, updateUser, createUser, getAllContent, getAllTags, bulkDelete, bulkDuplicate, listExercices, listEntrainements, listEchauffements, listSituationsMatchs } = require('../controllers/admin.controller');
const { exportUfm } = require('../controllers/export.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Toutes les routes admin sont protégées
router.use(authenticateToken, requireAdmin);

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
