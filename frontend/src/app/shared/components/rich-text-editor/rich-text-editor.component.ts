import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  template: `
  <div class="rte rich-text">
    <quill-editor
      [(ngModel)]="value"
      [modules]="modules"
      [formats]="formats"
      [placeholder]="placeholder"
      (onContentChanged)="onContentChanged($event)"
      theme="snow"
      class="rte-quill"
    ></quill-editor>
  </div>
  `,
  styles: [`
    .rte { display: block; width: 100%; }
    .rte-quill { min-height: 180px; width: 100%; }
    :host ::ng-deep .ql-container.ql-snow { border-radius: 0 0 8px 8px; }
    :host ::ng-deep .ql-toolbar.ql-snow { border-radius: 8px 8px 0 0; }
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RichTextEditorComponent),
    multi: true,
  }],
})
export class RichTextEditorComponent implements ControlValueAccessor {
  @Input() placeholder = "Décris l'exercice…";
  @Input() sanitize = false;
  @Output() htmlChange = new EventEmitter<string>();

  value = '';

  modules: any = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }]
    ]
  };

  formats: string[] = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'indent'
  ];

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.value = typeof val === 'string' ? val : '';
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { /* not used */ }

  onContentChanged(e: any) {
    if (!e) return;
    const html = e.html ?? '';
    const out = this.sanitize ? this.sanitizeHtml(html) : html;
    // Ne pas réécrire la valeur du modèle pour éviter les pertes de sélection
    this.onChange(out);
    this.htmlChange.emit(out);
  }

  private sanitizeHtml(html: string): string {
    if (!this.sanitize) return html || '';
    try {
      // Lazy require to avoid SSR issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(html || '', {
        ALLOWED_TAGS: ['p','br','strong','em','u','ul','ol','li','a','span','h2','h3'],
        ALLOWED_ATTR: ['href','target','rel','class'],
      });
    } catch {
      return html || '';
    }
  }
}
