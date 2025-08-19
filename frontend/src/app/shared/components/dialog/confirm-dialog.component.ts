import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogBaseComponent } from './dialog-base.component';
import { DialogConfig } from './dialog-config.model';

/**
 * Interface pour les données du dialogue de confirmation
 */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  dangerous?: boolean; // Pour les actions destructives (suppression, etc.)
}

/**
 * Composant générique de dialogue de confirmation
 * Utilisé pour les confirmations d'actions (suppression, etc.)
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogBaseComponent
  ],
  template: `
    <app-dialog-base [config]="dialogConfig" (submit)="onConfirm()">
      <div class="confirm-content">
        <p *ngIf="data?.customData?.message" [innerHTML]="data.customData.message"></p>
      </div>
    </app-dialog-base>
  `,
  styles: [`
    .confirm-content {
      padding: 8px 0;
      font-size: 1rem;
    }
  `]
})
export class ConfirmDialogComponent {
  dialogConfig: DialogConfig;
  
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dialogConfig: DialogConfig, customData: ConfirmDialogData }
  ) {
    const confirmData = data.customData;
    
    // Configuration du dialogue de confirmation
    this.dialogConfig = {
      ...data.dialogConfig,
      title: confirmData.title || 'Confirmation',
      submitButtonText: confirmData.confirmText || 'Confirmer',
      closeButtonText: confirmData.cancelText || 'Annuler'
    };
    
    // Si l'action est dangereuse, changer la couleur du bouton
    if (confirmData.dangerous) {
      this.dialogConfig.dangerAction = true;
    }
  }
  
  /**
   * Confirme l'action
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
