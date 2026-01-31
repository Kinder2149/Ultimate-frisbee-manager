# ♻️ PHASE 3 — RÉUTILISATION STRICTE DE L'EXISTANT

**Date**: 31 janvier 2026  
**Objectif**: Ne RIEN recréer de ce qui existe déjà (anti-doublon)

---

## 🎯 RÈGLE ABSOLUE

> **Le composant carte ne "sait pas" qu'il est mobile**  
> **C'est le layout qui décide comment l'afficher**

### Interdictions strictes
❌ Pas de nouveau composant de carte  
❌ Pas de duplication de logique  
❌ Pas de modification des composants existants  
❌ Pas de props "isMobile"

### Obligations
✅ Réutilisation tel quel  
✅ Adaptation par le CONTENEUR uniquement  
✅ Styles CSS pour l'adaptation visuelle  
✅ Props existantes uniquement

---

## 📦 INVENTAIRE COMPLET DES COMPOSANTS RÉUTILISABLES

### 1. Cartes d'entités

#### A. ExerciceCardComponent ✅ RÉUTILISABLE TEL QUEL

**Fichier**: `@/frontend/src/app/features/exercices/components/exercice-card.component.ts`

**Props existantes**:
```typescript
@Input() exercice: ExerciceInput
@Input() selected: boolean = false
@Input() mode: 'default' | 'entrainement' | 'entrainement-summary' = 'default'
@Input() leftTime: boolean = false
@Output() exerciceDeleted = new EventEmitter<string>()
@Output() exerciceDuplicated = new EventEmitter<Exercice>()
@Output() imageClick = new EventEmitter<string>()
```

**Fonctionnalités**:
- ✅ Expansion/collapse (ligne 64: `expanded: boolean`)
- ✅ Affichage tags par catégorie
- ✅ Actions: voir, éditer, dupliquer, supprimer
- ✅ Gestion images avec viewer
- ✅ Rich text pour description

**Utilisation dans MobilePage**:
```html
<app-exercice-card
  *ngIf="item.type === 'exercice'"
  [exercice]="item.originalData"
  [mode]="'default'"
  (exerciceDeleted)="onItemDelete($event)"
  (exerciceDuplicated)="onItemDuplicate($event)">
</app-exercice-card>
```

**Adaptation CSS** (dans mobile-page.component.scss):
```scss
app-exercice-card {
  display: block;
  margin-bottom: 12px;
  
  // Réutilisation des styles entity-card existants
  ::ng-deep .exercice-card {
    // Déjà responsive via mobile-optimizations.scss
  }
}
```

#### B. Cartes Entraînements ⚠️ PAS DE COMPOSANT DÉDIÉ

**Situation actuelle**:
- HTML directement dans `entrainement-list.component.html`
- Pas de composant réutilisable

**Solution pour MobilePage**:
```html
<!-- Utilisation de mat-card avec structure entity-card -->
<mat-card *ngIf="item.type === 'entrainement'" class="entity-card entrainement-card">
  <mat-card-header class="entity-card-header">
    <mat-card-title>{{ item.title }}</mat-card-title>
    <div class="entity-card-actions">
      <button mat-icon-button (click)="onView(item)">
        <mat-icon>visibility</mat-icon>
      </button>
      <button mat-icon-button (click)="onEdit(item)">
        <mat-icon>edit</mat-icon>
      </button>
      <app-duplicate-button [entityId]="item.id" (duplicate)="onDuplicate($event)">
      </app-duplicate-button>
      <button mat-icon-button (click)="onDelete(item)">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  </mat-card-header>
  
  <mat-card-content class="entity-card-body">
    <div class="info-row" *ngIf="item.duree">
      <span class="label">Durée:</span>
      <span class="value duration">{{ item.duree }} min</span>
    </div>
    
    <div class="tags-display" *ngIf="item.tags?.length">
      <span *ngFor="let tag of item.tags" 
            class="tag" 
            [style.background-color]="tag.color">
        {{ tag.label }}
      </span>
    </div>
  </mat-card-content>
</mat-card>
```

**Styles réutilisés**:
- `.entity-card` (mobile-optimizations.scss ligne 26)
- `.entity-card-header` (ligne 35)
- `.entity-card-actions` (ligne 49)
- `.entity-card-body` (ligne 54)

#### C. Cartes Échauffements ⚠️ PAS DE COMPOSANT DÉDIÉ

**Solution similaire aux entraînements**:
```html
<mat-card *ngIf="item.type === 'echauffement'" class="entity-card echauffement-card">
  <mat-card-header class="entity-card-header">
    <mat-card-title>{{ item.title }}</mat-card-title>
    <div class="entity-card-actions">
      <!-- Actions similaires -->
    </div>
  </mat-card-header>
  
  <mat-card-content class="entity-card-body">
    <div class="info-row" *ngIf="item.nombreBlocs">
      <span class="label">Blocs:</span>
      <span class="value">{{ item.nombreBlocs }}</span>
    </div>
    
    <app-rich-text-view 
      *ngIf="item.description" 
      [content]="item.description"
      [maxLength]="150">
    </app-rich-text-view>
  </mat-card-content>
</mat-card>
```

#### D. Cartes Situations/Matchs ⚠️ PAS DE COMPOSANT DÉDIÉ

**Solution similaire**:
```html
<mat-card *ngIf="item.type === 'situation'" class="entity-card situation-card">
  <!-- Structure identique avec classes entity-card -->
</mat-card>
```

---

### 2. Composants utilitaires

#### A. DuplicateButtonComponent ✅ RÉUTILISABLE TEL QUEL

**Fichier**: `@/frontend/src/app/shared/components/duplicate-button/duplicate-button.component.ts`

**Props**:
```typescript
@Input() entityId: string
@Input() duplicating: boolean = false
@Output() duplicate = new EventEmitter<string>()
```

**Utilisation**:
```html
<app-duplicate-button 
  [entityId]="item.id"
  [duplicating]="isDuplicating(item.id)"
  (duplicate)="onItemDuplicate($event)">
</app-duplicate-button>
```

#### B. RichTextViewComponent ✅ RÉUTILISABLE TEL QUEL

**Fichier**: `@/frontend/src/app/shared/components/rich-text-view/rich-text-view.component.ts`

**Props**:
```typescript
@Input() content: string
@Input() maxLength?: number
```

**Utilisation**:
```html
<app-rich-text-view 
  [content]="item.description"
  [maxLength]="150">
</app-rich-text-view>
```

#### C. ExerciceFiltersComponent ✅ RÉUTILISABLE (avec adaptation)

**Fichier**: `@/frontend/src/app/features/exercices/components/exercice-filters.component.ts`

**Problème**: Nom trompeur, mais utilisé partout

**Solution**: Réutiliser tel quel pour la recherche uniquement

```html
<!-- Dans MobileHeader ou overlay de recherche -->
<app-exercice-filters
  [objectifTags]="[]"
  [travailSpecifiqueTags]="[]"
  [niveauTags]="[]"
  [tempsTags]="[]"
  [formatTags]="[]"
  [showCategoryFilters]="false"
  (filtersChange)="onSearchChange($event.searchTerm)">
</app-exercice-filters>
```

**Note**: Pour MobilePage, on n'utilise QUE la recherche, pas les filtres par tags

---

### 3. Services (tous réutilisables tel quel)

#### A. Services API ✅ AUCUNE MODIFICATION

```typescript
// Dans MobilePageComponent
constructor(
  private exerciceService: ExerciceService,
  private entrainementService: EntrainementService,
  private echauffementService: EchauffementService,
  private situationMatchService: SituationMatchService,
  private tagService: TagService,
  private authService: AuthService,
  private apiUrlService: ApiUrlService,
  private globalPreloader: GlobalPreloaderService
) {}
```

**Méthodes utilisées**:
- `exerciceService.getExercices()` ✅
- `entrainementService.getEntrainements()` ✅
- `echauffementService.getEchauffements()` ✅
- `situationMatchService.getSituationsMatchs()` ✅
- `exerciceService.deleteExercice(id)` ✅
- `exerciceService.duplicateExercice(id)` ✅
- `apiUrlService.getMediaUrl(path, folder)` ✅

#### B. Services de dialog ✅ RÉUTILISATION COMPLÈTE

```typescript
// Injection
constructor(
  private exerciceDialogService: ExerciceDialogService,
  private dialogService: DialogService,
  private dialog: MatDialog
) {}

// Utilisation
onViewExercice(item: ContentItem): void {
  this.exerciceDialogService.openViewDialog(item.originalData as Exercice).subscribe();
}

onViewEntrainement(item: ContentItem): void {
  this.dialogService.open(EntrainementDetailComponent, {
    title: item.title,
    width: '1100px',
    maxWidth: '95vw',
    customData: { entrainementId: item.id }
  });
}

onViewEchauffement(item: ContentItem): void {
  this.dialog.open(EchauffementViewComponent, {
    width: '720px',
    maxWidth: '90vw',
    panelClass: 'entity-view-dialog',
    data: { echauffement: item.originalData }
  });
}

onViewSituation(item: ContentItem): void {
  this.dialog.open(SituationMatchViewComponent, {
    width: '720px',
    maxWidth: '90vw',
    panelClass: 'entity-view-dialog',
    data: { situationMatch: item.originalData }
  });
}
```

---

## 🎨 ADAPTATION PAR LE CONTENEUR

### Principe: Le conteneur décide, pas le composant

#### Template ContentFeed

```html
<div class="content-feed">
  <div class="content-feed__loading" *ngIf="loading">
    <mat-spinner diameter="40"></mat-spinner>
    <p>Chargement...</p>
  </div>
  
  <div class="content-feed__error" *ngIf="error">
    <mat-icon>error</mat-icon>
    <p>{{ error }}</p>
  </div>
  
  <div class="content-feed__items" *ngIf="!loading && !error">
    <ng-container *ngFor="let item of items; trackBy: trackByItemId">
      
      <!-- Exercice: composant dédié -->
      <app-exercice-card
        *ngIf="item.type === 'exercice'"
        [exercice]="item.originalData"
        [mode]="'default'"
        (exerciceDeleted)="onDelete(item)"
        (exerciceDuplicated)="onDuplicate($event)">
      </app-exercice-card>
      
      <!-- Entraînement: mat-card avec structure entity-card -->
      <mat-card *ngIf="item.type === 'entrainement'" 
                class="entity-card entrainement-card"
                (click)="onView(item)">
        <mat-card-header class="entity-card-header">
          <mat-card-title>{{ item.title }}</mat-card-title>
          <div class="entity-card-actions" (click)="$event.stopPropagation()">
            <button mat-icon-button (click)="onView(item)" matTooltip="Voir">
              <mat-icon>visibility</mat-icon>
            </button>
            <button mat-icon-button (click)="onEdit(item)" matTooltip="Modifier">
              <mat-icon>edit</mat-icon>
            </button>
            <app-duplicate-button 
              [entityId]="item.id"
              (duplicate)="onDuplicate($event)">
            </app-duplicate-button>
            <button mat-icon-button (click)="onDelete(item)" matTooltip="Supprimer">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-card-header>
        
        <mat-card-content class="entity-card-body">
          <div class="info-row" *ngIf="item.duree">
            <span class="label">Durée:</span>
            <span class="value duration">{{ formatDuree(item.duree) }}</span>
          </div>
          
          <div class="tags-display" *ngIf="item.tags?.length">
            <span *ngFor="let tag of item.tags" 
                  class="tag" 
                  [style.background-color]="tag.color">
              {{ tag.label }}
            </span>
          </div>
          
          <div class="created-at">
            Créé le {{ item.createdAt | date:'dd/MM/yyyy' }}
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Échauffement: mat-card avec structure entity-card -->
      <mat-card *ngIf="item.type === 'echauffement'" 
                class="entity-card echauffement-card"
                (click)="onView(item)">
        <!-- Structure similaire -->
      </mat-card>
      
      <!-- Situation: mat-card avec structure entity-card -->
      <mat-card *ngIf="item.type === 'situation'" 
                class="entity-card situation-card"
                (click)="onView(item)">
        <!-- Structure similaire -->
      </mat-card>
      
    </ng-container>
  </div>
  
  <div class="content-feed__empty" *ngIf="!loading && !error && items.length === 0">
    <mat-icon>inbox</mat-icon>
    <p>Aucun élément à afficher</p>
  </div>
</div>
```

#### Styles ContentFeed (content-feed.component.scss)

```scss
.content-feed {
  padding: var(--mobile-padding);
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  &__items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  &__loading,
  &__error,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    text-align: center;
    color: var(--text-muted);
    
    mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: var(--spacing-md);
    }
  }
  
  // Réutilisation des styles entity-card existants
  // Pas besoin de redéfinir, déjà dans mobile-optimizations.scss
}
```

---

## 🔄 GESTION DES ACTIONS

### Actions communes à tous les types

```typescript
// Dans ContentFeedComponent
@Output() itemView = new EventEmitter<ContentItem>();
@Output() itemEdit = new EventEmitter<ContentItem>();
@Output() itemDuplicate = new EventEmitter<ContentItem>();
@Output() itemDelete = new EventEmitter<ContentItem>();

onView(item: ContentItem): void {
  this.itemView.emit(item);
}

onEdit(item: ContentItem): void {
  this.itemEdit.emit(item);
}

onDuplicate(item: ContentItem): void {
  this.itemDuplicate.emit(item);
}

onDelete(item: ContentItem): void {
  this.itemDelete.emit(item);
}
```

### Gestion dans MobilePage

```typescript
// Dans MobilePageComponent
onItemView(item: ContentItem): void {
  switch (item.type) {
    case 'exercice':
      this.exerciceDialogService.openViewDialog(item.originalData as Exercice).subscribe();
      break;
    case 'entrainement':
      this.openEntrainementDialog(item);
      break;
    case 'echauffement':
      this.openEchauffementDialog(item);
      break;
    case 'situation':
      this.openSituationDialog(item);
      break;
  }
}

onItemEdit(item: ContentItem): void {
  const routes: Record<ContentItem['type'], string[]> = {
    exercice: ['/exercices/modifier', item.id],
    entrainement: ['/entrainements/modifier', item.id],
    echauffement: ['/echauffements/modifier', item.id],
    situation: ['/situations-matchs/modifier', item.id]
  };
  
  this.router.navigate(routes[item.type]);
}

onItemDuplicate(item: ContentItem): void {
  const services: Record<ContentItem['type'], any> = {
    exercice: this.exerciceService,
    entrainement: this.entrainementService,
    echauffement: this.echauffementService,
    situation: this.situationMatchService
  };
  
  const service = services[item.type];
  const methodName = `duplicate${this.capitalize(item.type)}`;
  
  service[methodName](item.id).subscribe({
    next: (duplicated: any) => {
      this.snackBar.open('Élément dupliqué avec succès', 'Fermer', { duration: 3000 });
      this.reloadData();
    },
    error: (err: any) => {
      console.error('Erreur duplication:', err);
      this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
    }
  });
}

onItemDelete(item: ContentItem): void {
  const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer "${item.title}" ?`);
  
  if (!confirmation) return;
  
  const services: Record<ContentItem['type'], any> = {
    exercice: this.exerciceService,
    entrainement: this.entrainementService,
    echauffement: this.echauffementService,
    situation: this.situationMatchService
  };
  
  const service = services[item.type];
  const methodName = `delete${this.capitalize(item.type)}`;
  
  service[methodName](item.id).subscribe({
    next: () => {
      this.snackBar.open('Élément supprimé avec succès', 'Fermer', { duration: 3000 });
      this.reloadData();
    },
    error: (err: any) => {
      console.error('Erreur suppression:', err);
      this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
    }
  });
}

private capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

---

## 📋 MATRICE DE RÉUTILISATION

| Composant | Statut | Modification | Utilisation |
|-----------|--------|--------------|-------------|
| `ExerciceCardComponent` | ✅ Réutilisable | Aucune | Tel quel avec props existantes |
| `DuplicateButtonComponent` | ✅ Réutilisable | Aucune | Tel quel |
| `RichTextViewComponent` | ✅ Réutilisable | Aucune | Tel quel |
| `ExerciceFiltersComponent` | ⚠️ Partiel | Aucune | Recherche uniquement |
| Cartes Entraînements | ❌ Inexistant | Création HTML | Structure entity-card |
| Cartes Échauffements | ❌ Inexistant | Création HTML | Structure entity-card |
| Cartes Situations | ❌ Inexistant | Création HTML | Structure entity-card |
| `ExerciceService` | ✅ Réutilisable | Aucune | Tel quel |
| `EntrainementService` | ✅ Réutilisable | Aucune | Tel quel |
| `EchauffementService` | ✅ Réutilisable | Aucune | Tel quel |
| `SituationMatchService` | ✅ Réutilisable | Aucune | Tel quel |
| `ExerciceDialogService` | ✅ Réutilisable | Aucune | Tel quel |
| `DialogService` | ✅ Réutilisable | Aucune | Tel quel |
| Dialogs de visualisation | ✅ Réutilisable | Aucune | Tel quel |
| Styles `.entity-card` | ✅ Réutilisable | Aucune | CSS existant |

---

## ✅ VALIDATION PHASE 3

### Checklist

- [x] Composants réutilisables identifiés
- [x] Aucune modification des composants existants
- [x] Adaptation par le conteneur uniquement
- [x] Services réutilisés tel quel
- [x] Dialogs réutilisés tel quel
- [x] Styles CSS réutilisés
- [x] Actions centralisées dans MobilePage
- [x] Aucune duplication de logique

### Aucune modification nécessaire

✅ **ExerciceCardComponent**: utilisé tel quel  
✅ **Services API**: utilisés tel quel  
✅ **Dialogs**: utilisés tel quel  
✅ **Styles entity-card**: réutilisés tel quel

### Création minimale

⚠️ **HTML pour cartes manquantes**: structure entity-card uniquement  
⚠️ **ContentFeedComponent**: nouveau conteneur (pas de carte)

---

## 📋 LIVRABLE PHASE 3

### Documents créés
✅ Matrice de réutilisation complète  
✅ Identification composants existants  
✅ Plan d'adaptation par conteneur  
✅ Gestion actions centralisée  
✅ Aucune modification nécessaire validée

### Validation
✅ Réutilisation maximale  
✅ Aucune duplication  
✅ Adaptation par CSS uniquement  
✅ Composants ignorent le contexte mobile  
✅ Conteneur gère l'affichage

### Prêt pour PHASE 4
✅ Composants identifiés  
✅ Réutilisation planifiée  
✅ Adaptation définie  
✅ Actions centralisées  
✅ Prêt pour implémentation
