import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciceService } from '../../../core/services/exercice.service';
import { TagService } from '../../../core/services/tag.service';
import { Exercice } from '../../../core/models/exercice.model';
import { Tag, TagCategory } from '../../../core/models/tag.model';
import { SearchFilterComponent, FilterOption, SearchEvent } from '../search-filter/search-filter.component';
import { forkJoin } from 'rxjs';

/**
 * Composant réutilisable pour sélectionner des exercices avec filtres par tags et recherche
 */
@Component({
  selector: 'app-exercice-selector',
  templateUrl: './exercice-selector.component.html',
  styleUrls: ['./exercice-selector.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SearchFilterComponent]
})
export class ExerciceSelectorComponent implements OnInit {
  /** Titre du sélecteur */
  @Input() title: string = 'Sélectionner un exercice';
  
  /** Si le sélecteur est visible */
  @Input() visible: boolean = false;
  
  /** Exercices déjà sélectionnés (pour les exclure) */
  @Input() excludedExercices: string[] = [];
  
  /** Événement émis lors de la sélection d'un exercice */
  @Output() exerciceSelected = new EventEmitter<Exercice>();
  
  /** Événement émis lors de l'annulation */
  @Output() cancelled = new EventEmitter<void>();

  // Données
  exercices: Exercice[] = [];
  filteredExercices: Exercice[] = [];
  allTags: Tag[] = [];
  loading = true;
  error = '';

  // Options de filtres pour le composant search-filter
  filterOptions: FilterOption[] = [];

  constructor(
    private exerciceService: ExerciceService,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Charge les exercices et tags depuis l'API
   */
  private loadData(): void {
    this.loading = true;
    
    forkJoin({
      exercices: this.exerciceService.getExercices(),
      tags: this.tagService.getTags()
    }).subscribe({
      next: (result) => {
        this.exercices = result.exercices;
        this.allTags = result.tags;
        
        // Enrichir les exercices avec leurs tags
        this.enrichExercicesWithTags();
        
        // Configurer les options de filtres
        this.setupFilterOptions();
        
        // Appliquer les filtres initiaux
        this.applyFilters('', {});
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.error = 'Erreur lors du chargement des exercices';
        this.loading = false;
      }
    });
  }

  /**
   * Enrichit les exercices avec leurs tags associés
   */
  private enrichExercicesWithTags(): void {
    const tagMap = new Map<string, Tag>();
    this.allTags.forEach(tag => {
      if (tag.id) {
        tagMap.set(tag.id, tag);
      }
    });

    this.exercices.forEach(exercice => {
      if (exercice.tagIds && exercice.tagIds.length > 0) {
        exercice.tags = exercice.tagIds
          .map(id => tagMap.get(id))
          .filter(tag => tag !== undefined) as Tag[];
      } else {
        exercice.tags = exercice.tags || [];
      }
    });
  }

  /**
   * Configure les options de filtres basées sur les tags disponibles
   */
  private setupFilterOptions(): void {
    const tagsByCategory = this.groupTagsByCategory();
    
    this.filterOptions = [
      {
        key: 'objectif',
        label: 'Objectif',
        type: 'select',
        options: [
          { value: '', label: 'Tous' },
          ...tagsByCategory.objectif.map(tag => ({
            value: tag.id || '',
            label: tag.label
          }))
        ]
      },
      {
        key: 'travailSpecifique',
        label: 'Travail spécifique',
        type: 'select',
        options: [
          { value: '', label: 'Tous' },
          ...tagsByCategory.travailSpecifique.map(tag => ({
            value: tag.id || '',
            label: tag.label
          }))
        ]
      },
      {
        key: 'niveau',
        label: 'Niveau',
        type: 'select',
        options: [
          { value: '', label: 'Tous' },
          ...tagsByCategory.niveau.map(tag => ({
            value: tag.id || '',
            label: tag.label
          }))
        ]
      },
      {
        key: 'temps',
        label: 'Temps',
        type: 'select',
        options: [
          { value: '', label: 'Tous' },
          ...tagsByCategory.temps.map(tag => ({
            value: tag.id || '',
            label: tag.label
          }))
        ]
      },
      {
        key: 'format',
        label: 'Format',
        type: 'select',
        options: [
          { value: '', label: 'Tous' },
          ...tagsByCategory.format.map(tag => ({
            value: tag.id || '',
            label: tag.label
          }))
        ]
      }
    ];
  }

  /**
   * Groupe les tags par catégorie
   */
  private groupTagsByCategory() {
    return {
      objectif: this.allTags.filter(tag => tag.category === TagCategory.OBJECTIF),
      travailSpecifique: this.allTags.filter(tag => tag.category === TagCategory.TRAVAIL_SPECIFIQUE),
      niveau: this.allTags.filter(tag => tag.category === TagCategory.NIVEAU),
      temps: this.allTags.filter(tag => tag.category === TagCategory.TEMPS),
      format: this.allTags.filter(tag => tag.category === TagCategory.FORMAT)
    };
  }

  /**
   * Gère les événements de recherche et filtrage
   */
  onSearch(event: SearchEvent): void {
    this.applyFilters(event.searchTerm, event.filters);
  }

  /**
   * Applique les filtres de recherche et de tags
   */
  private applyFilters(searchTerm: string, filters: { [key: string]: unknown }): void {
    let filtered = [...this.exercices];

    // Exclure les exercices déjà sélectionnés
    if (this.excludedExercices.length > 0) {
      filtered = filtered.filter(ex => !this.excludedExercices.includes(ex.id || ''));
    }

    // Filtre par terme de recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.nom.toLowerCase().includes(search) || 
        ex.description.toLowerCase().includes(search) ||
        ex.tags?.some(tag => tag.label.toLowerCase().includes(search))
      );
    }

    // Filtres par catégories de tags
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        const tagId = value as string;
        filtered = filtered.filter(ex => 
          ex.tags?.some(tag => tag.id === tagId)
        );
      }
    });

    // Trier par nom
    filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    
    this.filteredExercices = filtered;
  }

  /**
   * Sélectionne un exercice
   */
  selectExercice(exercice: Exercice): void {
    this.exerciceSelected.emit(exercice);
  }

  /**
   * Annule la sélection
   */
  cancel(): void {
    this.cancelled.emit();
  }

  /**
   * Réinitialise les filtres
   */
  onReset(): void {
    this.applyFilters('', {});
  }
}
