import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
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
            // Le token Supabase est disponible, on considère l'utilisateur comme authentifié
            this.isAuthenticatedSubject.next(true);

            // Puis on tente de synchroniser le profil avec le backend
            this.syncUserProfile().subscribe({
              error: (error) => {
                console.error('Erreur de synchronisation du profil après changement d\'état auth:', error);
                // On ne force plus la déconnexion ici; le loader/backend-status gère le cold start
              }
            });
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

  /**
   * Demande à Supabase d'envoyer un e-mail de réinitialisation de mot de passe
   * vers l'adresse fournie. La redirection après clic sur le lien est
   * configurée côté Supabase (ou via l'option redirectTo de l'appel).
   */
  requestPasswordReset(email: string): Observable<void> {
    const redirectTo = environment.production
      ? 'https://ultimate-frisbee-manager.vercel.app/reset-password'
      : 'http://localhost:4200/reset-password';

    return from(
      this.supabaseService.supabase.auth.resetPasswordForEmail(email, { redirectTo })
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
          throw error;
        }
        return;
      })
    );
  }

  logout(): Observable<void> {
    return from(this.supabaseService.supabase.auth.signOut({ scope: 'local' })).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Erreur lors de la déconnexion Supabase:', error);
        }

        // Dans tous les cas, on nettoie l'état local et on redirige
        this.clearStateAndRedirect();
        return;
      })
    );
  }

  /**
   * Met à jour le mot de passe de l'utilisateur courant dans Supabase.
   * Utilisé dans le flux de réinitialisation après clic sur le lien de reset.
   */
  updatePassword(newPassword: string): Observable<void> {
    return from(
      this.supabaseService.supabase.auth.updateUser({ password: newPassword })
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Erreur lors de la mise à jour du mot de passe Supabase:', error);
          throw error;
        }
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

  /**
   * Rafraîchit le profil utilisateur depuis le backend
   */
  refreshUserProfile(): Observable<User> {
    return this.syncUserProfile();
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
        // En cas d'erreur (backend en cold start par exemple), on ne force plus la déconnexion.
        // On laisse l'état Supabase actif et on remonte simplement l'erreur.
        return throwError(() => error);
      })
    );
  }

  private clearStateAndRedirect(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }
}

