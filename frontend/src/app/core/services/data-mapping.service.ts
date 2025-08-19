import { Injectable } from '@angular/core';
import { Training, TrainingTag } from '../models/training.model';
import { Entrainement, TrainingTag as FeatureTrainingTag } from '../../features/trainings/services/training.models';

/**
 * Type étendu pour la compatibilité entre les différents modèles de tag
 * 
 * IMPORTANT: Il existe deux conventions de nommage dans l'application:
 * 1. Format backend API: nom/couleur 
 * 2. Format frontend UI: label/color
 * 
 * Ce type aide à la conversion bidirectionnelle entre ces formats.
 */
export interface ExtendedTrainingTag {
  // Base properties
  id: string;
  label: string;
  color: string;
  category?: string;
  level?: number;
  createdAt?: Date;
  
  // Compatibilité avec ancien format
  nom?: string;
  couleur?: string;
}

/**
 * Type étendu pour la compatibilité entre les différents modèles d'entraînement
 */
export interface ExtendedTraining extends Training {
  // Propriétés du modèle de l'application
  title?: string;
  duration?: number;
  difficulty?: number;
  isDraft?: boolean;
}

/**
 * Service de mapping entre les différents modèles de données
 * Permet d'harmoniser les interfaces entre le backend et le frontend
 */
@Injectable({
  providedIn: 'root'
})
export class DataMappingService {

  constructor() { }

  /**
   * Convertit un tag du format API vers le format de l'application
   * @param apiTag Tag provenant de l'API
   * @returns Tag au format de l'application
   */
  mapApiTagToAppTag(apiTag: any): ExtendedTrainingTag {
    // Logging pour diagnostic
    console.debug('Mapping API tag to app format:', apiTag);

    if (!apiTag) return {} as ExtendedTrainingTag;
    
    // Priorité à la convention frontend (label/color) mais avec fallback sur les propriétés backend (nom/couleur)
    // Toujours garantir qu'on retourne des valeurs non-null pour éviter les erreurs 'Cannot read properties of undefined'
    const result: ExtendedTrainingTag = {
      id: apiTag.id || '',
      label: apiTag.label || apiTag.nom || '',
      color: apiTag.color || apiTag.couleur || '#3f51b5',
      category: apiTag.category || apiTag.categorie || '',
      level: typeof apiTag.level === 'number' ? apiTag.level : (typeof apiTag.niveau === 'number' ? apiTag.niveau : 0),
      createdAt: apiTag.createdAt || apiTag.dateCreation || new Date(),
      // Compatibilité avec ancien format - toujours fournir les deux formats
      nom: apiTag.label || apiTag.nom || '',
      couleur: apiTag.color || apiTag.couleur || '#3f51b5'
    };
    
    console.debug('Résultat du mapping tag:', result);
    return result;
  }

  /**
   * Convertit un tag du format de l'application vers le format API
   * @param appTag Tag au format de l'application étendu
   * @returns Tag au format API
   */
  mapAppTagToApiTag(appTag: ExtendedTrainingTag): any {
    // Logging pour diagnostic
    console.debug('Mapping app tag to API format:', appTag);

    if (!appTag) return {};
    
    // Adapter au format API en priorité avec les propriétés harmonisées
    return {
      id: appTag.id,
      nom: appTag.label || appTag.nom || '',    // Priorité à label
      categorie: appTag.category || '',
      couleur: appTag.color || appTag.couleur || '', // Priorité à color
      niveau: appTag.level || 0,
      dateCreation: appTag.createdAt
    };
  }

  /**
   * Convertit un entraînement du format API vers le format de l'application
   * @param apiTraining Entraînement provenant de l'API
   * @returns Entraînement au format de l'application étendu
   */
  mapApiTrainingToAppTraining(apiTraining: any): ExtendedTraining {
    // Logging pour diagnostic
    console.debug('Mapping API training to app format:', apiTraining);

    if (!apiTraining) return {} as ExtendedTraining;

    // Mapping des tags si présents
    const mappedTags = apiTraining.tags && Array.isArray(apiTraining.tags)
      ? apiTraining.tags.map((tag: any) => this.mapApiTagToAppTag(tag))
      : [];

    // Créer une version étendue de l'entraînement pour la compatibilité
    return {
      id: apiTraining.id || '',
      titre: apiTraining.titre || apiTraining.title || '',
      description: apiTraining.description || apiTraining.theme || '',
      duree: apiTraining.dureeTotal || apiTraining.duration || 0,
      niveau: apiTraining.difficulte || apiTraining.difficulty || 0,
      date: apiTraining.date || null,
      tags: mappedTags,
      phases: apiTraining.phases || [],
      // Propriétés additionnelles pour la compatibilité
      title: apiTraining.titre || apiTraining.title || '',
      duration: apiTraining.dureeTotal || apiTraining.duration || 0,
      difficulty: apiTraining.difficulte || apiTraining.difficulty || 0,
      isDraft: apiTraining.isDraft || false,
      createdAt: apiTraining.createdAt ? new Date(apiTraining.createdAt) : new Date()
    };
  }

  /**
   * Convertit un entraînement du format de l'application vers le format API
   * @param appTraining Entraînement au format de l'application étendu
   * @returns Entraînement au format API
   */
  mapAppTrainingToApiTraining(appTraining: ExtendedTraining): any {
    // Logging pour diagnostic
    console.debug('Mapping app training to API format:', appTraining);

    if (!appTraining) return {};

    // Conversion des tags en IDs pour l'API
    const tagIds = appTraining.tags && Array.isArray(appTraining.tags)
      ? appTraining.tags.map(tag => tag.id)
      : [];

    return {
      id: appTraining.id,
      titre: appTraining.titre || appTraining.title || '',
      theme: appTraining.description || '',
      dureeTotal: appTraining.duree || appTraining.duration || 0,
      date: appTraining.date || null,
      tagIds: tagIds,
      phases: appTraining.phases || [],
      isDraft: appTraining.isDraft || false
    };
  }

  /**
   * Convertit un tableau d'entraînements du format API vers le format de l'application
   * @param apiTrainings Tableau d'entraînements provenant de l'API
   * @returns Tableau d'entraînements au format de l'application
   */
  mapApiTrainingsToAppTrainings(apiTrainings: any[]): Training[] {
    if (!apiTrainings || !Array.isArray(apiTrainings)) {
      console.warn('mapApiTrainingsToAppTrainings called with invalid data:', apiTrainings);
      return [];
    }
    
    return apiTrainings.map(training => this.mapApiTrainingToAppTraining(training));
  }

  /**
   * Analyse les propriétés d'un objet pour diagnostiquer les incohérences
   * @param obj Objet à analyser
   * @param objName Nom de l'objet pour le logging
   */
  /**
   * Analyse les propriétés d'un objet pour diagnostiquer les incohérences
   * Cette méthode est utile pour déboguer les problèmes de structure de données
   * entre le backend et le frontend, particulièrement les champs manquants ou mal typés.
   * 
   * @param obj Objet à analyser
   * @param objName Nom de l'objet pour le logging
   */
  diagnoseObjectStructure(obj: any, objName: string = 'Object'): void {
    if (!obj) {
      console.warn(`[DIAGNOSTIC] ${objName} est null ou undefined`);
      return;
    }
    
    console.group(`[DIAGNOSTIC] Structure de ${objName}`);
    console.log('Type:', typeof obj);
    
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        console.log('Est un tableau de longueur:', obj.length);
        if (obj.length > 0) {
          console.log('Premier élément:', obj[0]);
          this.diagnoseObjectStructure(obj[0], `${objName}[0]`);
        }
      } else {
        // Vérifier les propriétés problématiques connues
        if (objName.includes('tag') || objName.includes('Tag')) {
          console.warn(`Vérification des propriétés problématiques pour ${objName}:`);
          console.warn(`- label: ${obj.label !== undefined ? 'présent' : 'MANQUANT!'}`);
          console.warn(`- color: ${obj.color !== undefined ? 'présent' : 'MANQUANT!'}`);
          console.warn(`- nom: ${obj.nom !== undefined ? 'présent' : 'MANQUANT!'}`);
          console.warn(`- couleur: ${obj.couleur !== undefined ? 'présent' : 'MANQUANT!'}`);
        }

        console.log('Propriétés:', Object.keys(obj));
        for (const key of Object.keys(obj)) {
          const value = obj[key];
          if (typeof value === 'object' && value !== null) {
            console.log(`${key}:`, typeof value, Array.isArray(value) ? 'array' : 'object');
            // Ne pas aller trop profond pour éviter les récursions infinies
            if (key === 'tags' || key === 'phases') {
              this.diagnoseObjectStructure(value, `${objName}.${key}`);
            }
          } else {
            console.log(`${key}:`, typeof value, value);
          }
        }
      }
    } else {
      console.log('Valeur:', obj);
    }
    
    console.groupEnd();
  }
}
