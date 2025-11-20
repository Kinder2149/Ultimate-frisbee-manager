# Audit des environnements & configuration – Ultimate Frisbee Manager

_Date : 2025-11-20_

## 1. Résumé exécutif

- Le **backend** dispose déjà d’une séparation propre entre **dev local** (`backend/.env`) et **prod** (secrets Render via `render.yaml` + validation centralisée dans `backend/config/index.js`). La configuration est globalement saine et documentée.
- Le **frontend** s’appuie sur le mécanisme standard Angular `environment.ts` / `environment.prod.ts`, mais **hardcode** l’URL de l’API et les paramètres Supabase, sans tirer parti des variables d’environnement Vercel.
- Les variables critiques (DB, JWT, Cloudinary) sont bien centralisées, mais la **procédure de création/mise à jour** d’une variable n’est pas encore formalisée (où l’ajouter, comment la répercuter sur Render/Vercel et dans la doc).
- Les principaux risques viennent de la tentation de **modifier les fichiers d’environnement front** (ou `.env` backend) pour tester, et du décalage entre la documentation de déploiement (`DEPLOYMENT.md`) et l’état réel du projet (Render/Vercel actuels).
- En mettant en place une **check‑list standard** et une **politique stricte pour les fichiers d’environnement**, tu peux atteindre ton objectif : **prod figée + dev local libre** sans modifier en permanence les paramètres des services en ligne.

---

## 2. Inventaire des variables d’environnement & paramètres

### 2.1. Backend – Fichiers lus

- `backend/.env`
- `backend/.env.example`
- `backend/.env.supabase`
- `backend/.env.test`
- `backend/config/index.js`
- `backend/server.js`
- `backend/package.json`
- `render.yaml`

### 2.2. Frontend – Fichiers lus

- `frontend/src/environments/environment.ts`
- `frontend/src/environments/environment.prod.ts`
- `frontend/package.json`
- `vercel.json`

### 2.3. Documentation & guides

- `plan.md`
- `DEPLOYMENT.md`
- `history.md`
- `pitfalls.md`
- `QUICK_REFERENCE.md`

Aucun autre fichier `*.yaml` ou `*.json` lié au déploiement n’est présent à la racine, en dehors de `render.yaml` et `vercel.json`.

---

## 3. Mécanisme backend – Chargement & validation des variables

### 3.1. Chargement (`backend/config/index.js`)

- Utilisation de `dotenv` pour charger un fichier `.env` **local au backend** :
  - Chemin construit par : `path.resolve(__dirname, '..', '.env')`.
  - Appel : `dotenv.config({ path: envPath, override: true })`.
- Comportement :
  - Si le fichier `.env` est introuvable et que `NODE_ENV !== 'production'`, un **warning** est loggé.
  - En production, Render injecte les variables via son système de secrets : le `.env` peut ne pas exister, ce qui est acceptable.
- Le module construit ensuite un objet `config` en lisant `process.env` :
  - `config.port` ← `PORT` (ou `3002` par défaut)
  - `config.databaseUrl` ← `DATABASE_URL`
  - `config.corsOrigins` ← `CORS_ORIGINS` (ou `http://localhost:4200`)
  - `config.cloudinary` ← `CLOUDINARY_URL` ou triplet `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`
  - `config.jwt` ← `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
  - `config.rateLimit` ← `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_ENABLED`

### 3.2. Validation critique

- `JWT_SECRET` :
  - Si absent → `console.error` + `process.exit(1)` → **démarrage interdit**.
- `JWT_REFRESH_SECRET` :
  - Si absent → simple `console.warn` → **rafraîchissement de token désactivé**, mais serveur démarre.
- Cloudinary :
  - Si ni `CLOUDINARY_URL` ni les trois variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` ne sont présentes → `throw new Error('Configuration Cloudinary manquante ou incomplète...')` → crash au démarrage.
  - Si `CLOUDINARY_URL` absent mais triplet présent → warning, mais fonctionnement possible.

### 3.3. Utilisation au démarrage (`backend/server.js`)

- `server.js` importe `config` dès le début et utilise :
  - `config.port` pour le port d’écoute.
  - `config.jwt.refreshSecret` pour logguer si le refresh JWT est activé ou non.
  - `config.cloudinary.url` pour indiquer le mode Cloudinary utilisé.
- Au démarrage (hors tests) :
  - Log de l’URL d’écoute.
  - Avertissement si `JWT_REFRESH_SECRET` absent (rafraîchissement désactivé).
  - Avertissement si `CLOUDINARY_URL` absent.
  - Appel à `testCloudinaryConnection()` pour vérifier la connexion Cloudinary (ping API Admin).
  - Tentative de connexion Prisma (`prisma.$connect()`), avec logs clair `✅`/`❌`.

### 3.4. Secrets Render – `render.yaml`

- Fichier : `render.yaml` (racine du repo) :

  ```yaml
  services:
    - type: web
      name: ultimate-frisbee-manager-api
      env: node
      buildCommand: cd backend && npm install && npm run deploy:render
      startCommand: cd backend && npm start
      plan: free
      region: frankfurt
      rootDir: ./
      envVars:
        - key: NODE_VERSION
          value: 20
        - key: NODE_ENV
          value: production
        - key: DATABASE_URL
          fromSecret: supabase-database-url
        - key: CORS_ORIGINS
          value: https://ultimate-frisbee-manager-kinder.vercel.app,http://localhost:4200
        - key: JWT_SECRET
          fromSecret: jwt-secret
        - key: JWT_REFRESH_SECRET
          fromSecret: jwt-refresh-secret
        - key: CLOUDINARY_URL
          fromSecret: cloudinary-url
  
  databases:
    - name: ultimate-frisbee-manager-db
      plan: free
      region: frankfurt
  ```

- Mécanisme :
  - En prod, Render injecte les valeurs des variables référencées par `fromSecret` et `value` dans `process.env` **avant** que Node ne démarre.
  - `backend/config/index.js` lit donc ces valeurs sans dépendre d’un `.env` en prod.

---

## 4. Mécanisme frontend – Environnements Angular & build

### 4.1. Fichiers d’environnement Angular

- `frontend/src/environments/environment.ts` (dev) :

  ```ts
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3002/api',
    supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
    supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
  };
  ```

- `frontend/src/environments/environment.prod.ts` (prod) :

  ```ts
  export const environment = {
    production: true,
    apiUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api',
    supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
    supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
  };
  ```

### 4.2. Choix de l’environnement au build

- `frontend/package.json` :

  ```json
  {
    "scripts": {
      "start": "ng serve",
      "build": "ng build",
      "watch": "ng build --watch --configuration development",
      "test": "ng test"
    }
  }
  ```

- Avec Angular 17, la sélection de l’environnement est gérée via la **configuration de build** (`angular.json`) :
  - `ng build` ou `ng build --configuration production` utilise `fileReplacements` pour remplacer `environment.ts` par `environment.prod.ts`.
  - `ng serve` utilise généralement la configuration de développement (donc `environment.ts`).
- Tu n’as pas de logique dynamique côté Vercel pour modifier `apiUrl` ou les clés à partir de variables d’environnement Vercel : tout est **hardcodé** dans les fichiers d’environnements.

### 4.3. Déploiement Vercel (`vercel.json`)

- Fichier :

  ```json
  {
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/static-build",
        "config": {
          "distDir": "frontend/dist/ultimate-frisbee-manager"
        }
      }
    ],
    "routes": [
      { "src": "/(.*\\.[^/]+)$", "dest": "/$1" },
      { "src": "/.*", "dest": "/index.html" }
    ]
  }
  ```

- Interprétation :
  - Vercel lance un build statique à partir de la racine du repo (la commande exacte est renseignée dans l’interface Vercel, mais le front est buildé en **mode prod** → `environment.prod.ts`).
  - Tu as, dans `DEPLOYMENT.md`, une section qui suggère l’utilisation de variables d’environnement Vercel (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), mais le code front actuel n’utilise pas ces variables directement : il consomme les valeurs **hardcodées** dans `environment*.ts`.

---

## 5. Tableau synthétique des variables & actions

> **Légende des priorités** :
> - **P0** : à sécuriser / aligner **immédiatement** (impact sécurité ou prod direct).
> - **P1** : important pour la maintenabilité et ton objectif prod figée + dev libre.
> - **P2** : amélioration de confort / long terme.

### 5.1. Backend – Variables d’environnement

| Variable | Source dev (exemple) | Consommation principale | Action requise pour prod (Render) | Priorité |
|---------|----------------------|--------------------------|------------------------------------|----------|
| `DATABASE_URL` | `backend/.env`, `.env.example`, `.env.supabase`, `.env.test` | `config.databaseUrl` (Prisma, DB) | Définir comme secret Render (`supabase-database-url`) référencé dans `render.yaml`. S’assurer que la valeur correspond à la base **prod**. | **P0** |
| `PORT` | `PORT=3002` dans `.env` / `.env.example` | `config.port` → `server.js` (port d’écoute) | Optionnel en prod; Render fournit un port, mais peut être surchargé. Conserver la valeur dans `.env.example` pour la doc. | P2 |
| `NODE_ENV` | `NODE_ENV=development` dans `.env`, `.env.supabase` | Utilisé dans `config/index.js` et `server.js` pour ajuster logs/comportement | En prod, fixé à `production` via `render.yaml` (`NODE_ENV` envVar). S’assurer que c’est cohérent avec ton usage. | **P0** |
| `CORS_ORIGINS` | `.env`, `.env.example`, `.env.supabase` (ex: `"http://localhost:4200,https://...vercel.app"`) | `config.corsOrigins` → middleware CORS backend | En prod, défini dans `render.yaml` (liste d’origines exactes). À maintenir à jour avec l’URL Vercel réelle (et éventuellement les previews). | **P0** |
| `CLOUDINARY_URL` | Présent dans `.env` (valeur réelle) et/ou commenté dans `.env.example` | `config.cloudinary.url` → `services/cloudinary.js` + `testCloudinaryConnection` | Secret Render `cloudinary-url` référencé dans `render.yaml`. Ne jamais commit la valeur réelle; garder la doc dans `.env.example`. | **P0** |
| `CLOUDINARY_CLOUD_NAME` | Option dans `.env.example`, `.env.supabase` | Fallback si `CLOUDINARY_URL` absent | En prod, **optionnel** si `CLOUDINARY_URL` est défini. Si utilisé, les définir aussi comme secrets Render. | P1 |
| `CLOUDINARY_API_KEY` | Idem | Fallback Cloudinary | Idem. Ne jamais les commit en clair. | **P0** |
| `CLOUDINARY_API_SECRET` | Idem | Fallback Cloudinary (secret) | Idem. | **P0** |
| `JWT_SECRET` | Long secret dans `.env` et placeholder dans `.env.example` / `.env.supabase` / `.env.test` | `config.jwt.secret` → middleware JWT / auth | Secret Render `jwt-secret` référencé dans `render.yaml`. S’assurer qu’il est bien défini et robuste. | **P0** |
| `JWT_EXPIRES_IN` | `"7d"` dans `.env`, `.env.example` | `config.jwt.expiresIn` | Peut être fixé via secret Render ou fallback sur valeur par défaut. Documenter la valeur attendue dans `.env.example` et `DEPLOYMENT.md`. | P1 |
| `JWT_REFRESH_SECRET` | Dans `.env`, placeholder dans `.env.example` / `.env.supabase` / `.env.test` | `config.jwt.refreshSecret` → gestion refresh (log + middleware) | Secret Render `jwt-refresh-secret`. S’assurer de son existence ou accepter de désactiver le refresh en prod (avec doc claire). | **P0** |
| `JWT_REFRESH_EXPIRES_IN` | `"30d"` dans `.env` | `config.jwt.refreshExpiresIn` | Idem que `JWT_EXPIRES_IN` (facultatif, mais à documenter). | P1 |
| `RATE_LIMIT_WINDOW_MS` | Option dans `process.env` (non présent par défaut) | `config.rateLimit.windowMs` → express-rate-limit | En prod, à définir si tu veux un rate limiting précis (sinon valeur par défaut). Ajouter un exemple dans `.env.example` + doc. | P2 |
| `RATE_LIMIT_MAX` | Idem | `config.rateLimit.max` | Idem. | P2 |
| `RATE_LIMIT_ENABLED` | Idem | `config.rateLimit.enabled` | Idem. | P2 |
| `API` | Non défini dans `.env`, mais utilisé par `backend/package.json` dans les scripts `export:dryrun`/`export:run` | `npm run export:*` → param `--baseUrl=${API}` | En prod ou dans un environnement d’export, à définir via l’environnement de ton shell/CI (`API=https://.../api`). Documenter dans `DEPLOYMENT.md` / doc export. | **P1** |
| `ADMIN_EMAIL` | Même remarque | Scripts d’export (login admin) | À définir côté machine/CI (pas côté Render). Le script est destiné à être lancé depuis un env de travail (local ou autre). | P1 |
| `ADMIN_PASSWORD` | Idem | Scripts d’export (login admin) | À gérer comme secret local/CI, ne jamais commit. Ajouter un paragraphe explicatif dans la doc d’export. | **P0** |
| `TOKEN` | Idem | Scripts d’export (auth via token) | Peut être injecté manuellement par l’utilisateur du script. | P2 |

### 5.2. Frontend – Paramètres & variables implicites

| Paramètre / Var | Source dev | Consommation principale | Action requise pour prod (Vercel) | Priorité |
|-----------------|------------|--------------------------|------------------------------------|----------|
| `environment.production` | `false` dans `environment.ts` | Contrôle de branches conditionnelles Angular | Aucun besoin spécifique en prod, géré par build `--configuration production`. | P2 |
| `environment.apiUrl` (dev) | `http://localhost:3002/api` | Services Angular (appel API backend local) | OK pour dev local. Ne pas utiliser ce fichier pour la prod. | P1 |
| `environment.apiUrl` (prod) | `https://ultimate-frisbee-manager-api.onrender.com/api` | Services Angular en prod (build Vercel) | **Hardcoded**. Si l’URL backend change, il faut modifier le code. Idéalement, centraliser cette valeur dans un endroit documenté, voire la piloter par une env Vercel. | **P1** |
| `environment.supabaseUrl` | Identique en dev et prod | Utilisé par Supabase JS côté front | **Hardcoded** dans le code. Déjà documenté partiellement dans `DEPLOYMENT.md` (via `SUPABASE_URL`). À aligner : soit assumer le hardcode, soit passer par des env Vercel. | P1 |
| `environment.supabaseKey` | Identique en dev et prod (`sb_publishable_...`) | Utilisé par Supabase JS | Clé **publishable** (publique), donc acceptable côté front, mais toujours mieux de la documenter et d’éviter les divergences avec `DEPLOYMENT.md`. | P1 |
| `SUPABASE_URL` (Vercel) | Mentionné dans `DEPLOYMENT.md` (section Env Vercel) | Pas directement lu par le code actuel | À clarifier : soit supprimer de la doc, soit adapter le code front pour récupérer ces valeurs au build (via un mécanisme Angular + env Vercel). | **P1** |
| `SUPABASE_ANON_KEY` (Vercel) | Idem | Non utilisé directement | Idem. | **P1** |

---

## 6. Points à risque identifiés

### 6.1. Hardcode d’URL et de clés côté frontend (P1)

- `environment.prod.ts` contient :
  - `apiUrl` avec l’URL exacte du backend Render.
  - `supabaseUrl` et `supabaseKey` en clair.
- Risques :
  - À chaque changement d’URL backend, il faut **modifier et re-committer le code**.
  - La doc `DEPLOYMENT.md` propose un autre mécanisme (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) qui n’est pas réellement utilisé, ce qui peut créer de la confusion.

### 6.2. Multiplication de fichiers `.env.*` et risque de confusion (P1)

- Tu as : `.env`, `.env.example`, `.env.supabase`, `.env.test`.
- C’est utile, mais :
  - Si on ne suit pas une règle claire, on peut finir par éditer **le mauvais fichier**.
  - `.env.supabase` ressemble à une config alternative pour local; il faut être explicite sur son usage (ex : “profil supabase-only”).

### 6.3. Décalage entre `DEPLOYMENT.md` et l’état réel (P1)

- `DEPLOYMENT.md` décrit un flux Render/Vercel initial (ex: `CORS_ORIGINS`, `CLOUDINARY_*` séparés, etc.) qui a évolué :
  - Standardisation Cloudinary sur `CLOUDINARY_URL`.
  - Secrets Render mis à jour (`jwt-refresh-secret`, etc.).
- Si on suit `DEPLOYMENT.md` à la lettre, on peut :
  - Oublier certaines variables critiques.
  - Configurer Cloudinary de façon différente du code actuel.

### 6.4. Scripts d’export backend utilisant `API`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (P0/P1)

- Ces scripts sont pensés pour être lancés **depuis un environnement de travail** (local ou CI), pas depuis Render.
- Risques :
  - Si on ne documente pas clairement comment les variables doivent être fournies (shell, `.env.local` spécifique, etc.), le script devient fragile.
  - `ADMIN_PASSWORD` ne doit jamais être commité ou mis dans `render.yaml` : c’est un secret d’utilisateur.

---

## 7. Recommandations priorisées (P0 / P1 / P2)

### 7.1. P0 – Sécurité & prod stable

- **Vérifier les secrets Render obligatoires** :
  - `supabase-database-url` (→ `DATABASE_URL`)
  - `jwt-secret` (→ `JWT_SECRET`)
  - `jwt-refresh-secret` (→ `JWT_REFRESH_SECRET`, ou assumer l’absence avec doc claire)
  - `cloudinary-url` (→ `CLOUDINARY_URL`)
- **Vérifier `NODE_ENV=production` sur Render** pour le service backend.
- **S’assurer que les secrets sensibles** (`CLOUDINARY_*`, `ADMIN_PASSWORD`, etc.) ne sont présents **que** dans :
  - les secrets Render,
  - des environnements locaux non committés,
  - les settings CI éventuels.

### 7.2. P1 – Méthodologie pour atteindre “prod figée + dev libre”

- **Formaliser une règle sur les environnements backend** :
  - `.env` = uniquement pour **dev local**.
  - `.env.example` = **source de vérité** pour toutes les variables (toujours à jour).
  - Toute nouvelle variable doit être ajoutée simultanément dans :
    - `.env.example` (avec commentaire),
    - `render.yaml` (si concernée par la prod backend),
    - et documentée dans `DEPLOYMENT.md`.

- **Clarifier l’usage des fichiers `.env.*`** :
  - `.env.supabase` : faire figurer dans la doc qu’il s’agit d’un **profil d’exemple** pour DB Supabase, non utilisé directement par le runtime.
  - `.env.test` : explicitement réservé aux **tests automatisés**.

- **Clarifier la stratégie front** :
  - Décider si tu :
    - assumes le **hardcode** d’`apiUrl`, `supabaseUrl`, `supabaseKey` dans `environment*.ts` (mais alors tu nettoies `DEPLOYMENT.md`),
    - ou veux les **piloter réellement** via des env Vercel (ce qui demande une petite refonte côté Angular).

- **Alignez `DEPLOYMENT.md` avec la réalité** :
  - Mettre à jour les sections CORS, Cloudinary, Supabase pour qu’elles reflètent le fonctionnement actuel (`CLOUDINARY_URL`, secrets Render, etc.).

### 7.3. P2 – Confort & long terme

- Introduire éventuellement un **environnement “staging”** (backend Render secondaire + environment.staging.ts) pour tester des features avant de toucher prod.
- Factoriser la configuration front (un service ou un module dédié qui lit un `APP_CONFIG` injectable, par exemple) pour limiter les endroits à modifier.
- Documenter une **procédure standard d’ajout de variable** dans `QUICK_REFERENCE.md` (check‑list en quelques points).

---

## 8. Check‑list d’actions immédiates à inclure dans `DEPLOYMENT.md`

> Tu peux copier/coller cette section (ou l’adapter) dans `DEPLOYMENT.md` sous une rubrique du type “Checklist Env & Config”.

1. **Secrets Render – Backend**
   - [ ] Vérifier que les secrets suivants existent et sont renseignés :
     - [ ] `supabase-database-url` (→ `DATABASE_URL`)
     - [ ] `jwt-secret` (→ `JWT_SECRET`)
     - [ ] `jwt-refresh-secret` (→ `JWT_REFRESH_SECRET`, ou décider explicitement de le laisser vide et assumer l’absence de refresh)
     - [ ] `cloudinary-url` (→ `CLOUDINARY_URL`)
   - [ ] Vérifier `NODE_ENV=production` et `NODE_VERSION=20` dans `render.yaml`.
   - [ ] Vérifier que `CORS_ORIGINS` liste bien l’URL Vercel de prod (et éventuellement les URLs de preview utiles).

2. **Fichiers `.env` – Backend**
   - [ ] Utiliser `backend/.env` uniquement pour le **développement local** (ne jamais le pousser en prod).
   - [ ] Garder `backend/.env.example` comme **référence complète** de toutes les variables (ajouter toute nouvelle variable ici).
   - [ ] Documenter dans `DEPLOYMENT.md` l’usage de chaque fichier `.env.*` (`.env`, `.env.supabase`, `.env.test`).

3. **Frontend – Angular / Vercel**
   - [ ] Confirmer la stratégie choisie pour `environment.prod.ts` :
     - soit **assumer** le hardcode d’`apiUrl`, `supabaseUrl`, `supabaseKey` (et nettoyer la doc Vercel qui parle de `SUPABASE_URL`/`SUPABASE_ANON_KEY`),
     - soit prévoir une évolution du code pour vraiment utiliser les env Vercel.
   - [ ] Vérifier que le build Vercel utilise bien la configuration de production Angular (remplacement `environment.ts` → `environment.prod.ts`).

4. **Scripts d’export backend**
   - [ ] Documenter dans `DEPLOYMENT.md` (ou un fichier dédié) comment fournir `API`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `TOKEN` lors de l’exécution des scripts `npm run export:dryrun` / `npm run export:run`.
   - [ ] Préciser que `ADMIN_PASSWORD` ne doit jamais être défini dans Render/Vercel, mais uniquement dans un shell/CI local contrôlé.

5. **Règle générale – Nouvelle variable**
   - [ ] Pour toute nouvelle variable d’environnement :
     - [ ] L’ajouter dans `backend/.env.example` (et `frontend/environment*.ts` si nécessaire côté front).
     - [ ] L’ajouter dans `render.yaml` (si backend) ou dans les settings Vercel (si front).
     - [ ] Ajouter une ligne explicative dans `DEPLOYMENT.md` (où la définir, valeur d’exemple, impact).

---

## 9. Fichiers touchés par l’audit (lecture seule)

- **Backend** : `backend/.env`, `backend/.env.example`, `backend/.env.supabase`, `backend/.env.test`, `backend/config/index.js`, `backend/server.js`, `backend/package.json`, `render.yaml`.
- **Frontend** : `frontend/src/environments/environment.ts`, `frontend/src/environments/environment.prod.ts`, `frontend/package.json`, `vercel.json`.
- **Docs** : `plan.md`, `DEPLOYMENT.md`, `history.md`, `pitfalls.md`, `QUICK_REFERENCE.md`.

Aucun de ces fichiers n’a été modifié dans le cadre de cet audit ; seul ce fichier `audit_env_report.md` a été créé pour centraliser le diagnostic.
