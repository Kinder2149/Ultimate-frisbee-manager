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

// Middleware
app.use(cors()); // Permet les requêtes CORS
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
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

// Gestion de la fermeture propre du serveur
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Connexion à la base de données fermée');
  process.exit(0);
});