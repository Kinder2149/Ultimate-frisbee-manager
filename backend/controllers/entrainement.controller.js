const { prisma } = require('../services/prisma');
const {
  validateTagsInWorkspace,
  validateExerciceInWorkspace,
  validateSituationMatchInWorkspace,
  validateEchauffementInWorkspace
} = require('../utils/workspace-validation');

const calculerDureeTotal = (exercices) => {
  if (!exercices || exercices.length === 0) return 0;
  return exercices.reduce((total, ex) => total + (ex.duree || 0), 0);
};

exports.getAllEntrainements = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    
    // Paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Compter le total d'entraînements
    const total = await prisma.entrainement.count({
      where: { workspaceId }
    });

    // Récupérer les entraînements paginés
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
    
    // Réponse paginée standardisée
    res.json({
      data: resultats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

exports.getEntrainementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

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
      const error = new Error('Entraînement non trouvé');
      error.statusCode = 404;
      return next(error);
    }

    const resultat = { ...entrainement, dureeTotal: calculerDureeTotal(entrainement.exercices) };
    res.json(resultat);
  } catch (error) {
    next(error);
  }
};

exports.createEntrainement = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { titre, date, exercices, echauffementId, situationMatchId, tagIds } = req.body;

    // Log minimal pour diagnostiquer les erreurs 500 côté création
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

    // SÉCURITÉ: Valider que tous les tags appartiennent au workspace
    if (tagIds && tagIds.length > 0) {
      const tagValidation = await validateTagsInWorkspace(tagIds, workspaceId);
      if (!tagValidation.valid) {
        return res.status(400).json({
          error: 'Certains tags n\'appartiennent pas à ce workspace',
          code: 'INVALID_TAGS',
          invalidIds: tagValidation.invalidIds
        });
      }
    }

    // SÉCURITÉ: Valider l'échauffement
    if (echauffementId) {
      const valid = await validateEchauffementInWorkspace(echauffementId, workspaceId);
      if (!valid) {
        return res.status(400).json({
          error: 'L\'échauffement n\'appartient pas à ce workspace',
          code: 'INVALID_ECHAUFFEMENT'
        });
      }
    }

    // SÉCURITÉ: Valider la situation de match
    if (situationMatchId) {
      const valid = await validateSituationMatchInWorkspace(situationMatchId, workspaceId);
      if (!valid) {
        return res.status(400).json({
          error: 'La situation de match n\'appartient pas à ce workspace',
          code: 'INVALID_SITUATION'
        });
      }
    }

    // SÉCURITÉ: Valider les exercices
    if (exercices && exercices.length > 0) {
      for (const ex of exercices) {
        if (ex.exerciceId) {
          const valid = await validateExerciceInWorkspace(ex.exerciceId, workspaceId);
          if (!valid) {
            return res.status(400).json({
              error: `L'exercice ${ex.exerciceId} n'appartient pas à ce workspace`,
              code: 'INVALID_EXERCICE'
            });
          }
        }
      }
    }

    // Gestion robuste de la date: null si vide; si invalide -> fallback null (pas d'erreur bloquante)
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
        imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl || null),
        echauffementId: echauffementId || null,
        situationMatchId: situationMatchId || null,
        workspaceId,
        tags: { connect: (tagIds || []).map(id => ({ id })) },
        exercices: {
          // Filtrer les entrées invalides et construire proprement
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

    res.status(201).json(nouvelEntrainement);
  } catch (error) {
    console.error('[createEntrainement] erreur', error);
    next(error);
  }
};

exports.updateEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const { titre, date, exercices, echauffementId, situationMatchId, tagIds } = req.body;

    // SÉCURITÉ: Valider que tous les tags appartiennent au workspace
    if (tagIds && tagIds.length > 0) {
      const tagValidation = await validateTagsInWorkspace(tagIds, workspaceId);
      if (!tagValidation.valid) {
        return res.status(400).json({
          error: 'Certains tags n\'appartiennent pas à ce workspace',
          code: 'INVALID_TAGS',
          invalidIds: tagValidation.invalidIds
        });
      }
    }

    // SÉCURITÉ: Valider l'échauffement
    if (echauffementId) {
      const valid = await validateEchauffementInWorkspace(echauffementId, workspaceId);
      if (!valid) {
        return res.status(400).json({
          error: 'L\'échauffement n\'appartient pas à ce workspace',
          code: 'INVALID_ECHAUFFEMENT'
        });
      }
    }

    // SÉCURITÉ: Valider la situation de match
    if (situationMatchId) {
      const valid = await validateSituationMatchInWorkspace(situationMatchId, workspaceId);
      if (!valid) {
        return res.status(400).json({
          error: 'La situation de match n\'appartient pas à ce workspace',
          code: 'INVALID_SITUATION'
        });
      }
    }

    // SÉCURITÉ: Valider les exercices
    if (exercices && exercices.length > 0) {
      for (const ex of exercices) {
        if (ex.exerciceId) {
          const valid = await validateExerciceInWorkspace(ex.exerciceId, workspaceId);
          if (!valid) {
            return res.status(400).json({
              error: `L'exercice ${ex.exerciceId} n'appartient pas à ce workspace`,
              code: 'INVALID_EXERCICE'
            });
          }
        }
      }
    }

    // La logique de mise à jour des relations many-to-many avec Prisma
    // est de supprimer les anciennes relations, puis de recréer les nouvelles.
    // Cela doit être fait dans une transaction pour garantir l'atomicité.
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer les anciennes liaisons
      await tx.entrainementExercice.deleteMany({ where: { entrainementId: id } });

      // 2. Mettre à jour l'entraînement et recréer les nouvelles liaisons
      await tx.entrainement.update({
        where: { id, workspaceId },
        data: {
          titre,
          date: date ? new Date(date) : undefined,
          imageUrl: req.file
            ? req.file.cloudinaryUrl
            : (req.body.imageUrl !== undefined
                ? (req.body.imageUrl === '' ? null : req.body.imageUrl)
                : undefined),

          echauffementId: echauffementId,
          situationMatchId: situationMatchId,
          tags: { set: (tagIds || []).map(tagId => ({ id: tagId })) },
          exercices: {
            create: (exercices || []).map(exo => ({
              ordre: exo.ordre,
              duree: exo.duree,
              notes: exo.notes,
              exercice: { connect: { id: exo.exerciceId } } // La syntaxe correcte pour connecter un exercice existant
            }))
          }
        }
      });
    });

    const entrainementMisAJour = await prisma.entrainement.findFirst({
      where: { id, workspaceId },
      include: { exercices: { include: { exercice: true } }, tags: true, echauffement: true, situationMatch: true }
    });

    res.json(entrainementMisAJour);
  } catch (error) {
    next(error);
  }
};

exports.deleteEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    // Vérifier que l'entraînement existe dans le workspace courant
    const entrainement = await prisma.entrainement.findFirst({ where: { id, workspaceId } });
    if (!entrainement) {
      const error = new Error('Entraînement non trouvé');
      error.statusCode = 404;
      return next(error);
    }

    // La suppression en cascade est gérée par Prisma via le schéma
    await prisma.entrainement.delete({ where: { id, workspaceId } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.duplicateEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const original = await prisma.entrainement.findFirst({
      where: { id, workspaceId },
      include: { exercices: true, tags: true }
    });

    if (!original) {
      const error = new Error('Entraînement non trouvé');
      error.statusCode = 404;
      return next(error);
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

    res.status(201).json(entrainementDuplique);
  } catch (error) {
    next(error);
  }
};