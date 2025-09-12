import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { take } from 'rxjs';
import { passwordMatchValidator } from '../../../settings/pages/profile/profile-page.component';

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
  resetForm: FormGroup;
  form: FormGroup;
  loading = false;
  state: 'enter-email' | 'answer-question' | 'success' = 'enter-email';
  error: string | null = null;
  securityQuestion: string | null = null;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      securityAnswer: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator() });
  }

  submitEmail(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.error = null;

    this.authService.getSecurityQuestion(this.form.value.email).pipe(take(1)).subscribe({
      next: (res) => {
        this.securityQuestion = res.securityQuestion;
        this.state = 'answer-question';
        this.loading = false;
      },
      error: (err) => {
        this.error = err || 'Aucun compte trouvé ou aucune question de sécurité définie.';
        this.loading = false;
      }
    });
  }

  submitReset(): void {
    if (this.resetForm.invalid) {
      return;
    }
    this.loading = true;
    this.error = null;

    const payload = {
      email: this.form.value.email,
      securityAnswer: this.resetForm.value.securityAnswer,
      newPassword: this.resetForm.value.password,
      confirmPassword: this.resetForm.value.confirmPassword
    };

    this.authService.resetPassword(payload).pipe(take(1)).subscribe({
      next: () => {
        this.state = 'success';
        this.loading = false;
      },
      error: (err) => {
        this.error = err || 'La réponse est incorrecte. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}
