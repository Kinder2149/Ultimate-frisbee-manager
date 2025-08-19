const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script de migration pour corriger la casse des catégories de tags
 * Convertit les catégories MAJUSCULES vers minuscules
 */
async function migrateCategoriesCase() {
  console.log('🔄 Début de la migration des catégories de tags...');

  try {
    // Mapping des anciennes vers nouvelles catégories
    const categoryMapping = {
      'OBJECTIF': 'objectif',
      'TRAVAIL_SPECIFIQUE': 'travail_specifique',
      'NIVEAU': 'niveau',
      'TEMPS': 'temps',
      'FORMAT': 'format'
    };

    let totalUpdated = 0;

    // Mettre à jour chaque catégorie
    for (const [oldCategory, newCategory] of Object.entries(categoryMapping)) {
      const result = await prisma.tag.updateMany({
        where: {
          category: oldCategory
        },
        data: {
          category: newCategory
        }
      });

      if (result.count > 0) {
        console.log(`✅ Migré ${result.count} tags de '${oldCategory}' vers '${newCategory}'`);
        totalUpdated += result.count;
      }
    }

    if (totalUpdated === 0) {
      console.log('ℹ️  Aucune migration nécessaire - toutes les catégories sont déjà en minuscules');
    } else {
      console.log(`🎉 Migration terminée avec succès ! ${totalUpdated} tags mis à jour`);
    }

    // Vérification finale
    const allTags = await prisma.tag.findMany({
      select: {
        id: true,
        label: true,
        category: true
      }
    });

    console.log('\n📊 État final des catégories :');
    const categoryCounts = allTags.reduce((acc, tag) => {
      acc[tag.category] = (acc[tag.category] || 0) + 1;
      return acc;
    }, {});

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} tags`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécution du script
migrateCategoriesCase()
  .catch((e) => {
    console.error('❌ Échec de la migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Connexion Prisma fermée');
  });
