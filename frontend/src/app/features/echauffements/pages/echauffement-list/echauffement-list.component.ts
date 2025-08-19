import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EchauffementService } from '../../../../core/services/echauffement.service';
import { Echauffement } from '../../../../core/models/echauffement.model';
import { ConfirmDialogComponent } from '../../../../shared/components/dialog/confirm-dialog.component';

@Component({
  selector: 'app-echauffement-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './echauffement-list.component.html',
  styleUrls: ['./echauffement-list.component.css']
})
export class EchauffementListComponent implements OnInit {
  echauffements: Echauffement[] = [];
  isLoading = false;

  constructor(
    private echauffementService: EchauffementService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEchauffements();
  }

  loadEchauffements(): void {
    this.isLoading = true;
    this.echauffementService.getEchauffements().subscribe({
      next: (echauffements) => {
        this.echauffements = echauffements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des échauffements:', error);
        this.snackBar.open('Erreur lors du chargement des échauffements', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onCreateEchauffement(): void {
    this.router.navigate(['/echauffements/ajouter']);
  }

  onEditEchauffement(echauffement: Echauffement): void {
    this.router.navigate(['/echauffements/modifier', echauffement.id]);
  }

  onDuplicateEchauffement(echauffement: Echauffement): void {
    if (!echauffement.id) return;

    this.echauffementService.duplicateEchauffement(echauffement.id).subscribe({
      next: (duplicatedEchauffement) => {
        this.snackBar.open('Échauffement dupliqué avec succès', 'Fermer', { duration: 3000 });
        this.loadEchauffements(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur lors de la duplication:', error);
        this.snackBar.open('Erreur lors de la duplication', 'Fermer', { duration: 3000 });
      }
    });
  }

  onDeleteEchauffement(echauffement: Echauffement): void {
    if (!echauffement.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        dialogConfig: {
          title: 'Confirmer la suppression',
          submitButtonText: 'Supprimer',
          closeButtonText: 'Annuler'
        },
        customData: {
          title: 'Confirmer la suppression',
          message: `Êtes-vous sûr de vouloir supprimer l'échauffement "${echauffement.nom}" ?`,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
          dangerous: true
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && echauffement.id) {
        this.echauffementService.deleteEchauffement(echauffement.id).subscribe({
          next: () => {
            this.snackBar.open('Échauffement supprimé avec succès', 'Fermer', { duration: 3000 });
            this.loadEchauffements(); // Recharger la liste
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  getNombreBlocsText(echauffement: Echauffement): string {
    const nombreBlocs = echauffement.blocs?.length || 0;
    return nombreBlocs === 0 ? 'Aucun bloc' :
           nombreBlocs === 1 ? '1 bloc' :
           `${nombreBlocs} blocs`;
  }

  getDescriptionTruncated(description: string | undefined, maxLength: number = 150): string {
    if (!description) {
      return '';
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
