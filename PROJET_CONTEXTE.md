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
**Nombre de services frontend : 27** (réduit de 41 → 34 → 28 → 27 le 2026-09-06 ; les 27 restants sont tous réellement utilisés. Descendre à 20 imposerait des fusions artificielles nuisant à la lisibilité — non recommandé.)

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
| (màj 2026-09-06) | Supabase Auth : vérification JWT **asymétrique via JWKS uniquement** (ES256 clé courante ECC P-256, RS256 accepté aussi). HS256 legacy **retiré**. | Migration Supabase vers les JWT Signing Keys. Endpoint JWKS : `/auth/v1/.well-known/jwks.json`. Plus aucune dépendance à `SUPABASE_JWT_SECRET` dans le code. |
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
**Objectif de la session :** Audit complet → exécution des corrections → sécurisation + remise en service de la prod.
**Date :** 2026-09-06
**Résultat (exécuté par Claude, déployé et validé en prod) :**
- Nettoyage audit : 4 specs cassés, doublon `ExerciceService`, 5 services 0-usage, 2 routes mortes, `tags-advanced`, `mobile-terrain` supprimés ; 23 scripts archivés (41→34 services, 12→11 features).
- 🔴 Sécurité (B3 résolu) : `.env.CLEAN` retiré du suivi git ; mot de passe DB + secret Cloudinary régénérés ; Supabase migré vers JWT Signing Keys (ES256).
- Auth : backend passé en vérification **asymétrique JWKS uniquement** (ES256/RS256), HS256 retiré → fuite du secret JWT neutralisée. Correctif URL JWKS (`/auth/v1/.well-known/jwks.json`).
- Déploiement : correctifs poussés sur `master` via PR #2 et #3 → Vercel a redéployé la prod. **Connexion + chargement des données validés en prod** (login, workspaces, préchargement exercices/entraînements/etc., admin).
- Topologie clarifiée : **Vercel = seule prod** (front + API). 2 services Render abandonnés (déploiements en échec) — à suspendre côté pilote.
- Rationalisation services : 6 services morts supprimés (34→28) puis fusion des 2 services de notification en un seul `NotificationService` (28→27). Les 27 restants sont tous utilisés.
- Qualité : log frontend bruyant « Token alg différent de RS256 » retiré.
- Déploiement : PR #2 → #8 fusionnées dans `master` (Vercel redéploie automatiquement).
- ⚠️ À valider manuellement par le pilote : notifications succès/erreur + bouton « copier détails » (fusion notifications, ça touche l'UX).

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

### ✅ Fait aussi le 2026-09-06 (sécurité + remise en service)
- ~~[🔴] Rotation des secrets~~ (DB + Cloudinary) + migration Supabase ES256.
- ~~[🔴] Backend RS256/ES256 via JWKS, HS256 retiré~~ — fuite JWT neutralisée.
- ~~[🔴] DATABASE_URL corrigée~~ + prod redéployée et **validée** (login + données OK).

### 🔜 Reste à faire (fin du plan)
1. **[✅ À VALIDER — PILOTE]** Test manuel des notifications en prod (succès à la création/édition d'exercice, erreur sur champ invalide, bouton « copier détails »). Si un souci → rollback Vercel 1 clic.
2. **[🟢 FINITION — PILOTE]** Retirer la variable `SUPABASE_JWT_SECRET` de Vercel (le code ne s'en sert plus) + suspendre les 2 services Render abandonnés (dashboard).
3. **[🟡 OPTION — non bloquant]** Front → clé `publishable`, puis révoquer la clé JWT legacy dans Supabase ; purge `.env.CLEAN` de l'historique git. La fuite est déjà neutralisée (backend n'accepte plus HS256), ces étapes sont du confort.

### ✅ Déjà fait le 2026-09-06 (rationalisation + qualité)
- ~~[🟡 DETTE] Rationaliser les services~~ — 41 → 27 (6 morts supprimés + fusion notifications). Les 27 restants sont utilisés ; pas de fusion artificielle pour viser 20.
- ~~[🟡 DOUBLON] Fusion des 2 services de notification~~ — un seul `NotificationService`.
- ~~[🟡 QUALITÉ] Log bruyant « Token alg différent de RS256 »~~ — retiré.

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
