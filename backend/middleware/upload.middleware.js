const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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

/**
 * Crée une instance de middleware Multer configurée pour un sous-dossier spécifique.
 * @param {string} subfolder - Le sous-dossier dans 'uploads' (ex: 'echauffements', 'situations').
 * @returns {multer.Instance} - Une instance de Multer configurée.
 */
const createUploader = (subfolder) => {
  const uploadDir = path.join(__dirname, '..', 'uploads', subfolder);

  // S'assurer que le dossier de destination existe
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext)
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9-_.]+/g, '-') // Conserver les points pour les noms de fichiers complexes
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) || 'image';
      const uniqueSuffix = uuidv4();
      cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  });
};

/**
 * Gère la réponse après un upload réussi.
 * @param {string} subfolder - Le sous-dossier où l'image a été stockée.
 * @returns {Function} - Un gestionnaire de route Express.
 */
const handleUploadResponse = (subfolder) => (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier reçu.' });
  }

  const imageUrl = `/api/uploads/${subfolder}/${req.file.filename}`;
  res.status(201).json({
    message: 'Image téléchargée avec succès.',
    imageUrl: imageUrl,
  });
};

module.exports = {
  createUploader,
  handleUploadResponse,
};
