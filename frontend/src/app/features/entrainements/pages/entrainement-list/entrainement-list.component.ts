import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Entrainement } from '../../../../core/models/entrainement.model';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { DuplicateButtonComponent } from '../../../../shared/components/duplicate-button/duplicate-button.component';
import { ExerciceFiltersComponent, ExerciceFiltersValue } from '../../../exercices/components/exercice-filters.component';
import { TagService } from '../../../../core/services/tag.service';
import { Tag, TagCategory } from '../../../../core/models/tag.model';

@Component({
  selector: 'app-entrainement-list',
  templateUrl: './entrainement-list.component.html',
  styleUrls: ['./entrainement-list.component.css'],
  standalone: true,
  imports: [CommonModule, DuplicateButtonComponent, ExerciceFiltersComponent]
})
export class EntrainementListComponent implements OnInit {
  entrainements: Entrainement[] = [];
  filteredEntrainements: Entrainement[] = [];
  loading: boolean = false;
  error: string | null = null;
  duplicatingIds: Set<string> = new Set();

  // Filtres
  searchTerm = '';
  themeEntrainementTags: Tag[] = [];
  allTags: Tag[] = [];
  selectedThemeEntrainementTags: string[] = [];

  constructor(
    private entrainementService: EntrainementService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private tagService: TagService
  ) {}

  ngOnInit(): void {
    this.loadTags();
    this.loadEntrainements();
  }

  // --- Calcul du temps total de l'échauffement lié ---
  private parseTempsToSeconds(temps: string | undefined): number {
    if (!temps) return 0;
    const t = temps.trim().toLowerCase();
    const regex = /^(\d+(?:[\.,]\d+)?)\s*(min|m|sec|s)?$/i;
    const m = t.match(regex);
    if (!m) return 0;
    const rawVal = (m[1] || '').replace(',', '.');
    const num = Number(rawVal);
    if (isNaN(num)) return 0;
    const unit = (m[2] || 'min').toLowerCase();
    return unit.startsWith('s') ? Math.round(num) : Math.round(num * 60);
  }

  private formatSeconds(totalSec: number): string {
    if (totalSec <= 0) return '0 min';
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds}s`;
  }

  formatTotalTempsEchauffement(entrainement: Entrainement): string {
    const blocs = entrainement.echauffement?.blocs || [];
    const total = blocs
      .map(b => this.parseTempsToSeconds((b as any).temps))
      .reduce((acc, v) => acc + v, 0);
    return this.formatSeconds(total);
  }

  // --- Calcul de la durée totale réelle de l'entraînement (exercices + échauffement + situation/match) ---
  private computeTotalSeconds(entrainement: Entrainement): number {
    if (!entrainement) return 0;

    // Exercices: champ duree est en minutes
    const secExercices = (entrainement.exercices || [])
      .map(e => (e.duree ? e.duree * 60 : 0))
      .reduce((a, b) => a + b, 0);

    // Échauffement: sommer les blocs `temps` (chaînes)
    const secEchauffement = (entrainement.echauffement?.blocs || [])
      .map(b => this.parseTempsToSeconds((b as any).temps))
      .reduce((a, b) => a + b, 0);

    // Situation/Match: un seul champ `temps` (chaîne)
    const secSituation = this.parseTempsToSeconds((entrainement.situationMatch as any)?.temps);

    return secExercices + secEchauffement + secSituation;
  }

  formatDureeTotaleEntrainement(entrainement: Entrainement): string {
    const totalSec = this.computeTotalSeconds(entrainement);
    const totalMin = Math.round(totalSec / 60);
    return this.formatDuree(totalMin);
  }

  private loadTags(): void {
    // Charger uniquement les tags de thème d'entraînement
    this.tagService.getTags(TagCategory.THEME_ENTRAINEMENT).subscribe({
      next: (tags) => {
        this.themeEntrainementTags = [...tags].sort((a, b) => a.label.localeCompare(b.label));
        this.allTags = tags;
      },
      error: () => {
        // En cas d'erreur, garder les filtres fonctionnels (search-only)
        this.themeEntrainementTags = [];
        this.allTags = [];
      }
    });
  }

  // Gestion des filtres
  onFiltersChange(value: ExerciceFiltersValue): void {
    this.searchTerm = value.searchTerm || '';
    this.selectedThemeEntrainementTags = value.selectedThemeEntrainementTags || [];
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = [...this.entrainements];

    // Recherche texte dans titre et tags
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(e =>
        (e.titre && e.titre.toLowerCase().includes(s)) ||
        (e.tags && e.tags.some(t => t.label.toLowerCase().includes(s)))
      );
    }

    // Filtre par thèmes d'entraînement (si présents)
    if (this.selectedThemeEntrainementTags.length > 0) {
      list = list.filter(e =>
        e.tags?.some(t => t.category === TagCategory.THEME_ENTRAINEMENT && this.selectedThemeEntrainementTags.includes(t.id || ''))
      );
    }

    this.filteredEntrainements = list;
  }

  /**
   * Charge la liste des entraînements
   */
  loadEntrainements(): void {
    this.loading = true;
    this.error = null;

    this.entrainementService.getEntrainements().subscribe({
      next: (entrainements) => {
        this.entrainements = entrainements;
        this.applyFilters();
        this.loading = false;
        console.log('Entraînements chargés:', entrainements);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des entraînements:', err);
        this.error = 'Erreur lors du chargement des entraînements';
        this.loading = false;
      }
    });
  }

  /**
   * Navigue vers le formulaire de création d'entraînement
   */
  creerEntrainement(): void {
    this.router.navigate(['/entrainements/nouveau']);
  }

  /**
   * Navigue vers le détail d'un entraînement
   */
  voirEntrainement(id: string): void {
    this.router.navigate(['/entrainements', id]);
  }

  /**
   * Navigue vers la section Échauffement du détail d'un entraînement
   */
  voirEchauffement(id: string): void {
    this.router.navigate(['/entrainements', id], { fragment: 'echauffement' });
  }

  /**
   * Navigue vers l'édition d'un entraînement
   */
  modifierEntrainement(id: string): void {
    this.router.navigate(['/entrainements/modifier', id]);
  }

  /**
   * Supprime un entraînement
   */
  supprimerEntrainement(entrainement: Entrainement): void {
    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer l'entraînement "${entrainement.titre}" ?`);
    
    if (confirmation) {
      // Conserver une copie de la liste originale pour la restauration
      const originalEntrainements = [...this.entrainements];
      
      // Supprimer immédiatement de la liste locale pour un feedback instantané
      this.entrainements = this.entrainements.filter(e => e.id !== entrainement.id);
      
      this.entrainementService.deleteEntrainement(entrainement.id || '').subscribe({
        next: () => {
          console.log(`Entraînement ${entrainement.id} supprimé avec succès`);
          // Forcer la détection de changements
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'entraînement:', err);
          // Restaurer la liste originale en cas d'erreur
          this.entrainements = originalEntrainements;
          this.cdr.detectChanges();
          alert('Erreur lors de la suppression de l\'entraînement. Veuillez réessayer.');
        }
      });
    }
  }

  /**
   * Formate la date pour l'affichage
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non définie';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR');
  }

  /**
   * Formate la durée en minutes pour l'affichage
   */
  formatDuree(dureeMinutes: number): string {
    if (!dureeMinutes || dureeMinutes === 0) return '0 min';
    
    const heures = Math.floor(dureeMinutes / 60);
    const minutes = dureeMinutes % 60;
    
    if (heures === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${heures}h`;
    } else {
      return `${heures}h${minutes.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Duplique un entraînement
   * @param entityId ID de l'entraînement à dupliquer
   */
  dupliquerEntrainement(entityId: string): void {
    if (!entityId || this.duplicatingIds.has(entityId)) return;
    
    this.duplicatingIds.add(entityId);
    
    this.entrainementService.duplicateEntrainement(entityId).subscribe({
      next: (duplicatedEntrainement: Entrainement) => {
        console.log(`Entraînement ${entityId} dupliqué avec succès:`, duplicatedEntrainement);
        this.duplicatingIds.delete(entityId);
        // Ajouter directement le nouvel entraînement à la liste locale pour un feedback immédiat
        this.entrainements.unshift(duplicatedEntrainement);
        // Forcer la détection de changements
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur lors de la duplication de l\'entraînement:', err);
        this.duplicatingIds.delete(entityId);
        alert('Erreur lors de la duplication de l\'entraînement. Veuillez réessayer.');
      }
    });
  }

}
