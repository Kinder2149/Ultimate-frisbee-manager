const { prisma } = require('../services/prisma');
const workspaceService = require('../services/business/workspace.service');

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

    const workspaces = await workspaceService.ensureDefaultWorkspaceAndLink(userId);

    res.json(workspaces || []);
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN – dupliquer un workspace et toutes ses données
 * POST /api/workspaces/:id/duplicate
 */
exports.adminDuplicateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;

    const original = await prisma.workspace.findUnique({
      where: { id },
      include: {
        members: true,
        tags: true,
        exercices: { include: { tags: true } },
        echauffements: { include: { blocs: true } },
        situationsMatch: { include: { tags: true } },
        entrainements: { include: { tags: true, exercices: true } },
      },
    });

    if (!original) {
      return res.status(404).json({ error: 'Workspace non trouvé', code: 'WORKSPACE_NOT_FOUND' });
    }

    const baseName = original.name || 'Workspace';
    const requestedName = req.body && typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      if (!requestedName) {
        return res.status(400).json({ error: 'Le nom du workspace est requis', code: 'WORKSPACE_NAME_REQUIRED' });
      }

      const existing = await prisma.workspace.findFirst({ where: { name: requestedName } });
      if (existing) {
        return res.status(409).json({ error: 'Un workspace avec ce nom existe déjà', code: 'WORKSPACE_NAME_EXISTS' });
      }
    }

    let newName = requestedName || `${baseName} (Copie)`;
    if (!requestedName) {
      let n = 2;
      while (await prisma.workspace.findFirst({ where: { name: newName } })) {
        newName = `${baseName} (Copie ${n})`;
        n += 1;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Nouveau workspace
      const newWorkspace = await tx.workspace.create({
        data: {
          name: newName,
        },
      });

      const newWorkspaceId = newWorkspace.id;

      // 2. Dupliquer les tags
      const tagIdMap = new Map();
      for (const tag of original.tags) {
        const { id: oldId, createdAt, ...rest } = tag;
        const created = await tx.tag.create({
          data: {
            ...rest,
            workspaceId: newWorkspaceId,
          },
        });
        tagIdMap.set(oldId, created.id);
      }

      // 3. Dupliquer les exercices
      const exerciceIdMap = new Map();
      for (const ex of original.exercices) {
        const { id: oldId, createdAt, workspaceId, entrainements, tags, ...rest } = ex;
        const created = await tx.exercice.create({
          data: {
            ...rest,
            workspaceId: newWorkspaceId,
            tags: {
              connect: (tags || []).map((t) => ({ id: tagIdMap.get(t.id) || undefined })).filter((t) => !!t.id),
            },
          },
        });
        exerciceIdMap.set(oldId, created.id);
      }

      // 4. Dupliquer les situations de match
      const situationIdMap = new Map();
      for (const s of original.situationsMatch) {
        const { id: oldId, createdAt, workspaceId, entrainements, tags, ...rest } = s;
        const created = await tx.situationMatch.create({
          data: {
            ...rest,
            workspaceId: newWorkspaceId,
            tags: {
              connect: (tags || []).map((t) => ({ id: tagIdMap.get(t.id) || undefined })).filter((t) => !!t.id),
            },
          },
        });
        situationIdMap.set(oldId, created.id);
      }

      // 5. Dupliquer les échauffements + blocs
      const echauffementIdMap = new Map();
      for (const e of original.echauffements) {
        const { id: oldId, createdAt, workspaceId, blocs, entrainements, ...rest } = e;
        const created = await tx.echauffement.create({
          data: {
            ...rest,
            workspaceId: newWorkspaceId,
          },
        });
        echauffementIdMap.set(oldId, created.id);

        for (const b of blocs || []) {
          const { id: oldBlocId, createdAt: blocCreatedAt, workspaceId: blocWsId, echauffementId, ...blocRest } = b;
          await tx.blocEchauffement.create({
            data: {
              ...blocRest,
              echauffementId: created.id,
              workspaceId: newWorkspaceId,
            },
          });
        }
      }

      // 6. Dupliquer les entrainements + liens exercices
      const entrainementIdMap = new Map();
      for (const en of original.entrainements) {
        const { id: oldId, createdAt, workspaceId, echauffementId, situationMatchId, tags, exercices, ...rest } = en;

        const created = await tx.entrainement.create({
          data: {
            ...rest,
            workspaceId: newWorkspaceId,
            echauffementId: echauffementId ? echauffementIdMap.get(echauffementId) || null : null,
            situationMatchId: situationMatchId ? situationIdMap.get(situationMatchId) || null : null,
            tags: {
              connect: (tags || []).map((t) => ({ id: tagIdMap.get(t.id) || undefined })).filter((t) => !!t.id),
            },
          },
        });

        entrainementIdMap.set(oldId, created.id);

        // Dupliquer les liaisons EntrainementExercice
        for (const ee of exercices || []) {
          const { id: oldEeId, createdAt: eeCreatedAt, workspaceId: eeWsId, entrainementId: oldEnId, exerciceId: oldExId, ...eeRest } = ee;
          const newExId = exerciceIdMap.get(oldExId);
          if (!newExId) continue;
          await tx.entrainementExercice.create({
            data: {
              ...eeRest,
              entrainementId: created.id,
              exerciceId: newExId,
              workspaceId: newWorkspaceId,
            },
          });
        }
      }

      // 7. Dupliquer les membres du workspace
      for (const m of original.members) {
        const { id: oldLinkId, createdAt, workspaceId, ...rest } = m;
        await tx.workspaceUser.create({
          data: {
            ...rest,
            workspaceId: newWorkspaceId,
          },
        });
      }

      return newWorkspace;
    });

    res.status(201).json({
      id: result.id,
      name: result.name,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    console.error('Erreur lors de la duplication du workspace:', error);
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
        exercices: true,
        entrainements: true,
        echauffements: true,
        situationsMatch: true,
      },
    });

    const result = workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
      membersCount: ws.members.length,
      exercicesCount: ws.exercices.length,
      entrainementsCount: ws.entrainements.length,
      echauffementsCount: ws.echauffements.length,
      situationsCount: ws.situationsMatch.length,
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
 *
 * Nouveau comportement :
 *  - crée un workspace vide
 *  - copie automatiquement **tous les tags** du workspace BASE vers ce nouveau workspace
 *  - ne copie **aucun** exercice / entraînement / échauffement / situation
 */
exports.adminCreateWorkspace = async (req, res, next) => {
  try {
    const { name, ownerUserId } = req.body;

    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({ error: 'Le nom du workspace est requis', code: 'WORKSPACE_NAME_REQUIRED' });
    }

    const workspaceName = String(name).trim();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le nouveau workspace
      const workspace = await tx.workspace.create({
        data: { name: workspaceName },
      });

      const newWorkspaceId = workspace.id;

      // 2. Optionnel : créer un OWNER associé
      if (ownerUserId) {
        await tx.workspaceUser.create({
          data: {
            workspaceId: newWorkspaceId,
            userId: ownerUserId,
            role: 'OWNER',
          },
        });
      }

      // 3. Copier les tags du workspace BASE vers le nouveau workspace
      //    Si le workspace BASE n'existe pas ou n'a pas de tags, on continue sans erreur.
      try {
        const baseWorkspace = await tx.workspace.findFirst({
          where: { name: DEFAULT_WORKSPACE_NAME },
          include: { tags: true },
        });

        if (baseWorkspace && Array.isArray(baseWorkspace.tags) && baseWorkspace.tags.length > 0) {
          const tagsToClone = baseWorkspace.tags;

          for (const tag of tagsToClone) {
            const { id, createdAt, workspaceId, ...rest } = tag;
            await tx.tag.create({
              data: {
                ...rest,
                workspaceId: newWorkspaceId,
              },
            });
          }
        }
      } catch (cloneError) {
        // On loggue mais on ne bloque pas la création du workspace
        // eslint-disable-next-line no-console
        console.error('[Workspace] Erreur lors de la copie des tags BASE vers un nouveau workspace:', cloneError);
      }

      return workspace;
    });

    res.status(201).json(result);
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

/**
 * OWNER – lister les utilisateurs de SON workspace courant
 * GET /api/workspaces/members
 * Nécessite: authenticateToken, workspaceGuard, requireWorkspaceOwner
 */
exports.ownerGetWorkspaceMembers = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
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
 * OWNER – mettre à jour la liste des utilisateurs de SON workspace courant
 * PUT /api/workspaces/members
 * body: { users: [{ userId, role }] }
 * Nécessite: authenticateToken, workspaceGuard, requireWorkspaceOwner
 */
exports.ownerSetWorkspaceMembers = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { users } = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'Format invalide: users doit être un tableau', code: 'USERS_ARRAY_REQUIRED' });
    }

    // Vérifier que le workspace existe
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace non trouvé', code: 'WORKSPACE_NOT_FOUND' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.workspaceUser.deleteMany({ where: { workspaceId } });

      const cleaned = users
        .map((u) => ({
          userId: String(u.userId),
          role: u.role ? String(u.role).toUpperCase() : 'USER',
        }))
        .filter((u) => !!u.userId);

      if (cleaned.length > 0) {
        await tx.workspaceUser.createMany({
          data: cleaned.map((u) => ({
            workspaceId,
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

/**
 * OWNER – mettre à jour les réglages de SON workspace courant
 * PUT /api/workspaces/settings
 * body: { name? }
 * Nécessite: authenticateToken, workspaceGuard, requireWorkspaceOwner
 */
exports.ownerUpdateWorkspaceSettings = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const { name } = req.body;

    const data = {};
    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ error: 'Le nom du workspace ne peut pas être vide', code: 'WORKSPACE_NAME_EMPTY' });
      }
      data.name = String(name).trim();
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
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
 * Précharge toutes les données d'un workspace (endpoint optimisé)
 * GET /api/workspaces/:id/preload
 * Nécessite: authenticateToken
 */
exports.preloadWorkspace = async (req, res, next) => {
  try {
    const { id: workspaceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié', code: 'NO_USER' });
    }

    // Vérifier que l'utilisateur a accès à ce workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!workspaceUser) {
      return res.status(403).json({ 
        error: 'Accès non autorisé à ce workspace', 
        code: 'WORKSPACE_FORBIDDEN' 
      });
    }

    // Charger toutes les données en parallèle
    const [exercices, entrainements, echauffements, situations, tags] = await Promise.all([
      prisma.exercice.findMany({ 
        where: { workspaceId },
        include: { tags: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.entrainement.findMany({ 
        where: { workspaceId },
        include: { tags: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.echauffement.findMany({ 
        where: { workspaceId },
        include: { blocs: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.situationMatch.findMany({ 
        where: { workspaceId },
        include: { tags: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tag.findMany({ 
        where: { workspaceId },
        orderBy: { label: 'asc' }
      })
    ]);

    res.json({
      exercices,
      entrainements,
      echauffements,
      situations,
      tags,
      stats: {
        totalExercices: exercices.length,
        totalEntrainements: entrainements.length,
        totalEchauffements: echauffements.length,
        totalSituations: situations.length,
        totalTags: tags.length
      }
    });
  } catch (error) {
    console.error('[Workspace] Error preloading workspace:', error);
    next(error);
  }
};
