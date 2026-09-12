import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Envoi, EnvoiService } from '../../../core/services/envoi.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ComparaisonEnvoiComponent } from '../comparaison-envoi/comparaison-envoi.component';

/**
 * Cloche des envois : ce que les autres coachs m'envoient (à accepter ou refuser)
 * et le résultat de mes propres envois.
 */
@Component({
  selector: 'app-envois-cloche',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatBadgeModule, MatDialogModule],
  templateUrl: './envois-cloche.component.html',
  styleUrls: ['./envois-cloche.component.scss'],
})
export class EnvoisClocheComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  recus: Envoi[] = [];
  /** Résultats de mes envois que je n'ai pas encore vus */
  resultats: Envoi[] = [];
  enCours = new Set<string>();

  constructor(
    private envoiService: EnvoiService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.envoiService.envoisRecus$.pipe(takeUntil(this.destroy$)).subscribe((envois) => (this.recus = envois));
    this.envoiService.envoisEmis$.pipe(takeUntil(this.destroy$)).subscribe((envois) => {
      this.resultats = (envois || []).filter((e) => e.statut !== 'EN_ATTENTE' && !e.resultatVu);
    });
    this.envoiService.rafraichir();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get total(): number {
    return this.recus.length + this.resultats.length;
  }

  /** Nom lisible d'un coach */
  qui(coach?: { nom?: string; prenom?: string; email: string }): string {
    if (!coach) return 'Un coach';
    const identite = [coach.prenom, coach.nom].filter(Boolean).join(' ').trim();
    return identite || coach.email;
  }

  famille(envoi: Envoi): string {
    if (envoi.famille === 'exercice') return 'exercice';
    if (envoi.famille === 'echauffement') return 'échauffement';
    return 'situation';
  }

  icone(envoi: Envoi): string {
    if (envoi.famille === 'exercice') return 'sports';
    if (envoi.famille === 'echauffement') return 'directions_run';
    return 'sports_soccer';
  }

  accepter(envoi: Envoi, surDoublon: 'garder-les-deux' | 'remplacer' = 'garder-les-deux'): void {
    this.enCours.add(envoi.id);
    this.envoiService.accepter(envoi.id, { surDoublon }).subscribe({
      next: (reponse) => {
        this.enCours.delete(envoi.id);
        const ou = reponse?.espace?.name ? ` dans ${reponse.espace.name}` : '';
        this.notification.success(`« ${reponse?.element?.nom || envoi.nom} » ajouté${ou}.`);
      },
      error: (erreur) => {
        this.enCours.delete(envoi.id);
        this.notification.error(erreur?.error?.error || "L'élément n'a pas pu être ajouté.");
      },
    });
  }

  refuser(envoi: Envoi): void {
    this.enCours.add(envoi.id);
    this.envoiService.refuser(envoi.id).subscribe({
      next: () => {
        this.enCours.delete(envoi.id);
        this.notification.success(`Envoi de ${this.qui(envoi.expediteur)} refusé.`);
      },
      error: (erreur) => {
        this.enCours.delete(envoi.id);
        this.notification.error(erreur?.error?.error || "Le refus n'a pas pu être enregistré.");
      },
    });
  }

  /** Ouvre la fiche reçue, et la met face à celle que j'ai déjà en cas de doublon. */
  comparer(envoi: Envoi): void {
    this.dialog
      .open(ComparaisonEnvoiComponent, { data: { envoi }, width: '900px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((choix) => {
        if (choix === 'garder-les-deux' || choix === 'remplacer') this.accepter(envoi, choix);
        if (choix === 'refuser') this.refuser(envoi);
      });
  }

  /** Les résultats affichés sont considérés comme lus dès qu'on ferme la cloche. */
  fermer(): void {
    if (this.resultats.length) this.envoiService.marquerResultatsVus().subscribe();
  }
}
