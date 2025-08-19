// Script de migration pour renommer la catégorie 'element' en 'travail_specifique'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function renameElementCategory() {
  console.log('Début de la migration pour renommer "element" en "travail_specifique"...');

  try {
    // 1. Récupérer tous les tags de la catégorie 'element'
    const elementTags = await prisma.tag.findMany({
      where: {
        category: 'element'
      }
    });

    console.log(`${elementTags.length} tags de catégorie 'element' trouvés.`);

    // 2. Mettre à jour chaque tag pour utiliser la nouvelle catégorie
    for (const tag of elementTags) {
      await prisma.tag.update({
        where: { id: tag.id },
        data: { category: 'travail_specifique' }
      });
      console.log(`✅ Tag "${tag.label}" mis à jour vers la catégorie 'travail_specifique'`);
    }

    console.log('Migration terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la fonction de migration
renameElementCategory();
