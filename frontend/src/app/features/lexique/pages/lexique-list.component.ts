import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LexiqueService } from '../../../core/services/lexique.service';
import { PermissionsService } from '../../../core/services/permissions.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { Lexique, LEXIQUE_CATEGORIES, LexiqueCategorie } from '../../../core/models/lexique.model';

/** Terme en cours de saisie : `id` absent pour un ajout. */
interface Brouillon {
  id?: string;
  terme: string;
  definition: string;
  categorie: LexiqueCategorie | '';
  motImage: boolean;
}

/**
 * Page du lexique (vocabulaire commun du club) : consultation pour tous,
 * ajout / modification / suppression pour les rôles qui peuvent écrire.
 */
@Component({
  selector: 'app-lexique-list',
  templateUrl: './lexique-list.component.html',
  styleUrls: ['./lexique-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LexiqueListComponent implements OnInit {
  lexiques: Lexique[] = [];
  categories = LEXIQUE_CATEGORIES;
  selectedCategorie: LexiqueCategorie | '' = '';
  errorMessage = '';

  peutEcrire = false;
  brouillon: Brouillon | null = null;
  enregistrement = false;
  erreurFormulaire = '';

  constructor(
    private lexiqueService: LexiqueService,
    private permissionsService: PermissionsService,
    private notificationService: NotificationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.peutEcrire = this.permissionsService.canWrite();
    this.load();
  }

  load(): void {
    this.lexiqueService.getAll(this.selectedCategorie || undefined).subscribe({
      next: (data) => {
        this.lexiques = data;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Erreur lors du chargement du lexique:', err);
        this.errorMessage = 'Impossible de charger le lexique.';
      }
    });
  }

  onFilterChange(): void {
    this.load();
  }

  ajouter(): void {
    this.erreurFormulaire = '';
    this.brouillon = { terme: '', definition: '', categorie: this.selectedCategorie || '', motImage: false };
  }

  modifier(mot: Lexique): void {
    this.erreurFormulaire = '';
    this.brouillon = { id: mot.id, terme: mot.terme, definition: mot.definition, categorie: mot.categorie, motImage: !!mot.motImage };
  }

  annuler(): void {
    this.brouillon = null;
    this.erreurFormulaire = '';
  }

  enCours(mot: Lexique): boolean {
    return !!this.brouillon?.id && this.brouillon.id === mot.id;
  }

  enregistrer(): void {
    const b = this.brouillon;
    if (!b) return;
    const terme = b.terme.trim();
    const definition = b.definition.trim();
    if (!terme || !definition || !b.categorie) {
      this.erreurFormulaire = 'Le terme, la définition et la catégorie sont obligatoires.';
      return;
    }
    const donnees = { terme, definition, categorie: b.categorie, motImage: b.motImage };
    this.enregistrement = true;
    const requete = b.id ? this.lexiqueService.update(b.id, donnees) : this.lexiqueService.create(donnees);
    requete.subscribe({
      next: () => {
        this.enregistrement = false;
        this.notificationService.success(b.id ? `« ${terme} » a été modifié.` : `« ${terme} » a été ajouté au lexique.`);
        this.brouillon = null;
        this.load();
      },
      error: (err) => {
        this.enregistrement = false;
        this.erreurFormulaire = err?.error?.message || err?.error?.error || 'L’enregistrement a échoué. Réessayez.';
      }
    });
  }

  supprimer(mot: Lexique): void {
    if (!mot.id) return;
    this.dialogService.confirm(
      'Supprimer ce terme ?',
      `« ${mot.terme} » sera retiré du lexique et du « lexique du jour » des séances qui l’utilisent. Cette action est définitive.`,
      'Supprimer',
      'Annuler',
      true
    ).subscribe(confirme => {
      if (!confirme) return;
      this.lexiqueService.delete(mot.id!).subscribe({
        next: () => {
          this.notificationService.success(`« ${mot.terme} » a été supprimé.`);
          if (this.enCours(mot)) this.brouillon = null;
          this.load();
        },
        error: (err) => this.notificationService.showHttpError(err, 'La suppression a échoué.')
      });
    });
  }
}
