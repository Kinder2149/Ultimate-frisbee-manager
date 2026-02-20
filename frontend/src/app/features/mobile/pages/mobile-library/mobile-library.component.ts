import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, map, startWith } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationService } from '../../../../core/services/mobile-navigation.service';
import { WorkspaceDataStore } from '../../../../core/services/workspace-data.store';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { StripHtmlPipe } from '../../../../shared/pipes/strip-html.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-mobile-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MobileHeaderComponent,
    StripHtmlPipe
  ],
  templateUrl: './mobile-library.component.html',
  styleUrls: ['./mobile-library.component.scss']
})
export class MobileLibraryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  
  selectedType: string | null = null;
  searchQuery = '';

  exercices$!: Observable<any[]>;
  entrainements$!: Observable<any[]>;
  echauffements$!: Observable<any[]>;
  situations$!: Observable<any[]>;

  filteredExercices$!: Observable<any[]>;
  filteredEntrainements$!: Observable<any[]>;
  filteredEchauffements$!: Observable<any[]>;
  filteredSituations$!: Observable<any[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mobileNavigationService: MobileNavigationService,
    private workspaceDataStore: WorkspaceDataStore,
    public permissionsService: PermissionsService
  ) {}

  ngOnInit(): void {
    this.mobileNavigationService.setCurrentTab('library');
    
    // Read type query param for deep linking
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const type = params['type'];
        if (type && ['exercice', 'entrainement', 'echauffement', 'situation'].includes(type)) {
          this.selectedType = type;
        }
      });
    
    // Initialize observables
    this.exercices$ = this.workspaceDataStore.exercices$;
    this.entrainements$ = this.workspaceDataStore.entrainements$;
    this.echauffements$ = this.workspaceDataStore.echauffements$;
    this.situations$ = this.workspaceDataStore.situations$;
    
    // Setup search with debounce
    const search$ = this.searchSubject$.pipe(
      debounceTime(300),
      startWith(''),
      takeUntil(this.destroy$)
    );
    
    // Filter exercices
    this.filteredExercices$ = combineLatest([this.exercices$, search$]).pipe(
      map(([items, query]) => this.filterItems(items, query))
    );
    
    // Filter entrainements
    this.filteredEntrainements$ = combineLatest([this.entrainements$, search$]).pipe(
      map(([items, query]) => this.filterItems(items, query, 'titre'))
    );
    
    // Filter echauffements
    this.filteredEchauffements$ = combineLatest([this.echauffements$, search$]).pipe(
      map(([items, query]) => this.filterItems(items, query))
    );
    
    // Filter situations
    this.filteredSituations$ = combineLatest([this.situations$, search$]).pipe(
      map(([items, query]) => this.filterItems(items, query))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectType(type: string): void {
    this.selectedType = type;
    this.searchQuery = '';
    this.searchSubject$.next('');
  }

  onAddClick(): void {
    if (!this.selectedType) return;
    this.router.navigate(['/mobile/create', this.selectedType]);
  }
  
  getTypePlural(type: string): string {
    const plurals: { [key: string]: string } = {
      'exercice': 'un exercice',
      'entrainement': 'un entraînement',
      'echauffement': 'un échauffement',
      'situation': 'une situation'
    };
    return plurals[type] || '';
  }
  
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'exercice': 'Exercices',
      'entrainement': 'Entraînements',
      'echauffement': 'Échauffements',
      'situation': 'Situations'
    };
    return labels[type] || '';
  }
  
  getCurrentItems$(): Observable<any[]> {
    switch (this.selectedType) {
      case 'exercice': return this.filteredExercices$;
      case 'entrainement': return this.filteredEntrainements$;
      case 'echauffement': return this.filteredEchauffements$;
      case 'situation': return this.filteredSituations$;
      default: return new Observable();
    }
  }

  onItemClick(type: string, id: string): void {
    this.router.navigate(['/mobile/detail', type, id]);
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchQuery);
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject$.next('');
  }
  
  private filterItems(items: any[], query: string, titleField: string = 'nom'): any[] {
    if (!query || query.trim() === '') {
      return items;
    }
    
    const lowerQuery = query.toLowerCase();
    return items.filter(item => {
      const title = item[titleField]?.toLowerCase() || '';
      const description = item.description?.toLowerCase() || '';
      return title.includes(lowerQuery) || description.includes(lowerQuery);
    });
  }
  
  getFullImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${environment.apiUrl.replace('/api', '')}/uploads/${imageUrl}`;
  }
  
  getTotalTemps(echauffement: any): string {
    if (!echauffement.blocs?.length) return '';
    const total = echauffement.blocs.reduce((sum: number, bloc: any) => {
      return sum + (bloc.temps || 0);
    }, 0);
    return total > 0 ? `${total} min` : '';
  }
}
