"use strict";
/**
 * Constantes partagées pour les catégories de tags
 * Utilisées par le backend et le frontend pour garantir la cohérence
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidLevel = exports.isValidCategory = exports.NIVEAU_LABELS = exports.DEFAULT_TAG_COLORS = exports.TAG_CATEGORY_LABELS = exports.TAG_CATEGORIES = void 0;
exports.TAG_CATEGORIES = [
    'objectif',
    'travail_specifique',
    'niveau',
    'temps',
    'format',
    'theme_entrainement'
];
/**
 * Labels d'affichage pour les catégories
 */
exports.TAG_CATEGORY_LABELS = {
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
exports.DEFAULT_TAG_COLORS = {
    'objectif': '#4CAF50', // Vert
    'travail_specifique': '#2196F3', // Bleu
    'niveau': '#9C27B0', // Violet
    'temps': '#607D8B', // Bleu-gris
    'format': '#795548', // Marron
    'theme_entrainement': '#FF5722' // Orange
};
/**
 * Labels pour les niveaux d'étoiles (1-5)
 */
exports.NIVEAU_LABELS = {
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
    return exports.TAG_CATEGORIES.includes(category);
};
exports.isValidCategory = isValidCategory;
/**
 * Validation du niveau pour la catégorie niveau
 */
const isValidLevel = (level, category) => {
    if (category === 'niveau') {
        return Number.isInteger(level) && level >= 1 && level <= 5;
    }
    return level === null || level === undefined;
};
exports.isValidLevel = isValidLevel;
