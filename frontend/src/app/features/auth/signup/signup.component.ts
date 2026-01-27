import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  private passwordsMatchValidator(group: FormGroup) {
    const pwd = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pwd === confirm ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const email = this.signupForm.value.email.trim().toLowerCase();
    const password = this.signupForm.value.password;

    this.authService.signUp(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Compte créé ! Vérifiez vos emails pour confirmer votre inscription.', 'Fermer', {
          duration: 6000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[Signup] Erreur inscription:', error);
        
        if (error?.message?.includes('already registered')) {
          this.errorMessage = 'Cet email est déjà utilisé. Essayez de vous connecter.';
        } else if (error?.message?.includes('invalid email')) {
          this.errorMessage = 'Format d\'email invalide.';
        } else if (error?.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
        } else {
          this.errorMessage = 'Impossible de créer le compte. Veuillez réessayer.';
        }
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);

    if (fieldName === 'confirmPassword' && this.signupForm.hasError('passwordsMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }

    if (field?.hasError('required')) {
      if (fieldName === 'email') return 'Email requis';
      return 'Champ requis';
    }

    if (fieldName === 'email' && field?.hasError('email')) {
      return 'Format d\'email invalide';
    }

    if (fieldName === 'password' && field?.hasError('minlength')) {
      return 'Mot de passe trop court (minimum 6 caractères)';
    }

    return '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
