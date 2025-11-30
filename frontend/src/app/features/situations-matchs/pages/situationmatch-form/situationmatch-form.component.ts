import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SituationMatchService } from '../../../../core/services/situationmatch.service';
import { TagService } from '../../../../core/services/tag.service';
import { SituationMatch } from '../../../../core/models/situationmatch.model';
import { Tag } from '../../../../core/models/tag.model';
import { SituationMatchFormComponent as SharedSituationMatchFormComponent, SituationMatchFormData } from '../../../../shared/components/forms/situationmatch-form/situationmatch-form.component';

@Component({
  selector: 'app-situationmatch-form-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    SharedSituationMatchFormComponent
  ],
  templateUrl: './situationmatch-form.component.html',
  styleUrls: ['./situationmatch-form.component.scss']
})
export class SituationMatchFormComponent implements OnInit {
  situationMatch?: SituationMatch;
  isEditMode = false;
  situationMatchId?: string;
  loading = false;
  availableTags: Tag[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private situationMatchService: SituationMatchService,
    private tagService: TagService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkEditMode();
    this.loadTags();
    
    // Si nous sommes en mode édition, charger les données
    if (this.isEditMode && this.situationMatchId) {
      this.loadSituationMatch();
    }
  }

  private checkEditMode(): void {
    this.situationMatchId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.situationMatchId;
  }

  private loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => {
        // Filtrer les tags pertinents (format, temps, etc.)
        this.availableTags = tags.filter(tag => 
          ['format', 'temps', 'niveau'].includes(tag.category)
        );
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des tags:', error);
        this.snackBar.open('Erreur lors du chargement des tags', 'Fermer', { duration: 3000 });
      }
    });
  }

  private loadSituationMatch(): void {
    if (!this.situationMatchId) return;
    
    this.loading = true;
    this.situationMatchService.getSituationMatchById(this.situationMatchId).subscribe({
      next: (situationMatch) => {
        this.situationMatch = situationMatch;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement de la situation/match:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onFormSubmit(formData: SituationMatchFormData): void {
    this.loading = true;
    
    // Construire un FormData identique à Échauffement
    const fd = new FormData();
    fd.append('type', formData.type);
    if (formData.description !== undefined && formData.description !== null) fd.append('description', formData.description);
    if (formData.temps !== undefined && formData.temps !== null) fd.append('temps', formData.temps);
    if (formData.tagIds && formData.tagIds.length) fd.append('tagIds', JSON.stringify(formData.tagIds));
    // Gestion suppression image: imageUrl vide pour forcer le remplacement
    if (formData.imageUrl === '') {
      fd.append('imageUrl', '');
    }
    // Fichier image si présent
    if (formData.image) {
      fd.append('image', formData.image, formData.image.name);
    }

    if (this.isEditMode && this.situationMatchId) {
      // Mode édition avec FormData
      this.situationMatchService.updateSituationMatch(this.situationMatchId, fd).subscribe({
        next: () => {
          this.snackBar.open('Situation/Match modifiée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/situations-matchs']);
        },
        error: (error: any) => {
          console.error('Erreur lors de la modification:', error);
          this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      // Mode création avec FormData
      this.situationMatchService.createSituationMatch(fd).subscribe({
        next: () => {
          this.snackBar.open('Situation/Match créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/situations-matchs']);
        },
        error: (error: any) => {
          console.error('Erreur lors de la création:', error);
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onFormCancel(): void {
    this.router.navigate(['/situations-matchs']);
  }
}
