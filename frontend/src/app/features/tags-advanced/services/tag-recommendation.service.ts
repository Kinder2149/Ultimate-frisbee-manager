import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';

export interface Tag {
  id: string;
  label: string;
  category: string;
  color?: string;
  level?: number;
}

export interface TagRecommendation {
  tag: Tag;
  confidence: number;
  source: string;
}

export interface RecommendationStats {
  totalRecommendations: number;
  acceptedRecommendations: number;
  rejectedRecommendations: number;
  accuracyRate: number;
  categoryCoverage: Record<string, number>;
  mostRecommendedTags: Array<{tag: Tag, count: number}>;
}

@Injectable({
  providedIn: 'root'
})
export class TagRecommendationService {
  private apiUrl = '/api/tags/recommendations';
  private mockDelay = 800; // Délai simulé pour le mode de développement
  private useMockData = true; // À définir sur false en production

  // Cache local des recommandations
  private recommendationCache: Map<string, TagRecommendation[]> = new Map();
  
  // Statistiques des recommandations
  private stats: RecommendationStats = {
    totalRecommendations: 0,
    acceptedRecommendations: 0,
    rejectedRecommendations: 0,
    accuracyRate: 0,
    categoryCoverage: {},
    mostRecommendedTags: []
  };

  constructor(private http: HttpClient) { }

  /**
   * Obtient des recommandations de tags pour un texte donné
   */
  getRecommendationsForText(text: string, maxRecommendations: number = 5): Observable<TagRecommendation[]> {
    // Vérifier si les recommandations sont en cache
    const cacheKey = `${text}-${maxRecommendations}`;
    if (this.recommendationCache.has(cacheKey)) {
      return of(this.recommendationCache.get(cacheKey) || []);
    }

    if (this.useMockData) {
      return this.mockGetRecommendations(text, maxRecommendations);
    }

    return this.http.post<TagRecommendation[]>(`${this.apiUrl}/for-text`, {
      text,
      maxRecommendations
    }).pipe(
      tap(recommendations => {
        // Mettre en cache les recommandations
        this.recommendationCache.set(cacheKey, recommendations);
        this.updateStats(recommendations);
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Obtient des recommandations de tags pour un exercice
   */
  getRecommendationsForExercise(exerciseId: string, exerciseName: string, description: string): Observable<TagRecommendation[]> {
    // Vérifier si les recommandations sont en cache
    if (this.recommendationCache.has(exerciseId)) {
      return of(this.recommendationCache.get(exerciseId) || []);
    }

    if (this.useMockData) {
      return this.mockGetRecommendations(`${exerciseName} ${description}`, 5);
    }

    return this.http.post<TagRecommendation[]>(`${this.apiUrl}/for-exercise`, {
      exerciseId,
      exerciseName,
      description
    }).pipe(
      tap(recommendations => {
        // Mettre en cache les recommandations
        this.recommendationCache.set(exerciseId, recommendations);
        this.updateStats(recommendations);
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Enregistre les retours sur une recommandation (acceptée ou rejetée)
   */
  submitFeedback(exerciseId: string, recommendations: TagRecommendation[], accepted: boolean): Observable<boolean> {
    if (this.useMockData) {
      return of(true).pipe(delay(this.mockDelay));
    }

    return this.http.post<{success: boolean}>(`${this.apiUrl}/feedback`, {
      exerciseId,
      recommendations,
      accepted
    }).pipe(
      map(response => response.success),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Obtient les statistiques des recommandations
   */
  getRecommendationStats(): Observable<RecommendationStats> {
    if (this.useMockData) {
      return of(this.stats).pipe(delay(this.mockDelay));
    }

    return this.http.get<RecommendationStats>(`${this.apiUrl}/stats`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Entraîne le modèle de recommandation avec de nouvelles données
   */
  trainModel(): Observable<{success: boolean, message: string}> {
    if (this.useMockData) {
      return of({
        success: true,
        message: 'Entraînement du modèle terminé avec succès'
      }).pipe(delay(2000)); // Délai plus long pour simuler l'entraînement
    }

    return this.http.post<{success: boolean, message: string}>(`${this.apiUrl}/train`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Efface le cache de recommandations
   */
  clearCache(): void {
    this.recommendationCache.clear();
  }

  /**
   * Met à jour les statistiques de recommandation
   */
  private updateStats(recommendations: TagRecommendation[]): void {
    this.stats.totalRecommendations += recommendations.length;
    
    // Mettre à jour la couverture par catégorie
    recommendations.forEach(rec => {
      const category = rec.tag.category;
      if (!this.stats.categoryCoverage[category]) {
        this.stats.categoryCoverage[category] = 0;
      }
      this.stats.categoryCoverage[category]++;
      
      // Mettre à jour les tags les plus recommandés
      const tagIndex = this.stats.mostRecommendedTags.findIndex(item => item.tag.id === rec.tag.id);
      if (tagIndex >= 0) {
        this.stats.mostRecommendedTags[tagIndex].count++;
      } else {
        this.stats.mostRecommendedTags.push({
          tag: rec.tag,
          count: 1
        });
      }
    });
    
    // Trier les tags les plus recommandés
    this.stats.mostRecommendedTags.sort((a, b) => b.count - a.count);
    
    // Limiter la liste aux 10 premiers
    if (this.stats.mostRecommendedTags.length > 10) {
      this.stats.mostRecommendedTags = this.stats.mostRecommendedTags.slice(0, 10);
    }
    
    // Calculer le taux de précision (si des retours ont été soumis)
    if (this.stats.acceptedRecommendations + this.stats.rejectedRecommendations > 0) {
      this.stats.accuracyRate = this.stats.acceptedRecommendations / 
        (this.stats.acceptedRecommendations + this.stats.rejectedRecommendations);
    }
  }

  /**
   * Marque une recommandation comme acceptée
   */
  acceptRecommendation(recommendation: TagRecommendation): void {
    this.stats.acceptedRecommendations++;
    this.updateAccuracyRate();
  }

  /**
   * Marque une recommandation comme rejetée
   */
  rejectRecommendation(recommendation: TagRecommendation): void {
    this.stats.rejectedRecommendations++;
    this.updateAccuracyRate();
  }

  /**
   * Met à jour le taux de précision
   */
  private updateAccuracyRate(): void {
    const total = this.stats.acceptedRecommendations + this.stats.rejectedRecommendations;
    if (total > 0) {
      this.stats.accuracyRate = this.stats.acceptedRecommendations / total;
    }
  }

  // Méthodes mock pour le développement
  private mockGetRecommendations(text: string, maxRecommendations: number): Observable<TagRecommendation[]> {
    // Liste de tags fictifs pour les tests
    const mockTags: Tag[] = [
      { id: 't1', label: 'technique', category: 'objectif', color: '#4caf50' },
      { id: 't2', label: 'tactique', category: 'objectif', color: '#4caf50' },
      { id: 't3', label: 'physique', category: 'objectif', color: '#4caf50' },
      { id: 't4', label: 'échauffement', category: 'objectif', color: '#4caf50' },
      { id: 't5', label: 'passe', category: 'travail_specifique', color: '#2196f3' },
      { id: 't6', label: 'réception', category: 'travail_specifique', color: '#2196f3' },
      { id: 't7', label: 'marquage', category: 'travail_specifique', color: '#2196f3' },
      { id: 't8', label: 'collectif', category: 'variable', color: '#ff9800' },
      { id: 't9', label: 'individuel', category: 'variable', color: '#ff9800' },
      { id: 't10', label: 'niveau 1', category: 'niveau', color: '#9c27b0', level: 1 },
      { id: 't11', label: 'niveau 2', category: 'niveau', color: '#9c27b0', level: 2 },
      { id: 't12', label: 'niveau 3', category: 'niveau', color: '#9c27b0', level: 3 }
    ];
    
    // Simuler la correspondance basée sur le texte
    const recommendations: TagRecommendation[] = [];
    const lowerText = text.toLowerCase();
    
    // Rechercher des mots-clés pour chaque tag et leur attribuer une confiance
    mockTags.forEach(tag => {
      let confidence = 0;
      
      // Simuler la correspondance basée sur des mots-clés
      const keywordsMap: Record<string, string[]> = {
        'technique': ['technique', 'geste', 'mouvement', 'position'],
        'tactique': ['tactique', 'stratégie', 'positionnement', 'lecture'],
        'physique': ['physique', 'condition', 'endurance', 'vitesse'],
        'échauffement': ['échauffement', 'préparation', 'mobilité', 'activation'],
        'passe': ['passe', 'lancer', 'throw', 'backhand', 'forehand'],
        'réception': ['réception', 'catch', 'attraper', 'saisir'],
        'marquage': ['marquage', 'défense', 'marquer', 'couvrir'],
        'collectif': ['collectif', 'équipe', 'groupe', 'ensemble'],
        'individuel': ['individuel', 'solo', 'seul', 'personnel'],
        'niveau 1': ['débutant', 'facile', 'simple', 'initiation'],
        'niveau 2': ['intermédiaire', 'moyen', 'progression'],
        'niveau 3': ['avancé', 'difficile', 'complexe', 'expert']
      };
      
      // Vérifier si les mots-clés sont présents dans le texte
      const keywords = keywordsMap[tag.label.toLowerCase()] || [tag.label.toLowerCase()];
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          confidence += 0.25;
        }
      });
      
      // Ajouter une légère randomisation
      confidence += Math.random() * 0.2;
      
      // Limiter à 0.95 max
      confidence = Math.min(confidence, 0.95);
      
      // Si la confiance est suffisante, ajouter à la liste
      if (confidence > 0.3) {
        recommendations.push({
          tag,
          confidence,
          source: confidence > 0.6 ? 'Analyse sémantique' : 'Mots-clés'
        });
      }
    });
    
    // Trier par confiance décroissante et limiter au nombre demandé
    const sortedRecommendations = recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxRecommendations);
    
    // Mettre en cache les recommandations
    const cacheKey = `${text}-${maxRecommendations}`;
    this.recommendationCache.set(cacheKey, sortedRecommendations);
    this.updateStats(sortedRecommendations);
    
    return of(sortedRecommendations).pipe(delay(this.mockDelay));
  }
}
