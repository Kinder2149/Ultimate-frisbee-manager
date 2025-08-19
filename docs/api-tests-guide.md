# Guide de tests API - Ultimate Frisbee Manager

## Introduction

Ce document décrit l'approche et les méthodes pour tester l'API REST backend de l'application Ultimate Frisbee Manager. Il couvre les tests unitaires, d'intégration et de bout en bout (e2e) pour garantir la fiabilité et la qualité de l'API.

## Structure des tests

Les tests sont organisés selon la structure suivante :

```
backend/
├── tests/
│   ├── unit/              # Tests unitaires
│   │   ├── controllers/   # Tests des contrôleurs
│   │   ├── services/      # Tests des services
│   │   └── utils/         # Tests des utilitaires
│   ├── integration/       # Tests d'intégration
│   │   ├── routes/        # Tests des routes API
│   │   └── db/            # Tests d'intégration avec la base de données
│   ├── e2e/               # Tests de bout en bout
│   │   └── scenarios/     # Scénarios de test e2e
│   ├── mocks/             # Données de test et mocks
│   └── helpers/           # Fonctions d'aide aux tests
```

## Technologies et outils de test

- **Jest**: Framework de test principal
- **Supertest**: Pour tester les requêtes HTTP
- **Prisma Client**: Pour les tests d'intégration avec la base de données
- **Mock Service Worker (MSW)**: Pour simuler les réponses API

## Configuration des tests

### Configuration de Jest

Le fichier `jest.config.js` à la racine du dossier backend configure Jest pour les tests:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js',
  ]
};
```

### Base de données de test

Pour les tests d'intégration et e2e, utiliser une base de données dédiée aux tests:

```javascript
// setup-test-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupTestDb() {
  // Code pour initialiser la base de données de test
  await prisma.exercice.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.entrainement.deleteMany();
  // ... autres nettoyages
  
  // Données de test de base
  await prisma.tag.createMany({
    data: [
      { id: 'tag-test-1', label: 'Technique', category: 'objectif', color: '#ff0000' },
      { id: 'tag-test-2', label: 'Débutant', category: 'niveau', color: '#00ff00', level: 1 },
      // ... autres données de test
    ]
  });
}

module.exports = { setupTestDb };
```

## Tests unitaires

### Test d'un contrôleur

Exemple de test pour le contrôleur d'exercices:

```javascript
// tests/unit/controllers/exercice.controller.test.js
const exerciceController = require('../../../controllers/exercice.controller');
const { PrismaClient } = require('@prisma/client');

// Mock de Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    exercice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prisma = new PrismaClient();

describe('ExerciceController', () => {
  let req, res;
  
  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });
  
  describe('getAllExercices', () => {
    it('devrait retourner tous les exercices', async () => {
      // Arrange
      const mockExercices = [{ id: '1', nom: 'Exercice Test' }];
      prisma.exercice.findMany.mockResolvedValue(mockExercices);
      
      // Act
      await exerciceController.getAllExercices(req, res);
      
      // Assert
      expect(prisma.exercice.findMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockExercices);
    });
    
    it('devrait gérer les erreurs', async () => {
      // Arrange
      prisma.exercice.findMany.mockRejectedValue(new Error('Database error'));
      
      // Act
      await exerciceController.getAllExercices(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });
  
  // Tests pour getExerciceById, createExercice, updateExercice, deleteExercice...
});
```

## Tests d'intégration

### Test d'une route API

Exemple de test pour la route d'exercices:

```javascript
// tests/integration/routes/exercice.routes.test.js
const request = require('supertest');
const app = require('../../../app');
const { setupTestDb } = require('../../helpers/setup-test-db');

describe('Routes Exercices', () => {
  beforeAll(async () => {
    await setupTestDb();
  });
  
  describe('GET /api/exercices', () => {
    it('devrait retourner tous les exercices', async () => {
      const response = await request(app)
        .get('/api/exercices')
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('POST /api/exercices', () => {
    it('devrait créer un nouvel exercice', async () => {
      const nouvelExercice = {
        nom: 'Nouvel exercice test',
        description: 'Description test',
        tagIds: ['tag-test-1', 'tag-test-2']
      };
      
      const response = await request(app)
        .post('/api/exercices')
        .send(nouvelExercice)
        .expect('Content-Type', /json/)
        .expect(201);
        
      expect(response.body).toHaveProperty('id');
      expect(response.body.nom).toBe(nouvelExercice.nom);
    });
    
    it('devrait retourner 400 si les données sont invalides', async () => {
      const exerciceInvalide = {
        // nom manquant
        description: 'Description test'
      };
      
      await request(app)
        .post('/api/exercices')
        .send(exerciceInvalide)
        .expect(400);
    });
  });
  
  // Tests pour GET /api/exercices/:id, PUT /api/exercices/:id, DELETE /api/exercices/:id...
});
```

## Tests de bout en bout (E2E)

### Scénario de test complet

Exemple d'un scénario de test e2e:

```javascript
// tests/e2e/scenarios/entrainement-complet.test.js
const request = require('supertest');
const app = require('../../../app');
const { setupTestDb } = require('../../helpers/setup-test-db');

describe('Scénario Entraînement Complet', () => {
  let entrainementId;
  let phaseId;
  
  beforeAll(async () => {
    await setupTestDb();
  });
  
  it('devrait créer un nouvel entraînement', async () => {
    const nouvelEntrainement = {
      titre: 'Entraînement test e2e',
      description: 'Description de l\'entraînement',
      date: new Date().toISOString(),
      niveau: 'Débutant'
    };
    
    const response = await request(app)
      .post('/api/entrainements')
      .send(nouvelEntrainement)
      .expect(201);
      
    entrainementId = response.body.id;
    expect(response.body.titre).toBe(nouvelEntrainement.titre);
  });
  
  it('devrait ajouter une phase à l\'entraînement', async () => {
    const nouvellePhase = {
      entrainementId,
      titre: 'Phase d\'échauffement',
      type: 'ECHAUFFEMENT',
      duree: 15
    };
    
    const response = await request(app)
      .post(`/api/entrainements/${entrainementId}/phases`)
      .send(nouvellePhase)
      .expect(201);
      
    phaseId = response.body.id;
    expect(response.body.titre).toBe(nouvellePhase.titre);
  });
  
  it('devrait ajouter un exercice à la phase', async () => {
    const nouvelExercice = {
      nom: 'Exercice test e2e',
      description: 'Description de l\'exercice',
      tagIds: ['tag-test-1', 'tag-test-2']
    };
    
    // Créer d'abord l'exercice
    const exerciceResponse = await request(app)
      .post('/api/exercices')
      .send(nouvelExercice)
      .expect(201);
      
    const exerciceId = exerciceResponse.body.id;
    
    // Ajouter l'exercice à la phase
    await request(app)
      .post(`/api/phases/${phaseId}/exercices`)
      .send({ exerciceId, ordre: 1 })
      .expect(201);
      
    // Vérifier que l'exercice est bien dans la phase
    const phaseResponse = await request(app)
      .get(`/api/phases/${phaseId}`)
      .expect(200);
      
    expect(phaseResponse.body.exercices).toHaveLength(1);
    expect(phaseResponse.body.exercices[0].id).toBe(exerciceId);
  });
  
  // Autres étapes du scénario...
  
  it('devrait supprimer l\'entraînement et tout son contenu', async () => {
    await request(app)
      .delete(`/api/entrainements/${entrainementId}`)
      .expect(200);
      
    // Vérifier que l'entraînement n'existe plus
    await request(app)
      .get(`/api/entrainements/${entrainementId}`)
      .expect(404);
  });
});
```

## Couverture de tests

L'objectif est d'atteindre une couverture de tests d'au moins:
- 90% pour les contrôleurs
- 80% pour les services
- 70% pour l'ensemble du code

## Exécution des tests

### Commandes npm

Ajouter les scripts suivants au `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e"
  }
}
```

### Intégration continue (CI)

Configurer GitHub Actions ou autre service CI pour exécuter les tests automatiquement:

```yaml
# .github/workflows/test.yml
name: Tests API

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: ultimate_frisbee_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
        
    - name: Install dependencies
      working-directory: ./backend
      run: npm ci
        
    - name: Run migrations
      working-directory: ./backend
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://testuser:testpassword@localhost:5432/ultimate_frisbee_test
        
    - name: Run tests
      working-directory: ./backend
      run: npm test
      env:
        DATABASE_URL: postgresql://testuser:testpassword@localhost:5432/ultimate_frisbee_test
        
    - name: Upload coverage reports
      uses: codecov/codecov-action@v1
```

## Bonnes pratiques

1. **Isoler les tests**: Chaque test doit être indépendant des autres
2. **Nettoyer après chaque test**: Utiliser `beforeEach`/`afterEach` pour réinitialiser l'état
3. **Simuler les dépendances externes**: Utiliser des mocks pour les services externes
4. **Tester les cas d'erreur**: Pas seulement les cas de succès
5. **Utiliser des assertions précises**: Spécifier exactement ce qui est attendu
6. **Descriptions claires**: Nommer clairement les tests avec une convention "devrait..."

## Prochaines étapes

1. Créer un jeu de données de test complet dans `tests/mocks`
2. Ajouter des tests pour tous les endpoints API
3. Configurer l'intégration continue
4. Mettre en place des tests de performance pour les endpoints critiques

## Ressources

- [Documentation Jest](https://jestjs.io/docs/en/getting-started)
- [Documentation Supertest](https://github.com/visionmedia/supertest)
- [Guide de tests Prisma](https://www.prisma.io/docs/guides/testing)
