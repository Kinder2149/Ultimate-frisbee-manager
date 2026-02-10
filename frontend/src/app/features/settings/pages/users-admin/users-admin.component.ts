import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { UserRole, UserRoleLabels } from '@ufm/shared';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '../../../../core/services/admin.service';
import { DialogService } from '../../../../shared/components/dialog/dialog.service';

interface UserRow {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  isActive: boolean;
  iconUrl?: string | null;
  createdAt: string;
  // local editing state
  _saving?: boolean;
}

@Component({
  selector: 'app-users-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss']
})
export class UsersAdminComponent implements OnInit {
  loading = true;
  users: UserRow[] = [];
  displayedColumns = ['avatar', 'name', 'role', 'active', 'workspaces', 'actions'];
  // New user form model
  creating = false;
  newUser = {
    email: '',
    password: '',
    prenom: '',
    nom: '',
    role: UserRole.USER,
    isActive: true
  };

  // Enum et labels pour le template
  UserRole = UserRole;
  UserRoleLabels = UserRoleLabels;

  constructor(
    private admin: AdminService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.admin.getUsers().subscribe({
      next: (res) => {
        this.users = res.users.map(u => ({ ...u }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open('Erreur de chargement des utilisateurs', 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  saveUser(user: UserRow): void {
    const message = `Vous allez enregistrer les modifications pour <strong>${user.prenom || ''} ${user.nom || ''}</strong><br>` +
      `Rôle global : <strong>${user.role === UserRole.ADMIN ? 'ADMIN' : 'USER'}</strong><br>` +
      `Statut : <strong>${user.isActive ? 'Actif' : 'Inactif'}</strong>`;

    this.dialogService
      .confirm(
        'Confirmer la mise à jour de l\'utilisateur',
        message,
        'Enregistrer',
        'Annuler'
      )
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        user._saving = true;
        this.admin.updateUser(user.id, { role: user.role?.toUpperCase(), isActive: user.isActive }).subscribe({
          next: (res) => {
            user._saving = false;
            // sync with server response
            user.role = res.user.role;
            user.isActive = res.user.isActive;
            this.snack.open('Utilisateur mis à jour', 'Fermer', { duration: 2500, panelClass: ['success-snackbar'] });
          },
          error: (err) => {
            user._saving = false;
            this.snack.open(err || "Échec de la mise à jour de l'utilisateur", 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        });
      });
  }

  createUser(): void {
    if (!this.newUser.email || !this.newUser.password || this.newUser.password.length < 6) {
      this.snack.open('Email et mot de passe (min 6) requis', 'Fermer', { duration: 3000 });
      return;
    }
    const message = `Vous allez créer un nouvel utilisateur pour <strong>${this.newUser.email.trim().toLowerCase()}</strong><br>` +
      `Nom complet : <strong>${(this.newUser.prenom || '') + ' ' + (this.newUser.nom || '')}</strong><br>` +
      `Rôle global : <strong>${this.newUser.role === UserRole.ADMIN ? 'ADMIN' : 'USER'}</strong><br>` +
      `Statut : <strong>${this.newUser.isActive ? 'Actif' : 'Inactif'}</strong>`;

    this.dialogService
      .confirm(
        'Confirmer la création de l\'utilisateur',
        message,
        'Créer l\'utilisateur',
        'Annuler'
      )
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.creating = true;
        this.admin.createUser({
          email: this.newUser.email.trim().toLowerCase(),
          password: this.newUser.password,
          nom: this.newUser.nom?.trim(),
          prenom: this.newUser.prenom?.trim(),
          role: this.newUser.role?.toUpperCase(),
          isActive: this.newUser.isActive
        }).subscribe({
          next: (res) => {
            this.creating = false;
            this.users = [res.user, ...this.users];
            this.snack.open('Utilisateur créé', 'Fermer', { duration: 2500, panelClass: ['success-snackbar'] });
            this.newUser = { email: '', password: '', prenom: '', nom: '', role: UserRole.USER, isActive: true };
          },
          error: (err) => {
            this.creating = false;
            this.snack.open(err || 'Échec de la création', 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        });
      });
  }

  resetForm(): void {
    this.newUser = {
      email: '',
      password: '',
      prenom: '',
      nom: '',
      role: UserRole.USER,
      isActive: true
    };
  }

  openUserWorkspaces(user: UserRow): void {
    this.dialog.open(UserWorkspacesDialogComponent, {
      width: '600px',
      data: { userId: user.id, email: user.email, nom: user.nom, prenom: user.prenom }
    });
  }
}

import { Component as DialogComponent, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminWorkspaceSummary, AdminWorkspaceUser } from '../../../../core/services/admin.service';

interface UserWorkspacesDialogData {
  userId: string;
  email: string;
  nom?: string;
  prenom?: string;
}

@DialogComponent({
  selector: 'app-user-workspaces-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './user-workspaces-dialog.component.html',
  styleUrls: ['./user-workspaces-dialog.component.scss']
})
export class UserWorkspacesDialogComponent {
  workspaces: AdminWorkspaceSummary[] = [];
  memberships: { [workspaceId: string]: AdminWorkspaceUser | null } = {};
  loading = true;
  saving = false;

  constructor(
    private admin: AdminService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<UserWorkspacesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserWorkspacesDialogData
  ) {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.admin.getWorkspaces().subscribe({
      next: (ws) => {
        this.workspaces = ws;
        // Charger les membres pour chaque workspace afin de savoir si l'utilisateur y est
        let remaining = ws.length;
        if (remaining === 0) {
          this.loading = false;
          return;
        }
        ws.forEach(w => {
          this.admin.getWorkspaceUsers(w.id).subscribe({
            next: (res) => {
              const found = res.users.find(u => u.userId === this.data.userId) || null;
              this.memberships[w.id] = found;
              remaining--;
              if (remaining === 0) this.loading = false;
            },
            error: () => {
              this.memberships[w.id] = null;
              remaining--;
              if (remaining === 0) this.loading = false;
            }
          });
        });
      },
      error: () => {
        this.loading = false;
        this.snack.open('Erreur lors du chargement des workspaces', 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  isInWorkspace(wsId: string): boolean {
    return !!this.memberships[wsId];
  }

  toggleWorkspace(wsId: string, event: any): void {
    if (!event.checked) {
      this.memberships[wsId] = null;
    } else {
      this.memberships[wsId] = {
        userId: this.data.userId,
        email: this.data.email,
        nom: this.data.nom,
        prenom: this.data.prenom,
        role: 'MEMBER',
        linkId: ''
      } as AdminWorkspaceUser;
    }
  }

  changeRole(wsId: string, role: string): void {
    const m = this.memberships[wsId];
    if (m) {
      m.role = role;
    }
  }

  save(): void {
    this.saving = true;
    let remaining = this.workspaces.length;
    if (remaining === 0) {
      this.saving = false;
      this.dialogRef.close(true);
      return;
    }
    this.workspaces.forEach(ws => {
      const membersArray: AdminWorkspaceUser[] = [];
      const m = this.memberships[ws.id];
      if (m) {
        membersArray.push(m);
      }
      const payload = membersArray.map(u => ({ userId: u.userId, role: u.role || 'MEMBER' }));
      this.admin.setWorkspaceUsers(ws.id, payload).subscribe({
        next: () => {
          remaining--;
          if (remaining === 0) {
            this.saving = false;
            this.snack.open('Workspaces de l\'utilisateur mis à jour', 'Fermer', { duration: 2500, panelClass: ['success-snackbar'] });
            this.dialogRef.close(true);
          }
        },
        error: () => {
          remaining--;
          if (remaining === 0) {
            this.saving = false;
            this.snack.open('Erreur lors de la mise à jour des workspaces', 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
            this.dialogRef.close(false);
          }
        }
      });
    });
  }
}
