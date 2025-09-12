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

export interface BaseContentItem {
  id: string;
  titre: string;
  createdAt: string;
  tags?: { label: string; category: string; color?: string }[];
}

export interface AllContentResponse {
  exercices: BaseContentItem[];
  entrainements: BaseContentItem[];
  echauffements: BaseContentItem[];
  situations: BaseContentItem[];
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

  getAllContent(): Observable<AllContentResponse> {
    const url = this.api.getUrl('admin/all-content');
    return this.http.get<AllContentResponse>(url);
  }

  getAllTags(): Observable<{ tags: any[] }> {
    const url = this.api.getUrl('admin/all-tags');
    return this.http.get<{ tags: any[] }>(url);
  }

  bulkDelete(items: { id: string, type: string }[]): Observable<any> {
    const url = this.api.getUrl('admin/bulk-delete');
    return this.http.post(url, { items });
  }

  bulkDuplicate(items: { id: string, type: string }[]): Observable<any> {
    const url = this.api.getUrl('admin/bulk-duplicate');
    return this.http.post(url, { items });
  }
}
