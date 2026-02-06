const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function shortId(id) {
  return String(id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'unknown';
}

async function main() {
  const baseCandidates = await prisma.workspace.findMany({
    where: {
      OR: [{ name: 'BASE' }, { isBase: true }],
    },
    include: {
      members: true,
      exercices: { select: { id: true } },
      entrainements: { select: { id: true } },
      echauffements: { select: { id: true } },
      situationsMatch: { select: { id: true } },
      tags: { select: { id: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (baseCandidates.length <= 1) {
    const only = baseCandidates[0];
    if (!only) {
      console.log('Aucun workspace BASE détecté.');
      return;
    }
    if (only.isBase !== true) {
      await prisma.workspace.update({ where: { id: only.id }, data: { isBase: true } });
    }
    console.log(`OK: un seul BASE (${only.id}).`);
    return;
  }

  const canonical = baseCandidates.find((w) => w.isBase === true) || baseCandidates[0];
  console.log(`BASE canonique: ${canonical.id} (name=${canonical.name}, isBase=${canonical.isBase})`);

  if (canonical.isBase !== true) {
    await prisma.workspace.update({ where: { id: canonical.id }, data: { isBase: true } });
  }

  for (const ws of baseCandidates) {
    if (ws.id === canonical.id) continue;

    const hasData =
      (ws.members?.length || 0) > 0 ||
      (ws.exercices?.length || 0) > 0 ||
      (ws.entrainements?.length || 0) > 0 ||
      (ws.echauffements?.length || 0) > 0 ||
      (ws.situationsMatch?.length || 0) > 0 ||
      (ws.tags?.length || 0) > 0;

    const wsUsers = await prisma.workspaceUser.findMany({ where: { workspaceId: ws.id } });
    if (wsUsers.length > 0) {
      for (const link of wsUsers) {
        await prisma.workspaceUser.upsert({
          where: {
            workspaceId_userId: { workspaceId: canonical.id, userId: link.userId },
          },
          update: {
            role: String(link.role || 'MEMBER').toUpperCase(),
          },
          create: {
            workspaceId: canonical.id,
            userId: link.userId,
            role: String(link.role || 'MEMBER').toUpperCase(),
          },
        });
      }
    }

    const newName = `BASE_DUPLICATE_${shortId(ws.id)}`;
    await prisma.workspace.update({
      where: { id: ws.id },
      data: {
        name: newName,
        isBase: false,
      },
    });

    console.log(
      `Doublon traité: ${ws.id} -> name=${newName}, isBase=false, hadData=${hasData}, movedLinks=${wsUsers.length}`
    );
  }

  console.log('Déduplication terminée.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
