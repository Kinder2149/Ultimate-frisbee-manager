/**
 * Configuration centralisée des routes - Version simplifiée
 */
const exerciceRoutes = require('./exercice.routes');
const tagRoutes = require('./tag.routes');

// Routes pour les entraînements unifiés
const entrainementRoutes = require('./entrainement.routes');

// Routes pour les échauffements
const echauffementRoutes = require('./echauffement.routes');

// Routes pour les situations/matchs
const situationMatchRoutes = require('./situationmatch.routes');

// Routes pour le dashboard
const dashboardRoutes = require('./dashboard.routes');

// Routes d'authentification
const authRoutes = require('./auth.routes');

// Routes admin
const adminRoutes = require('./admin.routes');

// Routes d'import
const importRoutes = require('./import.routes');

// Route de santé (publique)
const healthRoutes = require('./health.routes');
const workspaceRoutes = require('./workspace.routes');

// Routes de synchronisation
const syncRoutes = require('./sync.routes');

// Middleware d'authentification
const { authenticateToken } = require('../middleware/auth.middleware');
const { workspaceGuard, baseMutationGuard } = require('../middleware/workspace.middleware');

module.exports = (app) => {
  // Routes publiques (authentification)
  app.use('/api/auth', authRoutes);
  // Route publique de santé
  app.use('/api/health', healthRoutes);

  // Routes workspaces (utilisateur et admin)
  app.use('/api/workspaces', authenticateToken, workspaceRoutes);

  // Routes protégées (nécessitent authentification et workspace actif)
  // Convention anglaise uniquement
  app.use('/api/exercises', authenticateToken, workspaceGuard, baseMutationGuard, exerciceRoutes);
  app.use('/api/tags', authenticateToken, workspaceGuard, baseMutationGuard, tagRoutes);
  app.use('/api/trainings', authenticateToken, workspaceGuard, baseMutationGuard, entrainementRoutes);
  app.use('/api/warmups', authenticateToken, workspaceGuard, baseMutationGuard, echauffementRoutes);
  app.use('/api/matches', authenticateToken, workspaceGuard, baseMutationGuard, situationMatchRoutes);
  app.use('/api/dashboard', authenticateToken, workspaceGuard, baseMutationGuard, dashboardRoutes);
  app.use('/api/import', authenticateToken, workspaceGuard, baseMutationGuard, importRoutes);

  app.use('/api/admin', adminRoutes);

  // Route d'accueil de l'API
  app.get('/api', (req, res) => {
    res.json({ 
      message: 'API Ultimate Frisbee Manager',
      version: '2.0.0',
      routes: {
        exercises: '/api/exercises',
        trainings: '/api/trainings',
        warmups: '/api/warmups',
        matches: '/api/matches',
        tags: '/api/tags',
        dashboard: '/api/dashboard',
        admin: '/api/admin',
        import: '/api/import',
        workspaces: '/api/workspaces',
        sync: '/api/sync'
      }
    });
  });
};