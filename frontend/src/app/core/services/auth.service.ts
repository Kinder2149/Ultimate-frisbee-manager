import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginCredentials } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    this.listenToAuthStateChanges();
  }

  private listenToAuthStateChanges(): void {
    this.supabaseService.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            // Le token est maintenant disponible, on peut synchroniser notre profil BDD
            this.syncUserProfile().subscribe();
          } else {
            this.clearStateAndRedirect();
          }
        } else if (event === 'SIGNED_OUT') {
          this.clearStateAndRedirect();
        }
      }
    );
  }

  login(credentials: LoginCredentials): Observable<void> {
    return from(this.supabaseService.supabase.auth.signInWithPassword(credentials)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        // La magie opère dans onAuthStateChange, ici on ne fait rien de plus
        return;
      }),
      catchError(error => {
        console.error('Erreur de connexion Supabase:', error);
        this.clearStateAndRedirect();
        throw error;
      })
    );
  }

  logout(): Observable<void> {
    return from(this.supabaseService.supabase.auth.signOut()).pipe(
      map(({ error }) => {
        if (error) throw error;
        // onAuthStateChange s'occupera du reste
        return;
      })
    );
  }

  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabaseService.supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'ADMIN';
  }

  private syncUserProfile(): Observable<User> {
    // L'intercepteur ajoutera le token JWT de Supabase à cette requête
    return this.http.get<{ user: User }>(`${this.apiUrl}/profile`).pipe(
      map(response => {
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
        return response.user;
      }),
      catchError(error => {
        console.error('Erreur de synchronisation du profil:', error);
        // Si la synchro échoue, on déconnecte pour éviter un état incohérent
        this.logout(); 
        throw error;
      })
    );
  }

  private clearStateAndRedirect(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }
}

