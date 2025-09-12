import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Input() entityType!: 'echauffements' | 'situations-matchs' | 'entrainements';
  @Input() currentImageUrl: string | null | undefined = null;
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();

  uploading = false;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private uploadService: UploadService, private snackBar: MatSnackBar) {}

  ngOnChanges(): void {
    if (this.currentImageUrl) {
      this.previewUrl = this.currentImageUrl;
    }
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.uploadFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadFile(file: File): void {
    this.uploading = true;
    this.uploadService.uploadImage(this.entityType, file).subscribe({
      next: (response) => {
        this.uploading = false;
        this.currentImageUrl = response.imageUrl;
        this.imageUploaded.emit(response.imageUrl);
        this.snackBar.open('Image téléchargée avec succès', 'Fermer', { duration: 3000 });
      },
      error: (error) => {
        this.uploading = false;
        console.error('Erreur lors de l\'upload:', error);
        this.snackBar.open('Erreur lors de l\'upload de l\'image', 'Fermer', { duration: 3000 });
        this.previewUrl = this.currentImageUrl || null; // Revert preview
      }
    });
  }

  removeImage(): void {
    this.currentImageUrl = null;
    this.previewUrl = null;
    this.imageRemoved.emit();
  }
}
