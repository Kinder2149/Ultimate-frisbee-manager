import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tag } from '../models/tag.model';
import { SupabaseService } from './supabase.service';
import { from } from 'rxjs';
// import { EntityCrudService } from '../../shared/services/entity-crud.service';
// import { HttpGenericService } from '../../shared/services/http-generic.service';
// import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  // Service CRUD générique pour les tags
  constructor(private supabaseService: SupabaseService) {}

  // Les anciennes dépendances (httpService, cacheService) et l'ancien crudService
  // seront supprimées progressivement au fur et à mesure de la migration des autres méthodes.

  /**
   * Invalide les caches de liste pour toutes les vues (liste complète et par catégories)
   * Evite les divergences entre formulaire et gestionnaire après création/édition/suppression
   */
  private invalidateAllTagCaches(): void {
    // const prefixes = [
    //   'tag.all',
    //   'tag.objectif',
    //   'tag.travail_specifique',
    //   'tag.niveau',
    //   'tag.temps',
    //   'tag.format',
    //   'tag.theme_entrainement'
    // ];
    // for (const p of prefixes) {
    //   try {
    //     (this.crudService as any).invalidateListCache({ cachePrefix: p });
    //   } catch {}
    // }
    // // Invalider également d'éventuels caches de recherche récents
    // // (stratégie simple: clear total si besoin)
    // // this.cacheService.clear(); // à activer si nécessaire
  }

  /**
   * Récupère tous les tags disponibles
   * @param category Filtre optionnel par catégorie
   * @returns Liste des tags
   */
  getTags(category?: string): Observable<Tag[]> {
    const functionCall = this.supabaseService.supabase.functions.invoke('get-tags', {
      body: { category }
    });

    return from(functionCall).pipe(
      map((response: { data: Tag[] | null, error: any }) => {
        if (response.error) {
          console.error('Erreur lors de l\'appel de la fonction get-tags:', response.error);
          throw response.error;
        }
        return response.data as Tag[];
      })
    );
  }

  /**
   * Récupère un tag par son ID
   * @param id ID du tag à récupérer
   * @returns Le tag demandé
   */
  // getTagById(id: string): Observable<Tag> {
  //   return this.crudService.getById(id);
  // }

  /**
   * Ajoute un nouveau tag
   * @param tag Le tag à ajouter
   * @returns Le tag créé avec son ID
   */
  // ajouterTag(tag: Tag): Observable<Tag> {
  //   // ... migration à faire
  // }

  /**
   * Met à jour un tag existant
   * @param id ID du tag à mettre à jour
   * @param tag Les nouvelles données du tag
   * @returns Le tag mis à jour
   */
  // updateTag(id: string, tag: Partial<Tag>): Observable<Tag> {
  //   // ... migration à faire
  // }

  /**
   * Supprime un tag
   * @param id ID du tag à supprimer
   * @param force Si true, envoie force=true pour détacher les relations côté backend avant suppression
   * @returns void
   */
  // deleteTag(id: string, force: boolean = false): Observable<void> {
  //   // ... migration à faire
  // }
  
  /**
   * Invalide manuellement le cache pour les tags
   * Utile après des opérations en masse ou des modifications externes
   */
  // invalidateCache(): void {
  //   // ... migration à faire
  // }
  
  /**
   * Recherche des tags par libellé
   * @param query Texte à rechercher
   * @param category Catégorie optionnelle pour filtrer les résultats
   * @returns Liste des tags correspondants
   */
  // searchTags(query: string, category?: string): Observable<Tag[]> {
  //   // ... migration à faire
  // }
}