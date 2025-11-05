import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EntrainementService } from './entrainement.service';
import { ExerciceService } from './exercice.service';
import { EXPORT_DIR, FILE_EXT_UFM, DEFAULT_SCHEMA_VERSION, IMPORT_LOG_DIR, UFM_ALLOWED_TYPES, UfmAllowedType } from '@ufm/shared/constants/export-import';

export interface Conflict {
  field: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  conflicts: Conflict[];
  insertedIds: Array<{ type: string; id: string | number }>;
}

@Injectable({ providedIn: 'root' })
export class ExportImportService {
  constructor(
    private entrainementService: EntrainementService,
    private exerciceService: ExerciceService,
  ) {}

  async exportElement(type: string, id: string): Promise<string> {
    const t = this.normalizeType(type);
    const data = await this.fetchByTypeAndId(t, id);
    const payload = this.serialize(t, data);
    const json = JSON.stringify(payload, null, 2);
    const filename = this.buildFileName(t, String(id));
    await this.triggerDownload(json, filename);
    return filename;
  }

  async exportMultiple(elements: Array<{ type: string; id: string }>): Promise<string[]> {
    const results: string[] = [];
    for (const el of elements) {
      const name = await this.exportElement(el.type, el.id);
      results.push(name);
    }
    return results;
  }

  async importFromFile(file: File, interactive: boolean = true): Promise<ImportResult> {
    const text = await file.text();
    return this.importFromJson(text, interactive);
  }

  async importFromJson(jsonString: string, interactive: boolean = false): Promise<ImportResult> {
    const conflicts: Conflict[] = [];
    try {
      const parsed = JSON.parse(jsonString);
      const meta = parsed?.meta;
      const data = parsed?.data;

      if (!meta || !data) {
        return { success: false, message: 'Format invalide: meta/data manquants', conflicts: [{ field: 'root', message: 'meta/data requis' }], insertedIds: [] };
      }

      const type = this.normalizeType(meta.type);
      if (!UFM_ALLOWED_TYPES.includes(type)) {
        return { success: false, message: `Type non supporté: ${meta.type}`, conflicts: [{ field: 'meta.type', message: 'Type inconnu' }], insertedIds: [] };
      }

      if (!this.isSchemaSupported(meta.schema_version)) {
        return { success: false, message: `Version de schéma non supportée: ${meta.schema_version} (> ${DEFAULT_SCHEMA_VERSION})`, conflicts: [{ field: 'meta.schema_version', message: 'Version non supportée' }], insertedIds: [] };
      }

      const mapped = this.mapForImport(type, data, conflicts);
      const insertedId = await this.createViaManager(type, mapped);

      const result: ImportResult = {
        success: true,
        message: 'Import réussi',
        conflicts,
        insertedIds: [{ type, id: insertedId }]
      };

      if (conflicts.length) {
        await this.writeImportLog('warn', result, jsonString);
      }
      return result;
    } catch (e: any) {
      const res: ImportResult = { success: false, message: e?.message || 'Erreur import', conflicts: [{ field: 'exception', message: String(e) }], insertedIds: [] };
      await this.writeImportLog('error', res, jsonString);
      return res;
    }
  }

  private normalizeType(type: string): UfmAllowedType {
    const t = (type || '').toLowerCase();
    if (t === 'entrainement' || t === 'exercice' || t === 'echauffement' || t === 'situation' || t === 'match') return t as UfmAllowedType;
    throw new Error(`Type inconnu: ${type}`);
  }

  private async fetchByTypeAndId(type: UfmAllowedType, id: string) {
    switch (type) {
      case 'entrainement':
        return await firstValueFrom(this.entrainementService.getEntrainementById(id));
      case 'exercice':
        return await firstValueFrom(this.exerciceService.getExerciceById(id));
      default:
        throw new Error(`Export non implémenté pour le type: ${type}`);
    }
  }

  private serialize(type: UfmAllowedType, entity: any) {
    const data = typeof entity?.toJson === 'function' ? entity.toJson() : { ...entity };
    return {
      meta: {
        type,
        schema_version: DEFAULT_SCHEMA_VERSION,
        exported_at: new Date().toISOString(),
        source: 'frontend_local',
        origin_path: `${type}/${entity?.id ?? ''}`
      },
      data
    };
  }

  private buildFileName(type: string, id: string): string {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    return `${EXPORT_DIR}${type}_${id}_${ts}${FILE_EXT_UFM}`;
  }

  private async triggerDownload(content: string, filename: string): Promise<void> {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename.replace(/[\\/:*?"<>|]/g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private isSchemaSupported(version: string): boolean {
    const [majS, minS] = String(DEFAULT_SCHEMA_VERSION).split('.').map(Number);
    const [majI, minI] = String(version || '0.0').split('.').map(Number);
    if (Number.isNaN(majI) || Number.isNaN(minI)) return false;
    if (majI > majS) return false;
    if (majI === majS && minI > minS) return false;
    return true;
  }

  private mapForImport(type: UfmAllowedType, data: any, conflicts: Conflict[]): any {
    if (!data) {
      conflicts.push({ field: 'data', message: 'Payload vide' });
      return {};
    }
    return { ...data };
  }

  private async createViaManager(type: UfmAllowedType, data: any): Promise<string | number> {
    switch (type) {
      case 'entrainement': {
        const created = await firstValueFrom(this.entrainementService.createFromImport(data));
        return created.id as string | number;
      }
      case 'exercice': {
        const created = await firstValueFrom(this.exerciceService.createFromImport(data));
        return created.id as string | number;
      }
      default:
        throw new Error(`Import non implémenté pour le type: ${type}`);
    }
  }

  private async writeImportLog(level: 'warn' | 'error', result: ImportResult, raw: string): Promise<void> {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${IMPORT_LOG_DIR}import_${level}_${ts}.log.txt`;
    const content = [
      `time=${new Date().toISOString()}`,
      `level=${level}`,
      `success=${result.success}`,
      `message=${result.message}`,
      `conflicts=${JSON.stringify(result.conflicts)}`,
      `insertedIds=${JSON.stringify(result.insertedIds)}`,
      `payload=${raw}`
    ].join('\n');
    await this.triggerDownload(content, filename);
  }
}
