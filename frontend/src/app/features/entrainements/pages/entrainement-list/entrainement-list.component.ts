import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Entrainement } from '../../../../core/models/entrainement.model';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { DuplicateButtonComponent } from '../../../../shared/components/duplicate-button/duplicate-button.component';
import { ExerciceFiltersComponent, ExerciceFiltersValue } from '../../../exercices/components/exercice-filters.component';
import { TagService } from '../../../../core/services/tag.service';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-entrainement-list',
  templateUrl: './entrainement-list.component.html',
  styleUrls: ['./entrainement-list.component.scss'],
  standalone: true,
  imports: [CommonModule, DuplicateButtonComponent, ExerciceFiltersComponent, MatIconModule, MatChipsModule, MatButtonModule]
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
    private tagService: TagService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private apiUrlService: ApiUrlService
  ) {}

  getFullImageUrl(imageName?: string): string | null {
    return this.apiUrlService.getMediaUrl(imageName, 'entrainements');
  }

  ngOnInit(): void {
    this.loadTags();
    this.loadEntrainements();
  }

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

  private computeTotalSeconds(entrainement: Entrainement): number {
    if (!entrainement) return 0;
    const secExercices = (entrainement.exercices || []).map(e => (e.duree ? e.duree * 60 : 0)).reduce((a, b) => a + b, 0);
    const secEchauffement = (entrainement.echauffement?.blocs || []).map(b => this.parseTempsToSeconds((b as any).temps)).reduce((a, b) => a + b, 0);
    const secSituation = this.parseTempsToSeconds((entrainement.situationMatch as any)?.temps);
    return secExercices + secEchauffement + secSituation;
  }

  formatDureeTotaleEntrainement(entrainement: Entrainement): string {
    const totalSec = this.computeTotalSeconds(entrainement);
    const totalMin = Math.round(totalSec / 60);
    return this.formatDuree(totalMin);
  }

  private loadTags(): void {
        this.tagService.getTags('theme_entrainement').subscribe({
      next: (tags: Tag[]) => {
        this.themeEntrainementTags = [...tags].sort((a, b) => a.label.localeCompare(b.label));
        this.allTags = tags;
      },
      error: () => {
        this.themeEntrainementTags = [];
        this.allTags = [];
      }
    });
  }

  onFiltersChange(value: ExerciceFiltersValue): void {
    this.searchTerm = value.searchTerm || '';
    this.selectedThemeEntrainementTags = value.selectedThemeEntrainementTags || [];
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = [...this.entrainements];
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(e =>
        (e.titre && e.titre.toLowerCase().includes(s)) ||
        (e.tags && e.tags.some(t => t.label.toLowerCase().includes(s)))
      );
    }
    if (this.selectedThemeEntrainementTags.length > 0) {
      list = list.filter(e =>
                e.tags?.some(t => t.category === 'theme_entrainement' && this.selectedThemeEntrainementTags.includes(t.id || ''))
      );
    }
    this.filteredEntrainements = list;
  }

  loadEntrainements(): void {
    this.loading = true;
    this.error = null;
    this.entrainementService.getEntrainements().subscribe({
      next: (entrainements) => {
        this.entrainements = entrainements;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des entraînements:', err);
        this.error = 'Erreur lors du chargement des entraînements';
        this.loading = false;
      }
    });
  }

  creerEntrainement(): void {
    this.router.navigate(['/entrainements/nouveau']);
  }

  voirEntrainement(id: string): void {
    this.router.navigate(['/entrainements', id]);
  }

  voirEchauffement(id: string): void {
    this.router.navigate(['/entrainements', id], { fragment: 'echauffement' });
  }

  modifierEntrainement(id: string): void {
    this.router.navigate(['/entrainements/modifier', id]);
  }

  supprimerEntrainement(entrainement: Entrainement): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'entraînement "${entrainement.titre}" ?`)) {
      this.entrainementService.deleteEntrainement(entrainement.id || '').subscribe({
        next: () => this.loadEntrainements(),
        error: () => alert('Erreur lors de la suppression de l\'entraînement.')
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non définie';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR');
  }

  formatDuree(dureeMinutes: number): string {
    if (!dureeMinutes || dureeMinutes === 0) return '0 min';
    const heures = Math.floor(dureeMinutes / 60);
    const minutes = dureeMinutes % 60;
    if (heures === 0) return `${minutes} min`;
    if (minutes === 0) return `${heures}h`;
    return `${heures}h${minutes.toString().padStart(2, '0')}`;
  }

  dupliquerEntrainement(entityId: string): void {
    if (!entityId || this.duplicatingIds.has(entityId)) return;
    
    this.duplicatingIds.add(entityId);
    
    this.entrainementService.duplicateEntrainement(entityId).subscribe({
      next: (duplicatedEntrainement: Entrainement) => {
        console.log(`Entraînement ${entityId} dupliqué avec succès:`, duplicatedEntrainement);
        this.duplicatingIds.delete(entityId);
        this.entrainements.unshift(duplicatedEntrainement);
        this.applyFilters();
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
