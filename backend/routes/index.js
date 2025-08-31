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
  app.use('/api/exercices', authenticateToken, exerciceRoutes);
  app.use('/api/tags', authenticateToken, tagRoutes);
  app.use('/api/entrainements', authenticateToken, entrainementRoutes);
  app.use('/api/echauffements', authenticateToken, echauffementRoutes);
  app.use('/api/situations-matchs', authenticateToken, situationMatchRoutes);
  app.use('/api/dashboard', authenticateToken, dashboardRoutes);
  app.use('/api/import', authenticateToken, importRoutes);
  app.use('/api/admin', adminRoutes);
  
  // Route d'accueil de l'API
  app.get('/api', (req, res) => {
    res.json({ 
      message: 'API Ultimate Frisbee Manager - Bienvenue!',
      version: '2.0.0',
      routes: {
        exercices: '/api/exercices',
        tags: '/api/tags',
        entrainements: '/api/entrainements',
        echauffements: '/api/echauffements',
        situationsMatchs: '/api/situations-matchs',
        dashboard: '/api/dashboard',
        admin: '/api/admin',
        import: '/api/import'
      }
    });
  });
};