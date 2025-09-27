import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { Entrainement, EntrainementExercice } from '../../../../core/models/entrainement.model';
import { Echauffement } from '../../../../core/models/echauffement.model';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { ExerciceCardComponent } from '../../../exercices/components/exercice-card.component';
import { DialogService } from '../../../../shared/components/dialog/dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { ImageViewerComponent, ImageViewerData } from '../../../../shared/components/image-viewer/image-viewer.component';
import { EchauffementViewComponent } from '../../../../shared/components/echauffement-view/echauffement-view.component';
import { ExerciceViewComponent } from '../../../../shared/components/exercice-view/exercice-view.component';
import { SituationMatchViewComponent } from '../../../../shared/components/situationmatch-view/situationmatch-view.component';
import { ActionButtonComponent } from '../../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-entrainement-detail',
  templateUrl: './entrainement-detail.component.html',
  styleUrls: ['./entrainement-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule, 
    ExerciceCardComponent, 
    ActionButtonComponent, 
    MatMenuModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule,
    EchauffementViewComponent,
    ExerciceViewComponent,
    SituationMatchViewComponent
  ]
})
export class EntrainementDetailComponent implements OnInit {
  entrainement: Entrainement | null = null;
  loading = false;
  error: string | null = null;
  entrainementId: string | null = null;
  expandedExercices: boolean[] = [];
  echauffementExpanded: boolean = false;
  situationMatchExpanded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entrainementService: EntrainementService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private apiUrl: ApiUrlService
  ) {}

  ngOnInit(): void {
    this.entrainementId = this.route.snapshot.paramMap.get('id');
    if (this.entrainementId) {
      this.loadEntrainement(this.entrainementId);
    } else {
      this.error = 'ID d\'entraînement manquant';
    }
  }

  /**
   * Mise à jour de la durée d'un exercice depuis la carte enfant
   */
  onExerciceDureeChange(index: number, newDuree: number): void {
    if (!this.entrainement || !this.entrainement.exercices) return;
    if (index < 0 || index >= this.entrainement.exercices.length) return;
    this.entrainement.exercices[index].duree = newDuree;
  }

  /**
   * Charge les détails de l'entraînement
   */
  loadEntrainement(id: string): void {
    this.loading = true;
    this.error = null;

    this.entrainementService.getEntrainementById(id).subscribe({
      next: (entrainement) => {
        this.entrainement = entrainement;
        if (this.entrainement.exercices) {
          this.expandedExercices = new Array(this.entrainement.exercices.length).fill(false);
        }
        this.loading = false;
        console.log('Entraînement chargé:', entrainement);
        // Scroll vers la section d'échauffement si demandée via le fragment
        const fragment = this.route.snapshot.fragment;
        if (fragment === 'echauffement') {
          setTimeout(() => {
            const el = document.getElementById('echauffement');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 0);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'entraînement:', err);
        this.error = 'Erreur lors du chargement de l\'entraînement';
        this.loading = false;
      }
    });
  }

  /**
   * Retourne à la liste des entraînements
   */
  retourListe(): void {
    this.router.navigate(['/entrainements']);
  }

  /**
   * Navigue vers l'édition de l'entraînement
   */
  toggleEchauffement(): void {
    this.echauffementExpanded = !this.echauffementExpanded;
  }

  toggleSituationMatch(): void {
    this.situationMatchExpanded = !this.situationMatchExpanded;
  }

  toggleExercice(index: number): void {
    if (index >= 0 && index < this.expandedExercices.length) {
      this.expandedExercices[index] = !this.expandedExercices[index];
    }
  }

  getTotalEchauffementLabel(): string {
    const blocs = this.entrainement?.echauffement?.blocs || [];
    const totalSeconds = blocs.reduce((acc, b) => acc + this.parseTempsToSeconds(b?.temps), 0);
    return this.formatSeconds(totalSeconds);
  }

  getImportantTags(tags: any[] | undefined): any[] {
    if (!tags) {
      return [];
    }
    return tags.filter(t => t.category === 'objectif' || t.category === 'travail_specifique').slice(0, 2);
  }

  private parseTempsToSeconds(input?: string | number | null): number {
    if (input === null || input === undefined) return 0;
    if (typeof input === 'number') return Math.max(0, Math.round(input));
    const s = String(input).trim().toLowerCase().replace(',', '.');
    const mmss = s.match(/^(\d{1,2}):(\d{2})$/);
    if (mmss) {
      const m = parseInt(mmss[1], 10) || 0;
      const sec = parseInt(mmss[2], 10) || 0;
      return m * 60 + sec;
    }
    const secMatch = s.match(/^(\d+(?:\.\d+)?)\s*(s|sec|secs|seconde|secondes)$/);
    if (secMatch) return Math.round(parseFloat(secMatch[1]));
    const minMatch = s.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)?$/);
    if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);
    const asNumber = Number(s);
    if (!isNaN(asNumber)) return Math.round(asNumber * 60);
    return 0;
  }

  private formatSeconds(totalSeconds: number): string {
    const sec = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor((sec % 3600) / 60);
    const s_rem = sec % 60;
    if (m === 0 && s_rem > 0) return `${s_rem}s`;
    return `${m} min`;
  }

  modifierEntrainement(): void {
    if (this.entrainement?.id) {
      this.router.navigate(['/entrainements/modifier', this.entrainement.id]);
    }
  }

  // Ouvre l'échauffement dans une vue modale réutilisable
  openEchauffementView(): void {
    const echauffement = this.entrainement?.echauffement;
    if (!echauffement) return;
    this.dialogService.open(EchauffementViewComponent, {
      title: echauffement.nom || 'Échauffement',
      width: '720px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'entity-view-dialog',
      customData: { echauffement }
    }).subscribe();
  }

  // Ouvre un exercice dans la vue modale réutilisable
  openExerciceView(exercice: any): void {
    if (!exercice) return;
    this.dialogService.open(ExerciceViewComponent, {
      title: exercice.nom || 'Exercice',
      width: '720px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'entity-view-dialog',
      customData: { exercice }
    }).subscribe();
  }

  // Ouvre la situation/match dans la vue modale réutilisable
  openSituationView(): void {
    const situationMatch = this.entrainement?.situationMatch;
    if (!situationMatch) return;
    this.dialogService.open(SituationMatchViewComponent, {
      title: situationMatch.nom || situationMatch.type || 'Situation/Match',
      width: '720px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'entity-view-dialog',
      customData: { situationMatch }
    }).subscribe();
  }

  /**
   * Formate la date pour l'affichage
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non définie';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formate la durée en minutes
   */
  formatDuree(duree: number | undefined): string {
    if (!duree) return '';
    return `${duree} min`;
  }

  // Méthode pour convertir variablesPlus en tableau
  getVariablesArray(variables: string | string[] | undefined): string[] {
    if (!variables) return [];
    if (typeof variables === 'string') {
      return variables.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    return variables;
  }

  /**
   * Calcule la durée totale de l'entraînement
   */
  calculateTotalDuration(): string {
    if (!this.entrainement) return '0 min';

    let totalMinutes = 0;

    // Ajouter le temps de l'échauffement
    if (this.entrainement.echauffement?.blocs) {
      for (const bloc of this.entrainement.echauffement.blocs) {
        if (bloc.temps) {
          const minutes = this.parseTimeToMinutes(bloc.temps);
          totalMinutes += minutes;
        }
      }
    }

    // Ajouter le temps des exercices
    if (this.entrainement.exercices) {
      for (const exerciceEntrainement of this.entrainement.exercices) {
        if (exerciceEntrainement.duree) {
          totalMinutes += exerciceEntrainement.duree;
        }
      }
    }

    // Ajouter le temps de la situation/match
    if (this.entrainement.situationMatch?.temps) {
      const minutes = this.parseTimeToMinutes(this.entrainement.situationMatch.temps);
      totalMinutes += minutes;
    }

    return this.formatDurationDisplay(totalMinutes);
  }

  /**
   * Récupère les tags d'un exercice, quel que soit le format retourné par l'API
   * Supporte soit `exercice.tags`, soit `exercice.exerciceTags: { tag }[]`
   */
  getExerciceTags(exercice: any): any[] {
    if (!exercice) return [];
    if (Array.isArray(exercice.tags) && exercice.tags.length > 0) {
      return exercice.tags;
    }
    if (Array.isArray(exercice.exerciceTags) && exercice.exerciceTags.length > 0) {
      return exercice.exerciceTags
        .map((et: any) => et && et.tag)
        .filter((t: any) => !!t);
    }
    return [];
  }

  /**
   * Parse une chaîne de temps en minutes
   */
  private parseTimeToMinutes(timeString: string): number {
    if (!timeString) return 0;
    
    // Nettoyer la chaîne
    const cleanTime = timeString.toLowerCase().trim();
    
    // Extraire les nombres
    const minutesMatch = cleanTime.match(/(\d+)\s*(?:min|minute|minutes)/);
    const hoursMatch = cleanTime.match(/(\d+)\s*(?:h|heure|heures)/);
    
    let totalMinutes = 0;
    
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1]);
    }
    
    // Si aucun format reconnu, essayer de parser comme nombre simple
    if (totalMinutes === 0) {
      const numberMatch = cleanTime.match(/(\d+)/);
      if (numberMatch) {
        totalMinutes = parseInt(numberMatch[1]);
      }
    }
    
    return totalMinutes;
  }

  /**
   * Formate la durée pour l'affichage
   */
  openImageViewer(imageUrl: string | undefined, altText: string, context?: string): void {
    if (!imageUrl) return;

    const fullImageUrl = this.mediaUrl(imageUrl, context);
    if (!fullImageUrl) return;

    this.dialog.open<ImageViewerComponent, ImageViewerData>(ImageViewerComponent, {
      data: {
        imageUrl: fullImageUrl,
        altText: altText
      },
      panelClass: 'image-viewer-dialog-container',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
    });
  }

  mediaUrl(path?: string | null, context?: string): string | null {
    return this.apiUrl.getMediaUrl(path ?? undefined, context);
  }

  private formatDurationDisplay(totalMinutes: number): string {
    if (totalMinutes === 0) return '0 min';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      if (minutes > 0) {
        return `${hours}h ${minutes}min`;
      } else {
        return `${hours}h`;
      }
    } else {
      return `${minutes}min`;
    }
  }
}
