import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DialogBaseComponent } from './dialog-base.component';
import { DialogConfig, DialogResult } from './dialog-config.model';

export interface NamePromptDialogData {
  title: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
}

export interface NamePromptDialogResult {
  value: string;
}

@Component({
  selector: 'app-name-prompt-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    DialogBaseComponent,
  ],
  template: `
    <app-dialog-base [config]="dialogConfig" [isSubmitDisabled]="nameCtrl.invalid">
      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>{{ label }}</mat-label>
        <input matInput [formControl]="nameCtrl" [placeholder]="placeholder" />
        <mat-error *ngIf="nameCtrl.hasError('required')">Le nom est requis.</mat-error>
      </mat-form-field>

      <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 4px;">
        <button mat-button type="button" (click)="onCancel()">{{ dialogConfig.closeButtonText || 'Annuler' }}</button>
        <button mat-raised-button color="primary" type="button" [disabled]="nameCtrl.invalid" (click)="onSubmit()">
          {{ dialogConfig.submitButtonText || 'Valider' }}
        </button>
      </div>
    </app-dialog-base>
  `,
})
export class NamePromptDialogComponent {
  dialogConfig: DialogConfig;
  label: string;
  placeholder: string;
  nameCtrl = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });

  constructor(
    public dialogRef: MatDialogRef<NamePromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dialogConfig: DialogConfig; customData: NamePromptDialogData }
  ) {
    this.dialogConfig = {
      ...data.dialogConfig,
      title: data.customData?.title || 'Nom',
      submitButtonText: data.dialogConfig?.submitButtonText || 'Valider',
      closeButtonText: data.dialogConfig?.closeButtonText || 'Annuler',
      hideDialogActions: true,
    };

    this.label = data.customData?.label || 'Nom';
    this.placeholder = data.customData?.placeholder || '';

    const initial = (data.customData?.initialValue || '').trim();
    if (initial) {
      this.nameCtrl.setValue(initial);
    }
  }

  onCancel(): void {
    const result: DialogResult = { action: 'cancel' };
    this.dialogRef.close(result);
  }

  onSubmit(): void {
    if (this.nameCtrl.invalid) return;
    const value = this.nameCtrl.value.trim();
    if (!value) return;

    const result: DialogResult<NamePromptDialogResult> = { action: 'submit', data: { value } };
    this.dialogRef.close(result);
  }
}
