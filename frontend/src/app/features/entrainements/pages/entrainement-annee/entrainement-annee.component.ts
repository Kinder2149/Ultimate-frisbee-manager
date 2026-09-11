import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { Entrainement } from '../../../../core/models/entrainement.model';
import { Tag } from '../../../../core/models/tag.model';
import { EntrainementService } from '../../../../core/services/entrainement.service';
import { DialogService } from '../../../../shared/components/dialog/dialog.service';
import { EntrainementDetailComponent } from '../entrainement-detail/entrainement-detail.component';

type Presentation = 'theme' | 'mois';

interface Groupe {
  titre: string;
  seances: Entrainement[];
}

const SANS_THEME = 'Sans thème';
const SANS_DATE = 'Sans date';
const ORDRE_PUBLIC = ['Débutant', 'Hétérogène', 'Confirmé'];
const rangPublic = (p?: string) => { const i = ORDRE_PUBLIC.indexOf(p || ''); return i < 0 ? ORDRE_PUBLIC.length : i; };

@Component({
  selector: 'app-entrainement-annee',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './entrainement-annee.component.html',
  styleUrls: ['./entrainement-annee.component.scss']
})
export class EntrainementAnneeComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  presentation: Presentation = 'theme';
  publics: string[] = [];
  publicChoisi: string | null = null;
  groupes: Groupe[] = [];
  chargement = true;
  erreur: string | null = null;

  private seances: Entrainement[] = [];

  constructor(
    private entrainementService: EntrainementService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.entrainementService.getEntrainements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: seances => {
          this.seances = seances || [];
          this.publics = [...new Set(this.seances.flatMap(s => this.tagsDe(s, 'public_seance').map(t => t.label)))]
            .sort((a, b) => rangPublic(a) - rangPublic(b) || a.localeCompare(b, 'fr'));
          this.chargement = false;
          this.regrouper();
        },
        error: () => {
          this.chargement = false;
          this.erreur = 'Impossible de charger les entraînements.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  choisirPresentation(p: Presentation): void {
    this.presentation = p;
    this.regrouper();
  }

  choisirPublic(p: string | null): void {
    this.publicChoisi = p;
    this.regrouper();
  }

  get total(): number {
    return this.groupes.reduce((n, g) => n + g.seances.length, 0);
  }

  tagsDe(seance: Entrainement, categorie: string): Tag[] {
    return (seance.tags || []).filter(t => t.category === categorie);
  }

  voir(seance: Entrainement): void {
    this.dialogService.open(EntrainementDetailComponent, {
      title: seance.titre,
      width: '1100px',
      maxWidth: '95vw',
      height: '95vh',
      panelClass: 'entity-view-dialog',
      customData: { entrainementId: seance.id }
    });
  }

  private regrouper(): void {
    const seances = this.seances.filter(s =>
      !this.publicChoisi || this.tagsDe(s, 'public_seance').some(t => t.label === this.publicChoisi)
    );
    this.groupes = this.presentation === 'theme' ? this.parTheme(seances) : this.parMois(seances);
  }

  /** Un groupe par thème, séances dans l'ordre du rang ; thèmes dans l'ordre chronologique de leur première séance. */
  private parTheme(seances: Entrainement[]): Groupe[] {
    const groupes = new Map<string, Entrainement[]>();
    for (const s of seances) {
      const theme = this.tagsDe(s, 'theme_entrainement')[0]?.label || SANS_THEME;
      groupes.set(theme, [...(groupes.get(theme) || []), s]);
    }
    const premiereDate = (liste: Entrainement[]) =>
      Math.min(...liste.map(s => (s.date ? new Date(s.date).getTime() : Infinity)));
    return [...groupes.entries()]
      .map(([titre, liste]) => ({ titre, seances: liste.sort((a, b) => this.parRang(a, b) || this.parDate(a, b)) }))
      .sort((a, b) =>
        Number(a.titre === SANS_THEME) - Number(b.titre === SANS_THEME) ||
        premiereDate(a.seances) - premiereDate(b.seances) ||
        a.titre.localeCompare(b.titre, 'fr')
      );
  }

  /** Un groupe par mois pour les séances datées, puis un groupe « Sans date ». */
  private parMois(seances: Entrainement[]): Groupe[] {
    const datees = seances.filter(s => !!s.date).sort((a, b) => this.parDate(a, b) || this.parRang(a, b));
    const groupes: Groupe[] = [];
    for (const s of datees) {
      const mois = new Date(s.date as any).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const titre = mois.charAt(0).toUpperCase() + mois.slice(1);
      const dernier = groupes[groupes.length - 1];
      if (dernier && dernier.titre === titre) dernier.seances.push(s);
      else groupes.push({ titre, seances: [s] });
    }
    const sansDate = seances.filter(s => !s.date).sort((a, b) =>
      (this.tagsDe(a, 'theme_entrainement')[0]?.label || '').localeCompare(this.tagsDe(b, 'theme_entrainement')[0]?.label || '', 'fr') ||
      this.parRang(a, b)
    );
    if (sansDate.length) groupes.push({ titre: SANS_DATE, seances: sansDate });
    return groupes;
  }

  private parRang(a: Entrainement, b: Entrainement): number {
    return (a.rang ?? Number.MAX_SAFE_INTEGER) - (b.rang ?? Number.MAX_SAFE_INTEGER) ||
      rangPublic(this.tagsDe(a, 'public_seance')[0]?.label) - rangPublic(this.tagsDe(b, 'public_seance')[0]?.label);
  }

  private parDate(a: Entrainement, b: Entrainement): number {
    const ta = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
    const tb = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
    return ta - tb;
  }
}
