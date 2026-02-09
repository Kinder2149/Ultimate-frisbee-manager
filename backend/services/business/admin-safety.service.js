/**
 * Service de sécurité ADMIN
 * Garantit l'invariant ADM-1 : le système doit toujours avoir au moins 1 ADMIN actif.
 */
const { prisma } = require('../prisma');

/**
 * Vérifie qu'après une mutation donnée, il restera au moins 1 admin actif.
 * 
 * @param {string} userId - L'ID de l'utilisateur concerné par la mutation
 * @param {object} mutation - Les champs qui vont être modifiés { role?, isActive? }
 * @returns {{ safe: boolean, activeAdminCount: number, error?: string }}
 */
async function ensureMinOneAdmin(userId, mutation) {
  // Récupérer l'état actuel de l'utilisateur
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true }
  });

  if (!currentUser) {
    return { safe: true, activeAdminCount: -1 };
  }

  // Si l'utilisateur n'est pas actuellement un admin actif, aucune vérification nécessaire
  const isCurrentlyActiveAdmin = currentUser.role === 'ADMIN' && currentUser.isActive === true;
  if (!isCurrentlyActiveAdmin) {
    return { safe: true, activeAdminCount: -1 };
  }

  // Déterminer si la mutation retirerait le statut admin actif
  const newRole = mutation.role !== undefined ? String(mutation.role).toUpperCase() : currentUser.role;
  const newIsActive = mutation.isActive !== undefined ? mutation.isActive : currentUser.isActive;
  const wouldStillBeActiveAdmin = newRole === 'ADMIN' && newIsActive === true;

  if (wouldStillBeActiveAdmin) {
    return { safe: true, activeAdminCount: -1 };
  }

  // La mutation retirerait le statut admin actif — compter les admins restants
  const activeAdminCount = await prisma.user.count({
    where: { role: 'ADMIN', isActive: true }
  });

  if (activeAdminCount <= 1) {
    return {
      safe: false,
      activeAdminCount,
      error: 'Impossible : cette opération retirerait le dernier administrateur actif. Le système doit toujours avoir au moins un ADMIN actif.'
    };
  }

  return { safe: true, activeAdminCount };
}

module.exports = { ensureMinOneAdmin };
