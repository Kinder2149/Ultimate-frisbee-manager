import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../../../core/services/admin.service';

export interface UserEditData {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  isActive: boolean;
  iconUrl?: string | null;
}

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.scss']
})
export class UserEditDialogComponent implements OnInit {
  editForm: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserEditData,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      prenom: [data.prenom || '', []],
      nom: [data.nom || '', []],
      email: [data.email, [Validators.required, Validators.email]],
      role: [data.role, [Validators.required]],
      isActive: [data.isActive],
      iconUrl: [data.iconUrl || '']
    });
  }

  ngOnInit(): void {}

  onSave(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 4000 });
      return;
    }

    this.saving = true;
    const formValue = this.editForm.value;

    // Préparer le payload (seulement les champs modifiés)
    const payload: any = {};
    
    if (formValue.prenom !== this.data.prenom) payload.prenom = formValue.prenom;
    if (formValue.nom !== this.data.nom) payload.nom = formValue.nom;
    if (formValue.email !== this.data.email) payload.email = formValue.email;
    if (formValue.role !== this.data.role) payload.role = formValue.role;
    if (formValue.isActive !== this.data.isActive) payload.isActive = formValue.isActive;
    if (formValue.iconUrl !== this.data.iconUrl) payload.iconUrl = formValue.iconUrl;

    // Si aucun changement
    if (Object.keys(payload).length === 0) {
      this.snackBar.open('Aucune modification détectée', '', { duration: 2000 });
      this.saving = false;
      return;
    }

    // Appel API
    this.adminService.updateUser(this.data.id, payload).subscribe({
      next: (response) => {
        this.snackBar.open('Utilisateur mis à jour avec succès', '', { duration: 3000 });
        this.dialogRef.close({ updated: true, user: response.user });
        this.saving = false;
      },
      error: (error) => {
        console.error('Erreur mise à jour utilisateur:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 4000 });
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ updated: false });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getEmailError(): string {
    const emailControl = this.editForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'L\'email est requis';
    }
    if (emailControl?.hasError('email')) {
      return 'Format d\'email invalide';
    }
    return '';
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';
  }
}
