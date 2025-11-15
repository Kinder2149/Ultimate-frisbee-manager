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

@Component({
  selector: 'app-forgot-password-page',
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
    MatIconModule
  ],
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss']
})
export class ForgotPasswordPageComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submitEmail(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.error = null;
    this.authService.requestPasswordReset(this.form.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        console.error('Erreur lors de la demande de réinitialisation de mot de passe:', err);
        this.error = 'Une erreur est survenue lors de l\'envoi du lien. Vérifiez l\'adresse e-mail ou réessayez plus tard.';
        this.loading = false;
      }
    });
  }
}
