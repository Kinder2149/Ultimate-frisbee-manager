import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Exercice } from '../models/exercice.model';
import { Entrainement } from '../models/entrainement.model';
import { Echauffement } from '../models/echauffement.model';
import { SituationMatch } from '../models/situationmatch.model';
import { Tag } from '../models/tag.model';

/**
 * Interface pour les statistiques du dashboard
 * Calculées localement à partir des données synchronisées depuis le backend
 */
export interface DashboardStats {
  exercicesCount: number;
  entrainementsCount: number;
  echauffementsCount: number;
  situationsCount: number;
  tagsCount: number;
  recentActivity: number; // Nombre d'éléments créés dans les 7 derniers jours
  tagsDetails?: { [category: string]: number };
}

/**
 * WorkspaceDataStore
 * 
 * RESPONSABILITÉS :
 * - Synchroniser l'état frontend avec le backend (PostgreSQL = source de vérité absolue)
 * - Exposer des BehaviorSubject pour partager l'état entre composants
 * - Calculer les stats dashboard à partir des données synchronisées
 * - Fournir un point d'accès unique aux données du workspace actuel
 * 
 * CE QUE LE STORE NE FAIT PAS :
 * - ❌ Créer/modifier/supprimer des données (rôle des services métier)
 * - ❌ Appeler directement le backend (rôle des services métier + DataCacheService)
 * - ❌ Remplacer le backend comme source de vérité
 * - ❌ Fonctionner hors ligne sans backend
 * - ❌ Valider les données métier (rôle du backend)
 * - ❌ Gérer le préchargement (rôle du WorkspacePreloaderService)
 * 
 * ARCHITECTURE :
 * Backend (PostgreSQL) → Services métier → WorkspaceDataStore → Composants
 * 
 * @Injectable providedIn: 'root'
 */
@Injectable({
  providedIn: 'root'
})
export class WorkspaceDataStore {
  
  // ============================================================================
  // ÉTAT OBSERVABLE (BehaviorSubjects)
  // ============================================================================
  
  /**
   * Liste des exercices du workspace actuel
   * Synchronisée avec GET /exercises du backend
   */
  private readonly exercicesSubject = new BehaviorSubject<Exercice[]>([]);
  public readonly exercices$: Observable<Exercice[]> = this.exercicesSubject.asObservable();
  
  /**
   * Liste des entrainements du workspace actuel
   * Synchronisée avec GET /trainings du backend
   */
  private readonly entrainementsSubject = new BehaviorSubject<Entrainement[]>([]);
  public readonly entrainements$: Observable<Entrainement[]> = this.entrainementsSubject.asObservable();
  
  /**
   * Liste des échauffements du workspace actuel
   * Synchronisée avec GET /warmups du backend
   */
  private readonly echauffementsSubject = new BehaviorSubject<Echauffement[]>([]);
  public readonly echauffements$: Observable<Echauffement[]> = this.echauffementsSubject.asObservable();
  
  /**
   * Liste des situations/matchs du workspace actuel
   * Synchronisée avec GET /matches du backend
   */
  private readonly situationsSubject = new BehaviorSubject<SituationMatch[]>([]);
  public readonly situations$: Observable<SituationMatch[]> = this.situationsSubject.asObservable();
  
  /**
   * Liste des tags du workspace actuel
   * Synchronisée avec GET /tags du backend
   */
  private readonly tagsSubject = new BehaviorSubject<Tag[]>([]);
  public readonly tags$: Observable<Tag[]> = this.tagsSubject.asObservable();
  
  /**
   * Statistiques du dashboard
   * Calculées localement à partir des données synchronisées
   * PAS un appel backend séparé
   */
  private readonly statsSubject = new BehaviorSubject<DashboardStats>({
    exercicesCount: 0,
    entrainementsCount: 0,
    echauffementsCount: 0,
    situationsCount: 0,
    tagsCount: 0,
    recentActivity: 0,
    tagsDetails: {}
  });
  public readonly stats$: Observable<DashboardStats> = this.statsSubject.asObservable();
  
  /**
   * État de chargement global
   * true pendant le chargement initial des données
   */
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  
  /**
   * Erreur globale
   * null si aucune erreur, message d'erreur sinon
   */
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  public readonly error$: Observable<string | null> = this.errorSubject.asObservable();
  
  // ============================================================================
  // CONSTRUCTEUR
  // ============================================================================
  
  constructor() {
    // Store passif : aucune initialisation automatique
    // Le chargement des données sera déclenché explicitement par le Preloader
  }
  
  // ============================================================================
  // MÉTHODES PUBLIQUES - MISE À JOUR DE L'ÉTAT
  // ============================================================================
  
  /**
   * Met à jour la liste des exercices
   * Appelée par le Preloader ou après une mutation
   * 
   * @param exercices - Liste des exercices depuis le backend
   */
  public setExercices(exercices: Exercice[]): void {
    this.exercicesSubject.next(exercices);
    this.recalculateStats();
  }
  
  /**
   * Met à jour la liste des entrainements
   * Appelée par le Preloader ou après une mutation
   * 
   * @param entrainements - Liste des entrainements depuis le backend
   */
  public setEntrainements(entrainements: Entrainement[]): void {
    this.entrainementsSubject.next(entrainements);
    this.recalculateStats();
  }
  
  /**
   * Met à jour la liste des échauffements
   * Appelée par le Preloader ou après une mutation
   * 
   * @param echauffements - Liste des échauffements depuis le backend
   */
  public setEchauffements(echauffements: Echauffement[]): void {
    this.echauffementsSubject.next(echauffements);
    this.recalculateStats();
  }
  
  /**
   * Met à jour la liste des situations/matchs
   * Appelée par le Preloader ou après une mutation
   * 
   * @param situations - Liste des situations depuis le backend
   */
  public setSituations(situations: SituationMatch[]): void {
    this.situationsSubject.next(situations);
    this.recalculateStats();
  }
  
  /**
   * Met à jour la liste des tags
   * Appelée par le Preloader ou après une mutation
   * 
   * @param tags - Liste des tags depuis le backend
   */
  public setTags(tags: Tag[]): void {
    this.tagsSubject.next(tags);
    this.recalculateStats();
  }
  
  /**
   * Met à jour l'état de chargement
   * 
   * @param loading - true si chargement en cours, false sinon
   */
  public setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }
  
  /**
   * Met à jour l'erreur globale
   * 
   * @param error - Message d'erreur ou null
   */
  public setError(error: string | null): void {
    this.errorSubject.next(error);
  }
  
  /**
   * Charge toutes les données du workspace en une seule fois
   * Utilisée par le Preloader après l'appel bulk endpoint
   * 
   * @param data - Données complètes du workspace depuis le backend
   */
  public loadWorkspaceData(data: {
    exercices: Exercice[];
    entrainements: Entrainement[];
    echauffements: Echauffement[];
    situations: SituationMatch[];
    tags: Tag[];
  }): void {
    this.setLoading(true);
    this.setError(null);
    
    try {
      this.exercicesSubject.next(data.exercices);
      this.entrainementsSubject.next(data.entrainements);
      this.echauffementsSubject.next(data.echauffements);
      this.situationsSubject.next(data.situations);
      this.tagsSubject.next(data.tags);
      
      this.recalculateStats();
      this.setLoading(false);
    } catch (error) {
      this.setError('Erreur lors du chargement des données du workspace');
      this.setLoading(false);
      console.error('[WorkspaceDataStore] Error loading workspace data:', error);
    }
  }
  
  // ============================================================================
  // MÉTHODES PUBLIQUES - LECTURE DE L'ÉTAT (Getters synchrones)
  // ============================================================================
  
  /**
   * Obtient la liste actuelle des exercices (valeur synchrone)
   * Utile pour les composants qui ont besoin d'une valeur immédiate
   * 
   * @returns Liste des exercices actuellement en mémoire
   */
  public getExercices(): Exercice[] {
    return this.exercicesSubject.value;
  }
  
  /**
   * Obtient la liste actuelle des entrainements (valeur synchrone)
   * 
   * @returns Liste des entrainements actuellement en mémoire
   */
  public getEntrainements(): Entrainement[] {
    return this.entrainementsSubject.value;
  }
  
  /**
   * Obtient la liste actuelle des échauffements (valeur synchrone)
   * 
   * @returns Liste des échauffements actuellement en mémoire
   */
  public getEchauffements(): Echauffement[] {
    return this.echauffementsSubject.value;
  }
  
  /**
   * Obtient la liste actuelle des situations/matchs (valeur synchrone)
   * 
   * @returns Liste des situations actuellement en mémoire
   */
  public getSituations(): SituationMatch[] {
    return this.situationsSubject.value;
  }
  
  /**
   * Obtient la liste actuelle des tags (valeur synchrone)
   * 
   * @returns Liste des tags actuellement en mémoire
   */
  public getTags(): Tag[] {
    return this.tagsSubject.value;
  }
  
  /**
   * Obtient les statistiques actuelles (valeur synchrone)
   * 
   * @returns Statistiques calculées localement
   */
  public getStats(): DashboardStats {
    return this.statsSubject.value;
  }
  
  /**
   * Vérifie si le store est en cours de chargement
   * 
   * @returns true si chargement en cours, false sinon
   */
  public isLoading(): boolean {
    return this.loadingSubject.value;
  }
  
  /**
   * Obtient l'erreur actuelle
   * 
   * @returns Message d'erreur ou null
   */
  public getError(): string | null {
    return this.errorSubject.value;
  }
  
  // ============================================================================
  // MÉTHODES PUBLIQUES - RÉINITIALISATION
  // ============================================================================
  
  /**
   * Réinitialise toutes les données du store
   * Utilisée lors du changement de workspace ou de la déconnexion
   */
  public clear(): void {
    this.exercicesSubject.next([]);
    this.entrainementsSubject.next([]);
    this.echauffementsSubject.next([]);
    this.situationsSubject.next([]);
    this.tagsSubject.next([]);
    this.statsSubject.next({
      exercicesCount: 0,
      entrainementsCount: 0,
      echauffementsCount: 0,
      situationsCount: 0,
      tagsCount: 0,
      recentActivity: 0,
      tagsDetails: {}
    });
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }
  
  // ============================================================================
  // MÉTHODES PRIVÉES - CALCUL DES STATISTIQUES
  // ============================================================================
  
  /**
   * Recalcule les statistiques du dashboard à partir des données en mémoire
   * Appelée automatiquement après chaque mise à jour des données
   * 
   * IMPORTANT : Les stats sont calculées côté frontend MAIS à partir de données
   * provenant du backend. Ce n'est pas une source de vérité autonome.
   * La précision dépend de la fraîcheur du cache (TTL 30min).
   */
  private recalculateStats(): void {
    const exercices = this.exercicesSubject.value;
    const entrainements = this.entrainementsSubject.value;
    const echauffements = this.echauffementsSubject.value;
    const situations = this.situationsSubject.value;
    const tags = this.tagsSubject.value;
    
    // Calcul des compteurs simples
    const exercicesCount = exercices.length;
    const entrainementsCount = entrainements.length;
    const echauffementsCount = echauffements.length;
    const situationsCount = situations.length;
    const tagsCount = tags.length;
    
    // Calcul de l'activité récente (7 derniers jours)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentExercices = exercices.filter(e => 
      e.createdAt && new Date(e.createdAt).getTime() > sevenDaysAgo
    ).length;
    const recentEntrainements = entrainements.filter(e => 
      e.createdAt && new Date(e.createdAt).getTime() > sevenDaysAgo
    ).length;
    const recentEchauffements = echauffements.filter(e => 
      e.createdAt && new Date(e.createdAt).getTime() > sevenDaysAgo
    ).length;
    const recentSituations = situations.filter(s => 
      s.createdAt && new Date(s.createdAt).getTime() > sevenDaysAgo
    ).length;
    const recentActivity = recentExercices + recentEntrainements + recentEchauffements + recentSituations;
    
    // Calcul des détails par catégorie de tags
    const tagsDetails: { [category: string]: number } = {};
    tags.forEach(tag => {
      if (tag.category) {
        tagsDetails[tag.category] = (tagsDetails[tag.category] || 0) + 1;
      }
    });
    
    // Mise à jour du BehaviorSubject des stats
    this.statsSubject.next({
      exercicesCount,
      entrainementsCount,
      echauffementsCount,
      situationsCount,
      tagsCount,
      recentActivity,
      tagsDetails
    });
  }
}
