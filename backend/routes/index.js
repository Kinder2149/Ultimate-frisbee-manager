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

module.exports = (app) => {
  // Préfixe /api pour toutes les routes
  app.use('/api/exercices', exerciceRoutes);
  app.use('/api/tags', tagRoutes);
  
  // Routes pour les entraînements simplifiés
  app.use('/api/entrainements', entrainementRoutes);
  
  // Routes pour les échauffements
  app.use('/api/echauffements', echauffementRoutes);
  
  // Routes pour les situations/matchs
  app.use('/api/situations-matchs', situationMatchRoutes);
  
  // Routes pour le dashboard
  app.use('/api/dashboard', dashboardRoutes);
  
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
        dashboard: '/api/dashboard'
      }
    });
  });
};