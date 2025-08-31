import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlService } from './api-url.service';

export interface AdminOverviewCounts {
  exercices: number;
  entrainements: number;
  echauffements: number;
  situations: number;
  tags: number;
  users: number;
}

export interface AdminOverviewItem {
  id: string;
  titre?: string;
  name?: string;
  category?: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role?: string;
  isActive?: boolean;
  iconUrl?: string | null;
  createdAt: string;
}

export interface AdminOverviewResponse {
  counts: AdminOverviewCounts;
  recent: {
    exercices: AdminOverviewItem[];
    entrainements: AdminOverviewItem[];
    echauffements: AdminOverviewItem[];
    situations: AdminOverviewItem[];
    tags: AdminOverviewItem[];
    users: AdminOverviewItem[];
  };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient, private api: ApiUrlService) {}

  getOverview(): Observable<AdminOverviewResponse> {
    const url = this.api.getUrl('admin/overview');
    return this.http.get<AdminOverviewResponse>(url);
  }

  // Gestion des utilisateurs (admin)
  getUsers(): Observable<{ users: Array<{ id: string; email: string; nom?: string; prenom?: string; role: string; isActive: boolean; iconUrl?: string | null; createdAt: string }> }> {
    const url = this.api.getUrl('admin/users');
    return this.http.get<{ users: Array<{ id: string; email: string; nom?: string; prenom?: string; role: string; isActive: boolean; iconUrl?: string | null; createdAt: string }> }>(url);
  }

  updateUser(id: string, payload: { role?: string; isActive?: boolean }): Observable<{ user: any }> {
    const url = this.api.getUrl(`admin/users/${id}`);
    return this.http.patch<{ user: any }>(url, payload);
  }

  createUser(payload: { email: string; password: string; nom?: string; prenom?: string; role?: string; isActive?: boolean }): Observable<{ user: any }> {
    const url = this.api.getUrl('admin/users');
    return this.http.post<{ user: any }>(url, payload);
  }
}
