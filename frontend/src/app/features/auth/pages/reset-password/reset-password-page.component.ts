import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../../shared/validators/password-validators';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';
import { AuthErrorComponent } from '../../shared/auth-error/auth-error.component';
import { AuthLoaderComponent } from '../../shared/auth-loader/auth-loader.component';
import { PasswordStrengthComponent } from '../../shared/password-strength/password-strength.component';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    AuthLayoutComponent,
    AuthErrorComponent,
    AuthLoaderComponent,
    PasswordStrengthComponent
  ],
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss']
})
export class ResetPasswordPageComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator() });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const newPassword = this.form.value.newPassword;

    this.authService.updatePassword(newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du mot de passe:', err);
        this.error = 'Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré ou est invalide.';
        this.loading = false;
      }
    });
  }
}
