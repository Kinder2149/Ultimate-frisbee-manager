/**
 * Modèle représentant un tag pour les exercices
 * @description Utilisé pour catégoriser et filtrer les exercices
 */
export interface Tag {
  /** Identifiant unique du tag */
  id?: string;
  /** Nom du tag */
  label: string;
  /** Catégorie du tag (objectif, element, variable ou niveau) */
  category: TagCategory;
  /** Code couleur au format HEX (#RRGGBB) */
  color?: string;
  /** Niveau de difficulté (1-5) - uniquement pour les tags de catégorie 'niveau' */
  level?: number;
  /** Date de création du tag */
  createdAt?: Date;
  /** Index signature pour compatibilité Entity */
  [key: string]: unknown;
}

/**
 * Catégories possibles pour les tags
 * @description Énumération des types de tags disponibles dans l'application
 */
export enum TagCategory {
  OBJECTIF = 'objectif',
  TRAVAIL_SPECIFIQUE = 'travail_specifique',
  NIVEAU = 'niveau',
  TEMPS = 'temps',
  FORMAT = 'format',
  THEME_ENTRAINEMENT = 'theme_entrainement'
  // VARIABLE a été supprimé pour simplifier le modèle et unifier les catégories
}

/**
 * Labels pour les niveaux d'étoiles (1-5)
 * @description Correspondance entre le niveau numérique et son libellé
 */
export const NIVEAU_LABELS: { [key: number]: string } = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Confirmé',
  4: 'Avancé',
  5: 'Expert'
};

/**
 * Couleurs par défaut pour chaque catégorie
 * @description Définit une couleur par défaut pour chaque catégorie de tag
 */
export const DEFAULT_TAG_COLORS: { [key: string]: string } = {
  [TagCategory.OBJECTIF]: '#4CAF50', // Vert
  [TagCategory.TRAVAIL_SPECIFIQUE]: '#2196F3',  // Bleu
  [TagCategory.NIVEAU]: '#9C27B0',   // Violet
  [TagCategory.TEMPS]: '#607D8B',    // Bleu-gris
  [TagCategory.FORMAT]: '#795548',   // Marron
  [TagCategory.THEME_ENTRAINEMENT]: '#FF5722'     // Orange
};

/**
 * Interface pour la suggestion de tags
 * @description Utilisée pour proposer des tags à l'utilisateur lors de la création/édition d'exercices
 */
export interface TagSuggestion {
  /** Identifiant unique du tag suggéré */
  id: string;
  /** Nom du tag suggéré */
  label: string;
  /** Catégorie du tag suggéré */
  category: TagCategory;
  /** Indique si le tag est déjà sélectionné */
  selected?: boolean;
  /** Code couleur au format HEX */
  color?: string;
  /** Niveau de difficulté (pour les tags de niveau) */
  level?: number;
}

/**
 * Interface pour le mapping des tags
 * @description Utilisée pour gérer les associations entre les tags et les exercices
 */
export interface TagMapping {
  /** Catégorie du tag */
  category: string;
  /** Liste des tags de cette catégorie */
  tags: Tag[];
}