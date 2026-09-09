import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Lexique } from '../../../../core/models/lexique.model';

/**
 * Sélecteur multi pour le "Lexique du jour" d'une séance.
 * Même pattern que TagSelectMultiComponent, adapté au modèle Lexique (terme au lieu de label).
 */
@Component({
  selector: 'app-lexique-select-multi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './lexique-select-multi.component.html',
  styleUrls: ['./lexique-select-multi.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LexiqueSelectMultiComponent),
      multi: true
    }
  ]
})
export class LexiqueSelectMultiComponent implements ControlValueAccessor {
  @Input() label = 'Lexique du jour';
  @Input() termes: Lexique[] = [];

  disabled = false;
  ctrl = new FormControl<Lexique[]>([]);

  private onChange: (value: Lexique[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.ctrl.valueChanges.subscribe(v => {
      this.onChange(Array.isArray(v) ? v : []);
      this.onTouched();
    });
  }

  compareTermes(t1: Lexique, t2: Lexique): boolean {
    return t1 && t2 ? t1.id === t2.id : t1 === t2;
  }

  writeValue(value: Lexique[] | null): void {
    this.ctrl.setValue(Array.isArray(value) ? value : [], { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.ctrl.disable({ emitEvent: false });
    else this.ctrl.enable({ emitEvent: false });
  }
}
