import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rich-text" [innerHTML]="safeHtml"></div>
  `,
  styles: []
})
export class RichTextViewComponent {
  @Input() html = '';
  @Input() sanitize = true;

  get safeHtml(): string {
    if (!this.sanitize) return this.html || '';
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(this.html || '', {
        ALLOWED_TAGS: ['p','br','strong','em','u','ul','ol','li','a','span','h2','h3'],
        ALLOWED_ATTR: ['href','target','rel','class'],
      });
    } catch {
      return this.html || '';
    }
  }
}
