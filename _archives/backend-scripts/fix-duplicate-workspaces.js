/**
 * Script pour fusionner les workspaces BASE en doublon
 * 
 * Problème : Il existe 2 workspaces nommés "BASE"
 * - BASE 1 (fa35b1ea) : 38 tags, 2 membres
 * - BASE 2 (bb0acaee) : 0 tags, 1 membre
 * 
 * Solution : Migrer tous les membres et contenus vers BASE 1, puis supprimer BASE 2
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fusion des workspaces BASE en doublon\n');

  try {
    // 1. Identifier les workspaces BASE
    console.log('🔍 Recherche des workspaces BASE...');
    const baseWorkspaces = await prisma.workspace.findMany({
      where: { name: 'BASE' },
      include: {
        _count: {
          select: {
            tags: true,
            members: true,
            exercices: true,
            entrainements: true
          }
        }
      }
    });

    if (baseWorkspaces.length <= 1) {
      console.log('✅ Un seul workspace BASE trouvé, rien à faire.');
      return;
    }

    console.log(`⚠️  ${baseWorkspaces.length} workspaces BASE trouvés:\n`);
    baseWorkspaces.forEach((ws, index) => {
      console.log(`   ${index + 1}. ID: ${ws.id}`);
      console.log(`      Tags: ${ws._count.tags}`);
      console.log(`      Membres: ${ws._count.members}`);
      console.log(`      Exercices: ${ws._count.exercices}`);
      console.log(`      Entraînements: ${ws._count.entrainements}\n`);
    });

    // 2. Déterminer le workspace principal (celui avec le plus de contenu)
    const mainWorkspace = baseWorkspaces.reduce((main, current) => {
      const mainScore = main._count.tags + main._count.members + main._count.exercices + main._count.entrainements;
      const currentScore = current._count.tags + current._count.members + current._count.exercices + current._count.entrainements;
      return currentScore > mainScore ? current : main;
    });

    const duplicates = baseWorkspaces.filter(ws => ws.id !== mainWorkspace.id);

    console.log(`✅ Workspace principal sélectionné: ${mainWorkspace.id}`);
    console.log(`   (${mainWorkspace._count.tags} tags, ${mainWorkspace._count.members} membres)\n`);

    // 3. Migrer les membres des doublons vers le workspace principal
    console.log('👥 Migration des membres...\n');
    
    for (const duplicate of duplicates) {
      const members = await prisma.workspaceUser.findMany({
        where: { workspaceId: duplicate.id },
        include: { user: true }
      });

      for (const member of members) {
        try {
          // Vérifier si le membre existe déjà dans le workspace principal
          const existingMember = await prisma.workspaceUser.findUnique({
            where: {
              workspaceId_userId: {
                workspaceId: mainWorkspace.id,
                userId: member.userId
              }
            }
          });

          if (existingMember) {
            console.log(`   ⏭️  ${member.user.email} déjà membre du workspace principal`);
            // Supprimer le doublon
            await prisma.workspaceUser.delete({
              where: {
                workspaceId_userId: {
                  workspaceId: duplicate.id,
                  userId: member.userId
                }
              }
            });
          } else {
            // Migrer le membre
            await prisma.workspaceUser.update({
              where: {
                workspaceId_userId: {
                  workspaceId: duplicate.id,
                  userId: member.userId
                }
              },
              data: {
                workspaceId: mainWorkspace.id
              }
            });
            console.log(`   ✅ ${member.user.email} migré vers le workspace principal`);
          }
        } catch (error) {
          console.error(`   ❌ Erreur migration ${member.user.email}:`, error.message);
        }
      }
    }

    // 4. Migrer les tags, exercices, etc. vers le workspace principal
    console.log('\n📝 Migration du contenu...\n');
    
    for (const duplicate of duplicates) {
      // Tags
      const tagsCount = await prisma.tag.updateMany({
        where: { workspaceId: duplicate.id },
        data: { workspaceId: mainWorkspace.id }
      });
      if (tagsCount.count > 0) {
        console.log(`   ✅ ${tagsCount.count} tags migrés`);
      }

      // Exercices
      const exercicesCount = await prisma.exercice.updateMany({
        where: { workspaceId: duplicate.id },
        data: { workspaceId: mainWorkspace.id }
      });
      if (exercicesCount.count > 0) {
        console.log(`   ✅ ${exercicesCount.count} exercices migrés`);
      }

      // Entraînements
      const entrainementsCount = await prisma.entrainement.updateMany({
        where: { workspaceId: duplicate.id },
        data: { workspaceId: mainWorkspace.id }
      });
      if (entrainementsCount.count > 0) {
        console.log(`   ✅ ${entrainementsCount.count} entraînements migrés`);
      }

      // Échauffements
      const echauffementsCount = await prisma.echauffement.updateMany({
        where: { workspaceId: duplicate.id },
        data: { workspaceId: mainWorkspace.id }
      });
      if (echauffementsCount.count > 0) {
        console.log(`   ✅ ${echauffementsCount.count} échauffements migrés`);
      }

      // Situations de match
      const situationsCount = await prisma.situationMatch.updateMany({
        where: { workspaceId: duplicate.id },
        data: { workspaceId: mainWorkspace.id }
      });
      if (situationsCount.count > 0) {
        console.log(`   ✅ ${situationsCount.count} situations de match migrées`);
      }
    }

    // 5. Supprimer les workspaces doublons
    console.log('\n🗑️  Suppression des workspaces doublons...\n');
    
    for (const duplicate of duplicates) {
      await prisma.workspace.delete({
        where: { id: duplicate.id }
      });
      console.log(`   ✅ Workspace ${duplicate.id} supprimé`);
    }

    console.log('\n✅ Fusion terminée !\n');

    // 6. Vérification finale
    console.log('📊 Vérification finale:');
    const finalWorkspaces = await prisma.workspace.findMany({
      where: { name: 'BASE' },
      include: {
        _count: {
          select: {
            tags: true,
            members: true,
            exercices: true,
            entrainements: true
          }
        }
      }
    });

    console.log(`   Workspaces BASE: ${finalWorkspaces.length}`);
    finalWorkspaces.forEach(ws => {
      console.log(`   - ID: ${ws.id}`);
      console.log(`     Tags: ${ws._count.tags}`);
      console.log(`     Membres: ${ws._count.members}`);
      console.log(`     Exercices: ${ws._count.exercices}`);
      console.log(`     Entraînements: ${ws._count.entrainements}`);
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
