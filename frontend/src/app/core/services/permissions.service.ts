import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { WorkspaceService } from './workspace.service';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

export type WorkspaceRole = 'MANAGER' | 'MEMBER' | 'VIEWER' | null;

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private currentUser: User | null = null;

  constructor(
    private workspaceService: WorkspaceService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  /**
   * Récupère le rôle workspace actuel
   */
  getCurrentRole(): WorkspaceRole {
    const workspace = this.workspaceService.getCurrentWorkspace();
    const role = workspace?.role?.toUpperCase();
    return (role as WorkspaceRole) || null;
  }

  /**
   * Observable du rôle workspace actuel
   */
  getCurrentRole$(): Observable<WorkspaceRole> {
    return this.workspaceService.currentWorkspace$.pipe(
      map(workspace => {
        const role = workspace?.role?.toUpperCase();
        return (role as WorkspaceRole) || null;
      })
    );
  }

  /**
   * Vérifie si l'utilisateur est ADMIN plateforme
   */
  isAdmin(): boolean {
    return this.currentUser?.role?.toUpperCase() === 'ADMIN';
  }

  /**
   * Vérifie si l'utilisateur est Testeur
   */
  isTester(): boolean {
    return this.currentUser?.isTester === true;
  }

  /**
   * Vérifie si le workspace actuel est BASE
   */
  isBaseWorkspace(): boolean {
    const workspace = this.workspaceService.getCurrentWorkspace();
    return workspace?.isBase === true;
  }

  /**
   * Vérifie si l'utilisateur peut créer du contenu
   * MANAGER et MEMBER peuvent créer
   */
  canCreate(): boolean {
    const role = this.getCurrentRole();
    return role === 'MANAGER' || role === 'MEMBER';
  }

  /**
   * Vérifie si l'utilisateur peut modifier du contenu
   * MANAGER et MEMBER peuvent modifier
   */
  canEdit(): boolean {
    const role = this.getCurrentRole();
    return role === 'MANAGER' || role === 'MEMBER';
  }

  /**
   * Vérifie si l'utilisateur peut supprimer du contenu
   * MANAGER et MEMBER peuvent supprimer
   */
  canDelete(): boolean {
    const role = this.getCurrentRole();
    return role === 'MANAGER' || role === 'MEMBER';
  }

  /**
   * Vérifie si l'utilisateur peut gérer les membres du workspace
   * Seul MANAGER peut gérer les membres
   */
  canManageMembers(): boolean {
    const role = this.getCurrentRole();
    return role === 'MANAGER';
  }

  /**
   * Vérifie si l'utilisateur peut modifier les réglages du workspace
   * Seul MANAGER peut modifier les réglages
   */
  canManageSettings(): boolean {
    const role = this.getCurrentRole();
    return role === 'MANAGER';
  }

  /**
   * Vérifie si l'utilisateur peut exporter
   * Seul ADMIN peut exporter
   */
  canExport(): boolean {
    return this.isAdmin();
  }

  /**
   * Vérifie si l'utilisateur peut modifier la BASE
   * Seul ADMIN peut modifier la BASE
   */
  canMutateBase(): boolean {
    return this.isBaseWorkspace() ? this.isAdmin() : true;
  }

  /**
   * Vérifie si l'utilisateur peut effectuer une action d'écriture
   * Combine les vérifications de rôle et de BASE
   */
  canWrite(): boolean {
    if (this.isBaseWorkspace() && !this.isAdmin()) {
      return false;
    }
    return this.canEdit();
  }

  /**
   * Retourne un message d'erreur approprié selon le contexte
   */
  getPermissionDeniedMessage(): string {
    const role = this.getCurrentRole();
    const isBase = this.isBaseWorkspace();

    if (isBase && !this.isAdmin()) {
      return 'Modification interdite : le workspace BASE est réservé aux administrateurs';
    }

    if (role === 'VIEWER') {
      return 'Action non autorisée : vous avez un accès en lecture seule';
    }

    if (!role) {
      return 'Action non autorisée : vous n\'avez pas de rôle dans ce workspace';
    }

    return 'Action non autorisée : permissions insuffisantes';
  }

  /**
   * Retourne le libellé du rôle pour affichage
   */
  getRoleLabel(role?: WorkspaceRole): string {
    const r = role || this.getCurrentRole();
    switch (r) {
      case 'MANAGER':
        return 'Gestionnaire';
      case 'MEMBER':
        return 'Membre';
      case 'VIEWER':
        return 'Lecteur';
      case null:
        return 'Aucun rôle';
      default:
        return r;
    }
  }
}
