/**
 * Service de configuration pour Cloudinary
 */
const cloudinary = require('cloudinary').v2;
const config = require('../config');

// Configurer Cloudinary en utilisant la configuration centralisée
// Le module config a déjà validé la présence des clés nécessaires
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

module.exports = { cloudinary };
