import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

// Modèles
import { DialogConfig, DialogResult } from './dialog-config.model';

/**
 * Composant de base pour les dialogues
 * Fournit une structure commune et un comportement standard pour tous les dialogues
 */
@Component({
  selector: 'app-dialog-base',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title *ngIf="config.title" class="dialog-title">
        {{ config.title }}
        <button *ngIf="!config.disableClose" mat-icon-button class="close-button" 
          (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </h2>
      
      <mat-dialog-content class="dialog-content">
        <ng-content></ng-content>
      </mat-dialog-content>
      
      <mat-dialog-actions *ngIf="!config.hideDialogActions" align="end" class="dialog-actions">
        <button *ngIf="config.showCloseButton !== false" mat-button 
          (click)="onCancel()">
          {{ config.closeButtonText || 'Annuler' }}
        </button>
        <button *ngIf="config.showSubmitButton !== false" mat-raised-button 
          [color]="config.dangerAction ? 'warn' : 'primary'" 
          [disabled]="isSubmitDisabled" 
          (click)="onSubmit()">
          {{ config.submitButtonText || 'Enregistrer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
    }
    
    .dialog-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .dialog-content {
      overflow-x: hidden;
      padding: 8px 0;
      margin: 0;
    }
    
    .dialog-actions {
      padding: 16px 0 0;
    }
    
    .close-button {
      margin-left: auto;
    }
  `]
})
export class DialogBaseComponent implements OnInit {
  @Input() config: DialogConfig = {
    title: '',
    showCloseButton: true,
    showSubmitButton: true
  };
  
  @Input() isSubmitDisabled = false;
  
  @Output() cancel = new EventEmitter<DialogResult>();
  @Output() submit = new EventEmitter<DialogResult>();
  @Output() close = new EventEmitter<DialogResult>();
  
  constructor(public dialogRef?: MatDialogRef<any>) { }
  
  ngOnInit(): void { }
  
  /**
   * Fermeture du dialogue avec action "close"
   */
  onClose(): void {
    const result: DialogResult = { action: 'close' };
    this.close.emit(result);
    if (this.dialogRef) {
      this.dialogRef.close(result);
    }
  }
  
  /**
   * Annulation du dialogue avec action "cancel"
   */
  onCancel(): void {
    const result: DialogResult = { action: 'cancel' };
    this.cancel.emit(result);
    if (this.dialogRef) {
      this.dialogRef.close(result);
    }
  }
  
  /**
   * Soumission du dialogue avec action "submit"
   * Les données doivent être fournies par les composants enfants
   * @param data Données optionnelles à inclure dans le résultat
   */
  onSubmit(data?: any): void {
    const result: DialogResult = { 
      action: 'submit',
      data
    };
    this.submit.emit(result);
    if (this.dialogRef) {
      this.dialogRef.close(result);
    }
  }
}
