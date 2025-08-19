import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

// Imports Angular Material (groupés et ordonnés alphabétiquement)
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Imports de services
import { TrainingSimpleService } from '../../../core/services/training-simple.service';
import { TrainingDialogService } from '../services/training-dialog.service';
import { DialogService } from '../../../shared/components/dialog';
import { ErrorHandlingService, ErrorType } from '../../../shared/services/error-handling.service';

// Imports de modèles
import { TrainingSimple, TrainingSimpleCreate } from '../../../core/models/training.simple';
import { PaginationEvent } from '../../../shared/models/pagination-event.model';

// Imports de composants partagés
import { ColumnConfig, DataTableComponent, PaginationConfig } from '../../../shared/components/data-table/data-table.component';
import { TrainingActionsComponent } from '../../../shared/widgets/training-actions/training-actions.component';

// Imports de composants locaux
import { AddTrainingButtonComponent } from '../components/add-training-button.component';
import { TrainingDialogData } from '../components/training-edit-dialog.component';
import { DialogResult } from '../../../shared/components/dialog/dialog-config.model';

/**
 * Interface pour les événements d'action du DataTable
 */
interface ActionEvent {
  type: 'view' | 'edit' | 'delete' | 'duplicate';
  row: unknown;
}

/**
 * Composant simplifié pour afficher la liste des entraînements
 * N'affiche que le titre de chaque entraînement avec des actions basiques
 */
@Component({
  selector: 'app-training-list-simple',
  templateUrl: './training-list-simple.component.html',
  styleUrls: ['./training-list-simple.component.css'],
  standalone: true,
  imports: [
    // Modules Angular core
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    
    // Modules Angular Material
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    
    // Composants partagés
    DataTableComponent,
    TrainingActionsComponent,
    
    // Composants locaux
    AddTrainingButtonComponent
  ]
})
export class TrainingListSimpleComponent implements OnInit {
  trainings: TrainingSimple[] = [];
  filteredTrainings: TrainingSimple[] = [];
  searchControl = new FormControl('');
  searchText = '';
  
  // Configuration des colonnes pour le DataTable - simplifié à uniquement le titre
  columns: ColumnConfig[] = [
    { key: 'titre', header: 'Titre', width: '85%' },
    { key: 'actions', header: 'Actions', width: '15%', type: 'custom-actions' }
  ];
  
  // Configuration de la pagination
  pagination: PaginationConfig = {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    pageSizeOptions: [5, 10, 25, 50]
  };

  constructor(
    private trainingService: TrainingSimpleService,
    private trainingDialogService: TrainingDialogService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar,
    private errorService: ErrorHandlingService
  ) {}

  ngOnInit(): void {
    this.refreshTrainings();
    
    // Configurer la recherche en temps réel
    this.searchControl.valueChanges.subscribe(value => {
      this.searchText = value || '';
      this.filterTrainings();
    });
  }
  
  /**
   * Filtre les entraînements en fonction du texte de recherche
   */
  filterTrainings(): void {
    if (!this.searchText) {
      this.filteredTrainings = [...this.trainings];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredTrainings = this.trainings.filter(training => 
        training.titre.toLowerCase().includes(searchLower)
      );
    }
    this.pagination.totalItems = this.filteredTrainings.length;
  }

  /**
   * Rafraîchit la liste des entraînements
   */
  refreshTrainings(): void {
    this.trainingService.getAllTrainings().subscribe({
      next: (data: TrainingSimple[]) => {
        // Utiliser directement les données du backend, sans ajout de propriétés fictives
        this.trainings = data;
        this.filterTrainings();
        this.pagination.totalItems = this.trainings.length;
      },
      error: (error: unknown) => {
        this.errorService.handleErrorWithConfig({
          type: ErrorType.SERVER,
          userMessage: 'Erreur lors du chargement des entraînements',
          logMessage: 'Erreur lors de la récupération des entraînements depuis l\'API',
          originalError: error,
          duration: 3000
        });
      }
    });
  }



  /**
   * Gestion des actions du DataTable (pour compatibilité avec l'ancienne version)
   * @param event L'événement d'action provenant du DataTable
   */
  onAction(event: ActionEvent): void {
    const { type, row } = event;
    const training = row as TrainingSimple;
    
    switch (type) {
      case 'view':
        this.viewTraining(training);
        break;
      case 'edit':
        this.editTraining(training);
        break;
      case 'delete':
        this.deleteTraining(training.id);
        break;
      case 'duplicate':
        this.duplicateTraining(training);
        break;
    }
  }
  
  /**
   * Ouvre un dialogue pour afficher les détails d'un entraînement
   * @param training L'entraînement à afficher
   */
  viewTraining(training: TrainingSimple): void {
    const dialogData: TrainingDialogData = {
      id: training.id,
      titre: training.titre
    };
    
    this.trainingDialogService.openViewDialog(dialogData).subscribe();
  }

  /**
   * Ouvre un dialogue pour modifier un entraînement
   * @param training L'entraînement à modifier
   */
  editTraining(training: TrainingSimple): void {
    const dialogData: TrainingDialogData = {
      id: training.id,
      titre: training.titre
    };
    
    this.trainingDialogService.openEditDialog(dialogData).subscribe((result: DialogResult<TrainingDialogData> | undefined) => {
      if (result && result.action === 'submit' && result.data) {
        // Typage explicite de l'objet de mise à jour conforme à l'interface TrainingSimpleCreate
        const updateData: TrainingSimpleCreate = { titre: result.data.titre };
        
        this.trainingService.updateTraining(training.id, updateData).subscribe({
          next: () => {
            this.snackBar.open('Entraînement modifié avec succès', 'Fermer', {
              duration: 3000
            });
            this.refreshTrainings();
          },
          error: (error: any) => {
            this.errorService.handleErrorWithConfig({
              type: ErrorType.SERVER,
              userMessage: 'Erreur lors de la modification de l\'entraînement',
              logMessage: `Échec de mise à jour de l'entraînement ${training.id}`,
              originalError: error,
              duration: 3000
            });
          }
        });
      }
    });
  }

  /**
   * Supprime un entraînement en utilisant le dialogue de confirmation générique
   * @param id ID de l'entraînement à supprimer
   */
  deleteTraining(id: string): void {
    this.dialogService.confirm(
      'Supprimer l\'entraînement',
      'Êtes-vous sûr de vouloir supprimer cet entraînement ?<br/><br/>Cette action est irréversible.',
      'Supprimer',
      'Annuler',
      true // Action dangereuse
    ).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.trainingService.deleteTraining(id).subscribe({
          next: () => {
            this.snackBar.open('Entraînement supprimé avec succès', 'Fermer', {
              duration: 3000
            });
            this.refreshTrainings();
          },
          error: (error: any) => {
            this.errorService.handleErrorWithConfig({
              type: ErrorType.SERVER,
              userMessage: 'Erreur lors de la suppression de l\'entraînement',
              logMessage: `Échec de suppression de l'entraînement ${id}`,
              originalError: error,
              duration: 3000
            });
          }
        });
      }
    });
  }

  /**
   * Duplique un entraînement existant
   * @param training L'entraînement à dupliquer
   */
  duplicateTraining(training: TrainingSimple): void {
    const newTitle = `${training.titre} (copie)`;
    
    // Typage explicite de l'objet de création conforme à l'interface TrainingSimpleCreate
    const newTraining: TrainingSimpleCreate = { titre: newTitle };
    
    this.trainingService.createTraining(newTraining).subscribe({
      next: () => {
        this.snackBar.open('Entraînement dupliqué avec succès', 'Fermer', {
          duration: 3000
        });
        this.refreshTrainings();
      },
      error: (error: any) => {
        this.errorService.handleErrorWithConfig({
          type: ErrorType.SERVER,
          userMessage: 'Erreur lors de la duplication de l\'entraînement',
          logMessage: `Échec de duplication de l'entraînement "${training.titre}"`,
          originalError: error,
          duration: 3000
        });
      }
    });
  }
  
  /**
   * Gère le changement de page
   * @param event L'événement de pagination
   */
  onPageChange(event: PaginationEvent): void {
    this.pagination.currentPage = event.page;
    this.pagination.pageSize = event.pageSize;
  }
}
