/**
 * Serveur principal de l'application Ultimate Frisbee Manager
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { prisma } = require('./services/prisma');

// Configuration des variables d'environnement
dotenv.config();

// Prisma Client est initialisé via le service singleton

// Import du script d'initialisation
const { initializeDatabase } = require('./scripts/init-database');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3002; // Port modifié pour éviter les conflits EADDRINUSE

// Faire confiance au proxy (Render/NGINX) pour utiliser X-Forwarded-* correctement
// Nécessaire pour express-rate-limit afin d'identifier l'IP cliente derrière le proxy
app.set('trust proxy', 1);

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
// Important: autoriser l'affichage cross-origin des images (ex: frontend sur Vercel)
// en définissant Cross-Origin-Resource-Policy: cross-origin
app.use(
  '/api/uploads',
  cors(corsOptions), // Appliquer CORS spécifiquement pour les médias
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

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
const echauffementsDir = path.join(uploadsDir, 'echauffements');
const situationsDir = path.join(uploadsDir, 'situations');
const entrainementsDir = path.join(uploadsDir, 'entrainements');
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

if (!fs.existsSync(echauffementsDir)) {
  fs.mkdirSync(echauffementsDir, { recursive: true });
  console.log('Dossier uploads/echauffements créé');
}

if (!fs.existsSync(situationsDir)) {
  fs.mkdirSync(situationsDir, { recursive: true });
  console.log('Dossier uploads/situations créé');
}

if (!fs.existsSync(entrainementsDir)) {
  fs.mkdirSync(entrainementsDir, { recursive: true });
  console.log('Dossier uploads/entrainements créé');
}

// Démarrage du serveur avec initialisation automatique
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log(`Accessible localement sur http://localhost:${PORT}`);
  
  // Tentative de connexion DB au démarrage pour échouer tôt si injoignable
  try {
    console.log('🔌 Test de connexion à la base de données...');
    await prisma.$connect();
    // Ping léger
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion DB OK');
  } catch (err) {
    console.error('❌ Connexion DB échouée au démarrage:', err?.message || err);
    console.error('Vérifiez DATABASE_URL et l\'accessibilité réseau (port 5432, SSL).');
  }

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