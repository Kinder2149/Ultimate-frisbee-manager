# 🧠 PHASE 2 — DÉFINITION DES ÉTATS CENTRALISÉS

**Date**: 31 janvier 2026  
**Objectif**: Centraliser toute la logique mobile dans un état unique (anti-dette)

---

## 🎯 RÈGLES ABSOLUES

### Principe fondamental
> **Si deux composants ont besoin de la même info → état central**  
> **Pas de logique dupliquée**

### Interdictions strictes
❌ Aucun composant ne décide seul  
❌ Pas d'état local dans les composants enfants  
❌ Pas de calcul dupliqué  
❌ Pas de transformation dans les templates

### Obligations
✅ Tout lit l'état, rien ne le recrée  
✅ Un seul point de vérité  
✅ Calculs centralisés  
✅ Transformations en amont

---

## 📊 ÉTAT MINIMAL REQUIS

### Interface MobileState

```typescript
interface MobileState {
  // === FILTRES ===
  activeCategory: CategoryType;
  sortOrder: SortOrder;
  searchQuery: string;
  
  // === DONNÉES BRUTES ===
  exercices: Exercice[];
  entrainements: Entrainement[];
  echauffements: Echauffement[];
  situationsMatchs: SituationMatch[];
  
  // === DONNÉES TRANSFORMÉES (computed) ===
  allItems: ContentItem[]; // Toutes les données unifiées
  filteredItems: ContentItem[]; // Après filtrage
  heroItem: ContentItem | null; // Élément mis en avant
  
  // === ÉTAT UI ===
  loading: boolean;
  error: string | null;
  
  // === MÉTADONNÉES ===
  totalCount: number;
  categoryCount: Record<CategoryType, number>;
}
```

### Types associés

```typescript
type CategoryType = 'all' | 'exercice' | 'entrainement' | 'echauffement' | 'situation';

type SortOrder = 'recent' | 'old';

interface ContentItem {
  id: string;
  type: 'exercice' | 'entrainement' | 'echauffement' | 'situation';
  title: string;
  description?: string;
  createdAt: Date;
  tags?: Tag[];
  imageUrl?: string;
  
  // Métadonnées spécifiques
  duree?: number; // minutes (entrainements)
  nombreBlocs?: number; // (échauffements)
  
  // Référence complète pour accès détaillé
  originalData: Exercice | Entrainement | Echauffement | SituationMatch;
}
```

---

## 🏗️ ARCHITECTURE DE L'ÉTAT

### Option A: État dans le composant parent (recommandée)

```typescript
@Component({
  selector: 'app-mobile-page',
  templateUrl: './mobile-page.component.html',
  styleUrls: ['./mobile-page.component.scss']
})
export class MobilePageComponent implements OnInit, OnDestroy {
  // === ÉTAT BRUT ===
  private exercices: Exercice[] = [];
  private entrainements: Entrainement[] = [];
  private echauffements: Echauffement[] = [];
  private situationsMatchs: SituationMatch[] = [];
  
  // === ÉTAT FILTRES ===
  activeCategory: CategoryType = 'all';
  sortOrder: SortOrder = 'recent';
  searchQuery: string = '';
  
  // === ÉTAT UI ===
  loading = false;
  error: string | null = null;
  
  // === COMPUTED PROPERTIES ===
  get allItems(): ContentItem[] {
    return this.transformToContentItems();
  }
  
  get filteredItems(): ContentItem[] {
    return this.applyFilters(this.allItems);
  }
  
  get heroItem(): ContentItem | null {
    return this.calculateHeroItem(this.filteredItems);
  }
  
  get categoryCount(): Record<CategoryType, number> {
    return this.calculateCategoryCount(this.allItems);
  }
  
  // === MÉTHODES ===
  // ... (voir section suivante)
}
```

**Avantages**:
- Simple et direct
- Pas de dépendance externe
- Facile à tester
- Pas de boilerplate

**Inconvénients**:
- État perdu à la navigation
- Pas de partage entre composants

### Option B: Service dédié (alternative)

```typescript
@Injectable({
  providedIn: 'root'
})
export class MobileStateService {
  // === STATE SUBJECTS ===
  private state$ = new BehaviorSubject<MobileState>(initialState);
  
  // === PUBLIC OBSERVABLES ===
  readonly activeCategory$ = this.state$.pipe(map(s => s.activeCategory));
  readonly filteredItems$ = this.state$.pipe(map(s => s.filteredItems));
  readonly heroItem$ = this.state$.pipe(map(s => s.heroItem));
  readonly loading$ = this.state$.pipe(map(s => s.loading));
  
  // === ACTIONS ===
  setCategory(category: CategoryType): void {
    const current = this.state$.value;
    this.state$.next({
      ...current,
      activeCategory: category,
      filteredItems: this.applyFilters(current.allItems, category, current.sortOrder, current.searchQuery)
    });
  }
  
  setSortOrder(order: SortOrder): void {
    // ...
  }
  
  setSearchQuery(query: string): void {
    // ...
  }
  
  // === PRIVATE METHODS ===
  private applyFilters(items: ContentItem[], category: CategoryType, sort: SortOrder, search: string): ContentItem[] {
    // Logique centralisée
  }
}
```

**Avantages**:
- État persistant
- Partage entre composants
- Pattern réactif (RxJS)

**Inconvénients**:
- Plus complexe
- Boilerplate RxJS
- Overkill pour une seule page

### ✅ Choix recommandé: **Option A (état dans composant)**

**Justification**:
- Une seule page mobile
- Pas besoin de persistance
- Simplicité maximale
- Facile à migrer vers service si besoin

---

## 🔄 LOGIQUE DE TRANSFORMATION

### 1. Transformation des données brutes

```typescript
private transformToContentItems(): ContentItem[] {
  const items: ContentItem[] = [];
  
  // Exercices
  this.exercices.forEach(exercice => {
    items.push({
      id: exercice.id!,
      type: 'exercice',
      title: exercice.nom,
      description: exercice.description,
      createdAt: new Date(exercice.createdAt!),
      tags: exercice.tags,
      imageUrl: exercice.imageUrl,
      originalData: exercice
    });
  });
  
  // Entraînements
  this.entrainements.forEach(entrainement => {
    items.push({
      id: entrainement.id!,
      type: 'entrainement',
      title: entrainement.titre,
      createdAt: new Date(entrainement.createdAt!),
      tags: entrainement.tags,
      duree: this.calculateDureeEntrainement(entrainement),
      originalData: entrainement
    });
  });
  
  // Échauffements
  this.echauffements.forEach(echauffement => {
    items.push({
      id: echauffement.id!,
      type: 'echauffement',
      title: echauffement.nom,
      description: echauffement.description,
      createdAt: new Date(echauffement.createdAt!),
      nombreBlocs: echauffement.blocs?.length || 0,
      originalData: echauffement
    });
  });
  
  // Situations/Matchs
  this.situationsMatchs.forEach(situation => {
    items.push({
      id: situation.id!,
      type: 'situation',
      title: situation.nom,
      description: situation.description,
      createdAt: new Date(situation.createdAt!),
      tags: situation.tags,
      imageUrl: situation.imageUrl,
      originalData: situation
    });
  });
  
  return items;
}
```

### 2. Application des filtres

```typescript
private applyFilters(items: ContentItem[]): ContentItem[] {
  let filtered = [...items];
  
  // Filtre par catégorie
  if (this.activeCategory !== 'all') {
    filtered = filtered.filter(item => item.type === this.activeCategory);
  }
  
  // Filtre par recherche
  if (this.searchQuery.trim()) {
    const query = this.searchQuery.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.label.toLowerCase().includes(query))
    );
  }
  
  // Tri chronologique
  filtered.sort((a, b) => {
    const dateA = a.createdAt.getTime();
    const dateB = b.createdAt.getTime();
    return this.sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
  });
  
  return filtered;
}
```

### 3. Calcul du hero item

```typescript
private calculateHeroItem(items: ContentItem[]): ContentItem | null {
  if (items.length === 0) return null;
  
  // Le hero est toujours le premier élément après tri
  // (plus récent si sortOrder='recent', plus ancien si sortOrder='old')
  return items[0];
}
```

### 4. Calcul des compteurs par catégorie

```typescript
private calculateCategoryCount(items: ContentItem[]): Record<CategoryType, number> {
  const counts: Record<CategoryType, number> = {
    all: items.length,
    exercice: 0,
    entrainement: 0,
    echauffement: 0,
    situation: 0
  };
  
  items.forEach(item => {
    counts[item.type]++;
  });
  
  return counts;
}
```

---

## 🎬 ACTIONS ET MUTATIONS

### Actions publiques (appelées par les enfants)

```typescript
// Changement de catégorie
onCategoryChange(category: CategoryType): void {
  this.activeCategory = category;
  // Les getters recalculent automatiquement
}

// Changement de tri
onSortChange(order: SortOrder): void {
  this.sortOrder = order;
  // Les getters recalculent automatiquement
}

// Changement de recherche
onSearchChange(query: string): void {
  this.searchQuery = query;
  // Les getters recalculent automatiquement
}

// Réinitialisation des filtres
resetFilters(): void {
  this.activeCategory = 'all';
  this.sortOrder = 'recent';
  this.searchQuery = '';
}
```

### Chargement des données

```typescript
ngOnInit(): void {
  this.loadAllData();
}

private loadAllData(): void {
  this.loading = true;
  this.error = null;
  
  forkJoin({
    exercices: this.exerciceService.getExercices(),
    entrainements: this.entrainementService.getEntrainements(),
    echauffements: this.echauffementService.getEchauffements(),
    situationsMatchs: this.situationMatchService.getSituationsMatchs()
  }).subscribe({
    next: (data) => {
      this.exercices = data.exercices;
      this.entrainements = data.entrainements;
      this.echauffements = data.echauffements;
      this.situationsMatchs = data.situationsMatchs;
      this.loading = false;
      
      console.log('[MobilePage] Données chargées:', {
        exercices: this.exercices.length,
        entrainements: this.entrainements.length,
        echauffements: this.echauffements.length,
        situations: this.situationsMatchs.length,
        total: this.allItems.length
      });
    },
    error: (err) => {
      console.error('[MobilePage] Erreur chargement:', err);
      this.error = 'Erreur lors du chargement des données';
      this.loading = false;
    }
  });
}
```

---

## 🔌 DISTRIBUTION AUX COMPOSANTS ENFANTS

### Template du composant parent

```html
<div class="mobile-page">
  <!-- Header -->
  <app-mobile-header
    [currentUser]="currentUser$ | async"
    (searchClick)="onSearchClick()"
    (settingsClick)="onSettingsClick()">
  </app-mobile-header>
  
  <!-- Filter Bar -->
  <app-mobile-filter-bar
    [activeCategory]="activeCategory"
    [sortOrder]="sortOrder"
    [categoryCount]="categoryCount"
    (categoryChange)="onCategoryChange($event)"
    (sortChange)="onSortChange($event)">
  </app-mobile-filter-bar>
  
  <!-- Hero -->
  <app-hero-contextuel
    *ngIf="heroItem"
    [item]="heroItem"
    [category]="activeCategory"
    (itemClick)="onItemClick($event)">
  </app-hero-contextuel>
  
  <!-- Content Feed -->
  <app-content-feed
    [items]="filteredItems"
    [loading]="loading"
    [error]="error"
    (itemClick)="onItemClick($event)"
    (itemDuplicate)="onItemDuplicate($event)"
    (itemDelete)="onItemDelete($event)">
  </app-content-feed>
</div>
```

### Flux de données

```
MobilePageComponent (état central)
    ↓ [activeCategory]
    ↓ [sortOrder]
    ↓ [categoryCount]
MobileFilterBar (dumb)
    ↑ (categoryChange)
    ↑ (sortChange)
MobilePageComponent (mise à jour état)
    ↓ [filteredItems] (recalculé)
ContentFeed (dumb)
```

---

## 🚀 OPTIMISATIONS PERFORMANCE

### 1. Memoization des calculs

```typescript
private _allItemsCache: ContentItem[] | null = null;
private _lastDataHash: string = '';

get allItems(): ContentItem[] {
  const currentHash = this.calculateDataHash();
  
  if (this._lastDataHash === currentHash && this._allItemsCache) {
    return this._allItemsCache;
  }
  
  this._allItemsCache = this.transformToContentItems();
  this._lastDataHash = currentHash;
  
  return this._allItemsCache;
}

private calculateDataHash(): string {
  return `${this.exercices.length}-${this.entrainements.length}-${this.echauffements.length}-${this.situationsMatchs.length}`;
}
```

### 2. Change Detection Strategy

```typescript
@Component({
  selector: 'app-mobile-page',
  templateUrl: './mobile-page.component.html',
  styleUrls: ['./mobile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ Performance
})
export class MobilePageComponent {
  // ...
}
```

### 3. TrackBy pour les listes

```typescript
// Dans ContentFeedComponent
trackByItemId(index: number, item: ContentItem): string {
  return item.id;
}
```

```html
<!-- content-feed.component.html -->
<div *ngFor="let item of items; trackBy: trackByItemId">
  <!-- ... -->
</div>
```

---

## 🧪 TESTABILITÉ

### État facilement testable

```typescript
describe('MobilePageComponent - État', () => {
  let component: MobilePageComponent;
  
  beforeEach(() => {
    component = new MobilePageComponent(/* mocks */);
  });
  
  it('devrait filtrer par catégorie', () => {
    component.activeCategory = 'exercice';
    const filtered = component.filteredItems;
    
    expect(filtered.every(item => item.type === 'exercice')).toBe(true);
  });
  
  it('devrait trier par date récente', () => {
    component.sortOrder = 'recent';
    const filtered = component.filteredItems;
    
    for (let i = 1; i < filtered.length; i++) {
      expect(filtered[i-1].createdAt >= filtered[i].createdAt).toBe(true);
    }
  });
  
  it('devrait calculer le hero correctement', () => {
    component.sortOrder = 'recent';
    const hero = component.heroItem;
    
    expect(hero).toBe(component.filteredItems[0]);
  });
});
```

---

## 📋 RÈGLES DE GESTION

### Règle 1: Catégorie "all"
- Affiche tous les types d'items
- Compteur = somme de tous les items
- Hero = dernier item global

### Règle 2: Catégorie spécifique
- Affiche uniquement les items du type sélectionné
- Compteur = nombre d'items du type
- Hero = dernier item du type

### Règle 3: Tri "recent"
- Ordre décroissant par createdAt
- Hero = item le plus récent

### Règle 4: Tri "old"
- Ordre croissant par createdAt
- Hero = item le plus ancien

### Règle 5: Recherche
- Filtre sur title, description, tags
- Insensible à la casse
- Combiné avec catégorie active

### Règle 6: Compteurs
- Toujours calculés sur allItems (avant filtres)
- Mis à jour uniquement au chargement
- Affichés dans FilterBar

---

## 🎯 VALIDATION PHASE 2

### Checklist

- [x] État minimal défini
- [x] Types TypeScript complets
- [x] Architecture choisie (composant parent)
- [x] Logique de transformation centralisée
- [x] Logique de filtrage centralisée
- [x] Logique de calcul hero centralisée
- [x] Actions publiques définies
- [x] Distribution aux enfants claire
- [x] Optimisations performance prévues
- [x] Testabilité garantie
- [x] Règles de gestion documentées

### Aucune duplication

✅ **Un seul endroit** pour chaque calcul  
✅ **Un seul point de vérité** pour l'état  
✅ **Aucune logique** dans les composants enfants  
✅ **Aucune transformation** dans les templates

---

## 📋 LIVRABLE PHASE 2

### Documents créés
✅ État centralisé complet défini  
✅ Architecture de l'état validée  
✅ Logique de transformation centralisée  
✅ Règles de gestion documentées  
✅ Optimisations performance planifiées

### Validation
✅ Aucune duplication de logique  
✅ Un seul point de vérité  
✅ Composants enfants dumb  
✅ Testabilité maximale  
✅ Performance optimisée

### Prêt pour PHASE 3
✅ État centralisé défini  
✅ Flux de données clair  
✅ Actions identifiées  
✅ Distribution planifiée  
✅ Pas de code écrit (respect de la phase)
