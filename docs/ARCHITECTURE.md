# Architecture Technique - Ultimate Frisbee Manager

Ce document détaille l'architecture technique de l'application Ultimate Frisbee Manager, incluant les récentes améliorations apportées au système de gestion des exercices, des entraînements et des tags.

## Table des matières

1. [Architecture générale](#architecture-générale)
2. [Stack technique](#stack-technique)
3. [Organisation des dossiers](#organisation-des-dossiers)
4. [Module Core](#module-core)
   - [Services centralisés](#services-centralisés)
   - [Modèles de données](#modèles-de-données)
   - [Intercepteurs HTTP](#intercepteurs-http)
5. [Module Shared](#module-shared)
   - [Widgets réutilisables](#widgets-réutilisables)
6. [Modules de features](#modules-de-features)
   - [Gestion des exercices](#gestion-des-exercices)
   - [Gestion des entraînements](#gestion-des-entraînements)
   - [Système de tags](#système-de-tags)
7. [API Backend](#api-backend)
8. [Base de données](#base-de-données)
9. [Gestion des URL d'API](#gestion-des-url-dapi)
10. [Système de gestion d'état](#système-de-gestion-détat)
11. [Bonnes pratiques et patterns](#bonnes-pratiques-et-patterns)
12. [Améliorations récentes](#améliorations-récentes)

## Architecture générale

L'application Ultimate Frisbee Manager utilise une architecture full-stack moderne avec une séparation claire entre frontend et backend :

```
Ultimate-frisbee-manager/
├── frontend/               # Application Angular
│   └── src/app/
│       ├── core/           # Services, intercepteurs, modèles partagés
│       ├── shared/         # Composants réutilisables
│       ├── features/       # Modules fonctionnels par domaine
│       └── app.module.ts   # Module racine
├── backend/                # API Node.js
│   ├── controllers/        # Logique métier
│   ├── models/            # Modèles de données
│   └── prisma/            # Configuration base de données
└── docs/                  # Documentation
```

Cette architecture respecte les principes de modularité, réutilisabilité et séparation des préoccupations.

## Stack technique

### Frontend
- **Angular 17+** avec TypeScript
- **Angular Material** pour les composants UI
- **RxJS** pour la programmation réactive
- **Cypress** pour les tests end-to-end

### Backend
- **Node.js** avec Express.js
- **Prisma ORM** pour la gestion de base de données
- **SQLite** comme base de données de développement

### Outils de développement
- **ESLint** et **Prettier** pour la qualité du code
- **Git** pour le contrôle de version

## Organisation des dossiers

### Core

Le dossier `core` contient les éléments essentiels et transverses de l'application :

```
core/
├── interceptors/          # Intercepteurs HTTP
├── models/               # Modèles de données
├── services/             # Services globaux
└── core.module.ts        # Module Core avec configuration
```

### Shared

Le dossier `shared` contient les éléments réutilisables dans différentes parties de l'application :

```
shared/
├── widgets/              # Composants réutilisables
│   ├── training-card/    # Widget de carte d'entraînement
│   └── phase-form/       # Widget de formulaire de phase
├── directives/           # Directives partagées
└── pipes/                # Pipes partagés
```

### Features

Le dossier `features` organise le code par domaine fonctionnel :

```
features/
├── exercices/           # Module des exercices
├── tags/                # Module de gestion des tags
├── trainings/           # Module des entraînements
└── tags-advanced/       # Module avancé de gestion des tags
```

## Module Core

### Services centralisés

#### ApiUrlService

Service qui centralise la construction des URLs d'API pour éviter les erreurs de duplication de segments d'URL :

```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = environment.apiUrl;
  }

  /**
   * Construit une URL API complète à partir d'un chemin relatif
   */
  getUrl(path: string): string {
    // Normalise le chemin pour éviter les doublons de slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl}${normalizedPath}`;
  }
}
```

#### TrainingStateService

Service qui centralise la gestion d'état pour les entraînements et les tags :

```typescript
@Injectable({
  providedIn: 'root'
})
export class TrainingStateService {
  // État observable des entraînements
  private _trainings = new BehaviorSubject<Training[]>([]);
  trainings$ = this._trainings.asObservable();
  
  // État observable des tags
  private _trainingTags = new BehaviorSubject<TrainingTag[]>([]);
  trainingTags$ = this._trainingTags.asObservable();

  // Méthodes pour charger et manipuler les données...
}
```

### Modèles de données

Une hiérarchie de modèles standardisés a été mise en place :

```typescript
// Modèle de base avec les champs communs
export interface BaseModel {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Modèle d'exercice avec support d'images
export interface Exercice extends BaseModel {
  nom: string;
  description?: string;
  duree?: number;
  materiel?: string;
  imageUrl?: string;  // Nouveau champ pour les images
  variables?: any;
  variablesPlus?: string;
  variablesMinus?: string;
  tags?: Tag[];
}

// Modèle d'entraînement complet
export interface Training extends BaseModel {
  titre: string;
  description?: string;
  niveau?: string;
  duree?: number;
  date?: Date;
  phases?: Phase[];
  tags?: TrainingTag[];
}

// Modèle de phase d'entraînement
export interface Phase extends BaseModel {
  nom: string;
  description?: string;
  duree?: number;
  ordre: number;
  entrainementId: string;
  exercices?: PhaseExercice[];
}
```

### Intercepteurs HTTP

#### LoggingInterceptor

Intercepte et journalise toutes les requêtes HTTP pour faciliter le débogage :

```typescript
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`[HTTP Request] ${req.method} ${req.url}`);
    
    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            console.log(`[HTTP Response] ${req.method} ${req.url}`, {
              status: event.status,
              statusText: event.statusText
            });
          }
        },
        error: (error) => {
          console.error(`[HTTP Error] ${req.method} ${req.url}`, {
            status: error.status,
            statusText: error.statusText,
            message: error.message
          });
        }
      })
    );
  }
}
```

#### ErrorHandlerInterceptor

Centralise la gestion des erreurs HTTP avec notifications utilisateur :

```typescript
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage: string;
        
        // Personnalisation des messages d'erreur selon le code HTTP
        switch (error.status) {
          case 404:
            errorMessage = `Ressource introuvable : ${this.getResourceName(req.url)}`;
            break;
          case 400:
            errorMessage = 'Données invalides. Veuillez vérifier votre saisie.';
            break;
          // Autres cas...
          default:
            errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
        }
        
        // Affichage de la notification d'erreur
        this.notificationService.showError(errorMessage);
        
        // Propagation de l'erreur
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  private getResourceName(url: string): string {
    // Extraction du nom de la ressource à partir de l'URL
    const segments = url.split('/');
    return segments[segments.length - 1];
  }
}
```

## Module Shared

### Widgets réutilisables

#### TrainingCardComponent

Composant réutilisable pour afficher une carte d'entraînement :

```typescript
@Component({
  selector: 'app-training-card',
  standalone: true,
  // ...
})
export class TrainingCardComponent {
  @Input() training!: Training;
  @Output() edit = new EventEmitter<Training>();
  @Output() delete = new EventEmitter<Training>();
  // ...
}
```

#### PhaseFormComponent

Composant réutilisable pour les formulaires d'ajout/modification de phases :

```typescript
@Component({
  selector: 'app-phase-form',
  standalone: true,
  // ...
})
export class PhaseFormComponent implements OnInit {
  @Input() phase: Phase | null = null;
  @Output() formSubmit = new EventEmitter<{formData: PhaseFormData, isEditMode: boolean}>();
  // ...
}
```

## Modules de features

Chaque module de feature est organisé pour être indépendant et encapsule sa propre logique métier :

### Gestion des exercices

Le module `exercices` gère la création, modification et duplication des exercices :

**Fonctionnalités principales :**
- CRUD complet des exercices
- Support des images via le champ `imageUrl`
- Gestion des variables d'exercice (`variablesPlus`, `variablesMinus`)
- Système de tags pour catégoriser les exercices
- Duplication d'exercices avec tous leurs attributs

**Composants clés :**
- `ExerciceFormComponent` : Formulaire de création/modification
- `ExerciceListComponent` : Liste des exercices avec filtrage
- `ExerciceDetailComponent` : Vue détaillée d'un exercice

### Gestion des entraînements

Le module `trainings` gère les entraînements et leurs phases :

**Fonctionnalités principales :**
- CRUD complet des entraînements
- Gestion des phases d'entraînement
- Association d'exercices aux phases
- Système de tags spécifique aux entraînements
- Duplication d'entraînements avec phases et exercices
- Suppression optimiste avec gestion d'erreur

**Composants clés :**
- `EntrainementListComponent` : Liste avec suppression optimiste
- `EntrainementFormComponent` : Création/modification d'entraînements
- `PhaseFormComponent` : Gestion des phases (widget réutilisable)

### Système de tags

Deux systèmes de tags distincts sont implémentés :

**Tags d'exercices (`/api/tags`) :**
- Catégorisation des exercices
- Filtrage et recherche
- Gestion CRUD complète

**Tags d'entraînements (`/api/training-tags`) :**
- Catégorisation des entraînements
- Système séparé pour éviter les confusions
- Logique métier distincte

```typescript
@NgModule({
  declarations: [
    TrainingListComponent,
    TrainingDetailComponent,
    // ...
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: TrainingListComponent },
      { path: ':id', component: TrainingDetailComponent }
    ]),
    // ...
  ],
  providers: [
    // Services spécifiques à ce module
  ]
})
export class TrainingsModule { }
```

## API Backend

L'API REST est construite avec Node.js et Express, utilisant Prisma comme ORM :

### Endpoints principaux

**Exercices (`/api/exercices`) :**
- `GET /api/exercices` - Liste tous les exercices
- `POST /api/exercices` - Crée un nouvel exercice
- `GET /api/exercices/:id` - Récupère un exercice spécifique
- `PUT /api/exercices/:id` - Met à jour un exercice
- `DELETE /api/exercices/:id` - Supprime un exercice
- `POST /api/exercices/:id/duplicate` - Duplique un exercice

**Entraînements (`/api/entrainements`) :**
- `GET /api/entrainements` - Liste tous les entraînements
- `POST /api/entrainements` - Crée un nouvel entraînement
- `GET /api/entrainements/:id` - Récupère un entraînement avec ses phases
- `PUT /api/entrainements/:id` - Met à jour un entraînement
- `DELETE /api/entrainements/:id` - Supprime un entraînement (cascade)
- `POST /api/entrainements/:id/duplicate` - Duplique un entraînement complet

**Phases (`/api/entrainements/:id/phases`) :**
- `GET /api/entrainements/:id/phases` - Liste les phases d'un entraînement
- `POST /api/entrainements/:id/phases` - Ajoute une phase
- `PUT /api/entrainements/:entrainementId/phases/:phaseId` - Met à jour une phase
- `DELETE /api/entrainements/:entrainementId/phases/:phaseId` - Supprime une phase

**Tags (`/api/tags` et `/api/training-tags`) :**
- Endpoints CRUD complets pour les deux systèmes de tags
- Gestion séparée pour éviter les conflits

### Contrôleurs

Chaque contrôleur implémente la logique métier spécifique :

```javascript
// Exemple : exercice.controller.js
const createExercice = async (req, res) => {
  const { nom, description, duree, materiel, imageUrl, variables, variablesPlus, variablesMinus } = req.body;
  
  const exercice = await prisma.exercice.create({
    data: {
      nom,
      description,
      duree,
      materiel,
      imageUrl, // Support des images
      variables,
      variablesPlus,
      variablesMinus
    },
    include: { tags: true }
  });
  
  res.json(exercice);
};
```

## Base de données

La base de données utilise Prisma avec SQLite pour le développement :

### Schéma principal

```prisma
model Exercice {
  id              String    @id @default(cuid())
  nom             String
  description     String?
  duree           Int?
  materiel        String?
  imageUrl        String?   // Nouveau champ pour les images
  variables       Json?
  variablesPlus   String?
  variablesMinus  String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  tags            Tag[]
  phaseExercices  PhaseExercice[]
}

model Entrainement {
  id          String    @id @default(cuid())
  titre       String
  description String?
  niveau      String?
  duree       Int?
  date        DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  phases      Phase[]
  tags        TrainingTag[]
}

model Phase {
  id              String    @id @default(cuid())
  nom             String
  description     String?
  duree           Int?
  ordre           Int
  entrainementId  String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  entrainement    Entrainement @relation(fields: [entrainementId], references: [id], onDelete: Cascade)
  exercices       PhaseExercice[]
}
```

### Migrations

Les migrations Prisma gèrent l'évolution du schéma :
- Migration initiale avec les modèles de base
- Ajout du champ `imageUrl` aux exercices
- Optimisations des relations et index

## Gestion des URL d'API

Le problème initial d'erreur 404 venait d'une duplication de segments dans les URLs d'API. La solution mise en place centralise la construction des URLs via le service `ApiUrlService` :

```typescript
// Avant
const url = `${environment.apiUrl}/entrainements/entrainements`;  // Duplication !

// Après
const url = this.apiUrlService.getUrl('/entrainements');  // Construction sécurisée
```

## Système de gestion d'état

Le service `TrainingStateService` met en place une gestion d'état simple et efficace basée sur les observables RxJS :

```typescript
// Dans un composant consommateur
export class TrainingListComponent implements OnInit {
  trainings: Training[] = [];
  
  constructor(private trainingState: TrainingStateService) {}
  
  ngOnInit(): void {
    // Souscription à l'état centralisé
    this.trainingState.trainings$.subscribe(trainings => {
      this.trainings = trainings;
    });
    
    // Chargement des données
    this.trainingState.loadTrainings();
  }
}
```

## Bonnes pratiques et patterns

### Composants Standalone

Les nouveaux composants sont créés en utilisant le pattern "standalone" d'Angular pour faciliter leur réutilisation :

```typescript
@Component({
  selector: 'app-training-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Autres dépendances
  ],
  // ...
})
export class TrainingCardComponent { }
```

### Lazy Loading

L'application utilise le lazy loading pour charger les modules de feature à la demande :

```typescript
const routes: Routes = [
  { path: 'entrainements', loadChildren: () => import('./features/trainings/trainings.module').then(m => m.TrainingsModule) },
  // ...
];
```

### Intercepteurs HTTP

La configuration des intercepteurs est centralisée dans le CoreModule :

```typescript
@NgModule({
  // ...
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerInterceptor, multi: true },
    // ...
  ]
})
export class CoreModule { }
```

## Améliorations récentes

### Support des images pour les exercices
- Ajout du champ `imageUrl` dans le modèle Prisma
- Mise à jour de l'interface TypeScript
- Intégration dans le formulaire de création/modification
- Support dans les contrôleurs backend (création, mise à jour, duplication)

### Correction de la suppression optimiste
- Fix du bug 404 lors de la suppression d'entraînements
- Restauration de la liste originale en cas d'erreur
- Amélioration de l'expérience utilisateur

### Alignement des services frontend/backend
- Correction des URLs d'API dans `PhaseOptimizedService`
- Harmonisation des routes avec le backend réel
- Amélioration de la cohérence des données

### Gestion améliorée des variables d'exercice
- Support des formats legacy et nouveaux
- Migration transparente des données existantes
- Amélioration de la flexibilité du système

### Documentation et planification
- Mise à jour complète du plan de développement
- Refactoring de la documentation technique
- Clarification de l'architecture et des fonctionnalités

## Conclusion

Cette architecture a été conçue pour offrir une solution robuste et maintenable. Les principes suivants ont été appliqués :

- **Centralisation** : Services et modèles centralisés pour éviter les duplications
- **Réutilisabilité** : Widgets et composants réutilisables dans l'application
- **Séparation des préoccupations** : Organisation claire par fonctionnalité
- **Gestion d'état** : Utilisation des observables pour une gestion d'état réactive
- **Traçabilité** : Intercepteurs HTTP pour faciliter le débogage
- **Évolutivité** : Architecture modulaire permettant l'ajout de nouvelles fonctionnalités
- **Qualité** : Tests, linting et bonnes pratiques de développement
