/**
 * Documentation Swagger pour les routes d'entraînements
 * À intégrer dans entrainement.routes.js
 */

/**
 * @swagger
 * /api/trainings:
 *   get:
 *     summary: Récupérer tous les entraînements
 *     tags: [Trainings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     responses:
 *       200:
 *         description: Liste des entraînements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Training'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/trainings/{id}:
 *   get:
 *     summary: Récupérer un entraînement par ID
 *     tags: [Trainings]
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
 *       200:
 *         description: Détails de l'entraînement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Training'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/trainings:
 *   post:
 *     summary: Créer un nouvel entraînement
 *     tags: [Trainings]
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
 *               - date
 *             properties:
 *               nom:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               objectifs:
 *                 type: string
 *               echauffementId:
 *                 type: string
 *                 format: uuid
 *               situationMatchId:
 *                 type: string
 *                 format: uuid
 *               exerciceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Entraînement créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Training'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/trainings/{id}:
 *   put:
 *     summary: Mettre à jour un entraînement
 *     tags: [Trainings]
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               objectifs:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entraînement mis à jour
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/trainings/{id}/duplicate:
 *   post:
 *     summary: Dupliquer un entraînement
 *     tags: [Trainings]
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
 *         description: Entraînement dupliqué
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/trainings/{id}:
 *   delete:
 *     summary: Supprimer un entraînement
 *     tags: [Trainings]
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
 *         description: Entraînement supprimé
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
