const { prisma } = require('../services/prisma');
const { validateTagsInWorkspace } = require('../utils/workspace-validation');

/**
 * Récupérer tous les exercices avec leurs tags (avec pagination)
 * @route GET /api/exercices
 * @query page - Numéro de page (défaut: 1)
 * @query limit - Nombre d'éléments par page (défaut: 50)
 */
exports.getAllExercices = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    
    // Paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Compter le total d'exercices
    const total = await prisma.exercice.count({
      where: { workspaceId }
    });

    // Récupérer les exercices paginés
    let exercices = await prisma.exercice.findMany({
      where: { workspaceId },
      include: {
        tags: true // Inclure les tags associés
      },
      skip,
      take: limit
    });

    exercices = exercices.map(ex => ({
      ...ex,
      variablesPlus: JSON.parse(ex.variablesPlus || '[]'),
      variablesMinus: JSON.parse(ex.variablesMinus || '[]'),
      points: JSON.parse(ex.points || '[]'),
    }));

    // Réponse paginée standardisée
    res.json({
      data: exercices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un exercice par son ID
 * @route GET /api/exercices/:id
 */
exports.getExerciceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    
    const exercice = await prisma.exercice.findFirst({
      where: { id, workspaceId },
      include: { tags: true } // Inclure les tags associés
    });

    if (!exercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    exercice.variablesPlus = JSON.parse(exercice.variablesPlus || '[]');
    exercice.variablesMinus = JSON.parse(exercice.variablesMinus || '[]');
    exercice.points = JSON.parse(exercice.points || '[]');

    res.json(exercice);
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouvel exercice avec ses tags
 * @route POST /api/exercices
 */
exports.createExercice = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;

    // On ne récupère plus variablesText qui est obsolète
    const { nom, description, variablesPlus, variablesMinus, points, tags, tagIds, materiel, notes, critereReussite } = req.body;

    // LOG: Ajout d'un log pour vérifier les données entrantes
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- Contenu de req.body pour la création ---', {
        nom,
        description: description ? `${description.length} chars` : 'absent',
        variablesPlus: Array.isArray(variablesPlus) ? `[${variablesPlus.length} items]` : 'non-array',
        variablesMinus: Array.isArray(variablesMinus) ? `[${variablesMinus.length} items]` : 'non-array',
        points: Array.isArray(points) ? `[${points.length} items]` : 'non-array',
        tags: tags ? `[${tags.length} items]` : 'absent',
        tagIds: tagIds ? `[${tagIds.length} items]` : 'absent',
        materiel: materiel ? `${materiel.length} chars` : 'absent',
        notes: notes ? `${notes.length} chars` : 'absent',
        critereReussite: critereReussite ? `${critereReussite.length} chars` : 'absent'
      });
    }

    // Helper local pour normaliser un tableau de chaînes
    const normalizeStringArray = (value) => {
      const flattenOnce = (val) => {
        if (typeof val === 'string') {
          const t = val.trim();
          if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('"') && t.endsWith('"'))) {
            try {
              const parsed = JSON.parse(t);
              return parsed;
            } catch (_) {
              return t;
            }
          }
          return t;
        }
        return val;
      };
      let arr = Array.isArray(value) ? value : [value].filter((v) => v !== undefined && v !== null);
      let changed = true;
      while (changed) {
        changed = false;
        const next = [];
        for (const item of arr) {
          const flat = flattenOnce(item);
          if (Array.isArray(flat)) {
            next.push(...flat);
            changed = true;
          } else {
            next.push(flat);
          }
        }
        arr = next;
      }
      return arr
        .map((x) => (x == null ? '' : String(x).trim()))
        .filter((s) => s !== '');
    };

    const createData = {
      nom,
      description: description || '',
      imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl || null),
      materiel: materiel || null,
      notes: notes || null,
      critereReussite: critereReussite || null,
      workspaceId,
      // Assurer que les variables sont des tableaux de chaînes (String[])
      variablesPlus: JSON.stringify(normalizeStringArray(Array.isArray(variablesPlus) ? variablesPlus : [])),
      variablesMinus: JSON.stringify(normalizeStringArray(Array.isArray(variablesMinus) ? variablesMinus : [])),
      points: JSON.stringify(normalizeStringArray(Array.isArray(points) ? points : [])),
      tags: {}
    };

    // Gérer la connexion des tags
    const finalTagIds = tagIds || (tags && Array.isArray(tags) ? tags.map(t => t.id) : []);
    if (!Array.isArray(finalTagIds) || finalTagIds.length === 0) {
      return res.status(400).json({ error: 'Au moins un tag est requis.' });
    }

    // SÉCURITÉ: Valider que tous les tags appartiennent au workspace
    const tagValidation = await validateTagsInWorkspace(finalTagIds, workspaceId);
    if (!tagValidation.valid) {
      return res.status(400).json({
        error: 'Certains tags n\'appartiennent pas à ce workspace',
        code: 'INVALID_TAGS',
        invalidIds: tagValidation.invalidIds
      });
    }

    const tagsFromDb = await prisma.tag.findMany({ where: { id: { in: finalTagIds } } });
    const objectifTags = tagsFromDb.filter(t => t.category === 'objectif');
    const travailSpecifiqueTags = tagsFromDb.filter(t => t.category === 'travail_specifique');

    if (objectifTags.length === 0) {
      return res.status(400).json({ error: 'Un tag de catégorie "objectif" est obligatoire.' });
    }
    if (objectifTags.length > 1) {
      return res.status(400).json({ error: 'Un seul tag de catégorie "objectif" est autorisé.' });
    }
    if (travailSpecifiqueTags.length === 0) {
      return res.status(400).json({ error: 'Au moins un tag de catégorie "travail_specifique" est obligatoire.' });
    }

    if (Array.isArray(finalTagIds) && finalTagIds.length > 0) {
      createData.tags = {
        connect: finalTagIds.map(id => ({ id }))
      };
    }

    // LOG: Ajout d'un log pour vérifier les données envoyées à Prisma
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- Données envoyées à prisma.exercice.create ---', {
        ...createData,
        tags: createData.tags.connect ? `${createData.tags.connect.length} tags à connecter` : 'aucun',
      });
    }

    const newExercice = await prisma.exercice.create({
      data: createData,
      include: {
        tags: true // Inclure les tags dans le résultat
      }
    });

    newExercice.variablesPlus = JSON.parse(newExercice.variablesPlus || '[]');
    newExercice.variablesMinus = JSON.parse(newExercice.variablesMinus || '[]');
    newExercice.points = JSON.parse(newExercice.points || '[]');

    // LOG: Confirmation de la création
    if (process.env.NODE_ENV !== 'production') {
      console.log(`--- Exercice créé avec succès (ID: ${newExercice.id}) ---`);
    }

    // La réponse est déjà conforme, car Prisma retourne les tableaux `variablesPlus` et `variablesMinus`
    res.status(201).json(newExercice);

  } catch (error) {
    // LOG: Ajout d'un log d'erreur plus détaillé pour le débogage
    console.error('--- Erreur détaillée dans createExercice ---', error);
    next(error);
  }
};

/**
 * Mettre à jour un exercice
 * @route PUT /api/exercices/:id
 */
exports.updateExercice = async (req, res, next) => {
  // Envelopper toute la fonction dans un try/catch pour une meilleure gestion d'erreur
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const { nom, description, variablesPlus, variablesMinus, points, tagIds, materiel, notes, critereReussite } = req.body;

    // 1. Vérifier que l'exercice existe
    const existingExercice = await prisma.exercice.findFirst({ where: { id, workspaceId } });

    if (!existingExercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    // 2. Construire l'objet de mise à jour de manière sûre
    const updateData = {};

    // Helper local pour normaliser un tableau de chaînes (même logique que create)
    const normalizeStringArray = (value) => {
      const flattenOnce = (val) => {
        if (typeof val === 'string') {
          const t = val.trim();
          if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('"') && t.endsWith('"'))) {
            try {
              const parsed = JSON.parse(t);
              return parsed;
            } catch (_) {
              return t;
            }
          }
          return t;
        }
        return val;
      };
      let arr = Array.isArray(value) ? value : [value].filter((v) => v !== undefined && v !== null);
      let changed = true;
      while (changed) {
        changed = false;
        const next = [];
        for (const item of arr) {
          const flat = flattenOnce(item);
          if (Array.isArray(flat)) {
            next.push(...flat);
            changed = true;
          } else {
            next.push(flat);
          }
        }
        arr = next;
      }
      return arr
        .map((x) => (x == null ? '' : String(x).trim()))
        .filter((s) => s !== '');
    };

    // Assignation conditionnelle pour chaque champ
    if (nom !== undefined) updateData.nom = nom;
    if (description !== undefined) updateData.description = description;
    if (materiel !== undefined) updateData.materiel = materiel;
    if (notes !== undefined) updateData.notes = notes;
    if (critereReussite !== undefined) updateData.critereReussite = critereReussite;
    if (variablesPlus !== undefined) updateData.variablesPlus = JSON.stringify(normalizeStringArray(variablesPlus));
    if (variablesMinus !== undefined) updateData.variablesMinus = JSON.stringify(normalizeStringArray(variablesMinus));
    if (points !== undefined) updateData.points = JSON.stringify(normalizeStringArray(points));

    // Gestion de l'image
    if (req.file) {
      updateData.imageUrl = req.file.cloudinaryUrl;
    } else if (req.body.imageUrl !== undefined) {
      updateData.imageUrl = req.body.imageUrl === '' ? null : req.body.imageUrl;
    }

    // Gestion spécifique et sécurisée pour les tags
    if (Array.isArray(tagIds)) {
      // SÉCURITÉ: Valider que tous les tags appartiennent au workspace
      const tagValidation = await validateTagsInWorkspace(tagIds, workspaceId);
      if (!tagValidation.valid) {
        return res.status(400).json({
          error: 'Certains tags n\'appartiennent pas à ce workspace',
          code: 'INVALID_TAGS',
          invalidIds: tagValidation.invalidIds
        });
      }

      const tagsFromDb = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
      const objectifTags = tagsFromDb.filter(t => t.category === 'objectif');
      const travailSpecifiqueTags = tagsFromDb.filter(t => t.category === 'travail_specifique');

      if (objectifTags.length === 0) {
        return res.status(400).json({ error: 'Un tag de catégorie "objectif" est obligatoire.' });
      }
      if (objectifTags.length > 1) {
        return res.status(400).json({ error: 'Un seul tag de catégorie "objectif" est autorisé.' });
      }
      if (travailSpecifiqueTags.length === 0) {
        return res.status(400).json({ error: 'Au moins un tag de catégorie "travail_specifique" est obligatoire.' });
      }

      updateData.tags = {
        set: [], // Réinitialise les tags existants
        connect: tagIds.map(id => ({ id })) // Connecte les nouveaux tags
      };
    }

    // 3. Log des données qui seront envoyées à Prisma
    if (process.env.NODE_ENV !== 'production') {
      console.log(`--- Données préparées pour prisma.exercice.update (ID: ${id}) ---`, updateData);
    }

    // 4. Exécuter la mise à jour
    const exerciceUpdated = await prisma.exercice.update({
      where: { id, workspaceId },
      data: updateData,
      include: { tags: true } // Toujours inclure les tags dans la réponse
    });

    exerciceUpdated.variablesPlus = JSON.parse(exerciceUpdated.variablesPlus || '[]');
    exerciceUpdated.variablesMinus = JSON.parse(exerciceUpdated.variablesMinus || '[]');
    exerciceUpdated.points = JSON.parse(exerciceUpdated.points || '[]');

    if (process.env.NODE_ENV !== 'production') {
      console.log(`--- Exercice mis à jour avec succès (ID: ${exerciceUpdated.id}) ---`);
    }

    // 5. Renvoyer la réponse
    res.json(exerciceUpdated);

  } catch (error) {
    // Log d'erreur spécifique à cette fonction pour un débogage clair
    console.error(`--- ERREUR FATALE dans updateExercice (ID: ${req.params.id}) ---`, error);
    next(error); // Passer l'erreur au gestionnaire global
  }
};

/**
 * Dupliquer un exercice
 * @route POST /api/exercices/:id/duplicate
 */
exports.duplicateExercice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;

    const originalExercice = await prisma.exercice.findFirst({
      where: { id, workspaceId },
      include: { tags: true }
    });

    if (!originalExercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    // Créer une copie sans le champ `variablesText`
    const duplicatedExercice = await prisma.exercice.create({
      data: {
        nom: `${originalExercice.nom} (Copie)`,
        description: originalExercice.description,
        imageUrl: originalExercice.imageUrl,
        materiel: originalExercice.materiel,
        notes: originalExercice.notes,
        workspaceId: originalExercice.workspaceId,
        // Les variables sont des chaînes JSON, on les passe directement
        variablesPlus: originalExercice.variablesPlus,
        variablesMinus: originalExercice.variablesMinus,
        points: originalExercice.points,

        tags: {
          connect: originalExercice.tags.map(tag => ({ id: tag.id }))
        }
      },
      include: { tags: true }
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`--- Exercice dupliqué avec succès (Nouveau ID: ${duplicatedExercice.id}) ---`);
    }

    // La réponse est déjà conforme
    res.status(201).json(duplicatedExercice);

  } catch (error) {
    console.error(`--- Erreur détaillée dans duplicateExercice (ID original: ${req.params.id}) ---`, error);
    next(error);
  }
};

/**
 * Supprimer un exercice
 * @route DELETE /api/exercices/:id
 */
exports.deleteExercice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspaceId;
    
    // Vérifier si l'exercice existe dans le workspace courant
    const exercice = await prisma.exercice.findFirst({ where: { id, workspaceId } });

    if (!exercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }
    
    // Supprimer l'exercice (les relations avec les tags seront automatiquement supprimées)
    await prisma.exercice.delete({ where: { id, workspaceId } });
    
    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
};