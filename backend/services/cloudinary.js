/**
 * Service de configuration pour Cloudinary
 */
const cloudinary = require('cloudinary').v2;
const config = require('../config');

// Configurer Cloudinary en utilisant la configuration centralisée
// Priorité à CLOUDINARY_URL si fournie, sinon fallback sur les variables séparées
if (config.cloudinary.url) {
  // Le SDK Cloudinary accepte une URL directe
  cloudinary.config(config.cloudinary.url);
  cloudinary.config({ secure: true });
  console.log('[Config] Cloudinary: utilisation de CLOUDINARY_URL');
} else {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  // Ne pas logguer les secrets
  console.log('[Config] Cloudinary: utilisation du triplet CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET (secure)');
}

/**
 * Vérifie la connexion Cloudinary (API Admin ping) et retourne un résultat.
 * @returns {Promise<{ ok: boolean, details?: any, error?: any }>}
 */
async function testCloudinaryConnection() {
  try {
    // api.ping nécessite l'API Admin
    const res = await cloudinary.api.ping();
    return { ok: true, details: res };
  } catch (error) {
    return { ok: false, error };
  }
}

module.exports = { cloudinary, testCloudinaryConnection };
