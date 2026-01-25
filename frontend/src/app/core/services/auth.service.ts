import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginCredentials } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

// Clé localStorage pour le token backend local
const LOCAL_TOKEN_KEY = 'ufm_access_token';
const LOCAL_REFRESH_TOKEN_KEY = 'ufm_refresh_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Empêche les appels concurrents et limite la fréquence de sync du profil
  private syncingProfile = false;
  private lastProfileSyncAt = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private supabaseService: SupabaseService
  ) {
    this.listenToAuthStateChanges();
    // Vérifier si un token backend local existe au démarrage
    this.initFromLocalToken();
  }

  private initFromLocalToken(): void {
    const localToken = localStorage.getItem(LOCAL_TOKEN_KEY);
    if (localToken) {
      this.isAuthenticatedSubject.next(true);
      // Synchroniser le profil en arrière-plan
      this.syncUserProfile().subscribe({
        error: () => {
          // Token invalide ou expiré, le supprimer
          this.clearLocalToken();
          this.isAuthenticatedSubject.next(false);
        }
      });
    }
  }

  signUp(email: string, password: string): Observable<void> {
    return from(
      this.supabaseService.supabase.auth.signUp({
        email,
        password
      })
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Erreur lors de la création du compte Supabase:', error);
          throw error;
        }
        // L'email de confirmation et la suite du flux sont gérés côté Supabase.
        return;
      }),
      catchError(error => {
        console.error('Erreur inattendue lors de l\'inscription:', error);
        return throwError(() => error);
      })
    );
  }

  private listenToAuthStateChanges(): void {
    this.supabaseService.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // Debug minimal pour auth events
        
        if (event === 'PASSWORD_RECOVERY') {
          // L'utilisateur vient de cliquer sur un lien de réinitialisation de mot de passe.
          // On le redirige vers la page Angular de changement de mot de passe.
          this.router.navigate(['/reset-password']);
          return;
        }

        // Pour INITIAL_SESSION, on vérifie si on a déjà un token backend local
        // Si oui, on ne touche pas à l'état d'auth (déjà géré par initFromLocalToken)
        if (event === 'INITIAL_SESSION') {
          const hasLocalToken = !!localStorage.getItem(LOCAL_TOKEN_KEY);
          if (hasLocalToken) {
            return; // Token local présent, ne pas modifier l'état
          }
          // Pas de token local, vérifier si Supabase a une vraie session
          if (!session?.user) {
            this.isAuthenticatedSubject.next(false);
            return;
          }
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            // Le token Supabase est disponible, on considère l'utilisateur comme authentifié
            this.isAuthenticatedSubject.next(true);
            this.syncUserProfileThrottled();
          } else {
            // Pas de session utilisateur associée
            this.currentUserSubject.next(null);
            this.isAuthenticatedSubject.next(false);
          }
        } else if (event === 'SIGNED_OUT') {
          this.clearStateAndRedirect();
        }
      }
    );
  }

  private syncUserProfileThrottled(): void {
    const now = Date.now();
    // Cooldown de 3s pour éviter des rafales (INITIAL_SESSION -> TOKEN_REFRESHED)
    if (this.syncingProfile || (now - this.lastProfileSyncAt) < 3000) {
      return;
    }
    this.syncingProfile = true;
    this.syncUserProfile().pipe(
      finalize(() => {
        this.lastProfileSyncAt = Date.now();
        this.syncingProfile = false;
      })
    ).subscribe({
      error: (error) => {
        console.error('Erreur de synchronisation du profil après changement d\'état auth:', error);
        // Ne pas déconnecter; le backend cold start sera géré par BackendStatus
      }
    });
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
        // Ne pas rediriger ici - laisser le composant gérer le fallback
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
    // On redirige directement vers la page Angular de réinitialisation.
    // Supabase construira une ConfirmationURL qui inclut ce redirect_to.
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
    // Nettoyer le token backend local
    this.clearLocalToken();
    
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
    // 1. Vérifier d'abord si un token backend local existe
    const localToken = localStorage.getItem(LOCAL_TOKEN_KEY);
    if (localToken) {
      return localToken;
    }
    
    // 2. Sinon, utiliser le token Supabase
    const { data } = await this.supabaseService.supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  /**
   * Connexion via le backend local (pour admin@ultimate.com et tests locaux)
   */
  loginWithBackend(credentials: LoginCredentials): Observable<void> {
    return this.http.post<{ accessToken: string; refreshToken?: string; user?: User }>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        // Stocker le token dans localStorage
        localStorage.setItem(LOCAL_TOKEN_KEY, response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem(LOCAL_REFRESH_TOKEN_KEY, response.refreshToken);
        }
        // Marquer comme authentifié
        this.isAuthenticatedSubject.next(true);
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      map(() => void 0),
      catchError(error => {
        console.error('[Auth] Erreur connexion:', error?.status || error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Vérifie si un token backend local existe
   */
  hasLocalToken(): boolean {
    return !!localStorage.getItem(LOCAL_TOKEN_KEY);
  }

  /**
   * Supprime le token backend local
   */
  clearLocalToken(): void {
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_REFRESH_TOKEN_KEY);
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

