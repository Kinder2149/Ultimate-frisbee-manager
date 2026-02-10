import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface MobileConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor: 'warn' | 'primary';
}

@Component({
  selector: 'app-mobile-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './mobile-confirm-dialog.component.html',
  styleUrls: ['./mobile-confirm-dialog.component.scss']
})
export class MobileConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MobileConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MobileConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
