const { prisma } = require('../services/prisma');

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
  if (req.workspaceRole !== 'MANAGER') {
    return res.status(403).json({
      error: 'Action réservée aux responsables de ce workspace',
      code: 'WORKSPACE_MANAGER_REQUIRED',
    });
  }
  return next();
};

const requireWorkspaceWrite = (req, res, next) => {
  if (req.workspaceRole !== 'MANAGER' && req.workspaceRole !== 'MEMBER') {
    return res.status(403).json({
      error: 'Action réservée aux membres du workspace',
      code: 'WORKSPACE_WRITE_REQUIRED',
    });
  }
  return next();
};

module.exports = {
  workspaceGuard,
  baseMutationGuard,
  requireWorkspaceManager,
  requireWorkspaceWrite,
};
