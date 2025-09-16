/**
 * Service de configuration pour Cloudinary
 */
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration de Cloudinary avec les clés d'API
// Ces variables doivent être définies dans votre environnement de production (ex: Render)
// et dans votre fichier .env pour le développement local.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Toujours utiliser HTTPS
});

module.exports = { cloudinary };
