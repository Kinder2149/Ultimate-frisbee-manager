# 📐 Convention Services - Frontend & Backend

## PROB-026 : Convention Core/Shared Services

---

## 🎯 Frontend Angular

### Structure Recommandée

```
frontend/src/app/
├── core/
│   ├── services/           # Services singleton (état global)
│   │   ├── auth.service.ts
│   │   └── error.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       ├── auth.interceptor.ts
│       └── error.interceptor.ts
├── shared/
│   ├── services/           # Services utilitaires (sans état)
│   │   └── [utilitaires]
│   └── components/
│       └── dialog/
└── features/
    └── [feature]/
        └── services/       # Services spécifiques à la feature
```

### Règles de Décision

#### Core Services (Singleton)
**Quand utiliser** :
- Service avec état global de l'application
- Service utilisé partout dans l'app
- Service fourni dans `root`

**Exemples** :
```typescript
// core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  // État global partagé
}

// core/services/error.service.ts
@Injectable({ providedIn: 'root' })
export class ErrorService {
  private errors$ = new Subject<Error>();
  // Gestion globale des erreurs
}
```

#### Shared Services (Utilitaires)
**Quand utiliser** :
- Service sans état (stateless)
- Fonctions utilitaires réutilisables
- Peut être instancié plusieurs fois

**Exemples** :
```typescript
// shared/services/date-formatter.service.ts
@Injectable()
export class DateFormatterService {
  format(date: Date): string {
    // Utilitaire sans état
  }
}

// shared/services/validator.service.ts
@Injectable()
export class ValidatorService {
  validateEmail(email: string): boolean {
    // Validation pure
  }
}
```

#### Feature Services
**Quand utiliser** :
- Service spécifique à une feature
- État local à la feature
- Fourni dans le module de la feature

**Exemples** :
```typescript
// features/exercices/services/exercice.service.ts
@Injectable()
export class ExerciceService {
  constructor(private http: HttpClient) {}
  
  getAll(): Observable<Exercice[]> {
    return this.http.get<Exercice[]>('/api/exercises');
  }
}
```

---

## 🔧 Backend Express

### Structure Actuelle (Validée)

```
backend/
├── services/
│   ├── prisma.js           # Singleton Prisma
│   ├── cloudinary.js       # Configuration Cloudinary
│   └── [autres services]
├── controllers/
│   ├── auth.controller.js
│   ├── exercice.controller.js
│   └── [autres controllers]
├── middleware/
│   ├── auth.middleware.js
│   └── workspace.middleware.js
└── routes/
    └── [routes]
```

### Règles Backend

#### Services
**Rôle** : Configuration et logique métier réutilisable

**Exemples** :
```javascript
// services/prisma.js - Singleton
const { PrismaClient } = require('@prisma/client');
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
module.exports = { prisma };

// services/cloudinary.js - Configuration
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});
module.exports = cloudinary;
```

#### Controllers
**Rôle** : Logique des routes, validation, réponses HTTP

**Exemple** :
```javascript
// controllers/exercice.controller.js
exports.create = async (req, res) => {
  try {
    const exercice = await prisma.exercice.create({
      data: req.body
    });
    res.status(201).json(exercice);
  } catch (error) {
    console.error('Error creating exercice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

#### Middleware
**Rôle** : Logique transversale (auth, validation, logging)

**Exemple** :
```javascript
// middleware/auth.middleware.js
exports.authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
```

---

## 📦 Package Shared (@ufm/shared)

### PROB-047 : Utilisation de @ufm/shared

**État** : ✅ **Déjà utilisé partout**

### Structure

```
shared/
├── constants/
│   ├── tag-categories.ts   # Constantes partagées
│   └── tag-mapping.ts
├── formats/
│   └── ufm_export_format.json
└── dist/                   # Compilé (ignoré par Git)
```

### Utilisation

#### Backend
```javascript
const { TAG_CATEGORIES } = require('@ufm/shared/constants/tag-categories');

// Utilisation
if (isValidCategory(category)) {
  // ...
}
```

#### Frontend
```typescript
import { TAG_CATEGORIES } from '@ufm/shared/constants/tag-categories';

// Utilisation
const categories = Object.values(TAG_CATEGORIES);
```

### Build

```bash
# Avant backend/frontend
npm -w shared run build

# Génère shared/dist/
```

---

## ✅ Checklist Convention

### Frontend
- [x] Services singleton dans `core/services/`
- [x] Services utilitaires dans `shared/services/`
- [x] Services feature dans `features/[feature]/services/`
- [x] Guards dans `core/guards/`
- [x] Interceptors dans `core/interceptors/`

### Backend
- [x] Services dans `services/`
- [x] Controllers dans `controllers/`
- [x] Middleware dans `middleware/`
- [x] Routes dans `routes/`

### Shared
- [x] Package `@ufm/shared` utilisé partout
- [x] Constantes partagées dans `shared/constants/`
- [x] Build avant backend/frontend

---

**Status PROB-026** : ✅ RÉSOLU - Convention documentée et appliquée  
**Status PROB-047** : ✅ RÉSOLU - @ufm/shared utilisé partout

**Dernière mise à jour** : 2026-01-24
