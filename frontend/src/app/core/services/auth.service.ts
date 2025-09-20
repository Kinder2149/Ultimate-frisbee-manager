import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { User, LoginCredentials } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private zone: NgZone
  ) {
    this.initializeAuthState(); // Vérifier l'état au démarrage
    this.supabaseService.supabase.auth.onAuthStateChange((event, session) => {
      this.zone.run(() => {
        this.handleAuthStateChange(event, session);
      });
    });
  }

  async initializeAuthState(): Promise<void> {
    const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
    this.updateUserState(session?.user || null);
  }

  private handleAuthStateChange(event: AuthChangeEvent, session: Session | null) {
    if (event === 'SIGNED_IN') {
      this.updateUserState(session?.user || null);
    } else if (event === 'SIGNED_OUT') {
      this.updateUserState(null);
      this.router.navigate(['/login']);
    } else if (event === 'TOKEN_REFRESHED') {
      // La session a été rafraîchie, on peut mettre à jour l'état si nécessaire
      this.updateUserState(session?.user || null);
    }
  }

  private updateUserState(supabaseUser: SupabaseUser | null) {
    if (supabaseUser) {
      // Mapper l'utilisateur Supabase vers notre modèle User
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        nom: supabaseUser.user_metadata['nom'] || '',
        prenom: supabaseUser.user_metadata['prenom'] || '',
        role: supabaseUser.user_metadata['role'] || 'USER',
        isActive: true, // A adapter si vous avez cette info
        iconUrl: supabaseUser.user_metadata['iconUrl'] || null,
      };
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  async login(credentials: LoginCredentials): Promise<any> {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }

    return data;
  }

  async logout(): Promise<void> {
    const { error } = await this.supabaseService.supabase.auth.signOut();
    if (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
    if (session?.user) {
      const supabaseUser = session.user;
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        nom: supabaseUser.user_metadata['nom'] || '',
        prenom: supabaseUser.user_metadata['prenom'] || '',
        role: supabaseUser.user_metadata['role'] || 'USER',
        isActive: true,
        iconUrl: supabaseUser.user_metadata['iconUrl'] || null,
      };
      return user;
    } 
    return null;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await this.supabaseService.supabase.auth.getSession();
    return session?.access_token || null;
  }
  
  // Les autres méthodes (changePassword, updateProfile, etc.) seront migrées plus tard
  // en utilisant les fonctions de Supabase Auth ou des Edge Functions.
}
