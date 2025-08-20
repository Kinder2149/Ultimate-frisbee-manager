/**
 * Serveur principal de l'application Ultimate Frisbee Manager
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Configuration des variables d'environnement
dotenv.config();

// Initialisation de Prisma Client
const prisma = new PrismaClient();

// Import du script d'initialisation
const { initializeDatabase } = require('./scripts/init-database');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3002; // Port modifié pour éviter les conflits EADDRINUSE

// Configuration CORS pour production et développement
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(url => url.trim())
      : ['http://localhost:4200']; // Fallback pour développement
    
    console.log(`🔍 CORS Check - Origin: ${origin}`);
    console.log(`🔍 CORS Check - Allowed origins: ${allowedOrigins.join(', ')}`);
    
    // Vérifier correspondance exacte ou pattern Vercel
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Correspondance exacte
      if (allowedOrigin === origin) return true;
      
      // Pattern Vercel: ultimate-frisbee-manager-*.vercel.app
      if (allowedOrigin.includes('vercel.app') && origin.includes('vercel.app')) {
        const basePattern = 'ultimate-frisbee-manager';
        return origin.includes(basePattern) && origin.endsWith('.vercel.app');
      }
      
      return false;
    });
    
    if (isAllowed) {
      console.log(`✅ CORS autorisé pour: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS refusé pour: ${origin}`);
      console.log(`📋 Origines autorisées: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS: Origin ${origin} non autorisé`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions)); // CORS sécurisé
app.use(express.json()); // Parse les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Parse les requêtes avec formulaires

// Route racine
app.get('/', (req, res) => {
  res.json({ message: 'API Ultimate Frisbee Manager - Bienvenue!' });
});

// Importation et initialisation des routes
const routes = require('./routes');
routes(app);

// Création du dossier uploads s'il n'existe pas
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
  console.log('Dossier uploads créé');
}

// Démarrage du serveur avec initialisation automatique
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log(`Accessible localement sur http://localhost:${PORT}`);
  
  // Initialiser la base de données en production
  if (process.env.NODE_ENV === 'production') {
    await initializeDatabase();
  }
});

// Gestion de la fermeture propre du serveur
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Connexion à la base de données fermée');
  process.exit(0);
});