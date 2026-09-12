import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiUrlService } from './api-url.service';

/** Familles d'éléments qu'on peut s'envoyer. */
export type FamilleEnvoi = 'exercice' | 'echauffement' | 'situation';

export interface Coequipier {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  iconUrl?: string | null;
}

export interface Envoi {
  id: string;
  famille: FamilleEnvoi;
  nom: string;
  message?: string | null;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  createdAt: string;
  decideAt?: string | null;
  resultatVu: boolean;
  contenu: any;
  expediteur?: Coequipier;
  destinataire?: Coequipier;
  /** Espace où l'élément sera déposé par défaut (envois reçus) */
  espaceParDefaut?: { id: string; name: string } | null;
  /** Élément du même nom déjà présent chez le destinataire (envois reçus) */
  doublon?: { id: string; nom: string } | null;
}

/**
 * Envois d'éléments entre utilisateurs : ce que je reçois (à accepter ou refuser)
 * et ce que j'ai envoyé (avec son résultat).
 */
@Injectable({ providedIn: 'root' })
export class EnvoiService {
  private readonly recus$ = new BehaviorSubject<Envoi[]>([]);
  private readonly emis$ = new BehaviorSubject<Envoi[]>([]);

  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  /** Envois en attente de ma réponse */
  get envoisRecus$(): Observable<Envoi[]> { return this.recus$.asObservable(); }
  /** Mes envois et leur résultat */
  get envoisEmis$(): Observable<Envoi[]> { return this.emis$.asObservable(); }

  private url(chemin: string): string {
    return this.apiUrl.getUrl(`envois${chemin}`);
  }

  rafraichir(): void {
    this.http.get<Envoi[]>(this.url('/recus')).subscribe({
      next: (envois) => this.recus$.next(envois || []),
      error: () => this.recus$.next([]),
    });
    this.http.get<Envoi[]>(this.url('/emis')).subscribe({
      next: (envois) => this.emis$.next(envois || []),
      error: () => this.emis$.next([]),
    });
  }

  destinataires(): Observable<Coequipier[]> {
    return this.http.get<Coequipier[]>(this.url('/destinataires'));
  }

  envoyer(famille: FamilleEnvoi, elementId: string, destinataireId: string, message?: string): Observable<Envoi> {
    return this.http.post<Envoi>(this.url(''), { famille, elementId, destinataireId, message })
      .pipe(tap(() => this.rafraichir()));
  }

  accepter(envoiId: string, options: { workspaceId?: string; surDoublon?: 'garder-les-deux' | 'remplacer' } = {}): Observable<any> {
    return this.http.post(this.url(`/${envoiId}/accepter`), options).pipe(tap(() => this.rafraichir()));
  }

  refuser(envoiId: string): Observable<any> {
    return this.http.post(this.url(`/${envoiId}/refuser`), {}).pipe(tap(() => this.rafraichir()));
  }

  marquerResultatsVus(): Observable<any> {
    return this.http.post(this.url('/resultats-vus'), {}).pipe(tap(() => this.rafraichir()));
  }
}
