import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { DataCacheService } from './data-cache.service';

export interface DashboardStats {
  exercicesCount: number;
  entrainementsCount: number;
  echauffementsCount: number;
  situationsCount: number;
  tagsCount: number;
  tagsDetails: { [category: string]: number };
  totalElements: number;
  recentActivity: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private http: HttpClient,
    private apiUrlService: ApiUrlService,
    private cache: DataCacheService
  ) { }

  /**
   * Récupère les statistiques du dashboard avec cache
   */
  getStats(): Observable<DashboardStats> {
    return this.cache.get<DashboardStats>(
      'dashboard-stats',
      'dashboard-stats',
      () => {
        const url = this.apiUrlService.getUrl('dashboard/stats');
        return this.http.get<DashboardStats>(url);
      },
      { ttl: 2 * 60 * 1000 } // 2 minutes
    );
  }
}
