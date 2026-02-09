import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap, retry, delay } from 'rxjs/operators';
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

  private authReadySubject = new BehaviorSubject<boolean>(false);
  public authReady$ = this.authReadySubject.asObservable();

  private _initDone = false;
  private _isLoggingOut = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private supabaseService: SupabaseService,
    private workspaceService: WorkspaceService,
    private indexedDb: IndexedDbService,
    private ngZone: NgZone
  ) {
    this.initializeAuth();
  }

  /**
   * Initialisation de l'authentification au démarrage
   */
  private async initializeAuth(): Promise<void> {
    // Vérifier si une session Supabase existe AVANT d'enregistrer le listener
    const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
    
    if (session?.user) {
      console.log('[Auth] Session Supabase trouvée, chargement du profil');
      this.isAuthenticatedSubject.next(true);
      this.authReadySubject.next(false);
      
      // Charger le profil depuis le cache d'abord
      const cachedUser = await this.loadCachedProfile();
      if (cachedUser) {
        this.currentUserSubject.next(cachedUser);
      }
      
      // Synchroniser avec le backend ET s'assurer qu'un workspace est sélectionné
      this.syncUserProfile().pipe(
        switchMap(() => this.ensureWorkspaceSelected()),
        tap(() => {
          this._initDone = true;
          this.authReadySubject.next(true);
        })
      ).subscribe({
        next: () => {
          console.log('[Auth] Init complète : profil + workspace prêts');
        },
        error: (err) => {
          this._initDone = true;
          this.authReadySubject.next(false);
          console.error('[Auth] Erreur init auth:', err);
        }
      });
    } else {
      console.log('[Auth] Aucune session active');
      this._initDone = true;
      this.isAuthenticatedSubject.next(false);
      this.authReadySubject.next(false);
    }

    // Enregistrer le listener APRÈS getSession() pour éviter la double exécution
    this.listenToAuthStateChanges();
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
          return this.http.post<{ user: User }>(`${this.apiUrl}/register`, {
            supabaseUserId: data.user.id,
            email
          }).pipe(
            tap(response => {
              this.currentUserSubject.next(response.user);
              this.cacheUserProfile(response.user);
              console.log('[Auth] Profil backend créé:', response.user.email);
            }),
            map(() => void 0)
          );
        }
        
        return of(void 0);
      }),
      catchError(error => {
        console.error('[Auth] Erreur inscription:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Écouter les changements d'état d'authentification Supabase
   */
  private listenToAuthStateChanges(): void {
    this.supabaseService.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // Les callbacks Supabase peuvent se produire hors zone Angular.
        // On force l'exécution dans NgZone pour que Router + ChangeDetection réagissent immédiatement.
        this.ngZone.run(() => {
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
        });
      }
    );
  }

  /**
   * Gérer la connexion réussie
   */
  private handleSignedIn(session: Session | null): void {
    if (!session?.user) return;

    // Si initializeAuth() a déjà traité cette session, ne pas réexécuter
    if (this._initDone) {
      console.log('[Auth] SIGNED_IN ignoré : init déjà terminée');
      return;
    }
    
    console.log('[Auth] Connexion réussie:', session.user.email);
    this.isAuthenticatedSubject.next(true);
    this.authReadySubject.next(false);
    
    // Chaîner syncUserProfile → ensureWorkspaceSelected
    this.syncUserProfile().pipe(
      switchMap(() => this.ensureWorkspaceSelected()),
      tap(() => {
        this._initDone = true;
        this.authReadySubject.next(true);
      })
    ).subscribe({
      next: () => {
        console.log('[Auth] Profil et workspace prêts');
      },
      error: (err) => {
        this.authReadySubject.next(false);
        console.error('[Auth] Erreur sync profil après connexion:', err);
        // Si l'utilisateur n'existe pas en backend, rediriger vers signup
        if (err.status === 403) {
          console.error('[Auth] Profil utilisateur non trouvé en base');
          this.supabaseService.supabase.auth.signOut();
          this.router.navigate(['/login/signup'], {
            queryParams: { reason: 'profile-not-found' }
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
    this.authReadySubject.next(false);
    this._initDone = false;
    this.clearCachedProfile();
    this.workspaceService.clear();
    this.indexedDb.clearAll();
    this.router.navigate(['/login']);
    this._isLoggingOut = false;
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
   * Vérifier si un logout est en cours (utilisé par les interceptors)
   */
  get isLoggingOut(): boolean {
    return this._isLoggingOut;
  }

  /**
   * Déconnexion (idempotent : un seul logout à la fois)
   */
  logout(): Observable<void> {
    if (this._isLoggingOut) {
      console.log('[Auth] Logout déjà en cours, ignoré');
      return of(void 0);
    }
    this._isLoggingOut = true;

    return from(
      this.supabaseService.supabase.auth.signOut({ scope: 'local' })
    ).pipe(
      map(({ error }) => {
        if (error) {
          console.error('[Auth] Erreur déconnexion:', error);
        }
        // L'événement SIGNED_OUT gérera le nettoyage
        return;
      }),
      catchError(error => {
        this._isLoggingOut = false;
        return throwError(() => error);
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
    // Juste après SIGNED_IN, il peut y avoir une courte fenêtre où getSession()
    // renvoie encore null selon le navigateur / le timing (mobile notamment).
    // Retry rapide avec délai total max de 150ms.
    const delaysMs = [0, 50, 100];
    let lastError: any = null;

    for (const delayMs of delaysMs) {
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const { data, error } = await this.supabaseService.supabase.auth.getSession();

      if (error) {
        lastError = error;
        continue;
      }

      if (data.session?.access_token) {
        const token = data.session.access_token;

        // LOG DIAGNOSTIC - Décoder le header du token
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const header = JSON.parse(atob(parts[0]));
            console.log('[Frontend Auth] Token header:', {
              alg: header.alg,
              typ: header.typ,
              kid: header.kid
            });

            if (header.alg !== 'RS256') {
              console.warn('[Frontend Auth] Token alg différent de RS256:', header);
            } else {
              console.log('[Frontend Auth] ✅ Token RS256 correct');
            }
          }
        } catch (e) {
          console.error('[Frontend Auth] Erreur décodage token:', e);
        }

        return token;
      }
    }

    if (lastError) {
      console.error('[Frontend Auth] Erreur getSession:', lastError);
    } else {
      console.warn('[Frontend Auth] Token non disponible après 150ms');
    }

    return null;
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
    retry({
      count: 2,
      delay: (error, retryCount) => {
        console.log(`[Auth] Retry ${retryCount}/2 pour syncUserProfile`);
        return of(error).pipe(delay(1000));
      }
    }),
    tap(response => {
      this.currentUserSubject.next(response.user);
      this.cacheUserProfile(response.user);
      console.log('[Auth] Profil synchronisé:', response.user.email);
    }),
    map(response => response.user),
    catchError(error => {
      console.error('[Auth] Erreur sync profil:', error);
      
      // Si l'utilisateur n'existe pas en base (403), créer automatiquement le profil
      if (error.status === 403) {
        console.log('[Auth] Profil non trouvé, création automatique...');
        return this.createProfileFromSupabase().pipe(
          tap(user => {
            this.currentUserSubject.next(user);
            this.cacheUserProfile(user);
            console.log('[Auth] Profil créé automatiquement:', user.email);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
}

/**
 * Créer le profil backend à partir de la session Supabase
 */
private createProfileFromSupabase(): Observable<User> {
  return from(this.supabaseService.supabase.auth.getUser()).pipe(
    switchMap(({ data }) => {
      if (!data.user) {
        throw new Error('Aucun utilisateur Supabase trouvé');
      }
      
      return this.http.post<{ user: User }>(`${this.apiUrl}/register`, {
        supabaseUserId: data.user.id,
        email: data.user.email
      }).pipe(
        map(response => response.user)
      );
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
   * Retourne un Observable qui se complète une fois le workspace prêt
   */
  private ensureWorkspaceSelected(): Observable<void> {
    const currentWorkspace = this.workspaceService.getCurrentWorkspace();
    if (currentWorkspace) {
      console.log('[Auth] Workspace déjà sélectionné:', currentWorkspace.name);
      return of(void 0);
    }

    console.log('[Auth] Chargement des workspaces disponibles...');
    return this.http.get<any[]>(`${environment.apiUrl}/workspaces/me`).pipe(
      retry({
        count: 2,
        delay: (error, retryCount) => {
          console.log(`[Auth] Retry ${retryCount}/2 pour workspaces/me`);
          return of(error).pipe(delay(1000));
        }
      }),
      switchMap((workspaces) => {
        if (workspaces.length === 0) {
          console.warn('[Auth] Aucun workspace disponible');
          return of(void 0);
        }

        const baseWorkspace = workspaces.find(w => w.name === 'BASE');
        const selectedWorkspace = baseWorkspace || workspaces[0];

        console.log('[Auth] Sélection auto workspace:', selectedWorkspace.name);
        // skipReload=true pour éviter le rechargement page
        return from(this.workspaceService.setCurrentWorkspace(selectedWorkspace, true));
      }),
      map(() => void 0),
      catchError((err) => {
        console.error('[Auth] Erreur chargement workspaces:', err);
        // Ne pas bloquer l'authentification si les workspaces ne chargent pas
        return of(void 0);
      })
    );
  }

  /**
   * Mettre à jour un champ spécifique du profil utilisateur
   * Utilisé pour l'édition inline
   */
  updateUserField(fieldName: string, value: any): Observable<User> {
    const formData = new FormData();
    formData.append(fieldName, value);

    return this.http.put<{ user: User }>(`${this.apiUrl}/profile`, formData).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.cacheUserProfile(response.user);
        console.log(`[Auth] Champ ${fieldName} mis à jour:`, value);
      }),
      map(response => response.user),
      catchError(error => {
        console.error(`[Auth] Erreur mise à jour ${fieldName}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour l'avatar de l'utilisateur
   */
  updateAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('icon', file, file.name);

    return this.http.put<{ user: User }>(`${this.apiUrl}/profile`, formData).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.cacheUserProfile(response.user);
        console.log('[Auth] Avatar mis à jour');
      }),
      map(response => response.user),
      catchError(error => {
        console.error('[Auth] Erreur mise à jour avatar:', error);
        return throwError(() => error);
      })
    );
  }
}


