import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { SituationMatch } from '../../../core/models/situationmatch.model';

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
  situationMatch!: SituationMatch;

  constructor(
    public dialogRef: MatDialogRef<SituationMatchViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.situationMatch = (data?.customData?.situationMatch || data?.situationMatch) as SituationMatch;
  }

  close(): void {
    this.dialogRef.close();
  }
}
