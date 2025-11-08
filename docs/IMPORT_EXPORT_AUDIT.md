# Audit Import/Export — Ultimate Frisbee Manager

Ce fichier centralise l’audit du module Import/Export (backend et frontend).

> Note: Le contenu complet fourni par le coordinateur pourra être intégré ici ultérieurement. En attendant, les sections d’audit sont renseignées pour suivre l’avancement.

---

## Endpoints à vérifier (Backend)

| Endpoint | Méthode | Fichier | Contrôleur | Middleware | Statut | Commentaire |
|---|---|---|---|---|---|---|
| /api/entrainements | GET | backend/routes/entrainement.routes.js | getAllEntrainements | authenticateToken | OK | Contrôleur utilise Prisma directement (pas de service) |
| /api/entrainements/:id | GET | backend/routes/entrainement.routes.js | getEntrainementById | authenticateToken | OK | Prisma direct |
| /api/entrainements | POST | backend/routes/entrainement.routes.js | createEntrainement | authenticateToken, createUploader, transformFormData, validate(createEntrainementSchema) | OK | Validation Zod présente |
| /api/entrainements/:id | PUT | backend/routes/entrainement.routes.js | updateEntrainement | authenticateToken, createUploader, transformFormData, validate(updateEntrainementSchema) | OK | Transaction Prisma |
| /api/entrainements/:id | DELETE | backend/routes/entrainement.routes.js | deleteEntrainement | authenticateToken | OK | Prisma direct |
| /api/exercices | GET | backend/routes/exercice.routes.js | getAllExercices | authenticateToken | OK | Prisma direct |
| /api/exercices/:id | GET | backend/routes/exercice.routes.js | getExerciceById | authenticateToken | OK | Prisma direct |
| /api/admin/import-ufm | POST | — | — | — | KO | Non implémenté — endpoints d’import disponibles: /api/import/exercices, /api/import/markdown |
| /api/admin/export-ufm | GET | backend/routes/admin.routes.js | exportUfm | authenticateToken, requireAdmin | OK | Génère un fichier .ufm.json |

---

## Schéma DB & migrations (Prisma)

- Entités:
  - Exercice
  - Tag
  - Entrainement
  - EntrainementExercice (liaison)
  - Echauffement
  - BlocEchauffement
  - SituationMatch
  - User
- Entité `Phase`: absente.

---

## Vérifications front → back (matrix)

- **Composants analysés**
  - ImportExportComponent (frontend/src/app/features/settings/pages/import-export/import-export.component.ts)
  - MissingFieldsDialogComponent (dialog de complétion)
- **Services front utilisés**
  - DataTransferService (frontend/src/app/core/services/data-transfer.service.ts)
  - ImportService (frontend/src/app/core/services/import.service.ts)
  - ExerciceService, EntrainementService, EchauffementService, SituationMatchService (listes dynamiques)
- **Navigation**
  - Onglet Import/Export accessible via menu Paramètres (admin) → route `/parametres/import-export` (SettingsModule)
- **Liste dynamique d’éléments (UI)**
  - Exercices, Entraînements, Échauffements, Situations chargés via services front, pas de liste codée en dur
- **Endpoints backend consommés par le front**
  - GET /api/exercices — via ExerciceService
  - GET /api/entrainements — via EntrainementService
  - GET /api/echauffements — via EchauffementService
  - GET /api/situations-matchs — via SituationMatchService
  - POST /api/import/markdown?dryRun=true|false — via ImportService (import Markdown)
  - POST /api/import/exercices?dryRun=true|false — via ImportService (payload JSON structuré)
- **Export (front)**
  - DataTransferService.exportElement(...) connecté à `/api/admin/export-ufm` (blob + téléchargement + snackbar succès)
- **Validation d’import (front)**
  - Validation légère côté front: DataTransferService.importElement(...) vérifie champs requis par type (exercice: nom, description, etc.)
  - MissingFieldsDialogComponent permet la complétion avant envoi

### Statut (OK/KO)

| Élément | Statut | Détail |
|---|---|---|
| Onglet Import/Export en navigation | OK | Visible dans app.component.html (Paramètres → Import/Export, role=admin) |
| Chargement liste d’éléments | OK | Appels services vers API (exercices, entrainements, echauffements, situations) |
| Import Markdown/JSON | OK | Utilise POST /api/import/markdown et /api/import/exercices, avec dryRun/apply |
| Export d’un élément | OK | `/api/admin/export-ufm` + téléchargement .ufm.json |
| Validateur d’import | OK (léger) | Vérifs minimales + dialogue |

---

## Anomalies et recommandations

- Contrôleurs backend accèdent directement à Prisma. Reco: introduire une couche service pour améliorer testabilité/maintenabilité.
- Documenter le format `.ufm.json` et les mappings Markdown → exercice (fait: `docs/API_IMPORT_EXPORT.md`).

---

## Journal

- 2025-11-08: Ajout des sections Backend (endpoints), Prisma (schéma) et Front→Back (matrix).
- 2025-11-08: Implémentation export backend + intégration front + tests unitaires initiaux (back/front).
- 2025-11-08: Ajout documentation `docs/API_IMPORT_EXPORT.md` et lien dans README.

---

## Logs & erreurs

- Export (front): succès avec téléchargement `.ufm.json` via DataTransferService.exportElement (blob). Nom de fichier issu de `Content-Disposition`.
- Import Markdown/JSON: endpoints `/api/import/markdown` et `/api/import/exercices` fonctionnels. En dry-run, le rapport inclut `tagsCreated` quand des tags n’existent pas.
- Auth: toutes les routes d’import passent par `authenticateToken`. Les routes admin requièrent `requireAdmin`.

---

## Recommandations & actions restantes

- (Amélioration) Envisager une couche service complète pour tous les contrôleurs.
- (Option) Normaliser `variablesPlus/Minus` en tableaux lors de l’export.
- Étendre la couverture de tests (cas supplémentaires, e2e).

---

## Critères d’acceptation (checklist)

- [x] CRUD Entraînements disponibles et protégés
- [x] GET Exercices disponible et protégé
- [x] Import Markdown/JSON opérationnel (dry-run + apply)
- [x] Export élément côté backend implémenté et branché au front
- [x] Navigation Import/Export visible (admin uniquement)
- [x] Tests automatisés couvrant import/export (front et back — base)
- [x] Documentation d’audit initiale complétée
- [x] Documentation format `.ufm.json` formalisée (`docs/API_IMPORT_EXPORT.md`)

Flags décisionnels:
- [x] CONSOLIDATE
- [ ] ADD_PHASE_ENTITY
- [ ] ROLLBACK

---

## Décision & signature

- Décision: Consolidate — export implémenté et utilisé côté front; format documenté; tests initiaux ajoutés.
- Responsable technique: __________________________
- Date: 2025-11-08
