/**
 * Module d'authentification
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Composants
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

// Composants partagés (standalone)
import { AuthLayoutComponent } from './shared/auth-layout/auth-layout.component';
import { AuthErrorComponent } from './shared/auth-error/auth-error.component';
import { AuthLoaderComponent } from './shared/auth-loader/auth-loader.component';
import { PasswordStrengthComponent } from './shared/password-strength/password-strength.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  }
];

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    
    // Angular Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    
    // Composants partagés standalone
    AuthLayoutComponent,
    AuthErrorComponent,
    AuthLoaderComponent,
    PasswordStrengthComponent
  ]
})
export class AuthModule { }
