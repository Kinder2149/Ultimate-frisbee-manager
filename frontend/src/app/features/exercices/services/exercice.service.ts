import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExerciceOptimizedService } from './exercice-optimized.service';
import { Exercice } from '../../../core/models/exercice.model';

/**
 * Service façade pour la gestion des exercices
 * Utilise le service optimisé en interne tout en fournissant une interface simplifiée
 */
@Injectable({
  providedIn: 'root'
})
export class ExerciceService {
  constructor(private exerciceOptimizedService: ExerciceOptimizedService) {}
  
  /**
   * Récupère tous les exercices disponibles
   */
  getAllExercices(): Observable<Exercice[]> {
    return this.exerciceOptimizedService.getExercices();
  }
  
  /**
   * Récupère un exercice par son ID
   */
  getExerciceById(id: string): Observable<Exercice> {
    return this.exerciceOptimizedService.getExerciceById(id);
  }
  
  /**
   * Crée un nouvel exercice
   */
  createExercice(exercice: Exercice): Observable<Exercice> {
    return this.exerciceOptimizedService.ajouterExercice(exercice);
  }
  
  /**
   * Met à jour un exercice existant
   */
  updateExercice(id: string, exercice: Exercice): Observable<Exercice> {
    return this.exerciceOptimizedService.updateExercice(id, exercice);
  }
  
  /**
   * Supprime un exercice
   */
  deleteExercice(id: string): Observable<void> {
    return this.exerciceOptimizedService.deleteExercice(id);
  }
}
