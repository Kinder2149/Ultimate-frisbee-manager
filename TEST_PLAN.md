# Plan de tests – Gestion des environnements & workflow

_Date : 2025-11-20_

Ce document décrit les **tests à exécuter** pour valider les changements liés :
- aux environnements (`.env`, `environment*.ts`, Render, Vercel),
- au workflow Git (PR templates, CI),
- à l’ajout éventuel de staging.

Les tests sont séparés en :
- **Tests automatisés** (CI, scripts),
- **Tests manuels** (smoke tests).

---

## 1. Tests automatisés

### 1.1. CI – Validation des environnements

**Pré-requis :** `scripts/validate-envs.js` et `.github/workflows/env-validation.yml` en place.

- **Commande locale (optionnelle) :**

  ```bash
  node scripts/validate-envs.js
  ```

- **Attendu :**
  - Message `backend/.env.example contient toutes les variables requises.`
  - Message `environment.ts et environment.prod.ts contiennent les clés minimales.`
  - Code de sortie = 0.

- **Sur GitHub Actions :**
  - Job `Env & Config Validation` doit être **vert** sur la PR.

### 1.2. Tests backend

Depuis la racine ou `backend/` :

```bash
npm test --prefix backend
```

- **Attendu :**
  - Tous les tests passent (exit code 0).
  - En particulier les tests liés à import/export et aux routes d’admin/auth.

### 1.3. Tests frontend (si présents)

Depuis la racine ou `frontend/` :

```bash
npm test --prefix frontend
```

- **Attendu :**
  - Les tests unitaires Angular existants passent.

> Si le projet n’a pas encore de tests front significatifs, considérer ce bloc comme optionnel pour l’instant.

### 1.4. Build frontend (prod)

Depuis la racine :

```bash
npm run build --prefix frontend
```

- **Attendu :**
  - Build sans erreur.
  - Pas d’avertissement bloquant lié aux `environment*.ts`.

---

## 2. Tests manuels – Local

### 2.1. Lancer la stack localement

Suivre `docs/LOCAL_SETUP.md` :

1. `npm install`, `npm install --prefix backend`, `npm install --prefix frontend`.
2. Créer `backend/.env` à partir de `.env.example`.
3. Lancer le backend :
   ```bash
   npm run dev --prefix backend
   ```
4. Lancer le frontend :
   ```bash
   npm start --prefix frontend
   ```

### 2.2. Smoke tests backend

- **Health (si endpoint dispo)** :

  ```bash
  curl http://localhost:3002/api/health
  ```

- **Liste des exercices** :

  ```bash
  curl http://localhost:3002/api/exercices
  ```

- **Auth admin (si compte seedé)** :

  ```bash
  curl -X POST http://localhost:3002/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ultimate.com","password":"<TON_MDP_ADMIN>"}'
  ```

**Attendu :**
- Codes HTTP 200.
- Pas d’erreur 500 dans les logs backend.

### 2.3. Smoke tests frontend

- Ouvrir `http://localhost:4200`.
- Vérifier :
  - [ ] Page d’accueil accessible.
  - [ ] Liste des exercices se charge.
  - [ ] Navigation vers Import/Export.
  - [ ] Auth / profil (si activé et compte dispo).

### 2.4. Vérification des variables d’environnement

- Sur le backend :
  - Vérifier dans les logs de démarrage :
    - `[Startup] JWT refresh: ENABLED/DISABLED` selon la présence de `JWT_REFRESH_SECRET`.
    - Avertissements Cloudinary corrects si `CLOUDINARY_URL` manquante.

- Sur le frontend :
  - Confirmer que les appels partent bien vers `http://localhost:3002/api` en dev (network tab du navigateur).

---

## 3. Tests manuels – Environnements distants (Render/Vercel)

### 3.1. Prod actuelle

Après un déploiement sur Render/Vercel (ou manuellement) :

1. **Backend Render** :
   - Accéder à l’URL backend prod : `https://ultimate-frisbee-manager-api.onrender.com/api`.
   - Tester :
     - [ ] `GET /api/exercices`
     - [ ] `POST /api/auth/login` (avec un compte valide)
   - Vérifier les logs Render :
     - Pas d’erreur de config (JWT, Cloudinary, DB).

2. **Frontend Vercel** :
   - Ouvrir l’URL prod Vercel.
   - Vérifier :
     - [ ] Chargement de la page d’accueil.
     - [ ] Liste des exercices.
     - [ ] Import/Export.
     - [ ] Auth / profil.

3. **CORS** :
   - Vérifier qu’aucune erreur CORS ne remonte dans la console navigateur.

### 3.2. Staging (si mis en place)

1. **Backend staging Render** :
   - Tester les mêmes endpoints que pour prod.
   - Vérifier que `DATABASE_URL` pointe bien vers la DB staging si tu as choisi le Scénario B.

2. **Frontend staging Vercel** :
   - Vérifier que l’URL API `API_URL` pointe vers l’API staging.
   - Refait les mêmes smoke tests que pour la prod.

---

## 4. Tests spécifiques en cas de nouvelles variables d’environnement

Pour toute PR qui ajoute ou modifie des variables d’environnement :

1. **Validation structurelle** :
   - [ ] `scripts/validate-envs.js` passe.
   - [ ] `backend/.env.example` contient les nouvelles variables.
   - [ ] `render.yaml` contient les nouvelles `envVars` (si backend).
   - [ ] `environment.ts` / `environment.prod.ts` contiennent les nouvelles clés (si frontend).

2. **Tests fonctionnels ciblés** :
   - Définir des scénarios selon la variable ajoutée. Exemple :
     - Nouvelle URL externe → tester l’endpoint qui l’utilise (200 OK, comportement correct).
     - Nouveau flag de feature → tester les deux branches (flag activé/désactivé).

3. **Doc & checklist** :
   - [ ] `DEPLOYMENT.md` mis à jour.
   - [ ] PR template : section ENV entièrement remplie.

---

## 5. Critères de validation globale

Avant un **passage en prod** pour les changements ENV / workflow :

- [ ] Tous les tests automatisés pertinents sont verts :
  - [ ] `env-validation` (CI)
  - [ ] `npm test --prefix backend`
  - [ ] `npm test --prefix frontend` (si utilisé)
  - [ ] `npm run build --prefix frontend`
- [ ] Tous les smoke tests manuels (local + prod) sont OK.
- [ ] Aucun secret sensible n’apparaît dans le repo (vérif manuelle + revue PR).
- [ ] `audit_env_report.md`, `docs/ENV_AND_WORKFLOW.md`, `DEPLOYMENT.md` et `docs/LOCAL_SETUP.md` sont cohérents avec le comportement observé.

Si tous ces points sont cochés, la probabilité de casser la production suite à des changements d’ENV / workflow est fortement réduite.
