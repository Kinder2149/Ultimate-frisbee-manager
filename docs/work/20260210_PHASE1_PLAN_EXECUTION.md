# PHASE 1 — PLAN D'EXÉCUTION DÉTAILLÉ

**Statut** : WORK  
**Date** : 2026-02-10  
**Document parent** : `docs/work/20260210_PLAN_MODIFICATION_MOBILE.md`  
**Phase 0** : VALIDÉE  
**Nature** : Plan d'exécution — aucun code

---

## ORDRE D'EXÉCUTION

Les étapes sont numérotées dans l'ordre strict d'exécution. Chaque étape dépend des précédentes.

```
Étape 1 : mobile-variables.scss           (aucune dépendance)
Étape 2 : mobile.routes.ts                (aucune dépendance)
Étape 3 : MobileLayoutComponent           (dépend de 2)
Étape 4 : MobileHomeComponent             (dépend de 1, 3)
Étape 5 : MobileFeedCardComponent          (dépend de 1)
Étape 6 : MobileSearchBarComponent         (dépend de 1)
Étape 7 : MobileConfirmDialogComponent     (dépend de 1)
Étape 8 : MobileDetailComponent (page)     (dépend de 1, 2)
Étape 9 : Remplacement du ContentFeed      (dépend de 5)
Étape 10 : Intégration dans MobileHome     (dépend de 4, 5, 6, 7, 8, 9)
Étape 11 : Modification du routing app     (dépend de 2, 3)
Étape 12 : Validation globale              (dépend de toutes)
```

---

## ÉTAPE 1 — Créer `mobile-variables.scss`

### Objectif

Créer la source de vérité unique pour les constantes visuelles mobile (D-05).

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/shared/styles/mobile-variables.scss` | **CRÉER** |
| `frontend/src/app/shared/styles/global-theme.scss` | **LIRE UNIQUEMENT** — source des couleurs de référence |

### Dépendances

Aucune. C'est la première étape car tous les composants mobile créés ensuite importeront ce fichier.

### Contenu attendu

- Variables CSS pour les couleurs par type de contenu, dérivées de `global-theme.scss` :
  - `--mobile-exercice-color` ← alignée sur `--exercice-color` (`#3498db`)
  - `--mobile-entrainement-color` ← alignée sur `--primary-color` (`#3498db`) — à distinguer visuellement de exercice
  - `--mobile-echauffement-color` ← alignée sur `--echauffement-color` (`#FF9800`)
  - `--mobile-situation-color` ← alignée sur `--situation-color` (`#4CAF50`)
- Variables pour la typographie mobile (tailles titre, body, meta, date)
- Variables pour les espacements mobile
- Variable pour le touch-target minimum : `--mobile-touch-target: 44px`
- Variables pour le header mobile (hauteur, background)
- Variables pour les couleurs de fond et de texte mobile

### Risques

- **Risque** : choisir des couleurs qui divergent de `global-theme.scss`. **Mitigation** : dériver systématiquement de `global-theme.scss`, documenter la correspondance.
- **Risque** : `--mobile-exercice-color` et `--mobile-entrainement-color` identiques (toutes deux `#3498db` dans `global-theme.scss`). **Mitigation** : l'entraînement n'a pas de variable dédiée dans `global-theme.scss`. Définir une couleur distincte dans `mobile-variables.scss` et la documenter comme choix mobile.

### Critères de validation

- [ ] Le fichier existe dans `shared/styles/`
- [ ] Toutes les couleurs par type de contenu sont définies
- [ ] Aucune couleur n'est inventée sans correspondance documentée avec `global-theme.scss`
- [ ] Le fichier est importable depuis n'importe quel composant de `features/mobile/`

---

## ÉTAPE 2 — Créer `mobile.routes.ts`

### Objectif

Définir le routing mobile avec children (D-01). Fichier de routes dédié, chargé en lazy-loading depuis `app.module.ts`.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/mobile.routes.ts` | **CRÉER** |

### Dépendances

Aucune pour la création du fichier. Les composants référencés (`MobileLayoutComponent`, `MobileHomeComponent`, `MobileDetailComponent`) seront créés aux étapes suivantes. Le fichier de routes les importera dynamiquement via `loadComponent`.

### Contenu attendu

- Route parent `''` avec `MobileLayoutComponent` comme composant
- Children :
  - `''` → `MobileHomeComponent` (lazy-loaded)
  - `'detail/:type/:id'` → `MobileDetailComponent` (lazy-loaded)

### Risques

- **Risque** : erreur de compilation si les composants référencés n'existent pas encore. **Mitigation** : les imports utilisent `loadComponent` avec `import()` dynamique. Le fichier compilera même si les composants n'existent pas encore (erreur au runtime, pas au build). Les composants seront créés avant l'intégration dans `app.module.ts` (étape 11).

### Critères de validation

- [ ] Le fichier existe dans `features/mobile/`
- [ ] La structure parent/children est correcte
- [ ] Les imports sont dynamiques (`loadComponent` avec `import()`)
- [ ] Les paths sont `''` et `'detail/:type/:id'`

---

## ÉTAPE 3 — Créer `MobileLayoutComponent`

### Objectif

Créer le layout shell mobile : header fixe + `<router-outlet>` (D-01). Ce composant remplace la partie "layout" de l'actuel `MobilePageComponent`.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/mobile-layout.component.ts` | **CRÉER** |
| `frontend/src/app/features/mobile/mobile-layout.component.html` | **CRÉER** |
| `frontend/src/app/features/mobile/mobile-layout.component.scss` | **CRÉER** |

### Dépendances

- Étape 2 (routing) : le layout est référencé dans `mobile.routes.ts`
- `MobileHeaderComponent` existant : importé dans le layout (le header existant est conservé tel quel en Phase 1, refactorisé en Phase 2)

### Contenu attendu

- Composant standalone
- Template : `<app-mobile-header>` + `<router-outlet>`
- Le header reçoit les mêmes inputs que dans l'actuel `MobilePageComponent` : `currentUser`, `returnUrl`
- Le header émet les mêmes outputs : `searchClick`, `settingsClick`, `profileClick`, `tagsClick`, `adminClick`, `logoutClick`
- Le layout gère : `currentUser` (via `AuthService`), `returnUrl` (via `ActivatedRoute`), les handlers de logout et desktop suggestion
- SCSS : `min-height: 100vh`, `background-color` alignée sur `mobile-variables.scss`, `padding-top` pour le header fixe

### Risques

- **Risque** : dupliquer la logique de `MobilePageComponent` au lieu de l'extraire. **Mitigation** : le layout ne gère QUE le header, l'utilisateur courant, le logout et le resize listener. Toute logique de données (feed, filtres, tri) reste dans `MobileHomeComponent`.
- **Risque** : le `MobileHeaderComponent` existant émet `searchClick` mais la recherche sera gérée dans `MobileHomeComponent`, pas dans le layout. **Mitigation** : le layout transmet l'événement `searchClick` au child via un service ou un output. En Phase 1, la recherche inline (`MobileSearchBarComponent`) est intégrée dans `MobileHomeComponent`, pas dans le header. L'événement `searchClick` du header est conservé temporairement pour toggler la visibilité de la search bar dans la home.

### Critères de validation

- [ ] Le composant est standalone
- [ ] Le template contient `<app-mobile-header>` et `<router-outlet>`
- [ ] Le layout gère `currentUser`, `returnUrl`, logout, resize listener
- [ ] Le layout ne contient AUCUNE logique de feed, filtres, tri ou données
- [ ] Le SCSS importe `mobile-variables.scss`

---

## ÉTAPE 4 — Créer `MobileHomeComponent`

### Objectif

Créer la page d'accueil mobile (feed). Ce composant reprend la logique de données et de filtrage de l'actuel `MobilePageComponent`, sans la partie layout/header.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.ts` | **CRÉER** |
| `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.html` | **CRÉER** |
| `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.scss` | **CRÉER** |

### Dépendances

- Étape 1 (`mobile-variables.scss`) : importé dans le SCSS
- Étape 3 (`MobileLayoutComponent`) : la home est un child du layout

### Contenu attendu

**Logique reprise de `MobilePageComponent`** (lignes 51-320 actuelles) :
- Propriétés : `exercices`, `entrainements`, `echauffements`, `situationsMatchs`, `activeCategory`, `sortOrder`, `searchQuery`, `loading`, `error`
- Méthodes : `loadAllData()`, `transformToContentItems()`, `applyFilters()`, `calculateCategoryCount()`, `calculateDureeEntrainement()`
- Getters : `allItems`, `filteredItems`, `categoryCount`

**Logique reprise de `MobilePageComponent`** (lignes 322-505 actuelles) :
- `onCategoryChange()`, `onSortChange()`
- `onItemView()` → **MODIFIÉ** : navigue vers `/mobile/detail/:type/:id` au lieu d'ouvrir des dialogs desktop (D-07)
- `onItemEdit()` → **MODIFIÉ** : navigue vers `/mobile/detail/:type/:id` avec un paramètre `mode=edit` ou affiche un snackbar "Édition non disponible en mobile" (hors périmètre Phase 1 = pas d'édition mobile)
- `onItemDuplicate()` → conservé tel quel
- `onItemDelete()` → **MODIFIÉ** : utilise `MobileConfirmDialogComponent` au lieu de `confirm()` (D-08)
- `onSearchClick()` → **SUPPRIMÉ** : remplacé par `MobileSearchBarComponent` avec binding bidirectionnel sur `searchQuery`

**Logique NON reprise** (reste dans le layout) :
- `currentUser`, `loadCurrentUser()`, `returnUrl`, `loadReturnUrl()`
- `setupResizeListener()`, `showDesktopSuggestion()`
- `onLogoutClick()`, `onSettingsClick()`, `onProfileClick()`, `onTagsClick()`, `onAdminClick()`

**Template** :
- `<app-mobile-search-bar>` (conditionnel, togglé par un bouton)
- `<app-mobile-filter-bar>` (conservé tel quel en Phase 1)
- `<app-content-feed>` → **remplacé par** une boucle sur `<app-mobile-feed-card>` (étape 9)
- Le hero contextuel est **supprimé** du template (D-10 : suppression actée)

**Imports** :
- `MobileSearchBarComponent` (étape 6)
- `MobileFilterBarComponent` (existant, conservé)
- `MobileFeedCardComponent` (étape 5)
- `MobileConfirmDialogComponent` (étape 7)
- Services desktop : `ExerciceService`, `EntrainementService`, `EchauffementService`, `SituationMatchService`
- `Router` pour la navigation vers le détail
- **PAS** d'import de `ExerciceCardComponent`, `EntrainementDetailComponent`, `EchauffementViewComponent`, `SituationMatchViewComponent`, `ExerciceDialogService`, `DialogService`, `MatDialog` (D-02, D-07)

### Risques

- **Risque** : oublier de supprimer un import desktop. **Mitigation** : vérifier que le fichier n'importe rien depuis `features/exercices/`, `features/entrainements/`, `features/echauffements/`, `features/situations-matchs/`, ni `MatDialog`, ni `DialogService`, ni `ExerciceDialogService`.
- **Risque** : régression du feed si la logique de transformation est mal recopiée. **Mitigation** : la logique `transformToContentItems()` et `applyFilters()` est reprise à l'identique de `MobilePageComponent` (lignes 202-285).

### Critères de validation

- [ ] Le composant est standalone
- [ ] Aucun import depuis `features/exercices/`, `features/entrainements/`, `features/echauffements/`, `features/situations-matchs/`
- [ ] Aucun import de `MatDialog`, `DialogService`, `ExerciceDialogService`
- [ ] Aucun appel à `prompt()` ou `confirm()`
- [ ] `onItemView()` navigue vers `/mobile/detail/:type/:id`
- [ ] Le hero contextuel n'est PAS dans le template
- [ ] Le SCSS importe `mobile-variables.scss`

---

## ÉTAPE 5 — Créer `MobileFeedCardComponent`

### Objectif

Créer la carte mobile unifiée pour le feed (D-02, D-09). Un seul composant pour tous les types de contenu. Remplace `ExerciceCardComponent` (desktop) et les `mat-card` inline du feed actuel.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/components/mobile-feed-card/mobile-feed-card.component.ts` | **CRÉER** |
| `frontend/src/app/features/mobile/components/mobile-feed-card/mobile-feed-card.component.html` | **CRÉER** |
| `frontend/src/app/features/mobile/components/mobile-feed-card/mobile-feed-card.component.scss` | **CRÉER** |

### Dépendances

- Étape 1 (`mobile-variables.scss`) : importé dans le SCSS

### Contenu attendu

**Inputs** :
- `item: ContentItem` — l'item à afficher
- `duplicating: boolean` — état de duplication en cours

**Outputs** :
- `cardClick` — tap sur la carte → navigation vers le détail
- `viewClick` — action "Voir" depuis le menu ⋮
- `duplicateClick` — action "Dupliquer" depuis le menu ⋮
- `deleteClick` — action "Supprimer" depuis le menu ⋮

**Template** :
- Carte avec bordure gauche colorée par type (couleur via `mobile-variables.scss`)
- Titre de l'item
- Badge/icône indiquant le type (exercice, entraînement, échauffement, situation)
- Métadonnées : durée (si disponible), nombre de blocs (si disponible), date de création
- Tags (2 max + "+N", comme actuellement)
- Bouton ⋮ (menu contextuel) avec actions : Voir, Dupliquer, Supprimer (D-09)
- Tous les touch-targets ≥ 44×44px
- Tap sur la carte (hors bouton ⋮) → émet `cardClick`

**SCSS** :
- Importe `mobile-variables.scss`
- Aucune couleur hardcodée
- Touch-targets via `min-width: var(--mobile-touch-target); min-height: var(--mobile-touch-target)`

### Risques

- **Risque** : la carte est trop complexe pour Phase 1. **Mitigation** : pas de rich-text, pas d'image, pas de description longue en Phase 1. Titre + type + meta + tags + actions. Le rich-text et les images sont Phase 2.
- **Risque** : le `mat-menu` du bouton ⋮ ne fonctionne pas bien sur mobile. **Mitigation** : `mat-menu` Angular Material est conçu pour le mobile. Tester le comportement tactile.

### Critères de validation

- [ ] Le composant est standalone
- [ ] Un seul template pour les 4 types de contenu
- [ ] Le bouton ⋮ ouvre un `mat-menu` avec les actions
- [ ] Tous les touch-targets ≥ 44×44px
- [ ] Aucune couleur hardcodée — tout passe par `mobile-variables.scss`
- [ ] Aucun import depuis `features/exercices/` ou autre feature desktop
- [ ] Pas de `RichTextViewComponent` (Phase 2)

---

## ÉTAPE 6 — Créer `MobileSearchBarComponent`

### Objectif

Créer le composant de recherche inline (D-08). Remplace `prompt()`.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/components/mobile-search-bar/mobile-search-bar.component.ts` | **CRÉER** |
| `frontend/src/app/features/mobile/components/mobile-search-bar/mobile-search-bar.component.html` | **CRÉER** |
| `frontend/src/app/features/mobile/components/mobile-search-bar/mobile-search-bar.component.scss` | **CRÉER** |

### Dépendances

- Étape 1 (`mobile-variables.scss`)

### Contenu attendu

**Inputs** :
- `query: string` — valeur initiale de la recherche

**Outputs** :
- `queryChange: EventEmitter<string>` — émis à chaque changement (debounce 300ms)
- `close: EventEmitter<void>` — émis quand l'utilisateur ferme la barre

**Template** :
- Champ `<input>` avec placeholder "Rechercher..."
- Icône de recherche (mat-icon `search`)
- Bouton d'effacement (mat-icon `close`) visible si `query` non vide
- Indicateur visuel si une recherche est active (badge ou couleur)
- Focus automatique à l'ouverture

**SCSS** :
- Importe `mobile-variables.scss`
- Hauteur ≥ 44px (touch-target)
- Largeur 100% du conteneur parent

### Risques

- **Risque** : le debounce crée un décalage perceptible. **Mitigation** : 300ms est un standard acceptable. L'input affiche la valeur en temps réel, seul l'output est debounced.

### Critères de validation

- [ ] Le composant est standalone
- [ ] Aucun appel à `prompt()`
- [ ] Le champ a un debounce sur l'output
- [ ] Le bouton d'effacement fonctionne
- [ ] Le SCSS importe `mobile-variables.scss`
- [ ] Touch-target ≥ 44px

---

## ÉTAPE 7 — Créer `MobileConfirmDialogComponent`

### Objectif

Créer le composant de confirmation mobile (D-08). Remplace `confirm()`.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/components/mobile-confirm-dialog/mobile-confirm-dialog.component.ts` | **CRÉER** |
| `frontend/src/app/features/mobile/components/mobile-confirm-dialog/mobile-confirm-dialog.component.html` | **CRÉER** |
| `frontend/src/app/features/mobile/components/mobile-confirm-dialog/mobile-confirm-dialog.component.scss` | **CRÉER** |

### Dépendances

- Étape 1 (`mobile-variables.scss`)

### Contenu attendu

**Approche** : bottom-sheet Angular Material (`MatBottomSheet`) ou `MatDialog` avec `panelClass` mobile.

**Données injectées** :
- `title: string` — titre de la confirmation (ex : "Supprimer l'élément")
- `message: string` — message (ex : "Êtes-vous sûr de vouloir supprimer 'Mon exercice' ?")
- `confirmLabel: string` — texte du bouton de confirmation (ex : "Supprimer")
- `cancelLabel: string` — texte du bouton d'annulation (ex : "Annuler")
- `confirmColor: 'warn' | 'primary'` — couleur du bouton de confirmation

**Retour** : `boolean` (true = confirmé, false = annulé)

**Template** :
- Titre
- Message
- Deux boutons : Annuler (secondaire) + Confirmer (couleur warn pour suppression)
- Touch-targets ≥ 44×44px

### Risques

- **Risque** : le `MatBottomSheet` n'est pas importé dans le projet. **Mitigation** : vérifier la présence de `@angular/material/bottom-sheet` dans les dépendances. Si absent, utiliser `MatDialog` avec une `panelClass` adaptée au mobile.

### Critères de validation

- [ ] Le composant est standalone
- [ ] Aucun appel à `confirm()` natif
- [ ] Retourne un `boolean` via `MatDialogRef` ou `MatBottomSheetRef`
- [ ] Touch-targets ≥ 44×44px
- [ ] Le SCSS importe `mobile-variables.scss`

---

## ÉTAPE 8 — Créer `MobileDetailComponent` (page)

### Objectif

Créer la page de détail d'un item (D-07). Remplace les dialogues desktop. Accessible via la route `detail/:type/:id`.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail.component.ts` | **CRÉER** |
| `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail.component.html` | **CRÉER** |
| `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail.component.scss` | **CRÉER** |

### Dépendances

- Étape 1 (`mobile-variables.scss`)
- Étape 2 (`mobile.routes.ts`) : la page est référencée comme child route `detail/:type/:id`

### Contenu attendu

**Logique** :
- Récupère `type` et `id` depuis `ActivatedRoute.params`
- Charge l'item via le service desktop correspondant (`ExerciceService.getExerciceById()`, etc.)
- Transforme en `ContentItem` (même logique que `transformToContentItems()` mais pour un seul item)
- Affiche le détail

**Template** :
- Bouton retour (mat-icon `arrow_back`) → `router.navigate(['/mobile'])` ou `location.back()`
- Titre de l'item
- Badge type (icône + label + couleur)
- Description (texte brut en Phase 1, rich-text en Phase 2)
- Tags (liste complète)
- Métadonnées : durée, nombre de blocs, date de création
- Image (si disponible)
- Actions : Dupliquer, Supprimer (via boutons en bas de page, touch-targets ≥ 44px)

**Imports** :
- Services desktop : `ExerciceService`, `EntrainementService`, `EchauffementService`, `SituationMatchService` (injection, pas import de composants)
- `MobileConfirmDialogComponent` (pour la suppression)
- `Router`, `ActivatedRoute`
- **PAS** de composant desktop

### Risques

- **Risque** : le chargement par ID échoue si l'item n'existe plus. **Mitigation** : gérer l'erreur avec un message "Élément introuvable" et un bouton retour.
- **Risque** : la description contient du HTML (rich-text) qui s'affiche mal en texte brut. **Mitigation** : en Phase 1, afficher le HTML brut strippé (texte uniquement). Le rendu rich-text mobile est Phase 2.

### Critères de validation

- [ ] Le composant est standalone
- [ ] Aucun import de composant desktop
- [ ] Le bouton retour fonctionne
- [ ] Le chargement par ID fonctionne pour les 4 types
- [ ] L'erreur "introuvable" est gérée
- [ ] Le SCSS importe `mobile-variables.scss`
- [ ] Touch-targets ≥ 44px pour les actions

---

## ÉTAPE 9 — Remplacer le ContentFeed

### Objectif

Supprimer l'import de `ExerciceCardComponent` et les `mat-card` inline du feed actuel. Les remplacer par `MobileFeedCardComponent` (D-02).

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/components/content-feed/content-feed.component.ts` | **MODIFIER** |
| `frontend/src/app/features/mobile/components/content-feed/content-feed.component.html` | **MODIFIER** |

### Dépendances

- Étape 5 (`MobileFeedCardComponent`)

### Contenu attendu

**Dans `content-feed.component.ts`** :
- **Supprimer** les imports : `ExerciceCardComponent`, `DuplicateButtonComponent`, `RichTextViewComponent`
- **Supprimer** du tableau `imports` : `ExerciceCardComponent`, `DuplicateButtonComponent`, `RichTextViewComponent`
- **Ajouter** l'import : `MobileFeedCardComponent`
- **Ajouter** au tableau `imports` : `MobileFeedCardComponent`
- **Supprimer** les méthodes spécifiques exercice : `onDeleteExercice()`, `onDuplicateExercice()`
- **Supprimer** `getCategoryColor()` (les couleurs sont dans `mobile-variables.scss`)
- **Conserver** : `onView()`, `onEdit()`, `onDuplicate()`, `onDelete()`, `trackByItemId()`, `formatDuree()`, `isDuplicating()`

**Dans `content-feed.component.html`** :
- **Supprimer** le bloc `<app-exercice-card>` (lignes 16-22)
- **Supprimer** les 3 blocs `<mat-card>` (lignes 25-166)
- **Remplacer** par une boucle unique :
  ```
  <app-mobile-feed-card
    *ngFor="let item of items; trackBy: trackByItemId"
    [item]="item"
    [duplicating]="isDuplicating(item.id)"
    (cardClick)="onView(item)"
    (viewClick)="onView(item)"
    (duplicateClick)="onDuplicate(item)"
    (deleteClick)="onDelete(item, $event)">
  </app-mobile-feed-card>
  ```
- **Conserver** : le bloc loading, le bloc error, le bloc empty

### Risques

- **Risque** : casser le feed si les outputs de `MobileFeedCardComponent` ne correspondent pas. **Mitigation** : vérifier la correspondance des noms d'outputs entre `MobileFeedCardComponent` (étape 5) et les bindings dans le template.
- **Risque** : `DuplicateButtonComponent` et `RichTextViewComponent` sont des composants shared utilisés ailleurs. **Mitigation** : on les retire uniquement de l'import de `ContentFeedComponent`, pas de la codebase. Ils restent disponibles pour le desktop.

### Critères de validation

- [ ] Aucun import de `ExerciceCardComponent` dans `content-feed.component.ts`
- [ ] Aucun import de `DuplicateButtonComponent` ni `RichTextViewComponent`
- [ ] Le template utilise uniquement `<app-mobile-feed-card>`
- [ ] Le feed affiche les 4 types de contenu avec le même composant
- [ ] Le loading, l'erreur et l'état vide fonctionnent

---

## ÉTAPE 10 — Intégration dans MobileHomeComponent

### Objectif

Assembler tous les composants créés dans `MobileHomeComponent` et vérifier le fonctionnement complet.

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.ts` | **MODIFIER** (ajout des imports finaux) |
| `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.html` | **MODIFIER** (template final) |

### Dépendances

- Étapes 4, 5, 6, 7, 8, 9

### Contenu attendu

**Template final de `MobileHomeComponent`** :
```
<app-mobile-search-bar> (conditionnel)
<app-mobile-filter-bar>
<app-content-feed>     (qui utilise maintenant MobileFeedCardComponent)
```

**Vérifications** :
- La recherche inline modifie `searchQuery` et filtre le feed
- Les filtres par catégorie fonctionnent
- Le tri fonctionne
- Le tap sur une carte navigue vers `/mobile/detail/:type/:id`
- Le bouton ⋮ ouvre le menu d'actions
- La suppression ouvre `MobileConfirmDialogComponent`
- La duplication fonctionne avec feedback (snackbar)

### Risques

- **Risque** : les événements ne remontent pas correctement entre les composants. **Mitigation** : tester chaque interaction individuellement.

### Critères de validation

- [ ] Le feed s'affiche avec les cartes mobiles
- [ ] La recherche inline filtre le feed
- [ ] Les filtres par catégorie fonctionnent
- [ ] Le tri fonctionne
- [ ] Le tap sur une carte navigue vers le détail
- [ ] La suppression passe par `MobileConfirmDialogComponent`
- [ ] Aucun `prompt()`, `confirm()`, `MatDialog` desktop

---

## ÉTAPE 11 — Modification du routing dans `app.module.ts`

### Objectif

Remplacer le `loadComponent` actuel par un `loadChildren` pointant vers `mobile.routes.ts` (D-01).

### Fichiers concernés

| Fichier | Action |
|---------|--------|
| `frontend/src/app/app.module.ts` | **MODIFIER** (lignes 66-71 uniquement) |

### Dépendances

- Étapes 2, 3 (routing + layout doivent exister)

### Contenu attendu

**Avant** (lignes 66-71 de `app.module.ts`) :
```typescript
// Route mobile (protégée)
{
  path: 'mobile',
  loadComponent: () => import('./features/mobile/pages/mobile-page/mobile-page.component').then(c => c.MobilePageComponent),
  canActivate: [AuthGuard, WorkspaceSelectedGuard]
},
```

**Après** :
```typescript
// Route mobile (protégée)
{
  path: 'mobile',
  loadChildren: () => import('./features/mobile/mobile.routes').then(r => r.MOBILE_ROUTES),
  canActivate: [AuthGuard, WorkspaceSelectedGuard]
},
```

### Risques

- **Risque : RÉGRESSION DESKTOP**. C'est le seul fichier partagé modifié. **Mitigation** :
  1. La modification est limitée à 2 lignes (remplacement de `loadComponent` par `loadChildren`)
  2. Les guards `AuthGuard` et `WorkspaceSelectedGuard` restent identiques
  3. Le `MobileGuard` sur les routes desktop reste identique
  4. Tester TOUTES les routes desktop après modification : `/`, `/exercices`, `/entrainements`, `/echauffements`, `/situations-matchs`, `/parametres`, `/admin`, `/tags-advanced`
- **Risque** : le `MobileGuard` redirige vers `/mobile` mais les children ne matchent pas. **Mitigation** : la route parent `''` dans `mobile.routes.ts` charge `MobileHomeComponent`, donc `/mobile` → layout + home.

### Critères de validation

- [ ] La route `/mobile` charge le layout mobile avec le feed
- [ ] La route `/mobile/detail/exercice/:id` charge la page détail
- [ ] Toutes les routes desktop fonctionnent sans régression
- [ ] Le `MobileGuard` redirige correctement vers `/mobile`
- [ ] Le lazy-loading fonctionne (pas de chargement eager du module mobile)

---

## ÉTAPE 12 — Validation globale Phase 1

### Objectif

Vérifier que tous les critères de la Phase 1 sont remplis.

### Check-list de validation Phase 1

#### Autonomie mobile (D-01, D-02, D-07)

- [ ] La vue mobile fonctionne sans aucune dépendance vers des composants desktop
- [ ] Aucun import depuis `features/exercices/`, `features/entrainements/`, `features/echauffements/`, `features/situations-matchs/`
- [ ] Aucun `MatDialog.open()` avec un composant desktop
- [ ] Aucun `router.navigate()` vers une route desktop depuis le mobile

#### Routing (D-01)

- [ ] `/mobile` → layout + feed
- [ ] `/mobile/detail/:type/:id` → page détail
- [ ] Le bouton retour du navigateur fonctionne (détail → feed)
- [ ] Le deep-linking fonctionne (accès direct à `/mobile/detail/exercice/123`)

#### UX mobile (D-08, D-09)

- [ ] La recherche est inline (pas de `prompt()`)
- [ ] La confirmation est un composant mobile (pas de `confirm()`)
- [ ] Les actions sur les cartes sont via menu ⋮
- [ ] Tous les touch-targets ≥ 44×44px

#### Styles (D-05)

- [ ] `mobile-variables.scss` existe et est importé par tous les composants mobile créés
- [ ] Aucune couleur hardcodée dans les fichiers TS ou SCSS mobile créés

#### Hero (D-10)

- [ ] Le hero contextuel n'est PAS affiché dans le feed

#### Desktop (D-06)

- [ ] La vue desktop fonctionne sans régression
- [ ] `mobile-optimizations.scss` n'a PAS été modifié
- [ ] `app.component.ts`, `app.component.html`, `app.component.css` n'ont PAS été modifiés

#### Fichiers créés

- [ ] `shared/styles/mobile-variables.scss`
- [ ] `features/mobile/mobile.routes.ts`
- [ ] `features/mobile/mobile-layout.component.ts/html/scss`
- [ ] `features/mobile/pages/mobile-home/mobile-home.component.ts/html/scss`
- [ ] `features/mobile/components/mobile-feed-card/mobile-feed-card.component.ts/html/scss`
- [ ] `features/mobile/components/mobile-search-bar/mobile-search-bar.component.ts/html/scss`
- [ ] `features/mobile/components/mobile-confirm-dialog/mobile-confirm-dialog.component.ts/html/scss`
- [ ] `features/mobile/pages/mobile-detail/mobile-detail.component.ts/html/scss`

#### Fichiers modifiés

- [ ] `app.module.ts` (lignes 66-71 : `loadComponent` → `loadChildren`)
- [ ] `features/mobile/components/content-feed/content-feed.component.ts` (suppression imports desktop)
- [ ] `features/mobile/components/content-feed/content-feed.component.html` (remplacement par `MobileFeedCardComponent`)

#### Fichiers NON modifiés (vérification)

- [ ] `app.component.ts` — INTACT
- [ ] `app.component.html` — INTACT
- [ ] `app.component.css` — INTACT
- [ ] `shared/styles/mobile-optimizations.scss` — INTACT
- [ ] `shared/styles/global-theme.scss` — INTACT
- [ ] Tous les composants sous `features/exercices/` — INTACTS
- [ ] Tous les composants sous `features/entrainements/` — INTACTS
- [ ] Tous les composants sous `features/echauffements/` — INTACTS
- [ ] Tous les composants sous `features/situations-matchs/` — INTACTS

---

## LIVRABLES PHASE 1

| # | Livrable | Description |
|---|----------|-------------|
| 1 | Feed mobile autonome | Cartes mobiles unifiées, aucune dépendance desktop |
| 2 | Recherche inline | `MobileSearchBarComponent` remplace `prompt()` |
| 3 | Vue détail mobile | `MobileDetailComponent` remplace les dialogues desktop |
| 4 | Confirmation mobile | `MobileConfirmDialogComponent` remplace `confirm()` |
| 5 | Routing avec children | Deep-linking, bouton retour, évolutivité |
| 6 | Variables CSS centralisées | `mobile-variables.scss` = source de vérité |
| 7 | Hero supprimé | Plus de doublon avec le premier item du feed |

---

*En attente de validation avant implémentation de la Phase 1.*
