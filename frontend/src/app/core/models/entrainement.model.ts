import { Tag } from './tag.model';
import { SituationMatch } from './situationmatch.model';
import { Exercice } from './exercice.model';
import { Echauffement } from './echauffement.model';
import { Lexique } from './lexique.model';

/**
 * Modèle représentant un entraînement d'ultimate frisbee avec ses exercices
 */
export interface Entrainement {
  id?: string;
  titre: string;
  date?: Date;
  /** Position dans une progression Thème x Niveau, utilisée quand la date est absente/peu fiable */
  rang?: number | null;
  imageUrl?: string;
  createdAt?: Date | string;
  exercices?: EntrainementExercice[];
  dureeTotal?: number; // Durée totale calculée en minutes
  // Relations avec les tags
  tags?: Tag[];
  // Lexique du jour (vocabulaire introduit pendant cette séance)
  lexique?: Lexique[];
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

