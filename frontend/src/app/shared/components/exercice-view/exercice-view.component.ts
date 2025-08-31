import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Tag, TagCategory } from '../../../core/models/tag.model';
import { TagService } from '../../../core/services/tag.service';
import { ApiUrlService } from '../../../core/services/api-url.service';

export interface ExerciceViewData {
  exercice: {
    nom?: string;
    description?: string;
    createdAt?: string | Date;
    imageUrl?: string;
    schemaUrl?: string;
    materiel?: string;
    notes?: string;
    tags?: Tag[];
    tagIds?: string[];
    variablesText?: string;
    variablesPlus?: string | string[];
    variablesMinus?: string | string[];
    [key: string]: unknown; // pour accéder à un éventuel champ 'variables' imbriqué
  };
}

@Component({
  selector: 'app-exercice-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule],
  templateUrl: './exercice-view.component.html',
  styleUrls: ['./exercice-view.component.scss']
})
export class ExerciceViewComponent implements OnInit {
  // Tags par catégorie
  objectifTag: Tag | null = null;
  travailSpecifiqueTags: Tag[] = [];
  niveauTags: Tag[] = [];
  tempsTags: Tag[] = [];
  formatTags: Tag[] = [];

  // Exercice affiché (alimenté depuis DialogService.customData)
  exercice: ExerciceViewData['exercice'] = {};

  constructor(
    public dialogRef: MatDialogRef<ExerciceViewComponent>,
    // Le DialogService passe { dialogConfig, customData } dans MAT_DIALOG_DATA
    // Nous typons en 'any' pour lire customData.exercice de façon robuste
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tagService: TagService,
    private apiUrl: ApiUrlService
  ) {}

  ngOnInit(): void {
    // Extraire l'exercice depuis customData si présent
    this.exercice = (this.data?.customData?.exercice || this.data?.exercice || {}) as ExerciceViewData['exercice'];

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
    return this.apiUrl.getMediaUrl(path ?? undefined);
  }

  private splitTagsByCategory(tags: Tag[]) {
    this.objectifTag = tags.find(t => t.category === TagCategory.OBJECTIF) || null;
    this.travailSpecifiqueTags = tags.filter(t => t.category === TagCategory.TRAVAIL_SPECIFIQUE);
    this.niveauTags = tags.filter(t => t.category === TagCategory.NIVEAU);
    this.tempsTags = tags.filter(t => t.category === TagCategory.TEMPS);
    this.formatTags = tags.filter(t => t.category === TagCategory.FORMAT);
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

  close(): void {
    this.dialogRef.close();
  }
}
