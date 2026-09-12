import { Tag } from './tag.model';

/**
 * Modèles TypeScript pour les échauffements
 */

export interface BlocEchauffement {
  id?: string;
  echauffementId: string;
  ordre: number;
  titre: string;
  repetitions?: string;
  temps?: string;
  informations?: string;
  fonctionnement?: string;
  notes?: string;
  createdAt?: Date;
}

export interface Echauffement {
  id?: string;
  nom: string;
  description?: string;
  imageUrl?: string;
  /** Images supplémentaires (galerie), dans l'ordre */
  imagesSupplementaires?: string[];
  /** Étiquettes (dont le type d'échauffement : physique, réveil musculaire…) */
  tags?: Tag[];
  tagIds?: string[];
  createdAt?: Date;
  blocs?: BlocEchauffement[];
}
