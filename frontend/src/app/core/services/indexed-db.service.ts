import { Injectable } from '@angular/core';
import { CachedData, StoreConfig, StoreIndex } from '../models/cache.model';

/**
 * Service de gestion du cache IndexedDB
 * Fournit un stockage persistant par workspace pour toutes les données de l'application
 */
@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'ufm-cache';
  private readonly DB_VERSION = 1;
  private isAvailable = true;
  
  // Configuration des stores
  private readonly STORES: StoreConfig[] = [
    {
      name: 'auth',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false }
      ]
    },
    {
      name: 'workspaces',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false }
      ]
    },
    {
      name: 'exercices',
      keyPath: 'id',
      indexes: [
        { name: 'workspaceId', keyPath: 'workspaceId', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'workspaceTimestamp', keyPath: ['workspaceId', 'timestamp'], unique: false }
      ]
    },
    {
      name: 'entrainements',
      keyPath: 'id',
      indexes: [
        { name: 'workspaceId', keyPath: 'workspaceId', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'workspaceTimestamp', keyPath: ['workspaceId', 'timestamp'], unique: false }
      ]
    },
    {
      name: 'tags',
      keyPath: 'id',
      indexes: [
        { name: 'workspaceId', keyPath: 'workspaceId', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'workspaceTimestamp', keyPath: ['workspaceId', 'timestamp'], unique: false }
      ]
    },
    {
      name: 'echauffements',
      keyPath: 'id',
      indexes: [
        { name: 'workspaceId', keyPath: 'workspaceId', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'workspaceTimestamp', keyPath: ['workspaceId', 'timestamp'], unique: false }
      ]
    },
    {
      name: 'situations',
      keyPath: 'id',
      indexes: [
        { name: 'workspaceId', keyPath: 'workspaceId', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'workspaceTimestamp', keyPath: ['workspaceId', 'timestamp'], unique: false }
      ]
    }
  ];

  constructor() {}

  /**
   * Initialise la base de données IndexedDB
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('[IndexedDB] IndexedDB not available, using memory-only cache');
      this.isAvailable = false;
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
        
        request.onerror = () => {
          console.error('[IndexedDB] Error opening database:', request.error);
          this.isAvailable = false;
          resolve(); // Ne pas bloquer l'app
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          console.log('[IndexedDB] Database opened successfully');
          resolve();
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          console.log('[IndexedDB] Upgrading database schema');
          
          // Créer tous les stores
          this.STORES.forEach(storeConfig => {
            if (!db.objectStoreNames.contains(storeConfig.name)) {
              const store = db.createObjectStore(storeConfig.name, { 
                keyPath: storeConfig.keyPath 
              });
              
              // Créer les index
              storeConfig.indexes.forEach(index => {
                store.createIndex(index.name, index.keyPath, { 
                  unique: index.unique 
                });
              });
              
              console.log(`[IndexedDB] Created store: ${storeConfig.name}`);
            }
          });
        };
      } catch (error) {
        console.error('[IndexedDB] Failed to initialize:', error);
        this.isAvailable = false;
        resolve(); // Ne pas bloquer l'app
      }
    });
  }

  async getEntry<T>(
    store: string,
    key: string,
    workspaceId: string | null = null
  ): Promise<CachedData<T> | null> {
    if (!this.isDbAvailable()) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.get(key);

        request.onsuccess = () => {
          const result = request.result as CachedData<T> | undefined;

          if (!result) {
            resolve(null);
            return;
          }

          if (workspaceId !== null && result.workspaceId !== workspaceId) {
            console.log(`[IndexedDB] Workspace mismatch for ${key}`);
            resolve(null);
            return;
          }

          if (this.isExpired(result.expiresAt)) {
            console.log(`[IndexedDB] Expired cache for ${key}`);
            this.delete(store, key, workspaceId);
            resolve(null);
            return;
          }

          console.log(`[IndexedDB] Retrieved ${key} entry from ${store}`);
          resolve(result);
        };

        request.onerror = () => {
          console.error(`[IndexedDB] Error retrieving ${key}:`, request.error);
          resolve(null);
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        resolve(null);
      }
    });
  }

  /**
   * Vérifie si IndexedDB est disponible
   */
  isDbAvailable(): boolean {
    return this.isAvailable && this.db !== null;
  }

  /**
   * Sauvegarde des données dans le cache
   */
  async set<T>(
    store: string, 
    key: string, 
    data: T, 
    workspaceId: string | null = null,
    ttl: number = 24 * 60 * 60 * 1000 // 24h par défaut
  ): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }

    const now = Date.now();
    const cached: CachedData<T> = {
      id: key,
      workspaceId,
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.put(cached);
        
        request.onsuccess = () => {
          console.log(`[IndexedDB] Saved ${key} in ${store}`);
          resolve();
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error saving ${key}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        reject(error);
      }
    });
  }

  /**
   * Récupère des données du cache
   */
  async get<T>(
    store: string, 
    key: string, 
    workspaceId: string | null = null
  ): Promise<T | null> {
    if (!this.isDbAvailable()) {
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.get(key);
        
        request.onsuccess = () => {
          const result = request.result as CachedData<T> | undefined;
          
          if (!result) {
            resolve(null);
            return;
          }

          // Vérifier le workspace si spécifié
          if (workspaceId !== null && result.workspaceId !== workspaceId) {
            console.log(`[IndexedDB] Workspace mismatch for ${key}`);
            resolve(null);
            return;
          }

          // Vérifier l'expiration
          if (this.isExpired(result.expiresAt)) {
            console.log(`[IndexedDB] Expired cache for ${key}`);
            // Supprimer l'entrée expirée
            this.delete(store, key, workspaceId);
            resolve(null);
            return;
          }

          console.log(`[IndexedDB] Retrieved ${key} from ${store}`);
          resolve(result.data);
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error retrieving ${key}:`, request.error);
          resolve(null); // Ne pas bloquer en cas d'erreur
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        resolve(null);
      }
    });
  }

  /**
   * Récupère toutes les données d'un workspace
   */
  async getAll<T>(store: string, workspaceId: string): Promise<T[]> {
    if (!this.isDbAvailable()) {
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        const index = objectStore.index('workspaceId');
        const request = index.getAll(workspaceId);
        
        request.onsuccess = () => {
          const results = request.result as CachedData<T>[];
          const now = Date.now();
          
          // Filtrer les entrées expirées
          const validResults = results
            .filter(r => !this.isExpired(r.expiresAt))
            .map(r => r.data);
          
          console.log(`[IndexedDB] Retrieved ${validResults.length} items from ${store} for workspace ${workspaceId}`);
          resolve(validResults);
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error retrieving all from ${store}:`, request.error);
          resolve([]);
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        resolve([]);
      }
    });
  }

  /**
   * Supprime une entrée du cache
   */
  async delete(
    store: string, 
    key: string, 
    workspaceId: string | null = null
  ): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.delete(key);
        
        request.onsuccess = () => {
          console.log(`[IndexedDB] Deleted ${key} from ${store}`);
          resolve();
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error deleting ${key}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        reject(error);
      }
    });
  }

  /**
   * Nettoie toutes les données d'un workspace
   */
  async clearWorkspace(workspaceId: string): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }

    console.log(`[IndexedDB] Clearing workspace: ${workspaceId}`);
    
    // Ne pas nettoyer les stores auth et workspaces
    const storesToClear = this.STORES
      .filter(s => s.name !== 'auth' && s.name !== 'workspaces')
      .map(s => s.name);

    const promises = storesToClear.map(storeName => 
      this.clearStoreByWorkspace(storeName, workspaceId)
    );

    await Promise.all(promises);
    console.log(`[IndexedDB] Workspace ${workspaceId} cleared`);
  }

  /**
   * Nettoie un store spécifique pour un workspace
   */
  private async clearStoreByWorkspace(store: string, workspaceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const index = objectStore.index('workspaceId');
        const request = index.openCursor(IDBKeyRange.only(workspaceId));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error clearing ${store}:`, request.error);
          resolve(); // Ne pas bloquer
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        resolve();
      }
    });
  }

  /**
   * Nettoie tout le cache
   */
  async clearAll(): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }

    console.log('[IndexedDB] Clearing all data');
    
    const promises = this.STORES.map(storeConfig => 
      this.clearStore(storeConfig.name)
    );

    await Promise.all(promises);
    console.log('[IndexedDB] All data cleared');
  }

  /**
   * Nettoie un store complet
   */
  private async clearStore(store: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.clear();
        
        request.onsuccess = () => {
          console.log(`[IndexedDB] Cleared store: ${store}`);
          resolve();
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error clearing ${store}:`, request.error);
          resolve(); // Ne pas bloquer
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        resolve();
      }
    });
  }

  /**
   * Nettoie les entrées expirées
   */
  async cleanExpired(): Promise<void> {
    if (!this.isDbAvailable()) {
      return;
    }

    console.log('[IndexedDB] Cleaning expired entries');
    const now = Date.now();

    const promises = this.STORES.map(storeConfig => 
      this.cleanExpiredInStore(storeConfig.name, now)
    );

    await Promise.all(promises);
    console.log('[IndexedDB] Expired entries cleaned');
  }

  /**
   * Nettoie les entrées expirées d'un store
   */
  private async cleanExpiredInStore(store: string, now: number): Promise<void> {
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const value = cursor.value as CachedData<any>;
            if (this.isExpired(value.expiresAt)) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error cleaning ${store}:`, request.error);
          resolve();
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        resolve();
      }
    });
  }

  /**
   * Vérifie si une entrée est expirée
   */
  private isExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt;
  }

  /**
   * Obtient des statistiques sur le cache
   */
  async getStats(): Promise<{ totalEntries: number; storeStats: Record<string, number> }> {
    if (!this.isDbAvailable()) {
      return { totalEntries: 0, storeStats: {} };
    }

    const storeStats: Record<string, number> = {};
    let totalEntries = 0;

    for (const storeConfig of this.STORES) {
      const count = await this.getStoreCount(storeConfig.name);
      storeStats[storeConfig.name] = count;
      totalEntries += count;
    }

    return { totalEntries, storeStats };
  }

  /**
   * Compte les entrées dans un store
   */
  private async getStoreCount(store: string): Promise<number> {
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        const request = objectStore.count();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error(`[IndexedDB] Error counting ${store}:`, request.error);
          resolve(0);
        };
      } catch (error) {
        console.error('[IndexedDB] Transaction error:', error);
        resolve(0);
      }
    });
  }
}
