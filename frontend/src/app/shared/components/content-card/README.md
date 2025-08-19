# Content Card Component

Composant de carte standard pour afficher du contenu avec un titre, une section principale et un en-tête/pied personnalisable.

## Installation

Le composant est disponible en tant que composant standalone dans le dossier `shared/components/content-card`.

```typescript
import { ContentCardComponent } from '@app/shared/components/content-card/content-card.component';
```

## API

### Entrées (@Input)
- `title: string` - Titre de la carte (défaut: '')
- `subtitle: string` - Sous-titre optionnel de la carte (défaut: '')
- `elevation: number` - Niveau d'élévation/ombre (1-24) (défaut: 2)
- `rounded: boolean` - Si les coins sont arrondis (défaut: true)
- `bordered: boolean` - Si la carte a une bordure (défaut: false)
- `padding: boolean` - Si le contenu a un padding interne (défaut: true)
- `hideTitle: boolean` - Cache le titre mais conserve l'espace d'en-tête (défaut: false)
- `color: string` - Couleur d'accentuation (défaut: primary)
- `titleColor: string` - Couleur du texte du titre (défaut: '')

## Emplacements de contenu (ng-content)

Le composant fournit plusieurs emplacements de contenu identifiés par des sélecteurs :

- `[card-title]` - Contenu personnalisé pour le titre (remplace le titre texte)
- `[card-subtitle]` - Contenu personnalisé pour le sous-titre
- `[card-header]` - Contenu d'en-tête personnalisé
- `[card-actions]` - Actions à afficher dans l'en-tête (ex: boutons)
- `[card-content]` - Contenu principal de la carte
- `[card-footer]` - Pied de carte

## Exemples d'utilisation

### Carte simple avec titre et contenu
```html
<app-content-card title="Mon titre">
  <div card-content>
    Voici le contenu principal de ma carte.
  </div>
</app-content-card>
```

### Carte complète avec tous les emplacements
```html
<app-content-card 
  title="Statistiques d'entraînement" 
  subtitle="Période: Jan-Mars 2025"
  [elevation]="4"
  color="accent">
  
  <div card-header>
    <div class="header-image"></div>
  </div>
  
  <div card-actions>
    <button mat-icon-button>
      <mat-icon>refresh</mat-icon>
    </button>
    <button mat-icon-button>
      <mat-icon>more_vert</mat-icon>
    </button>
  </div>
  
  <div card-content>
    <p>Nombre d'entraînements: 24</p>
    <p>Participants: 156</p>
    <p>Heures totales: 48</p>
  </div>
  
  <div card-footer>
    <button mat-button color="primary">Voir détails</button>
  </div>
</app-content-card>
```

### Avec titre personnalisé
```html
<app-content-card>
  <h2 card-title>
    <mat-icon>sports</mat-icon> 
    Titre personnalisé
  </h2>
  
  <div card-content>
    Contenu de la carte.
  </div>
</app-content-card>
```

## Intégration avec d'autres composants

Le composant ContentCard fonctionne bien avec les composants suivants :
- `ActionBarComponent` dans l'emplacement `card-actions`
- `MatButtonModule` pour les boutons d'action
- `AlertComponent` dans l'emplacement `card-content`

## Personnalisation

Pour modifier l'apparence globale des cartes, vous pouvez surcharger les variables CSS suivantes dans votre fichier de thème :

```scss
:root {
  --content-card-bg: #ffffff;
  --content-card-border-radius: 8px;
  --content-card-padding: 16px;
  --content-card-header-padding: 16px 16px 0 16px;
  --content-card-title-font-size: 1.25rem;
  --content-card-subtitle-font-size: 0.875rem;
}
```
