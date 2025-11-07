import { Injectable } from '@angular/core';
import { Entrainement, TrainingTag, Phase, PhaseExercice, ExerciceElement, PhaseFormData, EntrainementFormData, PhaseExerciceFormData } from './training.models';

/**
 * Interface pour documenter les différences de modèles entre frontend et backend
 */
interface ModelMapping {
  frontend: string;
  backend: string;
  defaultValue?: any;
  description?: string;
}

/**
 * Service pour normaliser les modèles entre le frontend et le backend
 * Résout les problèmes de cohérence entre les structures de données
 * 
 * Ce service est crucial pour gérer les différences de nommage et de structure
 * entre les modèles côté frontend (label/color) et backend (nom/couleur).
 */
@Injectable({
  providedIn: 'root'
})
export class ModelAdapterService {
  
  /**
   * Journalise les diagnostics sur les structures de données pour faciliter le débogage
   * @param title Titre du diagnostic
   * @param object Objet à diagnostiquer
   * @param level Niveau de log (debug, warn, error)
   */
  diagnoseObjectStructure(title: string, object: any, level: 'debug' | 'warn' | 'error' = 'debug'): void {
    if (!object) {
      console[level](`${title}: Objet null ou undefined`);
      return;
    }
    
    // Vérifier si l'objet est un tag ou contient des tags
    const diagnoseTag = (tag: any, prefix: string) => {
      if (!tag) return;
      
      const hasBackendProps = tag.nom !== undefined || tag.couleur !== undefined;
      const hasFrontendProps = tag.label !== undefined || tag.color !== undefined;
      
      if (hasBackendProps && !hasFrontendProps) {
        console[level](`${prefix}: Tag avec structure backend uniquement`, tag);
      } else if (hasFrontendProps && !hasBackendProps) {
        console[level](`${prefix}: Tag avec structure frontend uniquement`, tag);
      } else if (hasFrontendProps && hasBackendProps) {
        console[level](`${prefix}: Tag avec structure hybride`, tag);
      }
    };
    
    // Si c'est un tableau, analyser chaque élément
    if (Array.isArray(object)) {
      console[level](`${title}: Tableau de ${object.length} éléments`);
      if (object.length > 0 && (object[0].label !== undefined || object[0].nom !== undefined)) {
        // Probablement un tableau de tags
        object.forEach((item, index) => diagnoseTag(item, `${title}[${index}]`));
      }
    } 
    // Si c'est un objet simple
    else if (typeof object === 'object') {
      // Vérifier si c'est un tag
      if (object.label !== undefined || object.nom !== undefined) {
        diagnoseTag(object, title);
      } else {
        // Pour les autres objets, lister les propriétés de premier niveau
        console[level](`${title}: Propriétés de l'objet`, Object.keys(object));
        
        // Si l'objet a une propriété tags, l'analyser spécifiquement
        if (Array.isArray(object.tags)) {
          object.tags.forEach((tag: any, index: number) => {
            diagnoseTag(tag, `${title}.tags[${index}]`);
          });
        }
      }
    }
  }
  
  /**
   * Définitions des mappings de propriétés entre frontend et backend
   * Ces mappings sont utilisés pour guider les transformations automatiques
   */
  private readonly propertyMappings = {
    tags: [
      { frontend: 'label', backend: 'nom', defaultValue: 'Sans nom', description: 'Nom du tag' },
      { frontend: 'color', backend: 'couleur', defaultValue: '#3f51b5', description: 'Couleur du tag' },
      { frontend: 'category', backend: 'categorie', defaultValue: 'Non classé', description: 'Catégorie du tag' }
    ]
  };
  
  /**
   * Normalise un tag pour utiliser une convention cohérente (label/color)
   * @param tag Tag à normaliser (peut provenir du backend ou du frontend)
   * @returns Tag normalisé avec des propriétés cohérentes
   */
  normalizeTag(tag: any): TrainingTag {
    if (!tag) return null as unknown as TrainingTag;
    
    // Diagnostic de la structure du tag reçu
    const hasBackendProps = tag.nom !== undefined || tag.couleur !== undefined;
    const hasFrontendProps = tag.label !== undefined || tag.color !== undefined;
    
    if (hasBackendProps && !hasFrontendProps) {
      console.debug('ModelAdapter: Tag avec structure backend détecté', tag);
    }
    
    return {
      id: tag.id,
      label: tag.label || tag.nom || 'Sans nom',
      color: tag.color || tag.couleur || '#3f51b5',
      category: tag.category || tag.categorie || 'Non classé'
    };
  }
  
  /**
   * Normalise un tableau de tags
   */
  normalizeTags(tags: any[]): TrainingTag[] {
    return tags?.map(tag => this.normalizeTag(tag)) || [];
  }
  
  /**
   * Normalise un entraînement complet avec tous ses objets enfants
   */
  normalizeTraining(training: any): Entrainement {
    if (!training) return null as unknown as Entrainement;
    
    return {
      id: training.id,
      titre: training.titre || 'Sans titre',
      theme: training.theme || '',
      date: training.date ? new Date(training.date) : new Date(),
      dureeTotal: training.dureeTotal || training.duree || 0,
      isDraft: !!training.isDraft,
      tags: this.normalizeTags(training.tags || []),
      phases: (training.phases || []).map((phase: any) => this.normalizePhase(phase))
    };
  }
  
  /**
   * Normalise une phase
   */
  normalizePhase(phase: Phase | any): Phase {
    if (!phase) return null as unknown as Phase;
    
    return {
      id: phase.id,
      titre: phase.titre || 'Sans titre',
      type: phase.type || 'exercice',
      duree: phase.duree || 0,
      ordre: phase.ordre || 0,
      entrainementId: phase.entrainementId,
      exercices: (phase.exercices || []).map((ex: any) => this.normalizePhaseExercice(ex))
    };
  }
  
  /**
   * Normalise un exercice de phase
   */
  normalizePhaseExercice(exercice: PhaseExercice | any): PhaseExercice {
    if (!exercice) return null as unknown as PhaseExercice;
    
    return {
      id: exercice.id,
      nom: exercice.nom || exercice.titre || 'Sans titre',
      description: exercice.description || '',
      // Les propriétés objectif et materiel ne sont pas dans l'interface PhaseExercice
      // donc on ne les inclut pas dans l'objet normalisé
      duree: exercice.duree || 0,
      ordre: exercice.ordre || 0, // Ajout de la propriété ordre manquante
      phaseId: exercice.phaseId,
      tags: (exercice.tags || []) as string[],
      elements: (exercice.elements || []) as ExerciceElement[]
    };
  }
  
  /**
   * Prépare un objet pour l'API en convertissant les structures frontend vers backend
   * Cette méthode est utilisée avant d'envoyer des données à l'API
   * @param object Objet à préparer pour l'API (structure frontend)
   * @param type Type optionnel d'objet pour traitement spécifique ('entrainement', 'phase', 'exercice')
   * @returns Objet adapté à la structure attendue par le backend
   */
  prepareForApi(object: any, type?: 'entrainement' | 'phase' | 'exercice'): any {
    if (!object) return object;
    
    // Journaliser l'objet reçu pour le débogage
    console.debug(`[ModelAdapter] prepareForApi avec type=${type || 'non spécifié'}:`, 
      typeof object === 'object' ? 
      (Array.isArray(object) ? `Array[${object.length}]` : JSON.stringify(Object.keys(object))) : 
      typeof object);
    
    // Cas spécial pour les tableaux
    if (Array.isArray(object)) {
      // Pour les tableaux vides, retourner directement
      if (object.length === 0) return [];
      
      // Pour les tableaux non-vides, traiter chaque élément
      return object.map((item, index) => {
        // Déterminer le type en fonction du contenu du tableau
        let itemType: 'entrainement' | 'phase' | 'exercice' | undefined = type;
        
        if (!itemType) {
          if (item.type && ['echauffement', 'exercice', 'situation', 'conclusion'].includes(item.type)) {
            itemType = 'phase';
          } else if (item.phaseId !== undefined || (item.elements !== undefined)) {
            itemType = 'exercice';
          }
          
          // Logging pour débogage
          if (!itemType) {
            console.debug(`[ModelAdapter] Item[${index}] type non déterminé:`, 
              Object.keys(item));
          }
        }
        
        return this.prepareForApi(item, itemType);
      });
    }
    
    // Cas général pour les objets
    if (typeof object === 'object' && object !== null) {
      // Créer une copie profonde pour éviter de modifier l'original
      const result = JSON.parse(JSON.stringify(object));
      
      // Suppression des propriétés temporaires et utilitaires non attendues par l'API
      delete result.addToDatabase;
      delete result.isNew;
      delete result.isTemporary;
      delete result.isModified;
      delete result._previousState;
      delete result._formInitialized;
      
      // Traitement spécifique selon le type d'objet
      if (type === 'entrainement') {
        console.debug('[ModelAdapter] Traitement d\'un entrainement:', Object.keys(result));
        
        // Nettoyage systématique des propriétés temporaires spécifiques aux entraînements
        const trainingPropsToClean = ['isTemporary', 'isModified', 'addToDatabase'];
        trainingPropsToClean.forEach(prop => {
          if (prop in result) {
            console.debug(`[ModelAdapter] Suppression de la propriété temporaire d'entraînement: ${prop}`);
            delete (result as any)[prop];
          }
        });
        
        // Pour un entraînement, traiter spécifiquement les phases
        if (result.phases) {
          // Assurer l'ordre correct avant l'envoi
          if (Array.isArray(result.phases)) {
            result.phases = result.phases
              .filter((phase: any) => phase !== null && phase !== undefined) // Éliminer les phases null/undefined
              .map((phase: any, index: number) => {
                if (typeof phase === 'object') {
                  // Assigner l'ordre explicitement en fonction de la position dans le tableau
                  return { ...phase, ordre: index + 1 };
                }
                return phase;
              });
          }
          result.phases = this.prepareForApi(result.phases, 'phase');
        }
        
        // Traiter spécifiquement les tags pour un entraînement
        if (result.tags) {
          // Si tagIds est déjà défini, on n'a pas besoin de le recréer
          if (!result.tagIds && Array.isArray(result.tags)) {
            result.tagIds = result.tags.map((tag: {id: string}) => tag.id || '').filter(Boolean);
          }
        }
      } 
      else if (type === 'phase') {
        console.debug('[ModelAdapter] Traitement d\'une phase:', 
          result.id ? `ID: ${result.id}` : 'Nouvelle phase',
          `Ordre: ${result.ordre || 'non spécifié'}`,
          `${result.exercices ? `${result.exercices.length} exercices` : 'Pas d\'exercices'}`);
        
        // Nettoyer les IDs temporaires pour les nouvelles phases
        if (result.id && String(result.id).startsWith('new-')) {
          console.debug(`[ModelAdapter] Suppression de l'ID temporaire de phase: ${result.id}`);
          delete result.id;
        }
        
        // Nettoyage systématique des propriétés temporaires spécifiques aux phases
        const phasePropsToClean = ['isTemporary', 'isModified', 'addToDatabase'];
        phasePropsToClean.forEach(prop => {
          if (prop in result) {
            console.debug(`[ModelAdapter] Suppression de la propriété temporaire de phase: ${prop}`);
            delete (result as any)[prop];
          }
        });
        
        // Pour une phase, traiter spécifiquement les exercices
        if (result.exercices) {
          // Assurer l'ordre correct avant l'envoi
          if (Array.isArray(result.exercices)) {
            result.exercices = result.exercices
              .filter((ex: any) => ex !== null && ex !== undefined) // Éliminer les exercices null/undefined
              .map((ex: any, index: number) => {
                if (typeof ex === 'object') {
                  // Assigner l'ordre explicitement en fonction de la position dans le tableau
                  return { ...ex, ordre: index + 1 };
                }
                return ex;
              });
          }
          result.exercices = this.prepareForApi(result.exercices, 'exercice');
        }
        
        // S'assurer que les propriétés essentielles sont présentes
        if (result.ordre === undefined) result.ordre = 0;
      } 
      else if (type === 'exercice') {
        console.debug('[ModelAdapter] Traitement d\'un exercice:', 
          result.id ? `ID: ${result.id}` : 'Nouvel exercice',
          `Ordre: ${result.ordre || 'non spécifié'}`);
        
        // Nettoyer les IDs temporaires pour les nouveaux exercices
        if (result.id && String(result.id).startsWith('new-')) {
          console.debug(`[ModelAdapter] Suppression de l'ID temporaire d'exercice: ${result.id}`);
          delete result.id;
        }
        
        // Nettoyage systématique des propriétés temporaires spécifiques aux exercices
        const exercicePropsToClean = ['isTemporary', 'isModified', 'addToDatabase', 'appliquerGlobalement'];
        exercicePropsToClean.forEach(prop => {
          if (prop in result) {
            console.debug(`[ModelAdapter] Suppression de la propriété temporaire d'exercice: ${prop}`);
            delete (result as any)[prop];
          }
        });
        
        // Pour un exercice de phase, s'assurer que les références sont correctes
        if (result.phaseId && String(result.phaseId).startsWith('new-')) {
          console.debug(`[ModelAdapter] Référence à une phase temporaire supprimée: ${result.phaseId}`);
          delete result.phaseId;
        }
        
        // S'assurer que les propriétés essentielles sont présentes
        if (result.ordre === undefined) result.ordre = 0;
        
        // Nettoyer les tags si présents
        if (result.tags && Array.isArray(result.tags)) {
          result.tags = result.tags.map((tag: any) => {
            // Si le tag a juste un ID, le garder tel quel
            if (typeof tag === 'string' || typeof tag === 'number') return tag;
            
            // Sinon, adapter le format
            return this.prepareForApi(tag);
          }).filter(Boolean); // Éliminer les valeurs null/undefined
        }
      }
      
      // Conversion spécifique pour les tags
      if (object.label !== undefined && object.nom === undefined) {
        result.nom = object.label;
      }
      if (object.color !== undefined && object.couleur === undefined) {
        result.couleur = object.color;
      }
      if (object.category !== undefined && object.categorie === undefined) {
        result.categorie = object.category;
      }
      
      // Traitement récursif pour les propriétés de type objet, en déterminant le type si possible
      for (const key in result) {
        if (typeof result[key] === 'object' && result[key] !== null) {
          let propType: 'entrainement' | 'phase' | 'exercice' | undefined = undefined;
          
          // Déterminer le type en fonction de la propriété
          if (key === 'phases') propType = 'phase';
          else if (key === 'exercices') propType = 'exercice';
          
          result[key] = this.prepareForApi(result[key], propType);
        }
      }
      
      return result;
    }
    
    return object;
  }
}
