# 📋 PHASE 0 — CARTOGRAPHIE COMPLÈTE DE L'EXISTANT

**Date**: 31 janvier 2026  
**Objectif**: Comprendre où se branche le mobile aujourd'hui, sans rien casser

---

## 🗺️ VUE D'ENSEMBLE DE L'ARCHITECTURE ACTUELLE

### Structure de navigation actuelle

**Fichier principal**: `@/frontend/src/app/app.component.html:1-118`

```
AppComponent (root)
├── Header fixe (mobile) / Normal (desktop)
│   ├── Titre "Ultimate Frisbee Manager"
│   ├── Navigation principale (dropdowns)
│   │   ├── Tableau de bord (/)
│   │   ├── Exercices (dropdown)
│   │   ├── Entraînements (dropdown)
│   │   ├── Échauffements (dropdown)
│   │   ├── Situations/Matchs (dropdown)
│   │   └── Paramètres (dropdown avec avatar)
│   └── Workspace switcher (si applicable)
├── Main content (router-outlet)
└── Footer
```

---

## 📱 IMPLÉMENTATION MOBILE ACTUELLE

### 1. Fichier CSS Mobile Principal

**Fichier**: `@/frontend/src/app/shared/styles/mobile-optimizations.scss:1-1067`

#### Points clés identifiés:

**A. Navigation mobile (lignes 107-431)**
- Header **position: fixed** (ligne 113)
- Hauteur dynamique via `--mobile-appbar-height` (ligne 109)
- Navigation horizontale scrollable (lignes 155-166)
- **Bulles de raccourcis colorées** par catégorie (lignes 208-296)
  - Exercices: rouge (#e74c3c)
  - Entraînements: bleu (#3498db)
  - Échauffements: orange (#f39c12)
  - Situations: violet (#9b59b6)
  - Tableau de bord: gris (#34495e)
- Dropdowns transformés en **bottom sheets** (lignes 310-380)

**B. Cartes unifiées (lignes 26-101)**
- Classe `.entity-card` partagée
- Header, body, actions standardisés
- Tags et métadonnées uniformes
- Responsive: pile verticale sur mobile (ligne 93)

**C. Cartes d'exercices spécifiques (lignes 737-857)**
- Grille → colonne unique sur mobile
- Header cliquable pour expansion
- Tags essentiels prioritaires
- Barre d'actions flottante (ligne 792)

**D. Filtres mobiles (lignes 863-953)**
- Layout vertical
- Dropdowns tactiles (min-height: 44px)
- Tags sélectionnés compacts

**E. Utilitaires (lignes 1007-1066)**
- Classes `.mobile-hidden`, `.mobile-full-width`
- Animations douces
- Zone tactile optimisée

### 2. Logique TypeScript Mobile

**Fichier**: `@/frontend/src/app/app.component.ts:1-149`

#### Fonctionnalités identifiées:

**État des dropdowns** (lignes 27-33)
```typescript
isDropdownOpen = {
  exercices: false,
  entrainements: false,
  echauffements: false,
  situations: false,
  parametres: false
};
```

**Gestion mobile** (lignes 97-103)
- Calcul dynamique de la hauteur du header
- Mise à jour de `--mobile-appbar-height`
- Adaptation au resize

**Fermeture automatique** (lignes 57-62)
- Fermeture des menus à la navigation
- Évite les menus orphelins

---

## 🧩 COMPOSANTS RÉUTILISABLES EXISTANTS

### 1. Cartes d'entités

#### A. ExerciceCardComponent
**Fichier**: `@/frontend/src/app/features/exercices/components/exercice-card.component.ts:1-345`

**Fonctionnalités**:
- Affichage carte avec expansion (ligne 64)
- Tags par catégorie (lignes 67-71)
- Actions: voir, éditer, dupliquer, supprimer
- Modes: `default`, `entrainement`, `entrainement-summary` (ligne 51)
- Gestion durée éditable (lignes 283-289)
- Images/schémas avec viewer (lignes 239-257)

**Inputs/Outputs**:
- `@Input() exercice` (ligne 43)
- `@Input() mode` (ligne 51)
- `@Output() exerciceDeleted` (ligne 54)
- `@Output() exerciceDuplicated` (ligne 55)

#### B. Autres cartes similaires
- Entraînements: liste avec cartes entity-card
- Échauffements: liste avec cartes entity-card
- Situations/Matchs: liste avec cartes entity-card

### 2. Filtres

**Composant**: `ExerciceFiltersComponent`
**Utilisé par**: Toutes les pages de liste

**Interface** (ligne 24):
```typescript
export interface ExerciceFiltersValue {
  searchTerm: string;
  selectedObjectifTags: string[];
  selectedTravailSpecifiqueTags: string[];
  selectedNiveauTags: string[];
  selectedTempsTags: string[];
  selectedFormatTags: string[];
  selectedThemeEntrainementTags?: string[];
}
```

### 3. Composants d'authentification

**Fichiers**:
- Login: `@/frontend/src/app/features/auth/login/login.component.ts`
- Profil: `@/frontend/src/app/features/settings/pages/profile/profile-page.component.ts`
- Avatar dans header (app.component.html lignes 76-83)

### 4. Services partagés

**Services API**:
- `ExerciceService` (ligne 13)
- `EntrainementService` (ligne 38)
- `EchauffementService` (ligne 12)
- `SituationMatchService` (ligne 15)
- `TagService` (ligne 14)
- `AuthService` (ligne 3)

**Services utilitaires**:
- `ApiUrlService`: construction URLs médias
- `WorkspaceService`: gestion workspaces
- `GlobalPreloaderService`: préchargement données

---

## 📊 PAGES DE LISTE ACTUELLES

### 1. ExerciceListComponent
**Fichier**: `@/frontend/src/app/features/exercices/pages/exercice-list.component.ts:1-428`

**Architecture**:
- Chargement parallèle tags + exercices (ligne 126)
- Enrichissement exercices avec tags (ligne 182)
- Filtrage multi-critères (ligne 261)
- Tri alphabétique (ligne 341)

**État local**:
```typescript
exercices: Exercice[] = [];
filteredExercices: Exercice[] = [];
searchTerm = '';
selectedObjectifTags: string[] = [];
selectedTravailSpecifiqueTags: string[] = [];
selectedNiveauTags: string[] = [];
selectedTempsTags: string[] = [];
selectedFormatTags: string[] = [];
```

### 2. EntrainementListComponent
**Fichier**: `@/frontend/src/app/features/entrainements/pages/entrainement-list/entrainement-list.component.ts:1-221`

**Spécificités**:
- Calcul durée totale (lignes 83-89)
- Filtrage par thème (ligne 125)
- Ouverture en dialog (lignes 154-165)

### 3. EchauffementListComponent
**Fichier**: `@/frontend/src/app/features/echauffements/pages/echauffement-list/echauffement-list.component.ts:1-224`

**Spécificités**:
- Calcul temps total blocs (lignes 187-211)
- Recherche dans blocs (ligne 85)

### 4. SituationMatchListComponent
**Fichier**: `@/frontend/src/app/features/situations-matchs/pages/situationmatch-list/situationmatch-list.component.ts:1-307`

**Spécificités**:
- Expansion cartes (lignes 74-88)
- Filtres temps + format (lignes 138-143)
- Viewer d'images (lignes 277-293)

---

## 🎨 POINTS CSS-ONLY vs LOGIQUE ANGULAR

### CSS-Only (mobile-optimizations.scss)

✅ **Ce qui fonctionne uniquement par CSS**:
1. **Navigation en bulles** (lignes 208-296)
   - Transformation layout horizontal
   - Couleurs par catégorie
   - Icônes uniquement (`.nav-text { display: none }`)
   
2. **Dropdowns en bottom sheets** (lignes 310-380)
   - Position fixed bottom
   - Animation slideInUp
   - Scroll tactile

3. **Cartes responsive** (lignes 93-101)
   - Flex-direction: column
   - Actions centrées

4. **Filtres verticaux** (lignes 863-953)
   - Layout colonne
   - Tailles tactiles

### Logique Angular (app.component.ts)

✅ **Ce qui nécessite TypeScript**:
1. **Gestion état dropdowns** (lignes 27-33)
   - Ouverture/fermeture
   - Un seul menu ouvert à la fois

2. **Hauteur dynamique header** (lignes 97-103)
   - Calcul après render
   - Mise à jour variable CSS

3. **Fermeture auto navigation** (lignes 57-62)
   - Écoute événements router
   - Nettoyage état

4. **Body scroll lock** (lignes 89-95)
   - Empêche scroll arrière-plan
   - Classe conditionnelle

---

## 🔍 ANALYSE DES DUPLICATIONS

### Logique dupliquée entre pages

**Filtrage** (présent dans 4 composants):
- Recherche textuelle
- Filtrage par tags
- Application filtres
- Réinitialisation

**Gestion liste** (présent dans 4 composants):
- Chargement données
- État loading/error
- Duplication entité
- Suppression entité

**Formatage** (présent dans 3 composants):
- Format date
- Format durée/temps
- Troncature description

### Composants réutilisables mais incomplets

**ExerciceFiltersComponent**:
- ✅ Réutilisé partout
- ❌ Interface trop spécifique aux exercices
- ❌ Nom trompeur (utilisé pour tout)

**entity-card CSS**:
- ✅ Styles unifiés
- ❌ Pas de composant Angular correspondant
- ❌ Chaque page implémente son propre HTML

---

## 🚨 POINTS DE FRICTION MOBILE ACTUELS

### 1. Navigation
❌ **Problème**: Dropdowns complexes, scroll horizontal caché  
✅ **Fonctionne**: Bulles colorées, bottom sheets

### 2. Cartes
❌ **Problème**: Trop d'informations visibles, actions dispersées  
✅ **Fonctionne**: Expansion/collapse, styles unifiés

### 3. Filtres
❌ **Problème**: Dropdowns multiples, tags peu visibles  
✅ **Fonctionne**: Layout vertical, tailles tactiles

### 4. Performance
❌ **Problème**: Rechargement complet à chaque navigation  
✅ **Fonctionne**: GlobalPreloaderService (ligne 65 app.component.ts)

---

## 📌 DÉCISIONS ARCHITECTURALES ACTUELLES

### Ce qui est bien et à conserver

1. **Composants standalone** (Angular 17)
   - Tous les composants sont standalone
   - Imports explicites
   - Facilite la réutilisation

2. **Services centralisés**
   - API services bien séparés
   - Pas de logique métier dans composants

3. **Styles unifiés**
   - Variables CSS globales
   - Thème cohérent
   - Classes utilitaires

4. **Préchargement intelligent**
   - GlobalPreloaderService
   - Cache des données

### Ce qui pose problème

1. **État local dispersé**
   - Chaque page gère son propre état
   - Pas de partage entre vues
   - Rechargement à chaque navigation

2. **Logique dupliquée**
   - Filtrage réimplémenté 4 fois
   - Formatage réimplémenté 3 fois
   - Gestion liste réimplémentée 4 fois

3. **Navigation mobile = hack CSS**
   - Pas de vraie vue mobile
   - Juste des overrides CSS
   - Logique desktop polluée par mobile

4. **Pas de vue unifiée**
   - 4 pages séparées
   - Pas de vue "tout voir"
   - Navigation fragmentée

---

## 🎯 COMPOSANTS RÉUTILISABLES IDENTIFIÉS

### Niveau 1: Déjà réutilisables
- ✅ `ExerciceCardComponent`
- ✅ `ExerciceFiltersComponent` (à renommer)
- ✅ `DuplicateButtonComponent`
- ✅ `RichTextViewComponent`
- ✅ Services API (tous)

### Niveau 2: Partiellement réutilisables
- 🟡 Cartes entraînements (HTML custom)
- 🟡 Cartes échauffements (HTML custom)
- 🟡 Cartes situations (HTML custom)

### Niveau 3: À extraire
- ❌ Logique filtrage (dupliquée)
- ❌ Logique formatage (dupliquée)
- ❌ Gestion état liste (dupliquée)

---

## 📋 LIVRABLE PHASE 0

### Ce qui est mobile par CSS uniquement

1. **Navigation en bulles** (mobile-optimizations.scss:208-296)
2. **Dropdowns en bottom sheets** (mobile-optimizations.scss:310-380)
3. **Cartes responsive** (mobile-optimizations.scss:93-101)
4. **Filtres verticaux** (mobile-optimizations.scss:863-953)
5. **Utilitaires tactiles** (mobile-optimizations.scss:1007-1066)

### Ce qui est structurel (TypeScript)

1. **État dropdowns** (app.component.ts:27-33)
2. **Hauteur dynamique** (app.component.ts:97-103)
3. **Navigation auto-close** (app.component.ts:57-62)
4. **Scroll lock** (app.component.ts:89-95)
5. **Chargement données** (4 composants liste)
6. **Filtrage** (4 composants liste)
7. **Actions CRUD** (4 composants liste)

---

## ✅ CONCLUSION PHASE 0

### Points positifs
- Architecture Angular moderne (standalone)
- Services bien séparés
- Styles CSS unifiés et maintenables
- Composants de base réutilisables

### Points à améliorer
- État local dispersé → besoin état centralisé
- Logique dupliquée → besoin extraction
- Navigation mobile = hack → besoin vraie vue mobile
- Pas de vue unifiée → besoin MobilePage composite

### Prêt pour PHASE 1
✅ Cartographie complète  
✅ Identification composants réutilisables  
✅ Compréhension CSS vs logique  
✅ Aucune modification du code  
✅ Base solide pour architecture cible
