import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mobile-coming-soon',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './mobile-coming-soon.component.html',
  styleUrls: ['./mobile-coming-soon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileComingSoonComponent implements OnInit {
  featureName = '';
  featureIcon = 'info';
  featureDescription = '';

  private featureConfig: Record<string, { name: string; icon: string; description: string }> = {
    profil: {
      name: 'Profil',
      icon: 'person',
      description: 'Consultez et modifiez vos informations personnelles, vos préférences et vos paramètres de compte.'
    },
    tags: {
      name: 'Gestion des tags',
      icon: 'label',
      description: 'Créez, modifiez et organisez vos tags pour mieux catégoriser vos contenus.'
    },
    admin: {
      name: 'Administration',
      icon: 'admin_panel_settings',
      description: 'Accédez aux fonctionnalités d\'administration pour gérer les utilisateurs, les workspaces et les paramètres globaux.'
    }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const feature = params['feature'];
      if (feature && this.featureConfig[feature]) {
        const config = this.featureConfig[feature];
        this.featureName = config.name;
        this.featureIcon = config.icon;
        this.featureDescription = config.description;
      } else {
        this.featureName = 'Fonctionnalité';
        this.featureIcon = 'info';
        this.featureDescription = 'Cette fonctionnalité sera bientôt disponible.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/mobile']);
  }
}
