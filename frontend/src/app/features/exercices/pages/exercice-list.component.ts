import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciceService } from '../../../core/services/exercice.service';
import { TagService } from '../../../core/services/tag.service';
import { Exercice } from '../../../core/models/exercice.model';
import { Tag, TagCategory } from '../../../core/models/tag.model';
import { ExerciceCardComponent } from '../components/exercice-card.component'; // Sera mis à jour quand le composant sera déplacé
import { forkJoin } from 'rxjs';

/**
 * Composant de page affichant la liste des exercices avec les filtres
 */
@Component({
  selector: 'app-exercice-list',
  templateUrl: './exercice-list.component.html',
  styleUrls: ['./exercice-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ExerciceCardComponent]
})
export class ExerciceListComponent implements OnInit {
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
  
  // Gestion des dropdowns
  activeDropdown: string | null = null;
  allTags: Tag[] = []; // Pour faciliter la recherche par ID

  constructor(
    private exerciceService: ExerciceService,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
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
        
        // Fermer le dropdown si on clique en dehors
        document.addEventListener('click', (event) => {
          const target = event.target as HTMLElement;
          if (!target.closest('.dropdown-container') && this.activeDropdown) {
            this.activeDropdown = null;
          }
        });
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
    this.objectifTags = tags.filter(tag => tag.category === TagCategory.OBJECTIF);
    this.travailSpecifiqueTags = tags.filter(tag => tag.category === TagCategory.TRAVAIL_SPECIFIQUE);
    this.niveauTags = tags.filter(tag => tag.category === TagCategory.NIVEAU);
    this.tempsTags = tags.filter(tag => tag.category === TagCategory.TEMPS);
    this.formatTags = tags.filter(tag => tag.category === TagCategory.FORMAT);
    
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
   * Recherche par terme dans le nom et la description
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Toggle la sélection d'un tag d'objectif
   */
  toggleObjectifTag(tagId: string): void {
    this.toggleTagSelection(tagId, this.selectedObjectifTags);
    this.applyFilters();
  }

  /**
   * Toggle la sélection d'un tag de travail spécifique
   */
  toggleTravailSpecifiqueTag(tagId: string): void {
    this.toggleTagSelection(tagId, this.selectedTravailSpecifiqueTags);
    this.applyFilters();
  }

  /**
   * Toggle la sélection d'un tag de niveau
   */
  toggleNiveauTag(tagId: string): void {
    this.toggleTagSelection(tagId, this.selectedNiveauTags);
    this.applyFilters();
  }
  
  /**
   * Toggle la sélection d'un tag de temps
   */
  toggleTempsTag(tagId: string): void {
    this.toggleTagSelection(tagId, this.selectedTempsTags);
    this.applyFilters();
  }

  /**
   * Toggle la sélection d'un tag de format
   */
  toggleFormatTag(tagId: string): void {
    this.toggleTagSelection(tagId, this.selectedFormatTags);
    this.applyFilters();
  }

  /**
   * Fonction helper pour toggle un tag dans une liste
   */
  private toggleTagSelection(tagId: string, tagList: string[]): void {
    const index = tagList.indexOf(tagId);
    if (index === -1) {
      tagList.push(tagId);
    } else {
      tagList.splice(index, 1);
    }
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
          tag.category === TagCategory.OBJECTIF && 
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
          tag.category === TagCategory.TRAVAIL_SPECIFIQUE && 
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
          tag.category === TagCategory.NIVEAU && 
          this.selectedNiveauTags.includes(tag.id || '')
        );
      });
    }
    
    // Filtre par tags de temps
    if (this.selectedTempsTags.length > 0) {
      filtered = filtered.filter(ex => {
        if (!ex.tags) return false;
        
        return ex.tags.some(tag => 
          tag.category === TagCategory.TEMPS && 
          this.selectedTempsTags.includes(tag.id || '')
        );
      });
    }
    
    // Filtre par tags de format
    if (this.selectedFormatTags.length > 0) {
      filtered = filtered.filter(ex => {
        if (!ex.tags) return false;
        
        return ex.tags.some(tag => 
          tag.category === TagCategory.FORMAT && 
          this.selectedFormatTags.includes(tag.id || '')
        );
      });
    }
    
    // Le filtre par tags de variables a été supprimé car la catégorie Variable n'existe plus

    // Trier les exercices par nom (nouveau)
    filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    
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
    console.log(`Exercice ${exerciceId} supprimé, mise à jour de la liste`);
    
    // Retirer l'exercice supprimé des listes
    this.exercices = this.exercices.filter(ex => ex.id !== exerciceId);
    this.filteredExercices = this.filteredExercices.filter(ex => ex.id !== exerciceId);
    
    // Afficher une notification de succès
    alert('Exercice supprimé avec succès');
  }

  /**
   * Gère la duplication d'un exercice
   * @param duplicatedExercice Exercice dupliqué
   */
  onExerciceDuplicated(duplicatedExercice: Exercice): void {
    console.log(`Exercice dupliqué:`, duplicatedExercice);
    
    // Ajouter l'exercice dupliqué aux listes
    this.exercices.push(duplicatedExercice);
    
    // Enrichir le nouvel exercice avec ses tags
    this.enrichExercicesWithTags();
    
    // Réappliquer les filtres pour inclure le nouvel exercice
    this.applyFilters();
    
    // Afficher une notification de succès
    alert('Exercice dupliqué avec succès');
  }

  /**
   * Gère la modification d'un exercice
   * @param updatedExercice Exercice modifié
   */
  onExerciceUpdated(updatedExercice: Exercice): void {
    console.log(`Exercice modifié:`, updatedExercice);
    
    // Trouver et remplacer l'exercice modifié dans la liste
    const index = this.exercices.findIndex(ex => ex.id === updatedExercice.id);
    if (index !== -1) {
      this.exercices[index] = updatedExercice;
    }
    
    // Enrichir les exercices avec leurs tags
    this.enrichExercicesWithTags();
    
    // Réappliquer les filtres
    this.applyFilters();
    
    // Afficher une notification de succès
    alert('Exercice modifié avec succès');
  }

  /**
   * Gère l'ouverture/fermeture des listes déroulantes
   * @param dropdown identifiant du dropdown à activer
   */
  toggleDropdown(dropdown: string): void {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
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