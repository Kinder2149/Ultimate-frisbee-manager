import { TAG_CATEGORIES } from "@shared/constants/tag-categories";

/**
 * Crée un type TypeScript à partir du tableau de constantes partagé.
 * C'est la source de vérité unique pour les catégories de tags dans le frontend.
 */
export type TagCategory = typeof TAG_CATEGORIES[number];

/**
 * Modèle représentant un tag pour les exercices
 * @description Utilisé pour catégoriser et filtrer les exercices
 */
export interface Tag {
  /** Identifiant unique du tag */
  id?: string;
  /** Nom du tag */
  label: string;
  /** Catégorie du tag */
  category: TagCategory;
  /** Code couleur au format HEX (#RRGGBB) */
  color?: string;
  /** Niveau de difficulté (1-5) - uniquement pour les tags de catégorie 'niveau' */
  level?: number;
  /** Date de création du tag */
  createdAt?: Date;
}
