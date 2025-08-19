import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogService } from '../../../shared/components/dialog';
import { AddTrainingDialogComponent } from '../components/add-training-dialog.component';
import { TrainingDialogData, TrainingEditDialogComponent } from '../components/training-edit-dialog.component';
import { TrainingViewDialogComponent } from '../components/training-view-dialog.component';
import { DialogConfig, DialogResult } from '../../../shared/components/dialog/dialog-config.model';

/**
 * Service pour la gestion des dialogues d'entraînement
 * 
 * @description
 * Ce service centralise la logique d'ouverture et de configuration des différents
 * dialogues liés à la gestion des entraînements. Il fournit une interface cohérente
 * pour l'ajout, la modification et la visualisation des entraînements.
 * 
 * @example
 * // Utilisation typique dans un composant
 * constructor(private dialogService: TrainingDialogService) {}
 * 
 * // Ouvrir le dialogue d'ajout
 * this.dialogService.openAddDialog().subscribe(result => {
 *   if (result?.action === 'submit' && result.data) {
 *     // Traiter les données du formulaire
 *   }
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class TrainingDialogService {
  /** Largeur par défaut des dialogues */
  private readonly DEFAULT_DIALOG_WIDTH = '400px';

  constructor(private readonly dialogService: DialogService) {}

  /**
   * Ouvre le dialogue pour ajouter un nouvel entraînement
   * 
   * @returns {Observable<DialogResult<TrainingDialogData>>} 
   * Observable émettant le résultat du dialogue avec les données du nouvel entraînement
   * 
   * @example
   * this.dialogService.openAddDialog().subscribe({
   *   next: (result) => {
   *     if (result?.action === 'submit' && result.data) {
   *       // Créer l'entraînement avec result.data
   *     }
   *   },
   *   error: (error) => console.error('Erreur dans le dialogue', error)
   * });
   */
  public openAddDialog(): Observable<DialogResult<TrainingDialogData>> {
    const config: DialogConfig = {
      title: 'Ajouter un entraînement',
      width: this.DEFAULT_DIALOG_WIDTH,
      disableClose: true,
      submitButtonText: 'Créer',
      customData: {
        titre: '',
        date: new Date().toISOString().split('T')[0] // Date du jour par défaut
      } as TrainingDialogData
    };
    
    return this.dialogService.open<AddTrainingDialogComponent, TrainingDialogData>(
      AddTrainingDialogComponent, 
      config
    );
  }
  
  /**
   * Ouvre le dialogue pour modifier un entraînement existant
   * 
   * @param {TrainingDialogData} training - Données de l'entraînement à modifier
   * @returns {Observable<DialogResult<TrainingDialogData>>} 
   * Observable émettant le résultat du dialogue avec les données mises à jour
   * 
   * @throws {Error} Si les données de l'entraînement sont invalides
   */
  public openEditDialog(training: TrainingDialogData): Observable<DialogResult<TrainingDialogData>> {
    if (!training?.id) {
      throw new Error('Impossible de modifier un entraînement sans ID valide');
    }

    const config: DialogConfig = {
      title: 'Modifier l\'entraînement',
      width: this.DEFAULT_DIALOG_WIDTH,
      disableClose: true,
      submitButtonText: 'Enregistrer',
      customData: { ...training } as TrainingDialogData
    };
    
    return this.dialogService.open<TrainingEditDialogComponent, TrainingDialogData>(
      TrainingEditDialogComponent, 
      config
    );
  }
  
  /**
   * Ouvre le dialogue pour visualiser les détails d'un entraînement
   * 
   * @param {TrainingDialogData} training - Données de l'entraînement à afficher
   * @returns {Observable<DialogResult<TrainingDialogData>>} 
   * Observable émettant le résultat du dialogue (généralement fermeture)
   * 
   * @throws {Error} Si les données de l'entraînement sont invalides
   */
  public openViewDialog(training: TrainingDialogData): Observable<DialogResult<TrainingDialogData>> {
    if (!training?.id) {
      throw new Error('Impossible d\'afficher un entraînement sans ID valide');
    }

    const config: DialogConfig = {
      title: 'Détails de l\'entraînement',
      width: this.DEFAULT_DIALOG_WIDTH,
      showSubmitButton: false,
      closeButtonText: 'Fermer',
      customData: { ...training } as TrainingDialogData
    };
    
    return this.dialogService.open<TrainingViewDialogComponent, TrainingDialogData>(
      TrainingViewDialogComponent, 
      config
    );
  }
}
