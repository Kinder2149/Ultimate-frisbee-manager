/**
 * Serveur principal de l'application Ultimate Frisbee Manager
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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
    
    // Vérifier correspondance exacte ou motif avec joker (*)
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const toRegex = (pattern) => {
      // Supporte des motifs simples du type https://*-domain.vercel.app ou https://sub-*.*
      const escaped = escapeRegex(pattern).replace(/\\\*/g, '.*');
      return new RegExp(`^${escaped}$`);
    };

    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin.includes('*')) {
        return toRegex(allowedOrigin).test(origin);
      }
      return allowedOrigin === origin;
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
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet()); // Sécurité HTTP de base
app.use(cors(corsOptions)); // CORS sécurisé
app.use(express.json()); // Parse les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Parse les requêtes avec formulaires
// Gérer explicitement les préflight CORS pour toutes les routes
app.options('*', cors(corsOptions));
// Servir les fichiers statiques (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route racine
app.get('/', (req, res) => {
  res.json({ message: 'API Ultimate Frisbee Manager - Bienvenue!' });
});

// Importation et initialisation des routes
const routes = require('./routes');
routes(app);

// Création des dossiers uploads s'ils n'existent pas
const uploadsDir = path.join(__dirname, 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const exercicesDir = path.join(uploadsDir, 'exercices');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Dossier uploads créé');
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  console.log('Dossier uploads/avatars créé');
}

if (!fs.existsSync(exercicesDir)) {
  fs.mkdirSync(exercicesDir, { recursive: true });
  console.log('Dossier uploads/exercices créé');
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