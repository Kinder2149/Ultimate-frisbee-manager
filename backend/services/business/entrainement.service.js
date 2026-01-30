const { prisma } = require('../prisma');
const {
  validateTagsInWorkspace,
  validateExerciceInWorkspace,
  validateSituationMatchInWorkspace,
  validateEchauffementInWorkspace
} = require('../../utils/workspace-validation');

/**
 * Service métier pour la gestion des entraînements
 * Contient toute la logique métier liée aux entraînements
 */

/**
 * Calculer la durée totale d'un entraînement
 */
function calculerDureeTotal(exercices) {
  if (!exercices || exercices.length === 0) return 0;
  return exercices.reduce((total, ex) => total + (ex.duree || 0), 0);
}

/**
 * Récupérer tous les entraînements avec pagination
 */
async function getAllEntrainements(workspaceId, pagination = {}) {
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 50;
  const skip = (page - 1) * limit;

  const total = await prisma.entrainement.count({
    where: { workspaceId }
  });

  const entrainements = await prisma.entrainement.findMany({
    where: { workspaceId },
    include: {
      exercices: { orderBy: { ordre: 'asc' }, include: { exercice: { include: { tags: true } } } },
      tags: true,
      echauffement: { include: { blocs: { orderBy: { ordre: 'asc' } } } },
      situationMatch: { include: { tags: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const resultats = entrainements.map(e => ({ ...e, dureeTotal: calculerDureeTotal(e.exercices) }));

  return {
    data: resultats,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Récupérer un entraînement par son ID
 */
async function getEntrainementById(id, workspaceId) {
  const entrainement = await prisma.entrainement.findFirst({
    where: { id, workspaceId },
    include: {
      exercices: { orderBy: { ordre: 'asc' }, include: { exercice: { include: { tags: true } } } },
      tags: true,
      echauffement: { include: { blocs: { orderBy: { ordre: 'asc' } } } },
      situationMatch: { include: { tags: true } }
    }
  });

  if (!entrainement) {
    return null;
  }

  return { ...entrainement, dureeTotal: calculerDureeTotal(entrainement.exercices) };
}

/**
 * Créer un nouvel entraînement
 */
async function createEntrainement(data, workspaceId, file = null) {
  const { titre, date, exercices, echauffementId, situationMatchId, tagIds, imageUrl } = data;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[createEntrainement] payload reçu', {
      titre,
      date,
      echauffementId,
      situationMatchId,
      tagIdsCount: Array.isArray(tagIds) ? tagIds.length : 0,
      exercicesCount: Array.isArray(exercices) ? exercices.length : 0,
    });
  }

  // SÉCURITÉ: Valider les tags
  if (tagIds && tagIds.length > 0) {
    const tagValidation = await validateTagsInWorkspace(tagIds, workspaceId);
    if (!tagValidation.valid) {
      const error = new Error('Certains tags n\'appartiennent pas à ce workspace');
      error.statusCode = 400;
      error.code = 'INVALID_TAGS';
      error.invalidIds = tagValidation.invalidIds;
      throw error;
    }
  }

  // SÉCURITÉ: Valider l'échauffement
  if (echauffementId) {
    const valid = await validateEchauffementInWorkspace(echauffementId, workspaceId);
    if (!valid) {
      const error = new Error('L\'échauffement n\'appartient pas à ce workspace');
      error.statusCode = 400;
      error.code = 'INVALID_ECHAUFFEMENT';
      throw error;
    }
  }

  // SÉCURITÉ: Valider la situation de match
  if (situationMatchId) {
    const valid = await validateSituationMatchInWorkspace(situationMatchId, workspaceId);
    if (!valid) {
      const error = new Error('La situation de match n\'appartient pas à ce workspace');
      error.statusCode = 400;
      error.code = 'INVALID_SITUATION';
      throw error;
    }
  }

  // SÉCURITÉ: Valider les exercices
  if (exercices && exercices.length > 0) {
    for (const ex of exercices) {
      if (ex.exerciceId) {
        const valid = await validateExerciceInWorkspace(ex.exerciceId, workspaceId);
        if (!valid) {
          const error = new Error(`L'exercice ${ex.exerciceId} n'appartient pas à ce workspace`);
          error.statusCode = 400;
          error.code = 'INVALID_EXERCICE';
          throw error;
        }
      }
    }
  }

  // Gestion robuste de la date
  let finalDate = null;
  if (date != null && String(date).trim() !== '') {
    const tmp = new Date(date);
    if (isNaN(tmp.getTime())) {
      console.warn('[createEntrainement] date invalide reçue, fallback à null. Valeur:', date);
      finalDate = null;
    } else {
      finalDate = tmp;
    }
  }

  const nouvelEntrainement = await prisma.entrainement.create({
    data: {
      titre,
      date: finalDate,
      imageUrl: file ? file.cloudinaryUrl : (imageUrl || null),
      echauffementId: echauffementId || null,
      situationMatchId: situationMatchId || null,
      workspaceId,
      tags: { connect: (tagIds || []).map(id => ({ id })) },
      exercices: {
        create: (Array.isArray(exercices) ? exercices : [])
          .filter((ex) => ex && typeof ex.exerciceId === 'string' && ex.exerciceId.trim().length > 0)
          .map((ex, i) => ({
            exerciceId: ex.exerciceId,
            ordre: ex.ordre || i + 1,
            duree: ex.duree || null,
            notes: ex.notes || null
          }))
      }
    },
    include: { exercices: { include: { exercice: true } }, tags: true, echauffement: true, situationMatch: true }
  });

  return nouvelEntrainement;
}

/**
 * Mettre à jour un entraînement
 */
async function updateEntrainement(id, data, workspaceId, file = null) {
  const { titre, date, exercices, echauffementId, situationMatchId, tagIds, imageUrl } = data;

  // SÉCURITÉ: Valider les tags
  if (tagIds && tagIds.length > 0) {
    const tagValidation = await validateTagsInWorkspace(tagIds, workspaceId);
    if (!tagValidation.valid) {
      const error = new Error('Certains tags n\'appartiennent pas à ce workspace');
      error.statusCode = 400;
      error.code = 'INVALID_TAGS';
      error.invalidIds = tagValidation.invalidIds;
      throw error;
    }
  }

  // SÉCURITÉ: Valider l'échauffement
  if (echauffementId) {
    const valid = await validateEchauffementInWorkspace(echauffementId, workspaceId);
    if (!valid) {
      const error = new Error('L\'échauffement n\'appartient pas à ce workspace');
      error.statusCode = 400;
      error.code = 'INVALID_ECHAUFFEMENT';
      throw error;
    }
  }

  // SÉCURITÉ: Valider la situation de match
  if (situationMatchId) {
    const valid = await validateSituationMatchInWorkspace(situationMatchId, workspaceId);
    if (!valid) {
      const error = new Error('La situation de match n\'appartient pas à ce workspace');
      error.statusCode = 400;
      error.code = 'INVALID_SITUATION';
      throw error;
    }
  }

  // SÉCURITÉ: Valider les exercices
  if (exercices && exercices.length > 0) {
    for (const ex of exercices) {
      if (ex.exerciceId) {
        const valid = await validateExerciceInWorkspace(ex.exerciceId, workspaceId);
        if (!valid) {
          const error = new Error(`L'exercice ${ex.exerciceId} n'appartient pas à ce workspace`);
          error.statusCode = 400;
          error.code = 'INVALID_EXERCICE';
          throw error;
        }
      }
    }
  }

  // Transaction pour garantir l'atomicité
  await prisma.$transaction(async (tx) => {
    // 1. Supprimer les anciennes liaisons
    await tx.entrainementExercice.deleteMany({ where: { entrainementId: id } });

    // 2. Mettre à jour l'entraînement et recréer les nouvelles liaisons
    await tx.entrainement.update({
      where: { id, workspaceId },
      data: {
        titre,
        date: date ? new Date(date) : undefined,
        imageUrl: file
          ? file.cloudinaryUrl
          : (imageUrl !== undefined
              ? (imageUrl === '' ? null : imageUrl)
              : undefined),
        echauffementId: echauffementId,
        situationMatchId: situationMatchId,
        tags: { set: (tagIds || []).map(tagId => ({ id: tagId })) },
        exercices: {
          create: (exercices || []).map(exo => ({
            ordre: exo.ordre,
            duree: exo.duree,
            notes: exo.notes,
            exercice: { connect: { id: exo.exerciceId } }
          }))
        }
      }
    });
  });

  const entrainementMisAJour = await prisma.entrainement.findFirst({
    where: { id, workspaceId },
    include: { exercices: { include: { exercice: true } }, tags: true, echauffement: true, situationMatch: true }
  });

  return entrainementMisAJour;
}

/**
 * Supprimer un entraînement
 */
async function deleteEntrainement(id, workspaceId) {
  const entrainement = await prisma.entrainement.findFirst({ where: { id, workspaceId } });
  
  if (!entrainement) {
    const error = new Error('Entraînement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  await prisma.entrainement.delete({ where: { id, workspaceId } });
}

/**
 * Dupliquer un entraînement
 */
async function duplicateEntrainement(id, workspaceId) {
  const original = await prisma.entrainement.findFirst({
    where: { id, workspaceId },
    include: { exercices: true, tags: true }
  });

  if (!original) {
    const error = new Error('Entraînement non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const entrainementDuplique = await prisma.entrainement.create({
    data: {
      titre: `${original.titre} (Copie)`,
      date: original.date,
      imageUrl: original.imageUrl,
      echauffementId: original.echauffementId,
      situationMatchId: original.situationMatchId,
      workspaceId,
      tags: { connect: original.tags.map(t => ({ id: t.id })) },
      exercices: {
        create: original.exercices.map(ex => ({
          exerciceId: ex.exerciceId,
          ordre: ex.ordre,
          duree: ex.duree,
          notes: ex.notes
        }))
      }
    },
    include: { exercices: { include: { exercice: true } }, tags: true, echauffement: true, situationMatch: true }
  });

  return entrainementDuplique;
}

module.exports = {
  getAllEntrainements,
  getEntrainementById,
  createEntrainement,
  updateEntrainement,
  deleteEntrainement,
  duplicateEntrainement
};
