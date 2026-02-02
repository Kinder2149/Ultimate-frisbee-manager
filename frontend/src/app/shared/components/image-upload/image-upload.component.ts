import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiUrlService } from '../../../core/services/api-url.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Input() currentImageUrl: string | null | undefined = null;
  @Input() context: string | undefined;
  @Output() imageSelected = new EventEmitter<File | null>();

  previewUrl: string | ArrayBuffer | null = null;

  private lastResolvedKey: string | null = null;

  constructor(private apiUrlService: ApiUrlService) {}

  ngOnChanges(): void {
    if (!this.currentImageUrl) {
      this.previewUrl = null;
      this.lastResolvedKey = null;
      return;
    }

    // Recalculer l'URL dès que currentImageUrl ou context change.
    // Important: le contexte peut arriver après coup (ex: formulaire/patchValue),
    // et previewUrl peut déjà être non-null.
    const key = `${this.context ?? ''}::${this.currentImageUrl}`;
    if (this.lastResolvedKey !== key) {
      this.previewUrl = this.apiUrlService.getMediaUrl(this.currentImageUrl, this.context);
      this.lastResolvedKey = key;
    }
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.imageSelected.emit(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      // Si aucun fichier n'est sélectionné, ne rien faire ou émettre null
      this.imageSelected.emit(null);
    }
  }

  removeImage(): void {
    this.previewUrl = null;
    this.imageSelected.emit(null);
  }
}
