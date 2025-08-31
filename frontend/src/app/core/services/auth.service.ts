/**
 * Service d'authentification Angular
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User, LoginCredentials, LoginResponse, AuthError } from '../models/user.model';
import { ApiUrlService } from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly TOKEN_KEY = 'ultimate_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'ultimate_refresh_token';
  private readonly USER_KEY = 'ultimate_user';

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiUrlService: ApiUrlService
  ) {
    this.initializeAuthState();
  }

  /**
   * Uploader l'avatar utilisateur
   */
  uploadProfileIcon(file: File): Observable<{ user: User }> {
    const url = this.apiUrlService.getUrl('auth/profile/icon');
    const formData = new FormData();
    formData.append('icon', file);

    return this.http.post<{ user: User }>(url, formData).pipe(
      tap(response => {
        this.setStoredUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  updateProfile(payload: Partial<User> & { password?: string }): Observable<{ user: User }> {
    const url = this.apiUrlService.getUrl('auth/profile');

    return this.http.put<{ user: User }>(url, payload).pipe(
      tap(response => {
        this.setStoredUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Initialiser l'état d'authentification au démarrage
   */
  private initializeAuthState(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const url = this.apiUrlService.getUrl('auth/login');
    
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap(response => {
        // Stocker les tokens et les données utilisateur
        this.setToken(response.token);
        this.setRefreshToken(response.refreshToken);
        this.setStoredUser(response.user);
        
        // Mettre à jour les subjects
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): Observable<any> {
    const url = this.apiUrlService.getUrl('auth/logout');
    
    return this.http.post(url, {}).pipe(
      tap(() => {
        this.clearAuthData();
      }),
      catchError(() => {
        // Même en cas d'erreur serveur, on nettoie les données locales
        this.clearAuthData();
        return throwError('Erreur lors de la déconnexion');
      })
    );
  }

  /**
   * Déconnexion locale (sans appel serveur)
   */
  logoutLocal(): void {
    this.clearAuthData();
  }

  /**
   * Récupérer le profil utilisateur
   */
  getProfile(): Observable<{ user: User }> {
    const url = this.apiUrlService.getUrl('auth/profile');
    
    return this.http.get<{ user: User }>(url).pipe(
      tap(response => {
        this.setStoredUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Rafraîchir le token
   */
  refreshToken(): Observable<{ token: string }> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError('Aucun refresh token disponible');
    }

    const url = this.apiUrlService.getUrl('auth/refresh');
    
    return this.http.post<{ token: string }>(url, { refreshToken }).pipe(
      tap(response => {
        this.setToken(response.token);
      }),
      catchError(error => {
        // Si le refresh token est invalide, déconnecter l'utilisateur
        this.clearAuthData();
        return throwError(error);
      })
    );
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStoredUser();
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtenir le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtenir le refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Stocker le token d'authentification
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Stocker le refresh token
   */
  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Obtenir les données utilisateur stockées
   */
  private getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Stocker les données utilisateur
   */
  private setStoredUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Nettoyer toutes les données d'authentification
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/login']);
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error && error.error.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur AuthService:', error);
    return throwError(errorMessage);
  };
}
