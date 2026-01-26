# 🧪 AUDIT TESTS & QUALITÉ

**Date** : 26 janvier 2026  
**Statut** : ⏳ En cours d'analyse

---

## 🎯 OBJECTIF

Vérifier la **qualité et la couverture des tests** :
- Tests unitaires backend et frontend
- Tests d'intégration API
- Tests E2E (Cypress)
- Couverture de code
- Qualité du code (linting, formatting)

---

## 🧪 TESTS BACKEND

### Tests Unitaires

#### Configuration Jest

```json
// backend/package.json
{
  "scripts": {
    "test": "cross-env NODE_ENV=test jest --testTimeout=10000 --detectOpenHandles"
  }
}
```

**Points de Vérification** :
- [ ] Jest configuré
- [ ] Timeout approprié (10s)
- [ ] Détection des handles ouverts
- [ ] Environment de test séparé

#### Tests Existants

**Fichiers de test** :
```
backend/__tests__/
├── admin-list.test.js
├── auth-login.test.js
├── exercice-upload.test.js
├── [+2 autres fichiers]
```

**À vérifier** :
- [ ] Tests pour l'authentification (login, logout, refresh)
- [ ] Tests pour les exercices (CRUD)
- [ ] Tests pour l'upload d'images
- [ ] Tests pour les routes admin
- [ ] Tests pour les autres entités (échauffements, situations, entraînements)

#### Couverture Attendue

| Module | Couverture Cible | Statut |
|--------|------------------|--------|
| **Controllers** | > 80% | ⏳ |
| **Services** | > 80% | ⏳ |
| **Middleware** | > 90% | ⏳ |
| **Routes** | > 70% | ⏳ |
| **Utils** | > 80% | ⏳ |

#### Exemple de Test

```javascript
// backend/__tests__/auth-login.test.js
describe('POST /api/auth/login', () => {
  it('should return tokens with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@ultimate.com',
        password: 'Ultim@t+'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('user');
  });

  it('should return 401 with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@ultimate.com',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
  });

  it('should return 400 with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ultimate.com' });
    
    expect(response.status).toBe(400);
  });
});
```

### Tests d'Intégration

#### Tests HTTP

**Fichiers de test** :
```
tests/http/
├── 01-health.http
├── 02-auth.http
├── 03-workspaces.http
├── [+9 autres fichiers]
```

**Points de Vérification** :
- [ ] Tests pour tous les endpoints
- [ ] Variables d'environnement (baseUrl, token)
- [ ] Scénarios complets (création → modification → suppression)
- [ ] Tests des cas d'erreur

#### Exemple de Test HTTP

```http
### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@ultimate.com",
  "password": "Ultim@t+"
}

### Créer un exercice
POST {{baseUrl}}/api/exercices
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "titre": "Test Exercice",
  "description": "Description test",
  "dureeEstimee": 15
}

### Vérifier la création
GET {{baseUrl}}/api/exercices/{{exerciceId}}
Authorization: Bearer {{token}}

### Supprimer
DELETE {{baseUrl}}/api/exercices/{{exerciceId}}
Authorization: Bearer {{token}}
```

---

## 🎨 TESTS FRONTEND

### Tests Unitaires Angular

#### Configuration Karma/Jasmine

```json
// frontend/package.json
{
  "scripts": {
    "test": "ng test"
  }
}
```

**Points de Vérification** :
- [ ] Karma configuré
- [ ] Jasmine pour les assertions
- [ ] Coverage reporter activé
- [ ] Tests exécutables en CI

#### Tests Attendus

**Par composant** :
- [ ] Tests de rendu (template)
- [ ] Tests d'interaction (click, input)
- [ ] Tests de navigation
- [ ] Tests des Observables

**Par service** :
- [ ] Tests des méthodes HTTP
- [ ] Tests de la gestion d'erreurs
- [ ] Tests du state management
- [ ] Mocks des dépendances

#### Exemple de Test Composant

```typescript
// exercice-list.component.spec.ts
describe('ExerciceListComponent', () => {
  let component: ExerciceListComponent;
  let fixture: ComponentFixture<ExerciceListComponent>;
  let exerciceService: jasmine.SpyObj<ExerciceService>;

  beforeEach(() => {
    const exerciceServiceSpy = jasmine.createSpyObj('ExerciceService', ['getAll', 'delete']);
    
    TestBed.configureTestingModule({
      declarations: [ExerciceListComponent],
      providers: [
        { provide: ExerciceService, useValue: exerciceServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(ExerciceListComponent);
    component = fixture.componentInstance;
    exerciceService = TestBed.inject(ExerciceService) as jasmine.SpyObj<ExerciceService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load exercices on init', () => {
    const mockExercices = [{ id: '1', titre: 'Test' }];
    exerciceService.getAll.and.returnValue(of(mockExercices));

    component.ngOnInit();

    expect(exerciceService.getAll).toHaveBeenCalled();
    expect(component.exercices).toEqual(mockExercices);
  });

  it('should delete exercice', () => {
    exerciceService.delete.and.returnValue(of(void 0));

    component.onDelete('1');

    expect(exerciceService.delete).toHaveBeenCalledWith('1');
  });
});
```

#### Exemple de Test Service

```typescript
// exercice.service.spec.ts
describe('ExerciceService', () => {
  let service: ExerciceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExerciceService]
    });

    service = TestBed.inject(ExerciceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch exercices', () => {
    const mockExercices = [{ id: '1', titre: 'Test' }];

    service.getAll().subscribe(exercices => {
      expect(exercices).toEqual(mockExercices);
    });

    const req = httpMock.expectOne(`${service.apiUrl}/exercices`);
    expect(req.request.method).toBe('GET');
    req.flush(mockExercices);
  });

  it('should handle error', () => {
    service.getAll().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne(`${service.apiUrl}/exercices`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
```

---

## 🎭 TESTS E2E (CYPRESS)

### Configuration

```json
// frontend/package.json
{
  "devDependencies": {
    "cypress": "^14.5.4"
  }
}
```

**Structure** :
```
frontend/cypress/
├── e2e/           # Tests E2E
├── fixtures/      # Données de test
└── support/       # Commandes custom
```

### Tests E2E Attendus

#### Parcours Critiques

| Parcours | Fichier | Statut |
|----------|---------|--------|
| **Connexion** | auth.cy.ts | ⏳ |
| **Créer exercice** | exercice-create.cy.ts | ⏳ |
| **Modifier exercice** | exercice-edit.cy.ts | ⏳ |
| **Supprimer exercice** | exercice-delete.cy.ts | ⏳ |
| **Créer entraînement** | entrainement-create.cy.ts | ⏳ |
| **Filtrer par tags** | filter.cy.ts | ⏳ |
| **Navigation** | navigation.cy.ts | ⏳ |

#### Exemple de Test E2E

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login with valid credentials', () => {
    cy.get('input[name="email"]').type('admin@ultimate.com');
    cy.get('input[name="password"]').type('Ultim@t+');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Tableau de bord').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[name="email"]').type('admin@ultimate.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Identifiants incorrects').should('be.visible');
  });

  it('should logout', () => {
    // Login first
    cy.login('admin@ultimate.com', 'Ultim@t+');

    // Logout
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout"]').click();

    cy.url().should('include', '/login');
  });
});
```

```typescript
// cypress/e2e/exercice-create.cy.ts
describe('Create Exercice', () => {
  beforeEach(() => {
    cy.login('admin@ultimate.com', 'Ultim@t+');
    cy.visit('/exercices/new');
  });

  it('should create exercice with all fields', () => {
    cy.get('input[name="titre"]').type('Test Exercice E2E');
    cy.get('textarea[name="description"]').type('Description test');
    cy.get('input[name="dureeEstimee"]').type('15');
    
    // Upload image
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.jpg');
    
    // Add tags
    cy.get('[data-cy="tag-selector"]').click();
    cy.contains('Passes').click();
    
    cy.get('button[type="submit"]').click();

    cy.url().should('match', /\/exercices\/[a-f0-9-]+$/);
    cy.contains('Test Exercice E2E').should('be.visible');
  });

  it('should show validation error if title is empty', () => {
    cy.get('button[type="submit"]').click();

    cy.contains('Le titre est obligatoire').should('be.visible');
  });
});
```

### Commandes Custom Cypress

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/api/auth/login`, {
    email,
    password
  }).then((response) => {
    window.localStorage.setItem('accessToken', response.body.accessToken);
    window.localStorage.setItem('refreshToken', response.body.refreshToken);
  });
});

Cypress.Commands.add('createExercice', (exercice: Partial<Exercice>) => {
  const token = window.localStorage.getItem('accessToken');
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/exercices`,
    headers: { Authorization: `Bearer ${token}` },
    body: exercice
  });
});
```

---

## 📊 COUVERTURE DE CODE

### Backend

**Commande** :
```bash
npm test -- --coverage
```

**Objectifs** :
- [ ] Couverture globale > 70%
- [ ] Controllers > 80%
- [ ] Services > 80%
- [ ] Middleware > 90%

**Rapport** :
```
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   72.5  |   65.3   |   70.1  |   73.2  |
 controllers/       |   78.2  |   70.5   |   75.0  |   79.1  |
 services/          |   82.1  |   75.2   |   80.5  |   83.0  |
 middleware/        |   91.3  |   85.7   |   90.0  |   92.1  |
```

### Frontend

**Commande** :
```bash
ng test --code-coverage
```

**Objectifs** :
- [ ] Couverture globale > 60%
- [ ] Services > 70%
- [ ] Composants > 60%

---

## 🔍 QUALITÉ DU CODE

### Linting

#### Backend (ESLint)

```json
// backend/.eslintrc.js
module.exports = {
  env: { node: true, es2021: true },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

**Points de Vérification** :
- [ ] ESLint configuré
- [ ] Règles appropriées
- [ ] Pas d'erreurs de linting
- [ ] Script `npm run lint` disponible

#### Frontend (ESLint + Angular)

```json
// frontend/.eslintrc.json
{
  "extends": [
    "plugin:@angular-eslint/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@angular-eslint/component-selector": ["error", {
      "type": "element",
      "prefix": "app",
      "style": "kebab-case"
    }]
  }
}
```

**Points de Vérification** :
- [ ] ESLint configuré pour Angular
- [ ] TypeScript strict mode
- [ ] Pas d'erreurs de linting
- [ ] Script `ng lint` disponible

### Formatting (Prettier)

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Points de Vérification** :
- [ ] Prettier configuré
- [ ] Règles cohérentes front/back
- [ ] Pre-commit hook (Husky) ?
- [ ] Script `npm run format` disponible

---

## 🎯 CHECKLIST TESTS

### Tests Backend
- [ ] Tests unitaires pour tous les controllers
- [ ] Tests unitaires pour tous les services
- [ ] Tests d'intégration pour tous les endpoints
- [ ] Tests des middlewares (auth, validation, errors)
- [ ] Tests des cas d'erreur
- [ ] Couverture > 70%

### Tests Frontend
- [ ] Tests unitaires pour tous les services
- [ ] Tests unitaires pour les composants critiques
- [ ] Tests des guards et interceptors
- [ ] Tests des formulaires (validation)
- [ ] Couverture > 60%

### Tests E2E
- [ ] Tests des parcours critiques (connexion, CRUD)
- [ ] Tests de navigation
- [ ] Tests responsive (mobile/desktop)
- [ ] Tests des cas d'erreur
- [ ] Tests de performance (si applicable)

### Qualité du Code
- [ ] Linting configuré et passant
- [ ] Formatting cohérent
- [ ] Pas de code mort
- [ ] Pas de console.log en production
- [ ] Pas de TODO critiques

---

## 🎯 ACTIONS PRIORITAIRES

### 🔴 BLOQUANT

1. **Compléter les tests backend**
   - Tests pour toutes les entités (échauffements, situations, entraînements)
   - Tests des relations et cascades
   - Tests de l'export

2. **Créer les tests E2E critiques**
   - Connexion
   - Créer un exercice
   - Créer un entraînement complet

### 🟠 MAJEUR

3. **Ajouter les tests frontend**
   - Tests des services principaux
   - Tests des composants de formulaire
   - Tests de l'authentification

4. **Améliorer la couverture**
   - Atteindre 70% backend
   - Atteindre 60% frontend
   - Identifier les zones non testées

### 🟡 MINEUR

5. **Configurer le CI/CD**
   - Tests automatiques sur chaque push
   - Rapport de couverture
   - Linting automatique

6. **Ajouter des tests de performance**
   - Temps de réponse API
   - Temps de chargement frontend
   - Lighthouse CI

---

## 📋 TEMPLATE DE RAPPORT DE TEST

```markdown
### Rapport de Tests - [DATE]

#### Backend
- **Tests unitaires** : X/Y passants (Z% couverture)
- **Tests d'intégration** : X/Y passants
- **Durée d'exécution** : Xs

#### Frontend
- **Tests unitaires** : X/Y passants (Z% couverture)
- **Tests E2E** : X/Y passants
- **Durée d'exécution** : Xs

#### Problèmes Identifiés
1. [Description du problème]
   - Criticité : 🔴/🟠/🟡
   - Tests affectés : [Liste]
   - Action requise : [Description]

#### Recommandations
- [Suggestion d'amélioration]
```

---

**Statut** : ⏳ Analyse en cours  
**Prochaine étape** : Créer le rapport de synthèse final
