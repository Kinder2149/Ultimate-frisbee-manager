/**
 * Interface pour les utilisateurs
 */
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom?: string;
  role: string;
  iconUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  securityQuestion?: string;
}

/**
 * Interface pour les données de connexion
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface pour la réponse de connexion
 */
export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

/**
 * Interface pour les erreurs d'authentification
 */
export interface AuthError {
  error: string;
  code: string;
}
