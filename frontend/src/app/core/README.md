# Core Module

Ce dossier contient les éléments centraux et partagés de l'application Ultimate Frisbee Manager.

## Structure

- **models/** - Interfaces et types partagés entre les différentes fonctionnalités de l'application
- **material/** - Configuration et importation des modules Angular Material
- **services/** - Services partagés accessibles à toute l'application

## Utilisation

Le module Core fournit des fonctionnalités partagées qui peuvent être utilisées par plusieurs modules de fonctionnalités (features).

Pour utiliser le Core Module dans un autre module :

```typescript
import { CoreModule } from '../../core/core.module';

@NgModule({
  imports: [
    CoreModule,
    // autres imports...
  ]
})
export class FeatureModule { }
```

## Conventions

- Toutes les interfaces sont documentées avec des commentaires JSDoc
- Les services sont injectables au niveau racine (`@Injectable({ providedIn: 'root' })`)
- Les modèles sont nommés avec le suffixe `.model.ts`
- Les services sont nommés avec le suffixe `.service.ts`