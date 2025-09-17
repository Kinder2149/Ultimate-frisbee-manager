import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserProfileCardComponent } from '../../../../shared/ui/user-profile-card/user-profile-card.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Observable } from 'rxjs';
import { ApiUrlService } from '../../../../core/services/api-url.service';
import { take } from 'rxjs/operators';

// Validator function outside the class
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
  };
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    UserProfileCardComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  user$!: Observable<User | null>;
  loading = true;
  form!: FormGroup;
  passwordForm!: FormGroup;
  securityForm!: FormGroup;

  selectedFile: File | null = null;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(private authService: AuthService, private fb: FormBuilder, private snackBar: MatSnackBar, private apiUrlService: ApiUrlService) {}

  ngOnInit(): void {
    this.securityForm = this.fb.group({
      securityQuestion: ['', [Validators.required]],
      securityAnswer: ['', [Validators.required]]
    });
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator() });
    this.user$ = this.authService.currentUser$;
    // Charger user et initialiser le formulaire
    this.authService.getProfile().subscribe({
      next: (res) => {
        const user = res.user;
        this.form = this.fb.group({
          prenom: [user.prenom || '', [Validators.maxLength(50)]],
          nom: [user.nom || '', [Validators.maxLength(50)]],
          email: [user.email || '', [Validators.required, Validators.email]]
        });
        if (user.securityQuestion) {
          this.securityForm.patchValue({ securityQuestion: user.securityQuestion });
        }
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  submit(): void {
    if (!this.form || this.form.invalid) {
      this.form?.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: any = {
      prenom: raw.prenom?.trim(),
      nom: raw.nom?.trim(),
      email: raw.email?.trim().toLowerCase()
    };

    // Si un nouveau fichier a été sélectionné, l'ajouter au payload
    if (this.selectedFile) {
      payload.icon = this.selectedFile;
    }

    this.loading = true;
    this.authService.updateProfile(payload).pipe(take(1)).subscribe({
      next: (res) => {
        this.loading = false;
        // Re-synchroniser le formulaire avec les données serveur
        const u = res.user;
        this.form.patchValue({
          prenom: u.prenom || '',
          nom: u.nom || '',
          email: u.email || ''
        });
        this.snackBar.open('Profil mis à jour', 'Fermer', { duration: 2500, panelClass: ['success-snackbar'] });
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err || 'Échec de la mise à jour du profil', 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  resetForm(): void {
    this.user$.pipe(take(1)).subscribe(u => {
      if (!u) return;
      this.form.reset({
        prenom: u.prenom || '',
        nom: u.nom || '',
        email: u.email || ''
      });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = this.passwordForm.getRawValue();

    this.authService.changePassword(payload).pipe(take(1)).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Mot de passe mis à jour avec succès', 'Fermer', { duration: 3000, panelClass: ['success-snackbar'] });
        this.passwordForm.reset();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err || 'Échec de la mise à jour du mot de passe', 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  setSecurityQuestion(): void {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.authService.setSecurityQuestion(this.securityForm.value).pipe(take(1)).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Question de sécurité mise à jour', 'Fermer', { duration: 3000, panelClass: ['success-snackbar'] });
        this.securityForm.get('securityAnswer')?.reset();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err || 'Erreur lors de la mise à jour', 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  getAvatarUrl(path?: string | null): string | null {
    return this.apiUrlService.getMediaUrl(path, 'avatars');
  }


}
