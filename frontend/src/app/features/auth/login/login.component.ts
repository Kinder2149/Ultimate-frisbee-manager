/**
 * Composant de connexion
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { filter, takeUntil, finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  returnUrl = '/';
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

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

    // Si l'utilisateur est déjà connecté, le rediriger immédiatement
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Réagir au moment où l'auth est réellement prête (profil + workspace).
    // Évite les redirections trop tôt qui forcent refresh/clics multiples.
    this.authService.authReady$
      .pipe(
        takeUntil(this.destroy$),
        filter(isReady => isReady === true)
      )
      .subscribe(() => {
        this.router.navigate([this.returnUrl]);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Soumettre le formulaire de connexion
   */
  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    
    const credentials: LoginCredentials = {
      email: this.loginForm.value.email.trim().toLowerCase(),
      password: this.loginForm.value.password
    };

    this.errorMessage = '';

    this.authService.login(credentials).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Connexion réussie !', 'Fermer', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });

        // La redirection sera gérée automatiquement par l'observable isAuthenticated$ (ligne 53-61)
      },
      error: (error) => {
        console.error('[Login] Erreur de connexion:', error);
        
        // Message d'erreur plus spécifique selon le type d'erreur
        if (error?.message?.includes('Invalid login credentials')) {
          this.errorMessage = 'Email ou mot de passe incorrect. Veuillez réessayer.';
        } else if (error?.message?.includes('Email not confirmed')) {
          this.errorMessage = 'Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.';
        } else if (error?.status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
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
