import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-mobile-image-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="mobile-image-picker">
      <div class="preview-container" *ngIf="imagePreview">
        <img [src]="imagePreview" alt="Aperçu" class="image-preview">
        <button 
          mat-icon-button 
          class="remove-button"
          (click)="onRemoveImage()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="upload-actions" *ngIf="!imagePreview && !uploading">
        <input 
          #fileInput 
          type="file" 
          accept="image/*"
          (change)="onFileSelected($event)"
          style="display: none"
        >
        
        <button 
          mat-raised-button 
          color="primary"
          (click)="fileInput.click()"
          class="upload-button"
        >
          <mat-icon>add_photo_alternate</mat-icon>
          Choisir une image
        </button>

        <p class="upload-hint">
          Format accepté : JPG, PNG, GIF<br>
          Taille max : 2 MB
        </p>
      </div>

      <div class="uploading-state" *ngIf="uploading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Traitement de l'image...</p>
      </div>
    </div>
  `,
  styles: [`
    .mobile-image-picker {
      padding: 16px;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .preview-container {
      position: relative;
      width: 100%;
      max-width: 400px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .image-preview {
      width: 100%;
      height: auto;
      display: block;
    }

    .remove-button {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.6);
      color: white;
    }

    .upload-actions {
      text-align: center;
    }

    .upload-button {
      margin-bottom: 16px;
    }

    .upload-button mat-icon {
      margin-right: 8px;
    }

    .upload-hint {
      font-size: 12px;
      color: #666;
      margin: 0;
      line-height: 1.6;
    }

    .uploading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .uploading-state p {
      margin: 0;
      color: #666;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileImagePickerComponent {
  @Input() imagePreview: string | null = null;
  @Input() uploading = false;
  
  @Output() imageSelected = new EventEmitter<File>();
  @Output() imageRemoved = new EventEmitter<void>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image est trop volumineuse. Taille maximum : 2 MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Le fichier sélectionné n\'est pas une image valide');
        return;
      }

      this.imageSelected.emit(file);
    }
  }

  onRemoveImage(): void {
    this.imageRemoved.emit();
  }
}
