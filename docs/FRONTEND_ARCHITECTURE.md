# 🎨 Architecture Frontend - Ultimate Frisbee Manager

## Vue d'ensemble

Application Angular 17 avec Material Design, architecture modulaire par features.

---

## 📦 Structure des Modules

```
frontend/src/app/
├── core/                    # Services singleton, guards, interceptors
│   ├── errors/             # Gestion d'erreurs
│   ├── guards/             # AuthGuard, etc.
│   └── services/           # Services core (auth, error-handler)
├── shared/                  # Composants, services partagés
│   ├── components/         # Composants réutilisables
│   │   └── dialog/        # confirm-dialog
│   └── services/           # Services partagés
├── features/                # Modules par feature
│   ├── exercices/
│   ├── entrainements/
│   ├── echauffements/
│   ├── situations-matchs/
│   ├── dashboard/
│   └── auth/
└── app.config.ts           # Configuration globale
```

---

## 🔄 HTTP Interceptors

### PROB-048 : Ordre des Interceptors

**Configuration** : `frontend/src/app/app.config.ts`

Les interceptors Angular s'exécutent dans l'ordre de déclaration :

#### 1. **AuthInterceptor** (Premier)
**Rôle** : Ajoute le token JWT à toutes les requêtes  
**Localisation** : `core/interceptors/auth.interceptor.ts`  
**Action** :
```typescript
// Ajoute header Authorization si token existe
headers: { Authorization: `Bearer ${token}` }
```

#### 2. **ErrorInterceptor** (Dernier)
**Rôle** : Capture et gère les erreurs HTTP  
**Localisation** : `core/interceptors/error.interceptor.ts`  
**Action** :
- 401 : Redirection vers login
- 403 : Message accès refusé
- 500 : Erreur serveur
- Autres : Gestion générique

### Ordre d'Exécution

```
Request  →  AuthInterceptor  →  HTTP Call  →  ErrorInterceptor  →  Response
            (add token)                        (handle errors)
```

**Pourquoi cet ordre ?**
1. Auth d'abord : Le token doit être ajouté avant l'envoi
2. Error en dernier : Capture toutes les erreurs, même celles d'auth

---

## 🛡️ Guards

### AuthGuard
**Rôle** : Protège les routes nécessitant authentification  
**Localisation** : `core/guards/auth.guard.ts`

**Routes protégées** :
- `/dashboard`
- `/exercices`
- `/entrainements`
- `/echauffements`
- `/situations-matchs`

**Comportement** :
```typescript
// Si non authentifié → redirection /login
// Si authentifié → accès autorisé
```

---

## 🎯 Services Core vs Shared

### PROB-026 : Convention Core/Shared

#### Services Core (Singleton)
**Localisation** : `app/core/services/`  
**Caractéristiques** :
- Fournis dans `root` (singleton)
- État global de l'application
- Utilisés partout

**Exemples** :
- `AuthService` : Authentification JWT
- `ErrorService` : Gestion erreurs globale

#### Services Shared (Partagés)
**Localisation** : `app/shared/services/`  
**Caractéristiques** :
- Utilitaires réutilisables
- Sans état ou état local
- Peuvent être instanciés plusieurs fois

**Exemples** :
- Services utilitaires
- Services de communication entre composants

### Règle de Décision

```
Service avec état global → core/services/
Service utilitaire → shared/services/
Service spécifique feature → features/[feature]/services/
```

---

## 🧩 Composants

### PROB-040 : Confirm Dialog

**Localisation** : `shared/components/dialog/confirm-dialog.component.ts`

**Utilisation** :
```typescript
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components/dialog/confirm-dialog.component';

constructor(private dialog: MatDialog) {}

confirm() {
  this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Confirmer la suppression',
      message: 'Êtes-vous sûr ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    }
  }).afterClosed().subscribe(result => {
    if (result) {
      // Action confirmée
    }
  });
}
```

**Note** : Un seul composant confirm-dialog consolidé dans `shared/components/dialog/`

---

## 🎨 Styles

### Architecture CSS

```
frontend/src/
├── styles.scss              # Styles globaux
├── styles/
│   ├── _variables.scss     # Variables (couleurs, espacements)
│   ├── _mixins.scss        # Mixins réutilisables
│   └── _material-theme.scss # Thème Material
└── app/
    └── features/
        └── [feature]/
            └── [component].scss  # Styles composant
```

### Conventions

- **Global** : `styles.scss` uniquement
- **Composant** : Styles scopés dans le composant
- **Variables** : Utiliser variables SCSS pour cohérence
- **Material** : Personnalisation via thème

---

## 🔐 Authentification

### Flux d'Authentification

```
1. Login → AuthService.login()
2. Stockage token → localStorage
3. AuthInterceptor ajoute token aux requêtes
4. AuthGuard protège les routes
5. Refresh automatique avant expiration
```

### Gestion des Tokens

**Storage** : `localStorage`
```typescript
{
  'access_token': 'jwt...',
  'refresh_token': 'jwt...',
  'user': { id, email, nom, prenom }
}
```

**Expiration** :
- Access token : 7 jours
- Refresh token : 30 jours
- Refresh automatique si < 1 jour restant

---

## 📱 Responsive Design

### Breakpoints

```scss
// Mobile
@media (max-width: 768px) { }

// Tablet
@media (min-width: 769px) and (max-width: 1024px) { }

// Desktop
@media (min-width: 1025px) { }
```

### Optimisations Mobile

- Navigation adaptative (bulles sur mobile)
- Cartes compactes
- Filtres simplifiés
- Touch-friendly (min 44px)

---

## 🧪 Tests

### PROB-044 : Tests Frontend

**Structure recommandée** :
```
frontend/src/app/
├── core/
│   └── services/
│       └── auth.service.spec.ts
├── shared/
│   └── components/
│       └── confirm-dialog.component.spec.ts
└── features/
    └── exercices/
        └── exercice-list.component.spec.ts
```

**Tests critiques à ajouter** :
- AuthService (login, logout, refresh)
- AuthGuard (redirection)
- AuthInterceptor (ajout token)
- ErrorInterceptor (gestion erreurs)
- Composants principaux (listes, formulaires)

**Commande** :
```bash
npm run test
```

---

## 🚀 Build & Déploiement

### Développement

```bash
npm start
# → http://localhost:4200
```

### Production

```bash
npm run build
# → frontend/dist/ultimate-frisbee-manager/
```

### Vercel

**Configuration** : `vercel.json` (racine)
```json
{
  "builds": [{
    "src": "package.json",
    "use": "@vercel/static-build",
    "config": {
      "distDir": "frontend/dist/ultimate-frisbee-manager"
    }
  }]
}
```

**Script build** : `package.json` (racine)
```json
{
  "scripts": {
    "build": "npm -w shared run build && npm -w frontend run build"
  }
}
```

---

## 📋 Checklist Qualité

### Avant Commit
- [ ] Pas de console.log
- [ ] Pas d'imports inutilisés
- [ ] Types TypeScript corrects
- [ ] Styles scopés au composant
- [ ] Pas de code commenté

### Avant Déploiement
- [ ] Build production réussit
- [ ] Tests passent
- [ ] `environment.prod.ts` à jour
- [ ] Pas d'erreurs ESLint

---

**Dernière mise à jour** : 2026-01-24
