import { Component } from '@angular/core';
import { OfflineService } from '../../services/offline.service';

@Component({
  selector: 'app-offline-banner',
  templateUrl: './offline-banner.component.html',
  styleUrls: ['./offline-banner.component.scss']
})
export class OfflineBannerComponent {
  constructor(public offline: OfflineService) {}
}
