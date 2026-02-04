import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

import { DialogConfig, DialogResult } from './dialog-config.model';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { NamePromptDialogComponent, NamePromptDialogData, NamePromptDialogResult } from './name-prompt-dialog.component';

/**
 * Service pour la gestion des dialogues
 * Facilite l'ouverture et la configuration des dialogues dans toute l'application
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Ouvre un dialogue avec le composant spécifié et les options configurées
   * 
   * @param component Composant à afficher dans le dialogue
   * @param config Configuration du dialogue
   * @returns Une observable qui émet le résultat lorsque le dialogue est fermé
   */
  open<T, R = any>(component: ComponentType<T>, config: DialogConfig): Observable<DialogResult<R>> {
    const dialogConfig: MatDialogConfig = {
      width: config.width || '500px',
      maxWidth: config.maxWidth,
      minWidth: config.minWidth,
      height: config.height,
      maxHeight: config.maxHeight,
      minHeight: config.minHeight,
      panelClass: config.panelClass,
      disableClose: config.disableClose || false,
      data: {
        dialogConfig: config,
        customData: config.customData
      }
    };

    const dialogRef = this.dialog.open(component, dialogConfig);
    return dialogRef.afterClosed();
  }
  
  /**
   * Ouvre un dialogue de confirmation simple
   * 
   * @param title Titre du dialogue
   * @param message Message à afficher
   * @param confirmText Texte du bouton de confirmation
   * @param cancelText Texte du bouton d'annulation
   * @param dangerous Indique si l'action est dangereuse (suppression, etc.)
   * @returns Une observable qui émet true si l'utilisateur confirme, false sinon
   */
  confirm(
    title: string, 
    message: string, 
    confirmText: string = 'Confirmer', 
    cancelText: string = 'Annuler',
    dangerous: boolean = false
  ): Observable<boolean> {
    const dialogConfig: DialogConfig = {
      title,
      width: '400px',
      disableClose: true,
      customData: {
        title,
        message,
        confirmText,
        cancelText,
        dangerous
      } as ConfirmDialogData
    };
    
    return this.open(ConfirmDialogComponent, dialogConfig)
      .pipe(
        map(result => result && result.action === 'submit')
      );
  }
  prompt(
    title: string,
    initialValue: string = '',
    confirmText: string = 'Valider',
    cancelText: string = 'Annuler',
    label: string = 'Nom'
  ): Observable<string | null> {
    const dialogConfig: DialogConfig = {
      title,
      width: '500px',
      disableClose: true,
      submitButtonText: confirmText,
      closeButtonText: cancelText,
      customData: {
        title,
        label,
        initialValue,
        placeholder: ''
      } as NamePromptDialogData
    };

    return this.open<NamePromptDialogComponent, NamePromptDialogResult>(NamePromptDialogComponent, dialogConfig)
      .pipe(
        map(result => {
          if (result && result.action === 'submit' && result.data) {
            return result.data.value;
          }
          return null;
        })
      );
  }
}
