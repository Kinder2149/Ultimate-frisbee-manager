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

export interface Exercice {
  id?: string;
  nom?: string;
  description?: string;
  schemaUrl?: string;
  variablesPlus?: string | string[];
  variablesMinus?: string | string[];
  tags?: Tag[];
}

export interface Tag {
  id?: string;
  label: string;
  category: string;
  color?: string;
  level?: number;
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

export interface SituationMatch {
  id?: string;
  nom?: string; // Nom de la situation/match
  type: string; // "Match" ou "Situation"
  description?: string;
  temps?: string;
  createdAt?: Date | string;
  tags?: Tag[];
}
