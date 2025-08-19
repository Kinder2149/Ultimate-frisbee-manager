import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Entrainement } from '../../../../core/models/entrainement.model';
import { EntrainementService } from '../../../../core/services/entrainement.service';

@Component({
  selector: 'app-entrainement-detail',
  templateUrl: './entrainement-detail.component.html',
  styleUrls: ['./entrainement-detail.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class EntrainementDetailComponent implements OnInit {
  entrainement: Entrainement | null = null;
  loading = false;
  error: string | null = null;
  entrainementId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entrainementService: EntrainementService
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
   * Charge les détails de l'entraînement
   */
  loadEntrainement(id: string): void {
    this.loading = true;
    this.error = null;

    this.entrainementService.getEntrainementById(id).subscribe({
      next: (entrainement) => {
        this.entrainement = entrainement;
        this.loading = false;
        console.log('Entraînement chargé:', entrainement);
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
  modifierEntrainement(): void {
    if (this.entrainement?.id) {
      this.router.navigate(['/entrainements/modifier', this.entrainement.id]);
    }
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
