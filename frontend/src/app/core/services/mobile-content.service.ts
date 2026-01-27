import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ContentConfig,
  ContentSection,
  ContentParams,
  Filter,
  ContentItem,
  ContentTypeId
} from '../models/mobile-content.model';

/**
 * Service pour la vue mobile "Exploration & Accès Rapide"
 * Gère les appels API pour la configuration et le contenu dynamique
 */
@Injectable({
  providedIn: 'root'
})
export class MobileContentService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la configuration globale de la vue mobile
   * Types de contenu disponibles, catégories, permissions
   */
  getContentConfig(): Observable<ContentConfig> {
    return this.http.get<ContentConfig>(`${this.apiUrl}/mobile/content-config`);
  }

  /**
   * Récupère les filtres disponibles pour un type de contenu et une catégorie
   */
  getFilters(contentType: ContentTypeId, category?: string): Observable<Filter[]> {
    let params = new HttpParams().set('contentType', contentType);
    
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<Filter[]>(`${this.apiUrl}/mobile/filters`, { params });
  }

  /**
   * Récupère les sections de contenu dynamiques
   * Sections type "Récents", "Plus utilisés", "Par catégorie"
   */
  getContentSections(contentParams: ContentParams): Observable<ContentSection[]> {
    let params = new HttpParams().set('contentType', contentParams.contentType);

    if (contentParams.category) {
      params = params.set('category', contentParams.category);
    }

    if (contentParams.searchTerm) {
      params = params.set('search', contentParams.searchTerm);
    }

    if (contentParams.filters) {
      params = params.set('filters', JSON.stringify(contentParams.filters));
    }

    return this.http.get<ContentSection[]>(`${this.apiUrl}/mobile/content-sections`, { params });
  }

  /**
   * Recherche contextuelle dans un type de contenu
   */
  searchContent(contentType: ContentTypeId, searchTerm: string): Observable<ContentItem[]> {
    const params = new HttpParams()
      .set('contentType', contentType)
      .set('q', searchTerm);

    return this.http.get<ContentItem[]>(`${this.apiUrl}/mobile/search`, { params });
  }

  /**
   * Toggle favori sur un item
   */
  toggleFavorite(itemId: string, contentType: ContentTypeId): Observable<{ isFavorite: boolean }> {
    return this.http.post<{ isFavorite: boolean }>(
      `${this.apiUrl}/mobile/favorites/toggle`,
      { itemId, contentType }
    );
  }
}
