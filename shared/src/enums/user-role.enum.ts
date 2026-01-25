/**
 * Enum des rôles utilisateur
 * Doit correspondre exactement à l'enum Prisma UserRole
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

/**
 * Labels affichables pour les rôles
 */
export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.USER]: 'Utilisateur',
  [UserRole.ADMIN]: 'Administrateur'
};
