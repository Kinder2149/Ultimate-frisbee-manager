# Ultimate Frisbee Manager

Application web pour gérer les entraînements d'ultimate frisbee (Angular + Express + Prisma).

---

## Onboarding rapide

### Prérequis
- Node.js 20+
- npm 10+
- PostgreSQL (prod) / SQLite (dev)

### Installation (monorepo)
```bash
# build du package partagé
npm --prefix shared run build
# installer backend et frontend
npm --prefix backend i
npm --prefix frontend i
```

### Lancer en local
```bash
# Backend (dev)
npm --prefix backend run dev
# Frontend (Angular)
npm --prefix frontend start
```

### Variables d'environnement (exemples)
- Backend (Render/local): `DATABASE_URL`, `CORS_ORIGINS`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_URL` (ou triplet `CLOUDINARY_*`).
- Frontend: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (sur Vercel en production). En local, voir `frontend/src/environments/environment.ts`.

### Tests / Qualité
```bash
# Backend - Jest
npm --prefix backend test
npm --prefix backend test -- --coverage
# Frontend - Cypress (si configuré)
npm --prefix frontend run cypress:run
# Lint
npm --prefix frontend run lint
```

### Déploiement (résumé)
- Backend: Render (build `cd backend && npm install && npm run deploy:render`, start `cd backend && npm start`).
- Frontend: Vercel (preset Angular, root=frontend). Définir `SUPABASE_URL`, `SUPABASE_ANON_KEY` dans les Variables.
- CORS: whitelist via `CORS_ORIGINS` (CSV), `credentials: true`.

Pour le guide complet, voir `docs/DEPLOYMENT-DETAILS.md`.

---

## Architecture
- Frontend: Angular 17 (Material), lazy-loading, Cypress E2E.
- Backend: Express + Prisma, JWT middleware, Cloudinary uploads, CORS strict.
- Base de données: SQLite (dev) / PostgreSQL (prod recommandé).

Détails et choix techniques: `docs/ARCHITECTURE.md`.

---

## Sécurité (synthèse)
- Aucun secret en repo (.env exclus, purge historique recommandée en cas de fuite).
- CORS verrouillé par `CORS_ORIGINS`.
- Secrets JWT obligatoires en production (startup fail si manquants).
- Logging HTTP avec redaction (pas d'Authorization/Cookie en logs).

---

## Documentation utile
- Audit initial (P0–P11): `documentation/00_ANALYSE_INITIALE/` (phases techniques + recommandations).
- Détails d'architecture: `docs/ARCHITECTURE.md`.
- Déploiement détaillé: `docs/DEPLOYMENT-DETAILS.md`.
- Système de documentation: `DOCUMENTATION_SYSTEM.md`.

---

## Maintenance
- Migrations Prisma (dev): `npm --prefix backend run db:migrate`.
- Déploiement Prisma (prod): `npm --prefix backend run db:deploy`.
- Rotation clés (procédure): `documentation/00_ANALYSE_INITIALE/phase-sec-rotate-*.md/json`.

---

## Licence
ISC
