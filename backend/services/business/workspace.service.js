const { prisma } = require('../prisma');

/**
 * Service métier pour la gestion des workspaces
 * Contient toute la logique métier liée aux workspaces
 */

const DEFAULT_WORKSPACE_NAME = 'BASE';
const ADMIN_WORKSPACE_NAME = 'TEST';

/**
 * Assure qu'un utilisateur est lié aux workspaces appropriés
 */
async function ensureDefaultWorkspaceAndLink(userId, options = {}) {
  if (!userId) {
    return null;
  }

  const isTester = Boolean(options && options.isTester === true);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.warn(`[Workspace] User ${userId} not found in database, skipping workspace link creation`);
    return [];
  }

  const isAdmin = String(user.role).toUpperCase() === 'ADMIN';

  const existingLinks = await prisma.workspaceUser.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });

  const hasBaseLink = existingLinks.some((l) => l.workspace.name === DEFAULT_WORKSPACE_NAME);
  const hasTestLink = existingLinks.some((l) => l.workspace.name === ADMIN_WORKSPACE_NAME);

  if (!hasBaseLink && !isTester) {
    const baseCandidates = await prisma.workspace.findMany({
      where: {
        OR: [{ isBase: true }, { name: DEFAULT_WORKSPACE_NAME }],
      },
      orderBy: [{ createdAt: 'asc' }],
    });

    let baseWorkspace = baseCandidates.find((w) => w.isBase === true) || baseCandidates[0] || null;

    if (!baseWorkspace) {
      baseWorkspace = await prisma.workspace.create({
        data: { name: DEFAULT_WORKSPACE_NAME, isBase: true },
      });
    } else if (baseWorkspace.isBase !== true) {
      baseWorkspace = await prisma.workspace.update({
        where: { id: baseWorkspace.id },
        data: { isBase: true },
      });
    }

    await prisma.workspaceUser.create({
      data: {
        workspaceId: baseWorkspace.id,
        userId,
        role: 'MEMBER',
      },
    });

    existingLinks.push({
      workspace: baseWorkspace,
      role: 'MEMBER',
    });
  }

  if (isAdmin && !hasTestLink) {
    let testWorkspace = await prisma.workspace.findFirst({
      where: { name: ADMIN_WORKSPACE_NAME },
    });

    if (!testWorkspace) {
      testWorkspace = await prisma.workspace.create({
        data: { name: ADMIN_WORKSPACE_NAME },
      });
    }

    await prisma.workspaceUser.create({
      data: {
        workspaceId: testWorkspace.id,
        userId,
        role: 'MANAGER',
      },
    });

    existingLinks.push({
      workspace: testWorkspace,
      role: 'MANAGER',
    });
  }

  return existingLinks.map((l) => ({
    id: l.workspace.id,
    name: l.workspace.name,
    createdAt: l.workspace.createdAt,
    isBase: l.workspace.isBase,
    role: l.role,
  }));
}

/**
 * Récupérer tous les workspaces d'un utilisateur
 */
async function getUserWorkspaces(userId) {
  const links = await prisma.workspaceUser.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });

  return links.map((l) => ({
    id: l.workspace.id,
    name: l.workspace.name,
    createdAt: l.workspace.createdAt,
    isBase: l.workspace.isBase,
    role: l.role,
  }));
}

module.exports = {
  ensureDefaultWorkspaceAndLink,
  getUserWorkspaces
};
