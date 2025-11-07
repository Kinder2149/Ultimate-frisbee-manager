Structure monorepo claire avec un backend Node/Express (entrée: backend/server.js, Prisma schema sqlite) et un frontend Angular 17 (entrée: frontend/src/main.ts via angular.json). Les manifests principaux (package.json racine, backend/package.json, frontend/package.json, angular.json, vercel.json) sont présents et cohérents globalement, mais on note une dépendance locale backend "ultimate-frisbee-manager": "file:.." qui peut casser les builds CI/CD. Le backend inclut à la fois Prisma (sqlite) et la lib pg, suggérant une ambiguïté de SGBD (dev sqlite / prod Postgres ?) à clarifier. Versions TypeScript divergentes (racine ^5.9.2 vs frontend ~5.2.2) à aligner ou documenter. Pas de workspaces monorepo (optionnel) ; la gestion séparée fonctionne mais mériterait une doc CI unifiée. Priorités: clarifier SGBD et DATABASE_URL, supprimer/adapter la dépendance locale, fixer stratégie TS, vérifier Render/Vercel et corriger l’option PowerShell -ErrorAction en scripts locaux.

Docs multiples détectées et statut proposé:
- README.md: keep — point d’entrée principal du projet.
- STRATEGY.md: keep — vision/stratégie utile, à synchroniser avec README.
- DEPLOYMENT.md: keep — procédures de déploiement.
- projet.md: merge — probable recouvrement avec README/STRATEGY, à consolider.
- DOCUMENTATION_SYSTEM.md: keep — cadre documentaire utile pour l’audit.
- AGENT_GUIDE.md: keep — guide d’outillage IA.
- WORKFLOW_TEMPLATE.md: keep — modèle de workflow.
- documentation/TAGS_DOCUMENTATION.md: keep — taxonomie utile.
