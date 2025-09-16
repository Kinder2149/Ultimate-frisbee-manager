import { Tag } from './tag.model';
import { SituationMatch } from './situationmatch.model';
import { Exercice } from './exercice.model';

/**
 * Modèle représentant un entraînement d'ultimate frisbee avec ses exercices
 */
export interface Entrainement {
  id?: string;
  titre: string;
  date?: Date;
  imageUrl?: string;
  createdAt?: Date | string;
  exercices?: EntrainementExercice[];
  dureeTotal?: number; // Durée totale calculée en minutes
  // Relations avec les tags
  tags?: Tag[];
  // Nouvelles relations optionnelles
  echauffementId?: string;
  situationMatchId?: string;
  echauffement?: Echauffement;
  situationMatch?: SituationMatch;
  [key: string]: any;
}

export interface EntrainementExercice {
  id?: string;
  entrainementId: string;
  exerciceId: string;
  ordre: number;
  duree?: number;
  notes?: string;
  exercice?: Exercice;
}


// Interfaces pour les nouvelles relations
export interface Echauffement {
  id?: string;
  nom: string;
  description?: string;
  createdAt?: Date | string;
  blocs?: BlocEchauffement[];
}

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
}

