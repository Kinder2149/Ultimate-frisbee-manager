import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tag } from '../../../core/models/tag.model';

export interface ExerciceFiltersValue {
  searchTerm: string;
  selectedObjectifTags: string[];
  selectedTravailSpecifiqueTags: string[];
  selectedNiveauTags: string[];
  selectedTempsTags: string[];
  selectedFormatTags: string[];
  selectedThemeEntrainementTags: string[];
}

@Component({
  selector: 'app-exercice-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exercice-filters.component.html',
  styleUrls: ['./exercice-filters.component.css']
})
export class ExerciceFiltersComponent {
  // Tags disponibles par catégorie (fournis par le parent)
  @Input() objectifTags: Tag[] = [];
  @Input() travailSpecifiqueTags: Tag[] = [];
  @Input() niveauTags: Tag[] = [];
  @Input() tempsTags: Tag[] = [];
  @Input() formatTags: Tag[] = [];
  @Input() allTags: Tag[] = [];
  // Permet de masquer l'ensemble des sections de tags (utile pour les entités sans tags)
  @Input() hideTagSections = false;
  // Nouvelle catégorie: thème d'entraînement (pour Entraînements)
  @Input() themeEntrainementTags: Tag[] = [];
  // Flags d'affichage par catégorie (pour adapter selon la page)
  @Input() show: {
    objectif?: boolean;
    travail?: boolean;
    niveau?: boolean;
    temps?: boolean;
    format?: boolean;
    themeEntrainement?: boolean;
  } = { objectif: true, travail: true, niveau: true, temps: true, format: true, themeEntrainement: false };

  // Valeurs sélectionnées (état interne du composant)
  searchTerm = '';
  selectedObjectifTags: string[] = [];
  selectedTravailSpecifiqueTags: string[] = [];
  selectedNiveauTags: string[] = [];
  selectedTempsTags: string[] = [];
  selectedFormatTags: string[] = [];
  selectedThemeEntrainementTags: string[] = [];

  // Émissions vers le parent
  @Output() filtersChange = new EventEmitter<ExerciceFiltersValue>();
  @Output() searchChange = new EventEmitter<string>();

  // Gestion des dropdowns locaux
  activeDropdown: string | null = null;

  // Actions UI
  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm);
    this.emitFilters();
  }

  toggleDropdown(key: string): void {
    this.activeDropdown = this.activeDropdown === key ? null : key;
  }

  private toggleTagSelection(tagId: string, list: string[]): void {
    const idx = list.indexOf(tagId);
    if (idx === -1) list.push(tagId); else list.splice(idx, 1);
    this.emitFilters();
  }

  // Méthodes publiques pour le template
  toggleObjectifTag(tagId: string): void { this.toggleTagSelection(tagId, this.selectedObjectifTags); }
  toggleTravailSpecifiqueTag(tagId: string): void { this.toggleTagSelection(tagId, this.selectedTravailSpecifiqueTags); }
  toggleNiveauTag(tagId: string): void { this.toggleTagSelection(tagId, this.selectedNiveauTags); }
  toggleTempsTag(tagId: string): void { this.toggleTagSelection(tagId, this.selectedTempsTags); }
  toggleFormatTag(tagId: string): void { this.toggleTagSelection(tagId, this.selectedFormatTags); }
  toggleThemeEntrainementTag(tagId: string): void { this.toggleTagSelection(tagId, this.selectedThemeEntrainementTags); }

  reset(): void {
    this.searchTerm = '';
    this.selectedObjectifTags = [];
    this.selectedTravailSpecifiqueTags = [];
    this.selectedNiveauTags = [];
    this.selectedTempsTags = [];
    this.selectedFormatTags = [];
    this.selectedThemeEntrainementTags = [];
    this.onSearchChange();
  }

  getTagById(id: string): Tag | undefined {
    return this.allTags.find(t => t.id === id);
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      searchTerm: this.searchTerm,
      selectedObjectifTags: [...this.selectedObjectifTags],
      selectedTravailSpecifiqueTags: [...this.selectedTravailSpecifiqueTags],
      selectedNiveauTags: [...this.selectedNiveauTags],
      selectedTempsTags: [...this.selectedTempsTags],
      selectedFormatTags: [...this.selectedFormatTags],
      selectedThemeEntrainementTags: [...this.selectedThemeEntrainementTags]
    });
  }

  constructor() {
    // Fermeture des dropdowns au clic extérieur
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filters-dropdown-container') && this.activeDropdown) {
        this.activeDropdown = null;
      }
    });
  }
}
