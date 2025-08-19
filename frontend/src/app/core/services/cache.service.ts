import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Configuration pour une entrée de cache
 */
export interface CacheConfig {
  /** Durée de vie en secondes (0 = pas d'expiration) */
  ttl?: number;
  /** Clé unique pour identifier l'entrée */
  key: string;
}

/**
 * Entrée de cache avec métadonnées
 */
interface CacheEntry<T> {
  /** Données stockées */
  data: T;
  /** Date d'expiration (null si pas d'expiration) */
  expiry: number | null;
  /** Date de création */
  created: number;
  /** Nombre d'accès */
  hits: number;
}

/**
 * Statistiques du cache par préfixe
 */
export interface PrefixStats {
  /** Préfixe concerné */
  prefix: string;
  /** Nombre d'entrées pour ce préfixe */
  count: number;
  /** Nombre de hits pour ce préfixe */
  hits: number;
  /** Nombre de misses pour ce préfixe */
  misses: number;
  /** Taux de succès (hits / (hits+misses)) */
  hitRatio: number;
  /** Taille moyenne des données en octets */
  averageSize: number;
  /** Temps moyen d'accès en millisecondes */
  averageAccessTime: number;
}

/**
 * Statistiques du cache
 */
export interface CacheStats {
  /** Nombre total d'entrées dans le cache */
  size: number;
  /** Taille maximale du cache */
  maxSize: number;
  /** Nombre total de hits */
  hits: number;
  /** Nombre total de misses */
  misses: number;
  /** Taux d'utilisation du cache (hits / (hits+misses)) */
  usageRatio: number;
  /** Taux de remplissage du cache */
  fillRatio: number;
  /** Nombre d'entrées expirées nettoyées lors du dernier cycle */
  lastCleanupCount: number;
  /** Nombre total d'évictions */
  evictions: number;
  /** Temps moyen d'accès en millisecondes */
  averageAccessTime: number;
  /** Statistiques par préfixe */
  prefixStats: PrefixStats[];
  /** Dernière mise à jour des statistiques */
  lastUpdated: Date;
}

/**
 * Service de cache intelligent pour optimiser les performances
 * Permet de mettre en cache les données fréquemment utilisées
 * et d'éviter des requêtes API inutiles
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  /** Cache interne stockant les données */
  private cache = new Map<string, CacheEntry<any>>();
  
  /** Configuration par défaut */
  private defaultTTL = 300; // 5 minutes
  
  /** Taille maximale du cache (en nombre d'entrées) */
  private maxSize = 100;
  
  /** Statistiques du cache */
  private stats = {
    hits: 0,
    misses: 0,
    lastCleanupCount: 0,
    evictions: 0,
    accessTimes: [] as number[], // Temps d'accès en ms
    prefixStats: new Map<string, {
      hits: number,
      misses: number,
      sizes: number[], // Tailles en octets
      accessTimes: number[] // Temps d'accès en ms
    }>()
  };
  
  /** Subject pour les statistiques du cache */
  private statsSubject = new BehaviorSubject<CacheStats>(this.getStats());

  constructor() {
    // Lancer le nettoyage périodique du cache expiré
    setInterval(() => {
      const cleanedCount = this.cleanExpiredEntries();
      this.stats.lastCleanupCount = cleanedCount;
      this.updateStats();
    }, 60000); // Toutes les minutes
  }
  
  /**
   * Obtenir un observable des statistiques du cache
   * @returns Observable des statistiques du cache
   */
  getStatsObservable(): Observable<CacheStats> {
    return this.statsSubject.asObservable();
  }
  
  /**
   * Obtenir les statistiques actuelles du cache
   * @returns Statistiques du cache
   */
  getStats(): CacheStats {
    // Calculer les statistiques par préfixe
    const prefixStats: PrefixStats[] = [];
    const prefixes = Array.from(this.stats.prefixStats.keys());
    
    // Parcourir tous les préfixes enregistrés
    for (const prefix of prefixes) {
      const stats = this.stats.prefixStats.get(prefix)!;
      const entries = Array.from(this.cache.entries())
        .filter(([key]) => key.startsWith(prefix));
      
      const count = entries.length;
      const totalAccesses = stats.hits + stats.misses;
      const hitRatio = totalAccesses > 0 ? stats.hits / totalAccesses : 0;
      
      // Calculer la taille moyenne des données
      const averageSize = stats.sizes.length > 0 ? 
        stats.sizes.reduce((sum, size) => sum + size, 0) / stats.sizes.length : 0;
      
      // Calculer le temps moyen d'accès
      const averageAccessTime = stats.accessTimes.length > 0 ?
        stats.accessTimes.reduce((sum, time) => sum + time, 0) / stats.accessTimes.length : 0;
      
      prefixStats.push({
        prefix,
        count,
        hits: stats.hits,
        misses: stats.misses,
        hitRatio,
        averageSize,
        averageAccessTime
      });
    }
    
    // Calculer le temps moyen d'accès global
    const averageAccessTime = this.stats.accessTimes.length > 0 ?
      this.stats.accessTimes.reduce((sum, time) => sum + time, 0) / this.stats.accessTimes.length : 0;
    
    // Limiter la taille des tableaux de mesure pour éviter une consommation excessive de mémoire
    if (this.stats.accessTimes.length > 1000) {
      this.stats.accessTimes = this.stats.accessTimes.slice(-1000);
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      usageRatio: this.getTotalRequests() > 0 ? 
        this.stats.hits / this.getTotalRequests() : 0,
      fillRatio: this.maxSize > 0 ? 
        this.cache.size / this.maxSize : 0,
      lastCleanupCount: this.stats.lastCleanupCount,
      evictions: this.stats.evictions,
      averageAccessTime,
      prefixStats,
      lastUpdated: new Date()
    };
  }
  
  /**
   * Obtenir le nombre total de requêtes (hits + misses)
   * @private
   * @returns Nombre total de requêtes
   */
  private getTotalRequests(): number {
    return this.stats.hits + this.stats.misses;
  }
  
  /**
   * Mettre à jour les statistiques et notifier les abonnements
   * @private
   */
  private updateStats(): void {
    this.statsSubject.next(this.getStats());
  }

  /**
   * Stocke une valeur dans le cache
   * @param config Configuration du cache (clé et durée de vie)
   * @param data Les données à mettre en cache
   */
  set<T>(config: CacheConfig, data: T): void {
    // Vérifier si le cache est plein
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsedEntries();
    }

    const ttl = config.ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      expiry: ttl > 0 ? Date.now() + (ttl * 1000) : null,
      created: Date.now(),
      hits: 0
    };

    this.cache.set(config.key, entry);
    console.debug(`[Cache] Mise en cache: ${config.key}`, { ttlSeconds: ttl });
  }

  /**
   * Récupère une valeur du cache
   * @param key Clé de l'entrée à récupérer
   * @returns Les données si présentes et non expirées, null sinon
   */
  get<T>(key: string): T | null {
    const startTime = performance.now();
    const prefix = this.extractPrefix(key);
    
    // Initialiser les statistiques pour ce préfixe si nécessaire
    if (prefix && !this.stats.prefixStats.has(prefix)) {
      this.stats.prefixStats.set(prefix, {
        hits: 0,
        misses: 0,
        sizes: [],
        accessTimes: []
      });
    }
    
    const entry = this.cache.get(key) as CacheEntry<T>;
    
    // Si l'entrée n'existe pas
    if (!entry) {
      this.stats.misses++;
      // Enregistrer le miss pour ce préfixe
      if (prefix) {
        const prefixStats = this.stats.prefixStats.get(prefix)!;
        prefixStats.misses++;
      }
      
      const accessTime = performance.now() - startTime;
      this.stats.accessTimes.push(accessTime);
      if (prefix) {
        this.stats.prefixStats.get(prefix)!.accessTimes.push(accessTime);
      }
      
      this.updateStats();
      return null;
    }

    // Si l'entrée est expirée
    if (entry.expiry !== null && entry.expiry < Date.now()) {
      console.debug(`[Cache] Entrée expirée: ${key}`);
      this.cache.delete(key);
      this.stats.misses++;
      
      // Enregistrer le miss pour ce préfixe
      if (prefix) {
        const prefixStats = this.stats.prefixStats.get(prefix)!;
        prefixStats.misses++;
      }
      
      const accessTime = performance.now() - startTime;
      this.stats.accessTimes.push(accessTime);
      if (prefix) {
        this.stats.prefixStats.get(prefix)!.accessTimes.push(accessTime);
      }
      
      this.updateStats();
      return null;
    }

    // Incrémenter le compteur d'utilisation
    entry.hits++;
    this.stats.hits++;
    
    // Enregistrer le hit et la taille pour ce préfixe
    if (prefix) {
      const prefixStats = this.stats.prefixStats.get(prefix)!;
      prefixStats.hits++;
      
      // Estimer la taille des données
      try {
        const dataSize = this.estimateSize(entry.data);
        prefixStats.sizes.push(dataSize);
      } catch (e) {
        // Ignorer les erreurs de calcul de taille
      }
    }
    
    const accessTime = performance.now() - startTime;
    this.stats.accessTimes.push(accessTime);
    if (prefix) {
      this.stats.prefixStats.get(prefix)!.accessTimes.push(accessTime);
    }
    
    this.updateStats();
    return entry.data;
  }

  /**
   * Vérifie si une clé existe dans le cache et n'est pas expirée
   * @param key Clé à vérifier
   * @returns Vrai si la clé existe et n'est pas expirée
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    
    // Vérifier l'expiration
    if (entry.expiry !== null && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Supprime une entrée du cache
   * @param key Clé de l'entrée à supprimer
   */
  remove(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.updateStats();
    }
  }

  /**
   * Vide entièrement le cache
   */
  clear(): void {
    this.cache.clear();
    this.updateStats();
  }
  
  /**
   * Supprime toutes les entrées commençant par un préfixe
   * Utile pour invalider toutes les entrées d'une catégorie
   * @param keyPrefix Préfixe des clés à supprimer
   * @returns Nombre d'entrées supprimées
   */
  clearByPrefix(keyPrefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.updateStats();
    }
    
    return count;
  }

  /**
   * Nettoie les entrées expirées du cache
   * @returns Nombre d'entrées supprimées
   */
  private cleanExpiredEntries(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry !== null && entry.expiry < now) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      console.debug(`[Cache] Nettoyage: ${count} entrées expirées supprimées`);
    }
    
    return count;
  }
  
  /**
   * Extrait le préfixe d'une clé de cache (partie avant le premier point)
   * @param key Clé de cache
   * @returns Préfixe ou null si pas de préfixe
   */
  private extractPrefix(key: string): string | null {
    const dotIndex = key.indexOf('.');
    if (dotIndex > 0) {
      return key.substring(0, dotIndex);
    }
    return null;
  }
  
  /**
   * Estime approximativement la taille d'un objet en octets
   * @param data Données à mesurer
   * @returns Taille approximative en octets
   */
  private estimateSize(data: any): number {
    if (data === null || data === undefined) return 0;
    
    const json = JSON.stringify(data);
    // Une approximation simple: chaque caractère = 2 octets en UTF-16
    return json.length * 2;
  }
  
  /**
   * Récupère les préfixes les plus utilisés dans le cache
   * @param limit Nombre maximum de préfixes à retourner
   * @returns Les préfixes les plus utilisés avec leur nombre d'accès
   */
  getTopPrefixes(limit: number = 5): {prefix: string, hits: number}[] {
    const prefixes = Array.from(this.stats.prefixStats.entries());
    
    // Trier par nombre de hits (décroissant)
    prefixes.sort((a, b) => b[1].hits - a[1].hits);
    
    // Retourner les N premiers
    return prefixes.slice(0, limit).map(([prefix, stats]) => ({
      prefix,
      hits: stats.hits
    }));
  }
  
  /**
   * Déclenche l'éviction manuelle des entrées peu utilisées
   * @returns Nombre d'entrées supprimées
   */
  public triggerEviction(): number {
    if (this.cache.size === 0) return 0;
    return this.evictLeastUsedEntries();
  }

  /**
   * Supprime les entrées les moins utilisées quand le cache est plein
   * @returns Nombre d'entrées supprimées
   */
  private evictLeastUsedEntries(): number {
    // Convertir la Map en tableau pour le tri
    const entries = Array.from(this.cache.entries());
    
    // Trier par nombre d'accès (du moins utilisé au plus utilisé)
    entries.sort((a, b) => a[1].hits - b[1].hits);
    
    // Supprimer 20% des entrées les moins utilisées
    const toRemove = Math.ceil(this.cache.size * 0.2);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    if (toRemove > 0) {
      this.stats.evictions += toRemove;
      this.updateStats();
      console.debug(`[Cache] Éviction: ${toRemove} entrées les moins utilisées supprimées`);
    }
    
    return toRemove;
  }
}
