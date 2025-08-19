import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatDialog, MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Observable, Subject, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Tag } from '../../services/tag-recommendation.service';
// Définition locale de l'interface TagSuggestion (anciennement dans pipeline-integration.service)
export interface TagSuggestion {
  id: string;
  label: string;
  category: string;
  confidence: number;
  color?: string;
}

import { TagEditorComponent } from '../../shared/tag-editor/tag-editor.component';
import { TagVisualizationComponent } from '../../shared/tag-visualization/tag-visualization.component';

interface TagUsageStats {
  tagId: string;
  tagLabel: string;
  tagCategory: string;
  count: number;
  percentage: number;
  color?: string;
}

interface TagExtended extends Tag {
  usageCount?: number;
  usagePercentage?: number;
}

@Component({
  selector: 'app-tag-management-page',
  templateUrl: './tag-management-page.component.html',
  styleUrls: ['./tag-management-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatMenuModule,
    MatProgressBarModule,
    TagEditorComponent,
    TagVisualizationComponent
  ]
})
export class TagManagementPageComponent implements OnInit {
  displayedColumns: string[] = ['label', 'category', 'usageCount', 'actions'];
  dataSource = new MatTableDataSource<TagExtended>();
  tags: TagExtended[] = [];
  categories: string[] = ['objectif', 'travail_specifique', 'niveau'];
  isLoading = false;
  searchTerm = '';
  selectedCategory = 'all';
  
  private destroy$ = new Subject<void>();
  private tagBeingEdited: TagExtended | null = null;
  
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadTags();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des tags 
   */
  loadTags(): void {
    this.isLoading = true;
    
    // Simulation des données de tags (à remplacer par un appel API réel)
    const mockTags: TagExtended[] = [
      { id: '1', label: 'Débutant', category: 'niveau', color: this.getCategoryColor('niveau'), usageCount: 15, usagePercentage: 25 },
      { id: '2', label: 'Intermédiaire', category: 'niveau', color: this.getCategoryColor('niveau'), usageCount: 22, usagePercentage: 35 },
      { id: '3', label: 'Avancé', category: 'niveau', color: this.getCategoryColor('niveau'), usageCount: 8, usagePercentage: 15 },
      { id: '4', label: 'Passe', category: 'travail_specifique', color: this.getCategoryColor('travail_specifique'), usageCount: 30, usagePercentage: 50 },
      { id: '5', label: 'Défense', category: 'travail_specifique', color: this.getCategoryColor('travail_specifique'), usageCount: 25, usagePercentage: 42 },
      { id: '6', label: 'Précision', category: 'objectif', color: this.getCategoryColor('objectif'), usageCount: 18, usagePercentage: 30 },
      { id: '7', label: 'Vitesse', category: 'variable', color: this.getCategoryColor('variable'), usageCount: 12, usagePercentage: 20 }
    ];
    
    setTimeout(() => {
      this.tags = mockTags;
      this.dataSource.data = mockTags;
      
      // Appliquer le tri après que les données sont chargées
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      
      this.isLoading = false;
    }, 500);
  }

  /**
   * Applique le filtre sur la liste des tags
   */
  applyFilter(): void {
    // Filtrer par catégorie
    let filteredTags = this.tags;
    if (this.selectedCategory !== 'all') {
      filteredTags = this.tags.filter(tag => tag.category === this.selectedCategory);
    }
    
    // Filtrer par terme de recherche
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    this.dataSource.data = filteredTags;
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.applyFilter();
  }

  /**
   * Ouvre le dialogue pour créer un nouveau tag
   */
  openCreateTagDialog(): void {
    const dialogRef = this.dialog.open(TagCreateDialogComponent, {
      width: '500px',
      data: { categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveNewTag(result);
      }
    });
  }

  /**
   * Ouvre le dialogue pour éditer un tag existant
   */
  openEditTagDialog(tag: Tag | TagSuggestion | TagUsageStats): void {
    // Éviter d'éditer plusieurs fois le même tag
    if (this.tagBeingEdited) return;

    // Conversion du tag en TagExtended
    this.tagBeingEdited = this.convertToTagExtended(tag);
    
    const dialogRef = this.dialog.open(TagEditDialogComponent, {
      width: '500px',
      data: { 
        tag: this.convertToTag(tag),
        categories: this.categories 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTag(result);
      }
    });
  }

  /**
   * Sauvegarde un nouveau tag
   */
  saveNewTag(tag: Tag): void {
    // Simuler un appel API pour sauvegarder le tag
    setTimeout(() => {
      // Générer un ID pour le nouveau tag
      const newTag: TagExtended = {
        ...tag,
        id: `${Date.now()}`, // Utiliser un timestamp comme ID temporaire
        usageCount: 0,
        usagePercentage: 0
      };
      
      this.tags.push(newTag);
      this.dataSource.data = this.tags;
      
      this.snackBar.open(`Tag "${tag.label}" créé avec succès`, 'Fermer', {
        duration: 3000,
      });
    }, 300);
  }

  /**
   * Met à jour un tag existant
   */
  updateTag(updatedTag: Tag): void {
    // Simuler un appel API pour mettre à jour le tag
    setTimeout(() => {
      const index = this.tags.findIndex(t => t.id === updatedTag.id);
      if (index !== -1) {
        // Préserver les statistiques d'utilisation
        const usageCount = this.tags[index].usageCount || 0;
        const usagePercentage = this.tags[index].usagePercentage || 0;
        
        this.tags[index] = {
          ...updatedTag,
          usageCount,
          usagePercentage
        };
        
        this.dataSource.data = this.tags;
        
        this.snackBar.open(`Tag "${updatedTag.label}" mis à jour avec succès`, 'Fermer', {
          duration: 3000,
        });
      }
    }, 300);
  }

  /**
   * Récupère la couleur pour une catégorie
   */
  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'objectif': '#4caf50',
      'element': '#2196f3',
      'variable': '#ff9800',
      'niveau': '#9c27b0'
    };
    
    return colors[category.toLowerCase()] || '#9e9e9e';
  }
  
  /**
   * Convertit un objet de type Tag, TagSuggestion ou TagUsageStats en TagExtended
   */
  private convertToTagExtended(tag: Tag | TagSuggestion | TagUsageStats): TagExtended {
    if ((tag as TagUsageStats).tagId !== undefined) {
      // Cas TagUsageStats
      const tagStats = tag as TagUsageStats;
      return {
        id: tagStats.tagId,
        label: tagStats.tagLabel,
        category: tagStats.tagCategory,
        color: tagStats.color || this.getCategoryColor(tagStats.tagCategory),
        usageCount: tagStats.count,
        usagePercentage: tagStats.percentage
      };
    } else if ((tag as TagSuggestion).confidence !== undefined) {
      // Cas TagSuggestion
      const tagSugg = tag as TagSuggestion;
      return {
        id: tagSugg.id,
        label: tagSugg.label,
        category: tagSugg.category,
        color: tagSugg.color || this.getCategoryColor(tagSugg.category),
        usageCount: 0,
        usagePercentage: 0
      };
    }
    // Cas Tag standard
    const standardTag = tag as Tag;
    return {
      ...standardTag,
      usageCount: (standardTag as TagExtended).usageCount || 0,
      usagePercentage: (standardTag as TagExtended).usagePercentage || 0
    };
  }
  
  /**
   * Convertit un objet de type Tag, TagSuggestion ou TagUsageStats en Tag standard
   */
  private convertToTag(tag: Tag | TagSuggestion | TagUsageStats): Tag {
    if ((tag as TagUsageStats).tagId !== undefined) {
      // Cas TagUsageStats
      const tagStats = tag as TagUsageStats;
      return {
        id: tagStats.tagId,
        label: tagStats.tagLabel,
        category: tagStats.tagCategory,
        color: tagStats.color || this.getCategoryColor(tagStats.tagCategory)
      };
    } else if ((tag as TagSuggestion).confidence !== undefined) {
      // Cas TagSuggestion
      const tagSugg = tag as TagSuggestion;
      return {
        id: tagSugg.id,
        label: tagSugg.label,
        category: tagSugg.category,
        color: tagSugg.color || this.getCategoryColor(tagSugg.category)
      };
    }
    // Cas Tag standard
    return tag as Tag;
  }
  
  /**
   * Exporte la liste des tags au format CSV
   */
  exportTags(): void {
    // Créer un contenu CSV basique pour l'export
    const headers = 'ID,Label,Catégorie,Utilisations,Pourcentage\n';
    const content = this.tags.map(tag => 
      `${tag.id},"${tag.label}",${tag.category},${tag.usageCount},${tag.usagePercentage}`
    ).join('\n');
    
    const csv = headers + content;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tags-export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Filtre les tags par catégorie
   */
  getTagsForCategory(category: string): TagExtended[] {
    return this.tags.filter(tag => tag.category === category);
  }
}

/**
 * Composant de dialogue pour la création d'un tag
 */
@Component({
  selector: 'app-tag-create-dialog',
  template: `
    <h2 mat-dialog-title>Créer un nouveau tag</h2>
    <mat-dialog-content>
      <app-tag-editor
        [submitLabel]="'Créer'"
        [categories]="data.categories"
        [isCreating]="true"
        (saveTag)="onSaveTag($event)"
        (cancelEdit)="dialogRef.close()">
      </app-tag-editor>
    </mat-dialog-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    TagEditorComponent
  ]
})
export class TagCreateDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TagCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categories: string[] }
  ) {}

  onSaveTag(tag: Tag): void {
    this.dialogRef.close(tag);
  }
}

/**
 * Composant de dialogue pour l'édition d'un tag
 */
@Component({
  selector: 'app-tag-edit-dialog',
  template: `
    <h2 mat-dialog-title>Modifier le tag</h2>
    <mat-dialog-content>
      <app-tag-editor
        [tag]="data.tag"
        [submitLabel]="'Enregistrer'"
        [categories]="data.categories"
        (saveTag)="onSaveTag($event)"
        (cancelEdit)="dialogRef.close()">
      </app-tag-editor>
    </mat-dialog-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    TagEditorComponent
  ]
})
export class TagEditDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TagEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tag: Tag, categories: string[] }
  ) {}

  onSaveTag(tag: Tag): void {
    this.dialogRef.close(tag);
  }
}
