Synthèse de l’audit documentaire:

- Contradictions majeures:
  - **DB**: README/STRATEGY affirment PostgreSQL (Supabase) tandis que le code/`projet.md` indiquent SQLite (Prisma). Décision et documentation “dev=SQLite / prod=Postgres” nécessaires.
  - **Auth/Supabase**: STRATEGY proscrit Supabase Auth mais le front expose `supabaseUrl/supabaseKey` et le middleware lit `decoded.user_metadata`. Clarifier (adopter Supabase Auth ou le retirer).
  - **Déploiement**: DEPLOYMENT.md ne reflète pas `render.yaml` (commande `deploy:render`) et omet les variables Supabase côté front.
  - **projet.md**: mentionne `environment.prod.ts` manquant alors qu’il existe. Doc obsolète.

- Statut proposé des docs:
  - README.md: **keep** — à corriger (DB cible, quickstart, liens).
  - STRATEGY.md: **keep** — mettre à jour politique Auth/DB.
  - DEPLOYMENT.md: **keep** — aligner avec render.yaml + env Supabase + encart sécurité.
  - projet.md: **archive** — fusionner contenu pertinent dans README/ARCHITECTURE.
  - docs/ARCHITECTURE.md: **merge** — avec STRATEGY ou en version détaillée.
  - docs/MIGRATION*.md: **keep** — pointer depuis README.

- Plan de consolidation
  - Quick wins (semaine 1):
    - Aligner DEPLOYMENT.md (Render commands, CORS_ORIGINS, variables front Supabase) + ajouter encart sécurité (rotation des clés).
    - Ajouter pointeurs depuis README vers les sorties d’audit (00_ANALYSE_INITIALE) et docs clés.
  - Medium (semaine 2):
    - Décider et documenter Auth (Supabase vs backend) et DB (SQLite dev, Postgres prod) dans STRATEGY + README.
    - Consolider ARCHITECTURE.md (schémas à jour) et simplifier README (overview + quickstart).
  - Long (semaine 3+):
    - Archiver `projet.md` et créer un index docs (docs/index.md) à jour.
    - Ajouter un guide Sécurité (secrets, CORS, rate limit, JWT) et un check CI (lint-docs/links).

- Checklist
  - [ ] DEPLOYMENT.md aligné avec render.yaml
  - [ ] README: DB prod=Postgres; dev=SQLite; quickstart clair
  - [ ] STRATEGY.md: position Auth Supabase vs backend
  - [ ] ARCHITECTURE.md: mise à jour + diagrammes
  - [ ] projet.md archivé (sections fusionnées)
  - [ ] Doc sécurité (clés, CORS, JWT) ajoutée
