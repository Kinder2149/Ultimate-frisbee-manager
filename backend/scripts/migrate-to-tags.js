/**
 * Script de migration pour convertir les anciens champs des exercices vers le système de tags
 * Ce script:
 * 1. Convertit les valeurs 'objectif' en tags de catégorie 'objectif'
 * 2. Convertit les valeurs 'elementsTravail' en tags de catégorie 'element'
 * 3. Convertit les valeurs 'variables' en tags de catégorie 'variable'
 * 
 * Après avoir exécuté ce script, tous les exercices seront liés aux tags appropriés
 * et les anciens champs pourront être supprimés du schéma Prisma.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Couleurs par défaut par catégorie
const DEFAULT_COLORS = {
  'objectif': '#4285F4',   // Bleu
  'element': '#FBBC05',    // Jaune
  'variable': '#EA4335',   // Rouge
  'niveau': '#34A853'      // Vert
};

// Fonction principale pour la migration
async function migrateToTags() {
  console.log('Début de la migration des anciens champs vers les tags...');
  
  // 1. Récupérer tous les exercices avec les anciens champs
  const exercices = await prisma.exercice.findMany({
    include: {
      tags: true
    }
  });
  
  console.log(`${exercices.length} exercices trouvés à migrer.`);
  
  // Compteurs pour le rapport
  let objectifsConvertis = 0;
  let elementsConvertis = 0;
  let variablesConverties = 0;
  let exercicesTraites = 0;
  
  // 2. Traiter chaque exercice
  for (const exercice of exercices) {
    let tagsToConnect = [];
    exercicesTraites++;
    
    // Traitement du champ 'objectif'
    if (exercice.objectif) {
      const objectifTag = await findOrCreateTag(exercice.objectif, 'objectif');
      if (!exerciceHasTag(exercice, objectifTag.id)) {
        tagsToConnect.push({ id: objectifTag.id });
        objectifsConvertis++;
      }
    }
    
    // Traitement du champ 'elementsTravail'
    if (exercice.elementsTravail) {
      try {
        const elements = JSON.parse(exercice.elementsTravail);
        if (Array.isArray(elements)) {
          for (const element of elements) {
            const elementTag = await findOrCreateTag(element, 'element');
            if (!exerciceHasTag(exercice, elementTag.id)) {
              tagsToConnect.push({ id: elementTag.id });
              elementsConvertis++;
            }
          }
        }
      } catch (error) {
        console.error(`Erreur parsing JSON elementsTravail pour exercice ${exercice.id}: ${error.message}`);
      }
    }
    
    // Traitement du champ 'variables'
    if (exercice.variables) {
      try {
        const variables = JSON.parse(exercice.variables);
        if (Array.isArray(variables)) {
          for (const variable of variables) {
            const variableTag = await findOrCreateTag(variable, 'variable');
            if (!exerciceHasTag(exercice, variableTag.id)) {
              tagsToConnect.push({ id: variableTag.id });
              variablesConverties++;
            }
          }
        }
      } catch (error) {
        console.error(`Erreur parsing JSON variables pour exercice ${exercice.id}: ${error.message}`);
      }
    }
    
    // Ajouter les nouveaux tags à l'exercice s'il y en a
    if (tagsToConnect.length > 0) {
      await prisma.exercice.update({
        where: { id: exercice.id },
        data: {
          tags: {
            connect: tagsToConnect
          }
        }
      });
      console.log(`Exercice ${exercice.id} (${exercice.nom}) mis à jour avec ${tagsToConnect.length} nouveaux tags.`);
    }
    
    // Afficher la progression tous les 10 exercices
    if (exercicesTraites % 10 === 0 || exercicesTraites === exercices.length) {
      console.log(`Progression: ${exercicesTraites}/${exercices.length} exercices traités.`);
    }
  }
  
  // 3. Afficher le résultat de la migration
  console.log('\n--- Résumé de la migration ---');
  console.log(`Total exercices traités: ${exercicesTraites}`);
  console.log(`Objectifs convertis en tags: ${objectifsConvertis}`);
  console.log(`Éléments convertis en tags: ${elementsConvertis}`);
  console.log(`Variables converties en tags: ${variablesConverties}`);
  console.log(`Total conversions: ${objectifsConvertis + elementsConvertis + variablesConverties}`);
  
  console.log('\nMigration terminée avec succès!');
  console.log('IMPORTANT: Vous pouvez maintenant mettre à jour le schéma Prisma pour supprimer les champs objectif, elementsTravail et variables.');
}

// Fonction utilitaire pour vérifier si un exercice a déjà un tag
function exerciceHasTag(exercice, tagId) {
  return exercice.tags.some(tag => tag.id === tagId);
}

// Fonction pour trouver ou créer un tag
async function findOrCreateTag(label, category) {
  // Normalisation du label pour éviter les doublons
  const normalizedLabel = label.trim();
  
  // Chercher si le tag existe déjà
  let tag = await prisma.tag.findFirst({
    where: {
      label: normalizedLabel,
      category: category
    }
  });
  
  // Créer le tag s'il n'existe pas
  if (!tag) {
    tag = await prisma.tag.create({
      data: {
        label: normalizedLabel,
        category: category,
        color: DEFAULT_COLORS[category] || null
      }
    });
    console.log(`Nouveau tag créé: "${normalizedLabel}" (catégorie: ${category})`);
  }
  
  return tag;
}

// Exécuter la migration
migrateToTags()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Erreur lors de la migration:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
