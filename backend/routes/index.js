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

// Middleware d'authentification
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (app) => {
  // Routes publiques (authentification)
  app.use('/api/auth', authRoutes);
  // Route publique de santé
  app.use('/api/health', healthRoutes);
  
  // Routes protégées (nécessitent authentification)
  // Routes FR historiques
  app.use('/api/exercices', authenticateToken, exerciceRoutes);
  app.use('/api/tags', authenticateToken, tagRoutes);
  app.use('/api/entrainements', authenticateToken, entrainementRoutes);
  app.use('/api/echauffements', authenticateToken, echauffementRoutes);
  app.use('/api/situations-matchs', authenticateToken, situationMatchRoutes);
  app.use('/api/dashboard', authenticateToken, dashboardRoutes);
  app.use('/api/import', authenticateToken, importRoutes);
  app.use('/api/admin', adminRoutes);

  // Alias REST en EN (compatibilité avec conventions)
  app.use('/api/exercises', authenticateToken, exerciceRoutes);
  app.use('/api/trainings', authenticateToken, entrainementRoutes);
  app.use('/api/warmups', authenticateToken, echauffementRoutes);
  app.use('/api/matches', authenticateToken, situationMatchRoutes);
  
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