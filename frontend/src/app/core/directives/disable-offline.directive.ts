import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { OfflineService } from '../services/offline.service';

@Directive({
  selector: '[appDisableOffline]'
})
export class DisableOfflineDirective implements OnInit, OnDestroy {
  private sub?: Subscription;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly offline: OfflineService
  ) {}

  ngOnInit(): void {
    this.sub = this.offline.online$.subscribe(isOnline => {
      const disabled = !isOnline;
      if ('disabled' in this.el.nativeElement) {
        this.renderer.setProperty(this.el.nativeElement, 'disabled', disabled);
      }
      if (disabled) {
        this.renderer.addClass(this.el.nativeElement, 'is-disabled-offline');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'is-disabled-offline');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
