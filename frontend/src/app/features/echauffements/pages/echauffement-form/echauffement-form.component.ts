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

        // Le cast en 'any' est une solution pragmatique ici. Le service générique 'entityCrudService'
    // est conçu pour chercher une propriété 'image' (un File) sur l'objet de données,
    // mais le type 'Partial<Echauffement>' ne la déclare pas, causant une erreur TypeScript.
    // En castant, on contourne cette vérification de type pour permettre à l'upload de fonctionner.
    const operation = this.isEditMode && this.echauffementId
      ? this.echauffementService.updateEchauffement(this.echauffementId, formData as any)
      : this.echauffementService.createEchauffement(formData as any);

    operation.subscribe({
                  next: (result: Echauffement) => {
        const message = this.isEditMode ? 'Échauffement modifié avec succès' : 'Échauffement créé avec succès';
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
        this.router.navigate(['/echauffements']);
        this.isLoading = false;
      },
            error: (error: any) => {
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
