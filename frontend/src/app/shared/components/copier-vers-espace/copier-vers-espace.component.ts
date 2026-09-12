import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { NotificationService } from '../../../core/services/notification.service';

/** Familles d'éléments copiables et leur segment d'API. */
export type FamilleCopiable = 'exercices' | 'echauffements' | 'situations';

const CHEMIN: Record<FamilleCopiable, string> = {
  exercices: 'exercises',
  echauffements: 'warmups',
  situations: 'matches',
};

interface EspaceDestination { id: string; name: string; role: string; }

/**
 * Bouton « Copier vers un espace » : propose les espaces où l'utilisateur peut écrire
 * et y recopie l'élément (l'original reste en place).
 */
@Component({
  selector: 'app-copier-vers-espace',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatProgressSpinnerModule],
  template: `
    <button mat-icon-button class="copier-espace"
            [matMenuTriggerFor]="menu"
            (menuOpened)="chargerDestinations()"
            matTooltip="Copier vers un espace">
      <mat-icon>drive_file_move</mat-icon>
    </button>

    <mat-menu #menu="matMenu">
      <div class="entete" mat-menu-item disabled>Copier vers…</div>
      <div class="attente" *ngIf="chargement">
        <mat-spinner diameter="18"></mat-spinner>
      </div>
      <button mat-menu-item *ngFor="let espace of destinations" (click)="copier(espace)">
        <mat-icon>folder_shared</mat-icon>
        <span>{{ espace.name }}</span>
      </button>
      <div class="vide" *ngIf="!chargement && !destinations.length">
        Aucun autre espace où vous pouvez écrire
      </div>
    </mat-menu>
  `,
  styles: [`
    .copier-espace { color: #00796b; }
    .entete { font-size: 12px; color: #78909c; opacity: 1 !important; }
    .attente { display: flex; justify-content: center; padding: 8px; }
    .vide { padding: 8px 16px; font-size: 12px; color: #78909c; max-width: 220px; }
  `]
})
export class CopierVersEspaceComponent {
  @Input() famille: FamilleCopiable = 'exercices';
  @Input() elementId = '';
  /** Nom affiché dans le message de confirmation */
  @Input() nom = '';

  destinations: EspaceDestination[] = [];
  chargement = false;

  constructor(
    private http: HttpClient,
    private apiUrlService: ApiUrlService,
    private notification: NotificationService
  ) {}

  chargerDestinations(): void {
    this.chargement = true;
    this.http.get<EspaceDestination[]>(this.apiUrlService.getUrl('workspaces/destinations')).subscribe({
      next: (espaces) => {
        this.destinations = espaces || [];
        this.chargement = false;
      },
      error: () => {
        this.destinations = [];
        this.chargement = false;
        this.notification.error("La liste des espaces n'a pas pu être chargée.");
      }
    });
  }

  copier(espace: EspaceDestination): void {
    const url = this.apiUrlService.getUrl(`${CHEMIN[this.famille]}/${this.elementId}/copier-vers-espace`);
    this.http.post<{ espace: { name: string } }>(url, { workspaceId: espace.id }).subscribe({
      next: (reponse) => {
        const quoi = this.nom ? `« ${this.nom} »` : 'L’élément';
        this.notification.success(`${quoi} a été copié dans ${reponse.espace.name}.`);
      },
      error: (erreur) => {
        this.notification.error(erreur?.error?.error || "La copie n'a pas abouti.");
      }
    });
  }
}
