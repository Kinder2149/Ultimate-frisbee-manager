module.exports = {
  // Fichiers à exécuter AVANT chaque suite de tests pour configurer l'environnement
  setupFiles: ['./tests/load-env.js'],

  // Script à exécuter UNE SEULE FOIS avant toutes les suites de tests
  globalSetup: './tests/setup.js',
  


  // Indique à Jest de rechercher les fichiers de test dans tout le projet
  testEnvironment: 'node',

  // Dossiers à ignorer lors de la recherche de tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/dist/'
  ],

  // Augmente le timeout par défaut pour les tests qui peuvent être longs (ex: interaction DB)
  testTimeout: 15000,

  // Affiche un rapport de couverture de code après les tests
  collectCoverage: true,

  // Spécifie où générer le rapport de couverture
  coverageDirectory: 'coverage',

  // Exclut certains fichiers de l'analyse de couverture
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/prisma/',
    '/validators/', // Les validateurs sont testés implicitement via les routes
    'server.js', // Le point d'entrée principal
    'app.js' // La configuration de l'app Express
  ]
};
