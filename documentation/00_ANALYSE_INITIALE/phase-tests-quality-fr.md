Tests et qualité : côté backend, Jest est configuré (testEnvironment=node) avec collecte de couverture activée et scripts de setup (tests/load-env.js, tests/setup.js). Il existe des tests (ex: __tests__/tag.test.js vu plus tôt). Côté frontend, Cypress est en place (config minimale) avec un test e2e `cypress/e2e/api-tests/api-endpoints.cy.js`. ESLint est configuré des deux côtés (Angular ESLint pour le front).

Audit dépendances : `npm audit` backend retourne 0 vulnérabilité. Côté frontend, 10 vulnérabilités (4 low, 6 moderate) touchant surtout l’outillage (Angular devkit, webpack-dev-server, vite, esbuild, http-proxy-middleware, inquirer). Aucune vulnérabilité high/critical.

Comment lancer :
- Backend: `npm --prefix backend test` (ou `-- --coverage` pour le rapport). 
- Frontend: `npm --prefix frontend run cypress:open` (dev) ou `cypress:run` (CI headless si script présent), et `npm --prefix frontend run lint`.

Priorités :
- Mettre à jour @angular-devkit/build-angular (>= 20.3.8) et patcher vite/webpack-dev-server/esbuild, puis relancer `npm audit`.
- Ajouter des scénarios E2E UI essentiels (auth, navigation, CRUD) et exécution headless en CI.
- Publier la couverture backend en artefact CI et définir des seuils de couverture.
- Rendre le lint bloquant sur PR (front et back) et ajouter `npm audit --audit-level=moderate` en job CI.
