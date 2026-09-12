import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Coequipier, EnvoiService, FamilleEnvoi } from '../../../core/services/envoi.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Bouton « Envoyer à un coach » : choisir un destinataire, joindre un mot,
 * et lui proposer l'élément. Rien n'entre chez lui sans son accord.
 */
@Component({
  selector: 'app-envoyer-a-coach',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatTooltipModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
  ],
  template: `
    <button mat-icon-button class="envoyer-coach"
            [matMenuTriggerFor]="menu"
            (menuOpened)="chargerCoachs()"
            matTooltip="Envoyer à un coach">
      <mat-icon>send</mat-icon>
    </button>

    <mat-menu #menu="matMenu">
      <div class="panneau" (click)="$event.stopPropagation()">
        <div class="titre">Envoyer « {{ nom }} » à…</div>

        <div class="attente" *ngIf="chargement">
          <mat-spinner diameter="18"></mat-spinner>
        </div>

        <mat-form-field appearance="outline" class="mot" *ngIf="!chargement && coachs.length">
          <mat-label>Un mot (facultatif)</mat-label>
          <input matInput [(ngModel)]="message" maxlength="200" placeholder="regarde la variante…" />
        </mat-form-field>

        <button mat-menu-item *ngFor="let coach of coachs" [disabled]="envoiEnCours" (click)="envoyer(coach)">
          <mat-icon>person</mat-icon>
          <span>{{ label(coach) }}</span>
        </button>

        <div class="vide" *ngIf="!chargement && !coachs.length">Aucun autre coach inscrit</div>
      </div>
    </mat-menu>
  `,
  styles: [`
    .envoyer-coach { color: #6a1b9a; }
    .panneau { padding: 4px 0; min-width: 260px; }
    .titre { padding: 6px 16px; font-size: 12px; color: #78909c; }
    .attente { display: flex; justify-content: center; padding: 8px; }
    .mot { display: block; margin: 4px 12px 0; width: calc(100% - 24px); font-size: 13px; }
    .vide { padding: 8px 16px; font-size: 12px; color: #78909c; }
  `],
})
export class EnvoyerACoachComponent {
  @Input() famille: FamilleEnvoi = 'exercice';
  @Input() elementId = '';
  @Input() nom = '';

  coachs: Coequipier[] = [];
  chargement = false;
  envoiEnCours = false;
  message = '';

  constructor(private envoiService: EnvoiService, private notification: NotificationService) {}

  label(coach: Coequipier): string {
    const identite = [coach.prenom, coach.nom].filter(Boolean).join(' ').trim();
    return identite || coach.email;
  }

  chargerCoachs(): void {
    this.chargement = true;
    this.envoiService.destinataires().subscribe({
      next: (coachs) => {
        this.coachs = coachs || [];
        this.chargement = false;
      },
      error: () => {
        this.coachs = [];
        this.chargement = false;
        this.notification.error("La liste des coachs n'a pas pu être chargée.");
      },
    });
  }

  envoyer(coach: Coequipier): void {
    this.envoiEnCours = true;
    this.envoiService.envoyer(this.famille, this.elementId, coach.id, this.message || undefined).subscribe({
      next: () => {
        this.envoiEnCours = false;
        this.message = '';
        this.notification.success(`Envoyé à ${this.label(coach)} : il ou elle doit maintenant l'accepter.`);
      },
      error: (erreur) => {
        this.envoiEnCours = false;
        this.notification.error(erreur?.error?.error || "L'envoi n'a pas abouti.");
      },
    });
  }
}
