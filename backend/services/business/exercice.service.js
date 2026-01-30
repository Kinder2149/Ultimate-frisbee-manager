const { prisma } = require('../prisma');
const { validateTagsInWorkspace } = require('../../utils/workspace-validation');

/**
 * Service métier pour la gestion des exercices
 * Contient toute la logique métier liée aux exercices et leurs tags
 */

/**
 * Helper pour normaliser un tableau de chaînes
 * Gère les cas où les données arrivent sous forme de JSON stringifié ou de tableaux imbriqués
 */
function normalizeStringArray(value) {
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
}

/**
 * Helper pour parser les champs JSON d'un exercice
 */
function parseExerciceJsonFields(exercice) {
  return {
    ...exercice,
    variablesPlus: JSON.parse(exercice.variablesPlus || '[]'),
    variablesMinus: JSON.parse(exercice.variablesMinus || '[]'),
    points: JSON.parse(exercice.points || '[]')
  };
}

/**
 * Valider les tags d'un exercice (règles métier)
 */
async function validateExerciceTags(tagIds, workspaceId) {
  // SÉCURITÉ: Valider que tous les tags appartiennent au workspace
  const tagValidation = await validateTagsInWorkspace(tagIds, workspaceId);
  if (!tagValidation.valid) {
    const error = new Error('Certains tags n\'appartiennent pas à ce workspace');
    error.statusCode = 400;
    error.code = 'INVALID_TAGS';
    error.invalidIds = tagValidation.invalidIds;
    throw error;
  }

  // Récupérer les tags pour valider les règles métier
  const tagsFromDb = await prisma.tag.findMany({ where: { id: { in: tagIds } } });
  const objectifTags = tagsFromDb.filter(t => t.category === 'objectif');
  const travailSpecifiqueTags = tagsFromDb.filter(t => t.category === 'travail_specifique');

  // Règle 1: Un tag "objectif" obligatoire
  if (objectifTags.length === 0) {
    const error = new Error('Un tag de catégorie "objectif" est obligatoire.');
    error.statusCode = 400;
    throw error;
  }

  // Règle 2: Un seul tag "objectif"
  if (objectifTags.length > 1) {
    const error = new Error('Un seul tag de catégorie "objectif" est autorisé.');
    error.statusCode = 400;
    throw error;
  }

  // Règle 3: Au moins un tag "travail_specifique"
  if (travailSpecifiqueTags.length === 0) {
    const error = new Error('Au moins un tag de catégorie "travail_specifique" est obligatoire.');
    error.statusCode = 400;
    throw error;
  }
}

/**
 * Récupérer tous les exercices avec pagination
 */
async function getAllExercices(workspaceId, pagination = {}) {
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 50;
  const skip = (page - 1) * limit;

  const total = await prisma.exercice.count({
    where: { workspaceId }
  });

  let exercices = await prisma.exercice.findMany({
    where: { workspaceId },
    include: {
      tags: true
    },
    skip,
    take: limit
  });

  // Parser les champs JSON pour chaque exercice
  exercices = exercices.map(ex => parseExerciceJsonFields(ex));

  return {
    data: exercices,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Récupérer un exercice par son ID
 */
async function getExerciceById(id, workspaceId) {
  const exercice = await prisma.exercice.findFirst({
    where: { id, workspaceId },
    include: { tags: true }
  });

  if (!exercice) {
    return null;
  }

  return parseExerciceJsonFields(exercice);
}

/**
 * Créer un nouvel exercice
 */
async function createExercice(data, workspaceId, file = null) {
  const { nom, description, variablesPlus, variablesMinus, points, tags, tagIds, materiel, notes, critereReussite, imageUrl } = data;

  // Déterminer les tagIds finaux
  const finalTagIds = tagIds || (tags && Array.isArray(tags) ? tags.map(t => t.id) : []);
  
  if (!Array.isArray(finalTagIds) || finalTagIds.length === 0) {
    const error = new Error('Au moins un tag est requis.');
    error.statusCode = 400;
    throw error;
  }

  // Valider les tags (sécurité + règles métier)
  await validateExerciceTags(finalTagIds, workspaceId);

  // Logs en développement
  if (process.env.NODE_ENV !== 'production') {
    console.log('--- Contenu de req.body pour la création ---', {
      nom,
      description: description ? `${description.length} chars` : 'absent',
      variablesPlus: Array.isArray(variablesPlus) ? `[${variablesPlus.length} items]` : 'non-array',
      variablesMinus: Array.isArray(variablesMinus) ? `[${variablesMinus.length} items]` : 'non-array',
      points: Array.isArray(points) ? `[${points.length} items]` : 'non-array',
      tagIds: finalTagIds ? `[${finalTagIds.length} items]` : 'absent'
    });
  }

  const createData = {
    nom,
    description: description || '',
    imageUrl: file ? file.cloudinaryUrl : (imageUrl || null),
    materiel: materiel || null,
    notes: notes || null,
    critereReussite: critereReussite || null,
    workspaceId,
    variablesPlus: JSON.stringify(normalizeStringArray(Array.isArray(variablesPlus) ? variablesPlus : [])),
    variablesMinus: JSON.stringify(normalizeStringArray(Array.isArray(variablesMinus) ? variablesMinus : [])),
    points: JSON.stringify(normalizeStringArray(Array.isArray(points) ? points : [])),
    tags: {
      connect: finalTagIds.map(id => ({ id }))
    }
  };

  const newExercice = await prisma.exercice.create({
    data: createData,
    include: { tags: true }
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`--- Exercice créé avec succès (ID: ${newExercice.id}) ---`);
  }

  return parseExerciceJsonFields(newExercice);
}

/**
 * Mettre à jour un exercice
 */
async function updateExercice(id, data, workspaceId, file = null) {
  const { nom, description, variablesPlus, variablesMinus, points, tagIds, materiel, notes, critereReussite, imageUrl } = data;

  // Vérifier que l'exercice existe
  const existingExercice = await prisma.exercice.findFirst({ where: { id, workspaceId } });

  if (!existingExercice) {
    const error = new Error('Exercice non trouvé');
    error.statusCode = 404;
    throw error;
  }

  // Construire l'objet de mise à jour
  const updateData = {};

  if (nom !== undefined) updateData.nom = nom;
  if (description !== undefined) updateData.description = description;
  if (materiel !== undefined) updateData.materiel = materiel;
  if (notes !== undefined) updateData.notes = notes;
  if (critereReussite !== undefined) updateData.critereReussite = critereReussite;
  if (variablesPlus !== undefined) updateData.variablesPlus = JSON.stringify(normalizeStringArray(variablesPlus));
  if (variablesMinus !== undefined) updateData.variablesMinus = JSON.stringify(normalizeStringArray(variablesMinus));
  if (points !== undefined) updateData.points = JSON.stringify(normalizeStringArray(points));

  // Gestion de l'image
  if (file) {
    updateData.imageUrl = file.cloudinaryUrl;
  } else if (imageUrl !== undefined) {
    updateData.imageUrl = imageUrl === '' ? null : imageUrl;
  }

  // Gestion des tags
  if (Array.isArray(tagIds)) {
    await validateExerciceTags(tagIds, workspaceId);
    
    updateData.tags = {
      set: [],
      connect: tagIds.map(id => ({ id }))
    };
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`--- Données préparées pour prisma.exercice.update (ID: ${id}) ---`, updateData);
  }

  const exerciceUpdated = await prisma.exercice.update({
    where: { id, workspaceId },
    data: updateData,
    include: { tags: true }
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`--- Exercice mis à jour avec succès (ID: ${exerciceUpdated.id}) ---`);
  }

  return parseExerciceJsonFields(exerciceUpdated);
}

/**
 * Dupliquer un exercice
 */
async function duplicateExercice(id, workspaceId) {
  const originalExercice = await prisma.exercice.findFirst({
    where: { id, workspaceId },
    include: { tags: true }
  });

  if (!originalExercice) {
    const error = new Error('Exercice non trouvé');
    error.statusCode = 404;
    throw error;
  }

  const duplicatedExercice = await prisma.exercice.create({
    data: {
      nom: `${originalExercice.nom} (Copie)`,
      description: originalExercice.description,
      imageUrl: originalExercice.imageUrl,
      materiel: originalExercice.materiel,
      notes: originalExercice.notes,
      workspaceId: originalExercice.workspaceId,
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

  return parseExerciceJsonFields(duplicatedExercice);
}

/**
 * Supprimer un exercice
 */
async function deleteExercice(id, workspaceId) {
  const exercice = await prisma.exercice.findFirst({ where: { id, workspaceId } });

  if (!exercice) {
    const error = new Error('Exercice non trouvé');
    error.statusCode = 404;
    throw error;
  }

  await prisma.exercice.delete({ where: { id, workspaceId } });
}

module.exports = {
  getAllExercices,
  getExerciceById,
  createExercice,
  updateExercice,
  duplicateExercice,
  deleteExercice
};
