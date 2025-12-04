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
import { AdminService, AdminWorkspaceSummary, AdminWorkspaceUser } from '../../../../core/services/admin.service';

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
    MatListModule
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

  constructor(
    private adminService: AdminService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
    this.loadAllUsers();
  }

  loadWorkspaces(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getWorkspaces().subscribe({
      next: (ws) => {
        this.workspaces = ws;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement workspaces', err);
        this.error = 'Erreur lors du chargement des bases';
        this.loading = false;
      }
    });
  }

  loadAllUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.allUsers = res.users.map((u) => ({
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
    this.adminService.createWorkspace({ name }).subscribe({
      next: () => {
        this.newWorkspaceName = '';
        this.loadWorkspaces();
        this.snack.open('Base créée', 'Fermer', { duration: 2000 });
      },
      error: (err) => {
        console.error('Erreur création workspace', err);
        this.snack.open('Erreur lors de la création de la base', 'Fermer', { duration: 4000 });
      }
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
    this.adminService.updateWorkspace(this.editingWorkspace.id, { name }).subscribe({
      next: () => {
        this.editingWorkspace = null;
        this.editName = '';
        this.loadWorkspaces();
        this.snack.open('Base mise à jour', 'Fermer', { duration: 2000 });
      },
      error: (err) => {
        console.error('Erreur mise à jour workspace', err);
        this.snack.open('Erreur lors de la mise à jour de la base', 'Fermer', { duration: 4000 });
      }
    });
  }

  cancelEdit(): void {
    this.editingWorkspace = null;
    this.editName = '';
  }

  deleteWorkspace(ws: AdminWorkspaceSummary): void {
    if (!confirm(`Supprimer la base "${ws.name}" et toutes ses données ?`)) {
      return;
    }
    this.adminService.deleteWorkspace(ws.id).subscribe({
      next: () => {
        if (this.selectedWorkspace?.id === ws.id) {
          this.selectedWorkspace = null;
          this.workspaceUsers = [];
        }
        this.loadWorkspaces();
        this.snack.open('Base supprimée', 'Fermer', { duration: 2000 });
      },
      error: (err) => {
        console.error('Erreur suppression workspace', err);
        this.snack.open('Erreur lors de la suppression de la base', 'Fermer', { duration: 4000 });
      }
    });
  }

  selectWorkspace(ws: AdminWorkspaceSummary): void {
    this.selectedWorkspace = ws;
    this.loadWorkspaceUsers(ws.id);
  }

  loadWorkspaceUsers(id: string): void {
    this.adminService.getWorkspaceUsers(id).subscribe({
      next: (res) => {
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

  toggleUserInWorkspace(userId: string, checked: boolean): void {
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
    this.adminService.setWorkspaceUsers(this.selectedWorkspace.id, payload).subscribe({
      next: () => {
        this.snack.open('Utilisateurs de la base mis à jour', 'Fermer', { duration: 2000 });
        this.loadWorkspaceUsers(this.selectedWorkspace!.id);
      },
      error: (err) => {
        console.error('Erreur mise à jour utilisateurs workspace', err);
        this.snack.open('Erreur lors de la mise à jour des utilisateurs de la base', 'Fermer', { duration: 4000 });
      }
    });
  }
}
