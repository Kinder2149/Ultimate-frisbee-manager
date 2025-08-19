import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Echauffement, CreateEchauffementRequest, UpdateEchauffementRequest } from '../models/echauffement.model';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

/**
 * Service pour la gestion des échauffements
 * Gère : nom, description, blocs avec leurs propriétés
 */
@Injectable({
  providedIn: 'root'
})
export class EchauffementService {
  private readonly baseUrl = 'echauffements';
  private cache = new Map<string, any>();
  
  constructor(
    private httpService: HttpGenericService,
    private cacheService: CacheService
  ) {}

  /**
   * Récupère tous les échauffements disponibles
   * @returns Liste des échauffements
   */
  getEchauffements(): Observable<Echauffement[]> {
    return this.httpService.get<Echauffement[]>(this.baseUrl);
  }
  
  /**
   * Récupère un échauffement spécifique par son ID
   * @param id Identifiant de l'échauffement à récupérer
   * @returns L'échauffement avec les détails complets
   */
  getEchauffementById(id: string): Observable<Echauffement> {
    return this.httpService.get<Echauffement>(`${this.baseUrl}/${id}`);
  }

  /**
   * Ajoute un nouvel échauffement
   * @param echauffement L'échauffement à ajouter
   * @returns L'échauffement créé avec son ID
   */
  ajouterEchauffement(echauffement: CreateEchauffementRequest): Observable<Echauffement> {
    console.log('Service - ajouterEchauffement:', echauffement);
    const preparedData = this.transformBeforeSend(echauffement);
    return this.httpService.post<Echauffement>(this.baseUrl, preparedData).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Met à jour un échauffement existant
   * @param id Identifiant de l'échauffement à modifier
   * @param echauffement Données mises à jour de l'échauffement
   * @returns L'échauffement modifié
   */
  updateEchauffement(id: string, echauffement: UpdateEchauffementRequest): Observable<Echauffement> {
    console.log(`Service - updateEchauffement: id=${id}`, echauffement);
    const preparedData = this.transformBeforeSend(echauffement);
    return this.httpService.put<Echauffement>(`${this.baseUrl}/${id}`, preparedData).pipe(
      tap(() => this.invalidateCache())
    );
  }
  
  /**
   * Supprime un échauffement existant
   * @param id Identifiant de l'échauffement à supprimer
   * @returns Void
   */
  deleteEchauffement(id: string): Observable<void> {
    return this.httpService.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Duplique un échauffement existant
   * @param id Identifiant de l'échauffement à dupliquer
   * @returns L'échauffement dupliqué avec un nouveau ID
   */
  duplicateEchauffement(id: string): Observable<Echauffement> {
    const endpoint = `${this.baseUrl}/${id}/duplicate`;
    console.log('EchauffementService.duplicateEchauffement - Endpoint:', endpoint);
    return this.httpService.post<Echauffement>(endpoint, {}).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Transforme les données avant envoi à l'API
   */
  private transformBeforeSend(data: CreateEchauffementRequest | UpdateEchauffementRequest): any {
    const prepared = { ...data };
    
    // Préparation des blocs pour l'API
    if (prepared.blocs && prepared.blocs.length > 0) {
      prepared.blocs = prepared.blocs.map((bloc, index) => ({
        ordre: bloc.ordre || index + 1,
        titre: bloc.titre || '',
        repetitions: bloc.repetitions || undefined,
        temps: bloc.temps || undefined,
        informations: bloc.informations || undefined,
        fonctionnement: bloc.fonctionnement || undefined,
        notes: bloc.notes || undefined
      }));
    }
    
    console.log('Échauffement préparé pour envoi API:', {
      nom: prepared.nom,
      description: prepared.description,
      blocs: prepared.blocs?.length || 0
    });
    
    return prepared;
  }

  /**
   * Invalide le cache pour forcer le rechargement des données
   */
  private invalidateCache(): void {
    this.cache.clear();
  }
}
