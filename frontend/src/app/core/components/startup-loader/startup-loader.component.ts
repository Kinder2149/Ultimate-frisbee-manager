import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { BackendStatusService, BackendState } from '../../services/backend-status.service';

@Component({
  selector: 'app-startup-loader',
  templateUrl: './startup-loader.component.html',
  styleUrls: ['./startup-loader.component.css']
})
export class StartupLoaderComponent implements OnInit, OnDestroy {
  state: BackendState = { status: 'idle', message: '' };
  progress = 0;

  private stateSub?: Subscription;
  private progressSub?: Subscription;

  constructor(private backendStatus: BackendStatusService) {}

  ngOnInit(): void {
    this.stateSub = this.backendStatus.getState().subscribe((s) => {
      this.state = s;

      if (s.status === 'checking' || s.status === 'waking') {
        this.startFakeProgress();
      } else if (s.status === 'up' || s.status === 'error' || s.status === 'idle') {
        this.completeAndStopProgress();
      }
    });
  }

  ngOnDestroy(): void {
    this.stateSub?.unsubscribe();
    this.stopFakeProgress();
  }

  private startFakeProgress(): void {
    if (this.progressSub) {
      return; // déjà en cours
    }

    if (this.progress < 10) {
      this.progress = 10;
    }

    this.progressSub = interval(400).subscribe(() => {
      // Ne pas dépasser 85% en mode "réveil" pour garder une marge de finition
      const maxBeforeReady = 85;
      if (this.progress < maxBeforeReady) {
        const step = 2 + Math.random() * 4; // 2 à 6 %
        this.progress = Math.min(this.progress + step, maxBeforeReady);
      }
    });
  }

  private stopFakeProgress(): void {
    if (this.progressSub) {
      this.progressSub.unsubscribe();
      this.progressSub = undefined;
    }
  }

  private completeAndStopProgress(): void {
    // Finir doucement à 100% puis laisser AppComponent retirer le composant via *ngIf
    this.progress = 100;
    this.stopFakeProgress();
  }
}
