import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/**
 * Compose le titre de l'onglet : « Page · Ultimate Frisbee Manager ».
 * Sans titre de route, on retombe sur le nom du produit seul.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private static readonly NOM_PRODUIT = 'Ultimate Frisbee Manager';

  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titrePage = this.buildTitle(snapshot);
    this.title.setTitle(
      titrePage ? `${titrePage} · ${PageTitleStrategy.NOM_PRODUIT}` : PageTitleStrategy.NOM_PRODUIT
    );
  }
}
