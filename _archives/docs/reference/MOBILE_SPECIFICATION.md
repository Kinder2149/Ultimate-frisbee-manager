# SPÉCIFICATION MOBILE - ULTIMATE FRISBEE MANAGER

**Statut** : REFERENCE  
**Version** : 3.0  
**Date** : 2026-02-19  
**Remplace** : MISSION_MOBILE_VERSION_FINALE_2.0.md, MOBILE_PROPOSITION_COMPLETE.md, MOBILE_ETAT_ACTUEL.md  
**Auteur** : Équipe technique Ultimate Frisbee Manager

---

## 📋 DOCUMENT DE RÉFÉRENCE UNIQUE

Ce document est **la seule source de vérité** pour la vue mobile. Toute modification nécessite une nouvelle version.

---

## 1. VISION PRODUIT

### Objectif
Créer une version mobile **fonctionnellement équivalente au desktop** :
- Mêmes objets métier
- Mêmes termes
- Mêmes structures de données
- Mêmes formulaires
- **Ergonomie 100% mobile**

### Ce que la mobile N'EST PAS
- ❌ Une version simplifiée
- ❌ Une app terrain indépendante
- ❌ Une PWA offline-first
- ❌ Un mode hors ligne complet

### Ce que la mobile EST
✅ Une continuité naturelle multi-device du produit principal

---

## 2. CONTRAINTES TECHNIQUES STRICTES

### Exclusions officielles
- ❌ Aucun Service Worker avancé
- ❌ Aucun IndexedDB
- ❌ Aucune synchronisation différée
- ❌ Aucune résolution de conflits
- ❌ Aucun Background sync
- ❌ Aucune notification push
- ❌ Aucune architecture offline dédiée
- ❌ Aucune modification backend
- ❌ Aucun mock de données

### Obligations
- ✅ Réutilisation services CRUD existants
- ✅ Réutilisation modèles données existants
- ✅ Aucune duplication logique métier
- ✅ Respect architecture Angular actuelle
- ✅ Standalone components
- ✅ Lazy loading routes

---

## 3. NAVIGATION (BOTTOM NAV)

### Structure officielle : 5 onglets

1. **Accueil** (`/mobile/home`)
   - Icône : `home`
   - Feed unifié de tous les contenus

2. **Bibliothèque** (`/mobile/library`)
   - Icône : `library_books`
   - Navigation par type (4 tabs)

3. **Créer** (`/mobile/create`)
   - Icône : `add_circle`
   - Sélection type de contenu à créer

4. **Terrain** (`/mobile/terrain`)
   - Icône : `sports_soccer`
   - Mode terrain avec chronomètre

5. **Profil** (`/mobile/profile`)
   - Icône : `person`
   - Profil utilisateur et paramètres

### Règles
- Taille tactile minimum : 48x48px
- Highlight de l'onglet actif
- Transitions fluides
- Position : fixed bottom

---

## 4. ROUTES COMPLÈTES

```typescript
/mobile
  ├── /home                          ✅ Feed unifié + filtres
  ├── /library                       ✅ Bibliothèque par type (4 tabs)
  ├── /create                        ✅ Sélection type
  │   ├── /exercice                  ✅ Création exercice (Stepper 5 étapes)
  │   ├── /entrainement              ✅ Création entraînement (Stepper 6 étapes)
  │   ├── /echauffement              ✅ Création échauffement (Stepper 3 étapes)
  │   └── /situation                 ✅ Création situation (Stepper 4 étapes)
  ├── /edit/:type/:id                ✅ Routeur édition
  │   ├── /exercice/:id              ✅ Édition exercice
  │   ├── /entrainement/:id          ✅ Édition entraînement
  │   ├── /echauffement/:id          ✅ Édition échauffement
  │   └── /situation/:id             ✅ Édition situation
  ├── /terrain                       ✅ Mode terrain
  ├── /profile                       ✅ Profil utilisateur
  └── /detail/:type/:id              ✅ Détails d'un élément
```

---

## 5. PAGES DÉTAILLÉES

### 5.1 Accueil (`/mobile/home`)

**Fonctionnalités** :
- ✅ Feed unifié de tous les contenus
- ✅ Filtres par catégorie (chips horizontaux)
- ✅ Recherche globale (debounce 300ms)
- ✅ Tri (récent/ancien, A-Z)
- ✅ Actions : Voir, Éditer, Dupliquer, Supprimer
- ✅ Pull-to-refresh
- ✅ Skeleton loaders

**Interactions** :
- Tap carte → Détails
- Menu contextuel (⋮) → Actions

---

### 5.2 Bibliothèque (`/mobile/library`)

**Fonctionnalités** :
- ✅ 4 tabs (Exercices, Entraînements, Échauffements, Situations)
- ✅ Recherche par tab
- ✅ Filtres avancés (bottom sheet)
  - Tags (multi-sélection)
  - Durée (slider)
  - Nombre de joueurs (slider)
  - Favoris uniquement (toggle)
- ✅ Tri personnalisé
- ✅ Compteur d'éléments
- ✅ Bouton FAB "+" → `/mobile/create/:type`
- ✅ Mode grille/liste (toggle)

**Navigation** :
- Tap item → `/mobile/detail/:type/:id`
- Bouton "+" → `/mobile/create/:type` (selon tab actif)

---

### 5.3 Créer (`/mobile/create`)

**Page de sélection** :
- 4 cartes : Exercice, Entraînement, Échauffement, Situation
- Navigation vers formulaire correspondant

#### Création Exercice (Stepper 5 étapes)

**Étape 1 : Informations générales**
- Nom* (required)
- Description* (required)

**Étape 2 : Paramètres métier**
- Durée (minutes)
- Nombre de joueurs (min/max)
- Matériel
- Critère de réussite
- Notes

**Étape 3 : Image (optionnel)**
- Upload image (caméra ou galerie)
- Validation : max 2 MB, JPG/PNG/GIF
- Prévisualisation

**Étape 4 : Tags**
- Sélection par catégorie :
  - Objectif (sélection simple)
  - Temps (sélection simple)
  - Format (sélection simple)
  - Travail spécifique (multi-sélection)
  - Niveau (multi-sélection)

**Étape 5 : Résumé**
- Affichage récapitulatif
- Bouton "Créer"
- Redirection vers détail après création

#### Création Entraînement (Stepper 6 étapes)

**Étape 1 : Informations**
- Titre* (required)
- Date* (required)

**Étape 2 : Échauffement (optionnel)**
- Sélection échauffement existant

**Étape 3 : Exercices**
- Sélection multiple exercices
- **Drag & drop pour ordre**
- Durée totale calculée

**Étape 4 : Situation (optionnel)**
- Sélection situation existante

**Étape 5 : Tags (optionnel)**
- Sélection tags

**Étape 6 : Résumé**
- Récapitulatif complet
- Bouton "Créer"

#### Création Échauffement (Stepper 3 étapes)

**Étape 1 : Informations**
- Nom* (required)
- Description* (required)

**Étape 2 : Blocs**
- Ajout/suppression dynamique blocs
- FormArray pour gestion blocs

**Étape 3 : Résumé**
- Récapitulatif
- Bouton "Créer"

#### Création Situation (Stepper 4 étapes)

**Étape 1 : Informations**
- Nom* (required)
- Description* (required)

**Étape 2 : Image (optionnel)**
- Upload image

**Étape 3 : Tags (optionnel)**
- Sélection tags

**Étape 4 : Résumé**
- Récapitulatif
- Bouton "Créer"

---

### 5.4 Édition (`/mobile/edit/:type/:id`)

**Fonctionnement** :
- Réutilisation composants création
- Pré-remplissage formulaire avec données existantes
- Mode édition détecté via route params
- Sauvegarde modifications
- Redirection vers détail après sauvegarde

**Navigation** :
- Depuis Detail : bouton "Éditer"
- Depuis Home : action menu contextuel

---

### 5.5 Détail (`/mobile/detail/:type/:id`)

**Affichage** :
- Header avec titre + bouton retour
- Images (cliquables → visualiseur plein écran)
- Métadonnées (durée, joueurs, etc.)
- Sections collapsibles :
  - Description (HTML riche, ouvert par défaut)
  - Tags (chips, fermé par défaut)
  - Matériel (si applicable)
  - Variantes (si applicable)

**Actions** :
- ⭐ Favoris (toggle)
- ✏️ Éditer → `/mobile/edit/:type/:id`
- 📋 Dupliquer (appel service CRUD)
- 🗑️ Supprimer (confirmation + appel service CRUD)
- 📤 Partager (Web Share API ou copie lien)

**Menu contextuel (⋮)** :
- Éditer
- Dupliquer
- Supprimer
- Ajouter aux favoris
- Partager

**Visualiseur d'images** :
- Swipe horizontal pour naviguer
- Pinch-to-zoom (1x à 3x)
- Double-tap pour zoomer/dézoomer
- Indicateurs de position (dots)
- Compteur d'images
- Bouton fermer (X)

---

### 5.6 Terrain (`/mobile/terrain`)

**Fonctionnalités** :

**Chronomètre** :
- Démarrer/Pause/Arrêter
- Affichage formaté (MM:SS)
- **Arrêt automatique au changement de page**

**Bloc Notes** :
- Textarea pour notes de séance
- **Sauvegarde automatique** (debounce 1s)
- Indication visuelle "Notes sauvegardées"
- Persistance localStorage
- Rechargement automatique

**Entraînement du jour** :
- Affichage entraînement sélectionné
- Progression dans l'entraînement (futur)
- Exercice en cours (futur)

**Favoris rapides** :
- Accès rapide exercices favoris (futur)

---

### 5.7 Profil (`/mobile/profile`)

**Affichage** :
- Avatar + nom + email
- Workspace actuel + rôle
- Bouton "Changer de workspace"

**Menu paramètres** :
- Profil
- Notifications (futur)
- Mode hors ligne (futur)
- Synchronisation (futur)
- Thème
- Langue

**Actions** :
- Déconnexion

---

## 6. COMPOSANTS RÉUTILISABLES

### MobileStepperComponent
- Affichage étapes horizontal
- Navigation avant/arrière
- Bouton Annuler
- Bouton Terminer (dernière étape)
- Validation étapes
- Indicateur étape complétée

### MobileTagSelectorComponent
- Recherche tags
- Affichage par catégorie
- Sélection simple ou multiple
- Tags sélectionnés affichés
- Suppression tag

### MobileImagePickerComponent
- Sélection fichier (galerie/caméra)
- Prévisualisation
- Validation taille/format
- Suppression image
- Indicateur upload

### MobileRelationSelectorComponent
- Recherche items
- Liste disponibles
- Sélection multiple
- **Drag & drop pour ordre**
- Suppression item
- Affichage durée

### CollapsibleSectionComponent
- Animation expand/collapse
- Icône de rotation
- État ouvert/fermé par défaut
- Support thème sombre

### MobileImageViewerComponent
- Swipe horizontal
- Pinch-to-zoom (1x-3x)
- Double-tap zoom
- Indicateurs position
- Compteur images
- Plein écran

---

## 7. SERVICES

### MobileNavigationService
**Responsabilité** : Gestion état centralisé

**État géré** :
- `currentTab$: Observable<string>`
- `terrainMode$: Observable<boolean>`
- `activeTraining$: Observable<Entrainement | null>`
- `favorites$: Observable<string[]>`
- `currentExerciseIndex$: Observable<number>`

**Méthodes** :
- `setCurrentTab(tab: string): void`
- `enableTerrainMode(): void`
- `disableTerrainMode(): void`
- `setActiveTraining(training: Entrainement): void`
- `addFavorite(id: string): void`
- `removeFavorite(id: string): void`

### MobileDataService
**Responsabilité** : Agrégation données depuis services CRUD

**Méthodes** :
- `getAllContent(options?: CacheOptions): Observable<ContentItem[]>`
- `getContentById(type, id, options?): Observable<ContentItem>`

**Transformation** : Consomme ExerciceService, EntrainementService, EchauffementService, SituationMatchService

### MobileFiltersService
**Responsabilité** : Logique de filtrage (méthodes pures)

**Méthodes** :
- `filterByCategory(items, category): ContentItem[]`
- `filterBySearch(items, query): ContentItem[]`
- `filterByTags(items, tags): ContentItem[]`
- `sortItems(items, order): ContentItem[]`
- `applyAllFilters(items, filters): ContentItem[]`

---

## 8. DESIGN SYSTEM

### Couleurs
```scss
--primary-color: #667eea;
--primary-dark: #5568d3;
--text-color: #2c3e50;
--text-color-secondary: #7f8c8d;
--background-color: #f8f9fa;
--card-background: #ffffff;
--border-color: #e9ecef;
```

### Espacements (système 4px)
```scss
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

### Tailles tactiles
```scss
--touch-min: 48px;           // Minimum WCAG/Apple HIG
--touch-comfortable: 56px;
--bottom-nav-height: 56px;
--header-height: 56px;
```

### Animations
```scss
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 9. ÉTAT D'IMPLÉMENTATION

### ✅ Phase 1-3 : Fondations (TERMINÉ)
- MobileNavigationService
- MobileBottomNavComponent (4 onglets - **manque "Créer"**)
- MobileHeaderComponent
- MobileLayoutComponent
- MobileHomeComponent
- MobileLibraryComponent (basique - **manque recherche/filtres**)
- MobileTerrainComponent (chronomètre + notes)
- MobileProfileComponent
- MobileDetailComponent (basique - **manque actions**)
- CollapsibleSectionComponent
- MobileImageViewerComponent

### ✅ Phase 4-7 : Création/Édition (IMPLÉMENTÉ NON TESTÉ)
- MobileStepperComponent
- MobileTagSelectorComponent
- MobileImagePickerComponent
- MobileRelationSelectorComponent
- MobileCreateComponent (routeur)
- MobileCreateExerciceComponent
- MobileCreateEntrainementComponent
- MobileCreateEchauffementComponent
- MobileCreateSituationComponent
- MobileEditComponent (routeur)
- Routes création/édition complètes

### ❌ Phase 8 : Tests & Validation (NON RÉALISÉ)
- Tests manuels parcours critiques
- Tests automatisés
- Validation contractuelle
- Corrections bugs

---

## 10. TRAVAUX RESTANTS

### Critiques (bloquants)
1. **Ajouter onglet "Créer" dans bottom-nav** (5 onglets au lieu de 4)
2. **Implémenter actions Detail** (dupliquer, supprimer)
3. **Implémenter recherche/filtres Library**
4. **Tests manuels complets** (création, édition, terrain)

### Importants (non bloquants)
5. Progression entraînement (Terrain)
6. Favoris rapides (Terrain)
7. Tests automatisés
8. Optimisations performance

### Futurs (hors scope actuel)
- Mode hors ligne
- Notifications
- Partage avancé (PDF, QR Code)
- Recherche vocale

---

## 11. CRITÈRES DE VALIDATION

### Checklist contractuelle

**Navigation** :
- [ ] 5 onglets présents (Accueil, Bibliothèque, **Créer**, Terrain, Profil)
- [ ] Navigation fluide
- [ ] Tracking route correct

**Création** :
- [ ] Création 4 types fonctionnelle (Stepper multi-étapes)
- [ ] Upload image fonctionne
- [ ] Sélection tags fonctionne
- [ ] Drag & drop ordre exercices fonctionne
- [ ] Sauvegarde en base réussie
- [ ] Redirection après création

**Édition** :
- [ ] Édition 4 types fonctionnelle
- [ ] Formulaire pré-rempli
- [ ] Sauvegarde modifications
- [ ] Aucune redirection desktop

**Bibliothèque** :
- [ ] Recherche par tab fonctionne
- [ ] Filtres avancés fonctionnent
- [ ] Bouton "+" redirige vers `/mobile/create/:type`

**Détail** :
- [ ] Actions complètes (éditer, dupliquer, supprimer, favoris, partager)
- [ ] Visualiseur images fonctionnel
- [ ] Sections collapsibles
- [ ] Aucune redirection desktop

**Terrain** :
- [ ] Chronomètre fonctionne
- [ ] Arrêt auto au changement page
- [ ] Bloc notes avec sauvegarde auto
- [ ] Indication "sauvegardé"

**Contraintes techniques** :
- [ ] Aucun Service Worker avancé
- [ ] Aucun IndexedDB
- [ ] Aucune modification backend
- [ ] Réutilisation services CRUD existants
- [ ] Aucune duplication logique métier

---

## 12. MÉTRIQUES CIBLES

### Performance
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Compatibilité
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ✅ Firefox Mobile
- ⚠️ Tablettes (à tester)

### Accessibilité
- ✅ Tailles tactiles conformes (48px min)
- ⚠️ Support clavier (à implémenter)
- ⚠️ Lecteur d'écran (à implémenter)

---

## ANNEXE : HISTORIQUE VERSIONS

**v3.0 (2026-02-19)** : Document de référence unique consolidé
- Remplace 3 documents de référence précédents
- Clarification contraintes techniques
- État d'implémentation précis
- Travaux restants identifiés

**v2.0 (2026-02-18)** : MISSION_MOBILE_VERSION_FINALE_2.0.md
- Document contractuel initial
- Suppression mode offline
- Ajout onglet "Créer"

**v1.0 (2026-02-10)** : MOBILE_PROPOSITION_COMPLETE.md
- Proposition initiale avec mode offline

---

**FIN DU DOCUMENT DE RÉFÉRENCE**
