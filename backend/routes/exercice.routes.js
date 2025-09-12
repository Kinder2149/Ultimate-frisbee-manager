/**
 * Routes pour les exercices
 */
const express = require('express');
const router = express.Router();
const exerciceController = require('../controllers/exercice.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// GET /api/exercices - Récupérer tous les exercices avec leurs tags
router.get('/', exerciceController.getAllExercices);

// GET /api/exercices/:id - Récupérer un exercice par son ID
router.get('/:id', exerciceController.getExerciceById);

// POST /api/exercices - Ajouter un nouvel exercice avec des tags
router.post('/', exerciceController.createExercice);

// PUT /api/exercices/:id - Mettre à jour un exercice
router.put('/:id', exerciceController.updateExercice);

// POST /api/exercices/:id/duplicate - Dupliquer un exercice
router.post('/:id/duplicate', exerciceController.duplicateExercice);

// DELETE /api/exercices/:id - Supprimer un exercice
router.delete('/:id', exerciceController.deleteExercice);

// ------------------------------------------------------------
// Upload d'image pour les exercices
// POST /api/exercices/upload-image
// ------------------------------------------------------------

// S'assurer que le dossier de destination existe
const uploadsBaseDir = path.join(__dirname, '..', 'uploads');
const exercicesUploadDir = path.join(uploadsBaseDir, 'exercices');
if (!fs.existsSync(exercicesUploadDir)) {
  fs.mkdirSync(exercicesUploadDir, { recursive: true });
}

// Configuration Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, exercicesUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) || 'image';
    const unique = uuidv4();
    cb(null, `${base}-${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Extension de fichier non autorisée'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Endpoint d'upload
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    const publicUrl = `/api/uploads/exercices/${req.file.filename}`;
    return res.status(201).json({
      message: 'Image téléchargée avec succès',
      imageUrl: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  } catch (err) {
    console.error('Erreur upload image exercice:', err);
    return res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image' });
  }
});

module.exports = router;