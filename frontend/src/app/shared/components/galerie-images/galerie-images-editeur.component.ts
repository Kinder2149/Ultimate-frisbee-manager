import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { NotificationService } from '../../../core/services/notification.service';

/** Familles de fiches qui acceptent une galerie (segment de l'API). */
export type RessourceGalerie = 'exercises' | 'warmups' | 'matches';

/**
 * Édition des images supplémentaires d'une fiche : ajout, retrait, ordre.
 * Chaque image est envoyée au serveur dès son ajout ; la fiche ne retient que
 * les adresses, enregistrées avec le reste du formulaire.
 */
@Component({
  selector: 'app-galerie-images-editeur',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="galerie-editeur">
      <div class="entete">
        <span class="titre">Images supplémentaires</span>
        <span class="compte" *ngIf="images.length">{{ images.length }} / {{ maximum }}</span>
      </div>
      <p class="aide">En plus de l'image principale : les étapes d'un schéma, les variantes d'un mouvement…</p>

      <div class="liste" *ngIf="images.length">
        <div class="element" *ngFor="let url of images; let i = index">
          <img [src]="url" [alt]="'Image supplémentaire ' + (i + 1)" />
          <div class="actions">
            <button type="button" mat-icon-button [disabled]="i === 0" (click)="deplacer(i, -1)" aria-label="Monter l'image">
              <mat-icon>arrow_upward</mat-icon>
            </button>
            <button type="button" mat-icon-button [disabled]="i === images.length - 1" (click)="deplacer(i, 1)"
                    aria-label="Descendre l'image">
              <mat-icon>arrow_downward</mat-icon>
            </button>
            <button type="button" mat-icon-button color="warn" (click)="retirer(i)" aria-label="Retirer l'image">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <mat-progress-bar mode="indeterminate" *ngIf="envoiEnCours"></mat-progress-bar>

      <button type="button" mat-stroked-button (click)="champ.click()" [disabled]="envoiEnCours || images.length >= maximum">
        <mat-icon>add_photo_alternate</mat-icon>
        Ajouter une image
      </button>
      <input #champ type="file" accept="image/*" multiple hidden (change)="ajouter($event)" />
    </div>
  `,
  styles: [`
    .galerie-editeur { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
    .entete { display: flex; align-items: baseline; gap: 8px; }
    .titre { font-weight: 600; }
    .compte { color: #78909c; font-size: 12px; }
    .aide { margin: 0; color: #607d8b; font-size: 12px; }
    .liste { display: flex; flex-wrap: wrap; gap: 12px; }
    .element { border: 1px solid #e0e0e0; border-radius: 8px; padding: 6px; display: flex; flex-direction: column; gap: 4px; }
    .element img { max-height: 130px; max-width: 180px; object-fit: contain; }
    .actions { display: flex; justify-content: center; }
  `]
})
export class GalerieImagesEditeurComponent {
  /** Famille de la fiche : détermine où l'image est rangée sur le serveur */
  @Input() ressource: RessourceGalerie = 'exercises';
  @Input() images: string[] = [];
  @Output() imagesChange = new EventEmitter<string[]>();

  readonly maximum = 20;
  envoiEnCours = false;

  constructor(
    private http: HttpClient,
    private apiUrlService: ApiUrlService,
    private notification: NotificationService
  ) {}

  ajouter(event: Event): void {
    const champ = event.target as HTMLInputElement;
    const fichiers = Array.from(champ.files || []);
    champ.value = '';
    if (!fichiers.length) return;

    const placesRestantes = this.maximum - this.images.length;
    if (fichiers.length > placesRestantes) {
      this.notification.error(`${this.maximum} images supplémentaires maximum par fiche.`);
      return;
    }

    this.envoiEnCours = true;
    this.envoyerUnParUn(fichiers, 0);
  }

  private envoyerUnParUn(fichiers: File[], index: number): void {
    if (index >= fichiers.length) {
      this.envoiEnCours = false;
      return;
    }
    const donnees = new FormData();
    donnees.append('image', fichiers[index], fichiers[index].name);

    this.http.post<{ url: string }>(this.apiUrlService.getUrl(`${this.ressource}/images`), donnees).subscribe({
      next: (reponse) => {
        this.images = [...this.images, reponse.url];
        this.imagesChange.emit(this.images);
        this.envoyerUnParUn(fichiers, index + 1);
      },
      error: (erreur) => {
        this.envoiEnCours = false;
        this.notification.error(erreur?.error?.error || "L'image n'a pas pu être envoyée.");
      }
    });
  }

  retirer(index: number): void {
    this.images = this.images.filter((_, i) => i !== index);
    this.imagesChange.emit(this.images);
  }

  deplacer(index: number, sens: -1 | 1): void {
    const cible = index + sens;
    if (cible < 0 || cible >= this.images.length) return;
    const copie = [...this.images];
    [copie[index], copie[cible]] = [copie[cible], copie[index]];
    this.images = copie;
    this.imagesChange.emit(this.images);
  }
}
