import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Envoi } from '../../../core/services/envoi.service';
import { ApiUrlService } from '../../../core/services/api-url.service';
import { RichTextViewComponent } from '../rich-text-view/rich-text-view.component';

interface DonneesComparaison { envoi: Envoi; }

/** Une ligne de la comparaison : un champ, sa valeur reçue et celle déjà en place. */
interface Ligne {
  libelle: string;
  recu: string;
  actuel: string;
  riche?: boolean;
  differe: boolean;
}

const CHEMIN: Record<string, string> = {
  exercice: 'exercises',
  echauffement: 'warmups',
  situation: 'matches',
};

/**
 * Fiche reçue, et — si un élément du même nom existe déjà — la fiche actuelle en face,
 * pour décider en connaissance de cause : garder les deux, remplacer, ou refuser.
 */
@Component({
  selector: 'app-comparaison-envoi',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RichTextViewComponent],
  templateUrl: './comparaison-envoi.component.html',
  styleUrls: ['./comparaison-envoi.component.scss'],
})
export class ComparaisonEnvoiComponent implements OnInit {
  envoi: Envoi;
  actuel: any = null;
  chargement = false;
  lignes: Ligne[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: DonneesComparaison,
    private dialogRef: MatDialogRef<ComparaisonEnvoiComponent>,
    private http: HttpClient,
    private apiUrl: ApiUrlService
  ) {
    this.envoi = data.envoi;
  }

  ngOnInit(): void {
    if (!this.envoi.doublon) {
      this.construireLignes();
      return;
    }
    this.chargement = true;
    const chemin = CHEMIN[this.envoi.famille];
    this.http.get<any>(this.apiUrl.getUrl(`${chemin}/${this.envoi.doublon.id}`)).subscribe({
      next: (element) => {
        this.actuel = element;
        this.chargement = false;
        this.construireLignes();
      },
      error: () => {
        this.chargement = false;
        this.construireLignes();
      },
    });
  }

  get titre(): string {
    return this.envoi.doublon ? `« ${this.envoi.nom} » — reçu et déjà présent` : `« ${this.envoi.nom} » — fiche reçue`;
  }

  private texte(valeur: any): string {
    if (valeur === null || valeur === undefined) return '';
    if (Array.isArray(valeur)) return valeur.join(' · ');
    return String(valeur);
  }

  private construireLignes(): void {
    const recu = this.envoi.contenu || {};
    const actuel = this.actuel || {};

    const champs: Array<{ libelle: string; cle: string; riche?: boolean }> = [
      { libelle: 'Nom', cle: 'nom' },
      { libelle: 'Type', cle: 'type' },
      { libelle: 'Description', cle: 'description', riche: true },
      { libelle: 'Critère de réussite', cle: 'critereReussite' },
      { libelle: 'Matériel', cle: 'materiel' },
      { libelle: 'Notes', cle: 'notes' },
      { libelle: 'Durée', cle: 'temps' },
    ];

    this.lignes = champs
      .map(({ libelle, cle, riche }) => {
        const valeurRecue = this.texte(recu[cle]);
        const valeurActuelle = this.texte(actuel[cle]);
        return { libelle, recu: valeurRecue, actuel: valeurActuelle, riche, differe: valeurRecue !== valeurActuelle };
      })
      .filter((l) => l.recu || l.actuel);

    const tagsRecus = (recu.tags || []).map((t: any) => t.label).join(' · ');
    const tagsActuels = (actuel.tags || []).map((t: any) => t.label).join(' · ');
    if (tagsRecus || tagsActuels) {
      this.lignes.push({ libelle: 'Étiquettes', recu: tagsRecus, actuel: tagsActuels, differe: tagsRecus !== tagsActuels });
    }

    const blocsRecus = (recu.blocs || []).map((b: any) => b.titre).join(' · ');
    const blocsActuels = (actuel.blocs || []).map((b: any) => b.titre).join(' · ');
    if (blocsRecus || blocsActuels) {
      this.lignes.push({ libelle: 'Blocs', recu: blocsRecus, actuel: blocsActuels, differe: blocsRecus !== blocsActuels });
    }
  }

  imagesRecues(): string[] {
    const c = this.envoi.contenu || {};
    return [c.imageUrl, ...(c.imagesSupplementaires || [])].filter(Boolean);
  }

  decider(choix: 'garder-les-deux' | 'remplacer' | 'refuser'): void {
    this.dialogRef.close(choix);
  }

  fermer(): void {
    this.dialogRef.close();
  }
}
