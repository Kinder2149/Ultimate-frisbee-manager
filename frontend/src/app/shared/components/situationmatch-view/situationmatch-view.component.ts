import { Component, Inject, Input, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { SituationMatch } from '../../../core/models/situationmatch.model';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { ImageViewerComponent, ImageViewerData } from '../image-viewer/image-viewer.component';

export interface SituationMatchViewData {
  situationMatch: SituationMatch;
}

@Component({
  selector: 'app-situationmatch-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule],
  templateUrl: './situationmatch-view.component.html',
  styleUrls: ['./situationmatch-view.component.scss']
})
export class SituationMatchViewComponent {
  @Input() situationMatch!: SituationMatch;
  @Input() isSummary: boolean = false;
  constructor(
    @Optional() public dialogRef: MatDialogRef<SituationMatchViewComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private apiUrl: ApiUrlService
  ) {
    if (data) {
      this.situationMatch = (data?.customData?.situationMatch || data?.situationMatch) as SituationMatch;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.getMediaUrl(path ?? undefined, 'situations-matchs');
  }

  openImageViewer(imageUrl: string): void {
    if (!imageUrl) return;

    const fullImageUrl = this.mediaUrl(imageUrl);
    if (!fullImageUrl) return;

    this.dialog.open<ImageViewerComponent, ImageViewerData>(ImageViewerComponent, {
      data: {
        imageUrl: fullImageUrl,
        altText: `Illustration de: ${this.situationMatch.nom}`
      },
      panelClass: 'image-viewer-dialog-container',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
    });
  }
}
