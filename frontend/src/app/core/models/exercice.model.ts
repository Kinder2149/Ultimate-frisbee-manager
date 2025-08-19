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
  /** URL vers une image de l'exercice */
  imageUrl?: string;
  /** URL vers le schéma ou l'image illustrant l'exercice */
  schemaUrl?: string;
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