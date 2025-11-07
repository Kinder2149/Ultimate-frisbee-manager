import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { TagMapping } from '../../models/tags-advanced.model';
import { TagCategory } from '@ufm/shared/constants/tag-categories';

import { Tag } from '../../services/tag-recommendation.service';

@Component({
  selector: 'app-tag-mapping',
  templateUrl: './tag-mapping.component.html',
  styleUrls: ['./tag-mapping.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatButtonToggleModule
  ]
})
export class TagMappingComponent implements OnInit {
  @Input() mappings: TagMapping[] = [];
  @Input() availableTags: Tag[] = [];
  @Input() showConfidence = true;
  @Input() showActions = true;
  
  @Output() mappingValidated = new EventEmitter<{mapping: TagMapping, validTag: Tag | null}>();
  @Output() mappingsChanged = new EventEmitter<TagMapping[]>();
  
  searchText = '';
  filteredAvailableTags: Tag[] = [];
  selectedCategory: string | null = null;
  
  categories = ['objectif', 'element', 'niveau'];
  
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.filteredAvailableTags = [...this.availableTags];
  }
  
  /**
   * Filtre les tags disponibles en fonction de la recherche et de la catégorie
   */
  filterAvailableTags(): void {
    let filtered = [...this.availableTags];
    
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(tag => 
        tag.label.toLowerCase().includes(search)
      );
    }
    
    if (this.selectedCategory) {
      filtered = filtered.filter(tag => 
        tag.category === this.selectedCategory
      );
    }
    
    this.filteredAvailableTags = filtered;
  }
  
  /**
   * Change la catégorie sélectionnée pour le filtre
   */
  selectCategory(category: string | null): void {
    this.selectedCategory = category;
    this.filterAvailableTags();
  }
  
  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchText = '';
    this.selectedCategory = null;
    this.filterAvailableTags();
  }
  
  /**
   * Valide un mapping avec un tag spécifique
   */
  validateMapping(mapping: TagMapping, validTag: Tag | null): void {
    if (validTag) {
      mapping.mappedTag = {
        id: validTag.id,
        label: validTag.label,
                category: validTag.category as TagCategory,
        color: validTag.color
      };
    } else {
      mapping.mappedTag = undefined;
    }
    mapping.validated = true;
    this.mappingValidated.emit({mapping, validTag});
    this.mappingsChanged.emit([...this.mappings]);
  }
  
  /**
   * Invalide un mapping précédemment validé
   */
  invalidateMapping(mapping: TagMapping): void {
    mapping.mappedTag = undefined;
    mapping.validated = false;
    this.mappingValidated.emit({mapping, validTag: null});
    this.mappingsChanged.emit([...this.mappings]);
  }
  
  /**
   * Ignorer un mapping
   */
  ignoreMapping(mapping: TagMapping): void {
    mapping.ignored = true;
    this.mappingsChanged.emit([...this.mappings]);
  }
  
  /**
   * Restaure un mapping ignoré
   */
  restoreMapping(mapping: TagMapping): void {
    mapping.ignored = false;
    this.mappingsChanged.emit([...this.mappings]);
  }
  
  /**
   * Obtient le nombre de mappings validés
   */
  get validatedCount(): number {
    return this.mappings.filter(m => m.validated).length;
  }
  
  /**
   * Obtient le nombre de mappings ignorés
   */
  get ignoredCount(): number {
    return this.mappings.filter(m => m.ignored).length;
  }
  
  /**
   * Obtient le nombre total de mappings actifs (non ignorés)
   */
  get activeMappingsCount(): number {
    return this.mappings.filter(m => !m.ignored).length;
  }
  
  /**
   * Vérifie si tous les mappings actifs sont validés
   */
  get allValidated(): boolean {
    const activeMappings = this.mappings.filter(m => !m.ignored);
    return activeMappings.length > 0 && activeMappings.every(m => m.validated);
  }
  
  /**
   * Obtient la classe de confiance en fonction du niveau
   */
  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'high-confidence';
    if (confidence >= 0.5) return 'medium-confidence';
    return 'low-confidence';
  }
}
