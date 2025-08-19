const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fonction utilitaire pour traiter les variables d'exercice
 * Gère la migration automatique entre l'ancien format (variablesText) et le nouveau (variablesPlus/Minus)
 * Supporte à la fois les formats string et array pour les variables
 * @param {string} variablesText - L'ancien format de texte de variables
 * @param {string|string[]} variablesPlus - Les variables qui augmentent la difficulté
 * @param {string|string[]} variablesMinus - Les variables qui diminuent la difficulté
 * @returns {Object} Les variables traitées sous forme de chaînes pour Prisma
 */
const processExerciceVariables = (variablesText, variablesPlus, variablesMinus) => {
  console.log('processExerciceVariables - Types reçus:', { 
    variablesText: typeof variablesText,
    variablesPlus: Array.isArray(variablesPlus) ? 'array' : typeof variablesPlus,
    variablesMinus: Array.isArray(variablesMinus) ? 'array' : typeof variablesMinus
  });
  
  // Convertir les tableaux en chaînes si nécessaire
  let variablesPlusString = '';
  let variablesMinusString = '';
  
  // Traitement de variablesPlus
  if (Array.isArray(variablesPlus)) {
    // Filtrer les valeurs vides et jointure avec saut de ligne
    variablesPlusString = variablesPlus
      .filter(v => v !== null && v !== undefined && v.trim() !== '')
      .join('\n');
    console.log('Conversion array → string pour variablesPlus:', { 
      original: variablesPlus, 
      resultat: variablesPlusString
    });
  } else if (typeof variablesPlus === 'string') {
    variablesPlusString = variablesPlus;
  }
  
  // Traitement de variablesMinus
  if (Array.isArray(variablesMinus)) {
    // Filtrer les valeurs vides et jointure avec saut de ligne
    variablesMinusString = variablesMinus
      .filter(v => v !== null && v !== undefined && v.trim() !== '')
      .join('\n');
    console.log('Conversion array → string pour variablesMinus:', { 
      original: variablesMinus, 
      resultat: variablesMinusString
    });
  } else if (typeof variablesMinus === 'string') {
    variablesMinusString = variablesMinus;
  }
  
  // Résultat par défaut
  const result = {
    variablesText: variablesText || '',
    variablesPlus: variablesPlusString,
    variablesMinus: variablesMinusString
  };
  
  // Si nous avons du texte dans l'ancien format mais pas dans le nouveau, migrer
  if (variablesText && (!variablesPlusString && !variablesMinusString)) {
    console.log('Migration des variables depuis l\'ancien format');
    
    const lines = variablesText.split('\n');
    const plusVariables = [];
    const minusVariables = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('+')) {
        plusVariables.push(trimmedLine.substring(1).trim());
      } else if (trimmedLine.startsWith('-')) {
        minusVariables.push(trimmedLine.substring(1).trim());
      } else if (trimmedLine) {
        // Si pas de préfixe, on le considère comme '+'
        plusVariables.push(trimmedLine);
      }
    });
    
    // Mettre à jour les variables au nouveau format
    result.variablesPlus = plusVariables.join('\n');
    result.variablesMinus = minusVariables.join('\n');
  }
  
  console.log('Variables traitées:', { 
    variablesPlus: result.variablesPlus ? `${result.variablesPlus.length} caractères` : 'vide',
    variablesMinus: result.variablesMinus ? `${result.variablesMinus.length} caractères` : 'vide'
  });
  
  return result;
};

/**
 * Récupérer tous les exercices avec leurs tags
 * @route GET /api/exercices
 */
exports.getAllExercices = async (req, res) => {
  try {
    const exercices = await prisma.exercice.findMany({
      include: {
        tags: true // Inclure les tags associés
      }
    });
    
    res.json(exercices);
  } catch (error) {
    console.error('Erreur lors de la récupération des exercices:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des exercices' });
  }
};

/**
 * Récupérer un exercice par son ID
 * @route GET /api/exercices/:id
 */
exports.getExerciceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exercice = await prisma.exercice.findUnique({
      where: { id },
      include: { tags: true } // Inclure les tags associés
    });
    
    if (!exercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }
    
    res.json(exercice);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'exercice:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'exercice' });
  }
};

/**
 * Créer un nouvel exercice avec ses tags
 * @route POST /api/exercices
 */
exports.createExercice = async (req, res) => {
  try {
    const { nom, description, schemaUrl, variablesText, variablesPlus, variablesMinus, tags, tagIds } = req.body;
    
    // Journalisation des données reçues pour débogage
    console.log('Données reçues pour création d\'exercice:', { 
      nom, description: description ? description.substring(0, 50) + '...' : null, schemaUrl, variablesText, 
      variablesPlus: Array.isArray(variablesPlus) ? `[${variablesPlus.length} éléments]` : variablesPlus,
      variablesMinus: Array.isArray(variablesMinus) ? `[${variablesMinus.length} éléments]` : variablesMinus,
      tagsInfo: { tagIdsProvided: tagIds !== undefined, tagsProvided: tags !== undefined }
    });
    
    // Validation basique des données
    if (!nom || !description) {
      return res.status(400).json({ error: 'Nom et description sont requis' });
    }
    
    // CORRECTION: Traitement des variables - Assurer la compatibilité entre les formats tableau et texte
    // La fonction processExerciceVariables convertit les tableaux en chaînes pour Prisma
    const processedVariables = processExerciceVariables(variablesText, variablesPlus, variablesMinus);
    
    // Préparer les données pour la création
    let createData = {
      nom,
      description: description || '', // S'assurer que description n'est jamais null/undefined
      imageUrl: req.body.imageUrl || null,
      schemaUrl: schemaUrl || null,
      // CORRECTION: Utiliser explicitement les chaînes de caractères traitées pour Prisma
      variablesText: processedVariables.variablesText || '',
      variablesPlus: processedVariables.variablesPlus || '',
      variablesMinus: processedVariables.variablesMinus || '',
      tags: { // Relation avec les tags
        create: [] // Par défaut, pas de tags à créer
      }
    };
    
    // Gérer la relation avec les tags existants de manière plus robuste
    if (tagIds && Array.isArray(tagIds)) {
      // Filtrer les IDs invalides
      const validTagIds = tagIds.filter(id => id !== null && id !== undefined);
      if (validTagIds.length > 0) {
        // Si on reçoit des IDs de tags valides, les connecter
        createData.tags = {
          connect: validTagIds.map(tagId => ({ id: tagId }))
        };
      }
    } else if (tags && Array.isArray(tags)) {
      // Si on reçoit des objets tags, extraire les IDs valides
      const tagIdsToConnect = tags
        .filter(tag => tag && (typeof tag === 'object' ? tag.id : typeof tag === 'string'))
        .map(tag => {
          // Si c'est un objet tag
          if (typeof tag === 'object' && tag.id) {
            return { id: tag.id };
          }
          // Si c'est déjà un ID (string)
          else if (typeof tag === 'string') {
            return { id: tag };
          }
          return null;
        })
        .filter(item => item !== null);
      
      if (tagIdsToConnect.length > 0) {
        createData.tags = {
          connect: tagIdsToConnect
        };
      }
    }
    
    console.log('Données préparées pour création:', {
      nom: createData.nom,
      description: createData.description ? `${createData.description.length} caractères` : 'vide',
      variablesPlus: createData.variablesPlus ? `${createData.variablesPlus.length} caractères` : 'vide',
      variablesMinus: createData.variablesMinus ? `${createData.variablesMinus.length} caractères` : 'vide',
      tags: createData.tags && createData.tags.connect ? 
        `${createData.tags.connect.length} tags à connecter` : 'aucun tag'
    });
    
    // Créer l'exercice avec ses tags dans une transaction
    const newExercice = await prisma.exercice.create({
      data: createData,
      include: {
        tags: true // Inclure les tags dans le résultat
      }
    });
    
    console.log('Exercice créé avec succès:', {
      id: newExercice.id,
      nom: newExercice.nom,
      description: newExercice.description ? `${newExercice.description.length} caractères` : 'vide',
      variablesPlus: newExercice.variablesPlus ? `${newExercice.variablesPlus.length} caractères` : 'vide',
      variablesMinus: newExercice.variablesMinus ? `${newExercice.variablesMinus.length} caractères` : 'vide',
      tagsCount: newExercice.tags.length,
      tagIds: newExercice.tags.map(t => t.id)
    });

    // Transformation pour le client: convertir les variables au format tableau
    // pour consommation par le frontend
    const clientResponse = {
      ...newExercice,
      // Si les variables sont non vides, les convertir en tableaux
      variablesPlus: newExercice.variablesPlus ? 
        newExercice.variablesPlus.split('\n').filter(v => v.trim() !== '') : 
        [],
      variablesMinus: newExercice.variablesMinus ? 
        newExercice.variablesMinus.split('\n').filter(v => v.trim() !== '') : 
        []
    };
    
    // Renvoyer l'exercice avec les variables au format tableau attendu par le frontend
    res.status(201).json(clientResponse);
  } catch (error) {
    console.error('Erreur lors de la création de l\'exercice:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l\'exercice', details: error.message });
  }
};

/**
 * Mettre à jour un exercice
 * @route PUT /api/exercices/:id
 */
exports.updateExercice = async (req, res) => {
try {
const { id } = req.params;
const { nom, description, schemaUrl, variablesText, variablesPlus, variablesMinus, tags, tagIds } = req.body;

// Vérifier si l'exercice existe
const existingExercice = await prisma.exercice.findUnique({
where: { id },
include: { tags: true }
});

if (!existingExercice) {
return res.status(404).json({ error: 'Exercice non trouvé' });
}

// Journalisation des données reçues pour débogage
console.log(`Données reçues pour mise à jour d'exercice (ID: ${id}):`, { 
nom, 
description: description ? `${description.length} caractères` : 'absent',
schemaUrl: schemaUrl || 'absent', 
variablesText: variablesText || 'absent',
variablesPlus: variablesPlus ? (Array.isArray(variablesPlus) ? `[${variablesPlus.length} éléments]` : 'chaîne') : 'absent',
variablesMinus: variablesMinus ? (Array.isArray(variablesMinus) ? `[${variablesMinus.length} éléments]` : 'chaîne') : 'absent',
tagsInfo: { tagIdsProvided: tagIds !== undefined, tagsProvided: tags !== undefined }
});

// CORRECTION: Traitement des variables - Assurer la compatibilité entre les formats tableau et texte
// La fonction processExerciceVariables convertit les tableaux en chaînes pour Prisma
const processedVariables = processExerciceVariables(variablesText, variablesPlus, variablesMinus);

// Préparer les données de mise à jour
let updateData = {
nom,
description: description || '', // S'assurer que description n'est jamais null/undefined
imageUrl: req.body.imageUrl || null,
schemaUrl: schemaUrl || null,
// CORRECTION: Utiliser explicitement les chaînes de caractères traitées pour Prisma
variablesText: processedVariables.variablesText || '',
variablesPlus: processedVariables.variablesPlus || '',
variablesMinus: processedVariables.variablesMinus || ''
};

// CORRECTIF: Gestion plus robuste des tags
// Uniquement mise à jour des tags si tagIds ou tags est fourni
if (tagIds !== undefined || tags !== undefined) {
let tagIdsToConnect = [];

if (Array.isArray(tagIds)) {
// Si des IDs de tags sont fournis directement
tagIdsToConnect = tagIds.filter(id => id !== null && id !== undefined);
} else if (Array.isArray(tags)) {
// Si des objets tags sont fournis, extraire les IDs
tagIdsToConnect = tags.map(tag => {
// Si c'est un objet tag complet
if (tag && typeof tag === 'object' && tag.id) {
return tag.id;
}
// Si c'est déjà un ID
else if (typeof tag === 'string') {
return tag;
}
return null;
}).filter(id => id !== null);
}

updateData.tags = {
set: [], // Déconnecter tous les tags existants
connect: tagIdsToConnect.map(id => ({ id }))
};
}

console.log('Données préparées pour mise à jour:', {
nom: updateData.nom,
description: updateData.description ? `${updateData.description.length} caractères` : 'vide',
variablesPlus: updateData.variablesPlus ? `${updateData.variablesPlus.length} caractères` : 'vide',
variablesMinus: updateData.variablesMinus ? `${updateData.variablesMinus.length} caractères` : 'vide',
tags: updateData.tags ? {
connectCount: updateData.tags.connect.length,
connectSample: updateData.tags.connect.slice(0, 3)
} : 'non modifiés'
});

// Mettre à jour l'exercice avec tous les champs et relations dans une seule transaction
const exerciceUpdated = await prisma.exercice.update({
where: { id },
data: updateData,
include: { tags: true }
});

// Journaliser l'exercice mis à jour pour vérifier que tout est bien enregistré
console.log('Exercice mis à jour avec succès:', { 
id: exerciceUpdated.id,
nom: exerciceUpdated.nom,
description: exerciceUpdated.description ? `${exerciceUpdated.description.length} caractères` : 'vide',
variablesPlus: exerciceUpdated.variablesPlus ? `${exerciceUpdated.variablesPlus.length} caractères` : 'vide',
variablesMinus: exerciceUpdated.variablesMinus ? `${exerciceUpdated.variablesMinus.length} caractères` : 'vide',
tagsCount: exerciceUpdated.tags.length,
hasTags: exerciceUpdated.tags.length > 0
});

// Transformation pour le client: convertir les variables au format tableau
// pour consommation par le frontend
const clientResponse = {
...exerciceUpdated,
// Si les variables sont non vides, les convertir en tableaux
variablesPlus: exerciceUpdated.variablesPlus ? 
exerciceUpdated.variablesPlus.split('\n').filter(v => v.trim() !== '') : 
[],
variablesMinus: exerciceUpdated.variablesMinus ? 
exerciceUpdated.variablesMinus.split('\n').filter(v => v.trim() !== '') : 
[]
};

// Renvoyer l'exercice avec les variables au format tableau attendu par le frontend
res.json(clientResponse);
} catch (error) {
console.error('Erreur lors de la mise à jour de l\'exercice:', error);
res.status(500).json({ 
error: 'Erreur serveur lors de la mise à jour de l\'exercice',
details: error.message 
});
}
};

/**
 * Dupliquer un exercice
 * @route POST /api/exercices/:id/duplicate
 */
exports.duplicateExercice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'exercice original avec ses tags
    const originalExercice = await prisma.exercice.findUnique({
      where: { id },
      include: { tags: true }
    });
    
    if (!originalExercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }
    
    // Créer une copie avec un nom modifié
    const duplicatedExercice = await prisma.exercice.create({
      data: {
        nom: `${originalExercice.nom} (Copie)`,
        description: originalExercice.description,
        imageUrl: originalExercice.imageUrl,
        schemaUrl: originalExercice.schemaUrl,
        variablesText: originalExercice.variablesText,
        variablesPlus: originalExercice.variablesPlus,
        variablesMinus: originalExercice.variablesMinus,
        // Connecter les mêmes tags
        tags: {
          connect: originalExercice.tags.map(tag => ({ id: tag.id }))
        }
      },
      include: { tags: true }
    });
    
    console.log('Exercice dupliqué avec succès:', {
      original: originalExercice.nom,
      duplicate: duplicatedExercice.nom,
      tagsCount: duplicatedExercice.tags.length
    });
    
    // Transformation pour le client: convertir les variables au format tableau
    const clientResponse = {
      ...duplicatedExercice,
      variablesPlus: duplicatedExercice.variablesPlus ? 
        duplicatedExercice.variablesPlus.split('\n').filter(v => v.trim() !== '') : 
        [],
      variablesMinus: duplicatedExercice.variablesMinus ? 
        duplicatedExercice.variablesMinus.split('\n').filter(v => v.trim() !== '') : 
        []
    };
    
    res.status(201).json(clientResponse);
  } catch (error) {
    console.error('Erreur lors de la duplication de l\'exercice:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la duplication de l\'exercice',
      details: error.message 
    });
  }
};

/**
 * Supprimer un exercice
 * @route DELETE /api/exercices/:id
 */
exports.deleteExercice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'exercice existe
    const exercice = await prisma.exercice.findUnique({ where: { id } });
    if (!exercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }
    
    // Supprimer l'exercice (les relations avec les tags seront automatiquement supprimées)
    await prisma.exercice.delete({ where: { id } });
    
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'exercice:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'exercice' });
  }
};