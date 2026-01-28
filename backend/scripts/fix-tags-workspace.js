/**
 * Script pour associer les tags au workspace BASE
 * 
 * Les tags créés par le seed ne sont pas associés à un workspace,
 * ce qui les rend invisibles dans l'interface utilisateur.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Association des tags au workspace BASE\n');

  try {
    // 1. Récupérer le workspace BASE
    console.log('🔍 Recherche du workspace BASE...');
    const baseWorkspace = await prisma.workspace.findFirst({
      where: { name: 'BASE' }
    });

    if (!baseWorkspace) {
      console.error('❌ Workspace BASE non trouvé !');
      console.log('Exécutez d\'abord le seed des workspaces:');
      console.log('   npx prisma db seed\n');
      return;
    }

    console.log(`✅ Workspace BASE trouvé (ID: ${baseWorkspace.id})\n`);

    // 2. Récupérer tous les tags
    console.log('📥 Récupération des tags...');
    const tags = await prisma.tag.findMany();

    console.log(`✅ ${tags.length} tags trouvés\n`);

    // 3. Identifier les tags sans workspace
    const tagsWithoutWorkspace = tags.filter(tag => !tag.workspaceId);
    
    if (tagsWithoutWorkspace.length === 0) {
      console.log('✅ Tous les tags sont déjà associés à un workspace');
      return;
    }

    console.log(`⚠️  ${tagsWithoutWorkspace.length} tags sans workspace:\n`);

    // 4. Associer les tags au workspace BASE
    console.log('➕ Association des tags au workspace BASE...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const tag of tagsWithoutWorkspace) {
      try {
        await prisma.tag.update({
          where: { id: tag.id },
          data: { workspaceId: baseWorkspace.id }
        });
        console.log(`   ✅ ${tag.label} (${tag.category})`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ ${tag.label}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Association terminée !`);
    console.log(`   - Succès: ${successCount} tags`);
    if (errorCount > 0) {
      console.log(`   - Erreurs: ${errorCount} tags`);
    }

    // 5. Vérification finale
    console.log('\n📊 Vérification finale:');
    const finalTags = await prisma.tag.findMany({
      where: {
        workspaceId: baseWorkspace.id
      },
      orderBy: [
        { category: 'asc' },
        { label: 'asc' }
      ]
    });

    console.log(`✅ ${finalTags.length} tags associés au workspace BASE\n`);

    // Grouper par catégorie
    const tagsByCategory = finalTags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {});

    console.log('📁 Tags par catégorie:');
    Object.keys(tagsByCategory).sort().forEach(category => {
      console.log(`   - ${category}: ${tagsByCategory[category].length} tags`);
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
