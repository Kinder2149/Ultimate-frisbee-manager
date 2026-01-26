# 🎨 AUDIT FRONTEND ANGULAR

**Date** : 26 janvier 2026  
**Statut** : ⏳ En cours d'analyse

---

## 🎯 OBJECTIF

Vérifier que le frontend Angular est **bien structuré et maintenable** :
- Architecture des composants cohérente
- Services et state management appropriés
- Routing et guards fonctionnels
- Gestion des formulaires robuste
- Communication avec l'API efficace

---

## 🏗️ ARCHITECTURE ANGULAR

### Version et Configuration

```json
{
  "@angular/core": "^17.0.0",
  "@angular/material": "^17.0.0"
}
```

**Points de Vérification** :
- [ ] Angular 17 avec standalone components ou modules ?
- [ ] TypeScript strict mode activé
- [ ] Configuration de build optimisée

---

## 📂 STRUCTURE DES COMPOSANTS

### Organisation par Feature

```
src/app/
├── auth/                    # Module d'authentification
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.scss
│   ├── auth.service.ts
│   ├── auth.guard.ts
│   └── auth.interceptor.ts
│
├── exercices/               # Feature exercices
│   ├── exercice-list/
│   ├── exercice-detail/
│   ├── exercice-form/
│   └── exercice.service.ts
│
├── entrainements/           # Feature entraînements
│   ├── entrainement-list/
│   ├── entrainement-detail/
│   ├── entrainement-form/
│   └── entrainement.service.ts
│
├── echauffements/           # Feature échauffements
│   ├── echauffement-list/
│   ├── echauffement-detail/
│   ├── echauffement-form/
│   └── echauffement.service.ts
│
├── situations-matchs/       # Feature situations
│   ├── situation-list/
│   ├── situation-detail/
│   ├── situation-form/
│   └── situation.service.ts
│
├── dashboard/               # Tableau de bord
│   └── dashboard.component.ts
│
├── components/              # Composants réutilisables
│   ├── header/
│   ├── navigation/
│   ├── tag-selector/
│   └── image-upload/
│
└── services/                # Services partagés
    ├── api.service.ts
    ├── notification.service.ts
    └── loading.service.ts
```

### Points de Vérification
- [ ] Architecture modulaire par feature
- [ ] Composants réutilisables centralisés
- [ ] Services partagés dans `services/`
- [ ] Pas de duplication de code
- [ ] Nommage cohérent (kebab-case)

---

## 🔐 AUTHENTIFICATION

### AuthService

**Responsabilités** :
- Connexion / Déconnexion
- Stockage des tokens (localStorage)
- Refresh automatique des tokens
- Gestion du profil utilisateur

**Points de Vérification** :
- [ ] Login retourne Observable<User>
- [ ] Tokens stockés dans localStorage
- [ ] Méthode `isAuthenticated()` disponible
- [ ] Méthode `getToken()` pour l'interceptor
- [ ] Refresh automatique avant expiration
- [ ] Déconnexion nettoie le localStorage

```typescript
// Exemple attendu
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  login(email: string, password: string): Observable<User> { }
  logout(): void { }
  refreshToken(): Observable<string> { }
  isAuthenticated(): boolean { }
  getToken(): string | null { }
}
```

### AuthGuard

**Responsabilités** :
- Protéger les routes nécessitant authentification
- Rediriger vers `/login` si non authentifié

**Points de Vérification** :
- [ ] Implémente `CanActivate`
- [ ] Vérifie `authService.isAuthenticated()`
- [ ] Redirige vers `/login` avec `returnUrl`
- [ ] Appliqué sur toutes les routes protégées

```typescript
// Exemple attendu
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
```

### AuthInterceptor

**Responsabilités** :
- Ajouter le token JWT à chaque requête API
- Gérer le refresh automatique si token expiré
- Déconnecter si refresh échoue

**Points de Vérification** :
- [ ] Implémente `HttpInterceptor`
- [ ] Ajoute header `Authorization: Bearer <token>`
- [ ] Gère les erreurs 401 (token expiré)
- [ ] Retry automatique après refresh
- [ ] Déconnexion si refresh échoue

```typescript
// Exemple attendu
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req).pipe(
      catchError(error => {
        if (error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }
}
```

---

## 🌐 SERVICES

### Services par Feature

#### ExerciceService

**Responsabilités** :
- CRUD exercices
- Upload d'images
- Filtrage par tags
- Recherche textuelle

**Points de Vérification** :
- [ ] Méthodes CRUD complètes (getAll, getById, create, update, delete)
- [ ] Retourne des Observables
- [ ] Gestion des erreurs (catchError)
- [ ] Upload d'image avec FormData
- [ ] Filtres par tags (query params)

```typescript
@Injectable({ providedIn: 'root' })
export class ExerciceService {
  getAll(filters?: { tags?: string[], search?: string }): Observable<Exercice[]> { }
  getById(id: string): Observable<Exercice> { }
  create(exercice: Partial<Exercice>): Observable<Exercice> { }
  update(id: string, exercice: Partial<Exercice>): Observable<Exercice> { }
  delete(id: string): Observable<void> { }
  uploadImage(id: string, file: File): Observable<string> { }
}
```

#### EntrainementService

**Responsabilités** :
- CRUD entraînements
- Gestion des exercices/échauffements/situations
- Export (JSON, Markdown)

**Points de Vérification** :
- [ ] Méthodes CRUD complètes
- [ ] Méthodes pour ajouter/modifier/supprimer des éléments
- [ ] Méthode d'export avec format (json/md)
- [ ] Gestion de l'ordre des éléments

### Services Partagés

#### NotificationService

**Responsabilités** :
- Afficher des toasts/snackbars
- Messages de succès/erreur/info

**Points de Vérification** :
- [ ] Méthodes `success()`, `error()`, `info()`
- [ ] Utilise MatSnackBar
- [ ] Durée configurable
- [ ] Position configurable

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string, duration = 3000): void { }
  error(message: string, duration = 5000): void { }
  info(message: string, duration = 3000): void { }
}
```

#### LoadingService

**Responsabilités** :
- Gérer l'état de chargement global
- Afficher un spinner

**Points de Vérification** :
- [ ] Observable `loading$` pour l'état
- [ ] Méthodes `show()` et `hide()`
- [ ] Compteur pour gérer plusieurs requêtes simultanées

---

## 🧩 COMPOSANTS

### Composants de Liste

#### ExerciceListComponent

**Responsabilités** :
- Afficher la liste des exercices
- Filtrer par tags
- Rechercher
- Naviguer vers le détail

**Points de Vérification** :
- [ ] Charge les exercices au `ngOnInit()`
- [ ] Affiche un loader pendant le chargement
- [ ] Gère le cas "aucun exercice"
- [ ] Filtres fonctionnels (tags, recherche)
- [ ] Pagination si nécessaire
- [ ] Actions rapides (modifier, supprimer)

```typescript
@Component({
  selector: 'app-exercice-list',
  templateUrl: './exercice-list.component.html'
})
export class ExerciceListComponent implements OnInit {
  exercices$: Observable<Exercice[]>;
  loading = false;
  selectedTags: string[] = [];
  searchTerm = '';

  ngOnInit(): void {
    this.loadExercices();
  }

  loadExercices(): void { }
  onFilterChange(): void { }
  onDelete(id: string): void { }
}
```

### Composants de Détail

#### ExerciceDetailComponent

**Responsabilités** :
- Afficher le détail complet d'un exercice
- Actions (modifier, supprimer)

**Points de Vérification** :
- [ ] Récupère l'ID depuis la route (ActivatedRoute)
- [ ] Charge l'exercice au `ngOnInit()`
- [ ] Affiche toutes les informations
- [ ] Boutons "Modifier" et "Supprimer"
- [ ] Confirmation avant suppression
- [ ] Redirection après suppression

### Composants de Formulaire

#### ExerciceFormComponent

**Responsabilités** :
- Créer ou modifier un exercice
- Validation des champs
- Upload d'image
- Gestion des tags

**Points de Vérification** :
- [ ] Reactive Forms (FormBuilder)
- [ ] Validation des champs obligatoires
- [ ] Pré-remplissage en mode édition
- [ ] Upload d'image avec preview
- [ ] Sélection de tags (autocomplete)
- [ ] Éditeur riche pour description (Quill)
- [ ] Boutons "Sauvegarder" et "Annuler"
- [ ] Désactivation du bouton si formulaire invalide
- [ ] Gestion des erreurs de soumission

```typescript
@Component({
  selector: 'app-exercice-form',
  templateUrl: './exercice-form.component.html'
})
export class ExerciceFormComponent implements OnInit {
  exerciceForm: FormGroup;
  isEditMode = false;
  exerciceId?: string;

  constructor(private fb: FormBuilder) {
    this.exerciceForm = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      objectif: [''],
      dureeEstimee: [null, Validators.min(0)],
      tags: [[]]
    });
  }

  ngOnInit(): void {
    this.exerciceId = this.route.snapshot.params['id'];
    if (this.exerciceId) {
      this.isEditMode = true;
      this.loadExercice();
    }
  }

  onSubmit(): void { }
  onImageUpload(file: File): void { }
}
```

---

## 🎨 COMPOSANTS RÉUTILISABLES

### TagSelectorComponent

**Responsabilités** :
- Sélection de tags avec autocomplete
- Affichage des tags sélectionnés (chips)
- Ajout/suppression de tags

**Points de Vérification** :
- [ ] Input `selectedTags` (two-way binding)
- [ ] Output `tagsChange` pour notifier le parent
- [ ] Autocomplete avec filtrage
- [ ] Chips Material Design
- [ ] Possibilité de créer un nouveau tag

### ImageUploadComponent

**Responsabilités** :
- Zone de drag & drop
- Bouton "Parcourir"
- Preview de l'image
- Validation (type, taille)

**Points de Vérification** :
- [ ] Drag & drop fonctionnel
- [ ] Preview de l'image uploadée
- [ ] Validation du type (jpg, png, webp)
- [ ] Validation de la taille (max 5 MB)
- [ ] Output `fileSelected` pour notifier le parent
- [ ] Barre de progression si upload long

---

## 🛣️ ROUTING

### Configuration des Routes

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'exercices', 
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ExerciceListComponent },
      { path: 'new', component: ExerciceFormComponent },
      { path: ':id', component: ExerciceDetailComponent },
      { path: ':id/edit', component: ExerciceFormComponent }
    ]
  },
  // ... autres routes
  { path: '**', redirectTo: '/dashboard' }
];
```

**Points de Vérification** :
- [ ] Toutes les routes définies
- [ ] AuthGuard appliqué sur les routes protégées
- [ ] Lazy loading des modules (si applicable)
- [ ] Route par défaut (redirect)
- [ ] Route 404 (wildcard)
- [ ] Paramètres de route correctement utilisés

---

## 📝 FORMULAIRES

### Reactive Forms

**Points de Vérification** :
- [ ] FormBuilder utilisé
- [ ] Validators appropriés (required, min, max, email, etc.)
- [ ] Custom validators si nécessaire
- [ ] Gestion des erreurs de validation
- [ ] Messages d'erreur clairs
- [ ] Désactivation du submit si invalide

### Validation

```typescript
// Exemple de validation
this.exerciceForm = this.fb.group({
  titre: ['', [Validators.required, Validators.minLength(3)]],
  dureeEstimee: [null, [Validators.min(0), Validators.max(300)]],
  email: ['', [Validators.email]]
});

// Affichage des erreurs
get titre() { return this.exerciceForm.get('titre'); }

// Template
<mat-error *ngIf="titre?.hasError('required')">
  Le titre est obligatoire
</mat-error>
<mat-error *ngIf="titre?.hasError('minlength')">
  Le titre doit contenir au moins 3 caractères
</mat-error>
```

### Éditeur Riche (Quill)

**Configuration** :
```typescript
quillConfig = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'header': [1, 2, 3, false] }],
    ['link']
  ]
};
```

**Points de Vérification** :
- [ ] ngx-quill configuré
- [ ] Toolbar personnalisé
- [ ] Contenu HTML sauvegardé correctement
- [ ] Affichage correct dans les détails (innerHTML)
- [ ] Sanitization du HTML (DomSanitizer)

---

## 🎨 STYLES ET THEMING

### Angular Material Theme

**Points de Vérification** :
- [ ] Thème Material défini dans `styles.scss`
- [ ] Palette de couleurs personnalisée
- [ ] Typographie configurée
- [ ] Variables CSS pour les couleurs récurrentes

```scss
// styles.scss
@use '@angular/material' as mat;

$primary: mat.define-palette(mat.$indigo-palette);
$accent: mat.define-palette(mat.$pink-palette);
$theme: mat.define-light-theme((
  color: (
    primary: $primary,
    accent: $accent,
  )
));

@include mat.all-component-themes($theme);
```

### Responsive Design

**Points de Vérification** :
- [ ] Media queries dans `mobile-optimizations.scss`
- [ ] Breakpoints cohérents (768px, 1024px)
- [ ] Navigation adaptée sur mobile (bulles)
- [ ] Cartes adaptées (densité réduite)
- [ ] Formulaires utilisables sur mobile

---

## 🔄 STATE MANAGEMENT

### Approche Actuelle

**Sans NgRx/Akita** :
- Services avec BehaviorSubject
- Observables pour la communication
- LocalStorage pour la persistance

**Points de Vérification** :
- [ ] État partagé géré par des services
- [ ] BehaviorSubject pour l'état réactif
- [ ] Observables exposés (pas les subjects)
- [ ] Pas de duplication d'état

```typescript
// Exemple
@Injectable({ providedIn: 'root' })
export class ExerciceStateService {
  private exercicesSubject = new BehaviorSubject<Exercice[]>([]);
  public exercices$ = this.exercicesSubject.asObservable();

  setExercices(exercices: Exercice[]): void {
    this.exercicesSubject.next(exercices);
  }

  addExercice(exercice: Exercice): void {
    const current = this.exercicesSubject.value;
    this.exercicesSubject.next([...current, exercice]);
  }
}
```

---

## 🧪 GESTION DES ERREURS

### Error Handling

**Points de Vérification** :
- [ ] Interceptor global pour les erreurs HTTP
- [ ] Messages d'erreur affichés (NotificationService)
- [ ] Logs des erreurs (console.error)
- [ ] Retry automatique pour certaines erreurs (réseau)
- [ ] Fallback UI en cas d'erreur

```typescript
// Exemple dans un service
getExercices(): Observable<Exercice[]> {
  return this.http.get<Exercice[]>(`${this.apiUrl}/exercices`).pipe(
    catchError(error => {
      this.notificationService.error('Erreur lors du chargement des exercices');
      console.error('Error loading exercices:', error);
      return of([]); // Retourne un tableau vide en cas d'erreur
    })
  );
}
```

---

## 📦 TYPES ET INTERFACES

### Utilisation de @ufm/shared

**Points de Vérification** :
- [ ] Types importés depuis `@ufm/shared`
- [ ] Pas de duplication de types
- [ ] Types cohérents avec le backend

```typescript
import { Exercice, Tag, UserRole } from '@ufm/shared';
```

### Types Locaux

**Points de Vérification** :
- [ ] Types spécifiques au frontend dans `types/`
- [ ] Interfaces pour les formulaires
- [ ] Types pour les états de chargement

```typescript
// types/form-state.ts
export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}
```

---

## 🎯 CHECKLIST FRONTEND

### Architecture
- [ ] Structure modulaire par feature
- [ ] Composants réutilisables centralisés
- [ ] Services partagés appropriés
- [ ] Pas de duplication de code

### Authentification
- [ ] AuthService complet
- [ ] AuthGuard protège les routes
- [ ] AuthInterceptor ajoute le token
- [ ] Refresh automatique fonctionnel

### Composants
- [ ] Liste, détail, formulaire pour chaque entité
- [ ] Composants réutilisables (tags, upload)
- [ ] Gestion des états (loading, error, empty)
- [ ] Feedback utilisateur (toasts, spinners)

### Formulaires
- [ ] Reactive Forms utilisés
- [ ] Validation appropriée
- [ ] Messages d'erreur clairs
- [ ] Éditeur riche fonctionnel

### Routing
- [ ] Toutes les routes définies
- [ ] AuthGuard appliqué
- [ ] Lazy loading (si applicable)
- [ ] Navigation cohérente

### Styles
- [ ] Material Design cohérent
- [ ] Responsive design fonctionnel
- [ ] Thème personnalisé
- [ ] Animations douces

### Performance
- [ ] Lazy loading des modules
- [ ] OnPush change detection (si applicable)
- [ ] Unsubscribe des Observables (async pipe ou takeUntil)
- [ ] Pas de memory leaks

---

## 🎯 ACTIONS PRIORITAIRES

### 🔴 BLOQUANT

1. **Vérifier l'authentification complète**
   - AuthService, AuthGuard, AuthInterceptor
   - Refresh automatique
   - Gestion des erreurs 401

2. **Tester les formulaires**
   - Validation fonctionnelle
   - Soumission correcte
   - Gestion des erreurs

### 🟠 MAJEUR

3. **Vérifier les composants de liste**
   - Chargement des données
   - Filtres et recherche
   - Actions (modifier, supprimer)

4. **Valider le responsive**
   - Navigation mobile
   - Formulaires sur mobile
   - Cartes adaptées

### 🟡 MINEUR

5. **Optimiser les performances**
   - Lazy loading
   - Change detection
   - Unsubscribe

6. **Améliorer l'accessibilité**
   - Navigation au clavier
   - ARIA labels
   - Contraste

---

**Statut** : ⏳ Analyse en cours  
**Prochaine étape** : Auditer les tests et la qualité du code
