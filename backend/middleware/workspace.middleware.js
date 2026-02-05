const { prisma } = require('../services/prisma');

const normalizeWorkspaceRole = (role) => {
  const r = String(role || '').trim().toUpperCase();
  if (r === 'OWNER') return 'MANAGER';
  if (r === 'USER') return 'MEMBER';
  return r;
};

const baseMutationGuard = (req, res, next) => {
  const method = String(req.method || '').toUpperCase();
  const isMutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

  if (!isMutating) {
    return next();
  }

  const isBase = Boolean(req.workspace && req.workspace.isBase === true);
  if (!isBase) {
    return next();
  }

  const userRole = String(req.user && req.user.role ? req.user.role : '').toUpperCase();
  if (userRole !== 'ADMIN') {
    return res.status(403).json({
      error: 'Modification interdite sur la BASE (réservée aux administrateurs plateforme)',
      code: 'BASE_MUTATION_FORBIDDEN',
    });
  }

  return next();
};

/**
 * Middleware de résolution du workspace actif à partir du header X-Workspace-Id.
 * - Vérifie que l'utilisateur courant (req.user.id) est membre du workspace.
 * - Stocke workspaceId dans req.workspaceId pour les contrôleurs.
 * - Stocke également le lien complet dans req.workspaceLink et le rôle dans req.workspaceRole.
 *
 * Si aucun header n'est fourni ou si le workspace n'est pas accessible,
 * renvoie une erreur 400/403 claire.
 */
const workspaceGuard = async (req, res, next) => {
  try {
    // Certaines routes publiques ne nécessitent pas de workspace
    // (health, auth, etc.). Par sécurité, on n'applique le guard
    // que si un user est présent (middleware auth déjà passé).
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non authentifié',
        code: 'NO_USER_FOR_WORKSPACE',
      });
    }

    const workspaceId = req.headers['x-workspace-id'] || req.headers['X-Workspace-Id'];

    if (!workspaceId || String(workspaceId).trim().length === 0) {
      return res.status(400).json({
        error: 'Workspace non spécifié. Veuillez sélectionner une base de travail.',
        code: 'WORKSPACE_ID_REQUIRED',
      });
    }

    const wsId = String(workspaceId).trim();

    // Vérifier que l'utilisateur a bien accès à ce workspace
    const link = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId: wsId,
        userId: user.id,
      },
      include: {
        workspace: true,
      },
    });

    if (!link) {
      return res.status(403).json({
        error: 'Accès refusé à ce workspace',
        code: 'WORKSPACE_FORBIDDEN',
      });
    }

    req.workspaceId = wsId;
    req.workspace = link.workspace;
    req.workspaceLink = link;
    req.workspaceRole = link.role;
    req.workspaceRoleNormalized = normalizeWorkspaceRole(link.role);

    const isTester = Boolean(req.user && req.user.isTester === true);
    const isBase = Boolean(req.workspace && req.workspace.isBase === true);
    if (isTester && isBase) {
      return res.status(403).json({
        error: 'Accès interdit: le workspace BASE est visible en listing uniquement pour les testeurs',
        code: 'TESTER_BASE_FORBIDDEN',
      });
    }

    return next();
  } catch (error) {
    console.error('[WorkspaceGuard] Erreur lors de la résolution du workspace:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la résolution du workspace',
      code: 'WORKSPACE_ERROR',
    });
  }
};

const requireWorkspaceManager = (req, res, next) => {
  const role = normalizeWorkspaceRole(req.workspaceRole);
  if (role !== 'MANAGER') {
    return res.status(403).json({
      error: 'Action réservée aux responsables de ce workspace',
      code: 'WORKSPACE_MANAGER_REQUIRED',
    });
  }
  return next();
};

const requireWorkspaceWrite = (req, res, next) => {
  const role = normalizeWorkspaceRole(req.workspaceRole);
  if (role !== 'MANAGER' && role !== 'MEMBER') {
    return res.status(403).json({
      error: 'Action réservée aux membres du workspace',
      code: 'WORKSPACE_WRITE_REQUIRED',
    });
  }
  return next();
};

/**
 * Middleware complémentaire pour restreindre certaines actions aux « owners/managers »
 * d'un workspace donné.
 *
 * À utiliser APRÈS workspaceGuard sur des routes nécessitant un niveau d'autorisation
 * plus élevé que simple membre.
 */
const requireWorkspaceOwner = async (req, res, next) => {
  try {
    const user = req.user;
    const workspaceId = req.workspaceId;

    if (!user || !workspaceId) {
      return res.status(400).json({
        error: 'Contexte workspace manquant pour le contrôle de rôle',
        code: 'WORKSPACE_CONTEXT_REQUIRED',
      });
    }

    // Si workspaceGuard a déjà chargé le lien, on le réutilise
    let link = req.workspaceLink;

    if (!link) {
      link = await prisma.workspaceUser.findFirst({
        where: {
          workspaceId,
          userId: user.id,
        },
      });
    }

    if (!link) {
      return res.status(403).json({
        error: 'Accès refusé à ce workspace',
        code: 'WORKSPACE_FORBIDDEN',
      });
    }

    const role = normalizeWorkspaceRole(link.role);

    // Rôles autorisés pour administrer un workspace spécifique.
    // On part sur OWNER comme rôle intermédiaire principal.
    if (role !== 'MANAGER') {
      return res.status(403).json({
        error: 'Action réservée aux responsables de ce workspace',
        code: 'WORKSPACE_OWNER_REQUIRED',
      });
    }

    // On laisse passer
    return next();
  } catch (error) {
    console.error('[WorkspaceOwnerGuard] Erreur lors du contrôle de rôle:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors du contrôle de rôle du workspace',
      code: 'WORKSPACE_OWNER_ERROR',
    });
  }
};

module.exports = {
  workspaceGuard,
  baseMutationGuard,
  requireWorkspaceOwner,
  requireWorkspaceManager,
  requireWorkspaceWrite,
};
