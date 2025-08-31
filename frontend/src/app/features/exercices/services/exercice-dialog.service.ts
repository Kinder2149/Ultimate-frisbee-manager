import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogService } from '../../../shared/components/dialog';
import { ExerciceFormComponent } from '../pages/exercice-form/exercice-form.component';
import { ExerciceViewComponent } from '../../../shared/components/exercice-view/exercice-view.component';
import { Exercice } from '../../../core/models/exercice.model';

/**
 * Configuration pour le dialogue d'exercice
 */
interface ExerciceDialogConfig {
  mode: 'create' | 'edit' | 'view';
  exercice?: Partial<Exercice>;
}

/**
 * Service pour gérer les dialogues liés aux exercices
 * 
 * Ce service fournit des méthodes pour ouvrir les différents dialogues
 * liés aux exercices (création, édition, visualisation)
 * en utilisant le DialogService partagé.
 */
@Injectable({
  providedIn: 'root'
})
export class ExerciceDialogService {
  /** Largeur par défaut des dialogues */
  private readonly DEFAULT_DIALOG_WIDTH = '800px';
  private readonly DIALOG_HEIGHT = '90vh';

  constructor(private dialogService: DialogService) {}

  /**
   * Ouvre le dialogue pour ajouter un nouvel exercice
   * @returns Observable émettant le résultat du dialogue
   */
  openAddDialog(): Observable<any> {
    const config = {
      title: 'Ajouter un exercice',
      width: this.DEFAULT_DIALOG_WIDTH,
      height: this.DIALOG_HEIGHT,
      disableClose: true,
      customData: {
        mode: 'create'
      } as ExerciceDialogConfig
    };
    
    return this.dialogService.open<ExerciceFormComponent, ExerciceDialogConfig>(
      ExerciceFormComponent, 
      config
    );
  }

  /**
   * Ouvre le dialogue pour modifier un exercice existant
   * @param exercice L'exercice à modifier
   * @returns Observable émettant le résultat du dialogue
   */
  openEditDialog(exercice: Exercice): Observable<any> {
    const config = {
      title: `Modifier l'exercice: ${exercice.nom}`,
      width: this.DEFAULT_DIALOG_WIDTH,
      height: this.DIALOG_HEIGHT,
      disableClose: true,
      customData: {
        mode: 'edit',
        exercice: { ...exercice }
      } as ExerciceDialogConfig
    };
    
    return this.dialogService.open<ExerciceFormComponent, ExerciceDialogConfig>(
      ExerciceFormComponent, 
      config
    );
  }

  /**
   * Ouvre le dialogue pour visualiser un exercice
   * @param exercice L'exercice à visualiser
   * @returns Observable émettant le résultat du dialogue
   */
  openViewDialog(exercice: Exercice): Observable<any> {
    const config = {
      title: exercice.nom || 'Exercice',
      width: '720px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'entity-view-dialog',
      customData: {
        exercice: { ...exercice }
      } as { exercice: Partial<Exercice> }
    };

    return this.dialogService.open<ExerciceViewComponent, { exercice: Partial<Exercice> }>(
      ExerciceViewComponent,
      config
    );
  }
}
