/**
 * Composant de connexion
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, throwError } from 'rxjs';
import { filter, takeUntil, finalize, catchError } from 'rxjs/operators';

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
      console.log('[Login] User already authenticated, redirecting to:', this.returnUrl);
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Réagir aux changements d'état d'authentification globaux.
    // Dès que l'utilisateur est considéré comme authentifié, on quitte la page de login.
    this.authService.isAuthenticated$
      .pipe(
        takeUntil(this.destroy$),
        filter(isAuth => isAuth === true)
      )
      .subscribe(() => {
        console.log('[Login] Authentication state changed, redirecting to:', this.returnUrl);
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

    // Essayer d'abord le backend local, puis Supabase si échec
    this.authService.loginWithBackend(credentials).pipe(
      catchError((backendError) => {
        // Si le backend échoue avec une erreur 401, c'est un problème d'authentification
        // Ne pas essayer Supabase dans ce cas, afficher l'erreur directement
        if (backendError?.status === 401) {
          return throwError(() => backendError);
        }
        // Pour les autres erreurs (500, timeout, etc.), essayer Supabase en fallback
        return this.authService.login(credentials);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        console.log('[Login] Login successful, redirecting to:', this.returnUrl);
        this.snackBar.open('Connexion réussie !', 'Fermer', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });

        // La redirection sera gérée automatiquement par l'observable isAuthenticated$
        // ou on force la navigation si nécessaire
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 100);
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        
        // Message d'erreur plus spécifique selon le code d'erreur
        let errorMessage = 'Email ou mot de passe incorrect.';
        
        if (error?.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect. Veuillez réessayer.';
        } else if (error?.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer dans quelques instants.';
        } else if (error?.status === 0) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
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
