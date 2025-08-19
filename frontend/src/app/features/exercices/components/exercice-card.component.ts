import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Exercice } from '../../../core/models/exercice.model';
import { ExerciceService } from '../../../core/services/exercice.service';
import { TagService } from '../../../core/services/tag.service';
import { Tag, TagCategory } from '../../../core/models/tag.model';
import { DuplicateButtonComponent } from '../../../shared/components/duplicate-button/duplicate-button.component';

/**
 * Composant affichant un exercice sous forme de carte
 */
@Component({
  selector: 'app-exercice-card',
  templateUrl: './exercice-card.component.html',
  styleUrls: ['./exercice-card.component.css'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, DuplicateButtonComponent]
})
export class ExerciceCardComponent implements OnInit {
  @Input() exercice!: Exercice;
  @Output() exerciceDeleted = new EventEmitter<string>();
  @Output() exerciceDuplicated = new EventEmitter<Exercice>();
  @Output() exerciceUpdated = new EventEmitter<Exercice>();
  
  // État de duplication
  duplicating: boolean = false;
  
  // Tags associés à l'exercice par catégorie
  objectifTag: Tag | null = null;
  travailSpecifiqueTags: Tag[] = [];
  niveauTags: Tag[] = [];
  tempsTags: Tag[] = []; // Ajout des tags de temps
  formatTags: Tag[] = []; // Ajout des tags de format
  
  // Pour l'affichage conditionnel
  expanded: boolean = false;
  
  constructor(
    private tagService: TagService,
    private exerciceService: ExerciceService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Si l'exercice a des tags, on les récupère
    if (this.exercice.tagIds && this.exercice.tagIds.length > 0) {
      this.loadExerciceTags();
    }
  }
  
  /**
   * Charge les tags associés à l'exercice
   */
  loadExerciceTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags: Tag[]) => {
        // Filtrer les tags qui sont associés à cet exercice
        const exerciceTags = tags.filter(tag => {
          // S'assurer que tag.id n'est pas undefined et que tagIds existe
          return tag.id !== undefined && 
            this.exercice.tagIds?.some(id => id === tag.id) || false;
        });
        
        console.log('Tags pour exercice:', this.exercice.nom, exerciceTags);
        
        // Répartir par catégorie
        this.objectifTag = exerciceTags.find(tag => 
          tag.category === TagCategory.OBJECTIF) || null;
        
        this.travailSpecifiqueTags = exerciceTags.filter(tag => 
          tag.category === TagCategory.TRAVAIL_SPECIFIQUE);
        
        // Catégorie Variable supprimée
        
        this.niveauTags = exerciceTags.filter(tag => 
          tag.category === TagCategory.NIVEAU);
          
        // Ajouter le traitement des nouvelles catégories
        this.tempsTags = exerciceTags.filter(tag => 
          tag.category === TagCategory.TEMPS);
          
        this.formatTags = exerciceTags.filter(tag => 
          tag.category === TagCategory.FORMAT);
          
        console.log('Tags par catégorie:', {
          objectif: this.objectifTag ? 1 : 0,
          travailSpecifique: this.travailSpecifiqueTags.length,
          niveau: this.niveauTags.length,
          temps: this.tempsTags.length,
          format: this.formatTags.length
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
      }
    });
  }
  
  /**
   * Bascule l'état d'expansion de la carte
   */
  toggleExpand(): void {
    this.expanded = !this.expanded;
  }
  
  /**
   * Navigue vers le formulaire d'édition de l'exercice
   * @param event L'événement de clic optionnel (pour arrêter la propagation)
   */
  editExercice(event?: Event): void {
    // Empêche le clic de déclencher toggleExpand() si un événement est fourni
    if (event) {
      event.stopPropagation();
    }
    
    if (this.exercice.id) {
      // Naviguer vers la page de formulaire avec l'ID de l'exercice
      this.router.navigate(['/exercices/modifier', this.exercice.id]);
    }
  }
  
  /**
   * Duplique l'exercice
   * @param entityId ID de l'exercice à dupliquer (venant du DuplicateButtonComponent)
   */
  duplicateExercice(entityId: string): void {
    if (!entityId || this.duplicating) return;
    
    this.duplicating = true;
    
    this.exerciceService.duplicateExercice(entityId).subscribe({
      next: (duplicatedExercice) => {
        console.log(`Exercice ${entityId} dupliqué avec succès:`, duplicatedExercice);
        this.duplicating = false;
        // Émettre l'événement pour informer le composant parent
        this.exerciceDuplicated.emit(duplicatedExercice);
      },
      error: (err) => {
        console.error('Erreur lors de la duplication de l\'exercice:', err);
        this.duplicating = false;
        alert('Erreur lors de la duplication de l\'exercice. Veuillez réessayer.');
      }
    });
  }

  /**
   * Supprime l'exercice après confirmation
   * @param event L'événement de clic optionnel (pour arrêter la propagation)
   */
  deleteExercice(event?: Event): void {
    // Empêche le clic de déclencher toggleExpand() si un événement est fourni
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.exercice.id) return;
    
    // Demander confirmation avant de supprimer
    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer l'exercice "${this.exercice.nom}" ?`);
    
    if (confirmation) {
      this.exerciceService.deleteExercice(this.exercice.id).subscribe({
        next: () => {
          console.log(`Exercice ${this.exercice.id} supprimé avec succès`);
          // Émettre un événement pour informer le composant parent
          this.exerciceDeleted.emit(this.exercice.id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'exercice:', err);
          alert('Erreur lors de la suppression de l\'exercice. Veuillez réessayer.');
        }
      });
    }
  }
}