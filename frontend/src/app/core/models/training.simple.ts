import { BaseModel } from './base.model';

/**
 * Interface simplifiée pour un entraînement
 * Version minimaliste avec le titre/nom et des champs optionnels pour l'affichage
 */
export interface TrainingSimple extends BaseModel {
  /**
   * Titre/nom de l'entraînement (seul champ obligatoire)
   */
  titre: string;

  /**
   * Date de l'entraînement (optionnel)
   */
  date?: string;

  /**
   * Durée en minutes de l'entraînement (optionnel)
   */
  duree?: number;

  /**
   * Niveau de l'entraînement (optionnel)
   */
  niveau?: string;

  /**
   * Tags associés à l'entraînement (optionnel)
   */
  tags?: {
    label: string;
    color: string;
    textColor: string;
  };

  /** Index signature pour compatibilité avec Entity */
  [key: string]: unknown;
}

/**
 * Interface pour la création d'un entraînement simple
 * @description Cette interface définit la structure des données nécessaires
 * pour créer un nouvel entraînement dans le système.
 */
export interface TrainingSimpleCreate {
  /**
   * Titre/nom de l'entraînement (obligatoire)
   * @example "Entraînement défense en zone"
   */
  titre: string;

  /**
   * Date de l'entraînement au format ISO (YYYY-MM-DD)
   * Si non spécifiée, la date du jour sera utilisée
   * @example "2023-12-15"
   */
  date?: string;

  /**
   * Durée prévue de l'entraînement en minutes
   * @example 90
   */
  duree?: number;

  /**
   * Niveau de difficulté de l'entraînement
   * @example "Débutant", "Intermédiaire", "Avancé"
   */
  niveau?: string;
}
