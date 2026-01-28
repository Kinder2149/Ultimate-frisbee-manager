/**
 * Script pour vérifier les tags dans la base de données
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification des tags dans la base de données\n');

  try {
    // Récupérer tous les tags
    const tags = await prisma.tag.findMany({
      orderBy: [
        { category: 'asc' },
        { label: 'asc' }
      ]
    });

    console.log(`✅ ${tags.length} tags trouvés dans la base de données\n`);

    if (tags.length === 0) {
      console.log('❌ Aucun tag trouvé ! Exécutez le seed pour créer les tags:');
      console.log('   npx prisma db seed\n');
      return;
    }

    // Grouper par catégorie
    const tagsByCategory = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {});

    // Afficher les tags par catégorie
    console.log('📊 Tags par catégorie:\n');
    
    Object.keys(tagsByCategory).sort().forEach(category => {
      console.log(`\n📁 ${category} (${tagsByCategory[category].length} tags):`);
      tagsByCategory[category].forEach(tag => {
        console.log(`   - ${tag.label} (${tag.color})`);
      });
    });

    // Vérifier les catégories attendues
    console.log('\n\n🎯 Catégories attendues dans l\'UI:');
    const expectedCategories = [
      'OBJECTIF',
      'TRAVAIL_SPECIFIQUE',
      'NIVEAU',
      'TEMPS',
      'FORMAT',
      'THEME_ENTRAINEMENT'
    ];

    expectedCategories.forEach(cat => {
      const count = tagsByCategory[cat]?.length || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`   ${status} ${cat}: ${count} tags`);
    });

    // Vérifier les workspaces
    console.log('\n\n🏢 Vérification des workspaces:');
    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    workspaces.forEach(ws => {
      console.log(`   - ${ws.name} (${ws._count.users} utilisateurs)`);
    });

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
