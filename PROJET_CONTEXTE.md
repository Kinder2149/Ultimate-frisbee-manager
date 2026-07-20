# PROJET_CONTEXTE — Ultimate Frisbee Manager

> Emplacement : racine du projet
> Source de vérité absolue. Lire EN ENTIER avant toute action.
> Toute décision technique qui contredit ce fichier est interdite.
> Si une demande sort de ce cadre : poser UNE question avant d'agir.

---

## 1. IDENTITÉ DU PROJET

| Champ | Valeur |
|---|---|
| Nom | Ultimate Frisbee Manager |
| Type | Web full-stack |
| Objectif en 1 phrase | Gérer exercices, entraînements et séances d'ultimate frisbee pour un groupe d'une dizaine d'utilisateurs |
| Statut | En production |
| Utilisateurs actuels | ~10 personnes actives |
| URL production | https://ultimate-frisbee-manager.vercel.app |
| Dernière mise à jour de ce fichier | 2026-04-10 |

---

## 2. STACK TECHNIQUE

> Tout ce qui n'est pas listé ici ne doit pas être utilisé sans validation.

**Frontend :**
- Framework : Angular 17
- Langage : TypeScript
- Composants UI : Angular Material
- Gestion de l'affichage dynamique : RxJS + Services
- Éditeur riche : ngx-quill (Quill)
- Cache navigateur : IndexedDB (indexed-db.service.ts)

**Backend :**
- Framework : Express.js
- Langage : JavaScript CommonJS (pas TypeScript — accepté)
- Port local : 3002

**Base de données :**
- Technologie : PostgreSQL hébergé sur Supabase
- Outil de liaison avec le code : Prisma ORM 5.22
- ⚠️ En production avec données réelles — toute migration Prisma doit utiliser `prisma migrate deploy`, jamais `migrate reset`

**Services externes :**
- Comptes utilisateurs : Supabase Auth (JWT RS256 via JWKS)
- Stockage images : Cloudinary v2
- Mise en ligne : Vercel (frontend static + backend serverless function via server.js)

**Package partagé :**
- `@ufm/shared` (local workspace) : tag-categories + user-role enum uniquement

---

## 3. ARCHITECTURE

> Cette structure ne change pas sans validation écrite dans ce fichier.

```
Ultimate-frisbee-manager/
├── frontend/src/app/
│   ├── core/           Services, guards, interceptors, modèles, cache
│   ├── features/       exercices / entrainements / echauffements /
│   │                   situations-matchs / tags / mobile / admin /
│   │                   settings / auth / dashboard / workspaces
│   └── shared/         Composants, pipes, widgets réutilisables
├── backend/
│   ├── controllers/    Logique de traitement par entité
│   ├── routes/         Définition des routes API
│   ├── services/       Services métier + cloudinary + prisma
│   ├── middleware/     auth, workspace, validation, errorHandler, rateLimit
│   ├── validators/     Validation zod par entité
│   └── prisma/         Schéma + migrations (NE PAS TOUCHER sans précaution)
├── shared/             Package @ufm/shared
├── PROJET_CONTEXTE.md
├── STACK_STANDARD.md
├── CHANGELOG.md
├── BUGS.md
└── README.md
```

**Routes API actives :**
`/api/auth` · `/api/health` · `/api/workspaces` · `/api/exercises` · `/api/tags`
`/api/trainings` · `/api/warmups` · `/api/matches` · `/api/dashboard` · `/api/import` · `/api/admin`

**Nombre de modules actifs : 12** / 20 maximum

---

## 4. FONCTIONNALITÉS

### Stables (ne pas toucher sans raison)
- Authentification Supabase (login, logout, reset password, confirm email)
- CRUD exercices avec upload image (Cloudinary)
- CRUD entraînements (composition d'exercices)
- CRUD échauffements (blocs structurés)
- CRUD situations de match
- Gestion des tags (catégorisés, par workspace)
- Gestion des workspaces (sélection, administration MANAGER)
- Interface mobile (home, library, detail, create, edit, profile, tags)
- Panneau admin (users, workspaces, dashboard)
- Import de données (JSON + markdown)
- Cache navigateur IndexedDB pour navigation fluide

### En cours / A décider
- Feature export (`/api/export`) : controller + service présents, route non montée — à compléter
- Route `/api/sync` : importée mais non montée — décision requise (garder ou supprimer)
- Feature terrain mobile (`mobile-terrain.component`) : en cours, potentiellement à supprimer

### Bugs connus
- **B1** `ExerciceOptimizedService` : importe `EntityCrudService`, `HttpGenericService`, `CacheService` — ces 3 fichiers n'existent pas. Build potentiellement cassé. Correction prioritaire.
- **B2** `admin/pages/activity` et `admin/pages/stats` : composants présents dans le routing admin mais sans données réelles — UI shell vide affiché aux utilisateurs.

### Hors scope (ne jamais implémenter sans décision explicite)
- Mode offline complet (PWA)
- Système de tags avancés (supprimé — `tags-advanced` archivé)
- Migration backend vers TypeScript

---

## 5. RÈGLES STRICTES DU PROJET

- GRAPHIFY ACTIF : Lire graphify-out/GRAPH_REPORT.md en début de chaque session.
  Si absent → le regénérer avant tout autre travail (graphify claude install + graphify .)
- Ne modifier QUE les fichiers concernés par la mission en cours
- Ne créer aucun nouveau fichier sans le lister ici après création
- Ne pas ajouter de dépendance sans demande explicite
- **Ne jamais lancer `prisma migrate reset` — données production réelles**
- Toute migration Prisma doit utiliser `prisma migrate deploy` uniquement
- Modifier l'existant avant d'en créer du nouveau
- Zéro structure vide créée "pour le futur"
- Travailler sur un seul bug ou feature à la fois

---

## 6. DÉCISIONS FIGÉES

| Date | Décision | Raison |
|---|---|---|
| (depuis origine) | Backend en JavaScript CommonJS, pas TypeScript | Cohérent, fonctionnel, pas de migration prévue |
| (depuis origine) | Supabase Auth JWT RS256 via JWKS | Vérifié dans `auth.middleware.js` |
| (depuis origine) | WorkspaceGuard obligatoire sur toutes les routes de données | Vérifié dans `routes/index.js` |
| 2026-04-10 | Tags simples uniquement (module `tags` dans parametres) | `tags-advanced` supprimé — trop complexe, non utilisé |
| 2026-04-14 | graphify initialisé | Réduction tokens, carte persistante entre sessions |

---

## 7. FICHIERS DE DOCUMENTATION AUTORISES

| Fichier | Rôle |
|---|---|
| PROJET_CONTEXTE.md | Source de vérité (ce fichier) |
| STACK_STANDARD.md | Stack de référence |
| CHANGELOG.md | Historique des missions terminées |
| BUGS.md | Bugs connus et leur statut |
| README.md | Présentation et guide de démarrage |

Tout autre fichier .md va dans `_archives/`.

---

## 8. SESSION EN COURS

**Graphify :** ✅ Actif — GRAPH_REPORT.md lu
**Objectif de la session :** Audit complet + remise en ordre du backlog
**Date :** 2026-06-05
**Résultat :**
- B1 confirmé CRITIQUE : ExerciceOptimizedService injecté dans exercice.service.ts, 3 dépendances absentes → build cassé
- B2 corrigé : sync.routes.js contient du vrai code (feature incomplète, pas dead code)
- B3 confirmé : 27 scripts, 4 à garder, 23 archivables
- B4 corrigé : activity = vide, stats = fonctionnel (branchée sur /api/admin/overview)
- B5 infirmé : export déjà opérationnel sous /api/admin/export-ufm
- Nouveaux points : 4 fichiers spec cassés (N1), incohérence réponse /api (N2), mémoire projet export obsolète (N3)

---

## 9. BACKLOG (missions suivantes)

> Ordonné par priorité. Ne jamais commencer la suivante sans que la précédente soit testée.

1. **[BUG BLOQUANT]** Corriger `ExerciceOptimizedService` — créer les 3 services manquants (`EntityCrudService`, `HttpGenericService`, `CacheService`) ou réécrire pour utiliser `ExerciceService` existant. Inclure : corriger les 4 fichiers spec qui importent les mêmes services absents.
2. **[DÉCISION]** Route `/api/sync` — monter (1 ligne dans `routes/index.js`) ou supprimer le fichier + corriger la réponse JSON de `/api` qui liste `sync` comme route active.
3. **[NETTOYAGE CODE]** Supprimer le code mort confirmé : `TrainingSimpleService`, module `tags-advanced`, `admin-shell` de settings, `training-simple.service.ts`, `backend/models/entrainement.simple.js`, `backend/routes/debug.js`, `backend/routes/entrainement.routes.swagger.js`
4. **[NETTOYAGE SCRIPTS]** Archiver les 23 scripts one-shot dans `backend/scripts/` — garder uniquement : `postdeploy-check.js`, `sync-supabase-users.js`, `import-ufm.js`, `export-ufm.mjs`
5. **[BUG]** `admin/pages/activity` uniquement — supprimer ou brancher des données réelles. (`admin/pages/stats` est fonctionnel, ne pas toucher.)
6. **[DOUBLONS]** Évaluer et résoudre : deux `mobile-detail`, deux services notification, deux listes utilisateurs dans settings
7. **[DÉCISION]** Feature terrain mobile — garder ou supprimer

---

*Rempli avec : Claude (mode Project) — 2026-04-10*
*Lu par : Cascade à chaque début de session*
