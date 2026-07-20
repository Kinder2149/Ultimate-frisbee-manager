# Dialog Components

Architecture de dialogues génériques pour créer des fenêtres modales cohérentes dans toute l'application. Cette architecture est composée de plusieurs composants et services travaillant ensemble.

## Installation

Les composants sont disponibles dans le dossier `shared/components/dialog`.

```typescript
import { DialogBaseComponent } from '@app/shared/components/dialog/dialog-base.component';
import { DialogService } from '@app/shared/components/dialog/dialog.service';
import { ConfirmDialogComponent } from '@app/shared/components/dialog/confirm-dialog/confirm-dialog.component';
import { DialogConfig } from '@app/shared/components/dialog/dialog-config.interface';
```

## Architecture

### 1. DialogBaseComponent

Composant de base que tous les dialogues spécifiques doivent étendre.

#### Propriétés héritées
- `data: any` - Données passées au dialogue
- `title: string` - Titre du dialogue
- `showCloseButton: boolean` - Affiche le bouton de fermeture
- `fullScreen: boolean` - Mode plein écran
- `dangerAction: boolean` - Indique si l'action principale est dangereuse

#### Méthodes héritées
- `close(result?: any): void` - Ferme le dialogue avec un résultat optionnel
- `cancel(): void` - Ferme le dialogue sans résultat

### 2. DialogService

Service pour ouvrir et gérer les dialogues.

#### Méthodes
- `open<T, R = any>(component: ComponentType<T>, config?: DialogConfig): MatDialogRef<T, R>` - Ouvre un dialogue
- `confirm(message: string, title?: string, dangerAction?: boolean): Observable<boolean>` - Ouvre un dialogue de confirmation

### 3. ConfirmDialogComponent

Composant préconfiguré pour les dialogues de confirmation (suppression, etc.).

#### Entrées (@Input)
- `message: string` - Message de confirmation
- `confirmLabel: string` - Texte du bouton de confirmation (défaut: 'Confirmer')
- `cancelLabel: string` - Texte du bouton d'annulation (défaut: 'Annuler')
- `dangerAction: boolean` - Style le bouton de confirmation en rouge pour les actions dangereuses

### 4. DialogConfig

Interface de configuration pour les dialogues.

```typescript
export interface DialogConfig {
  title?: string;
  data?: any;
  width?: string;
  height?: string;
  fullScreen?: boolean;
  disableClose?: boolean;
  showCloseButton?: boolean;
  panelClass?: string | string[];
  dangerAction?: boolean;
}
```

## Exemples d'utilisation

### Création d'un dialogue spécifique

1. Créez un composant qui étend DialogBaseComponent :

```typescript
@Component({
  selector: 'app-training-edit-dialog',
  templateUrl: './training-edit-dialog.component.html',
  styleUrls: ['./training-edit-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, ...],
})
export class TrainingEditDialogComponent extends DialogBaseComponent {
  form: FormGroup;
  
  constructor(
    private fb: FormBuilder
  ) {
    super();
    
    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required]
    });
  }
  
  save(): void {
    if (this.form.valid) {
      this.close(this.form.value);
    }
  }
}
```

2. Créez le service de dialogue associé :

```typescript
@Injectable({
  providedIn: 'root'
})
export class TrainingDialogService {
  constructor(private dialogService: DialogService) {}
  
  openEditDialog(training?: TrainingSimple): Observable<TrainingSimple> {
    return this.dialogService.open<TrainingEditDialogComponent, TrainingSimple>(
      TrainingEditDialogComponent,
      {
        title: training ? 'Modifier l\'entraînement' : 'Nouvel entraînement',
        data: training,
        width: '400px'
      }
    ).afterClosed();
  }
}
```

3. Utilisez le service dans un composant :

```typescript
@Component({...})
export class TrainingListComponent {
  constructor(private trainingDialogService: TrainingDialogService) {}
  
  editTraining(training: TrainingSimple): void {
    this.trainingDialogService.openEditDialog(training)
      .subscribe(result => {
        if (result) {
          // Traiter le résultat
        }
      });
  }
}
```

### Utilisation du dialogue de confirmation

```typescript
@Component({...})
export class TrainingListComponent {
  constructor(private dialogService: DialogService) {}
  
  deleteTraining(training: TrainingSimple): void {
    this.dialogService.confirm(
      `Voulez-vous vraiment supprimer l'entraînement "${training.name}" ?`,
      'Confirmation de suppression',
      true // Action dangereuse
    ).subscribe(confirmed => {
      if (confirmed) {
        // Procéder à la suppression
      }
    });
  }
}
```

## Bonnes pratiques

- Créez un service de dialogue spécifique pour chaque domaine fonctionnel (ex: TrainingDialogService)
- Définissez clairement les interfaces d'entrée et de sortie de chaque dialogue
- Utilisez `dangerAction: true` pour les actions destructrices comme la suppression
- Standardisez les tailles de dialogue pour une apparence cohérente
- Utilisez les états de chargement pour les opérations asynchrones

## Personnalisation

Pour personnaliser l'apparence des dialogues, vous pouvez :

1. Modifier les styles globaux dans le fichier de thème
2. Passer des classes personnalisées via la propriété `panelClass` de DialogConfig
3. Créer des variantes de DialogBaseComponent pour des cas d'usage spécifiques
