/**
 * Routes pour les exercices
 */
const express = require('express');
const router = express.Router();
const exerciceController = require('../controllers/exercice.controller');
const { createUploader } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validation.middleware');
const { transformFormData } = require('../middleware/transform.middleware');
const { createExerciceSchema, updateExerciceSchema } = require('../validators/exercice.validator');

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     summary: Récupérer tous les exercices
 *     description: Liste tous les exercices du workspace actif avec leurs tags
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre d'exercices par page
 *     responses:
 *       200:
 *         description: Liste des exercices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/', exerciceController.getAllExercices);

/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     summary: Récupérer un exercice par ID
 *     description: Récupère les détails d'un exercice spécifique
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'exercice
 *     responses:
 *       200:
 *         description: Détails de l'exercice
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', exerciceController.getExerciceById);

/**
 * @swagger
 * /api/exercises:
 *   post:
 *     summary: Créer un nouvel exercice
 *     description: Crée un exercice avec tags et image optionnelle
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - duree
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Passes courtes en triangle
 *               description:
 *                 type: string
 *                 example: Exercice de passes courtes en triangle
 *               duree:
 *                 type: integer
 *                 example: 15
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Exercice créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', 
  createUploader('image', 'exercices'), 
  transformFormData, 
  validate(createExerciceSchema),
  exerciceController.createExercice
);

/**
 * @swagger
 * /api/exercises/{id}:
 *   put:
 *     summary: Mettre à jour un exercice
 *     description: Met à jour un exercice existant
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               duree:
 *                 type: integer
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Exercice mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put('/:id', createUploader('image', 'exercices'), transformFormData, validate(updateExerciceSchema), exerciceController.updateExercice);

/**
 * @swagger
 * /api/exercises/{id}/duplicate:
 *   post:
 *     summary: Dupliquer un exercice
 *     description: Crée une copie d'un exercice existant
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Exercice dupliqué
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/duplicate', exerciceController.duplicateExercice);

/**
 * @swagger
 * /api/exercises/{id}:
 *   delete:
 *     summary: Supprimer un exercice
 *     description: Supprime définitivement un exercice
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Exercice supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', exerciceController.deleteExercice);

module.exports = router;