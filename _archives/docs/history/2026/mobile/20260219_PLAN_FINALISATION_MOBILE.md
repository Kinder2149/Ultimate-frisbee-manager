# PLAN DE FINALISATION MOBILE

**Date** : 2026-02-19  
**Statut** : WORK  
**Document de référence** : `docs/reference/MOBILE_SPECIFICATION.md` v3.0  
**État actuel** : `docs/work/20260219_ETAT_FINAL_MOBILE.md`

---

## 🎯 OBJECTIF

Finaliser la mission mobile pour atteindre **100% de conformité contractuelle** et **validation complète**.

**Progression actuelle** : 85% (12/14 fonctionnalités)  
**Progression cible** : 100% (14/14 fonctionnalités)  
**Temps estimé** : 12-18 heures

---

## 📋 PLAN D'ACTION DÉTAILLÉ

### PHASE 1 : Compléter fonctionnalités critiques (4-6h)

#### 1.1 Implémenter actions Detail (2h)

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail-simple.component.ts`

**Actions à réaliser** :

1. **Ajouter méthode `onDuplicate()`**
   ```typescript
   onDuplicate(): void {
     const canDuplicate = this.permissionsService.canCreate(this.itemType);
     if (!canDuplicate) {
       this.snackBar.open('Permissions insuffisantes', 'OK', { duration: 3000 });
       return;
     }
     
     // Appel service CRUD selon type
     switch (this.itemType) {
       case 'exercice':
         this.exerciceService.duplicateExercice(this.itemId).subscribe({
           next: (newItem) => {
             this.snackBar.open('Exercice dupliqué', 'OK', { duration: 3000 });
             this.router.navigate(['/mobile/detail/exercice', newItem.id]);
           },
           error: () => this.snackBar.open('Erreur duplication', 'OK', { duration: 3000 })
         });
         break;
       // Idem pour autres types
     }
   }
   ```

2. **Ajouter méthode `onDelete()`**
   ```typescript
   onDelete(): void {
     const canDelete = this.permissionsService.canDelete(this.itemType);
     if (!canDelete) {
       this.snackBar.open('Permissions insuffisantes', 'OK', { duration: 3000 });
       return;
     }
     
     // Ouvrir dialog confirmation
     const dialogRef = this.dialog.open(MobileConfirmDialogComponent, {
       data: {
         title: 'Confirmer la suppression',
         message: `Voulez-vous vraiment supprimer "${this.itemTitle}" ?`,
         confirmLabel: 'Supprimer',
         confirmColor: 'warn'
       }
     });
     
     dialogRef.afterClosed().subscribe(confirmed => {
       if (confirmed) {
         this.deleteItem();
       }
     });
   }
   
   private deleteItem(): void {
     switch (this.itemType) {
       case 'exercice':
         this.exerciceService.deleteExercice(this.itemId).subscribe({
           next: () => {
             this.snackBar.open('Exercice supprimé', 'OK', { duration: 3000 });
             this.router.navigate(['/mobile/library']);
           },
           error: () => this.snackBar.open('Erreur suppression', 'OK', { duration: 3000 })
         });
         break;
       // Idem pour autres types
     }
   }
   ```

3. **Ajouter boutons dans template**
   ```html
   <div class="actions-section">
     <button mat-raised-button color="primary" (click)="toggleFavorite()">
       <mat-icon>{{ isFavorite() ? 'star' : 'star_border' }}</mat-icon>
       {{ isFavorite() ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
     </button>
     
     <button mat-raised-button (click)="onDuplicate()">
       <mat-icon>content_copy</mat-icon>
       Dupliquer
     </button>
     
     <button mat-raised-button color="warn" (click)="onDelete()">
       <mat-icon>delete</mat-icon>
       Supprimer
     </button>
   </div>
   ```

4. **Compléter headerActions**
   ```typescript
   private setupHeaderActions(): void {
     this.headerActions = [
       {
         icon: 'edit',
         label: 'Éditer',
         action: () => this.router.navigate(['/mobile/edit', this.itemType, this.itemId])
       },
       {
         icon: 'content_copy',
         label: 'Dupliquer',
         action: () => this.onDuplicate()
       },
       {
         icon: 'delete',
         label: 'Supprimer',
         action: () => this.onDelete()
       },
       {
         icon: 'share',
         label: 'Partager',
         action: () => this.onShare()
       }
     ];
   }
   ```

**Imports à ajouter** :
```typescript
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MobileConfirmDialogComponent } from '../../components/mobile-confirm-dialog/mobile-confirm-dialog.component';
```

**Tests à effectuer** :
- [ ] Duplication exercice fonctionne
- [ ] Duplication entraînement fonctionne
- [ ] Suppression avec confirmation fonctionne
- [ ] Permissions vérifiées
- [ ] Redirections correctes

---

#### 1.2 Implémenter recherche/filtres Library (2-4h)

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-library/mobile-library.component.ts`

**Actions à réaliser** :

1. **Ajouter champ recherche dans template**
   ```html
   <mat-tab-group [(selectedIndex)]="selectedTabIndex">
     <mat-tab label="Exercices">
       <!-- Barre recherche -->
       <div class="search-bar">
         <mat-form-field appearance="outline">
           <mat-icon matPrefix>search</mat-icon>
           <input matInput placeholder="Rechercher..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()">
           <button matSuffix mat-icon-button *ngIf="searchQuery" (click)="clearSearch()">
             <mat-icon>close</mat-icon>
           </button>
         </mat-form-field>
       </div>
       
       <!-- Liste filtrée -->
       <div *ngFor="let exercice of filteredExercices$ | async" (click)="onItemClick('exercice', exercice.id)">
         <h3>{{ exercice.nom }}</h3>
         <p>{{ exercice['duree_minutes'] || 0 }} min</p>
       </div>
     </mat-tab>
     <!-- Idem pour autres tabs -->
   </mat-tab-group>
   ```

2. **Ajouter logique filtrage dans component**
   ```typescript
   searchQuery = '';
   private searchSubject = new Subject<string>();
   
   filteredExercices$!: Observable<Exercice[]>;
   filteredEntrainements$!: Observable<Entrainement[]>;
   // etc.
   
   ngOnInit(): void {
     // Setup search debounce
     this.searchSubject.pipe(
       debounceTime(300),
       takeUntil(this.destroy$)
     ).subscribe(query => {
       this.applyFilters();
     });
     
     // Initial load
     this.loadData();
   }
   
   onSearchChange(): void {
     this.searchSubject.next(this.searchQuery);
   }
   
   clearSearch(): void {
     this.searchQuery = '';
     this.applyFilters();
   }
   
   private applyFilters(): void {
     const query = this.searchQuery.toLowerCase();
     
     this.filteredExercices$ = this.exercices$.pipe(
       map(items => items.filter(item => 
         item.nom.toLowerCase().includes(query) ||
         (item.description && item.description.toLowerCase().includes(query))
       ))
     );
     
     // Idem pour autres types
   }
   ```

3. **Ajouter bouton filtres avancés (bottom sheet)**
   ```html
   <button mat-icon-button (click)="openFilters()">
     <mat-icon [matBadge]="activeFiltersCount" matBadgeColor="accent">filter_list</mat-icon>
   </button>
   ```

4. **Créer bottom sheet filtres**
   ```typescript
   openFilters(): void {
     const bottomSheetRef = this.bottomSheet.open(MobileFiltersBottomSheetComponent, {
       data: {
         tags: this.allTags,
         selectedTags: this.selectedTags,
         duranceRange: this.durationRange,
         playersRange: this.playersRange
       }
     });
     
     bottomSheetRef.afterDismissed().subscribe(filters => {
       if (filters) {
         this.selectedTags = filters.tags;
         this.durationRange = filters.duration;
         this.playersRange = filters.players;
         this.applyFilters();
       }
     });
   }
   ```

**Composant à créer** : `MobileFiltersBottomSheetComponent`

**Tests à effectuer** :
- [ ] Recherche fonctionne (debounce 300ms)
- [ ] Filtres par tags fonctionnent
- [ ] Filtres par durée fonctionnent
- [ ] Filtres par joueurs fonctionnent
- [ ] Compteur filtres actifs correct
- [ ] Bottom sheet s'ouvre/ferme correctement

---

### PHASE 2 : Tests manuels complets (6-8h)

#### 2.1 Parcours création (2h)

**Exercice** :
1. [ ] Naviguer vers onglet "Créer"
2. [ ] Sélectionner "Exercice"
3. [ ] Remplir étape 1 (nom, description)
4. [ ] Remplir étape 2 (durée, joueurs, matériel)
5. [ ] Ajouter image étape 3
6. [ ] Sélectionner tags étape 4
7. [ ] Vérifier résumé étape 5
8. [ ] Valider création
9. [ ] Vérifier redirection vers détail
10. [ ] Vérifier données sauvegardées en base

**Entraînement** :
1. [ ] Sélectionner "Entraînement"
2. [ ] Remplir titre, date
3. [ ] Sélectionner échauffement
4. [ ] Sélectionner exercices
5. [ ] Tester drag & drop ordre exercices
6. [ ] Vérifier durée totale calculée
7. [ ] Sélectionner situation
8. [ ] Ajouter tags
9. [ ] Valider création
10. [ ] Vérifier relations sauvegardées

**Échauffement** :
1. [ ] Sélectionner "Échauffement"
2. [ ] Remplir nom, description
3. [ ] Ajouter 3 blocs
4. [ ] Supprimer 1 bloc
5. [ ] Valider création
6. [ ] Vérifier blocs sauvegardés

**Situation** :
1. [ ] Sélectionner "Situation"
2. [ ] Remplir informations
3. [ ] Ajouter image
4. [ ] Ajouter tags
5. [ ] Valider création
6. [ ] Vérifier sauvegarde

#### 2.2 Parcours édition (2h)

**Pour chaque type** :
1. [ ] Naviguer vers Library
2. [ ] Sélectionner un élément
3. [ ] Cliquer "Éditer"
4. [ ] Vérifier pré-remplissage formulaire
5. [ ] Modifier données
6. [ ] Sauvegarder
7. [ ] Vérifier modifications appliquées

#### 2.3 Parcours Library (1h)

1. [ ] Tester recherche dans chaque tab
2. [ ] Tester filtres avancés
3. [ ] Tester tri
4. [ ] Tester bouton "+" → redirection `/mobile/create/:type`
5. [ ] Vérifier compteur éléments

#### 2.4 Parcours Detail (1h)

1. [ ] Tester visualiseur images (swipe, zoom)
2. [ ] Tester sections collapsibles
3. [ ] Tester favoris
4. [ ] Tester duplication
5. [ ] Tester suppression (avec confirmation)
6. [ ] Tester édition

#### 2.5 Parcours Terrain (30min)

1. [ ] Démarrer chronomètre
2. [ ] Vérifier comptage
3. [ ] Ajouter notes
4. [ ] Vérifier sauvegarde auto (1s)
5. [ ] Changer d'onglet
6. [ ] Vérifier chrono arrêté
7. [ ] Revenir sur Terrain
8. [ ] Vérifier notes persistées

#### 2.6 Tests navigateurs (30min)

1. [ ] Chrome Mobile (Android)
2. [ ] Safari Mobile (iOS)
3. [ ] Firefox Mobile
4. [ ] Tablette (iPad ou Android)

---

### PHASE 3 : Corrections bugs (2-4h)

**À effectuer après tests Phase 2**

1. [ ] Lister tous les bugs identifiés
2. [ ] Prioriser (critiques, importants, mineurs)
3. [ ] Corriger bugs critiques
4. [ ] Corriger bugs importants
5. [ ] Documenter bugs mineurs (backlog)

**Corrections connues à effectuer** :
- [ ] Vérifier propriété Tag : `nom` vs `name`
- [ ] Vérifier signature `UploadService.uploadImage()`
- [ ] Corriger types `boolean | undefined` → `boolean`

---

### PHASE 4 : Optimisations (2-4h)

#### 4.1 Optimiser bundle (2h)

1. **Code splitting agressif**
   ```typescript
   // Lazy load Material modules
   const MatDialogModule = () => import('@angular/material/dialog').then(m => m.MatDialogModule);
   ```

2. **Lazy loading images**
   ```html
   <img [src]="image" loading="lazy" />
   ```

3. **Tree shaking**
   - Vérifier imports inutilisés
   - Supprimer code mort

4. **Compression**
   - Activer Gzip/Brotli
   - Optimiser images (WebP)

**Objectif** : Réduire bundle de 1.6 MB à < 1 MB

#### 4.2 Améliorer performance (1-2h)

1. **OnPush change detection**
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

2. **TrackBy functions**
   ```typescript
   trackByFn(index: number, item: any): any {
     return item.id;
   }
   ```

3. **Virtual scrolling** (si listes longues)
   ```html
   <cdk-virtual-scroll-viewport itemSize="50">
     <div *cdkVirtualFor="let item of items">{{ item }}</div>
   </cdk-virtual-scroll-viewport>
   ```

---

### PHASE 5 : Validation finale (2h)

#### 5.1 Remplir checklist validation (1h)

**Fichier** : `docs/work/20260218_CHECKLIST_VALIDATION_MOBILE.md`

- [ ] Cocher toutes les cases
- [ ] Documenter blocages identifiés
- [ ] Lister corrections nécessaires
- [ ] Valider conformité 100%

#### 5.2 Documentation finale (1h)

1. **Créer CHANGELOG mobile**
   ```markdown
   # CHANGELOG MOBILE
   
   ## v1.0.0 (2026-02-19)
   
   ### Ajouté
   - Navigation 5 onglets
   - Création/édition 4 types
   - Recherche/filtres Library
   - Actions Detail complètes
   - Mode Terrain avec notes
   
   ### Corrigé
   - [Liste des bugs corrigés]
   
   ### Optimisé
   - Bundle réduit à < 1 MB
   - Performance améliorée
   ```

2. **Mettre à jour README mobile**
   - Guide utilisation
   - Captures d'écran
   - Prérequis
   - Installation

3. **Archiver documents work terminés**
   - Déplacer vers `docs/history/2026/02-fevrier/`

---

## 📊 SUIVI PROGRESSION

### Checklist globale

**Phase 1 : Fonctionnalités critiques**
- [ ] Actions Detail (dupliquer, supprimer)
- [ ] Recherche Library
- [ ] Filtres avancés Library

**Phase 2 : Tests manuels**
- [ ] Parcours création (4 types)
- [ ] Parcours édition (4 types)
- [ ] Parcours Library
- [ ] Parcours Detail
- [ ] Parcours Terrain
- [ ] Tests navigateurs

**Phase 3 : Corrections**
- [ ] Bugs critiques corrigés
- [ ] Bugs importants corrigés
- [ ] Corrections connues effectuées

**Phase 4 : Optimisations**
- [ ] Bundle < 1 MB
- [ ] Performance optimisée
- [ ] Images optimisées

**Phase 5 : Validation**
- [ ] Checklist validation remplie
- [ ] Conformité contractuelle 100%
- [ ] Documentation finale

---

## 🎯 CRITÈRES DE SUCCÈS

### Fonctionnels
- ✅ 14/14 fonctionnalités implémentées
- ✅ Tous les parcours critiques validés
- ✅ Aucun bug critique
- ✅ Conformité contractuelle 100%

### Techniques
- ✅ Build sans erreurs ni warnings
- ✅ Bundle < 1 MB
- ✅ Performance : FCP < 1.5s, LCP < 2.5s
- ✅ Compatible Chrome/Safari/Firefox mobile

### Qualité
- ✅ Code propre (pas de duplication)
- ✅ Tests manuels complets
- ✅ Documentation à jour
- ✅ Checklist validation remplie

---

## 📅 PLANNING ESTIMÉ

**Jour 1 (6h)** :
- Matin (3h) : Phase 1.1 (Actions Detail)
- Après-midi (3h) : Phase 1.2 (Recherche/filtres Library)

**Jour 2 (6h)** :
- Matin (3h) : Phase 2.1-2.3 (Tests création, édition, library)
- Après-midi (3h) : Phase 2.4-2.6 (Tests detail, terrain, navigateurs)

**Jour 3 (6h)** :
- Matin (3h) : Phase 3 (Corrections bugs)
- Après-midi (3h) : Phase 4 (Optimisations)

**Total** : 18h réparties sur 3 jours

---

## 🚨 RISQUES IDENTIFIÉS

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Bugs critiques lors tests | Élevée | Élevé | Tests exhaustifs + corrections immédiates |
| Dépassement temps estimé | Moyenne | Moyen | Prioriser fonctionnalités critiques |
| Incompatibilité navigateurs | Faible | Élevé | Tests multi-navigateurs dès Phase 2 |
| Performance insuffisante | Moyenne | Moyen | Optimisations Phase 4 |
| Propriétés modèles incorrectes | Faible | Moyen | Vérification dès Phase 3 |

---

## 📝 NOTES

- **Prioriser** : Phases 1-3 sont critiques, Phase 4 est optionnelle
- **Tests** : Ne pas négliger Phase 2, c'est là que les bugs seront détectés
- **Documentation** : Maintenir à jour au fur et à mesure
- **Communication** : Informer l'équipe de la progression

---

**Document créé le** : 2026-02-19  
**Auteur** : Cascade AI  
**Basé sur** : MOBILE_SPECIFICATION.md v3.0 + ETAT_FINAL_MOBILE.md
