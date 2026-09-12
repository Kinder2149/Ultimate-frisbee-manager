const express = require('express');
const router = express.Router();
const envoiController = require('../controllers/envoi.controller');
const { workspaceGuard } = require('../middleware/workspace.middleware');

// Boîte de réception et suivi : rattachés à l'utilisateur, pas à un espace
router.get('/recus', envoiController.listerRecus);
router.get('/emis', envoiController.listerEmis);
router.get('/destinataires', envoiController.listerDestinataires);
router.post('/resultats-vus', express.json({ limit: '1mb' }), envoiController.marquerResultatsVus);

// Décision du destinataire : l'espace d'arrivée est choisi dans le corps de la requête
router.post('/:id/accepter', express.json({ limit: '1mb' }), envoiController.accepter);
router.post('/:id/refuser', express.json({ limit: '1mb' }), envoiController.refuser);

// Envoi : l'élément est lu dans l'espace courant
router.post('/', workspaceGuard, express.json({ limit: '1mb' }), envoiController.envoyer);

module.exports = router;
