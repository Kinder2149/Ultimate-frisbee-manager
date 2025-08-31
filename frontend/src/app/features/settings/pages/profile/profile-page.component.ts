import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserProfileCardComponent } from '../../../../shared/ui/user-profile-card/user-profile-card.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

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
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    UserProfileCardComponent
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  user$!: Observable<User | null>;
  loading = true;
  form!: FormGroup;
  isAdmin = false;
  selectedFile: File | null = null;

  constructor(private authService: AuthService, private fb: FormBuilder, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.user$ = this.authService.currentUser$;
    // Charger user et initialiser le formulaire
    this.authService.getProfile().subscribe({
      next: (res) => {
        const user = res.user;
        this.isAdmin = (user.role || '').toLowerCase() === 'admin';
        this.form = this.fb.group({
          prenom: [user.prenom || '', [Validators.maxLength(50)]],
          nom: [user.nom || '', [Validators.maxLength(50)]],
          email: [user.email || '', [Validators.required, Validators.email]],
          iconUrl: [user.iconUrl || '', [Validators.maxLength(200)]],
          password: ['', [Validators.minLength(6)]], // optionnel
          // Champs admin
          role: [user.role || 'user'],
          isActive: [!!user.isActive]
        });
        if (!this.isAdmin) {
          this.form.get('role')?.disable();
          this.form.get('isActive')?.disable();
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

    // Construire le payload en excluant les champs admin si non-admin
    const raw = this.form.getRawValue();
    const payload: any = {
      prenom: raw.prenom?.trim(),
      nom: raw.nom?.trim(),
      email: raw.email?.trim().toLowerCase(),
      iconUrl: raw.iconUrl?.trim()
    };
    if (raw.password) payload.password = raw.password;
    if (this.isAdmin) {
      payload.role = raw.role;
      payload.isActive = !!raw.isActive;
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
          email: u.email || '',
          iconUrl: u.iconUrl || '',
          password: '',
          role: u.role || 'user',
          isActive: !!u.isActive
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
        email: u.email || '',
        iconUrl: u.iconUrl || '',
        password: '',
        role: u.role || 'user',
        isActive: !!u.isActive
      });
      if (!this.isAdmin) {
        this.form.get('role')?.disable();
        this.form.get('isActive')?.disable();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadIcon(): void {
    if (!this.selectedFile) return;
    this.loading = true;
    this.authService.uploadProfileIcon(this.selectedFile).pipe(take(1)).subscribe({
      next: (res) => {
        this.loading = false;
        this.selectedFile = null;
        // Synchroniser le formulaire pour éviter qu'un futur "Enregistrer" réécrive l'ancienne URL
        if (res?.user?.iconUrl) {
          this.form?.patchValue({ iconUrl: res.user.iconUrl });
        }
        this.snackBar.open('Avatar mis à jour', 'Fermer', { duration: 2500, panelClass: ['success-snackbar'] });
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err || "Échec de l'upload de l'avatar", 'Fermer', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
