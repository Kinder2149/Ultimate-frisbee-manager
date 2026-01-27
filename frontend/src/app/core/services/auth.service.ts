import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginCredentials } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { WorkspaceService } from './workspace.service';
import { IndexedDbService } from './indexed-db.service';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

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
    private supabaseService: SupabaseService,
    private workspaceService: WorkspaceService,
    private indexedDb: IndexedDbService
  ) {
    this.initializeAuth();
  }

  /**
   * Initialisation de l'authentification au démarrage
   */
  private async initializeAuth(): Promise<void> {
    // Écouter les changements d'état Supabase
    this.listenToAuthStateChanges();

    // Vérifier si une session Supabase existe
    const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
    
    if (session?.user) {
      console.log('[Auth] Session Supabase trouvée, chargement du profil');
      this.isAuthenticatedSubject.next(true);
      
      // Charger le profil depuis le cache d'abord
      const cachedUser = await this.loadCachedProfile();
      if (cachedUser) {
        this.currentUserSubject.next(cachedUser);
        this.ensureWorkspaceSelected();
      }
      
      // Synchroniser avec le backend
      this.syncUserProfile().subscribe({
        next: () => this.ensureWorkspaceSelected(),
        error: (err) => console.error('[Auth] Erreur sync profil:', err)
      });
    } else {
      console.log('[Auth] Aucune session active');
      this.isAuthenticatedSubject.next(false);
    }
  }

  /**
   * Inscription via Supabase + création du profil backend
   */
  signUp(email: string, password: string): Observable<void> {
    return from(
      this.supabaseService.supabase.auth.signUp({ email, password })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          console.error('[Auth] Erreur inscription Supabase:', error);
          throw error;
        }
        
        // Si l'utilisateur est créé, créer son profil backend
        if (data.user) {
          return this.createBackendProfile(data.user.id, email);
        }
        
        return from(Promise.resolve());
      }),
      map(() => void 0),
      catchError(error => {
        console.error('[Auth] Erreur inscription:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Créer le profil utilisateur dans le backend
   */
  private createBackendProfile(supabaseUserId: string, email: string): Observable<void> {
    return this.http.post<{ user: User }>(`${this.apiUrl}/register`, {
      supabaseUserId,
      email
    }).pipe(
      tap(response => {
        console.log('[Auth] Profil backend créé:', response.user.email);
        this.currentUserSubject.next(response.user);
        this.cacheUserProfile(response.user);
      }),
      map(() => void 0)
    );
  }

  /**
   * Écouter les changements d'état d'authentification Supabase
   */
  private listenToAuthStateChanges(): void {
    this.supabaseService.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('[Auth] Event:', event, session?.user?.email || 'no user');
        
        switch (event) {
          case 'SIGNED_IN':
            this.handleSignedIn(session);
            break;
            
          case 'SIGNED_OUT':
            this.handleSignedOut();
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('[Auth] Token rafraîchi');
            break;
            
          case 'PASSWORD_RECOVERY':
            console.log('[Auth] Récupération mot de passe');
            this.router.navigate(['/reset-password']);
            break;
            
          case 'USER_UPDATED':
            console.log('[Auth] Utilisateur mis à jour');
            if (session?.user) {
              this.syncUserProfile().subscribe();
            }
            break;
        }
      }
    );
  }

  /**
   * Gérer la connexion réussie
   */
  private handleSignedIn(session: Session | null): void {
    if (!session?.user) return;
    
    console.log('[Auth] Connexion réussie:', session.user.email);
    this.isAuthenticatedSubject.next(true);
    
    // Synchroniser le profil avec le backend
    this.syncUserProfile().subscribe({
      next: () => this.ensureWorkspaceSelected(),
      error: (err) => {
        console.error('[Auth] Erreur sync profil après connexion:', err);
        // Si l'utilisateur n'existe pas en backend, le créer
        if (err.status === 403) {
          this.createBackendProfile(session.user.id, session.user.email!).subscribe({
            next: () => this.ensureWorkspaceSelected(),
            error: (createErr) => console.error('[Auth] Erreur création profil:', createErr)
          });
        }
      }
    });
  }

  /**
   * Gérer la déconnexion
   */
  private handleSignedOut(): void {
    console.log('[Auth] Déconnexion');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.clearCachedProfile();
    this.workspaceService.clear();
    this.indexedDb.clearAll();
    this.router.navigate(['/login']);
  }


  /**
   * Connexion via Supabase
   */
  login(credentials: LoginCredentials): Observable<void> {
    return from(
      this.supabaseService.supabase.auth.signInWithPassword(credentials)
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('[Auth] Erreur connexion:', error);
          throw error;
        }
        // L'événement SIGNED_IN gérera le reste
        return;
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Demander la réinitialisation du mot de passe
   */
  requestPasswordReset(email: string): Observable<void> {
    const redirectTo = environment.production
      ? 'https://ultimate-frisbee-manager.vercel.app/reset-password'
      : 'http://localhost:4200/reset-password';

    return from(
      this.supabaseService.supabase.auth.resetPasswordForEmail(email, { redirectTo })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        return;
      }),
      catchError(error => {
        console.error('[Auth] Erreur reset password:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): Observable<void> {
    return from(
      this.supabaseService.supabase.auth.signOut({ scope: 'local' })
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('[Auth] Erreur déconnexion:', error);
        }
        // L'événement SIGNED_OUT gérera le nettoyage
        return;
      })
    );
  }

  /**
   * Mettre à jour le mot de passe
   */
  updatePassword(newPassword: string): Observable<void> {
    return from(
      this.supabaseService.supabase.auth.updateUser({ password: newPassword })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        return;
      }),
      catchError(error => {
        console.error('[Auth] Erreur update password:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer le token d'accès Supabase
   */
  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabaseService.supabase.auth.getSession();
    return data.session?.access_token || null;
  }


  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'ADMIN';
  }

  /**
   * Rafraîchir le profil utilisateur
   */
  refreshUserProfile(): Observable<User> {
    return this.syncUserProfile();
  }

  /**
   * Synchroniser le profil utilisateur avec le backend
   */
  private syncUserProfile(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/profile`).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.cacheUserProfile(response.user);
        console.log('[Auth] Profil synchronisé:', response.user.email);
      }),
      map(response => response.user),
      catchError(error => {
        console.error('[Auth] Erreur sync profil:', error);
        
        // Si l'utilisateur n'existe pas en base (403), le créer via /register
        if (error.status === 403) {
          console.log('[Auth] Utilisateur non trouvé en base, création automatique...');
          return this.provisionUser().pipe(
            switchMap(() => this.http.get<{ user: User }>(`${this.apiUrl}/profile`)),
            tap(response => {
              this.currentUserSubject.next(response.user);
              this.cacheUserProfile(response.user);
              console.log('[Auth] Profil créé et synchronisé:', response.user.email);
            }),
            map(response => response.user)
          );
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Créer l'utilisateur en base locale via /register
   */
  private provisionUser(): Observable<any> {
    return from(this.supabaseService.supabase.auth.getUser()).pipe(
      switchMap(({ data }) => {
        if (!data.user) {
          return throwError(() => new Error('Aucun utilisateur Supabase connecté'));
        }
        
        const payload = {
          supabaseUserId: data.user.id,
          email: data.user.email,
          nom: data.user.user_metadata?.['nom'] || '',
          prenom: data.user.user_metadata?.['prenom'] || data.user.email?.split('@')[0] || ''
        };
        
        console.log('[Auth] Appel /register avec:', payload);
        return this.http.post(`${this.apiUrl}/register`, payload);
      }),
      catchError(error => {
        console.error('[Auth] Erreur provisioning:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre en cache le profil utilisateur
   */
  private async cacheUserProfile(user: User): Promise<void> {
    try {
      await this.indexedDb.set('auth', 'user-profile', user, null, 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('[Auth] Erreur cache profil:', error);
    }
  }

  /**
   * Charger le profil depuis le cache
   */
  private async loadCachedProfile(): Promise<User | null> {
    try {
      return await this.indexedDb.get<User>('auth', 'user-profile', null);
    } catch (error) {
      console.error('[Auth] Erreur chargement cache:', error);
      return null;
    }
  }

  /**
   * Nettoyer le cache du profil
   */
  private async clearCachedProfile(): Promise<void> {
    try {
      await this.indexedDb.delete('auth', 'user-profile', null);
    } catch (error) {
      console.error('[Auth] Erreur nettoyage cache:', error);
    }
  }

  /**
   * S'assurer qu'un workspace est sélectionné
   */
  private ensureWorkspaceSelected(): void {
    const currentWorkspace = this.workspaceService.getCurrentWorkspace();
    if (currentWorkspace) {
      console.log('[Auth] Workspace déjà sélectionné:', currentWorkspace.name);
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}/workspaces/me`).subscribe({
      next: (workspaces) => {
        if (workspaces.length === 0) {
          console.warn('[Auth] Aucun workspace disponible');
          return;
        }

        const baseWorkspace = workspaces.find(w => w.name === 'BASE');
        const selectedWorkspace = baseWorkspace || workspaces[0];
        
        console.log('[Auth] Sélection auto workspace:', selectedWorkspace.name);
        this.workspaceService.setCurrentWorkspace(selectedWorkspace);
      },
      error: (err) => console.error('[Auth] Erreur chargement workspaces:', err)
    });
  }
}


