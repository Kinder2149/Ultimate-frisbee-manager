const { copierElement, espacesDeDestination } = require('../services/business/copie-espace.service');

/**
 * Copie d'un élément vers un autre espace de travail.
 * Le guard d'espace a déjà vérifié l'accès à l'espace de départ ;
 * le service vérifie les droits sur l'espace d'arrivée.
 */
exports.copierVersEspace = (famille) => async (req, res, next) => {
  try {
    const cibleWorkspaceId = String((req.body && req.body.workspaceId) || '').trim();
    const { element, espaceCible } = await copierElement({
      famille,
      id: req.params.id,
      sourceWorkspaceId: req.workspaceId,
      cibleWorkspaceId,
      user: req.user,
    });
    res.status(201).json({ element, espace: { id: espaceCible.id, name: espaceCible.name } });
  } catch (error) {
    next(error);
  }
};

/**
 * Espaces vers lesquels l'utilisateur peut copier depuis l'espace courant.
 * GET /api/workspaces/destinations
 */
exports.listerDestinations = async (req, res, next) => {
  try {
    const espaces = await espacesDeDestination(req.user, req.workspaceId);
    res.json(espaces);
  } catch (error) {
    next(error);
  }
};
