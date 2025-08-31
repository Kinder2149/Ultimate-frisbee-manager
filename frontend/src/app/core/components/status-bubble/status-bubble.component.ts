import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackendStatusService, BackendState } from '../../services/backend-status.service';

@Component({
  selector: 'app-status-bubble',
  templateUrl: './status-bubble.component.html',
  styleUrls: ['./status-bubble.component.css']
})
export class StatusBubbleComponent implements OnInit, OnDestroy {
  state: BackendState = { status: 'idle', message: '' };
  private sub?: Subscription;

  constructor(private backendStatus: BackendStatusService) {}

  ngOnInit(): void {
    this.sub = this.backendStatus.getState().subscribe(s => this.state = s);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  isVisible(): boolean {
    return this.state.status === 'checking' || this.state.status === 'waking' || this.state.status === 'up' || this.state.status === 'error';
  }
}
