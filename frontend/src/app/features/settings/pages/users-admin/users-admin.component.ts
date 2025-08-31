import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

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
    MatSnackBarModule
  ],
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss']
})
export class UsersAdminComponent implements OnInit {
  loading = true;
  users: UserRow[] = [];
  displayedColumns = ['avatar', 'name', 'email', 'role', 'active', 'actions'];
  // New user form model
  creating = false;
  newUser = {
    email: '',
    password: '',
    prenom: '',
    nom: '',
    role: 'user',
    isActive: true
  };

  constructor(private admin: AdminService, private snack: MatSnackBar) {}

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
    user._saving = true;
    this.admin.updateUser(user.id, { role: user.role, isActive: user.isActive }).subscribe({
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
  }

  createUser(): void {
    if (!this.newUser.email || !this.newUser.password || this.newUser.password.length < 6) {
      this.snack.open('Email et mot de passe (min 6) requis', 'Fermer', { duration: 3000 });
      return;
    }
    this.creating = true;
    this.admin.createUser({
      email: this.newUser.email.trim().toLowerCase(),
      password: this.newUser.password,
      nom: this.newUser.nom?.trim(),
      prenom: this.newUser.prenom?.trim(),
      role: this.newUser.role,
      isActive: this.newUser.isActive
    }).subscribe({
      next: (res) => {
        this.creating = false;
        this.users = [res.user, ...this.users];
        this.snack.open('Utilisateur créé', 'Fermer', { duration: 2500, panelClass: ['success-snackbar'] });
        this.newUser = { email: '', password: '', prenom: '', nom: '', role: 'user', isActive: true };
      },
      error: (err) => {
        this.creating = false;
        this.snack.open(err || 'Échec de la création', 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
