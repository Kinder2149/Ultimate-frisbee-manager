import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { AdminService, AdminWorkspaceSummary, AdminWorkspaceUser } from '../../../../core/services/admin.service';
import { DialogService } from '../../../../shared/components/dialog/dialog.service';

@Component({
  selector: 'app-admin-workspaces-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatListModule,
    MatCheckboxModule
  ],
  templateUrl: './admin-workspaces-page.component.html',
  styleUrls: ['./admin-workspaces-page.component.scss']
})
export class AdminWorkspacesPageComponent implements OnInit {
  workspaces: AdminWorkspaceSummary[] = [];
  displayedColumns = ['name', 'membersCount', 'createdAt', 'actions'];

  loading = false;
  error: string | null = null;

  // Création / édition
  newWorkspaceName = '';
  editingWorkspace: AdminWorkspaceSummary | null = null;
  editName = '';

  // Gestion des utilisateurs pour la base sélectionnée
  selectedWorkspace: AdminWorkspaceSummary | null = null;
  workspaceUsers: AdminWorkspaceUser[] = [];

  // Liste des utilisateurs globaux (pour sélection)
  allUsers: { id: string; email: string; nom?: string; prenom?: string }[] = [];

  // États de chargement ponctuels pour améliorer l'UX
  creating = false;
  savingWorkspace = false;
  deletingWorkspaceId: string | null = null;
  savingUsers = false;

  constructor(
    private adminService: AdminService,
    private snack: MatSnackBar,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
    this.loadAllUsers();
  }

  loadWorkspaces(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getWorkspaces().subscribe({
      next: (ws: AdminWorkspaceSummary[]) => {
        this.workspaces = ws;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Erreur chargement workspaces', err);
        this.error = 'Erreur lors du chargement des bases';
        this.loading = false;
      }
    });
  }

  loadAllUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (res: { users: Array<{ id: string; email: string; nom?: string; prenom?: string }> }) => {
        this.allUsers = res.users.map((u: { id: string; email: string; nom?: string; prenom?: string }) => ({
          id: u.id,
          email: u.email,
          nom: u.nom,
          prenom: u.prenom
        }));
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
      }
    });
  }

  createWorkspace(): void {
    const name = this.newWorkspaceName.trim();
    if (!name) {
      this.snack.open('Le nom de la base est requis', 'Fermer', { duration: 3000 });
      return;
    }
    const message = `Vous allez créer une nouvelle base nommée : <strong>${name}</strong>.<br>` +
      'Vous pourrez ensuite y ajouter des utilisateurs et gérer leurs droits locaux.';

    this.dialogService
      .confirm(
        'Confirmer la création de la base',
        message,
        'Créer la base',
        'Annuler'
      )
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.creating = true;
        this.adminService.createWorkspace({ name }).subscribe({
          next: () => {
            this.creating = false;
            this.newWorkspaceName = '';
            this.loadWorkspaces();
            this.snack.open('Base créée', 'Fermer', { duration: 2000 });
          },
          error: (err) => {
            this.creating = false;
            console.error('Erreur création workspace', err);
            this.snack.open('Erreur lors de la création de la base', 'Fermer', { duration: 4000 });
          }
        });
      });
  }

  startEdit(ws: AdminWorkspaceSummary): void {
    this.editingWorkspace = ws;
    this.editName = ws.name;
  }

  saveEdit(): void {
    if (!this.editingWorkspace) return;
    const name = this.editName.trim();
    if (!name) {
      this.snack.open('Le nom de la base ne peut pas être vide', 'Fermer', { duration: 3000 });
      return;
    }
    // Si le nom n'a pas changé, on annule simplement l'édition
    if (name === this.editingWorkspace.name) {
      this.editingWorkspace = null;
      this.editName = '';
      return;
    }

    const message =
      `Vous allez renommer la base <strong>${this.editingWorkspace.name}</strong> en ` +
      `<strong>${name}</strong>.`;

    this.dialogService
      .confirm(
        'Confirmer le renommage de la base',
        message,
        'Enregistrer',
        'Annuler'
      )
      .subscribe((confirmed) => {
        if (!confirmed || !this.editingWorkspace) {
          return;
        }

        this.savingWorkspace = true;
        this.adminService.updateWorkspace(this.editingWorkspace.id, { name }).subscribe({
          next: () => {
            this.savingWorkspace = false;
            this.editingWorkspace = null;
            this.editName = '';
            this.loadWorkspaces();
            this.snack.open('Base mise à jour', 'Fermer', { duration: 2000 });
          },
          error: (err) => {
            this.savingWorkspace = false;
            console.error('Erreur mise à jour workspace', err);
            this.snack.open('Erreur lors de la mise à jour de la base', 'Fermer', { duration: 4000 });
          }
        });
      });
  }

  cancelEdit(): void {
    this.editingWorkspace = null;
    this.editName = '';
  }

  deleteWorkspace(ws: AdminWorkspaceSummary): void {
    const message =
      `Vous allez supprimer définitivement la base <strong>${ws.name}</strong> et toutes les données associées (contenus, membres, etc.).<br>` +
      '<strong>Cette action est irréversible.</strong>';

    this.dialogService
      .confirm(
        'Confirmer la suppression de la base',
        message,
        'Supprimer la base',
        'Annuler',
        true
      )
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.deletingWorkspaceId = ws.id;
        this.adminService.deleteWorkspace(ws.id).subscribe({
          next: () => {
            if (this.selectedWorkspace?.id === ws.id) {
              this.selectedWorkspace = null;
              this.workspaceUsers = [];
            }
            this.deletingWorkspaceId = null;
            this.loadWorkspaces();
            this.snack.open('Base supprimée', 'Fermer', { duration: 2000 });
          },
          error: (err) => {
            this.deletingWorkspaceId = null;
            console.error('Erreur suppression workspace', err);
            this.snack.open('Erreur lors de la suppression de la base', 'Fermer', { duration: 4000 });
          }
        });
      });
  }

  selectWorkspace(ws: AdminWorkspaceSummary): void {
    this.selectedWorkspace = ws;
    this.loadWorkspaceUsers(ws.id);
  }

  loadWorkspaceUsers(id: string): void {
    this.adminService.getWorkspaceUsers(id).subscribe({
      next: (res: { workspaceId: string; name: string; users: AdminWorkspaceUser[] }) => {
        this.workspaceUsers = res.users;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs workspace', err);
        this.snack.open('Erreur lors du chargement des utilisateurs de la base', 'Fermer', { duration: 4000 });
      }
    });
  }

  setUserRole(userId: string, role: string): void {
    const existing = this.workspaceUsers.find((u) => u.userId === userId);
    if (existing) {
      existing.role = role;
    } else if (this.selectedWorkspace) {
      const baseInfo = this.allUsers.find((u) => u.id === userId);
      this.workspaceUsers.push({
        userId,
        email: baseInfo?.email || '',
        nom: baseInfo?.nom,
        prenom: baseInfo?.prenom,
        role,
        linkId: ''
      });
    }
  }

  isUserInWorkspace(userId: string): boolean {
    return this.workspaceUsers.some((u) => u.userId === userId);
  }

  getWorkspaceUserRole(userId: string): string {
    const u = this.workspaceUsers.find((w) => w.userId === userId);
    return u?.role || 'USER';
  }

  toggleUserInWorkspace(userId: string, event: MatCheckboxChange): void {
    const checked = event.checked;
    if (!checked) {
      this.workspaceUsers = this.workspaceUsers.filter((u) => u.userId !== userId);
    } else {
      // Par défaut, rôle USER
      this.setUserRole(userId, 'USER');
    }
  }

  saveWorkspaceUsers(): void {
    if (!this.selectedWorkspace) return;
    const payload = this.workspaceUsers.map((u) => ({ userId: u.userId, role: u.role || 'USER' }));
    const message =
      `Vous allez enregistrer les membres de la base <strong>${this.selectedWorkspace.name}</strong>.<br>` +
      'Les ajouts / retraits d’utilisateurs et les rôles locaux seront appliqués.';

    this.dialogService
      .confirm(
        'Confirmer la mise à jour des membres',
        message,
        'Enregistrer les membres',
        'Annuler'
      )
      .subscribe((confirmed) => {
        if (!confirmed || !this.selectedWorkspace) {
          return;
        }

        this.savingUsers = true;
        this.adminService.setWorkspaceUsers(this.selectedWorkspace.id, payload).subscribe({
          next: () => {
            this.savingUsers = false;
            this.snack.open('Utilisateurs de la base mis à jour', 'Fermer', { duration: 2000 });
            this.loadWorkspaceUsers(this.selectedWorkspace!.id);
          },
          error: (err) => {
            this.savingUsers = false;
            console.error('Erreur mise à jour utilisateurs workspace', err);
            this.snack.open('Erreur lors de la mise à jour des utilisateurs de la base', 'Fermer', { duration: 4000 });
          }
        });
      });
  }
}
