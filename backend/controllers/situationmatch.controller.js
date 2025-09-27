/**
 * Controller pour la gestion des situations et matchs
 * Gère : type (Match/Situation), description, tags, temps
 */
const { prisma } = require('../services/prisma');

/**
 * Récupère toutes les situations/matchs
 * @route GET /api/situations-matchs
 */
exports.getAllSituationsMatchs = async (req, res, next) => {
  try {
    const situationsMatchs = await prisma.situationMatch.findMany({
      include: { tags: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(situationsMatchs);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère une situation/match par son ID
 * @route GET /api/situations-matchs/:id
 */
exports.getSituationMatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const situationMatch = await prisma.situationMatch.findUnique({
      where: { id },
      include: { tags: true }
    });
    
    if (!situationMatch) {
      const error = new Error('Situation/match non trouvée');
      error.statusCode = 404;
      return next(error);
    }
    
    res.json(situationMatch);
  } catch (error) {
    next(error);
  }
};

/**
 * Crée une nouvelle situation/match
 * @route POST /api/situations-matchs
 */
exports.createSituationMatch = async (req, res, next) => {
  try {
    const { nom, type, description, temps, tagIds } = req.body;
    
    const nouvelleSituationMatch = await prisma.situationMatch.create({
      data: {
        nom,
        type,
        description,
        temps,
        imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl || null),
        tags: { connect: (tagIds || []).map(id => ({ id })) }
      },
      include: { tags: true }
    });
    
    res.status(201).json(nouvelleSituationMatch);
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour une situation/match existante
 * @route PUT /api/situations-matchs/:id
 */
exports.updateSituationMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, type, description, temps, tagIds } = req.body;

    const updateData = {
      nom,
      type,
      description,
      temps,
      imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl !== undefined ? req.body.imageUrl : undefined),
      tags: { set: (tagIds || []).map(id => ({ id })) }
    };

    const situationMatchMiseAJour = await prisma.situationMatch.update({
      where: { id },
      data: updateData,
      include: { tags: true }
    });
    
    res.json(situationMatchMiseAJour);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime une situation/match
 * @route DELETE /api/situations-matchs/:id
 */
exports.deleteSituationMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.situationMatch.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Duplique une situation/match existante
 * @route POST /api/situations-matchs/:id/duplicate
 */
exports.duplicateSituationMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const situationMatchOriginale = await prisma.situationMatch.findUnique({
      where: { id },
      include: { tags: true }
    });
    
    if (!situationMatchOriginale) {
      const error = new Error('Situation/match non trouvée');
      error.statusCode = 404;
      return next(error);
    }
    
    const situationMatchDupliquee = await prisma.situationMatch.create({
      data: {
        nom: situationMatchOriginale.nom ? `${situationMatchOriginale.nom} (Copie)` : `Copie de ${situationMatchOriginale.type}`,
        type: situationMatchOriginale.type,
        description: situationMatchOriginale.description,
        temps: situationMatchOriginale.temps,
        imageUrl: situationMatchOriginale.imageUrl,
        tags: { connect: situationMatchOriginale.tags.map(tag => ({ id: tag.id })) }
      },
      include: { tags: true }
    });
    
    res.status(201).json(situationMatchDupliquee);
  } catch (error) {
    next(error);
  }
};
