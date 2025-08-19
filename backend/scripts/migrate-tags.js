/**
 * Script de migration pour convertir les anciens champs (objectif, elementsTravail, variables) 
 * en relations avec le nouveau modèle Tag.
 * 
 * Ce script :
 * 1. Récupère tous les exercices existants
 * 2. Crée des tags à partir des valeurs stockées
 * 3. Établit les relations entre les tags et les exercices
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Couleurs par défaut pour chaque catégorie
const DEFAULT_COLORS = {
  objectif: {
    'Technique': '#FF5722',
    'Tactique': '#2196F3',
    'Physique': '#4CAF50',
    'Mental': '#9C27B0'
  },
  element: '#607D8B',
  variable: '#FFC107'
};

/**
 * Crée les tags de base pour les objectifs s'ils n'existent pas déjà
 */
async function createDefaultObjectifTags() {
  console.log('Création des tags objectifs par défaut...');
  const defaultObjectifs = ['Technique', 'Tactique', 'Physique', 'Mental'];
  
  for (const objectif of defaultObjectifs) {
    await ensureTagExists(
      objectif,
      'objectif',
      DEFAULT_COLORS.objectif[objectif] || '#795548'
    );
  }
  console.log('Tags objectifs par défaut créés ou vérifiés.');
}

/**
 * Fonction principale de migration
 */
async function migrateTagsFromExercices() {
  console.log('Démarrage de la migration des tags...');

  try {
    // Créer d'abord les tags objectifs par défaut
    await createDefaultObjectifTags();
    // Récupérer tous les exercices
    const exercices = await prisma.exercice.findMany();
    console.log(`Trouvé ${exercices.length} exercices à migrer`);

    // Pour chaque exercice, traiter les tags
    for (const exercice of exercices) {
      console.log(`Traitement de l'exercice: ${exercice.nom} (${exercice.id})`);
      
      // Tableau pour stocker les IDs des tags liés à cet exercice
      const tagIdsForExercice = [];

      // 1. Traiter l'objectif
      if (exercice.objectif) {
        console.log(`  Objectif trouvé: ${exercice.objectif}`);
        const objectifTagId = await ensureTagExists(
          exercice.objectif,
          'objectif',
          DEFAULT_COLORS.objectif[exercice.objectif] || '#795548'
        );
        tagIdsForExercice.push(objectifTagId);
      }

      // 2. Traiter les éléments travaillés
      if (exercice.elementsTravail) {
        try {
          const elements = JSON.parse(exercice.elementsTravail);
          console.log(`  ${elements.length} éléments trouvés`);
          
          for (const element of elements) {
            const elementTagId = await ensureTagExists(
              element,
              'element',
              DEFAULT_COLORS.element
            );
            tagIdsForExercice.push(elementTagId);
          }
        } catch (e) {
          console.error(`  Erreur lors du parsing des éléments: ${e.message}`);
        }
      }

      // 3. Traiter les variables
      if (exercice.variables) {
        try {
          const variables = JSON.parse(exercice.variables);
          console.log(`  ${variables.length} variables trouvées`);
          
          for (const variable of variables) {
            const variableTagId = await ensureTagExists(
              variable,
              'variable',
              DEFAULT_COLORS.variable
            );
            tagIdsForExercice.push(variableTagId);
          }
        } catch (e) {
          console.error(`  Erreur lors du parsing des variables: ${e.message}`);
        }
      }

      // 4. Établir les relations entre l'exercice et ses tags
      if (tagIdsForExercice.length > 0) {
        await connectExerciceToTags(exercice.id, tagIdsForExercice);
        console.log(`  ${tagIdsForExercice.length} tags connectés à l'exercice`);
      }
    }

    console.log('Migration terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Vérifie si un tag existe déjà, sinon le crée
 * @param {string} label - Le libellé du tag
 * @param {string} category - La catégorie du tag (objectif, element, variable)
 * @param {string} color - La couleur par défaut du tag
 * @returns {string} - L'ID du tag
 */
async function ensureTagExists(label, category, color) {
  // Chercher si le tag existe déjà
  const existingTag = await prisma.tag.findFirst({
    where: {
      label,
      category
    }
  });

  // Si le tag existe, retourner son ID
  if (existingTag) {
    return existingTag.id;
  }

  // Sinon, créer un nouveau tag
  const newTag = await prisma.tag.create({
    data: {
      label,
      category,
      color
    }
  });

  return newTag.id;
}

/**
 * Établit les relations entre un exercice et ses tags
 * @param {string} exerciceId - L'ID de l'exercice
 * @param {string[]} tagIds - Les IDs des tags à associer
 */
async function connectExerciceToTags(exerciceId, tagIds) {
  await prisma.exercice.update({
    where: { id: exerciceId },
    data: {
      tags: {
        connect: tagIds.map(id => ({ id }))
      }
    }
  });
}

// Exécuter la migration
migrateTagsFromExercices()
  .then(() => console.log('Script terminé'))
  .catch(e => {
    console.error('Erreur fatale:', e);
    process.exit(1);
  });

// Si vous voulez seulement créer les tags objectifs par défaut sans faire la migration complète,
// décommentez cette ligne et commentez l'appel migrateTagsFromExercices() ci-dessus
createDefaultObjectifTags().then(() => console.log('Tags objectifs créés')).catch(e => console.error(e));
