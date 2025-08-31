import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../core/material/material.module';
import { ImportService, MdFilePayload } from '../../../../core/services/import.service';

@Component({
  selector: 'app-import-exercices',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
  <div class="container">
    <mat-card>
      <mat-card-title>Import d'exercices (Markdown)</mat-card-title>
      <mat-card-subtitle>Chargez un ou plusieurs fichiers .md, lancez un Dry-run pour valider, puis appliquez.</mat-card-subtitle>

      <div class="actions">
        <input type="file" multiple accept=".md" (change)="onFilesSelected($event)" />
      </div>

      <div *ngIf="files().length > 0" class="files">
        <mat-chip-listbox aria-label="Fichiers sélectionnés">
          <mat-chip *ngFor="let f of files()">{{ f.name || 'sans-nom.md' }}</mat-chip>
        </mat-chip-listbox>
      </div>

      <div class="buttons">
        <button mat-raised-button color="primary" (click)="dryRun()" [disabled]="loading() || files().length===0">
          Dry-run
        </button>
        <button mat-raised-button color="accent" (click)="apply()" [disabled]="loading() || files().length===0">
          Appliquer
        </button>
      </div>

      <div class="status" *ngIf="loading()">
        <mat-progress-spinner mode="indeterminate" diameter="28"></mat-progress-spinner>
        <span>Traitement en cours…</span>
      </div>

      <div *ngIf="error()" class="error">
        <mat-icon color="warn">error</mat-icon>
        <span>{{ error() }}</span>
      </div>

      <div *ngIf="report()" class="report">
        <mat-card-subtitle>Rapport</mat-card-subtitle>
        <pre>{{ report() | json }}</pre>
      </div>
    </mat-card>
  </div>
  `,
  styles: [`
    .container { padding: 16px; max-width: 960px; margin: 0 auto; }
    mat-card { padding-bottom: 8px; }
    .actions { margin: 12px 0; }
    .files { margin: 8px 0 16px; }
    .buttons { display: flex; gap: 12px; margin: 8px 0 16px; }
    .status { display: flex; gap: 8px; align-items: center; margin: 8px 0; }
    .error { display: flex; gap: 6px; align-items: center; color: #b71c1c; margin: 8px 0; }
    .report pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; overflow: auto; max-height: 420px; }
  `]
})
export class ImportExercicesComponent {
  files = signal<MdFilePayload[]>([]);
  loading = signal(false);
  report = signal<any | null>(null);
  error = signal<string | null>(null);

  constructor(private importService: ImportService) {}

  onFilesSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const fileList = Array.from(input.files);
    this.readFiles(fileList).then(payloads => {
      this.files.set(payloads);
      this.report.set(null);
      this.error.set(null);
    });
  }

  private async readFiles(fileList: File[]): Promise<MdFilePayload[]> {
    const readers = fileList.map(f => this.readAsText(f).then(content => ({ name: f.name, content })));
    return Promise.all(readers);
  }

  private readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (e) => reject(e);
      reader.readAsText(file, 'utf-8');
    });
  }

  dryRun() {
    this.execute(true);
  }

  apply() {
    this.execute(false);
  }

  private execute(dryRun: boolean) {
    this.loading.set(true);
    this.report.set(null);
    this.error.set(null);
    const files = this.files();
    const obs = dryRun ? this.importService.dryRunFromMarkdown(files) : this.importService.applyFromMarkdown(files);
    obs.subscribe({
      next: (res) => {
        this.report.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error || err?.message || 'Erreur inconnue');
        this.loading.set(false);
      }
    });
  }
}
