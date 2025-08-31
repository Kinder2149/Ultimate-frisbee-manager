import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

export interface EchauffementViewData {
  echauffement: {
    nom?: string;
    description?: string;
    blocs?: Array<{ titre?: string; repetitions?: string | number; temps?: string; informations?: string }>;
    createdAt?: string | Date;
    tags?: Array<{ id?: string; label: string; color?: string }>; // optionnel si fourni par l'appelant
  };
}

@Component({
  selector: 'app-echauffement-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule],
  templateUrl: './echauffement-view.component.html',
  styleUrls: ['./echauffement-view.component.scss']
})
export class EchauffementViewComponent {
  // Normalisation pour supporter DialogService (data: { dialogConfig, customData })
  // et l'ancien format direct (data: { echauffement })
  echauffement: EchauffementViewData['echauffement'] = {};

  constructor(
    public dialogRef: MatDialogRef<EchauffementViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.echauffement = (data?.customData?.echauffement || data?.echauffement || {}) as EchauffementViewData['echauffement'];
  }

  close(): void {
    this.dialogRef.close();
  }

  // ===== Helpers durées =====
  private parseTempsToSeconds(input?: string | number | null): number {
    if (input === null || input === undefined) return 0;
    if (typeof input === 'number') return Math.max(0, Math.round(input));
    const s = String(input).trim().toLowerCase().replace(',', '.');
    // Formats: "mm", "mm min", "ss s", "mm:ss"
    const mmss = s.match(/^(\d{1,2}):(\d{2})$/);
    if (mmss) {
      const m = parseInt(mmss[1], 10) || 0;
      const sec = parseInt(mmss[2], 10) || 0;
      return m * 60 + sec;
    }
    const secMatch = s.match(/^(\d+(?:\.\d+)?)\s*(s|sec|secs|seconde|secondes)$/);
    if (secMatch) return Math.round(parseFloat(secMatch[1]));
    const minMatch = s.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)?$/);
    if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);
    const asNumber = Number(s);
    if (!isNaN(asNumber)) return Math.round(asNumber * 60);
    return 0;
  }

  private formatSeconds(totalSeconds: number): string {
    const sec = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) {
      const mm = m.toString().padStart(2, '0');
      return `${h}h${mm}`;
    }
    return `${m} min`;
  }

  getTotalSeconds(): number {
    const blocs = this.echauffement?.blocs || [];
    return blocs.reduce((acc, b) => acc + this.parseTempsToSeconds(b?.temps), 0);
    }

  getTotalLabel(): string {
    return this.formatSeconds(this.getTotalSeconds());
  }
}
