const { prisma } = require('../services/prisma');

/**
 * Récupère tous les échauffements avec leurs blocs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getAllEchauffements = async (req, res) => {
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
    console.error('Erreur lors de la récupération des échauffements:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des échauffements', 
      details: error.message 
    });
  }
};

/**
 * Récupère un échauffement spécifique par son ID avec ses blocs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getEchauffementById = async (req, res) => {
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
      return res.status(404).json({ error: 'Échauffement non trouvé' });
    }
    
    res.json(echauffement);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'échauffement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de l\'échauffement', 
      details: error.message 
    });
  }
};

/**
 * Crée un nouvel échauffement avec ses blocs
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.createEchauffement = async (req, res) => {
  try {
    const { nom, description, blocs, imageUrl } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }
    
    // description devient optionnelle (schema Prisma: String?)
    
    const nouvelEchauffement = await prisma.echauffement.create({
      data: {
        nom,
        // Normalise une chaîne vide en null côté DB
        description: (description && String(description).trim().length > 0) ? description : null,
        imageUrl: imageUrl || null,
        blocs: blocs && blocs.length > 0 ? {
          create: blocs.map((bloc, index) => ({
            ordre: bloc.ordre || index + 1,
            titre: bloc.titre,
            repetitions: bloc.repetitions || null,
            temps: bloc.temps || null,
            informations: bloc.informations || null,
            fonctionnement: bloc.fonctionnement || null,
            notes: bloc.notes || null
          }))
        } : undefined
      },
      include: {
        blocs: {
          orderBy: { ordre: 'asc' }
        }
      }
    });
    
    res.status(201).json(nouvelEchauffement);
  } catch (error) {
    console.error('Erreur lors de la création de l\'échauffement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de l\'échauffement', 
      details: error.message 
    });
  }
};

/**
 * Met à jour un échauffement existant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateEchauffement = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, blocs, imageUrl } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }
    
    // description optionnelle
    
    // Supprimer les blocs existants
    await prisma.blocEchauffement.deleteMany({ 
      where: { echauffementId: id } 
    });
    
    const echauffementMisAJour = await prisma.echauffement.update({
      where: { id },
      data: {
        nom,
        description: (description && String(description).trim().length > 0) ? description : null,
        imageUrl: typeof imageUrl !== 'undefined' ? (imageUrl || null) : undefined,
        blocs: blocs && blocs.length > 0 ? {
          create: blocs.map((bloc, index) => ({
            ordre: bloc.ordre || index + 1,
            titre: bloc.titre,
            repetitions: bloc.repetitions || null,
            temps: bloc.temps || null,
            informations: bloc.informations || null,
            fonctionnement: bloc.fonctionnement || null,
            notes: bloc.notes || null
          }))
        } : undefined
      },
      include: {
        blocs: {
          orderBy: { ordre: 'asc' }
        }
      }
    });
    
    res.json(echauffementMisAJour);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'échauffement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de l\'échauffement', 
      details: error.message 
    });
  }
};

/**
 * Supprime un échauffement
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteEchauffement = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.echauffement.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'échauffement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression de l\'échauffement', 
      details: error.message 
    });
  }
};

/**
 * Duplique un échauffement existant
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.duplicateEchauffement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'échauffement original avec ses blocs
    const echauffementOriginal = await prisma.echauffement.findUnique({
      where: { id },
      include: {
        blocs: {
          orderBy: { ordre: 'asc' }
        }
      }
    });
    
    if (!echauffementOriginal) {
      return res.status(404).json({ error: 'Échauffement non trouvé' });
    }
    
    // Créer la copie
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
      include: {
        blocs: {
          orderBy: { ordre: 'asc' }
        }
      }
    });
    
    res.status(201).json(echauffementDuplique);
  } catch (error) {
    console.error('Erreur lors de la duplication de l\'échauffement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la duplication de l\'échauffement', 
      details: error.message 
    });
  }
};
