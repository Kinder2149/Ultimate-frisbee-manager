# Stratégie d’environnements & Workflow Git

_Date : 2025-11-20_

Ce document définit la **référence canonique** pour :

- La **stratégie d’environnements** (local, prod, optionnel staging).
- Les **règles de gestion des variables d’environnement** (backend & frontend).
- Le **workflow Git** recommandé.
- Une **checklist PR/commit** spécifique aux variables d’environnement.
- Un **exemple complet** d’ajout de variable (`MY_NEW_FEATURE_URL`).
- Les **commandes locales minimales** pour lancer le projet.

Ce document est complémentaire à :

- `audit_env_report.md` (diagnostic détaillé actuel).
- `DEPLOYMENT.md` (guide de déploiement Render/Vercel).
- `plan.md`, `history.md`, `pitfalls.md`, `QUICK_REFERENCE.md` (méthodologie de résolution de problèmes).

---

## 1. Objectifs

1. **Séparer clairement** :
   - un environnement **local** (dev) pour expérimenter,
   - un environnement **production** (Render + Vercel) stable,
   - un environnement **staging** optionnel (facultatif, futur),
   sans modifier en permanence la configuration des services en ligne.

2. **Standardiser la gestion des variables** :
   - savoir **où** déclarer une nouvelle variable,
   - comment la propager vers **Render** / **Vercel**,
   - comment la **documenter** pour les futurs devs.

3. **Fixer un workflow Git simple** :
   - **pas de développement direct sur `master`**,
   - branches de features nommées proprement,
   - checklist PR pour vérifier la cohérence des environnements.

4. **Réduire les risques** :
   - éviter les hardcodes involontaires,
   - éviter les `.env` partiellement mis à jour,
   - limiter les "bidouilles" pour tester une feature.

---

## 2. Stratégie d’environnements

### 2.1. Vue d’ensemble

Nous distinguons 3 niveaux d’environnements :

1. **Local (dev)** – *obligatoire*
   - Objectif : développer, tester en conditions contrôlées.
   - Backend : `backend/.env` + DB locale/Supabase de dev.
   - Frontend : `frontend/src/environments/environment.ts`.

2. **Production (prod)** – *obligatoire*
   - Objectif : environnement utilisé par les utilisateurs finaux.
   - Backend : Render (`render.yaml` + secrets Render).
   - Frontend : Vercel (build Angular prod → `environment.prod.ts`).

3. **Staging / Préprod (optionnel)** – *évolution possible*
   - Objectif : tester des features "réalistes" sans toucher la prod.
   - Backend : service Render secondaire (ex: `ultimate-frisbee-manager-api-staging`).
   - Frontend : branche dédiée déployée sur Vercel, ou projet Vercel dédié.
   - Fichier Angular possible : `environment.staging.ts`.

### 2.2. Backend – Règles d’environnement

- **Fichier de travail local** : `backend/.env`
  - Contient les secrets utilisés **uniquement en local**.
  - **NE JAMAIS** le committer.

- **Référence fonctionnelle** : `backend/.env.example`
  - Contient **toutes les variables attendues** (noms + commentaires).
  - Sert de **source de vérité** pour la configuration requise.
  - Chaque nouvelle variable d’environnement **doit obligatoirement** y être ajoutée.

- **Autres fichiers `.env.*`** :
  - `backend/.env.supabase` : exemple/profil pour utiliser Supabase en dev.
  - `backend/.env.test` : environnement dédié aux tests automatisés (`NODE_ENV=test`).
  - Ils ne sont **pas** chargés automatiquement par le runtime en production.

- **Production backend** :
  - Configurée via **Render** :
    - `render.yaml` décrit les variables.
    - Les valeurs réelles sont définies dans les **Render Secrets**.
  - Le fichier `.env` n’est pas utilisé en prod; tout vient de `process.env` injecté par Render.

### 2.3. Frontend – Règles d’environnement

- **Dev local** : `frontend/src/environments/environment.ts`
  - Utilisé par `ng serve`.
  - Contient l’URL de l’API locale (`http://localhost:3002/api`) et les paramètres Supabase dev.

- **Prod** : `frontend/src/environments/environment.prod.ts`
  - Utilisé par `ng build --configuration production` (et donc par Vercel pour le build prod).
  - Contient l’URL de l’API Render et les paramètres Supabase prod.

- **Staging (optionnel)** :
  - Peut être ajouté via `environment.staging.ts` et une configuration Angular supplémentaire.
  - À introduire seulement quand le besoin apparaît (en cohérence avec Render/Vercel).

- **Variables Vercel** :
  - Vercel permet de définir des variables d’environnement (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.).
  - Le code Angular actuel lit directement `environment.*.ts`. Une évolution future pourra exploiter ces envs Vercel (build-time ou runtime), mais la stratégie de base reste : **`environment.ts` pour dev, `environment.prod.ts` pour prod**.

---

## 3. Règles de gestion des variables d’environnement

Cette section décrit ce qu’il faut faire **à chaque ajout ou modification** de variable d’environnement.

### 3.1. Règles générales

1. **Toujours partir de `.env.example`** :
   - Toute nouvelle variable **doit d’abord** être déclarée dans `backend/.env.example` avec un commentaire clair.
   - C’est la "liste maîtresse" : si une variable n’y apparaît pas, elle sera oubliée ailleurs.

2. **Toujours identifier le périmètre** :
   - Est-ce une variable uniquement backend ? uniquement frontend ? ou les deux ?
   - Impact prod seulement, dev seulement, ou les deux ?

3. **Ne jamais committer de secret réel** :
   - Clés Cloudinary, mots de passe DB, JWT secrets, etc. **ne doivent jamais** apparaître en clair hors `.env` local (qui est ignoré par Git) et secrets Render/Vercel.

4. **Documenter immédiatement** :
   - Toute nouvelle variable doit être **ajoutée à `DEPLOYMENT.md`** (section environnement), avec :
     - où la définir (Render/Vercel/local),
     - un exemple de valeur,
     - l’impact fonctionnel.

### 3.2. Ajout d’une variable backend

Pour une variable d’environnement **backend** (ex : `MY_NEW_FEATURE_URL`) :

1. **Déclarer dans `backend/.env.example`** :
   - Ajouter une entrée commentée :
     ```env
     # URL du service X pour la nouvelle fonctionnalité Y
     MY_NEW_FEATURE_URL="https://example.com/api"
     ```

2. **Mettre la valeur dans `backend/.env` (local)** :
   - Adapter la valeur pour le dev local (URL locale ou sandbox) dans ton fichier `.env` **non committé**.

3. **Ajouter la variable dans `render.yaml`** si utilisée en prod :
   - Dans la section `services.envVars`, ajouter :
     ```yaml
     - key: MY_NEW_FEATURE_URL
       fromSecret: my-new-feature-url
     ```
   - Créer le secret `my-new-feature-url` dans Render avec la valeur prod.

4. **Utiliser la variable via `config`** :
   - Ajouter `process.env.MY_NEW_FEATURE_URL` dans `backend/config/index.js` (si besoin d’un accès centralisé).
   - Utiliser `config` dans le code métier au lieu d’accéder directement à `process.env` partout.

5. **Documenter dans `DEPLOYMENT.md`** :
   - Ajouter une ligne du type :
     > `MY_NEW_FEATURE_URL` : URL du service X pour la feature Y. À définir comme secret Render `my-new-feature-url`.

### 3.3. Ajout d’une variable frontend

Pour une variable **frontend** (ex : `MY_NEW_FEATURE_URL`) :

1. **Ajouter dans `environment.ts` (dev)** :
   ```ts
   export const environment = {
     ...,
     myNewFeatureUrl: 'http://localhost:3002/api/my-new-feature'
   };
   ```

2. **Ajouter dans `environment.prod.ts` (prod)** :
   ```ts
   export const environment = {
     ...,
     myNewFeatureUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api/my-new-feature'
   };
   ```

3. **(Optionnel) Lier avec des env Vercel** :
   - Si une évolution est faite pour lire des valeurs de `process.env` au build (via un mécanisme spécifique Angular), mettre à jour également les variables dans les settings Vercel.

4. **Documenter dans `DEPLOYMENT.md`** :
   - Expliquer que `myNewFeatureUrl` est configurée dans `environment*.ts`, et quelles URLs utiliser pour dev/prod.

### 3.4. Modification d’une variable existante

- Suivre la même logique que pour un ajout :
  - Mettre à jour **les deux mondes** : `.env.example` / `render.yaml` pour le backend, `environment.ts` / `environment.prod.ts` pour le frontend.
  - Mettre à jour `DEPLOYMENT.md`.
  - Vérifier `audit_env_report.md` si besoin de cohérence.

---

## 4. Workflow Git recommandé

### 4.1. Branches

- **`master`** :
  - Branche de **production**.
  - Seuls les commits **validés** passent sur `master`.
  - **Règle : pas de dev direct sur `master`.**

- **Branches de feature** :
  - Nom standard : `feature/<description-courte>`
    - Ex : `feature/export-import-service`, `feature/supabase-migration`, `feature/my-new-feature-url`.
  - Développement quotidien, y compris modifications de config (dans le respect des règles ci-dessus).

- **Branches de hotfix** :
  - Nom standard : `hotfix/<bug-ou-urgence>`.
  - Pour corriger rapidement un problème de prod.

### 4.2. Règles de merge

- Toute modification significative (code + config) passe par :
  1. Création ou mise à jour d’une branche de feature.
  2. Commit(s) réguliers.
  3. Ouverture d’une PR (même si tu es seul, pour suivre la checklist).
  4. Validation de la checklist PR (section suivante).
  5. Merge dans `master` (fast-forward ou squash suivant ta préférence).

- Pour les hotfix critiques, tu peux :
  - Créer `hotfix/...` à partir de `master`,
  - Corriger,
  - Merger rapidement dans `master`,
  - Puis **rebaser** les branches de feature au besoin.

### 4.3. Naming convention des messages de commit

- Recommandation (non bloquante, mais utile) :
  - `feat: ...` pour les nouvelles fonctionnalités.
  - `fix: ...` pour les corrections de bugs.
  - `chore: ...` pour la maintenance.
  - `docs: ...` pour la documentation.
  - `refactor: ...` pour les refactorings.

Exemples :

- `feat: add MY_NEW_FEATURE_URL backend config`
- `docs: update DEPLOYMENT.md with new env vars`
- `fix: adjust CORS_ORIGINS for new Vercel URL`

---

## 5. Checklist Commit / PR liée aux variables d’environnement

À utiliser **avant tout merge vers `master`** lorsqu’une PR touche à des variables/env.

### 5.1. Checklist variables backend

- [ ] **Nom de variable cohérent** et en MAJUSCULES (ex : `MY_NEW_FEATURE_URL`).
- [ ] Variable ajoutée ou mise à jour dans `backend/.env.example` avec commentaire.
- [ ] Variable ajoutée dans `render.yaml` si utilisée en prod (ou confirmée comme locale uniquement).
- [ ] Secret Render correspondant créé/mis à jour (`fromSecret` ↔ nom du secret).
- [ ] `DEPLOYMENT.md` mis à jour (section backend/env).
- [ ] Aucune valeur sensible commitée (vérifier diff / recherche globale du secret).

### 5.2. Checklist variables frontend

- [ ] Variable ajoutée/ajustée dans `environment.ts` (dev).
- [ ] Variable ajoutée/ajustée dans `environment.prod.ts` (prod).
- [ ] Si les env Vercel sont utilisés : variables créées/mises à jour côté Vercel.
- [ ] `DEPLOYMENT.md` mis à jour (section frontend/env).

### 5.3. Checklist globale PR

- [ ] `audit_env_report.md` reste cohérent (si la modification est structurante, envisager une mise à jour de l’audit).
- [ ] `plan.md` mis à jour avec un résumé de la modification.
- [ ] `history.md` mis à jour si des hypothèses ont été testées.
- [ ] `pitfalls.md` mis à jour si un nouveau piège a été identifié.

---

## 6. Exemple complet : ajout de `MY_NEW_FEATURE_URL`

Scénario : tu ajoutes une nouvelle fonctionnalité qui consomme un service externe, accessible via une URL différente en dev et en prod.

### 6.1. Backend seulement

1. **Ajouter dans `backend/.env.example`** :

   ```env
   # URL du service de recommandation pour la nouvelle fonctionnalité
   MY_NEW_FEATURE_URL="https://example.com/api/reco"
   ```

2. **Ajouter dans `backend/.env` (local, non committé)** :

   ```env
   MY_NEW_FEATURE_URL="http://localhost:4000/api/reco"
   ```

3. **Mettre à jour `backend/config/index.js`** (si accès centralisé nécessaire) :

   ```js
   const config = {
     ...,
     myNewFeatureUrl: process.env.MY_NEW_FEATURE_URL,
   };
   ```

4. **Utiliser `config.myNewFeatureUrl` dans le code backend** (par ex. dans un service ou un contrôleur).

5. **Mettre à jour `render.yaml`** :

   ```yaml
   envVars:
     - key: MY_NEW_FEATURE_URL
       fromSecret: my-new-feature-url
   ```

6. **Créer le secret Render `my-new-feature-url`** avec la valeur prod.

7. **Documenter dans `DEPLOYMENT.md`** :

   > `MY_NEW_FEATURE_URL` : URL du service de recommandation pour la fonctionnalité X. À définir dans Render comme secret `my-new-feature-url`.

8. **Passer la checklist PR backend** (section 5.1).

### 6.2. Frontend + backend

Si le frontend a aussi besoin de cette URL (par ex. pour appeler directement ce service) :

1. **Ajouter dans `frontend/src/environments/environment.ts`** :

   ```ts
   export const environment = {
     ...,
     myNewFeatureUrl: 'http://localhost:4000/api/reco'
   };
   ```

2. **Ajouter dans `frontend/src/environments/environment.prod.ts`** :

   ```ts
   export const environment = {
     ...,
     myNewFeatureUrl: 'https://example.com/api/reco'
   };
   ```

3. **Utiliser `environment.myNewFeatureUrl`** dans les services Angular concernés.

4. **Mettre à jour `DEPLOYMENT.md`** pour documenter l’URL dev/prod côté front.

5. **Passer la checklist PR frontend** (section 5.2).

---

## 7. Commandes locales minimales

> Pour les scripts détaillés (migrations, export UFM, etc.), voir le document dédié du Prompt 8.

### 7.1. Lancer le backend en local

Depuis la racine du repo :

```bash
# Installer les dépendances backend (si pas déjà fait)
npm install --prefix backend

# Lancer le backend en mode développement
npm run dev --prefix backend
```

Pré-requis :

- Fichier `backend/.env` présent, basé sur `backend/.env.example`.
- Base de données accessible (SQLite ou Supabase, selon `DATABASE_URL`).

### 7.2. Lancer le frontend en local

Depuis la racine du repo :

```bash
# Installer les dépendances frontend (si pas déjà fait)
npm install --prefix frontend

# Lancer le frontend (Angular)
npm start --prefix frontend
```

Le frontend utilisera alors `environment.ts` avec :

- `apiUrl = 'http://localhost:3002/api'`
- Supabase pointant sur l’instance définie dans ce fichier.

---

## 8. Résumé

- **Local vs Prod** :
  - Local : `.env` backend + `environment.ts`.
  - Prod : secrets Render + `environment.prod.ts`.

- **Ajout de variable** :
  - Toujours passer par `.env.example` (backend) et `environment*.ts` (frontend), puis Render/Vercel + `DEPLOYMENT.md`.

- **Workflow Git** :
  - Pas de dev sur `master`.
  - Branches `feature/...` et `hotfix/...`.
  - PR avec checklist spéciale env.

Ce document est la **référence** à suivre pour toute évolution touchant aux environnements ou aux variables de configuration.
