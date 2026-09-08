export const LEXIQUE_CATEGORIES = ['Attaque', 'Défense', 'Transverse', 'Play', 'Cue moteur'] as const;

export type LexiqueCategorie = typeof LEXIQUE_CATEGORIES[number];

/**
 * Modèle représentant un terme du lexique (vocabulaire commun du club)
 */
export interface Lexique {
  id?: string;
  terme: string;
  definition: string;
  categorie: LexiqueCategorie;
  motImage?: boolean;
  createdAt?: Date;
}
