import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private readonly onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);

  /** Flux observable de l'état de connexion (true = en ligne, false = hors ligne) */
  readonly online$: Observable<boolean> = this.onlineSubject.asObservable();

  constructor() {
    window.addEventListener('online', () => this.onlineSubject.next(true));
    window.addEventListener('offline', () => this.onlineSubject.next(false));
  }

  /** État courant de la connexion */
  get isOnline(): boolean {
    return this.onlineSubject.value;
  }
}
