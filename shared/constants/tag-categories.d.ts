/**
 * Constantes partagées pour les catégories de tags
 * Utilisées par le backend et le frontend pour garantir la cohérence
 */
export declare const TAG_CATEGORIES: readonly ["objectif", "travail_specifique", "niveau", "temps", "format", "theme_entrainement"];
export type TagCategory = typeof TAG_CATEGORIES[number];
/**
 * Labels d'affichage pour les catégories
 */
export declare const TAG_CATEGORY_LABELS: {
    [key in TagCategory]: string;
};
/**
 * Couleurs par défaut pour chaque catégorie
 */
export declare const DEFAULT_TAG_COLORS: {
    [key in TagCategory]?: string;
};
/**
 * Labels pour les niveaux d'étoiles (1-5)
 */
export declare const NIVEAU_LABELS: {
    [key: number]: string;
};
/**
 * Validation des catégories
 */
export declare const isValidCategory: (category: any) => category is TagCategory;
/**
 * Validation du niveau pour la catégorie niveau
 */
export declare const isValidLevel: (level: any, category: any) => boolean;
