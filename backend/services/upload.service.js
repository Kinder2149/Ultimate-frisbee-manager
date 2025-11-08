/**
 * Service centralisé pour les opérations Cloudinary (upload, delete, url)
 */
const streamifier = require('streamifier');
const { cloudinary } = require('./cloudinary');

/**
 * Upload d'un buffer vers Cloudinary dans un sous-dossier.
 * @param {Buffer} buffer
 * @param {string} folder
 * @param {object} [options]
 * @returns {Promise<{ secure_url: string, public_id: string }>} 
 */
async function uploadBuffer(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Suppression d'une ressource par public_id.
 * @param {string} publicId
 * @returns {Promise<any>}
 */
async function deleteByPublicId(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

/**
 * Génère une URL (transformation optionnelle) à partir d'un public_id.
 * @param {string} publicId
 * @param {object} [options]
 * @returns {string}
 */
function getUrl(publicId, options = {}) {
  return cloudinary.url(publicId, { secure: true, ...options });
}

module.exports = {
  uploadBuffer,
  deleteByPublicId,
  getUrl,
};
