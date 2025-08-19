import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SituationMatch, CreateSituationMatchRequest, UpdateSituationMatchRequest } from '../models/situationmatch.model';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

/**
 * Service pour la gestion des situations et matchs
 * Gère : type (Match/Situation), description, tags, temps
 */
@Injectable({
  providedIn: 'root'
})
export class SituationMatchService {
  private readonly baseUrl = 'situations-matchs';
  private cache = new Map<string, any>();
  
  constructor(
    private httpService: HttpGenericService,
    private cacheService: CacheService
  ) {}

  /**
   * Récupère toutes les situations/matchs disponibles
   * @returns Liste des situations/matchs
   */
  getSituationsMatchs(): Observable<SituationMatch[]> {
    return this.httpService.get<SituationMatch[]>(this.baseUrl);
  }
  
  /**
   * Récupère une situation/match spécifique par son ID
   * @param id Identifiant de la situation/match à récupérer
   * @returns La situation/match avec les détails complets
   */
  getSituationMatchById(id: string): Observable<SituationMatch> {
    return this.httpService.get<SituationMatch>(`${this.baseUrl}/${id}`);
  }

  /**
   * Ajoute une nouvelle situation/match
   * @param situationMatch La situation/match à ajouter
   * @returns La situation/match créée avec son ID
   */
  ajouterSituationMatch(situationMatch: CreateSituationMatchRequest): Observable<SituationMatch> {
    console.log('Service - ajouterSituationMatch:', situationMatch);
    const preparedData = this.transformBeforeSend(situationMatch);
    return this.httpService.post<SituationMatch>(this.baseUrl, preparedData).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Met à jour une situation/match existante
   * @param id Identifiant de la situation/match à modifier
   * @param situationMatch Données mises à jour de la situation/match
   * @returns La situation/match modifiée
   */
  updateSituationMatch(id: string, situationMatch: UpdateSituationMatchRequest): Observable<SituationMatch> {
    console.log(`Service - updateSituationMatch: id=${id}`, situationMatch);
    const preparedData = this.transformBeforeSend(situationMatch);
    return this.httpService.put<SituationMatch>(`${this.baseUrl}/${id}`, preparedData).pipe(
      tap(() => this.invalidateCache())
    );
  }
  
  /**
   * Supprime une situation/match existante
   * @param id Identifiant de la situation/match à supprimer
   * @returns Void
   */
  deleteSituationMatch(id: string): Observable<void> {
    return this.httpService.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Duplique une situation/match existante
   * @param id Identifiant de la situation/match à dupliquer
   * @returns La situation/match dupliquée avec un nouveau ID
   */
  duplicateSituationMatch(id: string): Observable<SituationMatch> {
    const endpoint = `${this.baseUrl}/${id}/duplicate`;
    console.log('SituationMatchService.duplicateSituationMatch - Endpoint:', endpoint);
    return this.httpService.post<SituationMatch>(endpoint, {}).pipe(
      tap(() => this.invalidateCache())
    );
  }

  /**
   * Transforme les données avant envoi à l'API
   */
  private transformBeforeSend(data: CreateSituationMatchRequest | UpdateSituationMatchRequest): any {
    const prepared = { ...data };
    
    console.log('Situation/Match préparée pour envoi API:', {
      type: prepared.type,
      description: prepared.description || 'Sans description',
      temps: prepared.temps || 'Non défini',
      tagsCount: prepared.tagIds?.length || 0
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
