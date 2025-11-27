import { Component, Inject, Input, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { ImageViewerComponent, ImageViewerData } from '../image-viewer/image-viewer.component';
import { RichTextViewComponent } from '../rich-text-view/rich-text-view.component';

export interface EchauffementViewData {
  echauffement: {
    nom?: string;
    description?: string;
    imageUrl?: string;
    blocs?: Array<{ titre?: string; repetitions?: string | number; temps?: string; informations?: string; fonctionnement?: string; notes?: string }>;
    createdAt?: string | Date;
    tags?: Array<{ id?: string; label: string; color?: string }>; // optionnel si fourni par l'appelant
  };
}

@Component({
  selector: 'app-echauffement-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule, RichTextViewComponent],
  templateUrl: './echauffement-view.component.html',
  styleUrls: ['./echauffement-view.component.scss']
})
export class EchauffementViewComponent {
  @Input() echauffement: EchauffementViewData['echauffement'] = {};
  @Input() isSummary: boolean = false;
  // Normalisation pour supporter DialogService (data: { dialogConfig, customData })
  // et l'ancien format direct (data: { echauffement })
  constructor(
    @Optional() public dialogRef: MatDialogRef<EchauffementViewComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private apiUrl: ApiUrlService,
    private dialog: MatDialog
  ) {
    // Si les données viennent d'un dialogue, on les utilise
    if (data) {
      this.echauffement = (data?.customData?.echauffement || data?.echauffement || {}) as EchauffementViewData['echauffement'];
    }
    // Sinon, on s'attend à ce que les données soient passées via @Input()
  
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

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.getMediaUrl(path ?? undefined, 'echauffements');
  }

  openImageViewer(imageUrl: string): void {
    if (!imageUrl) return;

    const fullImageUrl = this.mediaUrl(imageUrl);
    if (!fullImageUrl) return;

    this.dialog.open<ImageViewerComponent, ImageViewerData>(ImageViewerComponent, {
      data: {
        imageUrl: fullImageUrl,
        altText: `Illustration de l'échauffement: ${this.echauffement.nom}`
      },
      panelClass: 'image-viewer-dialog-container', // Applique le style sans padding
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
    });
  }
}
