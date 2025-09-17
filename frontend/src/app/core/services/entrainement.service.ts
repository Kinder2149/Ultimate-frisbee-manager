import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Entrainement, EntrainementExercice } from '../models/entrainement.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

/**
 * Service unifié pour les entraînements simplifiés
 * Gère uniquement : titre, date optionnelle, thème global
 */
@Injectable({
  providedIn: 'root'
})
export class EntrainementService {
  // Service CRUD générique pour les entraînements
  private crudService: EntityCrudService<Entrainement>;
  
  constructor(
    private httpService: HttpGenericService,
    private cacheService: CacheService
  ) {
    // Créer une instance dédiée pour éviter les conflits avec ExerciceService
    this.crudService = new EntityCrudService<Entrainement>(this.httpService, this.cacheService);
    this.crudService.configure('entrainements', {
      // Options de transformation pour normaliser les données avant envoi à l'API
      transformBeforeSend: (entrainement: Entrainement): Entrainement => {
        // Clone pour ne pas modifier l'objet original
        const preparedEntrainement: Entrainement = { ...entrainement };
        
        // Gestion des champs textuels
        preparedEntrainement.titre = preparedEntrainement.titre || '';
        
        // Conversion des dates
        if (preparedEntrainement.date && typeof preparedEntrainement.date === 'string') {
          preparedEntrainement.date = new Date(preparedEntrainement.date);
        }
        
        // Préparation des exercices pour l'API - Format attendu par le backend
        if (preparedEntrainement.exercices && preparedEntrainement.exercices.length > 0) {
          preparedEntrainement.exercices = preparedEntrainement.exercices.map((exercice, index) => ({
            exerciceId: exercice.exerciceId || exercice.exercice?.id || '',
            ordre: exercice.ordre || index + 1,
            duree: exercice.duree || undefined,
            notes: exercice.notes || undefined,
            entrainementId: exercice.entrainementId || ''
          })) as any;
        }
        
        console.log('Entraînement préparé pour envoi API:', {
          titre: preparedEntrainement.titre,
          date: preparedEntrainement.date,
          exercices: preparedEntrainement.exercices?.length || 0,
          echauffementId: preparedEntrainement.echauffementId,
          situationMatchId: preparedEntrainement.situationMatchId,
          tags: preparedEntrainement.tags?.length || 0
        });
        
        return preparedEntrainement;
      },
      useCache: true,
      cacheTTL: 300, // 5 minutes
      fileUploadField: 'schemaUrl' // Spécifier le nom du champ pour l'upload
    });
  }

  /**
   * Récupère tous les entraînements disponibles
   * @returns Liste des entraînements
   */
  getEntrainements(): Observable<Entrainement[]> {
    return this.crudService.getAll();
  }
  
  /**
   * Récupère un entraînement spécifique par son ID
   * @param id Identifiant de l'entraînement à récupérer
   * @returns L'entraînement avec les détails complets
   */
  getEntrainementById(id: string): Observable<Entrainement> {
    return this.crudService.getById(id);
  }

  /**
   * Ajoute un nouvel entraînement
   * @param entrainement L'entraînement à ajouter
   * @returns L'entraînement créé avec son ID
   */
  ajouterEntrainement(entrainement: Entrainement): Observable<Entrainement> {
    console.log('Service - ajouterEntrainement:', entrainement);
    return this.crudService.create(entrainement).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Met à jour un entraînement existant
   * @param id Identifiant de l'entraînement à modifier
   * @param entrainement Données mises à jour de l'entraînement
   * @returns L'entraînement modifié
   */
  updateEntrainement(id: string, entrainement: Entrainement): Observable<Entrainement> {
    console.log(`Service - updateEntrainement: id=${id}`, entrainement);
    return this.crudService.update(id, entrainement).pipe(
      tap(() => this.invalidateCache())
    );
  }
  
  /**
   * Supprime un entraînement existant
   * @param id Identifiant de l'entraînement à supprimer
   * @returns Void
   */
  deleteEntrainement(id: string): Observable<void> {
    return this.crudService.delete(id).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Duplique un entraînement existant
   * @param id Identifiant de l'entraînement à dupliquer
   * @returns L'entraînement dupliqué avec un nouveau ID
   */
  duplicateEntrainement(id: string): Observable<Entrainement> {
    const endpoint = `entrainements/${id}/duplicate`;
    console.log('EntrainementService.duplicateEntrainement - Endpoint:', endpoint);
    return this.crudService.http.post<Entrainement>(endpoint, {}).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Invalide le cache pour forcer le rechargement des données
   */
  private invalidateCache(): void {
    // Force le rechargement en vidant le cache du service CRUD
    (this.crudService as any).cache = new Map();
  }
}
