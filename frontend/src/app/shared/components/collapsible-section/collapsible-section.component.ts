import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './collapsible-section.component.html',
  styleUrls: ['./collapsible-section.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0'
      })),
      state('expanded', style({
        height: '*',
        overflow: 'visible',
        opacity: '1'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class CollapsibleSectionComponent {
  @Input() title: string = '';
  @Input() icon?: string;
  @Input() defaultOpen: boolean = false;
  @Output() toggleOpen = new EventEmitter<boolean>();

  isOpen: boolean = false;

  ngOnInit(): void {
    this.isOpen = this.defaultOpen;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.toggleOpen.emit(this.isOpen);
  }

  get expandState(): string {
    return this.isOpen ? 'expanded' : 'collapsed';
  }
}
