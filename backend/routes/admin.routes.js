const express = require('express');
const router = express.Router();

const { getOverview, getUsers, updateUser, createUser } = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Toutes les routes admin sont protégées
router.use(authenticateToken, requireAdmin);

// GET /api/admin/overview
router.get('/overview', getOverview);

// Gestion des utilisateurs (admin)
router.get('/users', getUsers);
router.patch('/users/:id', updateUser);
router.post('/users', createUser);

module.exports = router;
