# 🏗️ PHASE 1 — ARCHITECTURE MOBILE CIBLE (CONCEPTUELLE)

**Date**: 31 janvier 2026  
**Objectif**: Définir l'architecture complète AVANT toute implémentation

---

## 🎯 PRINCIPES DIRECTEURS

### Règles absolues
❌ **Aucun nouveau modèle métier**  
❌ **Aucune nouvelle API**  
❌ **Aucune duplication de page**  
✅ **Le mobile devient une vue composite, pas une collection de pages**

### Philosophie
> "Le mobile n'est pas une version simplifiée du desktop, c'est une **vue unifiée** des mêmes données avec une **navigation contextuelle**."

---

## 📐 ARCHITECTURE CIBLE COMPLÈTE

```
MobilePage (route: /mobile ou détection automatique)
│
├── MobileHeader (fixed, z-index: 1000)
│   ├── Logo / Identité
│   ├── Bouton Recherche (ouvre overlay)
│   └── Bouton Paramètres (ouvre menu)
│       ├── Profil
│       ├── Tags
│       ├── Admin (si role)
│       └── Déconnexion
│
├── MobileFilterBar (sticky sous header)
│   ├── Bulle "Tout" (all)
│   ├── Bulle "Exercices" (rouge)
│   ├── Bulle "Entraînements" (bleu)
│   ├── Bulle "Échauffements" (orange)
│   ├── Bulle "Situations" (violet)
│   └── Sélecteur Tri (récent ↓ / ancien ↑)
│
├── HeroContextuel (conditionnel)
│   └── Carte mise en avant selon état
│       ├── Si all → dernier élément global
│       ├── Si catégorie X → dernier de X
│       └── Si tri ancien → plus ancien
│
└── ContentFeed (scroll infini)
    └── Liste filtrée de cartes existantes
        ├── ExerciceCard (réutilisé)
        ├── EntrainementCard (réutilisé)
        ├── EchauffementCard (réutilisé)
        └── SituationMatchCard (réutilisé)
```

---

## 🧩 COMPOSANTS DÉTAILLÉS

### 1. MobileHeader (nouveau composant)

**Responsabilités**:
- Affichage identité app
- Accès recherche globale
- Accès paramètres utilisateur

**Props**:
```typescript
@Input() currentUser: User | null
@Output() searchClick = new EventEmitter<void>()
@Output() settingsClick = new EventEmitter<void>()
```

**Layout**:
```
┌─────────────────────────────────────┐
│ 🥏 Ultimate Frisbee    🔍  ⚙️      │
└─────────────────────────────────────┘
```

**Hauteur**: 56px (fixe)  
**Position**: fixed top  
**Background**: gradient primary

---

### 2. MobileFilterBar (nouveau composant)

**Responsabilités**:
- Filtrage par catégorie
- Tri chronologique
- Émission changements d'état

**Props**:
```typescript
@Input() activeCategory: CategoryType
@Input() sortOrder: SortOrder
@Output() categoryChange = new EventEmitter<CategoryType>()
@Output() sortChange = new EventEmitter<SortOrder>()
```

**Types**:
```typescript
type CategoryType = 'all' | 'exercice' | 'entrainement' | 'echauffement' | 'situation'
type SortOrder = 'recent' | 'old'
```

**Layout**:
```
┌─────────────────────────────────────┐
│ [Tout] [🏋️] [🎯] [🏃] [⚽] │ ↓ Récent│
└─────────────────────────────────────┘
```

**Hauteur**: 48px (fixe)  
**Position**: sticky (top: 56px)  
**Scroll**: horizontal si débordement

---

### 3. HeroContextuel (nouveau composant)

**Responsabilités**:
- Mise en avant contextuelle
- Calcul automatique selon état
- Réutilisation carte existante

**Props**:
```typescript
@Input() heroItem: ContentItem | null
@Input() category: CategoryType
```

**Logique de calcul** (dans MobilePage):
```typescript
get heroItem(): ContentItem | null {
  const items = this.getFilteredItems();
  if (items.length === 0) return null;
  
  if (this.sortOrder === 'recent') {
    return items[0]; // Plus récent
  } else {
    return items[items.length - 1]; // Plus ancien
  }
}
```

**Layout**:
```
┌─────────────────────────────────────┐
│ ⭐ MISE EN AVANT                    │
│ ┌─────────────────────────────────┐ │
│ │ [Carte réutilisée]              │ │
│ │ Titre + aperçu + tags           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Hauteur**: variable (auto)  
**Affichage**: conditionnel (masqué si aucun item)

---

### 4. ContentFeed (nouveau composant)

**Responsabilités**:
- Affichage liste filtrée
- Scroll infini (optionnel)
- Réutilisation cartes existantes

**Props**:
```typescript
@Input() items: ContentItem[]
@Input() loading: boolean
@Output() itemClick = new EventEmitter<ContentItem>()
```

**Layout**:
```
┌─────────────────────────────────────┐
│ [ExerciceCard]                      │
│ [EntrainementCard]                  │
│ [ExerciceCard]                      │
│ [SituationMatchCard]                │
│ [EchauffementCard]                  │
│ ...                                 │
└─────────────────────────────────────┘
```

**Scroll**: vertical (principal)  
**Gap**: 12px entre cartes  
**Padding**: 16px horizontal

---

## 🔄 FLUX DE DONNÉES

### Architecture de l'état

```
MobilePage (container intelligent)
    ↓ (gère l'état)
    ├── activeCategory: CategoryType
    ├── sortOrder: SortOrder
    ├── searchQuery: string
    ├── allItems: ContentItem[]
    └── filteredItems: ContentItem[] (computed)
    
    ↓ (distribue aux enfants)
    ├── MobileHeader (dumb)
    ├── MobileFilterBar (dumb)
    ├── HeroContextuel (dumb)
    └── ContentFeed (dumb)
```

### Type unifié ContentItem

```typescript
interface ContentItem {
  id: string;
  type: 'exercice' | 'entrainement' | 'echauffement' | 'situation';
  title: string;
  description?: string;
  createdAt: Date;
  tags?: Tag[];
  imageUrl?: string;
  // Champs spécifiques optionnels
  duree?: number; // pour entrainements
  nombreBlocs?: number; // pour échauffements
  // ... autres champs selon type
}
```

### Transformation des données

```typescript
// Dans MobilePage
private transformToContentItems(): ContentItem[] {
  const exercices = this.exercices.map(e => ({
    id: e.id,
    type: 'exercice' as const,
    title: e.nom,
    description: e.description,
    createdAt: e.createdAt,
    tags: e.tags,
    imageUrl: e.imageUrl,
    originalData: e // Référence complète
  }));
  
  const entrainements = this.entrainements.map(e => ({
    id: e.id,
    type: 'entrainement' as const,
    title: e.titre,
    createdAt: e.createdAt,
    tags: e.tags,
    duree: this.calculateDuree(e),
    originalData: e
  }));
  
  // ... idem pour échauffements et situations
  
  return [...exercices, ...entrainements, ...echauffements, ...situations];
}
```

---

## 🎨 DESIGN SYSTEM MOBILE

### Couleurs par catégorie (réutilisation existante)

```scss
$category-colors: (
  'exercice': #e74c3c,
  'entrainement': #3498db,
  'echauffement': #f39c12,
  'situation': #9b59b6,
  'all': #34495e
);
```

### Espacements

```scss
--mobile-header-height: 56px;
--mobile-filterbar-height: 48px;
--mobile-content-top: 104px; // header + filterbar
--mobile-padding: 16px;
--mobile-gap: 12px;
```

### Tailles tactiles

```scss
--touch-target-min: 44px;
--button-height: 48px;
--card-min-height: 120px;
```

---

## 🚀 NAVIGATION ET ROUTING

### Option A: Route dédiée (recommandée)

```typescript
// app.routes.ts
{
  path: 'mobile',
  component: MobilePageComponent,
  canActivate: [AuthGuard]
}
```

**Avantages**:
- Séparation claire desktop/mobile
- Pas de pollution du code desktop
- Facile à tester

**Redirection automatique**:
```typescript
// app.component.ts
ngOnInit() {
  if (this.isMobile() && !this.router.url.includes('/mobile')) {
    this.router.navigate(['/mobile']);
  }
}
```

### Option B: Composant conditionnel (alternative)

```html
<!-- app.component.html -->
<app-mobile-page *ngIf="isMobile$ | async"></app-mobile-page>
<div *ngIf="!(isMobile$ | async)" class="desktop-layout">
  <header>...</header>
  <router-outlet></router-outlet>
</div>
```

**Avantages**:
- Pas de redirection
- Détection automatique

**Inconvénients**:
- Code plus complexe
- Deux layouts dans un composant

### ✅ Choix recommandé: **Option A (route dédiée)**

---

## 📦 STRUCTURE DES FICHIERS

```
frontend/src/app/features/mobile/
├── mobile.module.ts (ou standalone)
├── pages/
│   └── mobile-page/
│       ├── mobile-page.component.ts
│       ├── mobile-page.component.html
│       ├── mobile-page.component.scss
│       └── mobile-page.component.spec.ts
├── components/
│   ├── mobile-header/
│   │   ├── mobile-header.component.ts
│   │   ├── mobile-header.component.html
│   │   └── mobile-header.component.scss
│   ├── mobile-filter-bar/
│   │   ├── mobile-filter-bar.component.ts
│   │   ├── mobile-filter-bar.component.html
│   │   └── mobile-filter-bar.component.scss
│   ├── hero-contextuel/
│   │   ├── hero-contextuel.component.ts
│   │   ├── hero-contextuel.component.html
│   │   └── hero-contextuel.component.scss
│   └── content-feed/
│       ├── content-feed.component.ts
│       ├── content-feed.component.html
│       └── content-feed.component.scss
├── services/
│   └── mobile-state.service.ts (optionnel)
└── models/
    └── content-item.model.ts
```

---

## 🔌 INTÉGRATION AVEC L'EXISTANT

### Services réutilisés (aucune modification)

```typescript
// Dans MobilePageComponent
constructor(
  private exerciceService: ExerciceService,
  private entrainementService: EntrainementService,
  private echauffementService: EchauffementService,
  private situationMatchService: SituationMatchService,
  private tagService: TagService,
  private authService: AuthService,
  private globalPreloader: GlobalPreloaderService // ✅ Réutilisation cache
) {}
```

### Composants réutilisés (aucune modification)

- `ExerciceCardComponent` (mode: 'default')
- `DuplicateButtonComponent`
- `RichTextViewComponent`
- Dialogs de visualisation existants

### Styles réutilisés

```scss
// mobile-page.component.scss
@import '../../../shared/styles/global-theme.scss';

// Réutilisation variables existantes
.mobile-page {
  --primary-color: var(--primary-color);
  --spacing-md: var(--spacing-md);
  // ...
}
```

---

## 🎯 DÉCISIONS ARCHITECTURALES ACTÉES

### 1. Pas de duplication de logique métier

✅ **Utilisation des services existants**  
❌ **Pas de nouveaux endpoints API**  
❌ **Pas de nouveaux modèles**

### 2. Composants dumb/smart

✅ **MobilePage = smart (gère état)**  
✅ **Enfants = dumb (reçoivent props)**  
❌ **Pas d'état local dans enfants**

### 3. Réutilisation stricte

✅ **Cartes existantes réutilisées**  
✅ **Services existants réutilisés**  
✅ **Dialogs existants réutilisés**  
❌ **Pas de nouveaux composants de carte**

### 4. Navigation séparée

✅ **Route /mobile dédiée**  
✅ **Redirection automatique si mobile**  
❌ **Pas de modification du routing desktop**

### 5. Performance

✅ **Réutilisation GlobalPreloaderService**  
✅ **Pas de rechargement si données en cache**  
✅ **Transformation légère des données**  
❌ **Pas de duplication des données**

---

## 🧪 POINTS DE VALIDATION

### Avant de passer à PHASE 2

- [ ] Architecture claire et documentée
- [ ] Aucune ambiguïté sur les responsabilités
- [ ] Flux de données défini
- [ ] Composants identifiés
- [ ] Réutilisation maximale confirmée
- [ ] Aucune dette technique introduite

### Questions à résoudre en PHASE 2

1. **État centralisé**: Service ou composant parent ?
2. **Recherche globale**: Overlay ou page séparée ?
3. **Scroll infini**: Implémentation ou pagination simple ?
4. **Animations**: Transitions entre catégories ?

---

## 📋 LIVRABLE PHASE 1

### Documents créés
✅ Architecture conceptuelle complète  
✅ Flux de données défini  
✅ Structure fichiers planifiée  
✅ Décisions architecturales actées

### Validation
✅ Aucun nouveau modèle métier  
✅ Aucune nouvelle API  
✅ Aucune duplication de page  
✅ Vue composite confirmée  
✅ Réutilisation maximale

### Prêt pour PHASE 2
✅ Architecture validée  
✅ Composants identifiés  
✅ Flux de données clair  
✅ Intégration définie  
✅ Pas de code écrit (respect de la phase)
