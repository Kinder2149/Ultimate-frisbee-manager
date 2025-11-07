# Nettoyage documentaire — Rapport synthèse

- Actions effectuées
  - **README.md**: consolidé (onboarding, run, tests, déploiement, sécurité, liens vers docs détaillées).
  - **docs/ARCHITECTURE.md**: créé (vue détaillée de l’architecture et des principes).
  - **docs/DEPLOYMENT-DETAILS.md**: créé (détails Render/Vercel, envs, CORS, CI predeploy).
  - **DEPLOYMENT.md**: enrichi (note Auth: suppression `POST /api/auth/refresh`).
  - **projet.md**: archivé vers `documentation/archive/projet.md`.
  - **documentation/TAGS_DOCUMENTATION.md**: archivé vers `documentation/archive/TAGS_DOCUMENTATION.md` (doublon).

- État des dossiers
  - Conservé: `documentation/00_ANALYSE_INITIALE/`, `documentation/archive/` (avec `projet.md`), `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT-DETAILS.md`, `DEPLOYMENT.md`.
  - Candidats à supprimer (non trouvés présents): `documentation/archive/projet.md.old`, `documentation/projet.md`, `documentation/README.md`, `documentation/old_versions/`, `documentation/00_ANALYSE_INITIALE/temp/`.

- Vérification des liens
  - README → `docs/ARCHITECTURE.md` → OK
  - README → `docs/DEPLOYMENT-DETAILS.md` → OK
  - README → `documentation/00_ANALYSE_INITIALE/` → OK

- Recommandations
  - Ajouter un index `docs/index.md` liant ARCHITECTURE et DEPLOYMENT-DETAILS.
  - Si d’autres docs redondantes sous `docs/` (ex: `ameliorations-recentes.md`, `code-quality-recommendations.md`) ne sont plus utiles, envisager archivage.

- Acceptation
  - Documentation unifiée et à jour.
  - Fichiers obsolètes archivés, pas de doublons majeurs.
  - Liens principaux vérifiés.
