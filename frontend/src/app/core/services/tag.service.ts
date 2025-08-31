import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tag } from '../models/tag.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';
import { HttpGenericService } from '../../shared/services/http-generic.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  // Service CRUD générique pour les tags
  private crudService: EntityCrudService<Tag>;
  private endpoint = 'tags';
  
  constructor(
    private httpService: HttpGenericService,
    private cacheService: CacheService
  ) {
    // Configuration du service CRUD générique avec les options appropriées
    this.crudService = new EntityCrudService<Tag>(httpService, cacheService)
      .configure(this.endpoint, {
        cachePrefix: 'tag',
        cacheTTL: 300, // 5 minutes
        useCache: true
      });
  }

  /**
   * Invalide les caches de liste pour toutes les vues (liste complète et par catégories)
   * Evite les divergences entre formulaire et gestionnaire après création/édition/suppression
   */
  private invalidateAllTagCaches(): void {
    const prefixes = [
      'tag.all',
      'tag.objectif',
      'tag.travail_specifique',
      'tag.niveau',
      'tag.temps',
      'tag.format',
      'tag.theme_entrainement'
    ];
    for (const p of prefixes) {
      try {
        (this.crudService as any).invalidateListCache({ cachePrefix: p });
      } catch {}
    }
    // Invalider également d'éventuels caches de recherche récents
    // (stratégie simple: clear total si besoin)
    // this.cacheService.clear(); // à activer si nécessaire
  }

  /**
   * Récupère tous les tags disponibles
   * @param category Filtre optionnel par catégorie
   * @returns Liste des tags
   */
  getTags(category?: string): Observable<Tag[]> {
    if (category) {
      // Utiliser un cachePrefix spécifique par catégorie pour éviter les collisions avec la liste complète
      return this.crudService.getAll({
        httpOptions: { params: { category } },
        cachePrefix: `tag.${category}`
      });
    }
    // Liste complète
    return this.crudService.getAll({ cachePrefix: 'tag.all' });
  }

  /**
   * Récupère un tag par son ID
   * @param id ID du tag à récupérer
   * @returns Le tag demandé
   */
  getTagById(id: string): Observable<Tag> {
    return this.crudService.getById(id);
  }

  /**
   * Ajoute un nouveau tag
   * @param tag Le tag à ajouter
   * @returns Le tag créé avec son ID
   */
  ajouterTag(tag: Tag): Observable<Tag> {
    // Clone le tag pour ne pas modifier l'original
    const tagToSend = {...tag};
    
    // Conversion explicite du level en nombre si présent, null sinon
    if (tagToSend.level !== undefined) {
      // TypeScript ne comprend pas que le niveau peut être null
      // On utilise une assertion de type pour éviter l'erreur
      tagToSend.level = tagToSend.level !== null ? Number(tagToSend.level) : null as unknown as number;
    }
    
    return this.crudService.create(tagToSend).pipe(
      map(created => {
        this.invalidateAllTagCaches();
        return created;
      })
    );
  }

  /**
   * Met à jour un tag existant
   * @param id ID du tag à mettre à jour
   * @param tag Les nouvelles données du tag
   * @returns Le tag mis à jour
   */
  updateTag(id: string, tag: Partial<Tag>): Observable<Tag> {
    // Conversion explicite du level en nombre si présent
    if (tag.level !== undefined) {
      const tagToUpdate = {...tag};
      tagToUpdate.level = tagToUpdate.level !== null ? Number(tagToUpdate.level) : null as unknown as number;
      // Cast pour résoudre les problèmes de typage avec les champs optionnels
      return this.crudService.update(id, tagToUpdate as unknown as Tag).pipe(
        map(updated => {
          this.invalidateAllTagCaches();
          return updated;
        })
      );
    }
    
    // Cast pour résoudre les problèmes de typage avec les champs optionnels
    return this.crudService.update(id, tag as unknown as Tag).pipe(
      map(updated => {
        this.invalidateAllTagCaches();
        return updated;
      })
    );
  }

  /**
   * Supprime un tag
   * @param id ID du tag à supprimer
   * @param force Si true, envoie force=true pour détacher les relations côté backend avant suppression
   * @returns void
   */
  deleteTag(id: string, force: boolean = false): Observable<void> {
    const httpOptions = force ? { params: { force: 'true' } } : undefined;
    return this.crudService.delete(id, { httpOptions }).pipe(
      map(res => {
        this.invalidateAllTagCaches();
        return res;
      })
    );
  }
  
  /**
   * Invalide manuellement le cache pour les tags
   * Utile après des opérations en masse ou des modifications externes
   */
  invalidateCache(): void {
    // Utilisation de la méthode protégée en passant par une conversion de type
    (this.crudService as any).invalidateListCache({ cachePrefix: 'tag' });
  }
  
  /**
   * Recherche des tags par libellé
   * @param query Texte à rechercher
   * @param category Catégorie optionnelle pour filtrer les résultats
   * @returns Liste des tags correspondants
   */
  searchTags(query: string, category?: string): Observable<Tag[]> {
    // Utiliser les paramètres HTTP pour la recherche
    const params: Record<string, string> = { query };
    if (category) {
      params['category'] = category;
    }

    // Pour la recherche, soit on désactive le cache, soit on isole la clé par requête
    const safeQueryKey = encodeURIComponent(query).slice(0, 50); // limite la longueur de la clé
    const cachePrefix = category ? `tag.search.${category}.${safeQueryKey}` : `tag.search.${safeQueryKey}`;

    return this.crudService.getAll({
      httpOptions: { params },
      cachePrefix,
      cacheTTL: 60 // 1 min pour limiter la staleness en recherche
    });
  }
}