const envoiService = require('../services/business/envoi.service');

/**
 * Envois d'éléments entre utilisateurs.
 * L'envoi lit l'élément dans l'espace courant (guard d'espace) ; la boîte de réception,
 * elle, ne dépend d'aucun espace : elle appartient à l'utilisateur.
 */

/** POST /api/envois — envoyer un élément à un autre utilisateur */
exports.envoyer = async (req, res, next) => {
  try {
    const body = req.body || {};
    const envoi = await envoiService.envoyer({
      famille: String(body.famille || '').trim(),
      elementId: String(body.elementId || '').trim(),
      destinataireId: String(body.destinataireId || '').trim(),
      message: body.message,
      expediteur: req.user,
      workspaceId: req.workspaceId,
    });
    res.status(201).json(envoi);
  } catch (error) {
    next(error);
  }
};

/** GET /api/envois/recus — envois en attente de ma réponse */
exports.listerRecus = async (req, res, next) => {
  try {
    res.json(await envoiService.listerRecus(req.user));
  } catch (error) {
    next(error);
  }
};

/** GET /api/envois/emis — ce que j'ai envoyé et où ça en est */
exports.listerEmis = async (req, res, next) => {
  try {
    res.json(await envoiService.listerEmis(req.user));
  } catch (error) {
    next(error);
  }
};

/** POST /api/envois/:id/accepter — body { workspaceId?, surDoublon? } */
exports.accepter = async (req, res, next) => {
  try {
    const body = req.body || {};
    const resultat = await envoiService.accepter({
      envoiId: req.params.id,
      destinataire: req.user,
      workspaceId: body.workspaceId ? String(body.workspaceId).trim() : null,
      surDoublon: body.surDoublon === 'remplacer' ? 'remplacer' : 'garder-les-deux',
    });
    res.status(201).json(resultat);
  } catch (error) {
    next(error);
  }
};

/** POST /api/envois/:id/refuser */
exports.refuser = async (req, res, next) => {
  try {
    res.json(await envoiService.refuser({ envoiId: req.params.id, destinataire: req.user }));
  } catch (error) {
    next(error);
  }
};

/** POST /api/envois/resultats-vus — j'ai vu les réponses à mes envois */
exports.marquerResultatsVus = async (req, res, next) => {
  try {
    const count = await envoiService.marquerResultatsVus(req.user);
    res.json({ marques: count });
  } catch (error) {
    next(error);
  }
};

/** GET /api/envois/destinataires — à qui je peux envoyer */
exports.listerDestinataires = async (req, res, next) => {
  try {
    res.json(await envoiService.listerDestinataires(req.user));
  } catch (error) {
    next(error);
  }
};
