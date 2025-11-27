import { Component, Inject, OnInit, Input, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Tag, TagCategory } from '../../../core/models/tag.model';
import { TagService } from '../../../core/services/tag.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { ImageViewerComponent, ImageViewerData } from '../image-viewer/image-viewer.component';
import { RichTextViewComponent } from '../rich-text-view/rich-text-view.component';

export interface ExerciceViewData {
  exercice: {
    nom?: string;
    description?: string;
    createdAt?: string | Date;
    imageUrl?: string;
    // Ancien champ conservé pour compat ascendante si présent encore
    schemaUrl?: string;
    // Nouveau: multi-schémas
    schemaUrls?: string[];
    materiel?: string;
    notes?: string;
    critereReussite?: string;
    tags?: Tag[];
    tagIds?: string[];
    variablesText?: string;
    variablesPlus?: string | string[];
    variablesMinus?: string | string[];
    // Nouveau: points importants
    points?: string[];
    [key: string]: unknown; // pour accéder à un éventuel champ 'variables' imbriqué
  };
}

@Component({
  selector: 'app-exercice-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule, RichTextViewComponent],
  templateUrl: './exercice-view.component.html',
  styleUrls: ['./exercice-view.component.scss']
})
export class ExerciceViewComponent implements OnInit {
  @Input() exercice: ExerciceViewData['exercice'] = {};
  @Input() isSummary: boolean = false;
  // Tags par catégorie
  objectifTag: Tag | null = null;
  travailSpecifiqueTags: Tag[] = [];
  niveauTags: Tag[] = [];
  tempsTags: Tag[] = [];
  formatTags: Tag[] = [];

  // Exercice affiché (alimenté depuis DialogService.customData)
  constructor(
    @Optional() public dialogRef: MatDialogRef<ExerciceViewComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private tagService: TagService,
    private apiUrl: ApiUrlService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Si les données viennent d'un dialogue, on les utilise. Sinon, on s'attend à ce qu'elles soient passées via @Input()
    if (this.data) {
      this.exercice = (this.data?.customData?.exercice || this.data?.exercice || {}) as ExerciceViewData['exercice'];
    }

    if (this.exercice.tags && this.exercice.tags.length) {
      this.splitTagsByCategory(this.exercice.tags);
    } else if (this.exercice.tagIds && this.exercice.tagIds.length) {
      this.tagService.getTags().subscribe({
        next: (tags: Tag[]) => {
          const selected = tags.filter(t => t.id && this.exercice.tagIds!.includes(t.id));
          this.splitTagsByCategory(selected);
        },
        error: () => {}
      });
    }
  }

  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.getMediaUrl(path ?? undefined, 'exercices');
  }

  private splitTagsByCategory(tags: Tag[]) {
        this.objectifTag = tags.find(t => t.category === 'objectif') || null;
        this.travailSpecifiqueTags = tags.filter(t => t.category === 'travail_specifique');
        this.niveauTags = tags.filter(t => t.category === 'niveau');
        this.tempsTags = tags.filter(t => t.category === 'temps');
        this.formatTags = tags.filter(t => t.category === 'format');
  }

  get variables(): any | null {
    const ex = this.exercice as any;
    return ex?.variables || null;
  }

  get variablesPlusList(): string[] {
    const fromNested = this.variables?.variablesPlus as string[] | undefined;
    const fromTop = this.exercice.variablesPlus;
    if (Array.isArray(fromNested)) return fromNested;
    if (typeof fromNested === 'string') return [fromNested];
    if (Array.isArray(fromTop)) return fromTop;
    if (typeof fromTop === 'string') return [fromTop];
    return [];
  }

  get variablesMinusList(): string[] {
    const fromNested = this.variables?.variablesMinus as string[] | undefined;
    const fromTop = this.exercice.variablesMinus;
    if (Array.isArray(fromNested)) return fromNested;
    if (typeof fromNested === 'string') return [fromNested];
    if (Array.isArray(fromTop)) return fromTop;
    if (typeof fromTop === 'string') return [fromTop];
    return [];
  }

  get duree(): string | null {
    return this.variables?.duree || null;
  }

  get objectifsPedagogiques(): string | null {
    return this.variables?.objectifsPedagogiques || null;
  }

  get consignes(): string | null {
    return this.variables?.consignes || null;
  }

  get schemaUrlsList(): string[] {
    const raw = (this.exercice as any).schemaUrls;
    if (Array.isArray(raw)) return raw.filter(u => !!u);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((u: any) => !!u) : [];
      } catch {
        return raw ? [raw] : [];
      }
    }
    return [];
  }

  get pointsList(): string[] {
    const raw = (this.exercice as any).points;
    if (Array.isArray(raw)) return raw.filter(p => !!p);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((p: any) => !!p) : (raw ? [raw] : []);
      } catch {
        return raw ? [raw] : [];
      }
    }
    return [];
  }

  openImageViewer(imageUrl: string): void {
    if (!imageUrl) return;

    const fullImageUrl = this.mediaUrl(imageUrl);
    if (!fullImageUrl) return;

    this.dialog.open<ImageViewerComponent, ImageViewerData>(ImageViewerComponent, {
      data: {
        imageUrl: fullImageUrl,
        altText: `Illustration de l'exercice: ${this.exercice.nom}`
      },
      panelClass: 'image-viewer-dialog-container',
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
