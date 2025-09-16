const multer = require('multer');
const path = require('path');
const streamifier = require('streamifier');
const { cloudinary } = require('../services/cloudinary');

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
 * Middleware pour uploader le fichier depuis la mémoire vers Cloudinary.
 * @param {string} subfolder - Le sous-dossier de destination sur Cloudinary (ex: 'avatars', 'exercices').
 */
const uploadToCloudinary = (subfolder) => (req, res, next) => {
  if (!req.file) {
    // S'il n'y a pas de fichier, on passe simplement au middleware suivant.
    // Utile pour les formulaires qui peuvent avoir ou non une image.
    return next();
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: `ultimate-frisbee-manager/${subfolder}`,
      // public_id: `custom_name`, // Optionnel: pour un nom de fichier personnalisé
    },
    (error, result) => {
      if (error) {
        console.error('Erreur Cloudinary:', error);
        return next(new Error('Erreur lors de l\'upload sur Cloudinary.'));
      }
      // Attache l'URL sécurisée et d'autres infos au fichier de la requête
      req.file.cloudinaryUrl = result.secure_url;
      req.file.cloudinaryPublicId = result.public_id;
      next();
    }
  );

  // Envoie le buffer du fichier au stream d'upload de Cloudinary
  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
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

