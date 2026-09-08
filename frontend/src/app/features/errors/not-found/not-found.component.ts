import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="introuvable">
      <mat-icon class="introuvable__icone">explore_off</mat-icon>
      <h1 class="introuvable__titre">Cette page n’existe pas</h1>
      <p class="introuvable__texte">
        Le lien est peut-être erroné, ou la page a été déplacée.
      </p>
      <a mat-raised-button color="primary" routerLink="/dashboard">
        <mat-icon>home</mat-icon>
        Revenir à l’accueil
      </a>
    </div>
  `,
  styles: [`
    .introuvable {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 64px 24px;
      text-align: center;
    }
    .introuvable__icone {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #94a3b8;
    }
    .introuvable__titre {
      margin: 0;
      font-size: 24px;
      color: #1e293b;
    }
    .introuvable__texte {
      margin: 0;
      max-width: 420px;
      color: #64748b;
    }
  `]
})
export class NotFoundComponent {}
