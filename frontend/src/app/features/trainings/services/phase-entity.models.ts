import { Entity } from '../../../shared/services/entity-crud.service';
import { Phase, PhaseFormData } from './training.models';

/**
 * Interface représentant une entité Phase compatible avec EntityCrudService.
 * Étend l'interface Phase existante et implémente l'interface Entity.
 */
export interface PhaseEntity extends Phase, Entity {
  // L'ID est déjà présent dans Phase, mais nous le déclarons explicitement
  // pour montrer clairement que PhaseEntity implémente Entity
  id: string;
  
  // Ajoute tous les champs spécifiques aux phases
  // (les champs sont déjà présents dans l'interface Phase)
}

/**
 * Interface pour les données de formulaire de Phase compatibles avec EntityCrudService
 */
export interface PhaseFormDataEntity extends PhaseFormData {
  // Propriétés spécifiques au formulaire
}

/**
 * Interface pour les options de duplication d'une phase
 */
export interface PhaseDuplicateOptions {
  entrainementId?: string;  // ID de l'entraînement cible (si différent de l'original)
  position?: number;        // Position dans l'entraînement cible
  titre?: string;           // Titre personnalisé pour la copie
}

/**
 * Interface pour les options de réordonnancement d'une phase
 */
export interface PhaseReorderOptions {
  ordre: number;            // Nouvel ordre de la phase
}
