import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityCrudService, Entity } from '../../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../../shared/services/http-generic.service';
import { CacheService } from '../../../core/services/cache.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { Exercice } from '../../../core/models/exercice.model';

/**
 * Service optimisé pour gérer les exercices
 * Utilise le service CRUD générique pour réduire la duplication de code
 * et améliorer la maintenabilité
 */
@Injectable({
  providedIn: 'root'
})
export class ExerciceOptimizedService {
  /** Service CRUD typé pour les exercices */
  private exerciceCrud: EntityCrudService<Exercice>;
  
  /** Endpoint API pour les exercices */
  private readonly ENDPOINT = 'exercices';
  
  /** Préfixe pour les clés de cache */
  private readonly CACHE_PREFIX = 'exercice';
  
  constructor(
    private httpService: HttpGenericService,
    private cacheService: CacheService,
    private apiUrlService: ApiUrlService
  ) {
    // Instancier et configurer le service CRUD pour les exercices
    this.exerciceCrud = new EntityCrudService<Exercice>(httpService, cacheService);
    this.exerciceCrud.configure(this.ENDPOINT, {
      cachePrefix: this.CACHE_PREFIX,
      cacheTTL: 300, // 5 minutes
      fileUploadField: 'image', // Spécifier le nom du champ pour l'upload
      transformBeforeSend: this.prepareExerciceForSending,
      transformAfterReceive: this.processExerciceFromApi
    });
  }

  /**
   * Normalise l'exercice pour garantir que imageUrl est toujours renseigné
   * en se basant en priorité sur imageUrl, puis schemaUrls, puis schemaUrl.
   */
  private normalizeExercice(data: any): Exercice {
    const ex = data as Exercice;
    const anyEx: any = data;
    let imageUrl = ex.imageUrl;

    if (!imageUrl) {
      const raw = anyEx.schemaUrls;
      if (Array.isArray(raw) && raw.length) {
        imageUrl = raw[0];
      } else if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) {
            imageUrl = parsed[0];
          } else if (raw) {
            imageUrl = raw;
          }
        } catch {
          if (raw) {
            imageUrl = raw;
          }
        }
      } else if (anyEx.schemaUrl) {
        imageUrl = anyEx.schemaUrl as string;
      }
    }

    return { ...(ex as any), imageUrl } as Exercice;
  }
  
  /**
   * Récupère tous les exercices disponibles
   * @returns Liste des exercices
   */
  getExercices(): Observable<Exercice[]> {
    return this.exerciceCrud.getAll();
  }
  
  /**
   * Récupère un exercice spécifique par son ID
   * @param id Identifiant de l'exercice à récupérer
   * @returns L'exercice avec les détails complets et ses tags associés
   */
  getExerciceById(id: string): Observable<Exercice> {
    return this.exerciceCrud.getById(id);
  }
  
  /**
   * Ajoute un nouvel exercice
   * @param formData Les données du formulaire, y compris le fichier image si présent
   * @returns L'exercice créé avec son ID
   */
  ajouterExercice(formData: FormData): Observable<Exercice> {
    // Si ce n'est pas un FormData, on le convertit
    if (!(formData instanceof FormData)) {
      const data = formData as unknown as Partial<Exercice>;
      // Si une image est présente, on l'ajoute au FormData
      if (data.image) {
        const newFormData = new FormData();
        Object.keys(data).forEach(key => {
          const value = (data as any)[key];
          if (value !== null && value !== undefined) {
            newFormData.append(key, value instanceof File ? value : String(value));
          }
        });
        formData = newFormData;
      }
    }
    return this.exerciceCrud.create(formData);
  }
  
  /**
   * Met à jour un exercice existant
   * @param id Identifiant de l'exercice à modifier
   * @param formData Les données du formulaire, y compris le fichier image si présent
   * @returns L'exercice modifié avec ses relations
   */
  updateExercice(id: string, formData: FormData | Partial<Exercice>): Observable<Exercice> {
    // Si ce n'est pas un FormData, on le convertit
    if (!(formData instanceof FormData)) {
      const data = formData as Partial<Exercice>;
      // Si une image est présente, on crée un FormData
      if (data.image) {
        const newFormData = new FormData();
        Object.keys(data).forEach(key => {
          const value = (data as any)[key];
          if (value !== null && value !== undefined) {
            newFormData.append(key, value instanceof File ? value : String(value));
          }
        });
        formData = newFormData;
      }
    }
    return this.exerciceCrud.update(id, formData);
  }
  
  /**
   * Supprime un exercice existant
   * @param id Identifiant de l'exercice à supprimer
   * @returns Void
   */
  deleteExercice(id: string): Observable<void> {
    return this.exerciceCrud.delete(id);
  }
  
  /**
   * Prépare un exercice pour l'envoi à l'API
   * @param exercice Exercice à préparer
   * @returns Exercice préparé
   */
  private prepareExerciceForSending(exercice: Exercice): any {
    return {
      ...exercice,
      description: exercice.description || '',
      variablesText: exercice.variablesText || null
    };
  }
  
  /**
   * Traite un exercice reçu de l'API
   * @param data Données brutes de l'API
   * @returns Exercice traité
   */
  private processExerciceFromApi(data: any): Exercice {
    // Normaliser systématiquement l'exercice pour garantir imageUrl
    return this.normalizeExercice(data);
  }
}
