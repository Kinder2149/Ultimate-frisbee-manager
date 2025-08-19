/**
 * Modèles TypeScript pour les situations et matchs
 * Basé sur l'architecture des échauffements
 */
import { Tag } from './tag.model';

/**
 * Interface principale pour une situation/match
 */
export interface SituationMatch {
  id?: string;
  nom?: string;                // Nom de la situation/match
  type: 'Match' | 'Situation';  // Type obligatoire
  description?: string;         // Description optionnelle
  temps?: string;              // Temps/durée optionnel
  tags?: Tag[];                // Tags associés (format, etc.)
  createdAt?: Date;
}

/**
 * Interface pour la création d'une nouvelle situation/match
 */
export interface CreateSituationMatchRequest {
  nom?: string;                // Nom de la situation/match
  type: 'Match' | 'Situation';  // Type obligatoire
  description?: string;         // Description optionnelle
  temps?: string;              // Temps/durée optionnel
  tagIds?: string[];           // IDs des tags à associer
}

/**
 * Interface pour la mise à jour d'une situation/match existante
 */
export interface UpdateSituationMatchRequest {
  nom?: string;                 // Nom de la situation/match
  type?: 'Match' | 'Situation'; // Type optionnel en mise à jour
  description?: string;          // Description optionnelle
  temps?: string;               // Temps/durée optionnel
  tagIds?: string[];            // IDs des tags à associer
}

/**
 * Types utilitaires pour le formulaire
 */
export type SituationMatchType = 'Match' | 'Situation';

/**
 * Options pour le sélecteur de type
 */
export const SITUATION_MATCH_TYPES: { value: SituationMatchType; label: string }[] = [
  { value: 'Match', label: 'Match' },
  { value: 'Situation', label: 'Situation' }
];
