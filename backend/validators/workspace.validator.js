const { z } = require('zod');

/**
 * Enum des rôles workspace valides
 */
const WORKSPACE_ROLES = ['MANAGER', 'MEMBER', 'VIEWER'];

/**
 * Schéma Zod pour valider un rôle workspace
 */
const workspaceRoleSchema = z.enum(['MANAGER', 'MEMBER', 'VIEWER'], {
  errorMap: () => ({
    message: `Le rôle doit être l'un des suivants: ${WORKSPACE_ROLES.join(', ')}`,
  }),
});

/**
 * Schéma pour la création/mise à jour d'un membre workspace
 */
const workspaceUserSchema = z.object({
  userId: z.string({
    required_error: "L'ID utilisateur est requis.",
    invalid_type_error: "L'ID utilisateur doit être une chaîne de caractères.",
  }).uuid({ message: "L'ID utilisateur doit être un UUID valide." }),

  role: workspaceRoleSchema,
});

/**
 * Schéma pour la mise à jour en masse des membres d'un workspace
 */
const setWorkspaceMembersSchema = z.object({
  users: z.array(workspaceUserSchema).min(1, {
    message: 'Au moins un membre est requis.',
  }),
});

/**
 * Schéma pour la création d'un workspace
 */
const createWorkspaceSchema = z.object({
  name: z.string({
    required_error: 'Le nom du workspace est requis.',
    invalid_type_error: 'Le nom doit être une chaîne de caractères.',
  }).min(3, { message: 'Le nom doit contenir au moins 3 caractères.' }),

  ownerUserId: z.string().uuid().optional(),
});

/**
 * Schéma pour la mise à jour d'un workspace
 */
const updateWorkspaceSchema = z.object({
  name: z.string().min(3).optional(),
});

/**
 * Schéma pour la duplication d'un workspace
 */
const duplicateWorkspaceSchema = z.object({
  newName: z.string({
    required_error: 'Le nouveau nom est requis.',
  }).min(3, { message: 'Le nom doit contenir au moins 3 caractères.' }),

  copyMembers: z.boolean().optional().default(false),
});

module.exports = {
  WORKSPACE_ROLES,
  workspaceRoleSchema,
  workspaceUserSchema,
  setWorkspaceMembersSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  duplicateWorkspaceSchema,
};
