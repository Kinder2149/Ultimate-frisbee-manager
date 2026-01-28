/**
 * Script pour tester l'API des tags et diagnostiquer pourquoi ils n'apparaissent pas
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Diagnostic de l\'API des tags\n');

  try {
    // 1. Vérifier les tags dans la base
    console.log('📊 1. Tags dans la base de données:');
    const allTags = await prisma.tag.findMany({
      orderBy: [{ category: 'asc' }, { label: 'asc' }]
    });
    console.log(`   Total: ${allTags.length} tags\n`);

    // 2. Grouper par workspace
    const tagsByWorkspace = allTags.reduce((acc, tag) => {
      const wsId = tag.workspaceId || 'NULL';
      if (!acc[wsId]) acc[wsId] = [];
      acc[wsId].push(tag);
      return acc;
    }, {});

    console.log('📁 2. Tags par workspace:');
    for (const [wsId, tags] of Object.entries(tagsByWorkspace)) {
      if (wsId === 'NULL') {
        console.log(`   ⚠️  Sans workspace: ${tags.length} tags`);
      } else {
        const workspace = await prisma.workspace.findUnique({
          where: { id: wsId },
          select: { name: true }
        });
        console.log(`   ✅ ${workspace?.name || wsId}: ${tags.length} tags`);
      }
    }

    // 3. Vérifier les workspaces disponibles
    console.log('\n🏢 3. Workspaces disponibles:');
    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            tags: true,
            members: true
          }
        }
      }
    });

    workspaces.forEach(ws => {
      console.log(`   - ${ws.name} (ID: ${ws.id.substring(0, 8)}...)`);
      console.log(`     Tags: ${ws._count.tags}, Membres: ${ws._count.members}`);
    });

    // 4. Vérifier les utilisateurs et leurs workspaces
    console.log('\n👥 4. Utilisateurs et leurs workspaces:');
    const users = await prisma.user.findMany({
      select: {
        email: true,
        workspaces: {
          select: {
            workspace: {
              select: {
                name: true,
                id: true
              }
            },
            role: true
          }
        }
      }
    });

    users.forEach(user => {
      console.log(`   - ${user.email}:`);
      if (user.workspaces.length === 0) {
        console.log(`     ⚠️  Aucun workspace associé !`);
      } else {
        user.workspaces.forEach(ws => {
          console.log(`     → ${ws.workspace.name} (${ws.role})`);
        });
      }
    });

    // 5. Simuler la requête API GET /api/tags pour le workspace BASE
    console.log('\n🔍 5. Simulation requête API GET /api/tags (workspace BASE):');
    const baseWorkspace = await prisma.workspace.findFirst({
      where: { name: 'BASE' }
    });

    if (!baseWorkspace) {
      console.log('   ❌ Workspace BASE non trouvé !');
    } else {
      const tagsForBase = await prisma.tag.findMany({
        where: { workspaceId: baseWorkspace.id },
        orderBy: [
          { category: 'asc' },
          { label: 'asc' }
        ]
      });

      console.log(`   Workspace BASE ID: ${baseWorkspace.id}`);
      console.log(`   Tags retournés: ${tagsForBase.length}`);

      if (tagsForBase.length === 0) {
        console.log('   ❌ Aucun tag trouvé pour le workspace BASE !');
      } else {
        const byCategory = tagsForBase.reduce((acc, tag) => {
          if (!acc[tag.category]) acc[tag.category] = 0;
          acc[tag.category]++;
          return acc;
        }, {});

        console.log('   Par catégorie:');
        Object.entries(byCategory).forEach(([cat, count]) => {
          console.log(`     - ${cat}: ${count} tags`);
        });
      }
    }

    // 6. Vérifier s'il y a des tags orphelins
    console.log('\n⚠️  6. Tags orphelins (sans workspace):');
    const orphanTags = await prisma.tag.findMany({
      where: { workspaceId: null }
    });

    if (orphanTags.length > 0) {
      console.log(`   ${orphanTags.length} tags sans workspace trouvés:`);
      orphanTags.slice(0, 5).forEach(tag => {
        console.log(`     - ${tag.label} (${tag.category})`);
      });
      if (orphanTags.length > 5) {
        console.log(`     ... et ${orphanTags.length - 5} autres`);
      }
    } else {
      console.log('   ✅ Aucun tag orphelin');
    }

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
