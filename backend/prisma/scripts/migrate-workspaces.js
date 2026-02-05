const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting workspace migration...');

  // 1) Create a global workspace to attach all existing data
  const workspaceName = 'Base historique UFM';

  let workspace = await prisma.workspace.findFirst({
    where: { name: workspaceName },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
      },
    });
    console.log(`Created workspace '${workspaceName}' with id ${workspace.id}`);
  } else {
    console.log(`Workspace '${workspaceName}' already exists with id ${workspace.id}`);
  }

  const workspaceId = workspace.id;

  // 2) Helper to bulk-assign workspaceId on a model if null
  async function backfillWorkspaceId(modelName) {
    console.log(`\nBackfilling workspaceId for ${modelName}...`);
    const updated = await prisma[modelName].updateMany({
      where: { workspaceId: null },
      data: { workspaceId },
    });
    console.log(`Updated ${updated.count} ${modelName} records.`);
  }

  // 3) Backfill on all content models
  await backfillWorkspaceId('exercice');
  await backfillWorkspaceId('tag');
  await backfillWorkspaceId('entrainement');
  await backfillWorkspaceId('entrainementExercice');
  await backfillWorkspaceId('echauffement');
  await backfillWorkspaceId('blocEchauffement');
  await backfillWorkspaceId('situationMatch');

  // 4) Create WorkspaceUser links: each existing user becomes OWNER
  console.log('\nCreating WorkspaceUser links for existing users...');
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users.`);

  let createdLinks = 0;
  for (const user of users) {
    const existing = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (!existing) {
      await prisma.workspaceUser.create({
        data: {
          workspaceId,
          userId: user.id,
          role: 'MANAGER',
        },
      });
      createdLinks += 1;
    }
  }

  console.log(`Created ${createdLinks} WorkspaceUser links.`);

  console.log('\nWorkspace migration completed successfully.');
}

main()
  .catch((e) => {
    console.error('Workspace migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
