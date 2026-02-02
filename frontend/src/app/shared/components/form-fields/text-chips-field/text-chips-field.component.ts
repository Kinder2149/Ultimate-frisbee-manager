import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-chips-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './text-chips-field.component.html',
  styleUrls: ['./text-chips-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextChipsFieldComponent),
      multi: true
    }
  ]
})
export class TextChipsFieldComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() allowDuplicates = false;
  @Input() maxItems: number | null = null;

  @ViewChild('inputEl') inputEl?: ElementRef<HTMLInputElement>;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  disabled = false;

  items: string[] = [];
  newItemCtrl = new FormControl('');

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  add(event: MatChipInputEvent): void {
    if (this.disabled) return;

    const raw = (event.value || '').trim();
    if (!raw) {
      event.chipInput?.clear();
      this.newItemCtrl.setValue('');
      return;
    }

    if (this.maxItems != null && this.items.length >= this.maxItems) {
      event.chipInput?.clear();
      this.newItemCtrl.setValue('');
      return;
    }

    const exists = this.items.some(x => x.toLowerCase() === raw.toLowerCase());
    if (!this.allowDuplicates && exists) {
      event.chipInput?.clear();
      this.newItemCtrl.setValue('');
      return;
    }

    this.items = [...this.items, raw];
    this.emit();

    event.chipInput?.clear();
    this.newItemCtrl.setValue('');
  }

  remove(item: string): void {
    if (this.disabled) return;
    const idx = this.items.indexOf(item);
    if (idx < 0) return;

    this.items = this.items.filter((_, i) => i !== idx);
    this.emit();
  }

  writeValue(value: string[] | null): void {
    this.items = Array.isArray(value) ? value.filter(v => !!v).map(v => `${v}`.trim()).filter(v => v.length > 0) : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.newItemCtrl.disable();
    else this.newItemCtrl.enable();
  }

  private emit(): void {
    this.onChange([...this.items]);
    this.onTouched();
  }
}
