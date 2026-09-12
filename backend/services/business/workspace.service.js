const { prisma } = require('../prisma');

/**
 * Service métier pour la gestion des workspaces
 * Contient toute la logique métier liée aux workspaces
 */

const DEFAULT_WORKSPACE_NAME = 'BASE';
const ADMIN_WORKSPACE_NAME = 'TEST';
const COACH_WORKSPACE_NAME = 'Ulti Coach';

/**
 * Nom lisible de l'espace personnel d'un utilisateur.
 * Faute de nom renseigné, le début de l'adresse e-mail est mis en forme
 * (« arthur.dessez » devient « Arthur Dessez ») ; l'utilisateur peut renommer son espace.
 */
function nomEspacePersonnel(user) {
  const identite = [user.prenom, user.nom].filter(Boolean).join(' ').trim();
  const brut = identite || String(user.email || '').split('@')[0];
  const lisible = brut
    .split(/[._-]+/)
    .filter(Boolean)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join(' ');
  return `Espace de ${lisible || user.email}`;
}

/**
 * Assure qu'un utilisateur a ses espaces :
 * - son espace personnel, dont il est gestionnaire (il y fait ce qu'il veut) ;
 * - l'espace collectif Ulti Coach, en lecture (un rôle déjà accordé n'est jamais rétrogradé).
 * L'espace BASE n'est plus attribué : il reste réservé aux administrateurs de la plateforme.
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

  // 1. Espace personnel (gestionnaire)
  if (!isTester && !existingLinks.some((l) => l.workspace.ownerId === userId)) {
    let espace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!espace) {
      espace = await prisma.workspace.create({
        data: { name: nomEspacePersonnel(user), ownerId: userId },
      });
    }
    await prisma.workspaceUser.upsert({
      where: { workspaceId_userId: { workspaceId: espace.id, userId } },
      update: { role: 'MANAGER' },
      create: { workspaceId: espace.id, userId, role: 'MANAGER' },
    });
    existingLinks.push({ workspace: espace, role: 'MANAGER' });
  }

  // 2. Espace collectif Ulti Coach, en lecture
  if (!isTester && !existingLinks.some((l) => l.workspace.name === COACH_WORKSPACE_NAME)) {
    const coach = await prisma.workspace.findFirst({ where: { name: COACH_WORKSPACE_NAME } });
    if (coach) {
      await prisma.workspaceUser.create({
        data: { workspaceId: coach.id, userId, role: 'VIEWER' },
      });
      existingLinks.push({ workspace: coach, role: 'VIEWER' });
    }
  }

  // 3. Espace TEST des administrateurs
  if (isAdmin && !existingLinks.some((l) => l.workspace.name === ADMIN_WORKSPACE_NAME)) {
    let testWorkspace = await prisma.workspace.findFirst({
      where: { name: ADMIN_WORKSPACE_NAME },
    });

    if (!testWorkspace) {
      testWorkspace = await prisma.workspace.create({
        data: { name: ADMIN_WORKSPACE_NAME },
      });
    }

    await prisma.workspaceUser.create({
      data: { workspaceId: testWorkspace.id, userId, role: 'MANAGER' },
    });

    existingLinks.push({ workspace: testWorkspace, role: 'MANAGER' });
  }

  return existingLinks.map((l) => ({
    id: l.workspace.id,
    name: l.workspace.name,
    createdAt: l.workspace.createdAt,
    isBase: l.workspace.isBase,
    ownerId: l.workspace.ownerId ?? null,
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
    ownerId: l.workspace.ownerId ?? null,
    role: l.role,
  }));
}

module.exports = {
  ensureDefaultWorkspaceAndLink,
  nomEspacePersonnel,
  getUserWorkspaces
};
