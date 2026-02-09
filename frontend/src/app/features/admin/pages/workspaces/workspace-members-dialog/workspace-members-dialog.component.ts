import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AdminService, AdminWorkspaceUser } from '../../../../../core/services/admin.service';
import { DataCacheService } from '../../../../../core/services/data-cache.service';

type GlobalUser = { id: string; email: string; nom?: string; prenom?: string; role?: string; isActive?: boolean };

export interface WorkspaceMembersDialogData {
  workspaceId: string;
  workspaceName?: string;
}

export interface WorkspaceMembersDialogResult {
  updated: boolean;
}

type AdminUsersResponse = { users: GlobalUser[] };
type WorkspaceUsersResponse = { users: AdminWorkspaceUser[] };

@Component({
  selector: 'app-workspace-members-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="dialog">
      <div class="header">
        <h2>Gérer les membres</h2>
        <div class="subtitle" *ngIf="data.workspaceName">{{ data.workspaceName }}</div>
      </div>

      <div *ngIf="loading" class="loading">
        <mat-spinner diameter="36"></mat-spinner>
        <div>Chargement…</div>
      </div>

      <div *ngIf="!loading" class="content">
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Rechercher un utilisateur</mat-label>
          <input matInput [(ngModel)]="search" placeholder="email, prénom, nom…" />
          <button mat-icon-button matSuffix *ngIf="search" (click)="search=''">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>

        <div class="list" *ngIf="filteredUsers.length > 0">
          <div class="row" *ngFor="let u of filteredUsers">
            <mat-checkbox
              [checked]="isUserInWorkspace(u.id)"
              (change)="toggleUser(u.id, $event)"
            >
              <span class="who">
                <span class="email">{{ u.email }}</span>
                <span class="name" *ngIf="(u.prenom || u.nom)">({{ formatUserName(u.prenom, u.nom) }})</span>
              </span>
            </mat-checkbox>

            <mat-form-field appearance="outline" class="role" *ngIf="isUserInWorkspace(u.id)">
              <mat-label>Rôle</mat-label>
              <mat-select [ngModel]="getWorkspaceUserRole(u.id)" (ngModelChange)="setUserRole(u.id, $event)">
                <mat-option value="VIEWER">Lecteur</mat-option>
                <mat-option value="MEMBER">Membre</mat-option>
                <mat-option value="MANAGER">Gestionnaire</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="empty" *ngIf="filteredUsers.length === 0">
          Aucun utilisateur ne correspond.
        </div>
      </div>

      <div class="actions">
        <button mat-button (click)="close(false)" [disabled]="saving">Annuler</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="saving || loading">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog { display:flex; flex-direction:column; gap:16px; padding: 8px; }
      .header h2 { margin:0; font-size:20px; font-weight:600; }
      .subtitle { color:#64748b; font-size:13px; }
      .loading { display:flex; align-items:center; gap:12px; padding: 8px 0; }
      .content { display:flex; flex-direction:column; gap:12px; }
      .list { display:flex; flex-direction:column; gap:8px; max-height: 55vh; overflow:auto; padding-right: 4px; }
      .row { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .who { display:inline-flex; gap:6px; align-items:baseline; }
      .email { font-weight:600; }
      .name { color:#64748b; font-size:12px; }
      .role { width: 160px; }
      .actions { display:flex; justify-content:flex-end; gap:12px; padding-top: 4px; }
      .empty { color:#64748b; font-size:13px; padding: 8px 0; }
    `,
  ],
})
export class WorkspaceMembersDialogComponent implements OnInit {
  loading = true;
  saving = false;

  search = '';
  allUsers: GlobalUser[] = [];
  workspaceUsers: AdminWorkspaceUser[] = [];

  constructor(
    private adminService: AdminService,
    private cache: DataCacheService,
    private dialogRef: MatDialogRef<WorkspaceMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkspaceMembersDialogData,
    private snackBar: MatSnackBar
  ) {}

  formatUserName(prenom?: string, nom?: string): string {
    return [prenom, nom].filter((v) => !!v).join(' ');
  }

  ngOnInit(): void {
    this.loading = true;

    this.adminService.getUsers().subscribe({
      next: (res: AdminUsersResponse) => {
        this.allUsers = (res.users || []) as any;
        this.adminService.getWorkspaceUsers(this.data.workspaceId).subscribe({
          next: (wsRes: WorkspaceUsersResponse) => {
            this.workspaceUsers = (wsRes.users || []).map((u) => ({
              ...u,
              role: u.role?.toUpperCase() || 'MEMBER',
            }));
            this.loading = false;
          },
          error: () => {
            this.workspaceUsers = [];
            this.loading = false;
          },
        });
      },
      error: () => {
        this.allUsers = [];
        this.loading = false;
      },
    });
  }

  get filteredUsers(): GlobalUser[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.allUsers;

    return this.allUsers.filter((u) => {
      const email = (u.email || '').toLowerCase();
      const prenom = (u.prenom || '').toLowerCase();
      const nom = (u.nom || '').toLowerCase();
      return email.includes(q) || prenom.includes(q) || nom.includes(q);
    });
  }

  isUserInWorkspace(userId: string): boolean {
    return this.workspaceUsers.some((u) => u.userId === userId);
  }

  getWorkspaceUserRole(userId: string): string {
    const u = this.workspaceUsers.find((w) => w.userId === userId);
    return u?.role?.toUpperCase() || 'MEMBER';
  }

  setUserRole(userId: string, role: string): void {
    const existing = this.workspaceUsers.find((u) => u.userId === userId);
    if (existing) {
      existing.role = role?.toUpperCase() || 'MEMBER';
      return;
    }

    const baseInfo = this.allUsers.find((u) => u.id === userId);
    this.workspaceUsers.push({
      userId,
      email: baseInfo?.email || '',
      nom: baseInfo?.nom,
      prenom: baseInfo?.prenom,
      role: role?.toUpperCase() || 'MEMBER',
      linkId: '',
    });
  }

  toggleUser(userId: string, event: MatCheckboxChange): void {
    const checked = event.checked;
    if (!checked) {
      this.workspaceUsers = this.workspaceUsers.filter((u) => u.userId !== userId);
      return;
    }
    this.setUserRole(userId, 'MEMBER');
  }

  save(): void {
    if (this.loading || this.saving) return;

    const payload = this.workspaceUsers.map((u) => ({
      userId: u.userId,
      role: u.role?.toUpperCase() || 'MEMBER',
    }));

    this.saving = true;
    this.adminService.setWorkspaceUsers(this.data.workspaceId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.cache.invalidate('workspaces-list', 'workspaces');
        this.close(true);
      },
      error: (err: any) => {
        this.saving = false;
        console.error('Erreur mise à jour membres workspace:', err);
        this.snackBar.open('Erreur lors de la mise à jour des membres', 'Fermer', { duration: 4500 });
      },
    });
  }

  close(updated: boolean): void {
    const result: WorkspaceMembersDialogResult = { updated };
    this.dialogRef.close(result);
  }
}
