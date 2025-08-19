/**
 * Modèle représentant un entraînement simple
 * @description Version simplifiée d'un entraînement pour le système legacy
 */
export interface TrainingSimple {
  /** Identifiant unique de l'entraînement */
  id?: string | number;
  /** Titre de l'entraînement */
  titre: string;
  /** Date de l'entraînement */
  date?: Date | string;
  /** Durée en minutes */
  duree?: number;
  /** Date de création */
  dateCreation?: Date;
  /** Date de dernière modification */
  dateModification?: Date;
  /** Niveau de difficulté */
  niveau?: string;
  /** Index signature pour compatibilité avec Entity */
  [key: string]: unknown;
}

/**
 * Interface pour la création d'un entraînement simple
 * @description Données nécessaires pour créer un nouvel entraînement simple
 */
export interface TrainingSimpleCreate {
  /** Titre de l'entraînement (obligatoire) */
  titre: string;
  /** Date de l'entraînement (optionnelle) */
  date?: Date | string;
  /** Durée en minutes (optionnelle) */
  duree?: number;
  /** Niveau de difficulté (optionnel) */
  niveau?: string;
}
