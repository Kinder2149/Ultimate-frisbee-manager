# PROPOSITION DE REFONTE MOBILE - ULTIMATE FRISBEE MANAGER

**Date :** 2026-02-18  
**Statut :** WORK  
**Projet :** Ultimate Frisbee Manager  
**Objectif :** Concevoir une expérience mobile optimale centrée sur le terrain

---

## 📋 RÉSUMÉ EXÉCUTIF

Cette proposition définit une refonte complète de la vue mobile d'Ultimate Frisbee Manager, conçue spécifiquement pour répondre aux besoins des entraîneurs **sur le terrain**. L'approche privilégie la simplicité, la rapidité d'accès et l'utilisabilité tactile.

### Vision

> **"Accéder instantanément à mes exercices et entraînements sur le terrain, même sans connexion"**

### Principes directeurs

1. **Mobile-first** : Conception pensée pour le tactile dès le départ
2. **Terrain-centric** : Optimisé pour l'usage en situation d'entraînement
3. **Offline-ready** : Fonctionnement sans connexion réseau
4. **Progressive** : Affichage progressif du contenu (essentiel → détails)
5. **Réutilisation** : Adapter les composants desktop existants plutôt que recréer

### Objectifs mesurables

- ⚡ **Temps d'accès < 2s** : Du lancement à l'affichage d'un exercice
- 📱 **Taux de rebond < 10%** : Sur les écrans mobiles
- 🔄 **Mode hors ligne** : 100% des fonctionnalités de consultation
- 👆 **Tailles tactiles** : 100% des boutons ≥ 44px
- 🎯 **Satisfaction utilisateur** : Score NPS > 8/10

---

## 1. ARCHITECTURE DE NAVIGATION

### 1.1 Navigation principale : Bottom Navigation Bar

**Rationale :**
- Accessibilité au pouce (zone de confort mobile)
- Standard iOS/Android (familiarité)
- Toujours visible (pas de scroll)
- 4-5 items max (recommandation Material Design)

**Structure proposée :**

```
┌─────────────────────────────────────┐
│                                     │
│         CONTENU PRINCIPAL           │
│                                     │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🏠      📚      ⚙️      👤         │
│ Accueil  Biblio  Terrain  Profil   │
└─────────────────────────────────────┘
```

**Items de navigation :**

1. **🏠 Accueil** (`/mobile/home`)
   - Feed de contenu unifié
   - Recherche rapide
   - Accès récents

2. **📚 Bibliothèque** (`/mobile/library`)
   - Mes exercices
   - Mes entraînements
   - Mes échauffements
   - Mes situations

3. **⚙️ Terrain** (`/mobile/terrain`)
   - Mode terrain (vue simplifiée)
   - Chronomètre intégré
   - Entraînement du jour
   - Accès rapide favoris

4. **👤 Profil** (`/mobile/profile`)
   - Paramètres
   - Workspace
   - Synchronisation
   - Mode hors ligne

### 1.2 Navigation secondaire : Header contextuel

**Structure :**

```
┌─────────────────────────────────────┐
│ ← [Titre de la page]         [⋮]   │
└─────────────────────────────────────┘
```

**Éléments :**
- **Bouton retour** : Navigation arrière (≥ 44px)
- **Titre** : Contexte actuel
- **Menu overflow** (⋮) : Actions contextuelles (partage, édition, etc.)

### 1.3 Gestes tactiles

**Gestes supportés :**
- **Swipe gauche/droite** : Navigation entre onglets
- **Swipe bas** : Pull-to-refresh (actualisation)
- **Long press** : Menu contextuel rapide
- **Pinch to zoom** : Zoom sur images/schémas
- **Swipe up** : Ouvrir détails (bottom sheet)

---

## 2. ÉCRANS PRINCIPAUX - WIREFRAMES TEXTUELS

### 2.1 Écran d'accueil (`/mobile/home`)

**Objectif :** Point d'entrée rapide vers tout le contenu

```
┌─────────────────────────────────────┐
│ ☰  Ultimate Frisbee Manager    🔔  │ ← Header
├─────────────────────────────────────┤
│ 🔍 Rechercher...                    │ ← Barre recherche
├─────────────────────────────────────┤
│ [Tous] [Exercices] [Entraînements] │ ← Filtres rapides
│ [Échauffements] [Situations]        │   (chips horizontaux)
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏃 Exercice: Passes en triangle │ │
│ │ 📍 Objectif: Passes courtes     │ │ ← Carte contenu
│ │ ⏱️ 15 min  👥 8-12 joueurs      │ │   (scroll vertical)
│ │ [Voir] [⭐]                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📋 Entraînement: Défense zone   │ │
│ │ 🎯 Thème: Défense               │ │
│ │ ⏱️ 90 min  📅 Hier              │ │
│ │ [Voir] [⭐]                     │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
│  🏠      📚      ⚙️      👤         │ ← Bottom nav
└─────────────────────────────────────┘
```

**Fonctionnalités :**
- Feed unifié de tout le contenu
- Recherche instantanée (debounce 300ms)
- Filtres rapides par type
- Bouton favoris (⭐) pour accès rapide
- Pull-to-refresh pour synchroniser
- Infinite scroll (pagination)

**Composants réutilisés :**
- `ContentCardComponent` (adapté mobile)
- `SearchBarComponent`
- `FilterChipsComponent`

### 2.2 Écran bibliothèque (`/mobile/library`)

**Objectif :** Navigation organisée par type de contenu

```
┌─────────────────────────────────────┐
│ ←  Bibliothèque                 [+] │ ← Header + bouton ajout
├─────────────────────────────────────┤
│ [Exercices] [Entraînements]         │ ← Tabs (swipe horizontal)
│ [Échauffements] [Situations]        │
├─────────────────────────────────────┤
│ 🔍 Rechercher dans exercices...     │ ← Recherche contextuelle
├─────────────────────────────────────┤
│ 🏷️ Filtrer par tags               │ ← Bouton filtres avancés
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏃 Passes en triangle           │ │
│ │ ⏱️ 15 min  👥 8-12              │ │ ← Liste cartes
│ │ 🏷️ Passes courtes, Débutant    │ │   (scroll vertical)
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
│  🏠      📚      ⚙️      👤         │
└─────────────────────────────────────┘
```

**Fonctionnalités :**
- Tabs swipables entre types
- Recherche contextuelle par type
- Filtres avancés (bottom sheet)
- Bouton [+] pour créer (si permissions)
- Tri : Récent, Nom, Durée
- Actions rapides : Swipe left → Favoris

**Composants réutilisés :**
- `ExerciceCardComponent` (version mobile)
- `TabsComponent`
- `ExerciceFiltersComponent` (bottom sheet)

### 2.3 Écran détail exercice (`/mobile/detail/exercice/:id`)

**Objectif :** Consultation rapide et complète d'un exercice

```
┌─────────────────────────────────────┐
│ ←  Passes en triangle           [⋮] │ ← Header + menu
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        [IMAGE EXERCICE]         │ │ ← Image (swipe gallery)
│ └─────────────────────────────────┘ │
│                                     │
│ ⏱️ Durée: 15 min                    │
│ 👥 Joueurs: 8-12                    │ ← Métadonnées
│ 📍 Objectif: Passes courtes         │
│ 🎯 Niveau: Débutant                 │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ 📝 Description                      │ ← Section description
│ Exercice de passes courtes...      │   (collapsible)
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ 📋 Déroulement                      │ ← Section déroulement
│ 1. Formation en triangle (5m)      │   (collapsible)
│ 2. Passes dans le sens horaire     │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ 🏷️ Tags                            │ ← Tags
│ [Passes courtes] [Débutant]        │   (chips)
│                                     │
└─────────────────────────────────────┘
│ [⭐ Favoris] [📤 Partager]         │ ← Actions fixes
└─────────────────────────────────────┘
│  🏠      📚      ⚙️      👤         │
└─────────────────────────────────────┘
```

**Fonctionnalités :**
- Galerie d'images (swipe horizontal)
- Sections collapsibles (accordéon)
- Bouton favoris persistant
- Menu overflow : Éditer, Dupliquer, Supprimer
- Mode lecture optimisé
- Bouton "Lancer sur terrain" → Mode terrain

**Composants réutilisés :**
- `ImageViewerComponent`
- `RichTextViewComponent`
- `TagChipsComponent`
- `CollapsibleSectionComponent` (nouveau)

### 2.4 Écran mode terrain (`/mobile/terrain`)

**Objectif :** Interface ultra-simplifiée pour usage en entraînement

```
┌─────────────────────────────────────┐
│ ←  Mode Terrain                     │ ← Header minimal
├─────────────────────────────────────┤
│                                     │
│         ⏱️ CHRONOMÈTRE              │
│            00:00                    │ ← Chronomètre
│      [▶️ Démarrer]                  │   (grande taille)
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ 📋 Entraînement du jour             │
│ Défense zone - 90 min               │ ← Entraînement actif
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✅ Échauffement (20 min)        │ │
│ │ ⏳ Exercice 1: Passes (15 min)  │ │ ← Liste exercices
│ │ ⏳ Exercice 2: Défense (25 min) │ │   avec statut
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ ⭐ Favoris rapides                  │
│ [🏃 Passes triangle]                │ ← Accès rapide
│ [🏃 Défense homme]                  │   favoris (max 5)
│                                     │
└─────────────────────────────────────┘
│  🏠      📚      ⚙️      👤         │
└─────────────────────────────────────┘
```

**Fonctionnalités :**
- Chronomètre avec alertes sonores
- Entraînement du jour (sélectionnable)
- Suivi de progression (exercices cochés)
- Accès rapide aux favoris
- Mode plein écran (masquer bottom nav)
- Keep screen awake (pas de veille)

**Composants nouveaux :**
- `TimerComponent` (chronomètre)
- `TrainingProgressComponent` (suivi)
- `QuickAccessComponent` (favoris)

---

## 3. COMPOSANTS MOBILE SPÉCIFIQUES

### 3.1 Nouveaux composants à créer

**MobileBottomNavComponent**
- Props : `activeRoute`
- Events : `navigationChange`
- Comportement : Highlight de l'item actif, animations

**MobileHeaderComponent**
- Props : `title`, `showBack`, `actions[]`
- Events : `backClick`, `actionClick`
- Comportement : Header contextuel avec bouton retour

**MobileContentCardComponent**
- Props : `content`, `type`, `compact`
- Events : `cardClick`, `favoriteClick`, `actionClick`
- Comportement : Carte optimisée tactile

**MobileFilterBottomSheetComponent**
- Props : `filters`, `selectedFilters`
- Events : `filtersChange`, `close`
- Comportement : Bottom sheet draggable

**TimerComponent**
- Props : `duration`, `autoStart`
- Events : `timerEnd`, `timerPause`, `timerResume`
- Comportement : Chronomètre avec alertes

**TrainingProgressComponent**
- Props : `training`, `currentExerciseIndex`
- Events : `exerciseComplete`, `exerciseSkip`
- Comportement : Suivi de progression

**QuickAccessComponent**
- Props : `favorites[]`, `maxItems`
- Events : `itemClick`, `itemRemove`
- Comportement : Accès rapide favoris

**CollapsibleSectionComponent**
- Props : `title`, `icon`, `defaultOpen`
- Events : `toggleOpen`
- Comportement : Section collapsible avec animation

**PullToRefreshComponent**
- Props : `enabled`
- Events : `refresh`
- Comportement : Pull-to-refresh avec loader

### 3.2 Composants desktop à adapter

**ExerciceCardComponent → MobileExerciceCardComponent**
- Réduction du padding (20px → 12px)
- Taille tactile des boutons (≥ 44px)
- Layout vertical (image au-dessus)
- Actions simplifiées (icônes uniquement)

**ExerciceFiltersComponent → MobileFiltersComponent**
- Bottom sheet au lieu de sidebar
- Checkboxes plus grandes (≥ 44px)
- Sliders tactiles
- Boutons pleine largeur

**ImageViewerComponent → MobileImageViewerComponent**
- Swipe horizontal entre images
- Pinch to zoom
- Indicateurs de position (dots)
- Bouton fermeture (X) en overlay

**RichTextViewComponent → MobileRichTextViewComponent**
- Police plus grande (16px min)
- Line-height augmenté (1.6)
- Contraste optimisé
- Liens tactiles (≥ 44px)

---

## 4. SERVICES ET GESTION DE L'ÉTAT

### 4.1 Services existants à réutiliser

**WorkspaceDataStore**
- ✅ Réutilisation directe
- Aucune modification nécessaire
- Observables déjà optimisés

**DataCacheService**
- ✅ Réutilisation directe
- Cache multi-niveaux déjà en place
- Stale-while-revalidate opérationnel

**AuthService, WorkspaceService, PermissionsService**
- ✅ Réutilisation directe
- Aucune modification nécessaire

### 4.2 Nouveaux services mobile

**MobileStateService**

```typescript
@Injectable({ providedIn: 'root' })
export class MobileStateService {
  // État de la navigation
  private currentTabSubject = new BehaviorSubject<string>('home');
  currentTab$ = this.currentTabSubject.asObservable();
  
  // État du mode terrain
  private terrainModeSubject = new BehaviorSubject<boolean>(false);
  terrainMode$ = this.terrainModeSubject.asObservable();
  
  // Entraînement actif
  private activeTrainingSubject = new BehaviorSubject<Entrainement | null>(null);
  activeTraining$ = this.activeTrainingSubject.asObservable();
  
  // Favoris
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  favorites$ = this.favoritesSubject.asObservable();
  
  // Méthodes
  setCurrentTab(tab: string): void
  enableTerrainMode(): void
  disableTerrainMode(): void
  setActiveTraining(training: Entrainement | null): void
  addFavorite(id: string): void
  removeFavorite(id: string): void
  isFavorite(id: string): boolean
}
```

**MobileOfflineService**

```typescript
@Injectable({ providedIn: 'root' })
export class MobileOfflineService {
  // État de connexion
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  isOnline$ = this.isOnlineSubject.asObservable();
  
  // Données en attente de synchronisation
  private pendingSyncSubject = new BehaviorSubject<any[]>([]);
  pendingSync$ = this.pendingSyncSubject.asObservable();
  
  // Méthodes
  init(): void
  cacheForOffline(data: any, key: string): Promise<void>
  getCachedData(key: string): Promise<any>
  queueForSync(action: any): void
  syncPendingActions(): Promise<void>
  clearOfflineCache(): Promise<void>
}
```

**MobileGesturesService**

```typescript
@Injectable({ providedIn: 'root' })
export class MobileGesturesService {
  // Détection de gestes
  detectSwipe(element: HTMLElement): Observable<SwipeEvent>
  detectLongPress(element: HTMLElement): Observable<LongPressEvent>
  detectPinch(element: HTMLElement): Observable<PinchEvent>
  
  // Configuration
  setSwipeThreshold(threshold: number): void
  setLongPressDuration(duration: number): void
}
```

**MobileNotificationService**

```typescript
@Injectable({ providedIn: 'root' })
export class MobileNotificationService {
  // Notifications locales
  showToast(message: string, duration?: number): void
  showSnackbar(message: string, action?: string): Observable<string>
  
  // Notifications système
  requestPermission(): Promise<boolean>
  scheduleNotification(title: string, body: string, delay: number): void
  cancelNotification(id: string): void
}
```

### 4.3 Stratégie de cache mobile

**Cache agressif pour mode hors ligne :**

```typescript
const MOBILE_CACHE_CONFIG = {
  exercices: 30 * 60 * 1000,      // 30 min (vs 5 min desktop)
  entrainements: 30 * 60 * 1000,  // 30 min
  echauffements: 30 * 60 * 1000,  // 30 min
  situations: 30 * 60 * 1000,     // 30 min
  tags: 60 * 60 * 1000,           // 1h
  workspaces: 24 * 60 * 60 * 1000 // 24h
};

const MOBILE_REVALIDATE_THRESHOLD = 10 * 60 * 1000; // 10 min
```

**Préchargement intelligent :**

```typescript
async preloadEssentialData(): Promise<void> {
  // 1. Charger les favoris
  const favorites = await this.loadFavorites();
  
  // 2. Charger l'entraînement du jour
  const todayTraining = await this.loadTodayTraining();
  
  // 3. Charger les 20 derniers exercices consultés
  const recentExercices = await this.loadRecentExercices(20);
  
  // 4. Tout mettre en cache IndexedDB
  await this.cacheForOffline({ favorites, todayTraining, recentExercices });
}
```

---

## 5. DESIGN SYSTEM MOBILE

### 5.1 Adaptations du design system

**Tailles tactiles (Touch Targets)**

```scss
--touch-target-min: 44px;        // iOS
--touch-target-comfortable: 48px; // Material Design
--touch-target-spacing: 8px;

.mobile-button {
  min-height: var(--touch-target-comfortable);
  min-width: var(--touch-target-comfortable);
  padding: 12px 16px;
}
```

**Typographie mobile**

```scss
--mobile-font-size-h1: 2rem;      // 32px
--mobile-font-size-h2: 1.5rem;    // 24px
--mobile-font-size-h3: 1.25rem;   // 20px
--mobile-font-size-body: 1rem;    // 16px
--mobile-font-size-small: 0.875rem; // 14px

--mobile-line-height-body: 1.6;
--mobile-line-height-heading: 1.3;
```

**Espacements mobile**

```scss
--mobile-spacing-xs: 0.25rem;  // 4px
--mobile-spacing-sm: 0.5rem;   // 8px
--mobile-spacing-md: 0.75rem;  // 12px
--mobile-spacing-lg: 1rem;     // 16px
--mobile-spacing-xl: 1.5rem;   // 24px

--mobile-card-padding: 12px;

--mobile-gap-sm: 8px;
--mobile-gap-md: 12px;
--mobile-gap-lg: 16px;
```

**Couleurs et contrastes**

```scss
// Contrastes renforcés pour lisibilité en extérieur
--mobile-text-primary: #1a1a1a;
--mobile-text-secondary: #4a4a4a;

--mobile-shadow-card: 0 2px 12px rgba(0,0,0,0.15);
--mobile-shadow-elevated: 0 4px 20px rgba(0,0,0,0.2);
```

### 5.2 Animations et transitions

```scss
// Transition de navigation
.page-enter {
  animation: slideInRight 250ms ease-out;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

// Feedback tactile
.button-press {
  animation: scaleDown 100ms ease-out;
}

@keyframes scaleDown {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

// Bottom sheet
.bottom-sheet-enter {
  animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### 5.3 Thème sombre (Dark Mode)

```scss
@media (prefers-color-scheme: dark) {
  :root {
    --background: #121212;
    --surface: #1e1e1e;
    --surface-elevated: #2a2a2a;
    
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    
    --border-color: #333333;
    
    --card-gradient: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  }
}
```

---

## 6. MODE HORS LIGNE

### 6.1 Stratégie de fonctionnement hors ligne

**Objectif :** 100% des fonctionnalités de consultation disponibles hors ligne

**Données à cacher :**
1. Exercices du workspace
2. Entraînements du workspace
3. Échauffements du workspace
4. Situations du workspace
5. Tags du workspace
6. Favoris de l'utilisateur
7. Images des 50 derniers contenus consultés

**Technologies :**
- **IndexedDB** : Stockage données structurées
- **Cache API** : Stockage images et assets
- **Service Worker** : Interception requêtes réseau

### 6.2 Synchronisation

**Détection de connexion :**

```typescript
window.addEventListener('online', () => {
  this.mobileOfflineService.syncPendingActions();
});

window.addEventListener('offline', () => {
  this.mobileNotificationService.showToast('Mode hors ligne activé');
});
```

**Actions en attente :**

```typescript
interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'exercice' | 'entrainement' | 'echauffement' | 'situation';
  data: any;
  timestamp: number;
}

queueAction(action: PendingAction): void {
  this.pendingActions.push(action);
  this.savePendingActions();
}

async syncPendingActions(): Promise<void> {
  if (!navigator.onLine) return;
  
  for (const action of this.pendingActions) {
    try {
      await this.executeAction(action);
      this.removeAction(action.id);
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  }
}
```

**Indicateurs visuels :**

```html
<div class="offline-badge" *ngIf="!(isOnline$ | async)">
  📡 Hors ligne
</div>

<div class="pending-sync-badge" *ngIf="(pendingSync$ | async)?.length > 0">
  ⏳ {{ (pendingSync$ | async)?.length }} actions en attente
</div>
```

---

## 7. PERFORMANCES ET OPTIMISATIONS

### 7.1 Métriques cibles

**Core Web Vitals :**
- **LCP** : < 2.5s
- **FID** : < 100ms
- **CLS** : < 0.1

**Métriques custom :**
- **TTI** : < 3s
- **Bundle size** : < 500 KB (gzipped)
- **Temps de chargement** : < 2s (3G)

### 7.2 Optimisations techniques

**Lazy loading des images :**

```html
<img [src]="imageUrl" loading="lazy" [alt]="exercice.nom" />
```

**Virtual scrolling :**

```html
<cdk-virtual-scroll-viewport itemSize="120">
  <div *cdkVirtualFor="let exercice of exercices$">
    <app-mobile-exercice-card [exercice]="exercice"></app-mobile-exercice-card>
  </div>
</cdk-virtual-scroll-viewport>
```

**Debounce sur la recherche :**

```typescript
searchControl.valueChanges
  .pipe(debounceTime(300), distinctUntilChanged())
  .subscribe(query => this.search(query));
```

**Compression des images :**

```typescript
getOptimizedImageUrl(url: string, width: number): string {
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
}
```

### 7.3 Optimisations UX

**Skeleton screens :**

```html
<div class="skeleton-card" *ngIf="loading">
  <div class="skeleton-image"></div>
  <div class="skeleton-title"></div>
  <div class="skeleton-text"></div>
</div>
```

**Optimistic UI :**

```typescript
async addFavorite(id: string): Promise<void> {
  // 1. Mettre à jour l'UI immédiatement
  this.favorites.push(id);
  
  // 2. Envoyer la requête en arrière-plan
  try {
    await this.api.addFavorite(id).toPromise();
  } catch (error) {
    // 3. Rollback en cas d'erreur
    this.favorites = this.favorites.filter(f => f !== id);
    this.notificationService.showToast('Erreur');
  }
}
```

---

## 8. ACCESSIBILITÉ MOBILE

### 8.1 Standards

**Conformité :**
- WCAG 2.1 Level AA
- iOS Human Interface Guidelines
- Material Design Accessibility

### 8.2 Tailles tactiles

**Règles :**
- Tous les boutons : ≥ 44px × 44px (iOS) ou ≥ 48px × 48px (Android)
- Espacement entre cibles : ≥ 8px

### 8.3 Contrastes

**Ratios minimum :**
- Texte normal : 4.5:1
- Texte large (≥ 18px) : 3:1
- Éléments UI : 3:1

### 8.4 Lecteurs d'écran

```html
<button aria-label="Ajouter aux favoris">
  <mat-icon>star</mat-icon>
</button>

<div role="status" aria-live="polite" *ngIf="loading">
  Chargement en cours...
</div>

<nav aria-label="Navigation principale">
  <a routerLink="/mobile/home" aria-current="page">Accueil</a>
</nav>
```

---

## 9. PLAN D'IMPLÉMENTATION

### Phase 1 : Fondations (Sprint 1-2)

**Objectifs :**
- Architecture de base
- Composants de navigation
- Routing mobile

**Tâches :**
1. Créer `MobileLayoutComponent` (refonte)
2. Créer `MobileBottomNavComponent`
3. Créer `MobileHeaderComponent`
4. Mettre à jour routing (`mobile.routes.ts`)
5. Créer `MobileStateService`
6. Adapter design system (SCSS)

**Livrables :**
- Navigation fonctionnelle
- Routing entre 4 écrans
- Design system mobile

### Phase 2 : Écrans principaux (Sprint 3-4)

**Objectifs :**
- Écrans Accueil et Bibliothèque
- Cartes mobile
- Recherche et filtres

**Tâches :**
1. Créer `MobileHomeComponent`
2. Créer `MobileLibraryComponent`
3. Créer `MobileContentCardComponent`
4. Adapter `ExerciceFiltersComponent` (bottom sheet)
5. Implémenter recherche (debounce)
6. Implémenter pull-to-refresh

**Livrables :**
- Écran accueil avec feed
- Écran bibliothèque avec tabs
- Recherche et filtrage

### Phase 3 : Détails et consultation (Sprint 5-6)

**Objectifs :**
- Écrans de détail
- Composants de visualisation
- Gestes tactiles

**Tâches :**
1. Créer `MobileDetailComponent`
2. Adapter `ImageViewerComponent` (swipe, pinch)
3. Adapter `RichTextViewComponent`
4. Créer `CollapsibleSectionComponent`
5. Implémenter `MobileGesturesService`
6. Implémenter menu contextuel (long press)

**Livrables :**
- Écrans de détail
- Galerie d'images avec gestes
- Sections collapsibles

### Phase 4 : Mode terrain (Sprint 7-8)

**Objectifs :**
- Mode terrain
- Chronomètre
- Suivi de progression

**Tâches :**
1. Créer `MobileTerrainComponent`
2. Créer `TimerComponent`
3. Créer `TrainingProgressComponent`
4. Créer `QuickAccessComponent`
5. Implémenter notifications locales
6. Implémenter keep screen awake

**Livrables :**
- Mode terrain fonctionnel
- Chronomètre avec alertes
- Suivi de progression

### Phase 5 : Mode hors ligne (Sprint 9-10)

**Objectifs :**
- Mode hors ligne
- Synchronisation
- Cache optimisé

**Tâches :**
1. Créer `MobileOfflineService`
2. Implémenter préchargement
3. Implémenter file de synchronisation
4. Créer Service Worker
5. Implémenter indicateurs visuels
6. Tester mode hors ligne

**Livrables :**
- Mode hors ligne fonctionnel
- Synchronisation automatique
- Tests E2E

### Phase 6 : Profil et paramètres (Sprint 11)

**Objectifs :**
- Écran profil
- Paramètres mobile
- Thème sombre

**Tâches :**
1. Créer `MobileProfileComponent`
2. Créer pages de paramètres
3. Implémenter thème sombre
4. Implémenter gestion favoris
5. Implémenter statistiques

**Livrables :**
- Écran profil complet
- Paramètres fonctionnels
- Thème sombre

### Phase 7 : Optimisations (Sprint 12)

**Objectifs :**
- Optimiser performances
- Corriger bugs
- Tests devices réels

**Tâches :**
1. Optimiser bundle size
2. Optimiser images
3. Implémenter virtual scrolling
4. Corriger bugs
5. Tester sur devices réels
6. Audit Lighthouse

**Livrables :**
- Performances optimisées (LCP < 2.5s)
- Bugs corrigés
- Score Lighthouse > 90

### Phase 8 : Documentation (Sprint 13)

**Objectifs :**
- Documenter
- Former utilisateurs
- Déployer

**Tâches :**
1. Rédiger documentation technique
2. Créer guide utilisateur mobile
3. Créer vidéos de démonstration
4. Déployer sur Vercel (preview)
5. Tests utilisateurs (beta)
6. Déploiement production

**Livrables :**
- Documentation complète
- Guide utilisateur
- Déploiement production

---

## 10. CONCLUSION

### 10.1 Récapitulatif

Cette proposition de refonte mobile transforme Ultimate Frisbee Manager en une application **terrain-centric**, optimisée pour l'usage réel des entraîneurs :

✅ **Navigation intuitive** : Bottom nav + gestes tactiles  
✅ **Mode hors ligne** : 100% des fonctionnalités de consultation  
✅ **Mode terrain** : Chronomètre + suivi de progression  
✅ **Performances** : LCP < 2.5s, bundle < 500 KB  
✅ **Accessibilité** : WCAG 2.1 AA, tailles tactiles ≥ 44px  
✅ **Réutilisation** : 80% des composants desktop adaptés

### 10.2 Bénéfices attendus

**Pour les utilisateurs :**
- Accès instantané aux exercices sur le terrain
- Utilisation sans connexion réseau
- Interface tactile optimisée
- Expérience fluide et rapide

**Pour le projet :**
- Augmentation de l'engagement mobile
- Réduction du taux de rebond
- Meilleure satisfaction utilisateur
- Base solide pour futures évolutions

### 10.3 Prochaines étapes

1. **Validation** : Revue de la proposition avec l'équipe
2. **Priorisation** : Ajustement du plan d'implémentation
3. **Démarrage** : Phase 1 (Fondations)
4. **Itération** : Tests utilisateurs à chaque phase

---

**Document créé le :** 2026-02-18  
**Référence :** `20260218_ANALYSE_VUE_CLASSIQUE.md`  
**Prochaine étape :** Validation et démarrage Phase 1
