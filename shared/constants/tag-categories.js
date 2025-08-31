/**
 * Constantes partagées pour les catégories de tags
 * Utilisées par le backend et le frontend pour garantir la cohérence
 */

/**
 * Énumération des catégories de tags
 */
const TAG_CATEGORIES = {
  OBJECTIF: 'objectif',
  TRAVAIL_SPECIFIQUE: 'travail_specifique',
  NIVEAU: 'niveau',
  TEMPS: 'temps',
  FORMAT: 'format',
  THEME_ENTRAINEMENT: 'theme_entrainement'
};

/**
 * Labels d'affichage pour les catégories
 */
const TAG_CATEGORY_LABELS = {
  [TAG_CATEGORIES.OBJECTIF]: 'Objectifs',
  [TAG_CATEGORIES.TRAVAIL_SPECIFIQUE]: 'Travail Spécifique',
  [TAG_CATEGORIES.NIVEAU]: 'Niveaux',
  [TAG_CATEGORIES.TEMPS]: 'Temps moyen',
  [TAG_CATEGORIES.FORMAT]: 'Format',
  [TAG_CATEGORIES.THEME_ENTRAINEMENT]: 'Thèmes Entraînements'
};

/**
 * Couleurs par défaut pour chaque catégorie
 */
const DEFAULT_TAG_COLORS = {
  [TAG_CATEGORIES.OBJECTIF]: '#4CAF50',        // Vert
  [TAG_CATEGORIES.TRAVAIL_SPECIFIQUE]: '#2196F3', // Bleu
  [TAG_CATEGORIES.NIVEAU]: '#9C27B0',          // Violet
  [TAG_CATEGORIES.TEMPS]: '#607D8B',           // Bleu-gris
  [TAG_CATEGORIES.FORMAT]: '#795548',          // Marron
  [TAG_CATEGORIES.THEME_ENTRAINEMENT]: '#FF5722'  // Orange
};

/**
 * Labels pour les niveaux d'étoiles (1-5)
 */
const NIVEAU_LABELS = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Confirmé',
  4: 'Avancé',
  5: 'Expert'
};

/**
 * Validation des catégories
 */
const isValidCategory = (category) => {
  return Object.values(TAG_CATEGORIES).includes(category);
};

/**
 * Validation du niveau pour la catégorie niveau
 */
const isValidLevel = (level, category) => {
  if (category === TAG_CATEGORIES.NIVEAU) {
    return Number.isInteger(level) && level >= 1 && level <= 5;
  }
  return level === null || level === undefined;
};

module.exports = {
  TAG_CATEGORIES,
  TAG_CATEGORY_LABELS,
  DEFAULT_TAG_COLORS,
  NIVEAU_LABELS,
  isValidCategory,
  isValidLevel
};
