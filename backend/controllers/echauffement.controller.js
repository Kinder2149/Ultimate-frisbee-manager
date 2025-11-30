const { prisma } = require('../services/prisma');

/**
 * Récupère tous les échauffements avec leurs blocs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getAllEchauffements = async (req, res, next) => {
  try {
    const echauffements = await prisma.echauffement.findMany({
      include: {
        blocs: {
          orderBy: { ordre: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(echauffements);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un échauffement spécifique par son ID avec ses blocs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getEchauffementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const echauffement = await prisma.echauffement.findUnique({
      where: { id },
      include: {
        blocs: {
          orderBy: { ordre: 'asc' }
        }
      }
    });
    
    if (!echauffement) {
      const error = new Error('Échauffement non trouvé');
      error.statusCode = 404;
      return next(error);
    }
    
    res.json(echauffement);
  } catch (error) {
    next(error);
  }
};

/**
 * Crée un nouvel échauffement avec ses blocs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.createEchauffement = async (req, res, next) => {
  try {
    const { nom, description, blocs } = req.body;
    
    const nouvelEchauffement = await prisma.echauffement.create({
      data: {
        nom,
        description,
        imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl || null),
        blocs: {
          create: (blocs || []).map((bloc, index) => ({ ...bloc, ordre: bloc.ordre || index + 1 }))
        }
      },
      include: { blocs: { orderBy: { ordre: 'asc' } } }
    });
    
    res.status(201).json(nouvelEchauffement);
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour un échauffement existant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateEchauffement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, description, blocs } = req.body;

    const echauffementMisAJour = await prisma.$transaction(async (tx) => {
      // 1. Supprimer les anciens blocs
      await tx.blocEchauffement.deleteMany({ where: { echauffementId: id } });

      // 2. Mettre à jour l'échauffement et recréer les blocs
      const updated = await tx.echauffement.update({
        where: { id },
        data: {
          nom,
          description,
          imageUrl: req.file
            ? req.file.cloudinaryUrl
            : (req.body.imageUrl !== undefined
                ? (req.body.imageUrl === '' ? null : req.body.imageUrl)
                : undefined),
          blocs: {
            create: (blocs || []).map((bloc, index) => ({ ...bloc, ordre: bloc.ordre || index + 1 }))
          }
        },
        include: { blocs: { orderBy: { ordre: 'asc' } } }
      });

      return updated;
    });

    res.json(echauffementMisAJour);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un échauffement
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteEchauffement = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.echauffement.delete({ where: { id } });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Duplique un échauffement existant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.duplicateEchauffement = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const echauffementOriginal = await prisma.echauffement.findUnique({
      where: { id },
      include: { blocs: { orderBy: { ordre: 'asc' } } }
    });
    
    if (!echauffementOriginal) {
      const error = new Error('Échauffement non trouvé');
      error.statusCode = 404;
      return next(error);
    }
    
    const echauffementDuplique = await prisma.echauffement.create({
      data: {
        nom: `${echauffementOriginal.nom} (Copie)`,
        description: echauffementOriginal.description,
        imageUrl: echauffementOriginal.imageUrl,
        blocs: {
          create: echauffementOriginal.blocs.map(bloc => ({
            ordre: bloc.ordre,
            titre: bloc.titre,
            repetitions: bloc.repetitions,
            temps: bloc.temps,
            informations: bloc.informations,
            fonctionnement: bloc.fonctionnement,
            notes: bloc.notes
          }))
        }
      },
      include: { blocs: { orderBy: { ordre: 'asc' } } }
    });
    
    res.status(201).json(echauffementDuplique);
  } catch (error) {
    next(error);
  }
};
