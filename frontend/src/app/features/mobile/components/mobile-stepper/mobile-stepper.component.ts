import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface StepConfig {
  label: string;
  completed: boolean;
  optional?: boolean;
}

@Component({
  selector: 'app-mobile-stepper',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="mobile-stepper-container">
      <mat-stepper 
        [linear]="true" 
        [selectedIndex]="currentStep"
        (selectionChange)="onStepChange($event)"
        orientation="horizontal"
        class="mobile-stepper"
      >
        <mat-step 
          *ngFor="let step of steps; let i = index"
          [completed]="step.completed"
          [optional]="step.optional"
          [label]="step.label"
        >
          <ng-content [select]="'[step-' + i + ']'"></ng-content>
        </mat-step>
      </mat-stepper>

      <div class="stepper-actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-button"
        >
          <mat-icon>close</mat-icon>
          Annuler
        </button>

        <div class="navigation-buttons">
          <button 
            mat-button 
            *ngIf="currentStep > 0"
            (click)="onPrevious()"
          >
            <mat-icon>arrow_back</mat-icon>
            Précédent
          </button>

          <button 
            mat-raised-button 
            color="primary"
            *ngIf="currentStep < steps.length - 1"
            (click)="onNext()"
            [disabled]="!canProceed"
          >
            Suivant
            <mat-icon>arrow_forward</mat-icon>
          </button>

          <button 
            mat-raised-button 
            color="accent"
            *ngIf="currentStep === steps.length - 1"
            (click)="onComplete()"
            [disabled]="!canComplete"
          >
            <mat-icon>check</mat-icon>
            Terminer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-stepper-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .mobile-stepper {
      flex: 1;
      overflow-y: auto;
    }

    ::ng-deep .mobile-stepper .mat-horizontal-stepper-header-container {
      padding: 8px 0;
      background: #f5f5f5;
    }

    ::ng-deep .mobile-stepper .mat-step-header {
      padding: 8px 4px;
    }

    ::ng-deep .mobile-stepper .mat-step-label {
      font-size: 12px;
    }

    .stepper-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      background: white;
      position: sticky;
      bottom: 0;
      z-index: 10;
    }

    .cancel-button {
      color: #666;
    }

    .navigation-buttons {
      display: flex;
      gap: 8px;
    }

    button mat-icon {
      margin: 0 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileStepperComponent {
  @Input() steps: StepConfig[] = [];
  @Input() currentStep = 0;
  @Input() canProceed = true;
  @Input() canComplete = true;

  @Output() stepChange = new EventEmitter<number>();
  @Output() complete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  onStepChange(event: any): void {
    this.stepChange.emit(event.selectedIndex);
  }

  onNext(): void {
    this.next.emit();
  }

  onPrevious(): void {
    this.previous.emit();
  }

  onComplete(): void {
    this.complete.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
