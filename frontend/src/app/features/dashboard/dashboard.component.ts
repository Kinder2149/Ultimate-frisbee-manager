import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { WorkspaceService, WorkspaceSummary } from '../../core/services/workspace.service';
import { DataCacheService } from '../../core/services/data-cache.service';
import { filter, switchMap, take, retry, catchError, tap } from 'rxjs/operators';
import { of, timer, Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Section Workspace -->
      <div class="workspace-header" *ngIf="currentWorkspace">
        <div class="workspace-info">
          <div class="workspace-icon">🏢</div>
          <div class="workspace-details">
            <h2 class="workspace-name">{{ currentWorkspace.name }}</h2>
            <span class="workspace-role" [class.owner]="currentWorkspace.role === 'OWNER'">{{ getRoleLabel(currentWorkspace.role || 'USER') }}</span>
          </div>
        </div>
        <div class="workspace-actions">
          <button class="btn-workspace" (click)="navigateToWorkspaceSelection()">
            <span class="btn-icon">🔄</span>
            Changer d'espace
          </button>
        </div>
      </div>

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

    .workspace-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }

    .workspace-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .workspace-icon {
      font-size: 3rem;
      background: rgba(255, 255, 255, 0.2);
      width: 70px;
      height: 70px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .workspace-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .workspace-name {
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0;
      color: white;
    }

    .workspace-role {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .workspace-role.owner {
      background: rgba(255, 215, 0, 0.3);
      color: #ffd700;
    }

    .workspace-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-workspace {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
    }

    .btn-workspace:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }

    .btn-icon {
      font-size: 1.2rem;
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

    .workspace-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #ecf0f1;
    }

    .workspace-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .workspace-actions {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .workspace-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .workspace-info {
        flex-direction: column;
        text-align: center;
      }

      .workspace-actions {
        width: 100%;
      }

      .btn-workspace {
        width: 100%;
        justify-content: center;
      }

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
  currentWorkspace: WorkspaceSummary | null = null;
  
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

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private workspaceService: WorkspaceService,
    private dataCache: DataCacheService,
    private router: Router
  ) {
    // Fermer le menu d'ajout si on clique ailleurs
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.add-card')) {
        this.showAddMenu = false;
      }
    });
  }

  ngOnInit() {
    // S'abonner au workspace actuel
    this.workspaceService.currentWorkspace$.subscribe(ws => {
      this.currentWorkspace = ws;
    });

    // Charger les stats dès qu'un workspace est sélectionné
    this.workspaceService.currentWorkspace$
      .pipe(
        filter((ws) => !!ws),
        take(1),
        switchMap(() => this.loadDashboardStats$())
      )
      .subscribe();
  }

  private loadDashboardStats$() {
    this.isLoading = true;
    
    // Utiliser le cache avec TTL de 2 minutes
    return this.dataCache.get(
      'dashboard-stats',
      () => this.dashboardService.getStats().pipe(
        retry({ count: 1, delay: () => timer(700) })
      ),
      2 * 60 * 1000 // 2 minutes
    ).pipe(
      tap((stats: DashboardStats) => {
        this.exercicesCount = stats.exercicesCount;
        this.entrainementsCount = stats.entrainementsCount;
        this.echauffementsCount = stats.echauffementsCount;
        this.situationsCount = stats.situationsCount;
        this.tagsCount = stats.tagsCount;
        this.tagsDetails = stats.tagsDetails;
        this.recentActivity = stats.recentActivity;
        this.isLoading = false;
      }),
      catchError(() => {
        this.isLoading = false;
        return of(null);
      })
    );
  }

  getRoleLabel(role: string): string {
    switch(role) {
      case 'OWNER': return 'Propriétaire';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  }

  navigateToWorkspaceSelection(): void {
    // Invalider le cache avant de changer de workspace
    this.dataCache.clearAll();
    // Naviguer vers la page de sélection
    this.router.navigate(['/select-workspace']);
  }

  ngOnDestroy() {
    document.removeEventListener('click', () => {});
  }
}
