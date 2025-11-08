import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface TagResolutionItem {
  original: string;
  mapped?: string;
  choice: 'mapped' | 'legacy';
}

export interface ImportResolverData {
  title?: string;
  tagItems: TagResolutionItem[];
}

@Component({
  selector: 'app-import-resolver',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
  <h2 mat-dialog-title>{{ data.title || 'Résolution d\'import' }}</h2>
  <div mat-dialog-content>
    <p>Certains tags hérités ont été détectés. Choisissez comment les convertir:</p>
    <div *ngFor="let item of data.tagItems; let i = index" class="row">
      <div class="col">
        <strong>{{ item.original }}</strong>
      </div>
      <div class="col">
        <label>
          <input type="radio" name="choice-{{i}}" [(ngModel)]="item.choice" value="mapped" />
          {{ item.mapped || 'suggestion indisponible' }}
        </label>
        <label style="margin-left:1rem;">
          <input type="radio" name="choice-{{i}}" [(ngModel)]="item.choice" value="legacy" />
          Conserver en legacy:{{ item.original }}
        </label>
      </div>
    </div>
  </div>
  <div mat-dialog-actions align="end">
    <button mat-button (click)="onCancel()">Annuler</button>
    <button mat-raised-button color="primary" (click)="onConfirm()">Confirmer</button>
  </div>
  `,
  styles: [`
    .row { display:flex; align-items:center; padding: 6px 0; }
    .col { margin-right: 12px; }
  `]
})
export class ImportResolverComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ImportResolverData,
    private dialogRef: MatDialogRef<ImportResolverComponent, string[]>
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    const resolved = this.data.tagItems.map(it => it.choice === 'mapped' && it.mapped ? it.mapped : `legacy:${it.original}`);
    this.dialogRef.close(resolved);
  }
}
