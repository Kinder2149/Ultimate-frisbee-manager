/**
 * Modèles et interfaces pour le système de cache multi-niveaux
 */

export interface CacheOptions {
  /** Time to live en millisecondes */
  ttl?: number;
  /** Forcer le rafraîchissement depuis l'API */
  forceRefresh?: boolean;
  /** Ne pas utiliser le cache (bypass complet) */
  skipCache?: boolean;
  /** Retourner les données du cache et rafraîchir en arrière-plan */
  staleWhileRevalidate?: boolean;
}

export interface CachedData<T> {
  /** Identifiant unique de l'entrée */
  id: string;
  /** ID du workspace (null pour données globales comme auth) */
  workspaceId: string | null;
  /** Données réelles */
  data: T;
  /** Timestamp de création du cache */
  timestamp: number;
  /** Timestamp d'expiration */
  expiresAt: number;
  /** Version optionnelle pour détection de changements */
  version?: string;
}

export interface CacheMetadata {
  /** Clé du cache */
  key: string;
  /** Nom du store IndexedDB */
  store: string;
  /** ID du workspace */
  workspaceId: string | null;
  /** Timestamp de création */
  timestamp: number;
  /** Timestamp d'expiration */
  expiresAt: number;
  /** Taille estimée en octets */
  size?: number;
}

export interface SyncVersion {
  /** Timestamp dernière modification exercices */
  exercices: string | null;
  /** Timestamp dernière modification entrainements */
  entrainements: string | null;
  /** Timestamp dernière modification tags */
  tags: string | null;
  /** Timestamp dernière modification échauffements */
  echauffements: string | null;
  /** Timestamp dernière modification situations */
  situations: string | null;
  /** Timestamp du serveur */
  timestamp: string;
}

export interface SyncMessage {
  /** Type d'entité modifiée */
  type: 'exercice' | 'entrainement' | 'tag' | 'echauffement' | 'situation' | 'auth' | 'workspace';
  /** Action effectuée */
  action: 'create' | 'update' | 'delete' | 'refresh';
  /** ID de l'entité */
  id: string;
  /** ID du workspace concerné */
  workspaceId: string;
  /** Timestamp de la modification */
  timestamp: number;
}

export interface StoreConfig {
  /** Nom du store */
  name: string;
  /** Clé primaire */
  keyPath: string;
  /** Index à créer */
  indexes: StoreIndex[];
}

export interface StoreIndex {
  /** Nom de l'index */
  name: string;
  /** Chemin de la clé */
  keyPath: string | string[];
  /** Index unique */
  unique: boolean;
}

export interface CacheStats {
  /** Nombre de hits (données trouvées en cache) */
  hits: number;
  /** Nombre de miss (données non trouvées) */
  misses: number;
  /** Taux de hit en pourcentage */
  hitRate: number;
  /** Nombre total d'entrées en cache */
  totalEntries: number;
  /** Taille totale estimée en octets */
  totalSize: number;
}

export interface WorkspaceChangeState {
  /** Position du scroll */
  scrollPosition?: number;
  /** Filtres actifs */
  filters?: any;
  /** Onglet actif */
  activeTab?: string;
  /** Route actuelle */
  currentRoute?: string;
  /** Données additionnelles */
  additionalData?: Record<string, any>;
}
