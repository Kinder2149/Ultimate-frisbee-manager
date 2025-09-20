import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  handleHttpError(error: any): void {
    // Logging console pour debug
    console.error('Erreur HTTP interceptée:', error);

    let errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    
    if (error.status === 401) {
      errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      errorMessage = "Vous n'avez pas les droits pour effectuer cette action.";
    } else if (error.status === 404) {
      errorMessage = 'La ressource demandée est introuvable.';
    } else if (error.error && typeof error.error.error === 'string') {
      // Erreurs formatées depuis notre API backend
      errorMessage = error.error.error;
    } else if (error.error && Array.isArray(error.error.details)) {
      // Erreurs de validation Zod
      errorMessage = error.error.details.map((d: any) => `${d.field}: ${d.message}`).join('\n');
    }

    this.snackBar.open(errorMessage, 'Fermer', {
      duration: 7000, // Durée plus longue pour les erreurs complexes
      panelClass: ['error-snackbar'],
      // Permettre le retour à la ligne pour les messages longs (validation Zod)
      data: { whiteSpace: 'pre-wrap' }
    });
  }
}
