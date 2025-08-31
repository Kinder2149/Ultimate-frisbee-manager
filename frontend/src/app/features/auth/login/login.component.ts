/**
 * Composant de connexion
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  returnUrl = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Récupérer l'URL de retour si elle existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Si l'utilisateur est déjà connecté, le rediriger
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  /**
   * Soumettre le formulaire de connexion
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const credentials: LoginCredentials = {
        email: this.loginForm.value.email.trim().toLowerCase(),
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(`Bienvenue ${response.user.nom}!`, 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Rediriger vers l'URL de retour ou le dashboard
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error || 'Erreur de connexion', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  /**
   * Basculer la visibilité du mot de passe
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName === 'email' ? 'Email' : 'Mot de passe'} requis`;
    }
    
    if (field?.hasError('email')) {
      return 'Format d\'email invalide';
    }
    
    if (field?.hasError('minlength')) {
      return 'Mot de passe trop court (minimum 6 caractères)';
    }
    
    return '';
  }
}
