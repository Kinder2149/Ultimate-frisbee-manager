// Script pour ajouter des tags par défaut pour les catégories Temps et Format
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Tags par défaut pour la catégorie Temps
 */
const defaultTimeTags = [
  { label: '5-10 min', category: 'temps', color: '#607D8B' },
  { label: '10-15 min', category: 'temps', color: '#607D8B' },
  { label: '15-30 min', category: 'temps', color: '#607D8B' },
  { label: '30+ min', category: 'temps', color: '#607D8B' }
];

/**
 * Tags par défaut pour la catégorie Format
 */
const defaultFormatTags = [
  { label: '1v1', category: 'format', color: '#795548' },
  { label: '2v2', category: 'format', color: '#795548' },
  { label: '3v3', category: 'format', color: '#795548' },
  { label: '4v4', category: 'format', color: '#795548' },
  { label: '5v5', category: 'format', color: '#795548' },
  { label: '7v7', category: 'format', color: '#795548' },
  { label: 'Individuel', category: 'format', color: '#795548' },
  { label: 'Groupe', category: 'format', color: '#795548' }
];

/**
 * Fonction principale qui ajoute les tags par défaut
 */
async function addDefaultTags() {
  console.log('Ajout des tags par défaut pour les catégories Temps et Format...');
  
  try {
    // Ajouter les tags de temps
    for (const tag of defaultTimeTags) {
      // Vérifier si le tag existe déjà
      const existingTag = await prisma.tag.findFirst({
        where: {
          label: tag.label,
          category: tag.category
        }
      });
      
      if (!existingTag) {
        await prisma.tag.create({
          data: tag
        });
        console.log(`✅ Tag créé: ${tag.label} (${tag.category})`);
      } else {
        console.log(`⚠️ Tag existe déjà: ${tag.label} (${tag.category})`);
      }
    }
    
    // Ajouter les tags de format
    for (const tag of defaultFormatTags) {
      // Vérifier si le tag existe déjà
      const existingTag = await prisma.tag.findFirst({
        where: {
          label: tag.label,
          category: tag.category
        }
      });
      
      if (!existingTag) {
        await prisma.tag.create({
          data: tag
        });
        console.log(`✅ Tag créé: ${tag.label} (${tag.category})`);
      } else {
        console.log(`⚠️ Tag existe déjà: ${tag.label} (${tag.category})`);
      }
    }
    
    console.log('Migration terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction
addDefaultTags();
