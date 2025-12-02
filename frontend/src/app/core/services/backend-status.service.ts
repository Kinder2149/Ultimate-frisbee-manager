import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subscription, timer } from 'rxjs';
import { ApiUrlService } from './api-url.service';

export type BackendStatus = 'idle' | 'checking' | 'waking' | 'up' | 'error';

export interface BackendState {
  status: BackendStatus;
  message: string;
  lastCheck?: Date | null;
  responseTimeMs?: number | null;
  attempts?: number;
}

@Injectable({ providedIn: 'root' })
export class BackendStatusService {
  private state$ = new BehaviorSubject<BackendState>({ status: 'idle', message: '' });
  private pollingSub: Subscription | null = null;
  private maxDelayMs = 10000; // 10s max entre polls

  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  getState() {
    return this.state$.asObservable();
  }

  snapshot(): BackendState {
    return this.state$.value;
  }

  setIdle() {
    this.state$.next({ status: 'idle', message: '' });
  }

  checkHealthOnce() {
    this.state$.next({ status: 'checking', message: 'Connexion au serveur…' });
    const url = this.apiUrl.getUrl('health');
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.state$.next({
          status: 'up',
          message: 'Connecté',
          lastCheck: new Date(),
          responseTimeMs: res?.responseTimeMs ?? null,
          attempts: 0
        });
        this.stopPolling();
        this.fadeOutSoon();
      },
      error: () => {
        this.startPolling();
      }
    });
  }

  notifyNetworkError() {
    const s = this.snapshot();
    if (s.status === 'idle' || s.status === 'up') {
      this.state$.next({ status: 'waking', message: 'Réveil du serveur… cela peut prendre 30–60s', attempts: 0 });
    }
  }

  startPolling() {
    if (this.pollingSub) return; // déjà en cours

    let attempts = this.snapshot().attempts || 0;

    this.state$.next({
      status: 'waking',
      message: 'Réveil du serveur… cela peut prendre 30–60s',
      attempts
    });

    const pollOnce = async () => {
      const ok = await this.tryHealth();
      if (ok) {
        this.state$.next({ status: 'up', message: 'Connecté', attempts });
        this.stopPolling();
        this.fadeOutSoon();
        return;
      }
      attempts += 1;
      this.state$.next({ status: 'waking', message: 'Réveil du serveur…', attempts });
      const base = Math.min(this.maxDelayMs, 1000 * Math.pow(2, Math.min(attempts, 4))); // 1s..10s
      const jitter = Math.floor(Math.random() * 400); // +0..400ms
      const delay = base + jitter;
      this.pollingSub = timer(delay).subscribe(() => {
        // Récurse jusqu'à succès ou arrêt
        pollOnce();
      });
    };

    // Démarrer immédiatement une tentative
    this.pollingSub = timer(0).subscribe(() => pollOnce());
  }

  stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  private async tryHealth(): Promise<boolean> {
    try {
      const url = this.apiUrl.getUrl('health');
      const res: any = await this.http.get(url).toPromise();
      return !!res;
    } catch (e) {
      return false;
    }
  }

  private fadeOutSoon() {
    // Laisser visible brièvement l’état "Connecté"
    setTimeout(() => this.setIdle(), 1500);
  }
}
