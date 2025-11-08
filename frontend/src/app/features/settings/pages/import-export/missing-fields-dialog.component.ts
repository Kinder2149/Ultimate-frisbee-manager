import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface MissingFieldItem {
  index: number;
  fields: Array<{ name: string; value: string; required: boolean }>;
}

export interface MissingFieldsDialogData {
  title?: string;
  items: MissingFieldItem[];
}

@Component({
  selector: 'app-missing-fields-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
  <h2 mat-dialog-title>{{ data.title || 'Champs manquants' }}</h2>
  <div mat-dialog-content>
    <p>Complétez les champs requis ou choisissez de laisser vide.</p>
    <div *ngFor="let it of data.items" class="block">
      <div class="idx">Élément #{{ it.index + 1 }}</div>
      <div class="row" *ngFor="let f of it.fields">
        <label>
          <span>{{ f.name }} <span *ngIf="f.required" class="req">*</span></span>
          <input type="text" [(ngModel)]="f.value" placeholder="Valeur" />
        </label>
      </div>
    </div>
  </div>
  <div mat-dialog-actions align="end">
    <button mat-button (click)="onIgnore()">Ignorer</button>
    <button mat-raised-button color="primary" (click)="onConfirm()">Appliquer</button>
  </div>
  `,
  styles: [`
    .block { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; margin: 8px 0; }
    .idx { font-weight: 600; margin-bottom: 6px; }
    .row { display: flex; gap: 12px; align-items: center; margin: 6px 0; }
    label { display: flex; gap: 8px; align-items: center; width: 100%; }
    input { flex: 1; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
    .req { color: #dc2626; }
  `]
})
export class MissingFieldsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MissingFieldsDialogData,
    private dialogRef: MatDialogRef<MissingFieldsDialogComponent, MissingFieldItem[] | 'ignore'>
  ) {}

  onIgnore() {
    this.dialogRef.close('ignore');
  }

  onConfirm() {
    this.dialogRef.close(this.data.items);
  }
}
