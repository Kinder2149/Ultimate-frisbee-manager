import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { CacheService, CacheStats } from '../../services/cache.service';
import { switchMap } from 'rxjs/operators';

/**
 * Composant pour afficher les statistiques d'utilisation du cache
 * Utile en mode développement ou dans un tableau de bord d'administration
 */
@Component({
  selector: 'app-cache-stats',
  templateUrl: './cache-stats.component.html',
  styleUrls: ['./cache-stats.component.scss']
})
export class CacheStatsComponent implements OnInit, OnDestroy {
  /** Statistiques courantes du cache */
  stats: CacheStats | null = null;
  
  /** Rafraîchissement automatique des statistiques */
  private autoRefresh = true;
  
  /** Intervalle de rafraîchissement en ms */
  private refreshInterval = 5000;
  
  /** Abonnement pour le rafraîchissement automatique */
  private refreshSubscription?: Subscription;
  
  constructor(private cacheService: CacheService) { }

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  /**
   * Démarrer le rafraîchissement automatique des statistiques
   */
  startAutoRefresh(): void {
    if (this.autoRefresh && !this.refreshSubscription) {
      this.refreshSubscription = timer(0, this.refreshInterval)
        .pipe(
          switchMap(() => this.cacheService.getStatsObservable())
        )
        .subscribe(stats => {
          this.stats = stats;
        });
    }
  }

  /**
   * Arrêter le rafraîchissement automatique
   */
  stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
    }
  }
  
  /**
   * Forcer l'éviction des entrées peu utilisées du cache
   */
  triggerEviction(): void {
    const count = this.cacheService.triggerEviction();
    console.log(`Éviction manuelle : ${count} entrées supprimées du cache`);
  }
  
  /**
   * Récupérer le pourcentage formaté pour les barres de progression
   * @param value Valeur entre 0 et 1
   * @returns Pourcentage formaté
   */
  getPercentage(value: number): string {
    return `${Math.round(value * 100)}%`;
  }
  
  /**
   * Obtenir la classe CSS pour une barre de progression
   * @param value Valeur entre 0 et 1
   * @returns Classe CSS
   */
  getProgressBarClass(value: number): string {
    if (value > 0.9) {
      return 'bg-danger';
    } else if (value > 0.7) {
      return 'bg-warning';
    } else {
      return 'bg-success';
    }
  }
}
