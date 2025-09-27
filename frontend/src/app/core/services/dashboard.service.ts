import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from './api-url.service';

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
    private apiUrlService: ApiUrlService
  ) { }

  /**
   * Récupère les statistiques du dashboard
   */
  getStats(): Observable<DashboardStats> {
    const url = this.apiUrlService.getUrl('dashboard/stats');
    return this.http.get<DashboardStats>(url);
  }
}
