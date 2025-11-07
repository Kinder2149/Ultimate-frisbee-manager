import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services
import { ExerciceService } from '../../../core/services/exercice.service';
import { TagService } from '../../../core/services/tag.service';
import { ExerciceDialogService } from '../services/exercice-dialog.service';

// Models
import { Exercice } from '../../../core/models/exercice.model';
import { Tag, TagCategory } from '../../../core/models/tag.model';
import { DialogResult } from '../../../shared/components/dialog/dialog-config.model';

// Components
import { ExerciceCardComponent } from '../components/exercice-card.component';
import { ExerciceFiltersComponent, ExerciceFiltersValue } from '../components/exercice-filters.component';

/**
 * Composant de page affichant la liste des exercices avec les filtres
 */
@Component({
  selector: 'app-exercice-list',
  templateUrl: './exercice-list.component.html',
  styleUrls: ['./exercice-list.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatButtonModule, 
    MatIconModule, 
    RouterModule,
    MatSnackBarModule,
    MatDialogModule,
    ExerciceCardComponent, 
    ExerciceFiltersComponent
  ],
  host: {
    class: 'flex flex-col h-full overflow-hidden'
  }
})
export class ExerciceListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  // Injecter les services nécessaires
  private routeSubscription?: Subscription;
  
  constructor(
    private exerciceService: ExerciceService,
    private tagService: TagService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private exerciceDialogService: ExerciceDialogService,
    private route: ActivatedRoute
  ) { 
    console.log('ExerciceListComponent chargé');
    
    // S'abonner aux changements de route
    this.routeSubscription = this.route.url.subscribe(url => {
      console.log('Changement de route détecté:', url);
    });
  }
  
  ngOnDestroy() {
    // Nettoyer l'abonnement lors de la destruction du composant
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Gère le clic sur le bouton d'ajout d'un nouvel exercice
   * Navigue vers le formulaire d'ajout
   */
  onAddExercice(): void {
    this.router.navigate(['/exercices/ajouter']);
  }
  
  // Propriétés du composant
  exercices: Exercice[] = [];
  filteredExercices: Exercice[] = [];
  loading = true;
  errorMessage = '';

  // Filtres
  searchTerm = '';
  selectedObjectifTags: string[] = [];
  selectedTravailSpecifiqueTags: string[] = [];
  selectedNiveauTags: string[] = [];
  selectedTempsTags: string[] = [];
  selectedFormatTags: string[] = [];

  // Tags disponibles par catégorie
  objectifTags: Tag[] = [];
  travailSpecifiqueTags: Tag[] = [];
  niveauTags: Tag[] = [];
  tempsTags: Tag[] = [];
  formatTags: Tag[] = [];
  allTags: Tag[] = []; // Pour faciliter la recherche par ID


  ngOnInit(): void {
    this.reloadData();

    // S'abonner aux mises à jour pour rafraîchir la liste
    this.exerciceService.exercicesUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.reloadData();
      });
  }

  reloadData(): void {
    this.loading = true;
    // Charger les tags et les exercices simultanément pour optimiser les performances
    forkJoin({
      tags: this.tagService.getTags(),
      exercices: this.exerciceService.getExercices()
    }).subscribe({
      next: (result) => {
        // Stocker tous les tags pour la recherche par ID
        this.allTags = result.tags;
        
        // Traiter les tags par catégorie
        this.processTagsByCategory(result.tags);
        
        // Traiter les exercices
        this.exercices = result.exercices;
        
        // Enrichir les exercices avec leurs tags
        this.enrichExercicesWithTags();
        
        // Appliquer les filtres initiaux
        this.applyFilters();

        // Masquer le message de chargement
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.errorMessage = 'Erreur lors du chargement des exercices et tags. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  /**
   * Organise les tags par catégorie
   * @param tags Liste de tous les tags
   */
  processTagsByCategory(tags: Tag[]): void {
    this.objectifTags = tags.filter(tag => tag.category === 'objectif');
    this.travailSpecifiqueTags = tags.filter(tag => tag.category === 'travail_specifique');
    this.niveauTags = tags.filter(tag => tag.category === 'niveau');
    this.tempsTags = tags.filter(tag => tag.category === 'temps');
    this.formatTags = tags.filter(tag => tag.category === 'format');
    
    // Trier les tags par label pour une meilleure expérience utilisateur
    [this.objectifTags, this.travailSpecifiqueTags, this.tempsTags, this.formatTags].forEach(tagList => {
      tagList.sort((a, b) => a.label.localeCompare(b.label));
    });
    
    // Pour les tags de niveau, trier par valeur de niveau
    this.niveauTags.sort((a, b) => (a.level || 0) - (b.level || 0));
  }
  
  /**
   * Enrichit les exercices avec leurs tags associés pour faciliter le filtrage
   */
  enrichExercicesWithTags(): void {
    // Créer un dictionnaire des tags pour un accès rapide
    const tagMap = new Map<string, Tag>();
    
    // Combine tous les tags en un seul tableau pour faciliter l'accès
    [...this.objectifTags, ...this.travailSpecifiqueTags, ...this.niveauTags].forEach(tag => {
      if (tag.id) {
        tagMap.set(tag.id, tag);
      }
    });
    
    // Mettre à jour chaque exercice avec ses tags associés
    this.exercices.forEach(exercice => {
      if (exercice.tags) {
        // Si les tags sont déjà présents dans l'exercice, les utiliser
        exercice.tagIds = exercice.tags.map(tag => tag.id || '');
      } else if (exercice.tagIds && exercice.tagIds.length > 0) {
        // Si seuls les tagIds sont disponibles, récupérer les objets Tag correspondants
        exercice.tags = exercice.tagIds
          .map(id => tagMap.get(id))
          .filter(tag => tag !== undefined) as Tag[];
      } else {
        // Initialiser les tableaux si nécessaire
        exercice.tags = [];
        exercice.tagIds = [];
      }
    });
  }

  /**
   * Charge tous les tags depuis l'API (méthode conservée pour compatibilité)
   */
  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags: Tag[]) => {
        this.processTagsByCategory(tags);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
      }
    });
  }

  /**
   * Charge tous les exercices depuis l'API (méthode conservée pour compatibilité)
   */
  loadExercices(): void {
    this.loading = true;
    this.exerciceService.getExercices().subscribe({
      next: (exercices: Exercice[]) => {
        this.exercices = exercices;
        this.enrichExercicesWithTags();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des exercices:', err);
        this.errorMessage = 'Erreur lors du chargement des exercices. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  /**
   * Reçoit la valeur des filtres du composant enfant et applique
   */
  onFiltersChange(value: ExerciceFiltersValue): void {
    this.searchTerm = value.searchTerm;
    this.selectedObjectifTags = value.selectedObjectifTags;
    this.selectedTravailSpecifiqueTags = value.selectedTravailSpecifiqueTags;
    this.selectedNiveauTags = value.selectedNiveauTags;
    this.selectedTempsTags = value.selectedTempsTags;
    this.selectedFormatTags = value.selectedFormatTags;
    this.applyFilters();
  }

  /**
   * Applique tous les filtres actuels à la liste d'exercices
   */
  applyFilters(): void {
    let filtered = [...this.exercices];

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.nom.toLowerCase().includes(search) || 
        ex.description.toLowerCase().includes(search) ||
        // Recherche également dans les tags (nouveau)
        ex.tags?.some(tag => tag.label.toLowerCase().includes(search))
      );
    }

    // Filtre par tags d'objectif
    if (this.selectedObjectifTags.length > 0) {
      filtered = filtered.filter(ex => {
        // Vérifier si l'exercice a des tags correspondants dans la catégorie objectif
        if (!ex.tags) return false;
        
        return ex.tags.some(tag => 
          tag.category === 'objectif' && 
          this.selectedObjectifTags.includes(tag.id || '')
        );
      });
    }

    // Filtre par tags de travail spécifique
    if (this.selectedTravailSpecifiqueTags.length > 0) {
      filtered = filtered.filter(ex => {
        // Vérifier si l'exercice a des tags correspondants dans la catégorie travail spécifique
        if (!ex.tags) return false;
        
        return ex.tags.some(tag => 
          tag.category === 'travail_specifique' && 
          this.selectedTravailSpecifiqueTags.includes(tag.id || '')
        );
      });
    }

    // Filtre par tags de niveau
    if (this.selectedNiveauTags.length > 0) {
      filtered = filtered.filter(ex => {
        // Vérifier si l'exercice a des tags correspondants dans la catégorie niveau
        if (!ex.tags) return false;
        
        return ex.tags.some(tag => 
          tag.category === 'niveau' && 
          this.selectedNiveauTags.includes(tag.id || '')
        );
      });
    }
    
    // Filtre par tags de temps
    if (this.selectedTempsTags.length > 0) {
      filtered = filtered.filter(ex => {
        if (!ex.tags) return false;
        
        return ex.tags.some(tag => 
          tag.category === 'temps' && 
          this.selectedTempsTags.includes(tag.id || '')
        );
      });
    }
    
    // Filtre par tags de format
    if (this.selectedFormatTags.length > 0) {
      filtered = filtered.filter(ex => {
        if (!ex.tags) return false;
        
        return ex.tags.some(tag => 
          tag.category === 'format' && 
          this.selectedFormatTags.includes(tag.id || '')
        );
      });
    }
    
    // Le filtre par tags de variables a été supprimé car la catégorie Variable n'existe plus

    // Trier les exercices par nom (nouveau)
    filtered.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
    
    this.filteredExercices = filtered;
    console.log(`Filtres appliqués: ${filtered.length} exercices correspondants`);
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedObjectifTags = [];
    this.selectedTravailSpecifiqueTags = [];
    this.selectedNiveauTags = [];
    this.selectedTempsTags = [];
    this.selectedFormatTags = [];
    this.applyFilters();
  }
  
  /**
   * Gère la suppression d'un exercice
   * @param exerciceId ID de l'exercice supprimé
   */
  onExerciceDeleted(exerciceId: string): void {
    console.log(`Exercice supprimé avec l'ID: ${exerciceId}`);
    // Filtrer la liste des exercices pour supprimer l'exercice supprimé
    this.exercices = this.exercices.filter(ex => ex.id !== exerciceId);
    this.filteredExercices = this.filteredExercices.filter(ex => ex.id !== exerciceId);
    
    // Afficher un message de confirmation
    this.showSuccessMessage('Exercice supprimé avec succès');
  }

  /**
   * Gère la duplication d'un exercice
   * @param newExercice Nouvel exercice
   */
  onExerciceDuplicated(newExercice: Exercice): void {
    console.log('Exercice dupliqué:', newExercice);
    // Ajouter le nouvel exercice au début des listes
    this.exercices.unshift(newExercice);
    this.filteredExercices.unshift(newExercice);
    
    // Afficher un message de confirmation
    this.showSuccessMessage('Exercice dupliqué avec succès');
  }

  /**
   * Gère la modification d'un exercice
   * @param updatedExercice Exercice mis à jour
   */
  onExerciceUpdated(updatedExercice: Exercice): void {
    console.log('Exercice mis à jour:', updatedExercice);
    // Mettre à jour l'exercice dans les listes
    const index = this.exercices.findIndex(ex => ex.id === updatedExercice.id);
    if (index !== -1) {
      this.exercices[index] = { ...updatedExercice };
      // Mettre à jour également dans la liste filtrée si nécessaire
      const filteredIndex = this.filteredExercices.findIndex(ex => ex.id === updatedExercice.id);
      if (filteredIndex !== -1) {
        this.filteredExercices[filteredIndex] = { ...updatedExercice };
      }
      
      // Afficher un message de confirmation
      this.showSuccessMessage('Exercice mis à jour avec succès');
    }
  }

  /**
   * Affiche un message de succès
   * @param message Message à afficher
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Trouve un tag par son ID
   * @param id ID du tag à rechercher
   * @returns Le tag correspondant ou undefined si non trouvé
   */
  getTagById(id: string): Tag | undefined {
    return this.allTags.find(tag => tag.id === id);
  }
}