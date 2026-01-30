const { prisma } = require('../prisma');

/**
 * Service métier pour la gestion des échauffements
 * Contient toute la logique métier liée aux échauffements et leurs blocs
 */

/**
 * Récupérer tous les échauffements avec pagination
 * @param {string} workspaceId - ID du workspace
 * @param {Object} pagination - Options de pagination { page, limit }
 * @returns {Promise<Object>} Résultat paginé { data, total, page, limit, totalPages }
 */
async function getAllEchauffements(workspaceId, pagination = {}) {
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 50;
  const skip = (page - 1) * limit;

  const total = await prisma.echauffement.count({
    where: { workspaceId }
  });

  const echauffements = await prisma.echauffement.findMany({
    where: { workspaceId },
    include: {
      blocs: {
        orderBy: { ordre: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  return {
    data: echauffements,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Récupérer un échauffement par son ID
 * @param {string} id - ID de l'échauffement
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<Object|null>} Échauffement trouvé ou null
 */
async function getEchauffementById(id, workspaceId) {
  const echauffement = await prisma.echauffement.findFirst({
    where: { id, workspaceId },
    include: {
      blocs: {
        orderBy: { ordre: 'asc' }
      }
    }
  });

  return echauffement;
}

/**
 * Créer un nouvel échauffement avec ses blocs
 * @param {Object} data - Données de l'échauffement { nom, description, blocs, imageUrl }
 * @param {string} workspaceId - ID du workspace
 * @param {Object} file - Fichier uploadé (optionnel)
 * @returns {Promise<Object>} Échauffement créé
 */
async function createEchauffement(data, workspaceId, file = null) {
  const { nom, description, blocs, imageUrl } = data;

  const nouvelEchauffement = await prisma.echauffement.create({
    data: {
      nom,
      description,
      imageUrl: file ? file.cloudinaryUrl : (imageUrl || null),
      workspaceId,
      blocs: {
        create: (blocs || []).map((bloc, index) => ({ ...bloc, ordre: bloc.ordre || index + 1 }))
      }
    },
    include: { blocs: { orderBy: { ordre: 'asc' } } }
  });

  return nouvelEchauffement;
}

/**
 * Mettre à jour un échauffement
 * @param {string} id - ID de l'échauffement
 * @param {Object} data - Données à mettre à jour { nom, description, blocs, imageUrl }
 * @param {string} workspaceId - ID du workspace
 * @param {Object} file - Fichier uploadé (optionnel)
 * @returns {Promise<Object>} Échauffement mis à jour
 */
async function updateEchauffement(id, data, workspaceId, file = null) {
  const { nom, description, blocs, imageUrl } = data;

  const echauffementMisAJour = await prisma.$transaction(async (tx) => {
    // 1. Supprimer les anciens blocs
    await tx.blocEchauffement.deleteMany({ where: { echauffementId: id } });

    // 2. Mettre à jour l'échauffement et recréer les blocs
    const updated = await tx.echauffement.update({
      where: { id, workspaceId },
      data: {
        nom,
        description,
        imageUrl: file
          ? file.cloudinaryUrl
          : (imageUrl !== undefined
              ? (imageUrl === '' ? null : imageUrl)
              : undefined),
        blocs: {
          create: (blocs || []).map((bloc, index) => ({ ...bloc, ordre: bloc.ordre || index + 1 }))
        }
      },
      include: { blocs: { orderBy: { ordre: 'asc' } } }
    });

    return updated;
  });

  return echauffementMisAJour;
}

/**
 * Supprimer un échauffement
 * @param {string} id - ID de l'échauffement
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<void>}
 * @throws {Error} Si l'échauffement n'existe pas (404)
 */
async function deleteEchauffement(id, workspaceId) {
  const echauffement = await prisma.echauffement.findFirst({ where: { id, workspaceId } });

  if (!echauffement) {
    const error = new Error('Échauffement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  await prisma.echauffement.delete({ where: { id, workspaceId } });
}

/**
 * Dupliquer un échauffement
 * @param {string} id - ID de l'échauffement à dupliquer
 * @param {string} workspaceId - ID du workspace
 * @returns {Promise<Object>} Échauffement dupliqué
 * @throws {Error} Si l'échauffement n'existe pas (404)
 */
async function duplicateEchauffement(id, workspaceId) {
  const echauffementOriginal = await prisma.echauffement.findFirst({
    where: { id, workspaceId },
    include: { blocs: { orderBy: { ordre: 'asc' } } }
  });

  if (!echauffementOriginal) {
    const error = new Error('Échauffement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const echauffementDuplique = await prisma.echauffement.create({
    data: {
      nom: `${echauffementOriginal.nom} (Copie)`,
      description: echauffementOriginal.description,
      imageUrl: echauffementOriginal.imageUrl,
      workspaceId: echauffementOriginal.workspaceId,
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

  return echauffementDuplique;
}

module.exports = {
  getAllEchauffements,
  getEchauffementById,
  createEchauffement,
  updateEchauffement,
  deleteEchauffement,
  duplicateEchauffement
};
