import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, Subject, fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileFilterBarComponent } from '../../components/mobile-filter-bar/mobile-filter-bar.component';
import { HeroContextuelComponent } from '../../components/hero-contextuel/hero-contextuel.component';
import { ContentFeedComponent } from '../../components/content-feed/content-feed.component';

import { CategoryType, SortOrder, ContentItem } from '../../models/content-item.model';
import { Exercice } from '../../../../core/models/exercice.model';
import { Entrainement } from '../../../../core/models/entrainement.model';
import { Echauffement } from '../../../../core/models/echauffement.model';
import { SituationMatch } from '../../../../core/models/situationmatch.model';
import { User } from '../../../../core/models/user.model';

import { ExerciceService } from '../../../../core/services/exercice.service';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { EchauffementService } from '../../../../core/services/echauffement.service';
import { SituationMatchService } from '../../../../core/services/situationmatch.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ExerciceDialogService } from '../../../exercices/services/exercice-dialog.service';
import { DialogService } from '../../../../shared/components/dialog/dialog.service';
import { MobileDetectorService } from '../../../../core/services/mobile-detector.service';

@Component({
  selector: 'app-mobile-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MobileHeaderComponent,
    MobileFilterBarComponent,
    HeroContextuelComponent,
    ContentFeedComponent
  ],
  templateUrl: './mobile-page.component.html',
  styleUrls: ['./mobile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobilePageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  private exercices: Exercice[] = [];
  private entrainements: Entrainement[] = [];
  private echauffements: Echauffement[] = [];
  private situationsMatchs: SituationMatch[] = [];
  
  activeCategory: CategoryType = 'all';
  sortOrder: SortOrder = 'recent';
  searchQuery = '';
  
  loading = false;
  error: string | null = null;
  
  currentUser: User | null = null;
  returnUrl: string | undefined;
  
  private _allItemsCache: ContentItem[] | null = null;
  private _lastDataHash = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private exerciceService: ExerciceService,
    private entrainementService: EntrainementService,
    private echauffementService: EchauffementService,
    private situationMatchService: SituationMatchService,
    private authService: AuthService,
    private exerciceDialogService: ExerciceDialogService,
    private dialogService: DialogService,
    private mobileDetector: MobileDetectorService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadReturnUrl();
    this.loadAllData();
    this.setupResizeListener();
  }

  private setupResizeListener(): void {
    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroy$),
        filter(() => !this.mobileDetector.shouldShowMobileView && window.innerWidth >= 768)
      )
      .subscribe(() => {
        this.showDesktopSuggestion();
      });
  }

  private showDesktopSuggestion(): void {
    const snackBarRef = this.snackBar.open(
      'Votre écran est maintenant assez grand pour la version desktop',
      'Passer en desktop',
      { duration: 8000 }
    );

    snackBarRef.onAction().subscribe(() => {
      this.mobileDetector.forceDesktop();
      const targetUrl = this.returnUrl || '/';
      this.router.navigate([targetUrl]);
    });
  }

  private loadReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || undefined;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.currentUser = user;
      });
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
        
        this._allItemsCache = null;
        
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

  get allItems(): ContentItem[] {
    const currentHash = this.calculateDataHash();
    
    if (this._lastDataHash === currentHash && this._allItemsCache) {
      return this._allItemsCache;
    }
    
    this._allItemsCache = this.transformToContentItems();
    this._lastDataHash = currentHash;
    
    return this._allItemsCache;
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

  private calculateDataHash(): string {
    return `${this.exercices.length}-${this.entrainements.length}-${this.echauffements.length}-${this.situationsMatchs.length}`;
  }

  private transformToContentItems(): ContentItem[] {
    const items: ContentItem[] = [];

    this.exercices.forEach(exercice => {
      if (!exercice.id) return;
      items.push({
        id: exercice.id,
        type: 'exercice',
        title: exercice.nom,
        description: exercice.description,
        createdAt: new Date(exercice.createdAt!),
        tags: exercice.tags,
        imageUrl: exercice.imageUrl,
        originalData: exercice
      });
    });

    this.entrainements.forEach(entrainement => {
      if (!entrainement.id) return;
      items.push({
        id: entrainement.id,
        type: 'entrainement',
        title: entrainement.titre,
        createdAt: new Date(entrainement.createdAt!),
        tags: entrainement.tags,
        duree: this.calculateDureeEntrainement(entrainement),
        originalData: entrainement
      });
    });

    this.echauffements.forEach(echauffement => {
      if (!echauffement.id) return;
      items.push({
        id: echauffement.id,
        type: 'echauffement',
        title: echauffement.nom,
        description: echauffement.description,
        createdAt: new Date(echauffement.createdAt!),
        nombreBlocs: echauffement.blocs?.length || 0,
        originalData: echauffement
      });
    });

    this.situationsMatchs.forEach(situation => {
      if (!situation.id) return;
      items.push({
        id: situation.id,
        type: 'situation',
        title: situation.nom || 'Sans titre',
        description: situation.description,
        createdAt: new Date(situation.createdAt!),
        tags: situation.tags,
        imageUrl: situation.imageUrl,
        originalData: situation
      });
    });

    return items;
  }

  private applyFilters(items: ContentItem[]): ContentItem[] {
    let filtered = [...items];

    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(item => item.type === this.activeCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.label.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      return this.sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }

  private calculateHeroItem(items: ContentItem[]): ContentItem | null {
    if (items.length === 0) return null;
    return items[0];
  }

  private calculateCategoryCount(items: ContentItem[]): Record<CategoryType, number> {
    const counts: Record<CategoryType, number> = {
      all: items.length,
      exercice: 0,
      entrainement: 0,
      echauffement: 0,
      situation: 0
    };

    items.forEach(item => {
      if (item.type in counts) {
        counts[item.type]++;
      }
    });

    return counts;
  }

  private calculateDureeEntrainement(entrainement: Entrainement): number {
    if (!entrainement.exercices || entrainement.exercices.length === 0) {
      return 0;
    }
    
    return entrainement.exercices.reduce((total, ex) => {
      if (!ex.duree) return total;
      const duree = typeof ex.duree === 'number' ? ex.duree : parseInt(String(ex.duree), 10) || 0;
      return total + duree;
    }, 0);
  }

  onCategoryChange(category: CategoryType): void {
    this.activeCategory = category;
  }

  onSortChange(order: SortOrder): void {
    this.sortOrder = order;
  }

  onSearchClick(): void {
    console.log('[MobilePage] Recherche cliquée - À implémenter');
  }

  onSettingsClick(): void {
    this.router.navigate(['/parametres']);
  }

  onProfileClick(): void {
    this.router.navigate(['/profil']);
  }

  onTagsClick(): void {
    this.router.navigate(['/tags']);
  }

  onAdminClick(): void {
    this.router.navigate(['/admin']);
  }

  onLogoutClick(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onItemView(item: ContentItem): void {
    switch (item.type) {
      case 'exercice':
        this.exerciceDialogService.openViewDialog(item.originalData as Exercice).subscribe();
        break;
      case 'entrainement':
        this.router.navigate(['/entrainements/voir', item.id]);
        break;
      case 'echauffement':
        this.router.navigate(['/echauffements/voir', item.id]);
        break;
      case 'situation':
        this.router.navigate(['/situations-matchs/voir', item.id]);
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

    if (typeof service[methodName] !== 'function') {
      console.error(`Méthode ${methodName} non trouvée sur le service`);
      this.snackBar.open('Fonctionnalité non disponible', 'Fermer', { duration: 3000 });
      return;
    }

    service[methodName](item.id).subscribe({
      next: () => {
        this.snackBar.open('Élément dupliqué avec succès', 'Fermer', { duration: 3000 });
        this.loadAllData();
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

    if (typeof service[methodName] !== 'function') {
      console.error(`Méthode ${methodName} non trouvée sur le service`);
      this.snackBar.open('Fonctionnalité non disponible', 'Fermer', { duration: 3000 });
      return;
    }

    service[methodName](item.id).subscribe({
      next: () => {
        this.snackBar.open('Élément supprimé avec succès', 'Fermer', { duration: 3000 });
        this.loadAllData();
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
}
