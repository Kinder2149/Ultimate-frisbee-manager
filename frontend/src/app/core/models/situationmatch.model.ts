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
  nom?: string; // Nom de la situation/match
  type: 'Match' | 'Situation';  // Type obligatoire
  description?: string;         // Description optionnelle
  temps?: string;              // Temps/durée optionnel
  imageUrl?: string;             // URL de l'image
  tags?: Tag[];                // Tags associés (format, etc.)
  createdAt?: Date;
}
