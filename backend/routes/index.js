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

// Routes de debug (publiques et non sensibles – ne retournent pas de secrets)
const debugRoutes = require('./debug.routes');
const workspaceRoutes = require('./workspace.routes');

// Middleware d'authentification
const { authenticateToken } = require('../middleware/auth.middleware');
const { workspaceGuard } = require('../middleware/workspace.middleware');

module.exports = (app) => {
  // Routes publiques (authentification)
  app.use('/api/auth', authRoutes);
  // Route publique de santé
  app.use('/api/health', healthRoutes);
  // Debug réseau/DB (sans Prisma)
  app.use('/api/debug', debugRoutes);

  // Routes workspaces (utilisateur et admin)
  app.use('/api/workspaces', authenticateToken, workspaceRoutes);

  // Routes protégées (nécessitent authentification et workspace actif)
  // Routes FR historiques
  app.use('/api/exercices', authenticateToken, workspaceGuard, exerciceRoutes);
  app.use('/api/tags', authenticateToken, workspaceGuard, tagRoutes);
  app.use('/api/entrainements', authenticateToken, workspaceGuard, entrainementRoutes);
  app.use('/api/echauffements', authenticateToken, workspaceGuard, echauffementRoutes);
  app.use('/api/situations-matchs', authenticateToken, workspaceGuard, situationMatchRoutes);
  app.use('/api/dashboard', authenticateToken, workspaceGuard, dashboardRoutes);
  app.use('/api/import', authenticateToken, workspaceGuard, importRoutes);

  app.use('/api/admin', adminRoutes);

  // Alias REST en EN (compatibilité avec conventions)
  app.use('/api/exercises', authenticateToken, workspaceGuard, exerciceRoutes);
  app.use('/api/trainings', authenticateToken, workspaceGuard, entrainementRoutes);
  app.use('/api/warmups', authenticateToken, workspaceGuard, echauffementRoutes);
  app.use('/api/matches', authenticateToken, workspaceGuard, situationMatchRoutes);

  // Route d'accueil de l'API
  app.get('/api', (req, res) => {
    res.json({ 
      message: 'API Ultimate Frisbee Manager - Bienvenue!',
      version: '2.0.0',
      routes: {
        exercices: '/api/exercices',
        exercises: '/api/exercises',
        tags: '/api/tags',
        entrainements: '/api/entrainements',
        trainings: '/api/trainings',
        echauffements: '/api/echauffements',
        warmups: '/api/warmups',
        situationsMatchs: '/api/situations-matchs',
        matches: '/api/matches',
        dashboard: '/api/dashboard',
        admin: '/api/admin',
        import: '/api/import'
      }
    });
  });
};