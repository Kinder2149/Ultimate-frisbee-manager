import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExportImportService, ImportResult } from '../../core/services/export-import.service';
import { FILE_EXT_UFM } from '@ufm/shared/constants/export-import';

@Component({
  selector: 'app-export-import-debug',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <h2>Debug Export / Import (dev only)</h2>
      <section>
        <h3>Export</h3>
        <div class="row">
          <mat-form-field appearance="fill">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="type">
              <mat-option *ngFor="let t of types" [value]="t">{{t}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>ID</mat-label>
            <input matInput [(ngModel)]="id" placeholder="Identifiant" />
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="onExport()" [disabled]="!type || !id">Exporter</button>
        </div>
        <pre *ngIf="exportPreview" class="preview">{{ exportPreview }}</pre>
      </section>
      <section>
        <h3>Import</h3>
        <input type="file" [accept]="fileExt" (change)="onFileSelected($event)" />
        <div class="actions">
          <button mat-raised-button color="accent" (click)="onImport()" [disabled]="!selectedFile">Importer (interactif)</button>
        </div>
        <pre *ngIf="importResult" class="preview">{{ importResult | json }}</pre>
      </section>
    </mat-card>
  `,
  styles: [`
    .row { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }
    .preview { background:#0b1020; color:#dfe7ff; padding:12px; border-radius:6px; max-height: 320px; overflow: auto; }
    section { margin-bottom: 16px; }
  `]
})
export class ExportImportDebugComponent {
  types: string[] = ['entrainement','exercice','echauffement','situation'];
  type: string = 'entrainement';
  id: string = '';
  exportPreview: string | null = null;
  selectedFile: File | null = null;
  importResult: ImportResult | null = null;
  readonly fileExt = FILE_EXT_UFM;

  constructor(private svc: ExportImportService) {}

  async onExport() {
    this.exportPreview = null;
    const filename = await this.svc.exportElement(this.type, this.id);
    this.exportPreview = `Export demandé pour ${this.type}/${this.id} -> ${filename}`;
  }

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    this.selectedFile = (input.files && input.files.length) ? input.files[0] : null;
  }

  async onImport() {
    if (!this.selectedFile) return;
    this.importResult = await this.svc.importFromFile(this.selectedFile, true);
  }
}
