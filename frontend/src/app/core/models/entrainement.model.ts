import { Tag } from './tag.model';
import { SituationMatch } from './situationmatch.model';
import { Exercice } from './exercice.model';
import { Echauffement } from './echauffement.model';

/**
 * Modèle représentant un entraînement d'ultimate frisbee avec ses exercices
 */
export interface Entrainement {
  id?: string;
  titre: string;
  date?: Date;
  imageUrl?: string;
  schemaUrl?: string;
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

