# 🏗️ AUDIT ARCHITECTURE & MAINTENABILITÉ

**Date** : 26 janvier 2026  
**Statut** : ⏳ En cours d'analyse

---

## 📐 STRUCTURE DU PROJET

### Organisation Globale
```
ultimate-frisbee-manager/
├── backend/           # API Node.js + Express + Prisma
├── frontend/          # Angular 17 + Material Design
├── shared/            # Types et constantes partagés (TypeScript)
├── docs/              # Documentation technique
├── tests/             # Tests HTTP et scripts
└── archive/           # Anciennes versions de modules
```

### ✅ Points Forts
- **Monorepo cohérent** : Backend, Frontend et Shared dans un seul repo
- **Séparation claire** : Chaque partie a sa responsabilité
- **Package shared** : Évite la duplication de types entre front/back
- **Documentation structurée** : Dossier `docs/` avec audits et guides

### ⚠️ Points d'Attention
- **Archive présente** : Dossier `archive/old_trainings_module/` → à nettoyer ou documenter
- **Dépendance locale** : `@ufm/shared` en `file:../shared` → vérifier build production
- **Tests dispersés** : Tests backend dans `__tests__/`, tests HTTP dans `tests/http/`

---

## 🎯 CHECKLIST ARCHITECTURE

### 1. Structure Backend

#### ✅ Organisation des dossiers
```
backend/
├── config/           # Configuration centralisée
├── controllers/      # Logique métier par entité
├── middleware/       # Auth, validation, error handling
├── routes/           # Définition des endpoints
├── services/         # Services externes (Cloudinary, etc.)
├── prisma/           # Schéma DB + migrations + seeds
└── __tests__/        # Tests unitaires
```

**Vérifications** :
- [ ] Chaque entité a son controller dédié
- [ ] Les routes sont bien organisées par domaine
- [ ] Les middlewares sont réutilisables
- [ ] La config est centralisée (pas de hardcoding)

#### 🔍 À Vérifier
```bash
# Lister les controllers
ls backend/controllers/

# Lister les routes
ls backend/routes/

# Vérifier la structure Prisma
cat backend/prisma/schema.prisma
```

### 2. Structure Frontend

#### ✅ Organisation des composants
```
frontend/src/app/
├── auth/                    # Module d'authentification
├── components/              # Composants réutilisables
├── exercices/               # Feature exercices
├── entrainements/           # Feature entraînements
├── echauffements/           # Feature échauffements
├── situations-matchs/       # Feature situations de match
├── dashboard/               # Tableau de bord
├── services/                # Services Angular
└── types/                   # Types TypeScript locaux
```

**Vérifications** :
- [ ] Architecture modulaire par feature
- [ ] Services partagés centralisés
- [ ] Types importés depuis `@ufm/shared`
- [ ] Guards et interceptors en place

#### 🔍 À Vérifier
```bash
# Lister les modules principaux
ls frontend/src/app/

# Vérifier les services
ls frontend/src/app/services/

# Vérifier l'utilisation de @ufm/shared
grep -r "@ufm/shared" frontend/src/
```

### 3. Package Shared

#### ✅ Contenu
```
shared/
├── constants/        # Constantes partagées
├── formats/          # Formats d'export
├── src/
│   └── enums/       # Enums TypeScript
├── index.ts         # Point d'entrée
├── package.json
└── tsconfig.json
```

**Vérifications** :
- [ ] Types exportés correctement
- [ ] Build fonctionnel (`npm run build`)
- [ ] Utilisé par backend ET frontend
- [ ] Pas de duplication de code

---

## 🧹 QUALITÉ DU CODE

### Conventions de Nommage

#### Backend (JavaScript/Node.js)
- **Fichiers** : `kebab-case` (ex: `exercice.controller.js`)
- **Classes** : `PascalCase` (ex: `ExerciceController`)
- **Fonctions** : `camelCase` (ex: `createExercice`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `JWT_SECRET`)

#### Frontend (TypeScript/Angular)
- **Composants** : `kebab-case.component.ts` (ex: `exercice-list.component.ts`)
- **Services** : `kebab-case.service.ts` (ex: `exercice.service.ts`)
- **Interfaces** : `PascalCase` (ex: `Exercice`, `User`)
- **Enums** : `PascalCase` (ex: `UserRole`, `ExerciceType`)

### ✅ À Vérifier
- [ ] Conventions respectées dans tout le projet
- [ ] Noms de variables explicites (pas de `x`, `temp`, `data`)
- [ ] Commentaires en français (cohérence avec le projet)
- [ ] Pas de code mort ou commenté en masse

---

## 🤖 REPRENABILITÉ PAR L'IA

### Critères d'Évaluation

#### 1. Clarté de la Structure
- [ ] **Nommage explicite** : Les fichiers et fonctions sont auto-documentés
- [ ] **Organisation logique** : Facile de trouver où est implémentée une feature
- [ ] **Séparation des responsabilités** : Chaque fichier a un rôle clair

#### 2. Documentation
- [ ] **README.md** : Instructions de setup et lancement
- [ ] **Commentaires** : Logique complexe expliquée
- [ ] **Types TypeScript** : Interfaces bien définies
- [ ] **Schéma Prisma** : Relations DB documentées

#### 3. Patterns Cohérents
- [ ] **CRUD standardisé** : Même structure pour toutes les entités
- [ ] **Gestion d'erreurs** : Pattern uniforme
- [ ] **Validation** : Même approche partout (Zod, class-validator, etc.)
- [ ] **Authentification** : Middleware appliqué de façon cohérente

#### 4. Tests et Exemples
- [ ] **Tests unitaires** : Exemples d'utilisation des fonctions
- [ ] **Tests HTTP** : Documentation des endpoints
- [ ] **Seeds** : Données d'exemple pour comprendre le modèle

---

## 📊 ANALYSE STATIQUE

### Dépendances

#### Backend (`backend/package.json`)
**Dépendances principales** :
- `@prisma/client` : ORM base de données
- `express` : Framework web
- `jsonwebtoken` + `jose` : Authentification JWT
- `bcryptjs` : Hash des mots de passe
- `cloudinary` : Stockage des images
- `multer` : Upload de fichiers
- `zod` : Validation des données

**⚠️ Points d'attention** :
- [ ] Deux libs JWT (`jsonwebtoken` + `jose`) → vérifier si les deux sont nécessaires
- [ ] `ultimate-frisbee-manager: "file:.."` → dépendance circulaire ?
- [ ] `@ufm/shared: "file:../shared"` → OK mais vérifier build prod

#### Frontend (`frontend/package.json`)
**Dépendances principales** :
- `@angular/*` v17 : Framework
- `@angular/material` : UI components
- `@supabase/supabase-js` : Client Supabase
- `ngx-quill` : Éditeur riche
- `jwt-decode` : Décodage JWT
- `@ufm/shared` : Types partagés

**⚠️ Points d'attention** :
- [ ] Supabase utilisé ? Vérifier si nécessaire (JWT custom en place)
- [ ] Overrides dans package.json → documenter pourquoi

### Configuration Production

#### Vercel (`vercel.json`)
```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build" },
    { "src": "backend/server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/server.js" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

**✅ Configuration correcte** :
- Frontend servi en static
- Backend en serverless function
- Routing SPA géré

**🔍 À vérifier** :
- [ ] Variables d'environnement Vercel configurées
- [ ] Build frontend fonctionnel sur Vercel
- [ ] Prisma generate exécuté en production

---

## 🎯 ACTIONS PRIORITAIRES

### 🔴 BLOQUANT
1. **Vérifier la dépendance `@ufm/shared` en production**
   - S'assurer que le build compile correctement
   - Vérifier que le dossier `shared/dist` est présent

2. **Nettoyer les dépendances redondantes**
   - Choisir entre `jsonwebtoken` et `jose`
   - Confirmer si Supabase est utilisé

### 🟠 MAJEUR
3. **Documenter l'architecture dans un README**
   - Créer `docs/ARCHITECTURE.md`
   - Expliquer le rôle de chaque dossier
   - Diagramme de l'architecture

4. **Standardiser l'organisation des tests**
   - Regrouper tous les tests backend
   - Ajouter tests frontend manquants

### 🟡 MINEUR
5. **Nettoyer le dossier `archive/`**
   - Supprimer ou documenter son utilité
   - Éviter la confusion

6. **Ajouter des linters/formatters**
   - ESLint + Prettier configurés
   - Pre-commit hooks

---

## 📝 NOTES D'AUDIT

### Observations Positives
- Structure monorepo bien pensée
- Séparation claire front/back
- Package shared évite la duplication
- Documentation existante (dossier `docs/`)

### Points de Vigilance
- Dépendances à vérifier (JWT, Supabase)
- Build production du package shared
- Tests à compléter et organiser
- Archive à nettoyer

### Recommandations
- Créer un `ARCHITECTURE.md` détaillé
- Ajouter un script de vérification pré-commit
- Documenter les choix techniques (pourquoi JWT custom, etc.)
- Créer un guide de contribution pour l'IA

---

**Statut** : ⏳ Analyse en cours  
**Prochaine étape** : Vérifier la complétude fonctionnelle (CRUD)
