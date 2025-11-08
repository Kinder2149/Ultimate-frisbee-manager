import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../core/material/material.module';
import { DataTransferService } from '../../../../core/services/data-transfer.service';
import { ExerciceService } from '../../../../core/services/exercice.service';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { EchauffementService } from '../../../../core/services/echauffement.service';
import { SituationMatchService } from '../../../../core/services/situationmatch.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MissingFieldsDialogComponent, MissingFieldItem } from './missing-fields-dialog.component';

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
  <div class="container">
    <mat-card>
      <mat-card-title>Import / Export</mat-card-title>
      <mat-card-subtitle>Gérez vos échanges de données (respecte le thème et la structure UI).</mat-card-subtitle>

      <mat-tab-group>
        <!-- EXPORT -->
        <mat-tab label="Exporter">
          <div class="section">
            <p>Exporter un élément (placeholder jusqu'à activation API export).</p>
            <div class="row">
              <mat-form-field appearance="fill">
                <mat-label>Type</mat-label>
                <mat-select [(ngModel)]="exportType" (selectionChange)="onExportTypeChange()">
                  <mat-option *ngFor="let t of exportTypes" [value]="t">{{ t }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Élément</mat-label>
                <mat-select [(ngModel)]="exportId" [disabled]="!exportType || getExportOptions().length===0">
                  <mat-option *ngFor="let it of getExportOptions(); trackBy: trackById" [value]="it.id">
                    {{ getItemLabel(it) }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="onExportOne()" [disabled]="!exportType || !exportId || loading()">Exporter</button>
            </div>
            <div class="status" *ngIf="loading()">
              <mat-progress-spinner mode="indeterminate" diameter="28"></mat-progress-spinner>
              <span>Traitement…</span>
            </div>
            <div class="report" *ngIf="exportInfo()">
              <mat-card-subtitle>Résultat</mat-card-subtitle>
              <pre>{{ exportInfo() }}</pre>
            </div>
          </div>
        </mat-tab>

        <!-- IMPORT -->
        <mat-tab label="Importer">
          <div class="section">
            <h3>Depuis Markdown (.md)</h3>
            <div class="row">
              <input type="file" multiple accept=".md" (change)="onMdFilesSelected($event)" />
              <button mat-raised-button color="primary" (click)="onMdDryRun()" [disabled]="mdFiles().length===0 || loading()">Dry-run</button>
              <button mat-raised-button color="accent" (click)="onMdApply()" [disabled]="mdFiles().length===0 || loading()">Appliquer</button>
            </div>

            <h3>Depuis JSON structuré</h3>
            <div class="row column">
              <div class="row">
                <mat-form-field appearance="fill">
                  <mat-label>Version (optionnel)</mat-label>
                  <input matInput [(ngModel)]="version" placeholder="ex: 1.0" />
                </mat-form-field>
              </div>
              <div class="row">
                <input type="file" accept="application/json,.json" (change)="onJsonFileSelected($event)" />
                <span *ngIf="jsonFileName">Fichier: <b>{{ jsonFileName }}</b></span>
              </div>
              <textarea rows="10" placeholder="Collez ici un JSON valide { exercices: [...] }" [(ngModel)]="jsonInput"></textarea>
              <div class="row">
                <button mat-raised-button color="primary" (click)="onJsonDryRun()" [disabled]="!jsonInput || loading()">Dry-run JSON</button>
                <button mat-raised-button color="accent" (click)="onJsonApply()" [disabled]="!jsonInput || loading()">Appliquer JSON</button>
              </div>

              <div class="section" *ngIf="hasAnalyses()">
                <mat-card-subtitle>Aperçu des éléments détectés</mat-card-subtitle>
                <mat-accordion multi>
                  <mat-expansion-panel *ngIf="analyses.exercice().length">
                    <mat-expansion-panel-header>
                      <mat-panel-title>Exercices ({{ analyses.exercice().length }})</mat-panel-title>
                    </mat-expansion-panel-header>
                    <mat-list class="scroll">
                      <mat-list-item *ngFor="let a of analyses.exercice(); let i = index; trackBy: trackByIndex">
                        <div class="item">
                          <div class="meta">
                            <div class="title">{{ getElementName('exercice', i) }}</div>
                            <div class="subtitle">Manquants: {{ namesOfMissing(a) }}</div>
                          </div>
                          <div class="actions">
                            <button mat-stroked-button (click)="openCorrection('exercice', i)">Corriger…</button>
                          </div>
                        </div>
                      </mat-list-item>
                    </mat-list>
                  </mat-expansion-panel>

                  <mat-expansion-panel *ngIf="analyses.entrainement().length">
                    <mat-expansion-panel-header>
                      <mat-panel-title>Entraînements ({{ analyses.entrainement().length }})</mat-panel-title>
                    </mat-expansion-panel-header>
                    <mat-list class="scroll">
                      <mat-list-item *ngFor="let a of analyses.entrainement(); let i = index; trackBy: trackByIndex">
                        <div class="item">
                          <div class="meta">
                            <div class="title">{{ getElementName('entrainement', i) }}</div>
                            <div class="subtitle">Manquants: {{ namesOfMissing(a) }}</div>
                          </div>
                          <div class="actions">
                            <button mat-stroked-button (click)="openCorrection('entrainement', i)">Corriger…</button>
                          </div>
                        </div>
                      </mat-list-item>
                    </mat-list>
                  </mat-expansion-panel>

                  <mat-expansion-panel *ngIf="analyses.echauffement().length">
                    <mat-expansion-panel-header>
                      <mat-panel-title>Échauffements ({{ analyses.echauffement().length }})</mat-panel-title>
                    </mat-expansion-panel-header>
                    <mat-list class="scroll">
                      <mat-list-item *ngFor="let a of analyses.echauffement(); let i = index; trackBy: trackByIndex">
                        <div class="item">
                          <div class="meta">
                            <div class="title">{{ getElementName('echauffement', i) }}</div>
                            <div class="subtitle">Manquants: {{ namesOfMissing(a) }}</div>
                          </div>
                          <div class="actions">
                            <button mat-stroked-button (click)="openCorrection('echauffement', i)">Corriger…</button>
                          </div>
                        </div>
                      </mat-list-item>
                    </mat-list>
                  </mat-expansion-panel>

                  <mat-expansion-panel *ngIf="analyses.situation().length">
                    <mat-expansion-panel-header>
                      <mat-panel-title>Situations ({{ analyses.situation().length }})</mat-panel-title>
                    </mat-expansion-panel-header>
                    <mat-list class="scroll">
                      <mat-list-item *ngFor="let a of analyses.situation(); let i = index; trackBy: trackByIndex">
                        <div class="item">
                          <div class="meta">
                            <div class="title">{{ getElementName('situation', i) }}</div>
                            <div class="subtitle">Manquants: {{ namesOfMissing(a) }}</div>
                          </div>
                          <div class="actions">
                            <button mat-stroked-button (click)="openCorrection('situation', i)">Corriger…</button>
                          </div>
                        </div>
                      </mat-list-item>
                    </mat-list>
                  </mat-expansion-panel>
                </mat-accordion>
              </div>
            </div>

            <div class="status" *ngIf="loading()">
              <mat-progress-spinner mode="indeterminate" diameter="28"></mat-progress-spinner>
              <span>Traitement…</span>
            </div>
            <div class="error" *ngIf="error()">
              <mat-icon color="warn">error</mat-icon>
              <span>{{ error() }}</span>
            </div>
            <div class="report" *ngIf="report()">
              <mat-card-subtitle>Rapport</mat-card-subtitle>
              <pre>{{ report() | json }}</pre>
            </div>
          </div>
        </mat-tab>

        <!-- LISTES EXPORTABLES -->
        <mat-tab label="Exporter (par liste)">
          <div class="section">
            <p>Sélectionnez des éléments à exporter sans saisir d'identifiant.</p>

            <mat-accordion multi>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Exercices ({{ exercices().length }})</mat-panel-title>
                </mat-expansion-panel-header>
                <mat-list class="scroll">
                  <mat-list-item *ngFor="let it of exercices(); trackBy: trackById">
                    <div class="item">
                      <div class="meta">
                        <div class="title">{{ it.nom || it.name }}</div>
                        <div class="subtitle">Type: exercice — Tags: {{ (it.tags || []).join(', ') }}</div>
                      </div>
                      <button mat-stroked-button color="primary" (click)="exportOne('exercice', it.id)">Exporter</button>
                    </div>
                  </mat-list-item>
                </mat-list>
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Entraînements ({{ entrainements().length }})</mat-panel-title>
                </mat-expansion-panel-header>
                <mat-list class="scroll">
                  <mat-list-item *ngFor="let it of entrainements(); trackBy: trackById">
                    <div class="item">
                      <div class="meta">
                        <div class="title">{{ it.nom || it.name }}</div>
                        <div class="subtitle">Type: entrainement — Tags: {{ (it.tags || []).join(', ') }}</div>
                      </div>
                      <button mat-stroked-button color="primary" (click)="exportOne('entrainement', it.id)">Exporter</button>
                    </div>
                  </mat-list-item>
                </mat-list>
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Échauffements ({{ echauffements().length }})</mat-panel-title>
                </mat-expansion-panel-header>
                <mat-list class="scroll">
                  <mat-list-item *ngFor="let it of echauffements(); trackBy: trackById">
                    <div class="item">
                      <div class="meta">
                        <div class="title">{{ it.nom || it.name }}</div>
                        <div class="subtitle">Type: echauffement — Tags: {{ (it.tags || []).join(', ') }}</div>
                      </div>
                      <button mat-stroked-button color="primary" (click)="exportOne('echauffement', it.id)">Exporter</button>
                    </div>
                  </mat-list-item>
                </mat-list>
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Situations ({{ situations().length }})</mat-panel-title>
                </mat-expansion-panel-header>
                <mat-list class="scroll">
                  <mat-list-item *ngFor="let it of situations(); trackBy: trackById">
                    <div class="item">
                      <div class="meta">
                        <div class="title">{{ it.nom || it.name }}</div>
                        <div class="subtitle">Type: situation — Tags: {{ (it.tags || []).join(', ') }}</div>
                      </div>
                      <button mat-stroked-button color="primary" (click)="exportOne('situation', it.id)">Exporter</button>
                    </div>
                  </mat-list-item>
                </mat-list>
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Matchs (à venir)</mat-panel-title>
                </mat-expansion-panel-header>
                <div class="placeholder">Intégration du service Matchs à venir.</div>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
        </mat-tab>

        <!-- LOGS / GESTION -->
        <mat-tab label="Journal (à venir)">
          <div class="section">
            <p>Placeholder pour un futur journal des transferts (V2: backend, V1: local).</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-card>
  </div>
  `,
  styles: [`
    .container { padding: 16px; max-width: 960px; margin: 0 auto; }
    mat-card { padding-bottom: 8px; }
    .section { margin-top: 12px; }
    .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .row.column { flex-direction: column; align-items: stretch; }
    textarea { width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .status { display: flex; gap: 8px; align-items: center; margin: 8px 0; }
    .error { display: flex; gap: 6px; align-items: center; color: #b71c1c; margin: 8px 0; }
    .report pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; overflow: auto; max-height: 420px; }
  `]
})
export class ImportExportComponent  {
  exportTypes: Array<'exercice'|'entrainement'|'echauffement'|'situation'|'match'> = ['exercice','entrainement','echauffement','situation','match'];
  exportType: 'exercice'|'entrainement'|'echauffement'|'situation'|'match' | '' = '';
  exportId = '';

  mdFiles = signal<{ name?: string; content: string }[]>([]);
  jsonInput = '';
  version = '';

  loading = signal(false);
  error = signal<string | null>(null);
  report = signal<any | null>(null);
  exportInfo = signal<string | null>(null);

  // listes
  exercices = signal<any[]>([]);
  entrainements = signal<any[]>([]);
  echauffements = signal<any[]>([]);
  situations = signal<any[]>([]);

  // JSON file preview state
  jsonFileName: string | null = null;
  parsedPayload: any = null;
  analyses = {
    exercice: signal<any[]>([]),
    entrainement: signal<any[]>([]),
    echauffement: signal<any[]>([]),
    situation: signal<any[]>([])
  };

  constructor(
    private data: DataTransferService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private exoSrv: ExerciceService,
    private entSrv: EntrainementService,
    private echSrv: EchauffementService,
    private sitSrv: SituationMatchService
  ) {}

  ngOnInit() {
    this.loadLists();
  }

  private loadLists() {
    this.exoSrv.getExercices().subscribe({ next: (l) => this.exercices.set(l || []) });
    this.entSrv.getEntrainements().subscribe({ next: (l) => this.entrainements.set(l || []) });
    this.echSrv.getEchauffements().subscribe({ next: (l) => this.echauffements.set(l || []) });
    this.sitSrv.getSituationsMatchs().subscribe({ next: (l) => this.situations.set(l || []) });
  }

  onExportTypeChange() {
    // Réinitialiser l'élément sélectionné quand on change de type
    this.exportId = '';
  }

  getExportOptions(): any[] {
    switch (this.exportType) {
      case 'exercice':
        return this.exercices();
      case 'entrainement':
        return this.entrainements();
      case 'echauffement':
        return this.echauffements();
      case 'situation':
        return this.situations();
      default:
        return [];
    }
  }

  getItemLabel(it: any): string {
    if (!it) return '';
    if (this.exportType === 'entrainement') return it.titre || it.nom || it.name || it.id;
    if (this.exportType === 'echauffement') return it.nom || it.name || it.id;
    if (this.exportType === 'situation') return it.nom || it.name || it.type || it.id;
    return it.nom || it.name || it.id; // exercice
  }

  onMdFilesSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.readFiles(files).then(payloads => {
      this.mdFiles.set(payloads);
      this.report.set(null);
      this.error.set(null);
    });
  }

  exportOne(type: 'exercice'|'entrainement'|'echauffement'|'situation'|'match', id: string) {
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    this.exportInfo.set(null);
    this.data.exportElement(type as any, id).subscribe({
      next: (filename) => {
        this.exportInfo.set(`Export demandé → ${filename}`);
        this.loading.set(false);
        this.snack.open('Export réussi', 'OK', { duration: 2500 });
      },
      error: (err) => {
        const msg = err?.message || 'Export non disponible';
        this.error.set(msg);
        this.loading.set(false);
        this.snack.open(msg, 'Fermer', { duration: 3500 });
      }
    });
  }

  trackById = (_: number, it: any) => it?.id || _;

  private async readFiles(fileList: File[]): Promise<{ name?: string; content: string }[]> {
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

  onMdDryRun() {
    this.exec(() => this.data.dryRunMarkdown(this.mdFiles()));
  }

  onMdApply() {
    this.exec(() => this.data.applyMarkdown(this.mdFiles()));
  }

  onJsonDryRun() {
    this.processJson(true);
  }

  onJsonApply() {
    this.processJson(false);
  }

  onExportOne() {
    this.loading.set(true);
    this.error.set(null);
    this.exportInfo.set(null);
    this.data.exportElement(this.exportType as any, this.exportId).subscribe({
      next: (filename) => {
        this.exportInfo.set(`Export demandé → ${filename}`);
        this.loading.set(false);
        this.snack.open('Export réussi', 'OK', { duration: 2500 });
      },
      error: (err) => {
        this.error.set(err?.message || 'Export non disponible');
        this.loading.set(false);
      }
    });
  }

  private exec(factory: () => any) {
    this.loading.set(true);
    this.report.set(null);
    this.error.set(null);
    const obs = factory();
    obs.subscribe({
      next: (res: any) => { 
        this.report.set(res); 
        // Après une opération (dry-run ou apply), on recharge les listes
        // pour refléter l'état courant en UI (surtout après apply).
        this.loadLists();
        this.loading.set(false); 
        this.snack.open('Opération réalisée', 'OK', { duration: 2500 }); 
      },
      error: (err: any) => { const msg = err?.error?.error || err?.message || 'Erreur'; this.error.set(msg); this.loading.set(false); this.snack.open(msg, 'Fermer', { duration: 4000 }); }
    });
  }

  private safeParseJson(text: string): any {
    try { return JSON.parse(text); } catch { throw new Error('JSON invalide'); }
  }

  private normalizeUfmToApi(raw: any): any | null {
    if (!raw) return null;
    const fromUfm = (obj: any) => {
      if (obj && typeof obj === 'object' && obj.version && obj.type && obj.data) {
        const t = String(obj.type).toLowerCase();
        if (t === 'exercice') return { exercices: [obj.data] };
        if (t === 'entrainement') return { entrainements: [obj.data] };
        if (t === 'echauffement') return { echauffements: [obj.data] };
        if (t === 'situation') return { situations: [obj.data] };
      }
      return null;
    };
    if (Array.isArray(raw)) {
      const exercices: any[] = [];
      const entrainements: any[] = [];
      const echauffements: any[] = [];
      const situations: any[] = [];
      raw.forEach((o) => {
        const mapped = fromUfm(o);
        if (mapped?.exercices?.length) exercices.push(...mapped.exercices);
        if (mapped?.entrainements?.length) entrainements.push(...mapped.entrainements);
        if (mapped?.echauffements?.length) echauffements.push(...mapped.echauffements);
        if (mapped?.situations?.length) situations.push(...mapped.situations);
      });
      const out: any = {};
      if (exercices.length) out.exercices = exercices;
      if (entrainements.length) out.entrainements = entrainements;
      if (echauffements.length) out.echauffements = echauffements;
      if (situations.length) out.situations = situations;
      return Object.keys(out).length ? out : null;
    }
    return fromUfm(raw);
  }

  // Flux tolérant: ouvre un dialogue si des champs requis manquent et applique la décision (compléter/ignorer)
  private processJson(dryRun: boolean) {
    const raw = this.safeParseJson(this.jsonInput);
    const normalized = this.normalizeUfmToApi(raw);
    const payload: any = normalized ?? (typeof raw?.exercices === 'object' ? { ...raw } : { exercices: [] });
    if (!normalized && Array.isArray(raw?.exercices)) payload.exercices = raw.exercices;
    if (this.version) payload.version = this.version;

    const missing: MissingFieldItem[] = [];
    const exos = Array.isArray(payload.exercices) ? payload.exercices : [];
    exos.forEach((exo: any, idx: number) => {
      const nom = (exo?.nom ?? '').toString().trim();
      const description = (exo?.description ?? '').toString().trim();
      const fields: MissingFieldItem['fields'] = [];
      if (!nom) fields.push({ name: 'nom', value: '', required: true });
      if (!description) fields.push({ name: 'description', value: '', required: true });
      if (fields.length) missing.push({ index: idx, fields });
    });

    const run = () => this.exec(() => dryRun ? this.data.dryRunPayload(payload) : this.data.applyPayload(payload));

    if (!missing.length) {
      // Met à jour l'aperçu à partir du payload courant
      this.buildAnalysesFromPayload(payload);
      run();
      return;
    }

    const ref = this.dialog.open(MissingFieldsDialogComponent, { data: { title: 'Compléter les champs requis', items: missing } });
    ref.afterClosed().subscribe((result: MissingFieldItem[] | 'ignore' | undefined) => {
      if (!result) {
        this.snack.open('Import annulé.', 'OK', { duration: 2500 });
        return;
      }
      if (result === 'ignore') {
        // Laisser vide: on met des chaînes vides si requis
        missing.forEach(it => {
          it.fields.forEach(f => {
            if (f.required) {
              const exo = payload.exercices[it.index];
              exo[f.name] = '';
            }
          });
        });
        run();
        return;
      }
      // Appliquer les complétions fournies
      result.forEach(it => {
        it.fields.forEach(f => {
          const exo = payload.exercices[it.index];
          if (exo) exo[f.name] = f.value ?? '';
        });
      });
      this.buildAnalysesFromPayload(payload);
      run();
    });
  }

  onJsonFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.jsonFileName = file.name;
    this.readAsText(file).then(text => {
      this.jsonInput = text;
      try {
        const raw = this.safeParseJson(text);
        const normalized = this.normalizeUfmToApi(raw);
        const payload = normalized ?? raw;
        this.buildAnalysesFromPayload(payload);
      } catch {}
    });
  }

  private buildAnalysesFromPayload(payload: any) {
    this.parsedPayload = payload || {};
    const types: Array<'exercice'|'entrainement'|'echauffement'|'situation'> = ['exercice','entrainement','echauffement','situation'];
    // Reset
    this.analyses.exercice.set([]);
    this.analyses.entrainement.set([]);
    this.analyses.echauffement.set([]);
    this.analyses.situation.set([]);
    types.forEach(t => {
      const key = t + (t === 'situation' ? 's' : 's') + '';
      // Déterminer la clé réelle attendue dans le payload
      const mapKeys: any = {
        exercice: 'exercices',
        entrainement: 'entrainements',
        echauffement: 'echauffements',
        situation: 'situations'
      };
      const arr = Array.isArray(payload?.[mapKeys[t]]) ? payload[mapKeys[t]] : [];
      const analyses = [] as any[];
      arr.forEach((el: any) => this.data.importElement(t, el).subscribe(res => analyses.push(res)));
      (this.analyses as any)[t].set(analyses);
    });
  }

  getElementName(type: 'exercice'|'entrainement'|'echauffement'|'situation', index: number): string {
    const mapKeys: any = { exercice: 'exercices', entrainement: 'entrainements', echauffement: 'echauffements', situation: 'situations' };
    const arr = Array.isArray(this.parsedPayload?.[mapKeys[type]]) ? this.parsedPayload[mapKeys[type]] : [];
    const el = arr[index] || {};
    return el.nom || el.name || `#${index+1}`;
  }

  openCorrection(type: 'exercice'|'entrainement'|'echauffement'|'situation', index: number) {
    const analysisArr = (this.analyses as any)[type]();
    const analysis = analysisArr[index];
    if (!analysis) return;
    const items = [{ index: 0, fields: analysis.fields.filter((f: any) => f.required) }];
    const ref = this.dialog.open(MissingFieldsDialogComponent, { data: { title: 'Compléter les champs requis', items } });
    ref.afterClosed().subscribe((result: MissingFieldItem[] | 'ignore' | undefined) => {
      if (!result) return;
      const mapKeys: any = { exercice: 'exercices', entrainement: 'entrainements', echauffement: 'echauffements', situation: 'situations' };
      const arr = Array.isArray(this.parsedPayload?.[mapKeys[type]]) ? this.parsedPayload[mapKeys[type]] : [];
      const el = arr[index];
      if (!el) return;
      if (result === 'ignore') {
        analysis.fields.filter((f: any)=>f.required).forEach((f: any) => el[f.name] = '');
      } else {
        result[0]?.fields?.forEach(f => el[f.name] = f.value ?? '');
      }
      // Re-analyse de l'élément
      this.data.importElement(type, el).subscribe(res => {
        analysisArr[index] = res;
        (this.analyses as any)[type].set([...analysisArr]);
      });
      this.snack.open('Valeurs appliquées pour l’aperçu', 'OK', { duration: 2500 });
    });
  }

  trackByIndex = (i: number) => i;

  hasAnalyses(): boolean {
    return (
      (this.analyses.exercice().length > 0) ||
      (this.analyses.entrainement().length > 0) ||
      (this.analyses.echauffement().length > 0) ||
      (this.analyses.situation().length > 0)
    );
  }

  namesOfMissing(a: any): string {
    const list = Array.isArray(a?.missing) ? a.missing.map((m: any) => m?.name).filter((n: any) => !!n) : [];
    return list.length ? list.join(', ') : 'aucun';
  }
}
