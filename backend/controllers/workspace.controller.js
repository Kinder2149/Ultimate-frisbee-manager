const { prisma } = require('../services/prisma');

/**
 * Retourne les workspaces accessibles à l'utilisateur courant
 * GET /api/workspaces/me
 */
exports.getMyWorkspaces = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié', code: 'NO_USER' });
    }

    const links = await prisma.workspaceUser.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });

    const workspaces = links.map((l) => ({
      id: l.workspace.id,
      name: l.workspace.name,
      createdAt: l.workspace.createdAt,
      role: l.role,
    }));

    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN – lister tous les workspaces
 * GET /api/admin/workspaces
 */
exports.adminListWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    const result = workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
      membersCount: ws.members.length,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN – créer un workspace
 * POST /api/admin/workspaces
 * body: { name, ownerUserId? }
 */
exports.adminCreateWorkspace = async (req, res, next) => {
  try {
    const { name, ownerUserId } = req.body;

    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({ error: 'Le nom du workspace est requis', code: 'WORKSPACE_NAME_REQUIRED' });
    }

    const data = { name: String(name).trim() };

    const workspace = await prisma.workspace.create({ data });

    // Option: créer un OWNER associé
    if (ownerUserId) {
      await prisma.workspaceUser.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerUserId,
          role: 'OWNER',
        },
      });
    }

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN – mettre à jour un workspace
 * PUT /api/admin/workspaces/:id
 */
exports.adminUpdateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const data = {};
    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ error: 'Le nom du workspace ne peut pas être vide', code: 'WORKSPACE_NAME_EMPTY' });
      }
      data.name = String(name).trim();
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Workspace non trouvé', code: 'WORKSPACE_NOT_FOUND' });
    }
    next(error);
  }
};

/**
 * ADMIN – supprimer un workspace et toutes ses données
 * DELETE /api/admin/workspaces/:id
 */
exports.adminDeleteWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;

    // On laisse Prisma gérer les cascades via le schéma
    await prisma.workspace.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Workspace non trouvé', code: 'WORKSPACE_NOT_FOUND' });
    }
    next(error);
  }
};

/**
 * ADMIN – lister les utilisateurs d'un workspace
 * GET /api/admin/workspaces/:id/users
 */
exports.adminGetWorkspaceUsers = async (req, res, next) => {
  try {
    const { id } = req.params;

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace non trouvé', code: 'WORKSPACE_NOT_FOUND' });
    }

    const users = workspace.members.map((m) => ({
      userId: m.userId,
      email: m.user.email,
      nom: m.user.nom,
      prenom: m.user.prenom,
      role: m.role,
      linkId: m.id,
    }));

    res.json({ workspaceId: workspace.id, name: workspace.name, users });
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN – mettre à jour la liste des utilisateurs d'un workspace
 * PUT /api/admin/workspaces/:id/users
 * body: { users: [{ userId, role }] }
 */
exports.adminSetWorkspaceUsers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { users } = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'Format invalide: users doit être un tableau', code: 'USERS_ARRAY_REQUIRED' });
    }

    // Vérifier que le workspace existe
    const workspace = await prisma.workspace.findUnique({ where: { id } });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace non trouvé', code: 'WORKSPACE_NOT_FOUND' });
    }

    // On remplace complètement les liens existants
    await prisma.$transaction(async (tx) => {
      await tx.workspaceUser.deleteMany({ where: { workspaceId: id } });

      const cleaned = users
        .map((u) => ({
          userId: String(u.userId),
          role: u.role ? String(u.role).toUpperCase() : 'USER',
        }))
        .filter((u) => !!u.userId);

      if (cleaned.length > 0) {
        await tx.workspaceUser.createMany({
          data: cleaned.map((u) => ({
            workspaceId: id,
            userId: u.userId,
            role: u.role,
          })),
        });
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
