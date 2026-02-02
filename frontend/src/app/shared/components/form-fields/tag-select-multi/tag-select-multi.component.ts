import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Tag } from '../../../../core/models/tag.model';

@Component({
  selector: 'app-tag-select-multi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './tag-select-multi.component.html',
  styleUrls: ['./tag-select-multi.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagSelectMultiComponent),
      multi: true
    }
  ]
})
export class TagSelectMultiComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() tags: Tag[] = [];

  disabled = false;
  ctrl = new FormControl<Tag[]>([]);

  private onChange: (value: Tag[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.ctrl.valueChanges.subscribe(v => {
      this.onChange(Array.isArray(v) ? v : []);
      this.onTouched();
    });
  }

  compareTags(t1: Tag, t2: Tag): boolean {
    return t1 && t2 ? t1.id === t2.id : t1 === t2;
  }

  writeValue(value: Tag[] | null): void {
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
