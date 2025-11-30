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
   * @param formData Les données du formulaire, y compris le fichier image si présent
   */
  createExercice(formData: FormData): Observable<Exercice> {
    return this.exerciceOptimizedService.ajouterExercice(formData);
  }
  
  /**
   * Met à jour un exercice existant
   * @param id L'identifiant de l'exercice à mettre à jour
   * @param formData Les données du formulaire, y compris le fichier image si présent
   */
  updateExercice(id: string, formData: FormData): Observable<Exercice> {
    return this.exerciceOptimizedService.updateExercice(id, formData);
  }
  
  /**
   * Supprime un exercice
   */
  deleteExercice(id: string): Observable<void> {
    return this.exerciceOptimizedService.deleteExercice(id);
  }
}
