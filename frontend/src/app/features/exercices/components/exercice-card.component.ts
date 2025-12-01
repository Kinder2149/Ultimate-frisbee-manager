import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Exercice } from '../../../core/models/exercice.model';
import { ExerciceService } from '../../../core/services/exercice.service';
import { TagService } from '../../../core/services/tag.service';
import { Tag, TagCategory } from '../../../core/models/tag.model';
import { DuplicateButtonComponent } from '../../../shared/components/duplicate-button/duplicate-button.component';
import { RichTextViewComponent } from '../../../shared/components/rich-text-view/rich-text-view.component';
import { ExerciceDialogService } from '../services/exercice-dialog.service';
import { ApiUrlService } from '../../../core/services/api-url.service';

// Type d'entrée précis pour couvrir les champs utilisés dans le template
// et éviter les erreurs strictes de template (TS4111, pipes, etc.).
export interface ExerciceInput {
  id?: string;
  nom?: string;
  createdAt?: string | number | Date | null | undefined;
  description?: string;
  critereReussite?: string;
  variablesText?: string;
  imageUrl?: string;
  schemaUrl?: string;
  tagIds?: string[];
  tags?: any[];
}

/**
 * Composant affichant un exercice sous forme de carte
 */
@Component({
  selector: 'app-exercice-card',
  templateUrl: './exercice-card.component.html',
  styleUrls: ['./exercice-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, DuplicateButtonComponent, MatChipsModule, RichTextViewComponent]
})
export class ExerciceCardComponent implements OnInit {
  @Input() exercice!: ExerciceInput;
  @Input() selected: boolean = false;
  // Optionnels pour l'usage dans la page d'entraînement
  @Input() index?: number;
  @Input() duree?: number | string; // minutes ou libellé
  @Input() notes?: string;
  @Input() leftTime: boolean = false; // affiche un rail de temps à gauche
  // Mode d'affichage: 'default' (liste d'exercices) ou 'entrainement'
  @Input() mode: 'default' | 'entrainement' | 'entrainement-summary' = 'default';
  // Autoriser l'édition de la durée (uniquement pertinent pour le mode entraînement)
  @Input() allowEditDuration: boolean = false;
  @Output() exerciceDeleted = new EventEmitter<string>();
  @Output() exerciceDuplicated = new EventEmitter<Exercice>();
  @Output() exerciceUpdated = new EventEmitter<Exercice>();
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() dureeChange = new EventEmitter<number>();
  @Output() imageClick = new EventEmitter<string>();
  
  // État de duplication
  duplicating: boolean = false;
  // État d'expansion de la carte (replié par défaut)
  expanded: boolean = false;
  
  // Tags associés à l'exercice par catégorie
  objectifTag: Tag | null = null;
  travailSpecifiqueTags: Tag[] = [];
  niveauTags: Tag[] = [];
  tempsTags: Tag[] = []; // Ajout des tags de temps
  formatTags: Tag[] = []; // Ajout des tags de format
  
  showImage: boolean = false;
  
  constructor(
    private tagService: TagService,
    private exerciceService: ExerciceService,
    private router: Router,
    private snackBar: MatSnackBar,
    private exerciceDialogService: ExerciceDialogService,
    private apiUrlService: ApiUrlService
  ) {}
  
  ngOnInit(): void {
    // 1) Si l'exercice contient déjà les tags (exercice.tags ou exercice.exerciceTags), on les utilise directement
    const preloadedTags = this.extractTagsFromExercice();
    if (preloadedTags && preloadedTags.length > 0) {
      this.populateTagCategories(preloadedTags);
    } else {
      // 2) Sinon, fallback: charger via tagIds si disponibles
      const tagIds = this.exercice?.tagIds as string[] | undefined;
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        this.loadExerciceTags(tagIds);
      }
    }
    // Comportement par défaut en mode entraînement: autoriser le dépliage au clic
    if (this.mode === 'entrainement') {
      // rien d'obligatoire ici, mais on garde expanded à false par défaut
    }
  }

  /**
   * URL principale de l'image/schéma de l'exercice.
   * Ici on s'appuie uniquement sur imageUrl,
   * qui est normalisé côté ExerciceService
   * (éventuellement dérivé d'anciens champs de schéma).
   */
  get mainImageUrl(): string | null {
    const ex: any = this.exercice;
    return ex?.imageUrl || null;
  }

  /**
   * Ouvre/ferme le contenu de la carte (clic sur l'en-tête)
   */
  toggleExpanded(event?: Event): void {
    if (event) event.stopPropagation();
    this.expanded = !this.expanded;
  }

  // Durée formatée
  get dureeDisplay(): string | null {
    if (this.duree === undefined || this.duree === null || this.duree === '') return null;
    if (typeof this.duree === 'number') return `${this.duree} min`;
    // chaîne déjà formatée
    return this.duree;
  }

  /**
   * Ouvre l'exercice en lecture seule (view=true)
   * @param event L'événement de clic optionnel (pour arrêter la propagation)
   */
  viewExercice(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.exercice.id) {
      this.exerciceDialogService.openViewDialog(this.exercice as Exercice).subscribe();
    }
  }
  
  /**
   * Navigue vers le formulaire d'édition de l'exercice
   * @param event L'événement de clic optionnel (pour arrêter la propagation)
   */
  editExercice(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.exercice.id) {
      // Navigation vers la page complète d'édition
      this.router.navigate(['/exercices/modifier', this.exercice.id]);
    }
  }
  
  /**
   * Charge les tags associés à l'exercice
   */
  loadExerciceTags(tagIds: string[]): void {
    this.tagService.getTags().subscribe({
      next: (tags: Tag[]) => {
        // Filtrer les tags qui sont associés à cet exercice
        const exerciceTags = tags.filter((tag: Tag) => {
          // S'assurer que tag.id n'est pas undefined et que tagIds existe
          return tag.id !== undefined && Array.isArray(tagIds) && tagIds.some((id: string) => id === tag.id);
        });
        
        console.log('Tags pour exercice:', this.exercice?.nom, exerciceTags);
        this.populateTagCategories(exerciceTags);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
      }
    });
  }

  /**
   * Extrait des tags directement depuis l'objet exercice si disponibles
   * Supporte exercice.tags ou exercice.exerciceTags: { tag }[]
   */
  private extractTagsFromExercice(): Tag[] {
    const ex: any = this.exercice as any;
    if (!ex) return [];
    if (Array.isArray(ex.tags) && ex.tags.length > 0) {
      return ex.tags as Tag[];
    }
    if (Array.isArray(ex.exerciceTags) && ex.exerciceTags.length > 0) {
      return ex.exerciceTags
        .map((et: any) => et && et.tag)
        .filter((t: any) => !!t) as Tag[];
    }
    return [];
  }

  /**
   * Répartit la liste de tags par catégories et alimente les champs d'affichage
   */
  private populateTagCategories(exerciceTags: Tag[]): void {
    // Répartir par catégorie
    this.objectifTag = exerciceTags.find(tag => 
      tag.category === 'objectif') || null;
    
    this.travailSpecifiqueTags = exerciceTags.filter(tag => 
      tag.category === 'travail_specifique');
    
    // Catégorie Variable supprimée
    
    this.niveauTags = exerciceTags.filter(tag => 
      tag.category === 'niveau');
      
    // Nouvelles catégories
    this.tempsTags = exerciceTags.filter(tag => 
      tag.category === 'temps');
      
    this.formatTags = exerciceTags.filter(tag => 
      tag.category === 'format');

    console.log('Tags par catégorie:', {
      objectif: this.objectifTag ? 1 : 0,
      travailSpecifique: this.travailSpecifiqueTags.length,
      niveau: this.niveauTags.length,
      temps: this.tempsTags.length,
      format: this.formatTags.length
    });
  }
  
  
  /** Affiche/masque l'image (schéma) */
  toggleShowImage(): void {
    this.showImage = !this.showImage;
  }

  /**
   * Construit une URL absolue pour un média (image/schéma)
   */
  mediaUrl(path?: string | null): string | null {
    return this.apiUrlService.getMediaUrl(path ?? undefined, 'exercices');
  }

  /**
   * Émet l'événement de clic sur l'image avec son URL.
   */
  onImageClicked(url?: string | null): void {
    if (url) {
      this.imageClick.emit(url);
    }
  }

  /**
   * Sélectionne/Désélectionne la carte pour des actions globales
   */
  toggleSelected(event?: Event): void {
    if (event) event.stopPropagation();
    this.selected = !this.selected;
    this.selectedChange.emit(this.selected);
  }
  
  /**
   * Récupère la durée actuelle en minutes sous forme de nombre
   */
  private getDureeNumber(): number {
    if (typeof this.duree === 'number') return this.duree;
    if (typeof this.duree === 'string') {
      const m = this.duree.match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    }
    return 0;
  }

  /**
   * Incrémente/décrémente la durée (en minutes) et émet l'événement de changement
   */
  incrementDuration(delta: number): void {
    if (!this.allowEditDuration) return;
    const current = this.getDureeNumber();
    const next = Math.max(0, current + delta);
    this.duree = next;
    this.dureeChange.emit(next);
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
    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer l'exercice "${this.exercice?.nom ?? ''}" ?`);
    
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