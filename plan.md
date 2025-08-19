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

### **ÉTAPE 1 : PRÉPARATION DU PROJET (LOCAL)** 🔧

#### **1.1 Configuration Backend**
- [ ] Vérifier que le backend écoute sur `0.0.0.0` (et pas uniquement localhost)
- [ ] Ajouter gestion CORS pour autoriser les appels depuis le domaine du front
- [ ] Configurer lecture de `DATABASE_URL` via variable d'environnement
- [ ] Tester compatibilité PostgreSQL avec Prisma

#### **1.2 Configuration Frontend**
- [ ] Créer `environment.prod.ts` avec URL de production :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api'
};
```
- [ ] Vérifier configuration build Angular pour production
- [ ] Tester build local : `ng build --configuration production`

### **ÉTAPE 2 : DÉPLOIEMENT BACKEND SUR RENDER** 🚀

#### **2.1 Configuration Render**
- [ ] Créer compte sur Render
- [ ] Créer service web et connecter le repo GitHub du backend
- [ ] Définir build command : `npm install`
- [ ] Définir start command : `npm start`
- [ ] Ajouter service PostgreSQL via Render

#### **2.2 Variables d'environnement**
- [ ] Configurer `DATABASE_URL` (fournie par PostgreSQL Render)
- [ ] Configurer `PORT` (automatique sur Render)
- [ ] Tester que l'API est accessible via l'URL publique Render

#### **2.3 Migration base de données**
- [ ] Adapter schema Prisma pour PostgreSQL
- [ ] Exécuter migrations Prisma en production
- [ ] Exécuter seed pour données initiales

### **ÉTAPE 3 : DÉPLOIEMENT FRONTEND** 🌐

#### **Option A : Vercel (Recommandé)**
- [ ] Créer projet sur Vercel
- [ ] Connecter repo GitHub du frontend
- [ ] Définir commande de build : `ng build --configuration production`
- [ ] Configurer dossier de sortie : `dist/`
- [ ] Activer redéploiement automatique sur git push

#### **Option B : GitHub Pages**
- [ ] Créer workflow GitHub Action pour build Angular
- [ ] Configurer `ng build --prod --base-href "/ultimate-frisbee-manager/"`
- [ ] Déployer dossier `dist/` sur Pages

### **ÉTAPE 4 : COMMUNICATION FRONT ↔ BACK** 🔗

#### **4.1 Configuration CORS**
- [ ] Configurer CORS backend pour accepter uniquement le domaine du front
- [ ] Exemple : `https://ultimate-frisbee-manager.vercel.app`
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