# PROPOSITION COMPLÈTE - VUE MOBILE ULTIMATE FRISBEE MANAGER

**Date :** 2026-02-18  
**Statut :** REFERENCE  
**Version :** 1.0  
**Projet :** Ultimate Frisbee Manager  
**Basé sur :** Analyse vue desktop + État actuel mobile

---

## 📋 VISION GLOBALE

### Objectif

Créer une expérience mobile **native et fluide** pour Ultimate Frisbee Manager, permettant aux entraîneurs de :
- **Consulter** leur bibliothèque d'exercices/entraînements en mobilité
- **Gérer** leurs entraînements sur le terrain
- **Créer** du contenu simple rapidement
- **Travailler hors ligne** avec synchronisation automatique

### Principes directeurs

1. **Mobile-first** : Conçu pour le tactile, pas adapté du desktop
2. **Performance** : Chargement instantané, animations fluides (60fps)
3. **Simplicité** : Une action principale par écran
4. **Continuité** : Design cohérent avec la vue desktop
5. **Résilience** : Fonctionne hors ligne, synchronise automatiquement

---

## 🎨 DESIGN SYSTEM MOBILE

### Palette de couleurs

```scss
// Primaire (cohérence avec desktop)
--primary: #667eea;
--primary-dark: #5568d3;
--primary-light: #8b9ef5;

// Secondaire
--secondary: #764ba2;
--accent: #4facfe;

// Texte
--text-primary: #2c3e50;
--text-secondary: #7f8c8d;
--text-muted: #95a5a6;
--text-inverse: #ffffff;

// Fond
--bg-primary: #ffffff;
--bg-secondary: #f8f9fa;
--bg-tertiary: #e9ecef;

// Sémantiques
--success: #2ecc71;
--warning: #f39c12;
--error: #e74c3c;
--info: #3498db;

// Overlay
--overlay: rgba(0, 0, 0, 0.5);
--overlay-light: rgba(0, 0, 0, 0.3);

// Dark mode
@media (prefers-color-scheme: dark) {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #3a3a3a;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: #404040;
}
```

### Typographie

```scss
// Famille
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

// Tailles
--text-xs: 0.75rem;    // 12px - Labels, badges
--text-sm: 0.875rem;   // 14px - Texte secondaire
--text-base: 1rem;     // 16px - Texte principal
--text-lg: 1.125rem;   // 18px - Sous-titres
--text-xl: 1.25rem;    // 20px - Titres cartes
--text-2xl: 1.5rem;    // 24px - Titres pages
--text-3xl: 2rem;      // 32px - Titres hero

// Poids
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

// Line-height
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Espacements

```scss
// Système 4px
--space-1: 0.25rem;   // 4px
--space-2: 0.5rem;    // 8px
--space-3: 0.75rem;   // 12px
--space-4: 1rem;      // 16px
--space-5: 1.25rem;   // 20px
--space-6: 1.5rem;    // 24px
--space-8: 2rem;      // 32px
--space-10: 2.5rem;   // 40px
--space-12: 3rem;     // 48px

// Safe areas (iOS)
--safe-top: env(safe-area-inset-top);
--safe-bottom: env(safe-area-inset-bottom);
--safe-left: env(safe-area-inset-left);
--safe-right: env(safe-area-inset-right);
```

### Tailles tactiles

```scss
// Minimum recommandé : 44x44px (iOS), 48x48px (Material)
--touch-min: 48px;
--touch-comfortable: 56px;

// Boutons
--btn-height-sm: 40px;
--btn-height-md: 48px;
--btn-height-lg: 56px;

// Bottom nav
--bottom-nav-height: 56px;

// Header
--header-height: 56px;
```

### Bordures et ombres

```scss
// Radius
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

// Ombres
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.2);

// Elevation (Material)
--elevation-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
--elevation-2: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
--elevation-3: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
```

### Animations

```scss
// Durées
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

// Easing
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

// Transitions communes
--transition-all: all var(--duration-normal) var(--ease-out);
--transition-transform: transform var(--duration-normal) var(--ease-out);
--transition-opacity: opacity var(--duration-fast) var(--ease-out);
```

---

## 🗺️ ARCHITECTURE COMPLÈTE

### Structure des routes

```typescript
/mobile
  ├── /                          → Redirect to /home
  ├── /home                      → Feed unifié + filtres
  ├── /library                   → Bibliothèque par type
  │   ├── /exercices             → Liste exercices
  │   ├── /entrainements         → Liste entraînements
  │   ├── /echauffements         → Liste échauffements
  │   └── /situations            → Liste situations
  ├── /terrain                   → Mode terrain
  │   ├── /                      → Vue principale
  │   ├── /training/:id          → Entraînement en cours
  │   └── /favorites             → Favoris rapides
  ├── /create                    → Création rapide
  │   ├── /exercice              → Formulaire exercice
  │   ├── /entrainement          → Formulaire entraînement
  │   ├── /echauffement          → Formulaire échauffement
  │   └── /situation             → Formulaire situation
  ├── /detail/:type/:id          → Détails d'un élément
  │   └── /edit                  → Édition (modal)
  ├── /search                    → Recherche globale
  ├── /profile                   → Profil utilisateur
  │   ├── /settings              → Paramètres
  │   ├── /workspaces            → Gestion workspaces
  │   └── /offline               → Gestion hors ligne
  └── /notifications             → Centre de notifications
```

### Services (architecture)

```typescript
// État global
MobileStateService
  ├── currentTab$: Observable<string>
  ├── terrainMode$: Observable<boolean>
  ├── activeTraining$: Observable<Entrainement | null>
  ├── favorites$: Observable<string[]>
  ├── offlineMode$: Observable<boolean>
  ├── syncStatus$: Observable<SyncStatus>
  └── notifications$: Observable<Notification[]>

// Données
MobileDataService
  ├── getAllContent(options): Observable<ContentItem[]>
  ├── getContentById(type, id): Observable<ContentItem>
  ├── createContent(type, data): Observable<ContentItem>
  ├── updateContent(type, id, data): Observable<ContentItem>
  └── deleteContent(type, id): Observable<void>

// Filtres
MobileFiltersService
  ├── filterByCategory(items, category): ContentItem[]
  ├── filterBySearch(items, query): ContentItem[]
  ├── filterByTags(items, tags): ContentItem[]
  ├── sortItems(items, order): ContentItem[]
  └── applyAllFilters(items, filters): ContentItem[]

// Cache & Offline
MobileOfflineService
  ├── enableOfflineMode(): void
  ├── disableOfflineMode(): void
  ├── syncData(): Observable<SyncResult>
  ├── queueAction(action): void
  └── getPendingActions(): Action[]

// Notifications
MobileNotificationService
  ├── requestPermission(): Promise<boolean>
  ├── showNotification(notification): void
  ├── scheduleNotification(notification, date): void
  └── cancelNotification(id): void

// Terrain
MobileTerrainService
  ├── startTraining(training): void
  ├── pauseTraining(): void
  ├── resumeTraining(): void
  ├── stopTraining(): void
  ├── nextExercise(): void
  ├── previousExercise(): void
  └── getCurrentExercise(): Observable<Exercice | null>
```

---

## 📱 PAGES DÉTAILLÉES

### 1. Home (`/mobile/home`)

**Objectif :** Feed unifié de tous les contenus avec filtres rapides

**Layout :**
```
┌─────────────────────────┐
│ 🔍 Recherche            │ ← Header sticky
├─────────────────────────┤
│ [Tout][Exo][Entr][...]  │ ← Filtres catégories (scroll horizontal)
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🏃 Exercice 1       │ │ ← Carte contenu
│ │ 15 min • 🏷️ Tags   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 📋 Entraînement 2   │ │
│ │ 90 min • 🏷️ Tags   │ │
│ └─────────────────────┘ │
│         ...             │
└─────────────────────────┘
│ [🏠][📚][⚽][👤]       │ ← Bottom nav
└─────────────────────────┘
```

**Fonctionnalités :**
- ✅ Recherche globale (debounce 300ms)
- ✅ Filtres par catégorie (chips horizontaux)
- ✅ Tri (récent/ancien, A-Z)
- ✅ Pull-to-refresh
- ✅ Infinite scroll
- ✅ Actions rapides : Voir, Favoris, Plus (menu)
- ✅ Badge "Hors ligne" si mode offline
- ✅ Skeleton loaders pendant chargement

**Interactions :**
- Tap carte → Détails
- Long press → Menu contextuel (Favoris, Partager, Supprimer)
- Swipe gauche → Actions rapides
- Pull down → Refresh

### 2. Library (`/mobile/library`)

**Objectif :** Navigation par type de contenu

**Layout :**
```
┌─────────────────────────┐
│ Bibliothèque            │ ← Header
│ [Exercices][Entr][...]  │ ← Tabs
├─────────────────────────┤
│ 🔍 Rechercher...        │ ← Recherche contextuelle
│ 🏷️ Filtres (2)         │ ← Filtres actifs
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🖼️  Exercice 1      │ │ ← Carte avec image
│ │ 15 min • 8-12 j.    │ │
│ │ 🏷️ Tags            │ │
│ └─────────────────────┘ │
│         ...             │
└─────────────────────────┘
```

**Fonctionnalités :**
- ✅ 4 tabs (Exercices, Entraînements, Échauffements, Situations)
- ✅ Recherche par tab
- ✅ Filtres avancés (sheet bottom)
- ✅ Tri personnalisé
- ✅ Compteur d'éléments
- ✅ Bouton FAB "+" (création rapide)
- ✅ Mode grille/liste (toggle)

**Filtres avancés (bottom sheet) :**
- Tags (multi-sélection)
- Durée (slider)
- Nombre de joueurs (slider)
- Date de création (range)
- Favoris uniquement (toggle)

### 3. Terrain (`/mobile/terrain`)

**Objectif :** Gestion d'entraînement sur le terrain

**Layout principal :**
```
┌─────────────────────────┐
│ Mode Terrain 🟢         │ ← Header
├─────────────────────────┤
│   ⏱️  00:15:32          │ ← Chronomètre (large)
│   [⏸️][⏹️]              │ ← Contrôles
├─────────────────────────┤
│ 📋 Entraînement actif   │
│ ┌─────────────────────┐ │
│ │ Échauffement (15')  │ │ ← Phase actuelle
│ │ ━━━━━━━━━━━━━━━━━━ │ │ ← Progression
│ └─────────────────────┘ │
├─────────────────────────┤
│ 🏃 Exercice en cours    │
│ ┌─────────────────────┐ │
│ │ Passe et va         │ │ ← Détails exercice
│ │ 10 min • 8 joueurs  │ │
│ │ [Voir détails]      │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ⭐ Favoris rapides      │
│ [Exo 1][Exo 2][Exo 3]   │ ← Chips scrollables
└─────────────────────────┘
```

**Fonctionnalités :**
- ✅ Chronomètre avec alertes visuelles/sonores
- ✅ Progression dans l'entraînement
- ✅ Navigation exercice précédent/suivant
- ✅ Affichage détails exercice en cours
- ✅ Favoris rapides (accès 1 tap)
- ✅ Mode plein écran (masque bottom nav)
- ✅ Notifications à intervalles configurables
- ✅ Historique des temps par exercice
- ✅ Notes rapides (vocal ou texte)

**Alertes :**
- 5 min avant fin exercice
- Fin exercice (vibration + son)
- Mi-temps entraînement

### 4. Create (`/mobile/create/:type`)

**Objectif :** Création rapide de contenu

**Layout (Exercice) :**
```
┌─────────────────────────┐
│ ← Nouvel exercice       │ ← Header
├─────────────────────────┤
│ 📸 Ajouter une image    │ ← Upload (optionnel)
├─────────────────────────┤
│ Nom *                   │
│ [________________]      │
├─────────────────────────┤
│ Description             │
│ [________________]      │ ← Textarea simple (pas WYSIWYG)
├─────────────────────────┤
│ Durée * (minutes)       │
│ [____] min              │ ← Number input
├─────────────────────────┤
│ Nombre de joueurs       │
│ Min [__] Max [__]       │
├─────────────────────────┤
│ 🏷️ Tags                │
│ [+ Ajouter des tags]    │ ← Sheet bottom
├─────────────────────────┤
│ [Annuler] [Créer]       │ ← Actions sticky bottom
└─────────────────────────┘
```

**Fonctionnalités :**
- ✅ Formulaire simplifié (champs essentiels uniquement)
- ✅ Validation inline
- ✅ Upload image (caméra ou galerie)
- ✅ Sélection tags (bottom sheet)
- ✅ Sauvegarde brouillon automatique
- ✅ Mode hors ligne (queue d'actions)
- ✅ Feedback immédiat (loader + message)

**Champs par type :**

**Exercice :**
- Nom*, Description, Image, Durée*, Nb joueurs, Tags

**Entraînement :**
- Titre*, Date, Thème, Échauffement (sélection), Exercices (sélection multiple), Situation (sélection)

**Échauffement :**
- Nom*, Description, Blocs (ajout dynamique)

**Situation :**
- Nom*, Type (dropdown), Description, Durée, Image, Tags

### 5. Detail (`/mobile/detail/:type/:id`)

**Objectif :** Consultation complète d'un élément

**Layout (Exercice) :**
```
┌─────────────────────────┐
│ ← Nom exercice      ⋮   │ ← Header + menu
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │                     │ │ ← Image (tap → viewer)
│ │      🖼️ Image       │ │
│ │                     │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ⏱️ 15 min  👥 8-12 j.   │ ← Métadonnées
├─────────────────────────┤
│ ▼ Description           │ ← Section collapsible
│   Lorem ipsum...        │
├─────────────────────────┤
│ ▼ Tags                  │ ← Section collapsible
│   [Tag1][Tag2][Tag3]    │
├─────────────────────────┤
│ ▼ Matériel              │ ← Section collapsible
│   • Cônes               │
│   • Disques             │
├─────────────────────────┤
│ ▼ Variantes             │ ← Section collapsible
│   1. Variante A         │
│   2. Variante B         │
├─────────────────────────┤
│ [⭐ Favoris] [📤 Partager]│ ← Actions sticky
└─────────────────────────┘
```

**Fonctionnalités :**
- ✅ Sections collapsibles (animations fluides)
- ✅ Visualiseur d'images (swipe, zoom, double-tap)
- ✅ Bouton favoris (toggle)
- ✅ Partage (natif ou copie lien)
- ✅ Menu contextuel (Éditer, Dupliquer, Supprimer)
- ✅ Navigation précédent/suivant (swipe)
- ✅ Mode lecture (masque UI, focus contenu)

**Menu contextuel (⋮) :**
- Éditer
- Dupliquer
- Ajouter aux favoris
- Partager
- Supprimer
- Signaler un problème

### 6. Search (`/mobile/search`)

**Objectif :** Recherche globale avancée

**Layout :**
```
┌─────────────────────────┐
│ ← 🔍 Rechercher...      │ ← Input focus auto
├─────────────────────────┤
│ Recherches récentes     │
│ • Passe et va           │ ← Historique (tap → recherche)
│ • Échauffement défense  │
│ • Situation 3v3         │
├─────────────────────────┤
│ Suggestions             │
│ • Exercices défense     │ ← Suggestions populaires
│ • Entraînements U17     │
│ • Échauffements rapides │
└─────────────────────────┘

// Après saisie
┌─────────────────────────┐
│ ← 🔍 passe              │
├─────────────────────────┤
│ Filtres: [Tout][Exo]... │ ← Filtres rapides
├─────────────────────────┤
│ 12 résultats            │
│ ┌─────────────────────┐ │
│ │ 🏃 Passe et va      │ │ ← Résultats
│ │ Exercice • 10 min   │ │
│ └─────────────────────┘ │
│         ...             │
└─────────────────────────┘
```

**Fonctionnalités :**
- ✅ Recherche en temps réel (debounce 300ms)
- ✅ Historique des recherches (localStorage)
- ✅ Suggestions populaires
- ✅ Filtres par type
- ✅ Tri des résultats (pertinence, date, nom)
- ✅ Highlight des termes recherchés
- ✅ Recherche vocale (si supporté)

### 7. Profile (`/mobile/profile`)

**Objectif :** Gestion du profil et paramètres

**Layout :**
```
┌─────────────────────────┐
│ Profil                  │ ← Header
├─────────────────────────┤
│     👤 Avatar           │
│   Jean Dupont           │ ← Infos utilisateur
│   jean@example.com      │
├─────────────────────────┤
│ 🏢 Workspace actuel     │
│ Mon Club • MANAGER      │ ← Badge rôle
│ [Changer]               │
├─────────────────────────┤
│ ⚙️ Paramètres           │
│ › Profil                │ ← Navigation
│ › Notifications         │
│ › Mode hors ligne       │
│ › Synchronisation       │
│ › Thème                 │
│ › Langue                │
├─────────────────────────┤
│ 📊 Statistiques         │
│ • 45 exercices créés    │
│ • 12 entraînements      │
│ • 156 heures terrain    │
├─────────────────────────┤
│ 🚪 Déconnexion          │ ← Bouton danger
└─────────────────────────┘
```

**Sous-pages :**

**Settings (`/profile/settings`) :**
- Modifier profil (nom, email, avatar)
- Changer mot de passe
- Préférences notifications
- Préférences affichage
- Gestion du cache
- À propos / Version

**Workspaces (`/profile/workspaces`) :**
- Liste des workspaces
- Créer nouveau workspace
- Rejoindre workspace (code)
- Gérer membres (si MANAGER)
- Quitter workspace

**Offline (`/profile/offline`) :**
- Toggle mode hors ligne
- Contenu téléchargé (liste + taille)
- Synchronisation manuelle
- Actions en attente (queue)
- Paramètres de sync auto

---

## 🔧 FONCTIONNALITÉS AVANCÉES

### Mode hors ligne

**Architecture :**
```typescript
// Service Worker + IndexedDB
MobileOfflineService
  ├── Cache Strategy: Network-first with fallback
  ├── IndexedDB: Stockage contenu
  ├── Queue: Actions en attente
  └── Sync: Background sync API

// Données cachées
- Tous les exercices du workspace
- Tous les entraînements
- Tous les échauffements
- Toutes les situations
- Tags
- Images (optimisées)
- Profil utilisateur
```

**Fonctionnalités :**
- ✅ Détection automatique de la connexion
- ✅ Badge "Hors ligne" dans le header
- ✅ Queue d'actions (création, édition, suppression)
- ✅ Synchronisation automatique au retour en ligne
- ✅ Résolution de conflits (last-write-wins)
- ✅ Indicateur de sync en cours
- ✅ Gestion de l'espace de stockage

**UI :**
```
┌─────────────────────────┐
│ Mode hors ligne 🔴      │ ← Banner sticky
│ 3 actions en attente    │
└─────────────────────────┘
```

### Notifications

**Types de notifications :**

1. **Rappels d'entraînement**
   - 1h avant l'entraînement
   - 15 min avant l'entraînement

2. **Alertes terrain**
   - Fin d'exercice
   - Mi-temps entraînement
   - Fin d'entraînement

3. **Synchronisation**
   - Sync terminée
   - Conflits détectés

4. **Collaboration**
   - Nouveau membre dans workspace
   - Contenu partagé
   - Commentaire ajouté

**Paramètres :**
```
┌─────────────────────────┐
│ Notifications           │
├─────────────────────────┤
│ ☑️ Rappels entraînement │
│ ☑️ Alertes terrain      │
│ ☐ Synchronisation       │
│ ☑️ Collaboration        │
├─────────────────────────┤
│ Son                     │
│ [Choisir un son]        │
├─────────────────────────┤
│ Vibration               │
│ ☑️ Activer              │
└─────────────────────────┘
```

### Gestes tactiles

**Gestes implémentés :**

1. **Swipe horizontal** (cartes)
   - Swipe gauche → Actions rapides
   - Swipe droite → Retour/Annuler

2. **Long press** (cartes)
   - Ouvre menu contextuel
   - Feedback haptique

3. **Pull-to-refresh** (listes)
   - Tire vers le bas → Refresh
   - Animation de chargement

4. **Pinch-to-zoom** (images)
   - 2 doigts → Zoom in/out
   - Double-tap → Zoom toggle

5. **Swipe vertical** (détails)
   - Swipe bas → Fermer modal
   - Swipe haut → Ouvrir détails complets

**Feedback :**
- Vibration légère (10ms) sur actions
- Animations fluides (60fps)
- Visual feedback immédiat

### Partage

**Options de partage :**

1. **Natif (Web Share API)**
   ```typescript
   if (navigator.share) {
     await navigator.share({
       title: exercice.nom,
       text: exercice.description,
       url: `${baseUrl}/mobile/detail/exercice/${exercice.id}`
     });
   }
   ```

2. **Copie lien**
   - Génère lien court
   - Copie dans presse-papiers
   - Toast de confirmation

3. **Export PDF** (futur)
   - Génère PDF avec détails
   - Téléchargement ou partage

4. **QR Code** (futur)
   - Génère QR code
   - Scan pour accès rapide

---

## 🎯 COMPOSANTS RÉUTILISABLES

### MobileCard

**Props :**
```typescript
interface MobileCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  tags?: Tag[];
  actions?: Action[];
  badge?: string;
  onTap?: () => void;
  onLongPress?: () => void;
}
```

**Variantes :**
- `compact` : Titre + icône (liste dense)
- `standard` : Titre + subtitle + image (défaut)
- `expanded` : + description + métadonnées

### MobileBottomSheet

**Props :**
```typescript
interface MobileBottomSheetProps {
  title: string;
  height?: 'auto' | 'half' | 'full';
  dismissible?: boolean;
  onClose?: () => void;
}
```

**Usage :**
- Filtres avancés
- Sélection tags
- Menus contextuels
- Formulaires rapides

### MobileFAB (Floating Action Button)

**Props :**
```typescript
interface MobileFABProps {
  icon: string;
  label?: string;
  position?: 'bottom-right' | 'bottom-center';
  actions?: FABAction[]; // Mini FABs
  onClick?: () => void;
}
```

**Comportement :**
- Masqué lors du scroll down
- Visible lors du scroll up
- Animation d'apparition (scale + fade)

### MobileSearchBar

**Props :**
```typescript
interface MobileSearchBarProps {
  placeholder: string;
  value: string;
  debounce?: number;
  voice?: boolean;
  onSearch?: (query: string) => void;
  onVoice?: () => void;
}
```

**Fonctionnalités :**
- Debounce configurable
- Bouton clear (X)
- Icône recherche vocale (optionnel)
- Historique (dropdown)

### MobileTimer

**Props :**
```typescript
interface MobileTimerProps {
  initialSeconds?: number;
  autoStart?: boolean;
  alerts?: TimerAlert[];
  onTick?: (seconds: number) => void;
  onAlert?: (alert: TimerAlert) => void;
}
```

**Fonctionnalités :**
- Démarrer/Pause/Arrêter
- Alertes configurables
- Affichage grand format
- Mode plein écran

---

## 📊 PERFORMANCE & OPTIMISATION

### Métriques cibles

```
First Contentful Paint (FCP): < 1.5s
Largest Contentful Paint (LCP): < 2.5s
Time to Interactive (TTI): < 3.5s
Cumulative Layout Shift (CLS): < 0.1
First Input Delay (FID): < 100ms
```

### Stratégies d'optimisation

**1. Code splitting**
```typescript
// Lazy loading des routes
{
  path: 'detail/:type/:id',
  loadComponent: () => import('./pages/mobile-detail/...')
}
```

**2. Image optimization**
- Formats modernes (WebP, AVIF)
- Lazy loading (Intersection Observer)
- Responsive images (srcset)
- Compression automatique (Cloudinary)

**3. Cache agressif**
- Service Worker (Cache-first)
- IndexedDB (données structurées)
- LocalStorage (préférences)
- Memory cache (session)

**4. Bundle optimization**
- Tree shaking
- Minification
- Compression (Gzip/Brotli)
- Preload critical resources

**5. Rendering optimization**
- Virtual scrolling (listes longues)
- OnPush change detection
- TrackBy functions
- Debounce inputs

---

## 🧪 TESTS & VALIDATION

### Tests unitaires

**Composants :**
- Rendu correct
- Props validation
- Events emission
- Accessibility

**Services :**
- Logique métier
- Gestion d'état
- Cache
- Offline queue

### Tests E2E

**Parcours critiques :**
1. Login → Home → Détails → Favoris
2. Library → Filtres → Détails → Édition
3. Terrain → Démarrer entraînement → Alertes
4. Create → Upload image → Validation → Succès
5. Offline → Actions → Retour online → Sync

### Tests manuels (checklist)

**Fonctionnels :**
- ☐ Navigation fluide
- ☐ Recherche fonctionne
- ☐ Filtres appliqués correctement
- ☐ CRUD complet
- ☐ Favoris persistants
- ☐ Mode terrain opérationnel
- ☐ Notifications reçues
- ☐ Partage fonctionne
- ☐ Offline/Online transitions

**Performance :**
- ☐ Chargement < 3s
- ☐ Animations 60fps
- ☐ Pas de freeze UI
- ☐ Scroll fluide
- ☐ Images chargées progressivement

**UX :**
- ☐ Tailles tactiles conformes
- ☐ Feedback immédiat
- ☐ Messages d'erreur clairs
- ☐ Loaders appropriés
- ☐ Gestes intuitifs

**Compatibilité :**
- ☐ iOS Safari
- ☐ Android Chrome
- ☐ Android Firefox
- ☐ Tablettes (iPad, Android)

---

## 🚀 ROADMAP D'IMPLÉMENTATION

### Phase 1 : Fondations (2 semaines) ✅ FAIT

- ✅ MobileStateService
- ✅ MobileBottomNavComponent
- ✅ MobileHeaderComponent
- ✅ MobileLayoutComponent
- ✅ Routing de base
- ✅ Design system (variables CSS)

### Phase 2 : Écrans principaux (3 semaines) ✅ FAIT

- ✅ MobileHomeComponent
- ✅ MobileLibraryComponent
- ✅ MobileTerrainComponent
- ✅ MobileProfileComponent

### Phase 3 : Détails et consultation (2 semaines) ✅ FAIT

- ✅ MobileDetailComponent
- ✅ CollapsibleSectionComponent
- ✅ MobileImageViewerComponent
- ✅ Favoris

### Phase 4 : Création et édition (3 semaines) 🔄 EN COURS

- ☐ MobileCreateComponent (formulaires simplifiés)
- ☐ MobileEditComponent (modal)
- ☐ ImageUploadMobileComponent
- ☐ TagSelectorMobileComponent
- ☐ Validation inline
- ☐ Sauvegarde brouillon

### Phase 5 : Mode terrain avancé (2 semaines)

- ☐ Progression entraînement
- ☐ Navigation exercices
- ☐ Alertes configurables
- ☐ Historique des temps
- ☐ Notes rapides
- ☐ Favoris rapides fonctionnels

### Phase 6 : Recherche et filtres (2 semaines)

- ☐ MobileSearchComponent
- ☐ Recherche globale
- ☐ Filtres avancés (bottom sheet)
- ☐ Historique recherches
- ☐ Suggestions
- ☐ Recherche vocale

### Phase 7 : Mode hors ligne (3 semaines)

- ☐ Service Worker
- ☐ IndexedDB storage
- ☐ Queue d'actions
- ☐ Synchronisation
- ☐ Résolution conflits
- ☐ Gestion espace stockage

### Phase 8 : Notifications (1 semaine)

- ☐ Permission request
- ☐ Notifications locales
- ☐ Notifications push (backend)
- ☐ Paramètres notifications
- ☐ Centre de notifications

### Phase 9 : Partage et collaboration (2 semaines)

- ☐ Web Share API
- ☐ Copie lien
- ☐ QR Code
- ☐ Export PDF
- ☐ Commentaires (futur)

### Phase 10 : Polish et optimisation (2 semaines)

- ☐ Performance audit
- ☐ Accessibility audit
- ☐ Tests E2E complets
- ☐ Animations polish
- ☐ Dark mode complet
- ☐ Documentation utilisateur

**Total estimé : 22 semaines (~5.5 mois)**

---

## 📚 RÉFÉRENCES

### Documentation technique
- [Angular Material](https://material.angular.io/)
- [Material Design Mobile](https://m3.material.io/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Inspiration design
- Notion Mobile
- Trello Mobile
- Google Keep
- Todoist
- Strava

---

**Document créé le :** 2026-02-18  
**Auteur :** Cascade AI  
**Basé sur :** Analyse vue desktop + État actuel mobile  
**Prochaine étape :** Implémentation Phase 4 (Création et édition)
