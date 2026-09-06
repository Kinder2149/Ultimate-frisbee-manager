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
| Dernière mise à jour de ce fichier | 2026-09-06 |

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

**Nombre de features frontend : 11** / 20 maximum
**Nombre de services frontend : 34** (⚠️ > limite de 20 — nettoyage en cours, réduit de 41 à 34 le 2026-09-06)

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
- Export : opérationnel sous `/api/admin/export-ufm` (pas de route `/api/export` séparée).
- Route `/api/sync` : **montée et active** (`routes/index.js` ligne 57) — le `SyncService` frontend est très utilisé (synchro/cache). Conservée.
- `tags-advanced` : **supprimé le 2026-09-06** (décision figée 2026-04-10 enfin exécutée).
- Feature terrain mobile (`mobile-terrain` + onglet « Terrain » du menu mobile) : **supprimée le 2026-09-06** (non utilisée, confirmé par le pilote).

### Bugs connus
> Source de vérité : `BUGS.md`. Au 2026-09-06 : B1, B2, B2b tous **Résolus** (build propre confirmé). Aucun bug bloquant ouvert.

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
| (depuis origine / màj 2026-09-06) | Supabase Auth : le code accepte JWT **RS256 (via JWKS) ET HS256 (via SUPABASE_JWT_SECRET)** | Vérifié dans `auth.middleware.js`. Les deux algos Supabase sont supportés (tokens legacy HS256 + tokens RS256). |
| (depuis origine) | WorkspaceGuard obligatoire sur toutes les routes de données | Vérifié dans `routes/index.js` |
| 2026-04-10 | Tags simples uniquement (module `tags` dans parametres) | ✅ EXÉCUTÉE le 2026-09-06 : module `tags-advanced` (composants, route, service) supprimé du code. |
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

**Graphify :** ⚠️ `graphify-out/` non présent dans le repo (gitignoré) — à régénérer avant l'audit code.
**Objectif de la session :** Audit complet PUIS exécution des corrections (nettoyage, mise à niveau, cohérence).
**Date :** 2026-09-06
**Résultat (exécuté par Claude, code modifié) :**
- 🔴 Sécurité : `backend/.env.CLEAN` retiré du suivi git (`git rm --cached`). **Rotation des secrets = action pilote restante (B3 encore ouvert).**
- Tests : 4 specs cassés supprimés (importaient des services inexistants) — reste 5 specs.
- Doublon : `features/exercices/services/exercice.service.ts` supprimé (le vrai est dans `core/services/`).
- Code mort : 5 services 0-usage supprimés (`filters`, `mapper`, `mobile-content-state`, `validation`, `training-simple`), 2 routes backend mortes (`debug.js`, `swagger`), module `tags-advanced` et feature `mobile-terrain` (+ onglet menu) supprimés.
- Scripts : 23 scripts one-shot archivés dans `_archives/backend-scripts/`, 5 utiles conservés.
- Cohérence : décision figée auth alignée (HS256+RS256), compteurs mis à jour (41→34 services, 12→11 features).
- Reporté volontairement : fusion des 2 services de notification (risque de régression, à traiter isolément).
- Prod non testable depuis l'environnement distant (egress bloqué) — vérification manuelle Vercel + Supabase à faire côté pilote.

---

## 9. BACKLOG (missions suivantes)

> Ordonné par priorité. Ne jamais commencer la suivante sans que la précédente soit testée.

> État au 2026-09-06 après exécution des corrections. Détail : `_archives/AUDIT_2026-09-06.md`.

### ✅ Fait le 2026-09-06
- ~~[🔴] `git rm --cached backend/.env.CLEAN`~~ — retiré du suivi git.
- ~~[🟠] 4 specs cassés~~ — supprimés (B4 résolu).
- ~~[🟠] Doublon `ExerciceService`~~ — supprimé (B5 résolu).
- ~~[🟠] `tags-advanced`~~ — supprimé.
- ~~[🟡] 5 services 0-usage + 2 routes mortes~~ — supprimés.
- ~~[🟡] Feature terrain mobile~~ — supprimée.
- ~~[🟡] Archiver scripts~~ — 23 archivés, 5 gardés.
- ~~[🟡] Cohérence auth HS256/RS256~~ — décision figée alignée.

### 🔜 Reste à faire
1. **[🔴 SÉCURITÉ — PILOTE, URGENT]** Faire tourner (rotate) TOUS les secrets exposés : Supabase JWT secret, Cloudinary API secret, mot de passe PostgreSQL / DATABASE_URL. Via dashboards. Tant que ce n'est pas fait, les valeurs présentes dans l'historique git restent valides. (B3 — reste ouvert)
2. **[🟡 OPTION]** Purger `.env.CLEAN` de l'historique git (`git filter-repo`) — non fait volontairement (réécriture d'historique risquée). Facultatif si les secrets sont tournés.
3. **[🟡 DOUBLON]** Consolider les 2 systèmes de notification (`NotificationService` + `NotificationManagerService`) — reporté (risque de régression, à traiter isolément avec test manuel).
4. **[🟡 DETTE]** 34 services frontend > limite de 20 : poursuivre la rationalisation (ex : regrouper les services `mobile-*`).

---

*Rempli avec : Claude (mode Project) — 2026-04-10*
*Lu par : Cascade à chaque début de session*

---

## 10. AUDIT DE REPRISE (2026-08-06)

**Constat :**
- **B1 (bug bloquant, priorité 1 du backlog) semble déjà résolu** : `ExerciceOptimizedService` (`exercice-optimized.service.ts`) n'existe plus du tout dans `frontend/src` — recherche exhaustive sans résultat. `BUGS.md` mis à jour en conséquence (statut passé de "Ouvert/CRITIQUE" à "Probablement résolu — à confirmer"). Seuls des fichiers `*.spec.ts` mentionnent encore les noms de services absents (`EntityCrudService`, `HttpGenericService`), ce qui pourrait faire planter ces tests spécifiquement — à vérifier avec `npm test`.
- **`CHANGELOG.md` très en retard** : sa dernière entrée date du 2026-04-14, alors que `git log` montre des commits jusqu'au 2026-07-20 (dont "Nettoyage documentation et corrections services", "Rendre tous les tags optionnels", corrections TypeScript/Zod sur les tags) — aucun de ces travaux n'est tracé dans le changelog.
- `git status` propre, `graphify-out/GRAPH_REPORT.md` daté du 2026-07-20, cohérent avec le dernier commit — le graphe n'est pas en retard, contrairement au CHANGELOG.
- Le reste du backlog section 9 (points 2 à 7 : `/api/sync`, nettoyage scripts, doublons, feature terrain mobile) n'a pas été vérifié dans cet audit doc-only — à re-confirmer un par un à la prochaine reprise de code.

**Backlog additionnel (reprise) :**
1. Confirmer que B1 est bien résolu (lancer `npm run build` côté frontend) et clore formellement le point 1 du backlog section 9 si confirmé.
2. Mettre à jour `CHANGELOG.md` avec les missions de commits entre le 2026-04-14 et le 2026-07-20 (tags optionnels, corrections Zod/TypeScript, nettoyage doc).
3. Nettoyer les `*.spec.ts` qui importent encore `EntityCrudService`/`HttpGenericService` (services inexistants) — `echauffement.service.spec.ts`, `entrainement.service.spec.ts`, `exercice.service.spec.ts`, `situationmatch.service.spec.ts`, `entity-crud.service.spec.ts`.
4. Re-vérifier B2 (admin/pages/activity) et les points 2-7 du backlog existant — non revalidés dans cet audit doc-only.
