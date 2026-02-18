# ANALYSE EXHAUSTIVE DE LA VUE CLASSIQUE (DESKTOP)

**Date :** 2026-02-18  
**Statut :** WORK  
**Projet :** Ultimate Frisbee Manager  
**Objectif :** Documenter intégralement la vue desktop pour préparer la refonte mobile

---

## 📋 RÉSUMÉ EXÉCUTIF

Cette analyse exhaustive documente l'intégralité de la vue desktop d'Ultimate Frisbee Manager. L'application est une plateforme complète de gestion d'entraînements d'Ultimate Frisbee construite avec Angular 19, permettant aux entraîneurs de créer et gérer des exercices, entraînements, échauffements et situations de jeu.

**Points clés identifiés :**

### Architecture
- Angular 19 avec standalone components
- Lazy loading des modules fonctionnels
- Navigation principale avec dropdowns
- Guards de protection (Auth, Workspace, Mobile)
- Services réactifs (RxJS + BehaviorSubjects)

### Design System
- Palette de couleurs cohérente (gradients violets/bleus)
- Typographie hiérarchisée (2.5rem → 0.85rem)
- Espacements standardisés (système 4px)
- Composants réutilisables (cartes, formulaires, dialogs)

### Fonctionnalités
- **CRUD complet** : Exercices, Entraînements, Échauffements, Situations
- **Filtrage avancé** : Recherche + tags multi-catégories
- **Gestion collaborative** : Workspaces avec rôles (MANAGER, MEMBER, VIEWER)
- **Cache multi-niveaux** : Mémoire + IndexedDB + API
- **Permissions granulaires** : Lecture seule vs édition complète

### Système de cache
- **WorkspaceDataStore** : Store central réactif (BehaviorSubjects)
- **DataCacheService** : Cache multi-niveaux (mémoire → IndexedDB → API)
- **Stale-while-revalidate** : Affichage instantané + refresh en arrière-plan
- **Multi-workspace** : Conservation du cache entre workspaces

---

## 1. ARCHITECTURE TECHNIQUE

### 1.1 Stack et technologies

**Frontend :**
- Angular 19 (standalone components)
- Angular Material (UI components)
- RxJS (reactive programming)
- SCSS (styles)
- TypeScript

**Backend :**
- Node.js + Express
- Prisma ORM
- PostgreSQL (Supabase)

**Infrastructure :**
- Vercel (frontend + backend)
- Supabase Auth (authentification)
- Cloudinary (médias)

### 1.2 Structure des dossiers

```
frontend/src/app/
├── core/                    # Services, guards, models
│   ├── services/            # 35 services métier
│   ├── guards/              # AuthGuard, WorkspaceSelectedGuard, MobileGuard
│   ├── models/              # User, Exercice, Entrainement, etc.
│   ├── interceptors/        # HTTP interceptors
│   └── components/          # startup-loader, status-bubble
├── features/                # Modules fonctionnels (lazy loading)
│   ├── auth/                # Login, register, forgot-password
│   ├── dashboard/           # Tableau de bord
│   ├── exercices/           # CRUD exercices
│   ├── entrainements/       # CRUD entraînements
│   ├── echauffements/       # CRUD échauffements
│   ├── situations-matchs/   # CRUD situations
│   ├── tags-advanced/       # Gestion avancée tags
│   ├── settings/            # Profil, import/export
│   ├── admin/               # Administration
│   ├── workspaces/          # Gestion workspaces
│   └── mobile/              # Vue mobile actuelle (à refondre)
├── shared/                  # Composants réutilisables
│   ├── components/          # 30+ composants partagés
│   ├── styles/              # mobile-optimizations.scss (1072 lignes)
│   └── validators/          # Validateurs formulaires
└── app.component.ts         # Composant racine + navigation
```

### 1.3 Routing et guards

**Routes principales :**
- `/login` - Authentification (publique)
- `/select-workspace` - Sélection workspace (AuthGuard)
- `/dashboard` - Tableau de bord (AuthGuard + WorkspaceSelectedGuard + MobileGuard)
- `/exercices` - Liste exercices (AuthGuard + WorkspaceSelectedGuard + MobileGuard)
- `/entrainements` - Liste entraînements (idem)
- `/echauffements` - Liste échauffements (idem)
- `/situations-matchs` - Liste situations (idem)
- `/parametres` - Paramètres (idem)
- `/admin` - Administration (idem + rôle ADMIN)
- `/mobile` - Vue mobile (AuthGuard + WorkspaceSelectedGuard)

**Guards :**
- **AuthGuard** : Vérifie authentification
- **WorkspaceSelectedGuard** : Vérifie workspace sélectionné
- **MobileGuard** : Redirige vers `/mobile` si détection mobile (breakpoint 768px)

**MobileDetectorService :**
- Détecte si `window.innerWidth < 768px`
- Permet de forcer la vue desktop (`forceDesktop()`)
- Stockage dans localStorage (`ufm.forceDesktop`)

---

## 2. DESIGN SYSTEM

### 2.1 Couleurs

**Palette principale :**
```scss
// Gradients
--header-gradient: linear-gradient(135deg, #2c3e50, #34495e);
--card-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--workspace-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--action-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

// Texte
--text-primary: #2c3e50;
--text-secondary: #7f8c8d;
--text-muted: #666;

// Bordures
--border-color: #e9ecef;
--separator-color: #ecf0f1;

// Fond
--background-light: #f8f9fa;
--background-white: #fff;

// Sémantiques
--primary: #3498db;
--success: #2e7d32;
--warning: #FFA726;
--danger: #dc3545;
--info: #2196F3;
```

### 2.2 Typographie

```scss
// Tailles
--font-size-h1: 2.5rem;      // Titres principaux
--font-size-h2: 1.8rem;      // Sous-titres
--font-size-h3: 1.5rem;      // Titres sections
--font-size-body: 1rem;      // Texte normal
--font-size-small: 0.9rem;   // Texte secondaire
--font-size-tiny: 0.85rem;   // Métadonnées

// Poids
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 2.3 Espacements

```scss
--spacing-xs: 0.25rem;   // 4px
--spacing-sm: 0.5rem;    // 8px
--spacing-md: 1rem;      // 16px
--spacing-lg: 1.5rem;    // 24px
--spacing-xl: 2rem;      // 32px
--spacing-xxl: 3rem;     // 48px

// Padding cartes
--card-padding: 20px;

// Gaps
--gap-sm: 8px;
--gap-md: 12px;
--gap-lg: 16px;
```

### 2.4 Bordures et ombres

```scss
// Bordures
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
--border-radius-xl: 16px;
--border-radius-pill: 20px;

// Ombres
--shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
--shadow-md: 0 4px 15px rgba(0,0,0,0.1);
--shadow-lg: 0 8px 25px rgba(0,0,0,0.15);
--shadow-hover: 0 8px 25px rgba(0,0,0,0.2);
```

### 2.5 Breakpoints

```scss
--mobile-breakpoint: 768px;
--tablet-breakpoint: 1024px;
--desktop-breakpoint: 1200px;
```

---

## 3. NAVIGATION PRINCIPALE

### 3.1 Header desktop

**Structure :**
```html
<header class="main-header">
  <div class="appbar">
    <div class="appbar__left">
      <h1>Ultimate Frisbee Manager</h1>
      <span class="badge badge-base" *ngIf="isBaseWorkspace">BASE</span>
    </div>
    <nav class="main-nav">
      <ul>
        <li><a routerLink="/">Tableau de bord</a></li>
        <li class="dropdown">Exercices</li>
        <li class="dropdown">Entraînements</li>
        <li class="dropdown">Échauffements</li>
        <li class="dropdown">Situations/Matchs</li>
        <li class="dropdown">Paramètres (avatar)</li>
      </ul>
    </nav>
  </div>
</header>
```

**Menus déroulants :**
- **Exercices** : Tous les exercices, Ajouter un exercice
- **Entraînements** : Tous les entraînements, Nouvel entraînement
- **Échauffements** : Tous les échauffements, Nouvel échauffement
- **Situations/Matchs** : Toutes les situations, Nouvelle situation
- **Paramètres** : Dashboard Admin, Import/Export, Profil, Déconnexion

**Comportement :**
- Fermeture automatique au clic en dehors
- Un seul menu ouvert à la fois
- Backdrop semi-transparent
- Fermeture lors de la navigation

---

## 4. PAGES PRINCIPALES

### 4.1 Dashboard (`/dashboard`)

**Sections :**

1. **Workspace header** (gradient violet)
   - Icône workspace
   - Nom du workspace
   - Rôle utilisateur (badge)
   - Bouton "Changer d'espace"

2. **Bienvenue**
   - Titre "Ultimate Frisbee Manager"
   - Sous-titre "Tableau de bord principal"

3. **Bases de données** (grid 4 colonnes)
   - Carte Exercices (🏃‍♂️) + compteur
   - Carte Entraînements (📋) + compteur
   - Carte Échauffements (🔥) + compteur
   - Carte Situations/Matchs (🥏) + compteur

4. **Actions rapides**
   - Carte "Ajouter" (menu déroulant)
   - Carte "Gérer les tags"

5. **Aperçu (stats)**
   - Total d'éléments
   - Tags créés
   - Ajouts récents (7 jours)

**Responsive :**
- Grid 4 → 2 colonnes (mobile)
- Stats 3 → 1 colonne (mobile)

### 4.2 Liste des exercices (`/exercices`)

**Header :**
- Titre "Base de données d'exercices"
- Bouton "Ajouter un exercice" (si permissions)

**Filtres (`ExerciceFiltersComponent`) :**
- Barre de recherche
- Filtres par tags :
  - Objectif (multi-sélection)
  - Travail spécifique (multi-sélection)
  - Niveau (multi-sélection)
  - Temps (multi-sélection)
  - Format (multi-sélection)
- Tags sélectionnés (chips supprimables)

**Liste (grid 3 colonnes) :**
- Cartes d'exercices (`ExerciceCardComponent`)
- Nom, image, description, tags, durée
- Boutons : Voir, Éditer, Dupliquer, Supprimer

**Fonctionnalités :**
- Chargement depuis `WorkspaceDataStore`
- Filtrage temps réel
- Actions CRUD
- Permissions (VIEWER, MEMBER, MANAGER)

### 4.3 Liste des entraînements (`/entrainements`)

**Structure similaire aux exercices :**
- Header + bouton "Nouvel entraînement"
- Filtres : Recherche + Thème d'entraînement
- Grid 2 colonnes
- Cartes avec :
  - Titre, image, badge "ENTRAÎNEMENT"
  - Durée totale (calculée)
  - Date, thèmes
  - Nombre d'exercices
  - Échauffement (nom + icône)
  - Situation/Match (nom + icône)
  - Boutons d'action

### 4.4 Liste des échauffements (`/echauffements`)

**Structure :**
- Header + bouton "Nouvel échauffement"
- Filtre recherche
- Grid cartes
- Nom, nombre de blocs, durée totale
- Boutons d'action

### 4.5 Liste des situations (`/situations-matchs`)

**Structure :**
- Header + bouton "Nouvelle situation"
- Filtre recherche
- Grid cartes
- Nom, type (badge), durée, description
- Boutons d'action

---

## 5. COMPOSANTS RÉUTILISABLES

### 5.1 Cartes

**ExerciceCardComponent**
- Props : `exercice`, `canEdit`
- Events : `exerciceDeleted`, `exerciceDuplicated`, `exerciceUpdated`
- Affichage : Header, image, description, tags, durée, métadonnées

**ContentCardComponent**
- Composant générique pour cartes de contenu
- Props : `title`, `description`, `imageUrl`, `tags`, `actions`

### 5.2 Formulaires

**ExerciceFiltersComponent**
- Props : Tags par catégorie, `show` (contrôle visibilité)
- Events : `filtersChange`
- Éléments : Recherche, dropdowns, chips

**TagSelectMultiComponent**
- Sélection multiple de tags
- Props : `tags`, `selectedTags`, `category`, `label`
- Events : `tagsChange`

**ImageUploadComponent**
- Upload vers Cloudinary
- Props : `imageUrl`, `label`, `maxSize`
- Events : `imageChange`

**RichTextEditorComponent**
- Éditeur de texte riche
- Props : `content`, `label`, `placeholder`
- Events : `contentChange`

### 5.3 Dialogs

**ConfirmationDialogComponent**
- Dialog de confirmation générique
- Props : `title`, `message`, `confirmLabel`, `cancelLabel`, `confirmColor`

**ExerciceSelectorComponent**
- Sélection d'exercices depuis liste
- Props : `selectedExercices`, `multiple`
- Events : `exercicesChange`

### 5.4 Visualisation

**ExerciceViewComponent**
- Affichage complet exercice (lecture seule)
- Props : `exercice`, `readonly`

**RichTextViewComponent**
- Affichage HTML riche
- Props : `content`

**ImageViewerComponent**
- Galerie d'images avec navigation
- Props : `images`, `currentIndex`
- Events : `indexChange`

---

## 6. SERVICES ET GESTION DE L'ÉTAT

### 6.1 WorkspaceDataStore (Store central)

**Responsabilités :**
- Synchroniser l'état frontend avec le backend
- Exposer des BehaviorSubjects pour partager l'état
- Calculer les stats dashboard localement

**Observables exposés :**
```typescript
exercices$: Observable<Exercice[]>
entrainements$: Observable<Entrainement[]>
echauffements$: Observable<Echauffement[]>
situations$: Observable<SituationMatch[]>
tags$: Observable<Tag[]>
stats$: Observable<DashboardStats>
loading$: Observable<boolean>
error$: Observable<string | null>
```

**Méthodes :**
- `setExercices(exercices: Exercice[]): void`
- `setEntrainements(entrainements: Entrainement[]): void`
- `setEchauffements(echauffements: Echauffement[]): void`
- `setSituations(situations: SituationMatch[]): void`
- `setTags(tags: Tag[]): void`
- `setLoading(loading: boolean): void`
- `setError(error: string | null): void`
- `clearAll(): void`

**Architecture :**
```
Backend (PostgreSQL) → Services métier → WorkspaceDataStore → Composants
```

### 6.2 DataCacheService (Cache multi-niveaux)

**Stratégie de cache :**
1. **Mémoire** (Map JavaScript) - ultra-rapide
2. **IndexedDB** (persistant) - survit aux rechargements
3. **API** (backend) - source de vérité

**Configuration TTL :**
```typescript
exercices: 5 min
entrainements: 5 min
echauffements: 5 min
situations: 5 min
tags: 30 min
workspaces: 1h
auth: 24h
```

**Stale-while-revalidate :**
- Affichage instantané depuis cache
- Refresh en arrière-plan si données "vieilles"
- Seuil de revalidation : 2 min (données métier)

**Multi-workspace :**
- Cache conservé entre workspaces
- Retour instantané au workspace précédent
- Nettoyage LRU automatique

### 6.3 Services métier

**ExerciceService**
- CRUD exercices
- Méthodes : `getExercices()`, `getExerciceById()`, `createExercice()`, `updateExercice()`, `deleteExercice()`, `duplicateExercice()`

**EntrainementService**
- CRUD entraînements
- Méthodes similaires

**EchauffementService**
- CRUD échauffements
- Méthodes similaires

**SituationMatchService**
- CRUD situations/matchs
- Méthodes similaires

**TagService**
- CRUD tags
- Méthodes : `getTags()`, `createTag()`, `updateTag()`, `deleteTag()`

### 6.4 Services d'authentification

**AuthService**
- Authentification Supabase
- Observables : `currentUser$`, `isAuthenticated$`
- Méthodes : `login()`, `logout()`, `register()`, `resetPassword()`

**WorkspaceService**
- Gestion workspaces
- Observables : `currentWorkspace$`, `workspaceChanging$`
- Méthodes : `getMyWorkspaces()`, `setCurrentWorkspace()`, `createWorkspace()`

**PermissionsService**
- Vérification permissions
- Méthodes : `canWrite()`, `canRead()`, `isManager()`, `isMember()`, `isViewer()`, `isBaseWorkspace()`

---

## 7. SYSTÈME DE PERMISSIONS

### 7.1 Rôles

**VIEWER** (Lecteur)
- Lecture seule
- Pas de création/édition/suppression
- Boutons d'action masqués

**MEMBER** (Membre)
- Lecture + création
- Édition de ses propres éléments
- Pas de suppression

**MANAGER** (Gestionnaire)
- Toutes les actions
- Création, édition, suppression
- Gestion des membres du workspace
- Suppression du workspace

**ADMIN** (Administrateur)
- Accès au workspace BASE
- Administration globale
- Gestion des utilisateurs
- Import/export

### 7.2 Workspace BASE

**Caractéristiques :**
- Réservé aux administrateurs
- Badge orange "BASE" dans le header
- Contient les exercices/entraînements de référence
- Visible par tous, éditable uniquement par ADMIN

---

## 8. FONCTIONNALITÉS AVANCÉES

### 8.1 Filtrage et recherche

**Recherche textuelle :**
- Recherche dans nom, description
- Debounce 300ms
- Insensible à la casse

**Filtrage par tags :**
- Multi-sélection par catégorie
- Logique AND (tous les tags sélectionnés)
- Chips supprimables
- Réinitialisation rapide

### 8.2 Duplication

**Fonctionnalité :**
- Copie complète d'un élément
- Ajout de "(copie)" au nom
- Conservation des tags, images, contenu
- Nouvelle date de création

**Implémentation :**
- Bouton "Dupliquer" sur chaque carte
- Loader pendant la duplication
- Message de succès/erreur
- Rechargement de la liste

### 8.3 Import/Export

**Export :**
- Format JSON
- Export par type (exercices, entraînements, etc.)
- Export complet (tous les types)
- Téléchargement automatique

**Import :**
- Upload de fichier JSON
- Validation du format
- Options :
  - Remplacer données existantes
  - Fusionner avec données existantes
  - Créer nouveaux éléments uniquement
- Logs d'import (succès/erreurs)

### 8.4 Gestion des images

**Upload :**
- Service : Cloudinary
- Formats acceptés : JPG, PNG, GIF, WEBP
- Taille max : 5 Mo
- Prévisualisation avant upload
- Compression automatique

**Affichage :**
- Images responsive
- Lazy loading
- Galerie avec navigation
- Zoom sur clic

---

## 9. RESPONSIVE DESIGN

### 9.1 Breakpoints

```scss
Mobile : < 768px
Tablet : 768px - 1024px
Desktop : > 1024px
```

### 9.2 Adaptations mobile (desktop responsive)

**Navigation :**
- Dropdowns → Accordéons
- Menu horizontal → Menu vertical

**Grids :**
- 4 colonnes → 2 colonnes → 1 colonne
- 3 colonnes → 2 colonnes → 1 colonne

**Cartes :**
- Header : Flex column (mobile)
- Actions : Centré (mobile)
- Padding réduit

**Formulaires :**
- Champs pleine largeur
- Labels au-dessus des champs
- Boutons pleine largeur

### 9.3 MobileGuard

**Comportement :**
- Détection automatique (< 768px)
- Redirection vers `/mobile`
- Option "Forcer desktop" (localStorage)
- Snackbar "Version desktop disponible" (resize)

---

## 10. CONCLUSION

### 10.1 Points forts de la vue desktop

✅ **Architecture solide** : Angular 19, lazy loading, standalone components  
✅ **Design cohérent** : Palette de couleurs, typographie, espacements standardisés  
✅ **Composants réutilisables** : 30+ composants partagés  
✅ **Cache performant** : Multi-niveaux (mémoire + IndexedDB + API)  
✅ **Permissions granulaires** : Rôles VIEWER, MEMBER, MANAGER, ADMIN  
✅ **Fonctionnalités complètes** : CRUD, filtrage, duplication, import/export  
✅ **Responsive** : Adaptations mobile (mais limitées)

### 10.2 Limites pour l'usage mobile

❌ **Navigation trop dense** : Dropdowns inadaptés au tactile  
❌ **Affichage surchargé** : Trop d'informations simultanées  
❌ **Formulaires complexes** : Champs multiples, éditeur riche  
❌ **Interactions desktop** : Hover, drag & drop  
❌ **Tailles tactiles insuffisantes** : Boutons < 44px  
❌ **Pas de gestes tactiles** : Swipe, pull-to-refresh  
❌ **Pas de mode hors ligne** : Dépendance au réseau

### 10.3 Opportunités pour la refonte mobile

🎯 **Simplifier la navigation** : Bottom nav, hamburger menu  
🎯 **Prioriser le contenu** : Affichage progressif, focus terrain  
🎯 **Optimiser les formulaires** : Champs essentiels, validation inline  
🎯 **Adapter les interactions** : Gestes tactiles, feedback immédiat  
🎯 **Améliorer la persistance** : Cache agressif, mode hors ligne  
🎯 **Réutiliser les composants** : Adapter plutôt que recréer

---

**Document créé le :** 2026-02-18  
**Prochaine étape :** Proposition de refonte mobile (`20260218_PROPOSITION_VUE_MOBILE.md`)
