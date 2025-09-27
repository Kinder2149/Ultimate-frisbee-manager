import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1 class="app-title">Ultimate Frisbee Manager</h1>
        <p class="subtitle">Tableau de bord principal</p>
      </div>
      
      <!-- Section Bases de données -->
      <div class="section">
        <h2 class="section-title">📚 Bases de données</h2>
        <div class="database-grid">
          <a class="database-card" routerLink="/exercices">
            <div class="card-icon">🏃‍♂️</div>
            <h3>Exercices</h3>
            <p>{{ exercicesCount }} exercices</p>
          </a>
          
          <a class="database-card" routerLink="/entrainements">
            <div class="card-icon">📋</div>
            <h3>Entraînements</h3>
            <p>{{ entrainementsCount }} entraînements</p>
          </a>
          
          <a class="database-card" routerLink="/echauffements">
            <div class="card-icon">🔥</div>
            <h3>Échauffements</h3>
                        <p>{{ echauffementsCount }} échauffements</p>
          </a>
          
          <a class="database-card" routerLink="/situations-matchs">
            <div class="card-icon">🥏</div>
            <h3>Situations/Matchs</h3>
            <p>{{ situationsCount }} situations</p>
          </a>
        </div>
      </div>

      <!-- Section Actions rapides -->
      <div class="section">
        <h2 class="section-title">⚡ Actions rapides</h2>
        <div class="actions-grid">
          <div class="action-card add-card" (click)="showAddMenu = !showAddMenu">
            <div class="card-icon">➕</div>
            <h3>Ajouter</h3>
            <p>Créer un nouvel élément</p>
            
            <div class="add-menu" *ngIf="showAddMenu" (click)="$event.stopPropagation()">
              <a class="add-option" routerLink="/exercices/ajouter" (click)="showAddMenu = false">
                <span class="option-icon">🏃‍♂️</span>
                Nouvel exercice
              </a>
              <a class="add-option" routerLink="/entrainements/nouveau" (click)="showAddMenu = false">
                <span class="option-icon">📋</span>
                Nouvel entraînement
              </a>
              <a class="add-option" routerLink="/echauffements/ajouter" (click)="showAddMenu = false">
                <span class="option-icon">🔥</span>
                Nouvel échauffement
              </a>
              <a class="add-option" routerLink="/situations-matchs/ajouter" (click)="showAddMenu = false">
                <span class="option-icon">🥏</span>
                Nouvelle situation/match
              </a>
            </div>
          </div>
          
          <a class="action-card" routerLink="/tags">
            <div class="card-icon">🏷️</div>
            <h3>Gérer les tags</h3>
            <p>{{ getTagsDescription() }}</p>
          </a>
        </div>
      </div>

      <!-- Section Statistiques rapides -->
      <div class="section">
        <h2 class="section-title">📊 Aperçu</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ totalElements }}</div>
            <div class="stat-label">Total d'éléments</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ tagsCount }}</div>
            <div class="stat-label">Tags créés</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ recentActivity }}</div>
            <div class="stat-label">Ajouts récents</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .welcome-section {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .app-title {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: #7f8c8d;
    }

    .section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.5rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #3498db;
    }
    
    .database-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .database-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .database-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }

    .database-card .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .database-card h3 {
      color: white;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    .database-card p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 0.9rem;
    }
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    
    .action-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      position: relative;
      overflow: visible;
    }
    
    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .add-card {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .add-card h3, .add-card p {
      color: white;
    }
    
    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .action-card h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .action-card p {
      color: #7f8c8d;
      margin: 0;
    }

    .add-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 1000;
      margin-top: 0.5rem;
      overflow: hidden;
    }

    .add-option {
      display: flex;
      align-items: center;
      padding: 1rem;
      text-decoration: none;
      color: #2c3e50;
      border-bottom: 1px solid #ecf0f1;
      transition: background-color 0.2s;
    }

    .add-option:hover {
      background-color: #f8f9fa;
    }

    .add-option:last-child {
      border-bottom: none;
    }

    .option-icon {
      font-size: 1.5rem;
      margin-right: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border-left: 4px solid #3498db;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 768px) {
      .database-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-container {
        padding: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  showAddMenu = false;
  
  // Données réelles depuis l'API
  exercicesCount = 0;
  entrainementsCount = 0;
  echauffementsCount: number = 0;
  situationsCount = 0;
  tagsCount = 0;
  tagsDetails: { [category: string]: number } = {};
  recentActivity = 0;
  isLoading = true;

  get totalElements(): number {
        return this.exercicesCount + this.entrainementsCount + this.echauffementsCount + this.situationsCount;
  }

  getTagsDescription(): string {
    if (this.isLoading) return 'Chargement...';
    
    const categories = Object.keys(this.tagsDetails);
    if (categories.length === 0) return 'Aucun tag créé';
    
    if (categories.length === 1) {
      const category = categories[0];
      const count = this.tagsDetails[category];
      return `${count} tag${count > 1 ? 's' : ''} ${category}`;
    }
    
    return `${this.tagsCount} tags (${categories.length} catégories)`;
  }

  constructor(private dashboardService: DashboardService) {
    console.log('🎯 Dashboard créé avec succès');
    
    // Fermer le menu d'ajout si on clique ailleurs
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.add-card')) {
        this.showAddMenu = false;
      }
    });
  }

  ngOnInit() {
    this.loadDashboardStats();
  }

  private loadDashboardStats() {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (stats: DashboardStats) => {
        this.exercicesCount = stats.exercicesCount;
        this.entrainementsCount = stats.entrainementsCount;
                this.echauffementsCount = stats.echauffementsCount;
        this.situationsCount = stats.situationsCount;
        this.tagsCount = stats.tagsCount;
        this.tagsDetails = stats.tagsDetails;
        this.recentActivity = stats.recentActivity;
        this.isLoading = false;
        console.log('📊 Statistiques dashboard chargées:', stats);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des statistiques:', error);
        this.isLoading = false;
        // Garder les valeurs par défaut (0) en cas d'erreur
      }
    });
  }

  ngOnDestroy() {
    document.removeEventListener('click', () => {});
  }
}
