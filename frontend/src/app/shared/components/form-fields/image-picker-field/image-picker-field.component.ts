import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ImageUploadComponent } from '../../image-upload/image-upload.component';

@Component({
  selector: 'app-image-picker-field',
  standalone: true,
  imports: [CommonModule, MatCardModule, ImageUploadComponent],
  templateUrl: './image-picker-field.component.html',
  styleUrls: ['./image-picker-field.component.scss']
})
export class ImagePickerFieldComponent {
  @Input() title = '';
  @Input() currentImageUrl: string | null | undefined = null;
  @Input() context: string | undefined;

  @Output() imageSelected = new EventEmitter<File | null>();

  onImageSelected(file: File | null): void {
    this.imageSelected.emit(file);
  }
}
