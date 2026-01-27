# 🚀 PLAN COMPLET - OPTIMISATION CACHE & FLUX DE DONNÉES

**Date**: 2026-01-27  
**Objectif**: Implémenter un système de cache multi-niveaux avec gestion par workspace pour une expérience utilisateur fluide et transparente  
**Durée estimée**: 8-12 heures de développement

---

## 📊 RÉSUMÉ DE LA STRATÉGIE

### Données à Cacher (par priorité)
1. **Authentification & Profil** (critique)
   - Token JWT
   - Profil utilisateur
   - Workspaces disponibles

2. **Données métier** (haute priorité)
   - Exercices (liste + détails)
   - Entrainements (liste + détails)
   - Tags (tous types)
   - Échauffements
   - Situations de match

3. **Données secondaires** (moyenne priorité)
   - Dashboard stats
   - Préférences utilisateur

### Architecture Cache Multi-Niveaux

```
┌─────────────────────────────────────────────────────────┐
│ NIVEAU 1: Mémoire (DataCacheService)                    │
│  - Cache chaud pour session active                      │
│  - TTL: 5min                                            │
│  - Invalidation immédiate sur modification              │
└─────────────────────────────────────────────────────────┘
                          ↓ (si miss)
┌─────────────────────────────────────────────────────────┐
│ NIVEAU 2: IndexedDB (persistant, par workspace)         │
│  - Stockage persistant navigateur                       │
│  - Survit au F5 et fermeture onglet                     │
│  - TTL: 24h (configurable)                              │
│  - Isolation stricte par workspaceId                    │
└─────────────────────────────────────────────────────────┘
                          ↓ (si miss ou expiré)
┌─────────────────────────────────────────────────────────┐
│ NIVEAU 3: API Backend (source de vérité)               │
│  - Données fraîches et à jour                           │
│  - Synchronisation bidirectionnelle                     │
│  - Timestamps pour détection changements                │
└─────────────────────────────────────────────────────────┘
```

### Flux Utilisateur Optimisé

#### 1. Connexion Initiale
```
Login → Token stocké (localStorage + IndexedDB)
     → Chargement workspaces (API → IndexedDB)
     → Sélection workspace automatique si 1 seul
     → Préchargement données critiques en arrière-plan:
        * Tags (petits, fréquents)
        * Liste exercices (métadonnées)
        * Profil utilisateur complet
```

#### 2. Changement de Workspace (MINI-RELOAD TRANSPARENT)
```
Utilisateur change workspace
     → Sauvegarde état UI (scroll, filtres) dans sessionStorage
     → Switch contexte workspace (localStorage)
     → Mini-reload transparent (location.reload() optimisé)
     → Chargement données depuis IndexedDB (instantané)
     → Restauration état UI
     → Synchronisation silencieuse API en arrière-plan
```

#### 3. Rafraîchissement F5
```
Page reload
     → Lecture workspace depuis localStorage
     → Validation workspace toujours accessible (API légère)
     → Chargement données depuis IndexedDB (affichage immédiat)
     → Synchronisation delta avec API (en arrière-plan)
     → Mise à jour UI si changements détectés
```

#### 4. Synchronisation Continue
```
Polling 30s → Vérification timestamps (/sync/versions)
           → Si changement détecté: fetch delta
           → Mise à jour IndexedDB + cache mémoire
           → Notification utilisateur (toast discret)

BroadcastChannel → Synchronisation entre onglets
                → Invalidation cache cross-tab
                → Cohérence multi-onglets
```

---

## 🔧 PLAN D'IMPLÉMENTATION DÉTAILLÉ

### PHASE 1: FONDATIONS (Services de Base)

#### PHASE 1.1: Service IndexedDB
**Fichier**: `frontend/src/app/core/services/indexed-db.service.ts` (nouveau)

**Fonctionnalités**:
- Initialisation base de données `ufm-cache` version 1
- Création des stores:
  - `auth` (token, profil utilisateur)
  - `workspaces` (liste workspaces)
  - `exercices` (par workspace)
  - `entrainements` (par workspace)
  - `tags` (par workspace)
  - `echauffements` (par workspace)
  - `situations` (par workspace)
- Index sur `workspaceId` et `timestamp`
- Méthodes CRUD avec isolation workspace
- Méthode de nettoyage par workspace

**Interfaces**:
```typescript
interface CachedData<T> {
  id: string;
  workspaceId: string | null; // null pour auth
  data: T;
  timestamp: number;
  expiresAt: number;
  version?: string;
}

interface StoreConfig {
  name: string;
  keyPath: string;
  indexes: { name: string; keyPath: string; unique: boolean }[];
}
```

**Méthodes principales**:
- `init(): Promise<void>`
- `set<T>(store: string, key: string, data: T, workspaceId?: string): Promise<void>`
- `get<T>(store: string, key: string, workspaceId?: string): Promise<T | null>`
- `getAll<T>(store: string, workspaceId: string): Promise<T[]>`
- `delete(store: string, key: string, workspaceId?: string): Promise<void>`
- `clearWorkspace(workspaceId: string): Promise<void>`
- `clearAll(): Promise<void>`
- `isExpired(timestamp: number, ttl: number): boolean`

**Gestion d'erreurs**:
- Fallback gracieux si IndexedDB non disponible
- Mode dégradé (mémoire uniquement)
- Logs détaillés pour debug

---

#### PHASE 1.2: Interfaces TypeScript
**Fichier**: `frontend/src/app/core/models/cache.model.ts` (nouveau)

```typescript
export interface CacheOptions {
  ttl?: number;              // Time to live en ms
  forceRefresh?: boolean;    // Forcer le fetch API
  skipCache?: boolean;       // Ne pas utiliser le cache
  staleWhileRevalidate?: boolean; // Retourner cache + refresh en arrière-plan
}

export interface CacheMetadata {
  key: string;
  store: string;
  workspaceId: string | null;
  timestamp: number;
  expiresAt: number;
  size?: number;
}

export interface SyncVersion {
  exercices: string | null;
  entrainements: string | null;
  tags: string | null;
  echauffements: string | null;
  situations: string | null;
}

export interface SyncMessage {
  type: 'exercice' | 'entrainement' | 'tag' | 'echauffement' | 'situation';
  action: 'create' | 'update' | 'delete';
  id: string;
  workspaceId: string;
  timestamp: number;
}
```

---

### PHASE 2: SERVICES DE CACHE ET SYNCHRONISATION

#### PHASE 2.1: Amélioration DataCacheService
**Fichier**: `frontend/src/app/core/services/data-cache.service.ts` (modifier)

**Nouvelles fonctionnalités**:
- Intégration IndexedDB comme niveau 2
- Stratégie stale-while-revalidate
- Gestion TTL configurable par type de données
- Métriques de performance (hit rate, miss rate)

**Flux de récupération**:
```typescript
get<T>(key, store, fetchFn, options) {
  1. Vérifier cache mémoire (niveau 1)
     → Si HIT et non expiré: retourner immédiatement
  
  2. Vérifier IndexedDB (niveau 2)
     → Si HIT et non expiré: 
        * Retourner données
        * Mettre en cache mémoire
        * Si staleWhileRevalidate: fetch API en arrière-plan
  
  3. Fetch API (niveau 3)
     → Sauvegarder dans IndexedDB
     → Sauvegarder en mémoire
     → Retourner données
}
```

**TTL par type de données**:
```typescript
private readonly TTL_CONFIG = {
  auth: 24 * 60 * 60 * 1000,      // 24h
  workspaces: 60 * 60 * 1000,     // 1h
  exercices: 30 * 60 * 1000,      // 30min
  entrainements: 30 * 60 * 1000,  // 30min
  tags: 60 * 60 * 1000,           // 1h
  echauffements: 30 * 60 * 1000,  // 30min
  situations: 30 * 60 * 1000      // 30min
};
```

---

#### PHASE 2.2: Service de Synchronisation
**Fichier**: `frontend/src/app/core/services/sync.service.ts` (nouveau)

**Fonctionnalités**:
- Polling périodique (30s) pour vérifier les mises à jour
- BroadcastChannel pour synchronisation multi-onglets
- Détection de changements via timestamps
- File d'attente pour modifications offline
- Gestion de la reconnexion

**Méthodes principales**:
```typescript
- startPeriodicSync(intervalMs = 30000): void
- stopPeriodicSync(): void
- checkForUpdates(): Promise<void>
- notifyChange(message: SyncMessage): void
- listenToOtherTabs(): void
- handleOnline(): void
- handleOffline(): void
```

**Logique de synchronisation**:
```typescript
checkForUpdates() {
  1. Fetch /sync/versions (timestamps)
  2. Comparer avec timestamps locaux (IndexedDB)
  3. Si différence détectée:
     → Fetch données modifiées uniquement
     → Mettre à jour IndexedDB
     → Invalider cache mémoire
     → Émettre événement pour rafraîchir UI
}
```

**BroadcastChannel**:
```typescript
// Onglet A: modification d'un exercice
syncService.notifyChange({
  type: 'exercice',
  action: 'update',
  id: 'ex-123',
  workspaceId: 'ws-1',
  timestamp: Date.now()
});

// Onglet B: réception du message
→ Invalider cache pour 'exercice-ex-123'
→ Rafraîchir UI si nécessaire
```

---

### PHASE 3: BACKEND - SUPPORT SYNCHRONISATION

#### PHASE 3.1: Endpoint de Synchronisation
**Fichier**: `backend/routes/sync.routes.js` (nouveau)

```javascript
const express = require('express');
const router = express.Router();
const { prisma } = require('../services/prisma');
const { authenticateToken } = require('../middleware/auth.middleware');
const { workspaceGuard } = require('../middleware/workspace.middleware');

/**
 * GET /api/sync/versions
 * Retourne les timestamps de dernière modification par type de données
 */
router.get('/versions', authenticateToken, workspaceGuard, async (req, res, next) => {
  try {
    const { workspaceId } = req;

    // Récupérer le timestamp le plus récent pour chaque type
    const [exercices, entrainements, tags, echauffements, situations] = await Promise.all([
      prisma.exercice.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.entrainement.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.tag.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.echauffement.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      }),
      prisma.situationMatch.findFirst({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      })
    ]);

    res.json({
      exercices: exercices?.updatedAt?.toISOString() || null,
      entrainements: entrainements?.updatedAt?.toISOString() || null,
      tags: tags?.updatedAt?.toISOString() || null,
      echauffements: echauffements?.updatedAt?.toISOString() || null,
      situations: situations?.updatedAt?.toISOString() || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

**Fichier**: `backend/app.js` (modifier)
```javascript
// Ajouter la route sync
const syncRoutes = require('./routes/sync.routes');
app.use('/api/sync', syncRoutes);
```

---

#### PHASE 3.2: Vérification Schéma Prisma
**Fichier**: `backend/prisma/schema.prisma` (vérifier/modifier)

S'assurer que tous les modèles ont `updatedAt`:
```prisma
model Exercice {
  id          String   @id @default(uuid())
  // ... autres champs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt  // ← Vérifier présence
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
}

model Entrainement {
  id          String   @id @default(uuid())
  // ... autres champs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt  // ← Vérifier présence
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
}

// Idem pour Tag, Echauffement, SituationMatch
```

Si manquant, ajouter et créer migration:
```bash
npx prisma migrate dev --name add_updated_at_fields
```

---

### PHASE 4: ADAPTATION SERVICES CORE

#### PHASE 4.1: AuthService avec Cache
**Fichier**: `frontend/src/app/core/services/auth.service.ts` (modifier)

**Modifications**:
```typescript
constructor(
  private http: HttpClient,
  private router: Router,
  private supabaseService: SupabaseService,
  private workspaceService: WorkspaceService,
  private indexedDb: IndexedDbService  // ← AJOUT
) {
  this.listenToAuthStateChanges();
  this.initFromLocalToken();
}

// Nouvelle méthode: sauvegarder profil dans IndexedDB
private async cacheUserProfile(user: User): Promise<void> {
  await this.indexedDb.set('auth', 'user-profile', user, null);
  console.log('[Auth] User profile cached');
}

// Nouvelle méthode: charger profil depuis cache
private async loadCachedProfile(): Promise<User | null> {
  const cached = await this.indexedDb.get<User>('auth', 'user-profile', null);
  if (cached) {
    console.log('[Auth] User profile loaded from cache');
    this.currentUserSubject.next(cached);
    return cached;
  }
  return null;
}

// Modifier syncUserProfile
private syncUserProfile(): Observable<User> {
  return this.http.get<{ user: User }>(`${this.apiUrl}/profile`).pipe(
    map(response => {
      this.currentUserSubject.next(response.user);
      this.isAuthenticatedSubject.next(true);
      
      // ← AJOUT: Cacher le profil
      this.cacheUserProfile(response.user);
      
      return response.user;
    }),
    catchError(error => {
      console.error('Erreur de synchronisation du profil:', error);
      return throwError(() => error);
    })
  );
}

// Modifier initFromLocalToken
private async initFromLocalToken(): Promise<void> {
  const localToken = localStorage.getItem(LOCAL_TOKEN_KEY);
  if (localToken) {
    console.log('[Auth] Token found in localStorage, restoring session');
    this.isAuthenticatedSubject.next(true);
    
    // ← AJOUT: Charger profil depuis cache d'abord
    const cachedProfile = await this.loadCachedProfile();
    
    // Synchroniser le profil en arrière-plan
    this.syncUserProfile().subscribe({
      next: (user) => {
        console.log('[Auth] Session restored successfully for:', user.email);
        this.ensureWorkspaceSelected();
      },
      error: (err) => {
        console.error('[Auth] Token invalid or expired:', err);
        this.clearLocalToken();
        this.isAuthenticatedSubject.next(false);
        this.workspaceService.clear();
      }
    });
  }
}

// Modifier logout pour nettoyer IndexedDB
logout(): Observable<void> {
  this.clearLocalToken();
  this.workspaceService.clear();
  
  // ← AJOUT: Nettoyer IndexedDB
  this.indexedDb.clearAll();
  
  return from(this.supabaseService.supabase.auth.signOut({ scope: 'local' })).pipe(
    map(({ error }) => {
      if (error) {
        console.error('Erreur lors de la déconnexion Supabase:', error);
      }
      this.clearStateAndRedirect();
      return;
    })
  );
}
```

---

#### PHASE 4.2: WorkspaceService avec Mini-Reload
**Fichier**: `frontend/src/app/core/services/workspace.service.ts` (modifier)

**Modifications**:
```typescript
export interface WorkspaceChangeState {
  scrollPosition?: number;
  filters?: any;
  activeTab?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private currentWorkspaceSubject = new BehaviorSubject<WorkspaceSummary | null>(null);
  currentWorkspace$ = this.currentWorkspaceSubject.asObservable();
  
  // ← AJOUT: Événement de changement
  private workspaceChanging$ = new Subject<{ 
    from: WorkspaceSummary | null; 
    to: WorkspaceSummary 
  }>();
  workspaceChange$ = this.workspaceChanging$.asObservable();

  private readonly STORAGE_KEY = 'ufm.currentWorkspace';
  private readonly STATE_KEY = 'ufm.workspaceChangeState';  // ← AJOUT

  constructor(private indexedDb: IndexedDbService) {  // ← AJOUT
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(this.STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed: WorkspaceSummary = JSON.parse(stored);
        if (parsed && parsed.id) {
          this.currentWorkspaceSubject.next(parsed);
        }
      } catch {
        // ignore parsing errors
      }
    }
  }

  // ← NOUVELLE MÉTHODE: Sauvegarder état UI avant changement
  saveChangeState(state: WorkspaceChangeState): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(this.STATE_KEY, JSON.stringify(state));
  }

  // ← NOUVELLE MÉTHODE: Restaurer état UI après changement
  restoreChangeState(): WorkspaceChangeState | null {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem(this.STATE_KEY);
    if (stored) {
      sessionStorage.removeItem(this.STATE_KEY);
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  // ← MODIFIER: Changement avec mini-reload transparent
  async setCurrentWorkspace(workspace: WorkspaceSummary | null, skipReload = false): Promise<void> {
    const previous = this.currentWorkspaceSubject.value;
    
    if (previous?.id !== workspace?.id && workspace) {
      // Émettre l'événement de changement
      this.workspaceChanging$.next({ from: previous, to: workspace });
      
      // Sauvegarder le nouveau workspace
      this.currentWorkspaceSubject.next(workspace);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspace));
      }
      
      // ← AJOUT: Nettoyer le cache du workspace précédent
      if (previous?.id) {
        await this.indexedDb.clearWorkspace(previous.id);
      }
      
      // Mini-reload transparent (sauf si skipReload)
      if (!skipReload && typeof window !== 'undefined') {
        console.log('[Workspace] Performing mini-reload for workspace change');
        window.location.reload();
      }
    } else {
      // Même workspace ou null, pas de reload
      this.currentWorkspaceSubject.next(workspace);
      if (typeof window !== 'undefined') {
        if (workspace) {
          window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspace));
        } else {
          window.localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    }
  }

  clear(): void {
    this.setCurrentWorkspace(null, true);
  }
}
```

---

### PHASE 5: ADAPTATION SERVICES DE DONNÉES

#### PHASE 5.1: ExerciceService
**Fichier**: `frontend/src/app/core/services/exercice.service.ts` (modifier)

```typescript
@Injectable({ providedIn: 'root' })
export class ExerciceService {
  private readonly apiUrl = `${environment.apiUrl}/exercises`;
  private exercicesUpdated = new Subject<void>();
  exercicesUpdated$ = this.exercicesUpdated.asObservable();

  constructor(
    private http: HttpClient,
    private cache: DataCacheService,      // ← AJOUT
    private sync: SyncService             // ← AJOUT
  ) {}

  private normalizeExercice(ex: Exercice): Exercice {
    const anyEx: any = ex as any;
    const legacy = anyEx.image || anyEx.picture;
    const imageUrl = (anyEx.imageUrl && anyEx.imageUrl !== '') ? anyEx.imageUrl : (legacy || null);
    return { ...ex, imageUrl };
  }

  // ← MODIFIER: Utiliser le cache multi-niveaux
  getExercices(options: CacheOptions = {}): Observable<Exercice[]> {
    return this.cache.get<Exercice[]>(
      'exercices-list',
      'exercices',
      () => this.http.get<Exercice[]>(this.apiUrl).pipe(
        map(list => list.map(ex => this.normalizeExercice(ex)))
      ),
      {
        ttl: 30 * 60 * 1000,  // 30 minutes
        ...options
      }
    );
  }

  // ← MODIFIER: Utiliser le cache pour détails
  getExerciceById(id: string, options: CacheOptions = {}): Observable<Exercice> {
    return this.cache.get<Exercice>(
      `exercice-${id}`,
      'exercices',
      () => this.http.get<Exercice>(`${this.apiUrl}/${id}`).pipe(
        map(ex => this.normalizeExercice(ex))
      ),
      {
        ttl: 30 * 60 * 1000,
        ...options
      }
    );
  }

  // ← MODIFIER: Invalider cache + notifier
  createExercice(data: FormData | Partial<Exercice>): Observable<Exercice> {
    return this.http.post<Exercice>(this.apiUrl, data).pipe(
      tap((exercice) => {
        // Invalider le cache
        this.cache.invalidate('exercices-list');
        
        // Notifier les autres onglets
        this.sync.notifyChange({
          type: 'exercice',
          action: 'create',
          id: exercice.id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        
        // Émettre l'événement
        this.exercicesUpdated.next();
      })
    );
  }

  // ← MODIFIER: Invalider cache + notifier
  updateExercice(id: string, data: FormData | Partial<Exercice>): Observable<Exercice> {
    return this.http.put<Exercice>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        this.cache.invalidate('exercices-list');
        this.cache.invalidate(`exercice-${id}`);
        
        this.sync.notifyChange({
          type: 'exercice',
          action: 'update',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        
        this.exercicesUpdated.next();
      })
    );
  }

  // ← MODIFIER: Invalider cache + notifier
  deleteExercice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.cache.invalidate('exercices-list');
        this.cache.invalidate(`exercice-${id}`);
        
        this.sync.notifyChange({
          type: 'exercice',
          action: 'delete',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        
        this.exercicesUpdated.next();
      })
    );
  }

  duplicateExercice(id: string): Observable<Exercice> {
    return this.http.post<Exercice>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      tap((exercice) => {
        this.cache.invalidate('exercices-list');
        
        this.sync.notifyChange({
          type: 'exercice',
          action: 'create',
          id: exercice.id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
        
        this.exercicesUpdated.next();
      })
    );
  }
}
```

---

#### PHASE 5.2: EntrainementService
**Fichier**: `frontend/src/app/core/services/entrainement.service.ts` (modifier)

**Modifications identiques à ExerciceService**:
- Injecter `DataCacheService` et `SyncService`
- Wrapper toutes les méthodes GET avec `cache.get()`
- Invalider cache dans CREATE/UPDATE/DELETE
- Notifier changements via `sync.notifyChange()`

```typescript
@Injectable({ providedIn: 'root' })
export class EntrainementService {
  private readonly apiUrl = `${environment.apiUrl}/trainings`;

  constructor(
    private http: HttpClient,
    private cache: DataCacheService,
    private sync: SyncService
  ) {}

  getEntrainements(options: CacheOptions = {}): Observable<Entrainement[]> {
    return this.cache.get<Entrainement[]>(
      'entrainements-list',
      'entrainements',
      () => this.http.get<Entrainement[]>(this.apiUrl),
      { ttl: 30 * 60 * 1000, ...options }
    );
  }

  getEntrainementById(id: string, options: CacheOptions = {}): Observable<Entrainement> {
    return this.cache.get<Entrainement>(
      `entrainement-${id}`,
      'entrainements',
      () => this.http.get<Entrainement>(`${this.apiUrl}/${id}`),
      { ttl: 30 * 60 * 1000, ...options }
    );
  }

  createEntrainement(data: FormData | Partial<Entrainement>): Observable<Entrainement> {
    return this.http.post<Entrainement>(this.apiUrl, data).pipe(
      tap((entrainement) => {
        this.cache.invalidate('entrainements-list');
        this.sync.notifyChange({
          type: 'entrainement',
          action: 'create',
          id: entrainement.id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
      })
    );
  }

  updateEntrainement(id: string, data: FormData | Partial<Entrainement>): Observable<Entrainement> {
    return this.http.put<Entrainement>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        this.cache.invalidate('entrainements-list');
        this.cache.invalidate(`entrainement-${id}`);
        this.sync.notifyChange({
          type: 'entrainement',
          action: 'update',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
      })
    );
  }

  deleteEntrainement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.cache.invalidate('entrainements-list');
        this.cache.invalidate(`entrainement-${id}`);
        this.sync.notifyChange({
          type: 'entrainement',
          action: 'delete',
          id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
      })
    );
  }

  duplicateEntrainement(id: string): Observable<Entrainement> {
    return this.http.post<Entrainement>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      tap((entrainement) => {
        this.cache.invalidate('entrainements-list');
        this.sync.notifyChange({
          type: 'entrainement',
          action: 'create',
          id: entrainement.id,
          workspaceId: this.cache.getCurrentWorkspaceId() || '',
          timestamp: Date.now()
        });
      })
    );
  }
}
```

---

#### PHASE 5.3: TagService
**Fichier**: `frontend/src/app/core/services/tag.service.ts` (modifier)

**Particularité**: Les tags sont très fréquemment utilisés, donc TTL plus long (1h)

```typescript
@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly apiUrl = `${environment.apiUrl}/tags`;

  constructor(
    private http: HttpClient,
    private cache: DataCacheService,
    private sync: SyncService
  ) {}

  getTags(options: CacheOptions = {}): Observable<Tag[]> {
    return this.cache.get<Tag[]>(
      'tags-list',
      'tags',
      () => this.http.get<Tag[]>(this.apiUrl),
      { ttl: 60 * 60 * 1000, ...options }  // ← 1 heure
    );
  }

  // ... autres méthodes similaires avec invalidation cache
}
```

---

#### PHASE 5.4: EchauffementService et SituationMatchService
**Fichiers**: 
- `frontend/src/app/core/services/echauffement.service.ts` (modifier)
- `frontend/src/app/core/services/situationmatch.service.ts` (modifier)

**Modifications identiques** aux services précédents.

---

### PHASE 6: PRÉCHARGEMENT ET RAFRAÎCHISSEMENT

#### PHASE 6.1: Préchargement au Login
**Fichier**: `frontend/src/app/core/services/preload.service.ts` (nouveau)

```typescript
@Injectable({ providedIn: 'root' })
export class PreloadService {
  constructor(
    private exerciceService: ExerciceService,
    private entrainementService: EntrainementService,
    private tagService: TagService,
    private echauffementService: EchauffementService,
    private situationMatchService: SituationMatchService
  ) {}

  /**
   * Précharge les données critiques en arrière-plan
   * Appelé après connexion et sélection workspace
   */
  preloadCriticalData(): void {
    console.log('[Preload] Starting critical data preload');

    // Précharger en parallèle (non bloquant)
    forkJoin({
      tags: this.tagService.getTags(),
      exercices: this.exerciceService.getExercices(),
      entrainements: this.entrainementService.getEntrainements()
    }).subscribe({
      next: (data) => {
        console.log('[Preload] Critical data loaded:', {
          tags: data.tags.length,
          exercices: data.exercices.length,
          entrainements: data.entrainements.length
        });
      },
      error: (err) => {
        console.error('[Preload] Error loading critical data:', err);
        // Non bloquant, l'utilisateur peut continuer
      }
    });
  }

  /**
   * Précharge les données secondaires (moins prioritaires)
   */
  preloadSecondaryData(): void {
    console.log('[Preload] Starting secondary data preload');

    setTimeout(() => {
      forkJoin({
        echauffements: this.echauffementService.getEchauffements(),
        situations: this.situationMatchService.getSituationsMatch()
      }).subscribe({
        next: (data) => {
          console.log('[Preload] Secondary data loaded');
        },
        error: (err) => {
          console.error('[Preload] Error loading secondary data:', err);
        }
      });
    }, 2000); // Délai de 2s pour ne pas surcharger
  }
}
```

**Fichier**: `frontend/src/app/core/services/auth.service.ts` (modifier)

```typescript
constructor(
  private http: HttpClient,
  private router: Router,
  private supabaseService: SupabaseService,
  private workspaceService: WorkspaceService,
  private indexedDb: IndexedDbService,
  private preloadService: PreloadService  // ← AJOUT
) {
  this.listenToAuthStateChanges();
  this.initFromLocalToken();
}

// Modifier ensureWorkspaceSelected
private ensureWorkspaceSelected(): void {
  const currentWorkspace = this.workspaceService.getCurrentWorkspace();
  if (currentWorkspace) {
    console.log('[Auth] Workspace already selected:', currentWorkspace.name);
    // ← AJOUT: Précharger les données
    this.preloadService.preloadCriticalData();
    this.preloadService.preloadSecondaryData();
    return;
  }

  this.http.get<any[]>(`${environment.apiUrl}/workspaces/me`).subscribe({
    next: (workspaces) => {
      console.log('[Auth] Workspaces loaded:', workspaces.length);
      if (workspaces.length === 0) {
        console.warn('[Auth] No workspaces available');
        return;
      }

      const baseWorkspace = workspaces.find(w => w.name === 'BASE');
      const selectedWorkspace = baseWorkspace || workspaces[0];
      
      console.log('[Auth] Auto-selecting workspace:', selectedWorkspace.name);
      this.workspaceService.setCurrentWorkspace(selectedWorkspace, true);
      
      // ← AJOUT: Précharger les données après sélection
      this.preloadService.preloadCriticalData();
      this.preloadService.preloadSecondaryData();
    },
    error: (err) => {
      console.error('[Auth] Error loading workspaces:', err);
    }
  });
}
```

---

#### PHASE 6.2: Gestion du Rafraîchissement (F5)
**Fichier**: `frontend/src/app/app.component.ts` (modifier)

```typescript
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  // ... propriétés existantes

  constructor(
    private cdr: ChangeDetectorRef,
    public authService: AuthService,
    private backendStatus: BackendStatusService,
    private apiUrlService: ApiUrlService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    private workspaceService: WorkspaceService,
    private indexedDb: IndexedDbService,      // ← AJOUT
    private preloadService: PreloadService    // ← AJOUT
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.currentWorkspace$ = this.workspaceService.currentWorkspace$;
  }

  async ngOnInit(): Promise<void> {
    // ← AJOUT: Initialiser IndexedDB
    await this.indexedDb.init();
    console.log('[App] IndexedDB initialized');

    // Afficher le loader lors du réveil du backend
    this.showStartupLoader$ = this.backendStatus.getState().pipe(
      map(state => state.status === 'waking'),
      distinctUntilChanged()
    );

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe();

    // ← AJOUT: Gérer le rafraîchissement F5
    this.handlePageRefresh();
  }

  // ← NOUVELLE MÉTHODE: Gérer le rafraîchissement
  private handlePageRefresh(): void {
    // Vérifier si c'est un rafraîchissement (F5)
    const isRefresh = performance.navigation.type === 1;
    
    if (isRefresh) {
      console.log('[App] Page refresh detected, loading from cache');
      
      // Restaurer l'état du workspace si changement en cours
      const changeState = this.workspaceService.restoreChangeState();
      if (changeState) {
        console.log('[App] Restoring workspace change state:', changeState);
        // Restaurer scroll, filtres, etc.
        setTimeout(() => {
          if (changeState.scrollPosition) {
            window.scrollTo(0, changeState.scrollPosition);
          }
        }, 100);
      }
      
      // Précharger les données en arrière-plan
      this.authService.isAuthenticated$.pipe(
        filter(isAuth => isAuth),
        take(1)
      ).subscribe(() => {
        this.preloadService.preloadCriticalData();
        this.preloadService.preloadSecondaryData();
      });
    }
  }
}
```

---

### PHASE 7: TESTS ET VALIDATION

#### Tests Unitaires
**Fichiers à créer**:
- `frontend/src/app/core/services/indexed-db.service.spec.ts`
- `frontend/src/app/core/services/data-cache.service.spec.ts`
- `frontend/src/app/core/services/sync.service.spec.ts`

#### Tests d'Intégration
**Scénarios à tester**:
1. **Connexion → Préchargement**
   - Login
   - Vérifier données en IndexedDB
   - Vérifier cache mémoire

2. **Changement de workspace**
   - Sélectionner workspace A
   - Charger des exercices
   - Changer vers workspace B
   - Vérifier isolation des données

3. **Rafraîchissement F5**
   - Charger des données
   - F5
   - Vérifier chargement instantané depuis cache
   - Vérifier synchronisation en arrière-plan

4. **Synchronisation multi-onglets**
   - Ouvrir 2 onglets
   - Modifier un exercice dans onglet 1
   - Vérifier mise à jour dans onglet 2

5. **Mode offline**
   - Charger des données
   - Couper le réseau
   - Vérifier accès aux données cachées
   - Reconnecter
   - Vérifier synchronisation

#### Checklist de Validation
- [ ] IndexedDB initialisé correctement
- [ ] Données sauvegardées par workspace
- [ ] Cache mémoire fonctionne (hit/miss)
- [ ] Synchronisation 30s active
- [ ] BroadcastChannel fonctionne
- [ ] Changement workspace sans perte de données
- [ ] F5 charge depuis cache
- [ ] Invalidation cache sur modification
- [ ] Préchargement au login
- [ ] Gestion erreurs réseau
- [ ] Performance: chargement < 500ms

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance
- **Temps de chargement initial**: < 500ms (vs 2-3s actuellement)
- **Changement workspace**: < 200ms (vs reload complet)
- **Rafraîchissement F5**: < 300ms
- **Taux de cache hit**: > 70%

### Expérience Utilisateur
- **Fluidité**: Aucun écran blanc lors des transitions
- **Cohérence**: Données synchronisées entre onglets
- **Résilience**: Fonctionnement partiel offline

### Technique
- **Réduction requêtes API**: -80%
- **Bande passante économisée**: -70%
- **Taille cache IndexedDB**: < 50MB par workspace

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **PHASE 1** (Fondations) - 2h
2. **PHASE 2** (Cache & Sync) - 2h
3. **PHASE 3** (Backend) - 1h
4. **PHASE 4** (Auth & Workspace) - 2h
5. **PHASE 5** (Services de données) - 2h
6. **PHASE 6** (Préchargement) - 1h
7. **PHASE 7** (Tests) - 2h

**Total estimé**: 12 heures

---

## 📝 NOTES IMPORTANTES

### Compatibilité Navigateurs
- **IndexedDB**: Supporté par tous les navigateurs modernes (Chrome, Firefox, Safari, Edge)
- **BroadcastChannel**: Supporté partout sauf Safari < 15.4
- **Fallback**: Mode dégradé (mémoire uniquement) si IndexedDB indisponible

### Limitations
- **Quota IndexedDB**: ~50MB par défaut (suffisant pour votre usage)
- **Synchronisation**: Polling 30s (pas temps réel)
- **Offline**: Lecture seule (pas d'écriture offline)

### Évolutions Futures Possibles
- WebSocket pour synchronisation temps réel
- Service Worker pour vrai mode offline
- Compression des données en IndexedDB
- Stratégie de cache prédictif (ML)
