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
    const contenu = this.enHtml(this.html || '');
    if (!this.sanitize) return contenu;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(contenu, {
        ALLOWED_TAGS: ['p','br','strong','em','u','ul','ol','li','a','span','h2','h3'],
        ALLOWED_ATTR: ['href','target','rel','class'],
      });
    } catch {
      return contenu;
    }
  }

  /** Texte brut (ex. import Ulti Coach) : on échappe et on garde les retours à la ligne. */
  private enHtml(texte: string): string {
    if (/<[a-z][\s\S]*>/i.test(texte)) return texte;
    return texte
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\r?\n/g, '<br>');
  }
}
