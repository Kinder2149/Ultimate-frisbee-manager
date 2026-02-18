import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';

interface ContentType {
  type: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-mobile-create',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MobileHeaderComponent
  ],
  template: `
    <div class="mobile-create">
      <app-mobile-header
        title="Créer un contenu"
        [showBack]="true"
      ></app-mobile-header>

      <div class="content-types-list">
        <mat-list>
          <mat-list-item 
            *ngFor="let contentType of contentTypes"
            (click)="onSelectType(contentType.type)"
            class="content-type-item"
          >
            <mat-icon matListItemIcon>{{ contentType.icon }}</mat-icon>
            <div matListItemTitle>{{ contentType.label }}</div>
            <div matListItemLine>{{ contentType.description }}</div>
            <mat-icon matListItemMeta>chevron_right</mat-icon>
          </mat-list-item>
        </mat-list>
      </div>
    </div>
  `,
  styles: [`
    .mobile-create {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .content-types-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .content-type-item {
      margin-bottom: 12px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .content-type-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    ::ng-deep .content-type-item .mat-mdc-list-item-unscoped-content {
      padding: 16px;
    }
  `]
})
export class MobileCreateComponent implements OnInit {
  contentTypes: ContentType[] = [
    {
      type: 'exercice',
      label: 'Exercice',
      icon: 'fitness_center',
      description: 'Créer un nouvel exercice d\'entraînement'
    },
    {
      type: 'entrainement',
      label: 'Entraînement',
      icon: 'event',
      description: 'Composer une séance complète'
    },
    {
      type: 'echauffement',
      label: 'Échauffement',
      icon: 'directions_run',
      description: 'Créer une routine d\'échauffement'
    },
    {
      type: 'situation',
      label: 'Situation de match',
      icon: 'sports',
      description: 'Définir une situation de jeu'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const type = params['type'];
      if (type && this.isValidType(type)) {
        this.navigateToCreateForm(type);
      }
    });
  }

  onSelectType(type: string): void {
    this.navigateToCreateForm(type);
  }

  private navigateToCreateForm(type: string): void {
    this.router.navigate(['/mobile/create', type]);
  }

  private isValidType(type: string): boolean {
    return this.contentTypes.some(ct => ct.type === type);
  }
}
