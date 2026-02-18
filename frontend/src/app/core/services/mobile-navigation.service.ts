import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Entrainement } from '../models/entrainement.model';

@Injectable({
  providedIn: 'root'
})
export class MobileNavigationService {
  // État de la navigation
  private currentTabSubject = new BehaviorSubject<string>('home');
  public currentTab$: Observable<string> = this.currentTabSubject.asObservable();

  // État du mode terrain
  private terrainModeSubject = new BehaviorSubject<boolean>(false);
  public terrainMode$: Observable<boolean> = this.terrainModeSubject.asObservable();

  // Entraînement actif
  private activeTrainingSubject = new BehaviorSubject<Entrainement | null>(null);
  public activeTraining$: Observable<Entrainement | null> = this.activeTrainingSubject.asObservable();

  // Favoris (stockés dans localStorage)
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$: Observable<string[]> = this.favoritesSubject.asObservable();

  // Index de l'exercice actuel dans l'entraînement
  private currentExerciseIndexSubject = new BehaviorSubject<number>(0);
  public currentExerciseIndex$: Observable<number> = this.currentExerciseIndexSubject.asObservable();

  constructor() {
    this.loadFavoritesFromStorage();
  }

  // Navigation
  setCurrentTab(tab: string): void {
    this.currentTabSubject.next(tab);
  }

  getCurrentTab(): string {
    return this.currentTabSubject.value;
  }

  // Mode terrain
  enableTerrainMode(): void {
    this.terrainModeSubject.next(true);
  }

  disableTerrainMode(): void {
    this.terrainModeSubject.next(false);
  }

  isTerrainModeActive(): boolean {
    return this.terrainModeSubject.value;
  }

  // Entraînement actif
  setActiveTraining(training: Entrainement | null): void {
    this.activeTrainingSubject.next(training);
    if (training) {
      this.currentExerciseIndexSubject.next(0);
    }
  }

  getActiveTraining(): Entrainement | null {
    return this.activeTrainingSubject.value;
  }

  // Progression dans l'entraînement
  setCurrentExerciseIndex(index: number): void {
    this.currentExerciseIndexSubject.next(index);
  }

  getCurrentExerciseIndex(): number {
    return this.currentExerciseIndexSubject.value;
  }

  nextExercise(): void {
    const currentIndex = this.currentExerciseIndexSubject.value;
    this.currentExerciseIndexSubject.next(currentIndex + 1);
  }

  previousExercise(): void {
    const currentIndex = this.currentExerciseIndexSubject.value;
    if (currentIndex > 0) {
      this.currentExerciseIndexSubject.next(currentIndex - 1);
    }
  }

  // Favoris
  addFavorite(id: string): void {
    const favorites = this.favoritesSubject.value;
    if (!favorites.includes(id)) {
      const updatedFavorites = [...favorites, id];
      this.favoritesSubject.next(updatedFavorites);
      this.saveFavoritesToStorage(updatedFavorites);
    }
  }

  removeFavorite(id: string): void {
    const favorites = this.favoritesSubject.value;
    const updatedFavorites = favorites.filter(fav => fav !== id);
    this.favoritesSubject.next(updatedFavorites);
    this.saveFavoritesToStorage(updatedFavorites);
  }

  isFavorite(id: string): boolean {
    return this.favoritesSubject.value.includes(id);
  }

  getFavorites(): string[] {
    return this.favoritesSubject.value;
  }

  clearFavorites(): void {
    this.favoritesSubject.next([]);
    localStorage.removeItem('ufm.mobile.favorites');
  }

  // Gestion du localStorage
  private loadFavoritesFromStorage(): void {
    try {
      const stored = localStorage.getItem('ufm.mobile.favorites');
      if (stored) {
        const favorites = JSON.parse(stored);
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  }

  private saveFavoritesToStorage(favorites: string[]): void {
    try {
      localStorage.setItem('ufm.mobile.favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  }
}
