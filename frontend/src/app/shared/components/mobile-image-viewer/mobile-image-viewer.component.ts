import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mobile-image-viewer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './mobile-image-viewer.component.html',
  styleUrls: ['./mobile-image-viewer.component.scss']
})
export class MobileImageViewerComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() currentIndex: number = 0;
  @Output() indexChange = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('imageContainer', { static: false }) imageContainer?: ElementRef<HTMLDivElement>;

  scale: number = 1;
  translateX: number = 0;
  translateY: number = 0;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private initialDistance: number = 0;
  private initialScale: number = 1;

  ngOnInit(): void {
    if (this.currentIndex < 0 || this.currentIndex >= this.images.length) {
      this.currentIndex = 0;
    }
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      // Single touch - swipe
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      // Two fingers - pinch to zoom
      this.initialDistance = this.getDistance(event.touches[0], event.touches[1]);
      this.initialScale = this.scale;
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 2) {
      // Pinch to zoom
      event.preventDefault();
      const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
      const scaleChange = currentDistance / this.initialDistance;
      this.scale = Math.max(1, Math.min(3, this.initialScale * scaleChange));
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length === 1 && this.scale === 1) {
      // Swipe detection
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;

      // Horizontal swipe (threshold 50px)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          this.previous();
        } else {
          this.next();
        }
      }
    }
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  next(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.resetZoom();
      this.indexChange.emit(this.currentIndex);
    }
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetZoom();
      this.indexChange.emit(this.currentIndex);
    }
  }

  resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  onDoubleTap(event: MouseEvent | TouchEvent): void {
    if (this.scale === 1) {
      this.scale = 2;
    } else {
      this.resetZoom();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  get transformStyle(): string {
    return `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
  }

  get canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentIndex < this.images.length - 1;
  }
}
