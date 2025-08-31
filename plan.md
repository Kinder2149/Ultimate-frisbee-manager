# Plan de Développement - Ultimate Frisbee Manager

## 🚀 PLAN PRIORITAIRE - DÉPLOIEMENT EN LIGNE

### **OBJECTIF PRINCIPAL** 🎯
Rendre l'application Ultimate Frisbee Manager accessible en ligne pour une dizaine d'utilisateurs occasionnels avec un système de déploiement continu via GitHub.

### **CONTEXTE DU PROJET** 📌
- **Frontend** : Angular 17, actuellement accessible uniquement en local (ng serve)
- **Backend** : API Node.js/Express, connectée à une base de données SQLite locale
- **État actuel** : Tout fonctionne correctement en local (front ↔ back ↔ DB)
- **Besoin** : Hébergement en ligne avec déploiement automatique

### **ARCHITECTURE CIBLE** 🏗️
- **Backend + DB** : Hébergé sur Render (PostgreSQL)
- **Frontend** : Hébergé sur Vercel (recommandé) ou GitHub Pages
- **Communication** : HTTPS avec gestion CORS appropriée
- **Déploiement** : Automatique via git push sur branche main

## ⚙️ ÉTAPES DE DÉPLOIEMENT

### **ÉTAPE 1 : PRÉPARATION DU PROJET (LOCAL)** ✅ **TERMINÉ**

#### **1.1 Configuration Backend**
- [x] Vérifier que le backend écoute sur `0.0.0.0` (et pas uniquement localhost) ✅
- [x] Ajouter gestion CORS pour autoriser les appels depuis le domaine du front ✅
- [x] Configurer lecture de `DATABASE_URL` via variable d'environnement ✅
- [x] Tester compatibilité PostgreSQL avec Prisma ✅

#### **1.2 Configuration Frontend**
- [x] Créer `environment.prod.ts` avec URL de production : ✅
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api'
};
```
- [x] Vérifier configuration build Angular pour production ✅
- [x] Tester build local : `ng build --configuration production` ✅

### **ÉTAPE 2 : DÉPLOIEMENT BACKEND SUR RENDER** 🚀

#### **2.1 Configuration Render**
- [x] Créer compte sur Render ✅
- [x] Créer service web et connecter le repo GitHub du backend ✅
- [x] Définir build command : `npm install` ✅
- [x] Définir start command : `npm start` ✅
- [x] Ajouter service PostgreSQL via Render ✅

**Service ID Backend** : `srv-d2i95m15pdvs73f0gnhg`
**Repository** : `https://github.com/Kinder2149/Ultimate-frisbee-manager.git`

#### **2.2 Variables d'environnement**
- [x] Configurer `DATABASE_URL` (fournie par PostgreSQL Render) ✅
- [x] Configurer `PORT` (automatique sur Render) ✅
- [x] Configurer `NODE_ENV=production` ✅
- [ ] Tester que l'API est accessible via l'URL publique Render

**Variables configurées** :
- `DATABASE_URL` : Fournie automatiquement par PostgreSQL Render
- `PORT` : Automatique
- `NODE_ENV` : `production`

#### **2.3 Migration base de données**
- [x] Adapter schema Prisma pour PostgreSQL ✅
- [ ] Exécuter migrations Prisma en production
- [ ] Exécuter seed pour données initiales

### **ÉTAPE 3 : DÉPLOIEMENT FRONTEND** 🌐

#### **Option A : Vercel (Recommandé)**
- [x] Créer projet sur Vercel ✅
- [x] Connecter repo GitHub du frontend ✅
- [x] Définir commande de build : `ng build --configuration production` ✅
- [x] Configurer dossier de sortie : `dist/` ✅
- [x] Activer redéploiement automatique sur git push ✅

**URL Frontend** : `https://ultimate-frisbee-manager-nyvni7xiv-kinder2149s-projects.vercel.app`

#### **Option B : GitHub Pages**
- [ ] Créer workflow GitHub Action pour build Angular
- [ ] Configurer `ng build --prod --base-href "/ultimate-frisbee-manager/"`
- [ ] Déployer dossier `dist/` sur Pages

### **ÉTAPE 4 : COMMUNICATION FRONT ↔ BACK** 🔗

#### **4.1 Configuration CORS**
- [x] Configurer CORS backend pour accepter uniquement le domaine du front ✅
- [x] URL configurée : `https://ultimate-frisbee-manager-nyvni7xiv-kinder2149s-projects.vercel.app` ✅
- [ ] Tester communication en ligne

#### **4.2 Validation fonctionnelle**
- [ ] Vérifier que `environment.prod.ts` utilise bien l'URL Render
- [ ] Tester CRUD complet depuis l'interface en ligne
- [ ] Valider que les données s'affichent correctement

### **ÉTAPE 5 : DÉPLOIEMENT CONTINU** 🔄

#### **5.1 Configuration automatique**
- [ ] Connecter backend et frontend à GitHub
- [ ] Activer déploiements automatiques :
  - Push sur `main` du backend → Render redéploie l'API
  - Push sur `main` du frontend → Vercel redéploie le front
- [ ] Créer branche `dev` pour développement avant merge dans `main`

#### **5.2 Documentation déploiement**
- [ ] Documenter URLs de production dans README.md
- [ ] Créer guide de déploiement pour futures mises à jour
- [ ] Documenter variables d'environnement requises

## 🚨 POINTS D'ATTENTION CRITIQUES

### **Configuration réseau**
- **HTTPS obligatoire** : Render + Vercel le gèrent automatiquement
- **URLs différentes** : Bien distinguer dev (localhost) et prod (domaines)
- **CORS sécurisé** : Autoriser uniquement les domaines légitimes

### **Base de données**
- **Migration SQLite → PostgreSQL** : Adapter types de données si nécessaire
- **Migrations Prisma** : Utiliser ORM pour cohérence schéma
- **Backup** : Sauvegarder données avant migration

### **Variables d'environnement**
- **Secrets sécurisés** : Jamais de commit des clés dans GitHub
- **Configuration Render** : DATABASE_URL, PORT via interface Render
- **Logs de debug** : Activer logs Render pour surveillance API

## ✅ BONNES PRATIQUES

### **Développement**
- [ ] Toujours tester en local avant push
- [ ] Utiliser branche `dev` pour développement
- [ ] Commits atomiques avec messages clairs
- [ ] Tests fonctionnels après chaque déploiement

### **Sécurité**
- [ ] Variables d'environnement pour tous les secrets
- [ ] CORS restrictif en production
- [ ] HTTPS uniquement en production
- [ ] Logs d'erreurs sans exposition de données sensibles

### **Maintenance**
- [ ] Documentation à jour (README.md)
- [ ] Monitoring des logs Render
- [ ] Sauvegarde régulière base de données
- [ ] Tests de charge pour 10+ utilisateurs

## 🛠️ OUTILS ET SCRIPTS CRÉÉS

### **Scripts de déploiement**
- [x] `backend/scripts/migrate-to-postgresql.js` - Migration SQLite → PostgreSQL ✅
- [x] `backend/scripts/deploy-render.js` - Vérification et préparation Render ✅
- [x] Scripts NPM ajoutés dans `package.json` ✅
  - `npm run migrate:postgresql`
  - `npm run deploy:prepare`
  - `npm run deploy:render`

### **Configuration environnements**
- [x] `backend/.env.example` - Template variables d'environnement ✅
- [x] `backend/.env.development` - Configuration développement ✅
- [x] `frontend/src/environments/environment.prod.ts` - Configuration production ✅

### **Documentation**
- [x] `DEPLOYMENT.md` - Guide complet de déploiement ✅
- [x] `projet.md` - Documentation technique complète ✅
- [x] `.gitignore` - Configuration adaptée pour déploiement ✅

### **Dépendances ajoutées**
- [x] `pg` et `@types/pg` - Support PostgreSQL ✅
- [x] Configuration Prisma pour PostgreSQL ✅
- [x] Budgets Angular ajustés pour build production ✅

---

## 🔍 ANALYSE DU SYSTÈME D'EXERCICES

### Problèmes identifiés
1. **Chargement des tags**
   - Les tags ne s'affichent pas dans le formulaire de création
   - Les catégories sont visibles mais pas les tags associés

2. **Formulaire d'édition**
   - La page "Voir un exercice" affiche un formulaire d'édition
   - Les données de l'exercice (nom, description, tags) ne sont pas correctement chargées
   - Les tags existants ne sont pas présélectionnés

3. **Persistance des données**
   - Perte des tags lors de la modification d'un exercice
   - Données non sauvegardées correctement après édition

### Analyse technique

#### Backend (Node.js/Prisma)
- **Modèle d'exercice** : Relation many-to-many avec les tags via `tags: Tag[]`
- **Contrôleur** : Gère CRUD avec support des tags
- **Routes** : Endpoints pour la gestion des exercices et des tags

#### Frontend (Angular)
- **Modèle Exercice** : Interface TypeScript avec propriétés optionnelles
- **Service Exercice** : Gère les appels API avec transformation des données
- **Composant Formulaire** : Gère l'affichage et la soumission du formulaire

### Prochaines étapes
1. **Examiner le composant de formulaire**
   - Vérifier le chargement des tags
   - Analyser la présélection des tags existants
   - Examiner la soumission du formulaire

2. **Vérifier le service des tags**
   - S'assurer que les tags sont correctement récupérés depuis l'API
   - Vérifier la transformation des données

3. **Analyser la méthode de sauvegarde**
   - Comprendre pourquoi les tags ne sont pas enregistrés
   - Vérifier la transformation des données avant envoi

4. **Tests de validation**
   - Tester le cycle complet de création/modification avec les outils de développement
   - Vérifier les appels réseau et les réponses du serveur

## 🎯 OBJECTIFS FINAUX DU DÉPLOIEMENT

### **Résultat attendu :**
- ✅ **URL publique frontend** : Vercel ou GitHub Pages
- ✅ **URL publique backend** : Render avec PostgreSQL
- ✅ **Communication fonctionnelle** : Front ↔ Back HTTPS
- ✅ **Déploiement automatique** : Git push = mise à jour
- ✅ **Utilisateurs** : Accès pour 10+ personnes simultanément

### **Critères de succès :**
- Application accessible 24/7 via URLs publiques
- Performance acceptable (< 3s chargement initial)
- Données persistantes et sécurisées
- Mises à jour simples via git push
- Interface responsive sur mobile/desktop

### **État actuel :**
- ✅ **Préparation locale** : TERMINÉE
- ✅ **Déploiement backend** : RENDER DÉPLOYÉ
- ✅ **Déploiement frontend** : VERCEL DÉPLOYÉ
- ✅ **Configuration CORS** : CORRIGÉE - Support wildcards Vercel
- ✅ **Migrations Prisma** : AMÉLIORÉES - Script force-migrate optimisé
- ⚠️ **Tests production** : EN COURS - Attente redéploiement

### **URLs de production :**
- **Frontend** : `https://ultimate-frisbee-manager-nyvni7xiv-kinder2149s-projects.vercel.app`
- **Backend** : `https://ultimate-frisbee-manager-api.onrender.com`

---

## Vue d'ensemble
Application de gestion d'entraînements d'ultimate frisbee avec backend Node.js/Express/Prisma et frontend Angular.

## Architecture actuelle

### Backend
- **Framework**: Node.js avec Express
- **Base de données**: SQLite avec Prisma ORM
- **Port**: 3002
- **Structure**: Controllers, models, routes

### Frontend
- **Framework**: Angular 17
- **UI**: Material Design
- **Architecture**: Modules avec lazy loading
- **Services**: HttpGenericService avec cache

## Fonctionnalités implémentées

### Gestion des Tags
- CRUD complet (Create, Read, Update, Delete)
- Catégorisation par type
- Interface utilisateur avec Material Design
- Validation et gestion d'erreurs

### Gestion des Exercices
- CRUD complet avec formulaires réactifs
- Association avec des tags
- Recherche et filtrage
- Duplication d'exercices
- Interface utilisateur moderne

### Gestion des Échauffements
- CRUD complet
- Système de blocs ordonnés
- Interface utilisateur avec drag & drop
- Validation et gestion d'erreurs

### Gestion des Situations/Matchs
- **Statut**: Complètement implémenté
- **Fonctionnalités**:
  - CRUD complet avec formulaires réactifs
  - Types: Situation vs Match
  - Association avec des tags
  - Interface utilisateur cohérente avec Material Design
  - Validation et gestion d'erreurs
  - Module lazy-loaded avec routing

### Gestion des Entraînements (Version enrichie)
- **Statut**: Complètement implémenté et enrichi
- **Fonctionnalités**:
  - Création et modification d'entraînements
  - **NOUVEAU**: Intégration optionnelle d'échauffements
  - Association avec des exercices (existant)
  - **NOUVEAU**: Intégration optionnelle de situations/matchs
  - Gestion de l'ordre des exercices
  - Calcul automatique de la durée totale
  - Interface utilisateur enrichie avec modals de sélection/création
  - Structure logique: Échauffement → Exercices → Situation/Match

## Fonctionnalités récemment ajoutées

### Intégration Échauffement + Exercices + Situation dans les Entraînements
- **Statut**: Complètement implémenté
- **Détails techniques**:
  - **Backend**: Relations optionnelles `echauffementId` et `situationMatchId` dans le modèle Entrainement
  - **Frontend**: Composants modals réutilisables pour sélection/création
  - **UX**: Blocs optionnels avec affichage des éléments sélectionnés
  - **Architecture**: Réutilisation des formulaires existants via modals

### Composants Modals Réutilisables
- **EchauffementModalComponent**: Sélection/création d'échauffements depuis le formulaire d'entraînement
- **SituationMatchModalComponent**: Sélection/création de situations/matchs depuis le formulaire d'entraînement
- **Design**: Interface cohérente avec possibilité de basculer entre sélection et création

## Structure technique

### Modèles de données
- **Tag**: Système de catégorisation
- **Exercice**: Exercices d'entraînement
- **Echauffement**: Séquences d'échauffement avec blocs
- **Entrainement**: Sessions d'entraînement complètes avec relations optionnelles
- **SituationMatch**: Situations de jeu et matchs
- **Relations**: Entrainement ↔ Echauffement, Entrainement ↔ SituationMatch (optionnelles)

### Services Angular
- **HttpGenericService**: Service HTTP générique avec cache
- **TagService**: Gestion des tags
- **ExerciceService**: Gestion des exercices
- **EchauffementService**: Gestion des échauffements
- **EntrainementService**: Gestion des entraînements (mis à jour pour nouvelles relations)
- **SituationMatchService**: Gestion des situations/matchs

### Composants réutilisables
- **TagFormComponent**: Formulaire de tags
- **ExerciceFormComponent**: Formulaire d'exercices
- **EchauffementFormComponent**: Formulaire d'échauffements
- **EntrainementFormComponent**: Formulaire d'entraînements enrichi
- **SituationMatchFormComponent**: Formulaire de situations/matchs
- **EchauffementModalComponent**: Modal de sélection/création d'échauffements
- **SituationMatchModalComponent**: Modal de sélection/création de situations/matchs

## Conventions de développement

### Backend
- Controllers dans `/controllers`
- Routes RESTful (`/api/{resource}`)
- Validation avec Prisma
- Gestion d'erreurs centralisée
- Relations optionnelles pour flexibilité

### Frontend
- Modules par fonctionnalité avec lazy loading
- Composants standalone quand possible
- Services avec cache et transformation
- Material Design pour l'UI
- Modals réutilisables pour intégration cross-modules

### Base de données
- Migrations Prisma pour les changements de schéma
- Relations explicites entre entités
- Contraintes de validation
- Relations optionnelles pour flexibilité d'usage

## Notes importantes
- Tous les modules suivent le même pattern architectural
- L'interface utilisateur est cohérente entre tous les modules
- Le cache est invalidé automatiquement lors des modifications
- Les formulaires utilisent la validation réactive d'Angular
- **Architecture modulaire**: Chaque entité peut être utilisée indépendamment ou intégrée dans d'autres
- **Réutilisabilité**: Les composants modals permettent l'intégration fluide entre modules

**Système de Tags**
- ✅ **Tag (exercices)** : Système complet pour catégoriser les exercices
- ✅ **TrainingTag (entraînements)** : Système séparé pour les entraînements
- ✅ **Catégories** : objectif, travail_specifique, niveau, temps, format
- ✅ **Tags niveau préenregistrés** : Sélection uniquement parmi tags existants

**🔧 Corrections Techniques Récentes**
- ✅ **Erreur suppression entraînements** : Logique optimiste corrigée
- ✅ **URLs PhaseService** : Alignement avec routes backend réelles
- ✅ **Champ imageUrl** : Ajouté au modèle Prisma et interfaces TypeScript
- ✅ **Migration Prisma** : Base de données mise à jour
- ✅ **Erreur 404 exercices** : Correction du flag `ignoreRouteParams` dans les modals
- ✅ **Système d'échauffements** : Implémentation complète backend + frontend

### 🏗️ Architecture Technique

**Backend (Node.js + Prisma + SQLite)**
- ✅ **Modèles Prisma** : Exercice, Tag, Entrainement, Echauffement, BlocEchauffement
- ✅ **Controllers** : exercice.controller.js, entrainement.controller.js, echauffement.controller.js
- ✅ **Routes API** : `/api/exercices`, `/api/entrainements`, `/api/echauffements`, `/api/tags`
- ✅ **Gestion des relations** : Tags, phases, exercices, blocs avec cascade delete

**Frontend (Angular + Material Design)**
- ✅ **Services** : ExerciceService, EntrainementService, EchauffementService, TagService
- ✅ **Composants** : Formulaires, listes, widgets réutilisables
- ✅ **Modèles TypeScript** : Interfaces strictement typées
- ✅ **Routing** : Navigation complète entre modules avec lazy loading

## 🔐 SYSTÈME D'AUTHENTIFICATION

### **OBJECTIF**
Implémenter un système d'authentification JWT basique avec utilisateur unique par défaut, évolutif vers multi-utilisateurs.

### **SPÉCIFICATIONS**
- **Utilisateur par défaut** : Admin / Ultim@t+ / admin@ultimate.com
- **Technologie** : JWT avec session persistante (7 jours)
- **Sécurité** : Niveau basique, prêt pour évolution
- **Données utilisateur** : ID, email, mot de passe, icône

### **ARCHITECTURE AUTHENTIFICATION**

#### **Backend - Modifications**
- [x] **Modèle User** : Ajout dans schema.prisma avec utilisateur Admin par défaut
- [x] **Routes auth** : `/api/auth/login`, `/api/auth/profile`, `/api/auth/refresh`
- [x] **Middleware JWT** : Protection des routes existantes
- [x] **Dépendances** : bcryptjs, jsonwebtoken, express-rate-limit

#### **Frontend - Modifications**
- [x] **AuthService** : Gestion login/logout/tokens avec localStorage
- [x] **AuthGuard** : Protection des routes principales
- [x] **Login Component** : Interface de connexion simple
- [x] **HTTP Interceptor** : Ajout automatique token Authorization
- [x] **Routing** : Redirection vers login si non authentifié

### **IMPLÉMENTATION**

#### **Étape 1 : Backend Auth**
- [x] Modèle User dans Prisma
- [x] Seed utilisateur Admin par défaut
- [x] Routes d'authentification
- [x] Middleware de protection JWT
- [x] Migration base de données

#### **Étape 2 : Frontend Auth**
- [x] Service d'authentification Angular
- [x] Composant de connexion
- [x] Guards et intercepteurs
- [x] Mise à jour du routing principal

#### **Étape 3 : Intégration**
- [x] Protection de toutes les routes existantes
- [x] Gestion des erreurs d'authentification
- [x] Tests de connexion/déconnexion
- [x] Validation session persistante

### **ROUTES PROTÉGÉES**
Toutes les routes existantes seront protégées :
- `/exercices` → Nécessite authentification
- `/entrainements` → Nécessite authentification  
- `/echauffements` → Nécessite authentification
- `/situations-matchs` → Nécessite authentification
- `/dashboard` → Nécessite authentification

### **EXPÉRIENCE UTILISATEUR**
- **Page d'accueil** : Redirection automatique vers login
- **Session active** : Accès direct aux fonctionnalités
- **Session expirée** : Redirection vers login avec message
- **Déconnexion** : Nettoyage session et retour login

### **DÉPLOIEMENT PRODUCTION - MODIFICATIONS REQUISES**

#### **⚠️ IMPORTANT : Modifications à effectuer avant déploiement Render**

**1. Remettre PostgreSQL dans schema.prisma :**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**2. Migrations et utilisateur Admin en production :**
```bash
# Sur Render (après déploiement)
npx prisma migrate deploy
node prisma/seed-auth.js
```

**3. Variables d'environnement Render :**
- `DATABASE_URL` : Fournie automatiquement par PostgreSQL Render
- `NODE_ENV` : `production`
- `JWT_SECRET` : Générer une clé sécurisée pour la production
- `CORS_ORIGINS` : URL Vercel de production

**4. Identifiants production :**
- **Email** : `admin@ultimate.com`
- **Mot de passe** : `Ultim@t+`

#### **Configuration locale vs Production**
- **Local** : SQLite (`provider = "sqlite"`) + `.env` avec `DATABASE_URL="file:./dev.db"`
- **Production** : PostgreSQL (`provider = "postgresql"`) + Variables Render

---

## 📂 Nouveau Plan Fonctionnel: Onglet « Paramètres », déplacement « Gestionnaire de tags » et Page Admin

### 🎯 Objectifs
- **Créer un onglet "Paramètres"** regroupant les pages d’administration.
- **Déplacer** le « Gestionnaire de tags » sous cet onglet.
- **Ajouter** une page « Aperçu des données » accessible **uniquement** à l’admin avec un inventaire structuré (exercices, échauffements, situations/matchs, tags, utilisateurs).

### 🧭 Architecture impactée
- Frontend Angular (`frontend/src/app/`): routing, module feature `settings`, `RoleGuard`, navigation.
- Backend Node/Express (`backend/`): middleware rôle admin, nouvelle route `/api/admin/overview`.

### ✅ Étapes Frontend
- __[settings module]__ Créer `features/settings/settings.module.ts` (lazy) avec routes enfants:
  - `parametres/tags` → réutilise `TagsManagerComponent`.
  - `parametres/admin` → nouveau `DataOverviewComponent` (admin-only).
  - `parametres` → redirect `tags`.
- **RoleGuard (admin)**: `core/guards/role.guard.ts` vérifie `user.role==='admin'` via `AuthService`.
- **Routing racine** (`app.module.ts`): ajouter `{ path: 'parametres', loadChildren: ... , canActivate: [AuthGuard] }`.
- **Navigation** (`app.component.html`):
  - Retirer « Gérer les tags » du menu « Exercices ».
  - Ajouter un menu « Paramètres » avec:
    - « Gestionnaire de tags » → `/parametres/tags`.
    - « Aperçu des données (Admin) » → `/parametres/admin` (affiché seulement si admin).
- **DataOverviewComponent** (`features/settings/pages/data-overview/`):
  - UI Material (onglets ou tables) pour Exercices, Entraînements, Échauffements, Situations/Matchs, Tags, Utilisateurs.
  - Utiliser services existants (`ExerciceService`, `EntrainementService`, `EchauffementService`, `SituationMatchService`, `TagService`).
  - Pagination/tri (`MatTableDataSource`, `MatSort`, `MatPaginator`).
- **AuthService**: exposer l’utilisateur courant/son rôle (`currentUser$`) si besoin pour RoleGuard et affichage conditionnel.
- **Compat route /tags**: rediriger proprement vers `/parametres/tags` (temporaire) pour éviter les liens cassés.

### ✅ Étapes Backend
- **Middleware rôle admin** (`backend/middleware/auth.middleware.js`): ajouter `requireAdmin` (403 si `req.user.role!=='admin'`).
- **Contrôleur admin** (`backend/controllers/admin.controller.js`): `GET /api/admin/overview` renvoyant compteurs + listes paginées (champ filtrés, sans données sensibles).
- **Routes** (`backend/routes/admin.routes.js`): protéger par `authenticateToken` + `requireAdmin`.

### 🔒 Sécurité
- Vérification rôle côté **frontend** (RoleGuard) et **backend** (requireAdmin).
- Pagination et champs sélectionnés pour éviter retours massifs/sensibles.
- Jamais exposer mots de passe ni tokens.

### ⚠️ Pièges à éviter
- Oublier la double protection (front et back) des pages admin.
- Casser la navigation mobile: ajouter la bulle « Paramètres » en respectant `shared/styles/mobile-optimizations.scss`.
- Confusion entre `tags` et `tags-advanced`: ne déplacer que le gestionnaire standard.
- Risque de performance: implémenter pagination/tri et chargement à la demande.

### 📁 Arborescence à créer
- `frontend/src/app/features/settings/`
  - `settings.module.ts`
  - `pages/data-overview/data-overview.component.{ts,html,scss}`
- `frontend/src/app/core/guards/role.guard.ts`
- `backend/controllers/admin.controller.js`
- `backend/routes/admin.routes.js`

### 🧪 Tests
- Cypress: non-admin → accès refusé `/parametres/admin` (redirect), admin → accès OK.
- Smoke tests: chargement paginé de chaque entité, export CSV (optionnel).

### 🎯 Critères d’acceptation
- Menu « Paramètres » présent, « Gestionnaire de tags » déplacé.
- `/parametres/admin` accessible uniquement pour admin.
- Endpoint `/api/admin/overview` sécurisé et fonctionnel.

---

## ✅ Plan UI: Fusion menu Utilisateur/Paramètres et Harmonisation formulaire Exercices

### 🎯 Objectifs
- Unifier les menus « Profil » et « Paramètres » en un seul bouton utilisateur dans la barre d’app (`app.component.html`).
- Corriger l’ouverture permanente des dropdowns dans le formulaire d’exercice.
- Harmoniser l’UI/UX de sélection des tags pour toutes les catégories (objectif, travail_spécifique, niveau, temps, format).

### 🔎 Diagnostic (résumé)
- Fuite CSS du header: `.dropdown-menu { display: block !important; ... }` dans `frontend/src/app/app.component.css` s’applique globalement et force l’affichage des menus du formulaire.
- Incohérence « Niveau »: UI différente (grille cliquable) vs autres catégories (autocomplete + chips).
- Valeurs de formulaire hétérogènes (strings concaténées vs arrays), complexifiant la maintenance.

### 🛠️ Étapes techniques
1) Scoper les styles du header
   - Modifier `app.component.css`: cibler `.main-nav .dropdown-menu` et retirer `display: block !important` et `pointer-events: auto !important`.
   - Laisser la logique d’affichage au template (`*ngIf`, classes `open`).

2) Harmoniser la sélection des tags dans le formulaire d’exercice
   - Option rapide: rendre « Niveau » identique aux autres (pattern autocomplete + chips) et conserver l’affichage d’étoiles dans les badges via `displayFn`.
   - Option durable: créer `shared/components/tag-select/TagSelectComponent` réutilisable.
     - Inputs: `category`, `multiple`, `selected`, `placeholder`, `displayFn?`.
     - Outputs: `selectedChange`.
     - Comportement: input de recherche, dropdown filtrée, chips sélectionnées, fermeture au blur/clic extérieur.

3) Standardiser les valeurs du formulaire
   - Utiliser des arrays d’IDs (`string[]`) ou de `Tag` côté form state.
   - Mapper proprement vers `tagIds: string[]` au `submit`.

4) QA visuelle et mobile
   - Vérifier fermeture des dropdowns (focus/blur, clic extérieur, escape).
   - Vérifier tailles et espacements, et comportement mobile.

### 📋 Tâches
- [ ] CSS header scoping `.main-nav .dropdown-menu` (supprimer `display: block !important`).
- [ ] Vérifier fermeture des dropdowns dans `exercice-form`.
- [ ] Choix de l’option d’harmonisation (« rapide » ou « durable »).
- [ ] Implémenter `TagSelectComponent` si option durable retenue.
- [ ] Migrer « Niveau » vers pattern unifié.
- [ ] Standardiser form values (arrays) et adapter `onSubmit()`.
- [ ] Tests desktop + mobile.

### ✅ Critères d’acceptation
- Le menu utilisateur/paramètres est unique et fonctionne sur desktop et mobile.
- Les dropdowns des tags s’ouvrent/se ferment correctement sans rester affichés.
- « Niveau », « Travail spécifique », « Temps », « Format » partagent le même pattern d’UI.
- Les valeurs envoyées au backend pour les tags sont cohérentes (arrays d’IDs) et testées.