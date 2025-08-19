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

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3002; // Port modifié pour éviter les conflits EADDRINUSE

// Configuration CORS pour production et développement
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:4200']; // Fallback pour développement
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
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

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log(`Accessible localement sur http://localhost:${PORT}`);
});

// Gestion de la fermeture propre du serveur
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Connexion à la base de données fermée');
  process.exit(0);
});