import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';
import { AuthErrorComponent } from '../../shared/auth-error/auth-error.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AuthLayoutComponent,
    AuthErrorComponent
  ],
  templateUrl: './confirm-email-page.component.html',
  styleUrls: ['./confirm-email-page.component.scss']
})
export class ConfirmEmailPageComponent implements OnInit {
  loading = true;
  success = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est maintenant authentifié
    // Supabase gère automatiquement la confirmation via l'URL
    setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.loading = false;
        this.success = true;
      } else {
        this.loading = false;
        this.error = 'La confirmation a échoué ou le lien a expiré. Veuillez réessayer.';
      }
    }, 2000);
  }

  goToDashboard(): void {
    this.router.navigate(['/']);
  }
}
