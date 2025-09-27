/**
 * Constantes partagées pour les catégories de tags
 * Utilisées par le backend et le frontend pour garantir la cohérence
 */

export const TAG_CATEGORIES = [
  'objectif',
  'travail_specifique',
  'niveau',
  'temps',
  'format',
  'theme_entrainement'
] as const;

export type TagCategory = typeof TAG_CATEGORIES[number];

/**
 * Labels d'affichage pour les catégories
 */
export const TAG_CATEGORY_LABELS: { [key in TagCategory]: string } = {
  'objectif': 'Objectifs',
  'travail_specifique': 'Travail Spécifique',
  'niveau': 'Niveaux',
  'temps': 'Temps moyen',
  'format': 'Format',
  'theme_entrainement': 'Thèmes Entraînements'
};

/**
 * Couleurs par défaut pour chaque catégorie
 */
export const DEFAULT_TAG_COLORS: { [key in TagCategory]?: string } = {
  'objectif': '#4CAF50',        // Vert
  'travail_specifique': '#2196F3', // Bleu
  'niveau': '#9C27B0',          // Violet
  'temps': '#607D8B',           // Bleu-gris
  'format': '#795548',          // Marron
  'theme_entrainement': '#FF5722'  // Orange
};

/**
 * Labels pour les niveaux d'étoiles (1-5)
 */
export const NIVEAU_LABELS: { [key: number]: string } = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Confirmé',
  4: 'Avancé',
  5: 'Expert'
};

/**
 * Validation des catégories
 */
export const isValidCategory = (category: any): category is TagCategory => {
  return (TAG_CATEGORIES as readonly string[]).includes(category);
};

/**
 * Validation du niveau pour la catégorie niveau
 */
export const isValidLevel = (level: any, category: any): boolean => {
  if (category === 'niveau') {
    return Number.isInteger(level) && level >= 1 && level <= 5;
  }
  return level === null || level === undefined;
};
