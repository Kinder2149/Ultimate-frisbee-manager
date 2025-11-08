const multer = require('multer');
const path = require('path');
const { uploadBuffer } = require('../services/upload.service');

/**
 * Filtre les fichiers pour n'accepter que les images.
 */
const imageFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Extension de fichier non autorisée. Seules les images sont acceptées.'), false);
  }
};

// Configure multer pour utiliser le stockage en mémoire
const memoryUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

/**
 * Middleware pour uploader le fichier depuis la mémoire vers Cloudinary via le service centralisé.
 * @param {string} subfolder - Le sous-dossier de destination sur Cloudinary (ex: 'avatars', 'exercices').
 */
const uploadToCloudinary = (subfolder) => async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  try {
    const folder = `ultimate-frisbee-manager/${subfolder}`;
    const { secure_url, public_id } = await uploadBuffer(req.file.buffer, folder);
    req.file.cloudinaryUrl = secure_url;
    req.file.cloudinaryPublicId = public_id;
    return next();
  } catch (error) {
    console.error('Erreur Cloudinary:', error);
    return next(new Error('Erreur lors de l\'upload sur Cloudinary.'));
  }
};

/**
 * Crée une chaîne de middlewares pour l'upload.
 * 1. Multer gère le fichier en mémoire.
 * 2. uploadToCloudinary envoie le fichier à Cloudinary.
 * @param {string} fieldName - Le nom du champ du formulaire contenant le fichier.
 * @param {string} subfolder - Le sous-dossier de destination sur Cloudinary.
 */
const createUploader = (fieldName, subfolder) => {
  return [
    memoryUploader.single(fieldName), // 1. Multer
    uploadToCloudinary(subfolder),    // 2. Cloudinary
  ];
};

module.exports = {
  createUploader,
};

