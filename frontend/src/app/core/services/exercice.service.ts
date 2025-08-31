import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Exercice } from '../models/exercice.model'; // Chemin mis à jour vers /core/models/
import { Tag } from '../models/tag.model'; // Import nécessaire pour les types 
import { ApiUrlService } from './api-url.service';
import { EntityCrudService } from '../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

// Interface pour l'objet de données envoyé à l'API
interface ExercicePayload extends Omit<Exercice, 'tags'> {
  tags?: Tag[];
  tagsOriginal?: Tag[]; // Tags sous forme d'objets complets (pour l'UI)
  tagIds?: string[]; // IDs de tags (pour l'API)
}

// Type pour l'objet pendant le traitement - clone de l'exercice original
interface PreparedExercice extends Exercice {
  tagsOriginal?: Tag[];
  tagIds?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExerciceService {
  // Service CRUD générique pour les exercices
  private crudService: EntityCrudService<Exercice>;
  
  // Référence à l'exercice en cours d'édition (pour préserver les valeurs entre les cycles de vie du formulaire)
  public currentExercice: Exercice | null = null;
  
  /**
   * Stocke l'exercice en cours d'édition pour référence ultérieure
   * @param exercice L'exercice à stocker
   */
  setCurrentExercice(exercice: Exercice | null): void {
    console.log('ExerciceService - stockage exercice courant:', exercice);
    this.currentExercice = exercice ? {...exercice} : null; // Clone pour éviter les références
  }
  
  /**
   * Récupère les variables depuis l'exercice courant en mémoire
   * @param type Le type de variables à récupérer ('plus' ou 'minus')
   * @returns Un tableau de chaînes de caractères représentant les variables
   */
  private getVariablesFromCurrentExercice(type: 'plus' | 'minus'): string[] {
    // Si pas d'exercice courant, renvoyer un tableau vide
    if (!this.currentExercice) {
      console.log(`ExerciceService - pas d'exercice courant pour récupérer variables${type === 'plus' ? 'Plus' : 'Minus'}`);
      return [];
    }
    
    // Déterminer quel champ utiliser en fonction du type
    const field = type === 'plus' ? 'variablesPlus' : 'variablesMinus';
    const variables = this.currentExercice[field];
    
    console.log(`ExerciceService - récupération ${field} depuis exercice courant:`, variables);
    
    // Traitement selon le type de données
    if (Array.isArray(variables)) {
      // Si c'est déjà un tableau, on le filtre et le normalise
      return variables
        .filter((v: any) => v !== null && v !== undefined)
        .map((v: any) => String(v))
        .filter((v: string) => v.trim() !== '');
    } 
    else if (typeof variables === 'string') {
      // Si c'est une chaîne, on la découpe en tableau
      return variables
        .split('\n')
        .map((v: string) => v.trim())
        .filter((v: string) => v !== '');
    }
    
    // Dans les autres cas, on renvoie un tableau vide
    return [];
  }
  
  constructor(
    private apiUrlService: ApiUrlService,
    private httpService: HttpGenericService,
    private cacheService: CacheService
  ) {
    // Créer une instance dédiée pour éviter les conflits avec EntrainementService
    this.crudService = new EntityCrudService<Exercice>(this.httpService, this.cacheService);
    this.crudService.configure('exercices', {
      // Options de transformation pour normaliser les données avant envoi à l'API
      transformBeforeSend: (exercice: Exercice): ExercicePayload => {
        // Clone pour ne pas modifier l'objet original
        const preparedExercice: PreparedExercice = { ...exercice };
        
        // Gestion des champs textuels
        preparedExercice.description = preparedExercice.description || '';
        
        // Gestion des variables (nouveau format)
        // Traitement robuste des variablesPlus
        console.log('ExerciceService - Type de variablesPlus avant traitement:', 
          Array.isArray(preparedExercice.variablesPlus) ? 'array' : typeof preparedExercice.variablesPlus);
        
        // VARIABLESPLUS: Traitement complet avec préservation des valeurs
        if (Array.isArray(preparedExercice.variablesPlus)) {
          // Cas 1: C'est déjà un tableau - nettoyer et normaliser
          preparedExercice.variablesPlus = preparedExercice.variablesPlus
            .filter((v: any) => v !== null && v !== undefined)
            .map((v: any) => String(v))
            .filter((v: string) => v.trim() !== '');
          console.log('ExerciceService - variablesPlus normalisé depuis tableau:', preparedExercice.variablesPlus);
        } 
        else if (typeof preparedExercice.variablesPlus === 'object' && preparedExercice.variablesPlus !== null) {
          // Cas 2: C'est un objet (possiblement avec propriété variablesPlus)
          const variablesObj = preparedExercice.variablesPlus as any;
          
          if (Array.isArray(variablesObj.variablesPlus)) {
            // Sous-cas 2.1: L'objet contient un tableau dans sa propriété variablesPlus
            preparedExercice.variablesPlus = variablesObj.variablesPlus
              .filter((v: any) => v !== null && v !== undefined)
              .map((v: any) => String(v))
              .filter((v: string) => v.trim() !== '');
            console.log('ExerciceService - variablesPlus extrait depuis propriété de l\'objet:', preparedExercice.variablesPlus);
          } else {
            // Sous-cas 2.2: Structure inattendue, vérifier l'exercice courant comme fallback
            preparedExercice.variablesPlus = this.getVariablesFromCurrentExercice('plus');
            console.log('ExerciceService - variablesPlus récupéré depuis exercice courant:', preparedExercice.variablesPlus);
          }
        } 
        else if (typeof preparedExercice.variablesPlus === 'string') {
          // Cas 3: C'est une chaîne (ancien format ou entrée manuelle) - convertir en tableau
          preparedExercice.variablesPlus = preparedExercice.variablesPlus
            .split('\n')
            .map((v: string) => v.trim())
            .filter((v: string) => v !== '');
          console.log('ExerciceService - variablesPlus converti depuis chaîne:', preparedExercice.variablesPlus);
        } 
        else {
          // Cas 4: Autre type ou non défini - tenter récupération depuis exercice courant, sinon tableau vide
          preparedExercice.variablesPlus = this.getVariablesFromCurrentExercice('plus');
          console.log('ExerciceService - variablesPlus fallback:', preparedExercice.variablesPlus);
        }
        
        // VARIABLESMINUS: Traitement complet avec préservation des valeurs 
        console.log('ExerciceService - Type de variablesMinus avant traitement:', 
          Array.isArray(preparedExercice.variablesMinus) ? 'array' : typeof preparedExercice.variablesMinus);
          
        if (Array.isArray(preparedExercice.variablesMinus)) {
          // Cas 1: C'est déjà un tableau - nettoyer et normaliser
          preparedExercice.variablesMinus = preparedExercice.variablesMinus
            .filter((v: any) => v !== null && v !== undefined)
            .map((v: any) => String(v))
            .filter((v: string) => v.trim() !== '');
          console.log('ExerciceService - variablesMinus normalisé depuis tableau:', preparedExercice.variablesMinus);
        } 
        else if (typeof preparedExercice.variablesMinus === 'object' && preparedExercice.variablesMinus !== null) {
          // Cas 2: C'est un objet (possiblement avec propriété variablesMinus)
          const variablesObj = preparedExercice.variablesMinus as any;
          
          if (Array.isArray(variablesObj.variablesMinus)) {
            // Sous-cas 2.1: L'objet contient un tableau dans sa propriété variablesMinus
            preparedExercice.variablesMinus = variablesObj.variablesMinus
              .filter((v: any) => v !== null && v !== undefined)
              .map((v: any) => String(v))
              .filter((v: string) => v.trim() !== '');
            console.log('ExerciceService - variablesMinus extrait depuis propriété de l\'objet:', preparedExercice.variablesMinus);
          } else {
            // Sous-cas 2.2: Structure inattendue, vérifier l'exercice courant comme fallback
            preparedExercice.variablesMinus = this.getVariablesFromCurrentExercice('minus');
            console.log('ExerciceService - variablesMinus récupéré depuis exercice courant:', preparedExercice.variablesMinus);
          }
        } 
        else if (typeof preparedExercice.variablesMinus === 'string') {
          // Cas 3: C'est une chaîne (ancien format ou entrée manuelle) - convertir en tableau
          preparedExercice.variablesMinus = preparedExercice.variablesMinus
            .split('\n')
            .map((v: string) => v.trim())
            .filter((v: string) => v !== '');
          console.log('ExerciceService - variablesMinus converti depuis chaîne:', preparedExercice.variablesMinus);
        } 
        else {
          // Cas 4: Autre type ou non défini - tenter récupération depuis exercice courant, sinon tableau vide
          preparedExercice.variablesMinus = this.getVariablesFromCurrentExercice('minus');
          console.log('ExerciceService - variablesMinus fallback:', preparedExercice.variablesMinus);
        }
        
        // Support de rétrocompatibilité (ancien format)
        preparedExercice.variablesText = preparedExercice.variablesText || undefined;
        
        // CORRECTIF: Préparation des tags pour l'API
        if (preparedExercice.tags && Array.isArray(preparedExercice.tags)) {
          // Si les tags sont des objets complets, extraire uniquement les IDs
          if (preparedExercice.tags.length > 0 && typeof preparedExercice.tags[0] === 'object') {
            // Conservation des objets tags originaux si nécessaire pour l'UI
            preparedExercice.tagsOriginal = [...preparedExercice.tags];
            
            // Extraction des IDs uniquement pour l'API
            preparedExercice.tagIds = preparedExercice.tags
              .map(tag => tag && tag.id ? tag.id : null)
              .filter(id => id !== null) as string[];
              
            // On supprime le tableau d'objets complets pour éviter confusion
            delete preparedExercice.tags;
          }
        }
        
        console.log('Exercice préparé pour envoi API:', {
          nom: preparedExercice.nom,
          description: preparedExercice.description ? preparedExercice.description.length : 0,
          variablesPlus: preparedExercice.variablesPlus ? 'présent' : 'absent',
          variablesMinus: preparedExercice.variablesMinus ? 'présent' : 'absent',
          tagsTransformés: preparedExercice.tagIds ? 'oui' : 'non',
          nombreTagsIds: preparedExercice.tagIds?.length
        });
        
        return preparedExercice;
      },
      useCache: true,
      cacheTTL: 300 // 5 minutes
    });
  }

  /**
   * Récupère tous les exercices disponibles
   * @returns Liste des exercices
   */
  getExercices(): Observable<Exercice[]> {
    return this.crudService.getAll();
  }
  
  /**
   * Récupère un exercice spécifique par son ID
   * @param id Identifiant de l'exercice à récupérer
   * @returns L'exercice avec les détails complets et ses tags associés
   */
  getExerciceById(id: string): Observable<Exercice> {
    // Utiliser le pipe pour stocker l'exercice récupéré comme exercice courant
    return this.crudService.getById(id).pipe(
      tap((exercice: Exercice) => {
        console.log('Exercice récupéré et stocké comme currentExercice:', exercice);
        this.currentExercice = exercice;
      })
    );
  }

  /**
   * Ajoute un nouvel exercice
   * @param exercice L'exercice à ajouter
   * @returns L'exercice créé avec son ID
   */
  ajouterExercice(exercice: Exercice): Observable<Exercice> {
    console.log('Service - ajouterExercice:', exercice);
    return this.crudService.create(exercice);
    // La transformation complète des données (description, variablesPlus, variablesMinus, tags)
    // est gérée par la fonction transformBeforeSend dans la configuration du CRUD
  }

  /**
   * Met à jour un exercice existant
   * @param id Identifiant de l'exercice à modifier
   * @param exercice Données mises à jour de l'exercice
   * @returns L'exercice modifié avec ses relations
   */
  updateExercice(id: string, exercice: Exercice): Observable<Exercice> {
    console.log(`Service - updateExercice: id=${id}`, exercice);
    return this.crudService.update(id, exercice);
    // La transformation complète des données (description, variablesPlus, variablesMinus, tags)
    // est gérée par la fonction transformBeforeSend dans la configuration du CRUD
  }
  
  /**
   * Duplique un exercice existant
   * @param id Identifiant de l'exercice à dupliquer
   * @returns L'exercice dupliqué avec un nouveau ID
   */
  duplicateExercice(id: string): Observable<Exercice> {
    // Utiliser l'accès public au service HTTP via la propriété 'http'
    const endpoint = `exercices/${id}/duplicate`;
    console.log('ExerciceService.duplicateExercice - Endpoint:', endpoint);
    return this.crudService.http.post<Exercice>(endpoint, {}).pipe(
      tap((duplicatedExercice: Exercice) => {
        console.log('Exercice dupliqué avec succès:', duplicatedExercice);
        // Invalider le cache pour forcer le rechargement de la liste
        this.crudService.invalidateCache();
      })
    );
  }

  /**
   * Supprime un exercice existant
   * @param id Identifiant de l'exercice à supprimer
   * @returns Void
   */
  deleteExercice(id: string): Observable<void> {
    return this.crudService.delete(id);
  }

  /**
   * Upload d'une image d'exercice. Retourne l'URL publique renvoyée par l'API.
   * @param file Fichier image sélectionné
   */
  uploadImage(file: File): Observable<{ imageUrl: string; filename: string; size: number; mimeType: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const endpoint = 'exercices/upload-image';
    // Important: ne pas fixer Content-Type pour laisser le navigateur définir le boundary multipart
    return this.crudService.http.post<{ imageUrl: string; filename: string; size: number; mimeType: string }>(endpoint, formData);
  }
}