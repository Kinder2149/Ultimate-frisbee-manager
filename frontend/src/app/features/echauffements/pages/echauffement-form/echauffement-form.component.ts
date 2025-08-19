import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { EchauffementService } from '../../../../core/services/echauffement.service';
import { Echauffement } from '../../../../core/models/echauffement.model';
import { EchauffementFormComponent as SharedEchauffementFormComponent, EchauffementFormData } from '../../../../shared/components/forms/echauffement-form/echauffement-form.component';

@Component({
  selector: 'app-echauffement-form-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    SharedEchauffementFormComponent
  ],
  templateUrl: './echauffement-form.component.html',
  styleUrls: ['./echauffement-form.component.css']
})
export class EchauffementFormComponent implements OnInit {
  echauffement?: Echauffement;
  isEditMode = false;
  echauffementId: string | null = null;
  isLoading = false;

  constructor(
    private echauffementService: EchauffementService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.echauffementId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.echauffementId;

    if (this.isEditMode && this.echauffementId) {
      this.loadEchauffement(this.echauffementId);
    }
  }

  private loadEchauffement(id: string): void {
    this.isLoading = true;
    this.echauffementService.getEchauffementById(id).subscribe({
      next: (echauffement) => {
        this.echauffement = echauffement;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'échauffement:', error);
        this.snackBar.open('Erreur lors du chargement de l\'échauffement', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onFormSubmit(formData: EchauffementFormData): void {
    this.isLoading = true;

    const operation = this.isEditMode && this.echauffementId
      ? this.echauffementService.updateEchauffement(this.echauffementId, formData)
      : this.echauffementService.ajouterEchauffement(formData);

    operation.subscribe({
      next: (result) => {
        const message = this.isEditMode ? 'Échauffement modifié avec succès' : 'Échauffement créé avec succès';
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
        this.router.navigate(['/echauffements']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onFormCancel(): void {
    this.router.navigate(['/echauffements']);
  }
}
