import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Tag } from '../../../../core/models/tag.model';

@Component({
  selector: 'app-tag-select-single',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './tag-select-single.component.html',
  styleUrls: ['./tag-select-single.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagSelectSingleComponent),
      multi: true
    }
  ]
})
export class TagSelectSingleComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() allowNone = true;
  @Input() noneLabel = 'Aucun';
  @Input() tags: Tag[] = [];

  disabled = false;
  ctrl = new FormControl<Tag | null>(null);

  private onChange: (value: Tag | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.ctrl.valueChanges.subscribe(v => {
      this.onChange(v ?? null);
      this.onTouched();
    });
  }

  compareTags(t1: Tag | null, t2: Tag | null): boolean {
    if (t1 == null && t2 == null) return true;
    if (t1 == null || t2 == null) return false;
    return t1.id === t2.id;
  }

  writeValue(value: Tag | null): void {
    this.ctrl.setValue(value ?? null, { emitEvent: false });
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
