import { Tag } from './tag.model';

/**
 * Modèle représentant un exercice d'ultimate frisbee
 * @description Définit la structure des exercices dans l'application
 */
export interface Exercice {
  /** Identifiant unique de l'exercice */
  id?: string;
  /** Nom de l'exercice */
  nom: string;
  /** Description détaillée de l'exercice */
  description: string;
  /** URL vers l'image illustrant l'exercice */
  imageUrl?: string;

  /** Points importants - peut être une chaîne JSON (ancien format) ou un tableau */
  points?: string | string[];

  /** Matériel requis pour l'exercice */
  materiel?: string;
  /** Notes générales associées à l'exercice */
  notes?: string;
  /** Critère de réussite de l'exercice */
  critereReussite?: string;
  /** Date de création de l'exercice */
  createdAt?: Date;
  /** Liste des tags associés à cet exercice */
  tags?: Tag[];
  /** Liste des identifiants de tags (utilisée pour le filtrage) */
  tagIds?: string[];
  /** Variables personnalisées sous forme de texte enrichi (ancien format) */
  variablesText?: string;
  /** Variables qui augmentent la difficulté (+) - peut être une chaîne ou un tableau */
  variablesPlus?: string | string[];
  /** Variables qui diminuent la difficulté (-) - peut être une chaîne ou un tableau */
  variablesMinus?: string | string[];
  /** Index signature pour compatibilité Entity */
  [key: string]: unknown;
}