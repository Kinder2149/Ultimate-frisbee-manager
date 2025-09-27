const { prisma } = require('../services/prisma');

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
exports.getAllExercices = async (req, res, next) => {
  try {
    const exercices = await prisma.exercice.findMany({
      include: {
        tags: true // Inclure les tags associés
      }
    });
    
    res.json(exercices);
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
    
    const exercice = await prisma.exercice.findUnique({
      where: { id },
      include: { tags: true } // Inclure les tags associés
    });
    
    if (!exercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }
    
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
    const { nom, description, schemaUrl, variablesText, variablesPlus, variablesMinus, tags, tagIds, materiel, notes, objectif } = req.body;
    
    // Journalisation des données reçues pour débogage
    console.log('Données reçues pour création d\'exercice:', { 
      nom, description: description ? description.substring(0, 50) + '...' : null, schemaUrl, variablesText, 
      variablesPlus: Array.isArray(variablesPlus) ? `[${variablesPlus.length} éléments]` : variablesPlus,
      variablesMinus: Array.isArray(variablesMinus) ? `[${variablesMinus.length} éléments]` : variablesMinus,
      tagsInfo: { tagIdsProvided: tagIds !== undefined, tagsProvided: tags !== undefined },
      materiel: materiel ? `${String(materiel).slice(0,30)}...` : 'absent',
      notes: notes ? `${String(notes).slice(0,30)}...` : 'absent'
    });
    
    
    // CORRECTION: Traitement des variables - Assurer la compatibilité entre les formats tableau et texte
    // La fonction processExerciceVariables convertit les tableaux en chaînes pour Prisma
    const processedVariables = processExerciceVariables(variablesText, variablesPlus, variablesMinus);
    
    // Préparer les données pour la création
    let createData = {
      nom,
      description: description || '', // S'assurer que description n'est jamais null/undefined
      objectif: objectif || '', // Ajout du champ objectif
      imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl || null),
      schemaUrl: schemaUrl || null,
      materiel: materiel || null,
      notes: notes || null,
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
        `${createData.tags.connect.length} tags à connecter` : 'aucun tag',
      materiel: createData.materiel ? 'présent' : 'absent',
      notes: createData.notes ? 'présent' : 'absent'
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
    next(error);
  }
};

/**
 * Mettre à jour un exercice
 * @route PUT /api/exercices/:id
 */
exports.updateExercice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      nom, 
      description, 
      schemaUrl, 
      variablesText, 
      variablesPlus, 
      variablesMinus, 
      tags, 
      tagIds,
      objectif, // Pour la rétrocompatibilité
      materiel,
      notes
    } = req.body;

    // Vérifier si l'exercice existe
    const existingExercice = await prisma.exercice.findUnique({
      where: { id },
      include: { 
        tags: {
          select: {
            id: true,
            label: true,
            category: true,
            color: true
          }
        } 
      }
    });

    if (!existingExercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }

    // Journalisation des données reçues pour débogage
    console.log(`Données reçues pour mise à jour d'exercice (ID: ${id}):`, { 
      nom: nom ? `${nom.length} caractères` : 'absent', 
      description: description ? `${description.length} caractères` : 'absent',
      schemaUrl: schemaUrl ? 'présent' : 'absent',
      tagIds: tagIds ? (Array.isArray(tagIds) ? `[${tagIds.length} éléments]` : 'présent (non tableau)') : 'absent',
      tags: tags ? (Array.isArray(tags) ? `[${tags.length} éléments]` : 'présent (non tableau)') : 'absent',
      objectif: objectif ? 'présent' : 'absent'
    });

    // Traitement des variables - Assurer la compatibilité entre les formats
    const processedVariables = processExerciceVariables(variablesText, variablesPlus, variablesMinus);

    // Préparer les données de base pour la mise à jour
    const updateData = {};
    if (typeof nom !== 'undefined') updateData.nom = nom;
    if (typeof description !== 'undefined') updateData.description = description;
    // Gérer la mise à jour de l'image
    if (req.file) {
      // Si un nouveau fichier est uploadé, utiliser sa nouvelle URL
      updateData.imageUrl = req.file.cloudinaryUrl;
    } else if (typeof req.body.imageUrl !== 'undefined') {
      // Sinon, utiliser la valeur envoyée (peut être une URL existante ou null pour la supprimer)
      updateData.imageUrl = req.body.imageUrl || null;
    }
    if (typeof schemaUrl !== 'undefined') updateData.schemaUrl = schemaUrl;
    if (typeof materiel !== 'undefined') updateData.materiel = materiel || null;
    if (typeof notes !== 'undefined') updateData.notes = notes || null;
    updateData.variablesText = processedVariables.variablesText || existingExercice.variablesText || '';
    updateData.variablesPlus = processedVariables.variablesPlus || existingExercice.variablesPlus || '';
    updateData.variablesMinus = processedVariables.variablesMinus || existingExercice.variablesMinus || '';

    // Gestion des tags
    let tagIdsToConnect = [];
    
    // Déterminer la source des tags (priorité à tagIds, puis tags, puis objectif pour la rétrocompatibilité)
    if (tagIds !== undefined) {
      // Utiliser directement les IDs de tags fournis
      tagIdsToConnect = Array.isArray(tagIds) 
        ? tagIds.filter(id => id !== null && id !== undefined && id !== '')
        : [];
    } 
    else if (tags !== undefined && Array.isArray(tags)) {
      // Extraire les IDs d'objets tags
      tagIdsToConnect = tags
        .map(tag => (tag && typeof tag === 'object' ? tag.id : tag))
        .filter(id => id !== null && id !== undefined && id !== '');
    }
    
    // Si un objectif est fourni directement (rétrocompatibilité) et qu'aucun tag n'est fourni
    if (objectif && !tagIdsToConnect.length) {
      tagIdsToConnect = [objectif];
    }

    // Si des tags sont à connecter, préparer la mise à jour des relations
    if (tagIdsToConnect.length > 0) {
      // Vérifier que les tags existent avant de les connecter
      const existingTags = await prisma.tag.findMany({
        where: {
          id: { in: tagIdsToConnect }
        },
        select: { id: true }
      });

      const existingTagIds = existingTags.map(tag => tag.id);
      const missingTagIds = tagIdsToConnect.filter(id => !existingTagIds.includes(id));

      if (missingTagIds.length > 0) {
        console.warn(`Certains tags n'existent pas et seront ignorés:`, missingTagIds);
      }

      updateData.tags = {
        set: [], // Déconnecter tous les tags existants
        connect: existingTags.map(tag => ({ id: tag.id }))
      };
    }

    console.log('Mise à jour exercice: champs pris en compte =', {
      nom: Object.prototype.hasOwnProperty.call(updateData, 'nom'),
      description: Object.prototype.hasOwnProperty.call(updateData, 'description'),
      variablesText: Object.prototype.hasOwnProperty.call(updateData, 'variablesText'),
      variablesPlus: Object.prototype.hasOwnProperty.call(updateData, 'variablesPlus'),
      variablesMinus: Object.prototype.hasOwnProperty.call(updateData, 'variablesMinus'),
      tags: updateData.tags ? (updateData.tags.connect || updateData.tags.disconnect ? 'modifiés' : 'inchangés') 
        : 'Aucune modification des tags',
      imageUrlIncluded: Object.prototype.hasOwnProperty.call(updateData, 'imageUrl'),
      schemaUrlIncluded: Object.prototype.hasOwnProperty.call(updateData, 'schemaUrl'),
      materielIncluded: Object.prototype.hasOwnProperty.call(updateData, 'materiel'),
      notesIncluded: Object.prototype.hasOwnProperty.call(updateData, 'notes')
    });

    // Mettre à jour l'exercice dans une transaction
    const exerciceUpdated = await prisma.$transaction(async (prisma) => {
      const updatedExercice = await prisma.exercice.update({
        where: { id },
        data: updateData,
        include: { 
          tags: {
            select: {
              id: true,
              label: true,
              category: true,
              color: true
            }
          }
        }
      });
      
      return updatedExercice;
    });

    // Journaliser l'exercice mis à jour
    console.log('Exercice mis à jour avec succès:', { 
      id: exerciceUpdated.id,
      nom: exerciceUpdated.nom,
      tagsCount: exerciceUpdated.tags.length
    });

    // Préparer la réponse pour le client
    const clientResponse = {
      ...exerciceUpdated,
      // Convertir les variables en tableaux pour le frontend
      variablesPlus: exerciceUpdated.variablesPlus 
        ? exerciceUpdated.variablesPlus.split('\n').filter(v => v.trim() !== '')
        : [],
      variablesMinus: exerciceUpdated.variablesMinus 
        ? exerciceUpdated.variablesMinus.split('\n').filter(v => v.trim() !== '')
        : []
    };

    res.json(clientResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * Dupliquer un exercice
 * @route POST /api/exercices/:id/duplicate
 */
exports.duplicateExercice = async (req, res, next) => {
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
    
    // Vérifier si l'exercice existe
    const exercice = await prisma.exercice.findUnique({ where: { id } });
    if (!exercice) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }
    
    // Supprimer l'exercice (les relations avec les tags seront automatiquement supprimées)
    await prisma.exercice.delete({ where: { id } });
    
    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
};