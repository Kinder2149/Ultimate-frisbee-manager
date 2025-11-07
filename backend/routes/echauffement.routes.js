const express = require('express');
const router = express.Router();
const echauffementController = require('../controllers/echauffement.controller');
const { createUploader } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createEchauffementSchema, updateEchauffementSchema } = require('../validators/echauffement.validator');
const { transformFormData } = require('../middleware/transform.middleware');

// Routes pour les échauffements
router.get('/', echauffementController.getAllEchauffements);
router.get('/:id', echauffementController.getEchauffementById);

router.post('/', 
  createUploader('image', 'echauffements'), 
  transformFormData, 
  validate(createEchauffementSchema), 
  echauffementController.createEchauffement
);

router.put('/:id', 
  createUploader('image', 'echauffements'), 
  transformFormData, 
  validate(updateEchauffementSchema), 
  echauffementController.updateEchauffement
);
router.delete('/:id', echauffementController.deleteEchauffement);
router.post('/:id/duplicate', echauffementController.duplicateEchauffement);

module.exports = router;
