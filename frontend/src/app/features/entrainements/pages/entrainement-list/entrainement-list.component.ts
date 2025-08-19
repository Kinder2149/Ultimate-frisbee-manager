import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Entrainement } from '../../../../core/models/entrainement.model';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { DuplicateButtonComponent } from '../../../../shared/components/duplicate-button/duplicate-button.component';

@Component({
  selector: 'app-entrainement-list',
  templateUrl: './entrainement-list.component.html',
  styleUrls: ['./entrainement-list.component.css'],
  standalone: true,
  imports: [CommonModule, DuplicateButtonComponent]
})
export class EntrainementListComponent implements OnInit {
  entrainements: Entrainement[] = [];
  loading: boolean = false;
  error: string | null = null;
  duplicatingIds: Set<string> = new Set();

  constructor(
    private entrainementService: EntrainementService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEntrainements();
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
