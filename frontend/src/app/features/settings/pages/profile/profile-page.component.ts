import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Interface pour les champs éditables
interface EditableField {
  name: string;
  label: string;
  type: 'text' | 'email';
  value: string;
  isEditing: boolean;
  isLoading: boolean;
  originalValue: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  user$!: Observable<User | null>;
  currentUser: User | null = null;
  loading = true;
  
  // Champs éditables
  fields: EditableField[] = [];
  
  // Upload avatar
  selectedFile: File | null = null;
  avatarPreview: string | null = null;
  isUploadingAvatar = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.currentUser$;
    
    // S'abonner aux changements de l'utilisateur
    this.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.initializeFields(user);
      }
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser les champs éditables avec les données utilisateur
   */
  private initializeFields(user: User): void {
    this.fields = [
      {
        name: 'prenom',
        label: 'Prénom',
        type: 'text',
        value: user.prenom || '',
        originalValue: user.prenom || '',
        isEditing: false,
        isLoading: false
      },
      {
        name: 'nom',
        label: 'Nom',
        type: 'text',
        value: user.nom || '',
        originalValue: user.nom || '',
        isEditing: false,
        isLoading: false
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        value: user.email || '',
        originalValue: user.email || '',
        isEditing: false,
        isLoading: false
      }
    ];
  }

  /**
   * Activer le mode édition pour un champ
   */
  editField(fieldName: string): void {
    const field = this.fields.find(f => f.name === fieldName);
    if (field) {
      field.isEditing = true;
      field.value = field.originalValue; // Restaurer la valeur originale
    }
  }

  /**
   * Sauvegarder un champ modifié
   */
  saveField(fieldName: string): void {
    const field = this.fields.find(f => f.name === fieldName);
    if (!field) return;

    // Validation basique
    const trimmedValue = field.value.trim();
    if (field.name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        this.snackBar.open('Format d\'email invalide', 'Fermer', { duration: 3000, panelClass: ['error-snackbar'] });
        return;
      }
    }

    if (trimmedValue === field.originalValue) {
      field.isEditing = false;
      return;
    }

    field.isLoading = true;
    field.isEditing = false;

    // Appeler le service pour mettre à jour le champ
    this.authService.updateUserField(field.name, trimmedValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          field.isLoading = false;
          field.originalValue = trimmedValue;
          field.value = trimmedValue;
          this.snackBar.open(`${field.label} mis à jour avec succès`, 'Fermer', { 
            duration: 2000, 
            panelClass: ['success-snackbar'] 
          });
        },
        error: (error) => {
          field.isLoading = false;
          field.value = field.originalValue; // Rollback
          const errorMsg = error.error?.error || `Erreur lors de la mise à jour de ${field.label}`;
          this.snackBar.open(errorMsg, 'Fermer', { 
            duration: 4000, 
            panelClass: ['error-snackbar'] 
          });
        }
      });
  }

  /**
   * Annuler l'édition d'un champ
   */
  cancelEdit(fieldName: string): void {
    const field = this.fields.find(f => f.name === fieldName);
    if (field) {
      field.isEditing = false;
      field.value = field.originalValue;
    }
  }

  /**
   * Obtenir le champ par son nom
   */
  getField(fieldName: string): EditableField | undefined {
    return this.fields.find(f => f.name === fieldName);
  }

  /**
   * Sélection d'un fichier avatar
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Veuillez sélectionner une image', 'Fermer', { duration: 3000 });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        this.snackBar.open('L\'image ne doit pas dépasser 5MB', 'Fermer', { duration: 3000 });
        return;
      }

      this.selectedFile = file;
      
      // Créer un preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Upload de l'avatar
   */
  uploadAvatar(): void {
    if (!this.selectedFile) return;

    this.isUploadingAvatar = true;

    this.authService.updateAvatar(this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isUploadingAvatar = false;
          this.selectedFile = null;
          this.avatarPreview = null;
          this.snackBar.open('Avatar mis à jour avec succès', 'Fermer', { 
            duration: 2000, 
            panelClass: ['success-snackbar'] 
          });
        },
        error: (error) => {
          this.isUploadingAvatar = false;
          const errorMsg = error.error?.error || 'Erreur lors de l\'upload de l\'avatar';
          this.snackBar.open(errorMsg, 'Fermer', { 
            duration: 4000, 
            panelClass: ['error-snackbar'] 
          });
        }
      });
  }

  /**
   * Annuler la sélection d'avatar
   */
  cancelAvatarSelection(): void {
    this.selectedFile = null;
    this.avatarPreview = null;
  }

  /**
   * Ouvrir le modal de changement de mot de passe
   */
  openPasswordModal(): void {
    // TODO: Implémenter le modal de changement de mot de passe
    this.snackBar.open('Fonctionnalité de changement de mot de passe à venir', 'Fermer', { duration: 3000 });
  }

  /**
   * Obtenir l'URL de l'avatar
   */
  getAvatarUrl(): string {
    if (this.avatarPreview) {
      return this.avatarPreview;
    }
    if (this.currentUser?.iconUrl) {
      return this.currentUser.iconUrl;
    }
    return '';
  }

  /**
   * Formater la date de création du compte
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non disponible';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Obtenir le libellé du rôle
   */
  getRoleLabel(role: string | undefined): string {
    if (!role) return 'Utilisateur';
    return role === 'ADMIN' ? 'Administrateur' : 'Utilisateur';
  }
}
