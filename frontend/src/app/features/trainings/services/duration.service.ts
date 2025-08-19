import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Phase, PhaseExercice } from './training.models';

/**
 * Service utilitaire pour calculer et gérer les durées des entraînements
 */
@Injectable({
  providedIn: 'root'
})
export class DurationService {
  // Observable pour suivre les changements de durée totale
  private totalDurationSubject = new BehaviorSubject<number>(0);
  totalDuration$ = this.totalDurationSubject.asObservable();

  constructor() { }

  /**
   * Calcule la durée totale d'un ensemble de phases
   * @param phases Liste des phases
   * @returns Durée totale en minutes
   */
  calculateTotalDuration(phases: Phase[]): number {
    if (!phases || phases.length === 0) {
      return 0;
    }

    // Calculer la durée des phases
    const phasesDuration = phases.reduce((total, phase) => {
      return total + (phase.duree || 0);
    }, 0);
    
    this.updateTotalDuration(phasesDuration);
    return phasesDuration;
  }

  /**
   * Calcule la durée totale d'une phase en fonction de ses exercices
   * @param exercices Liste des exercices de la phase
   * @returns Durée totale en minutes
   */
  calculatePhaseDuration(exercices: PhaseExercice[]): number {
    if (!exercices || exercices.length === 0) {
      return 0;
    }

    // Calculer la durée des exercices
    const exercicesDuration = exercices.reduce((total, exercice) => {
      return total + (exercice.duree || 0);
    }, 0);
    
    return exercicesDuration;
  }

  /**
   * Met à jour la durée totale et notifie les abonnés
   * @param duration Nouvelle durée totale
   */
  updateTotalDuration(duration: number): void {
    this.totalDurationSubject.next(duration);
  }

  /**
   * Formatte une durée en format heures:minutes
   * @param durationMinutes Durée en minutes
   * @returns Chaîne formatée (ex: "1h 30min")
   */
  formatDuration(durationMinutes: number): string {
    if (durationMinutes === 0) {
      return '0min';
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    let result = '';
    if (hours > 0) {
      result += `${hours}h `;
    }
    
    if (minutes > 0 || hours === 0) {
      result += `${minutes}min`;
    }
    
    return result.trim();
  }
}
