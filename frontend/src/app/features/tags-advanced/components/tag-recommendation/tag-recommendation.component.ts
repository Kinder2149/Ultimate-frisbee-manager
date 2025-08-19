import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { TagRecommendationService, Tag, TagRecommendation } from '../../services/tag-recommendation.service';

@Component({
  selector: 'app-tag-recommendation',
  templateUrl: './tag-recommendation.component.html',
  styleUrls: ['./tag-recommendation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ]
})
export class TagRecommendationComponent implements OnInit {
  @Input() inputText = '';
  @Input() existingTags: Tag[] = [];
  @Input() maxRecommendations = 5;
  @Input() autoUpdate = true;
  @Input() showConfidence = true;

  @Output() recommendationSelected = new EventEmitter<Tag>();
  @Output() recommendationsUpdated = new EventEmitter<TagRecommendation[]>();
  
  recommendations: TagRecommendation[] = [];
  loading = false;
  
  private textChanges = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  constructor(private recommendationService: TagRecommendationService) { }

  ngOnInit(): void {
    if (this.autoUpdate) {
      this.setupAutomaticRecommendations();
    }
    
    // Générer des recommandations initiales si du texte est déjà fourni
    if (this.inputText) {
      this.updateRecommendations();
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Configurer les recommandations automatiques basées sur les changements de texte
   */
  private setupAutomaticRecommendations(): void {
    this.textChanges.pipe(
      debounceTime(500),
      switchMap(text => {
        this.loading = true;
        return this.recommendationService.getRecommendationsForText(text, this.maxRecommendations);
      }),
      takeUntil(this.destroy$)
    ).subscribe(recommendations => {
      this.loading = false;
      this.processRecommendations(recommendations);
    }, error => {
      this.loading = false;
      console.error('Erreur lors de la récupération des recommandations:', error);
    });
  }
  
  /**
   * Notifie le composant d'un changement de texte d'entrée
   */
  onTextChange(text: string): void {
    this.inputText = text;
    if (this.autoUpdate) {
      this.textChanges.next(text);
    }
  }
  
  /**
   * Met à jour manuellement les recommandations
   */
  updateRecommendations(): void {
    if (!this.inputText) {
      this.recommendations = [];
      this.recommendationsUpdated.emit([]);
      return;
    }
    
    this.loading = true;
    this.recommendationService.getRecommendationsForText(
      this.inputText,
      this.maxRecommendations
    ).subscribe(recommendations => {
      this.loading = false;
      this.processRecommendations(recommendations);
    }, error => {
      this.loading = false;
      console.error('Erreur lors de la récupération des recommandations:', error);
    });
  }
  
  /**
   * Traite les recommandations reçues
   */
  private processRecommendations(recommendations: TagRecommendation[]): void {
    // Filtrer les tags qui existent déjà
    if (this.existingTags && this.existingTags.length > 0) {
      const existingIds = this.existingTags.map(tag => tag.id);
      this.recommendations = recommendations.filter(rec => 
        !existingIds.includes(rec.tag.id)
      );
    } else {
      this.recommendations = recommendations;
    }
    
    // Émettre les recommandations mises à jour
    this.recommendationsUpdated.emit(this.recommendations);
  }
  
  /**
   * Sélectionne une recommandation
   */
  selectRecommendation(recommendation: TagRecommendation): void {
    this.recommendationSelected.emit(recommendation.tag);
    
    // Retirer la recommandation sélectionnée de la liste
    this.recommendations = this.recommendations.filter(rec => 
      rec.tag.id !== recommendation.tag.id
    );
    
    // Mettre à jour les recommandations émises
    this.recommendationsUpdated.emit(this.recommendations);
  }
  
  /**
   * Obtient la classe de confiance en fonction du niveau de confiance
   */
  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'high-confidence';
    if (confidence >= 0.5) return 'medium-confidence';
    return 'low-confidence';
  }
}
