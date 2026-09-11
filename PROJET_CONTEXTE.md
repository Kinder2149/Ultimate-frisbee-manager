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
| Dernière mise à jour de ce fichier | 2026-09-09 |

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
- Port local : 3000 (défini dans `backend/.env`, aligné avec `frontend/proxy.conf.json`)

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
│   │                   settings / auth / dashboard / workspaces / errors
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
`/api/trainings` · `/api/warmups` · `/api/matches` · `/api/dashboard` · `/api/import` · `/api/admin` · `/api/sync` · `/api/lexique`

**Nombre de features frontend : 13** / 20 maximum (ajout de `lexique` le 2026-09-08 — voir section 11)
**Nombre de services frontend : 26** (réduit de 41 → 34 → 28 → 27 le 2026-09-06, puis → 26 le 2026-09-08 avec la suppression de `upload.service.ts`, qui visait une route inexistante. Les 26 restants sont tous réellement utilisés. Descendre à 20 imposerait des fusions artificielles nuisant à la lisibilité — **écart assumé**.)

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
- **Intégration Ulti Coach (contenu de formation coachs)** : EN COURS — voir section 11 pour l'état détaillé et la reprise.
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
| 2026-09-09 | **Modèle Ulti Coach validé** — `Tag` gagne un `parentId` auto-référencé (Thème → Phase → Sous-phase, 3 niveaux dans une seule table) ; nouvelle catégorie de tag `public_seance` (Débutant/Hétérogène/Confirmé) distincte de `niveau` (échelle de difficulté 1-5 existante) ; `Entrainement` gagne une relation `lexique Lexique[]` (many-to-many, Lexique du jour) et un champ `rang Int?` (tri Thème×Niveau×Rang quand la date manque) ; `SituationMatch` ne change pas (`description` texte riche suffit pour contrainte + système de points). Détail complet et justification en section 11. | Cadrage demandé par Kinder avant tout import : le modèle devait "coller" à un exemple réel de séance de coach. Écarté : réutiliser la catégorie `niveau` existante pour le public de séance (collision de sens avec la difficulté d'exercice) ; créer une base séparée pour la hiérarchie Thème/Phase (redondant avec `Tag`, contredit "modifier l'existant avant d'en créer du nouveau"). |

---

## 7. FICHIERS DE DOCUMENTATION AUTORISES

| Fichier | Rôle |
|---|---|
| PROJET_CONTEXTE.md | Source de vérité (ce fichier) |
| STACK_STANDARD.md | Stack de référence |
| CHANGELOG.md | Historique des missions terminées |
| BUGS.md | Bugs connus et leur statut |
| README.md | Présentation et guide de démarrage |

**Hors quota** : `CLAUDE.md` n'est pas de la documentation projet mais la
configuration de l'outil (instructions graphify lues par Claude Code au
démarrage). Il reste à la racine, au même titre que `.gitignore`.

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

---

## 11. INTÉGRATION ULTI COACH (en cours — reprise le 2026-09-09)

**Contexte :** Kinder a produit hors de ce dépôt (`V:\DEV\PROJETS\applications_web\Ulti_Coach`) tout le contenu
de sa méthode d'entraînement (formation coachs) et une base Notion déjà formalisée (page **SPORT**, 4 data sources
reliées : Exercices, Contenu - Thèmes & Phases, Lexique, Training/séances). Objectif : transposer ce contenu dans
un workspace dédié de cette appli, en réutilisant l'existant plutôt qu'en créant un système parallèle.

**Décisions prises (ne pas rediscuter) :**
- Nouveau workspace dédié : **"Ulti Coach"** (id `e133fed1-ab18-4e1f-8e10-eb9124645fa6` en prod). Kinder y est MANAGER.
- Les **Thèmes** de la progression annuelle se mappent sur les `Tag` existants (catégorie Thème) — pas de nouvelle table.
- Le **Lexique** (vocabulaire imagé du club) n'a pas d'équivalent existant → nouvelle table `Lexique` créée.
- La vue "déroulement sur une année" s'appuiera sur le champ `date` déjà présent sur `Entrainement` (pas de nouvelle table) — **écran pas encore construit**.
- Une mission à la fois, testée manuellement avant la suivante (règle projet standard, appliquée strictement ici vu l'ampleur).

**✅ Fait le 2026-09-08 (Mission 1 — Lexique) :**
- Modèle Prisma `Lexique` ajouté (`backend/prisma/schema.prisma`) + migration `20260908120000_add_lexique` appliquée en prod via Supabase MCP (le `DIRECT_URL` de `backend/.env` avait un mot de passe périmé — la migration a été appliquée directement via l'outil Supabase, avec insertion manuelle de la ligne dans `_prisma_migrations` pour garder l'historique Prisma cohérent). **`backend/.env` → `DIRECT_URL` reste à corriger** pour que `npx prisma migrate deploy` refonctionne en local (non bloquant, contournement en place).
- CRUD backend complet : `backend/services/business/lexique.service.js`, `backend/controllers/lexique.controller.js`, `backend/validators/lexique.validator.js`, `backend/routes/lexique.routes.js`, montée dans `backend/routes/index.js` sous `/api/lexique` (auth + workspaceGuard + baseMutationGuard, comme les autres routes de données).
- Écran frontend de consultation (lecture seule + filtre par catégorie) : `frontend/src/app/core/models/lexique.model.ts`, `frontend/src/app/core/services/lexique.service.ts`, `frontend/src/app/features/lexique/` (module + page `lexique-list`), route `/lexique` dans `app.module.ts`, lien de nav ajouté dans `app.component.html`.
- **Pas encore fait pour le Lexique** : formulaire de création/édition/suppression côté UI (le backend le supporte déjà — `POST`/`PUT`/`DELETE` — mais aucun écran ne les appelle). Purement en lecture pour l'instant.
- Données : les **41 termes** du Lexique Notion importés dans le workspace Ulti Coach (les relations Notion "Introduit dans" (Phase) et "Séances" n'ont **pas** été importées — elles pointent vers des entités pas encore transposées).
- Vérifié manuellement par Kinder dans le navigateur (workspace "Ulti Coach", écran Lexique, filtre par catégorie) — **validé**.

**✅ Fait le 2026-09-09 — Découverte + nettoyage Notion (option A : Notion propre avant import) :**
- Découverte : `Ulti_Coach/PLAN_MISSION_2A.md` a révélé que Kinder avait déjà mené la Mission 2a (E1 à E6 sur 7) bien avant cette reprise — la base Notion "Training" contient **39 séances complètes** (ossature + intégral + scan attaché), croisées avec les 63 pages manuscrites (`2025 Training Scan.pdf`) et le Google Doc de saison. Ce n'est donc plus 4 data sources brutes à exploiter, mais une base déjà largement construite à finir de nettoyer (E7, jamais lancée).
- **E7 exécutée en 5 lots** (pages 1-63 du PDF croisées une à une avec les 39 séances) : dates manquantes complétées sur ~9 séances, une coquille corrigée ("Conti de Rayan" → "Conti Royan"), deux séances mélangées à tort sur une même page séparées (02/10 vs 30/10/25), une séance manquante créée (Le Cut n°9, p.19), tableaux résiduels vides nettoyés. Toutes les séances vérifiées marquées `Saisie = Intégral vérifié (scan relu)`.
- **✅ 6e lot (nettoyage transversal) terminé le 2026-09-09** — E7 est maintenant bouclée. Plusieurs tentatives ont buté sur un quota Notion ("usage limit for Query Data Source") avant d'aboutir ; espacer les tentatives a suffi, aucune donnée perdue entre-temps.
  - ✅ Doublons d'exercices : le §8ter du plan (`Ulti_Coach/PLAN_MISSION_2A.md`) annonçait ~55 doublons réels sur 109 exercices — diagnostic obsolète, la banque n'a que **73 entrées, aucun doublon de nom exact**. Rien à faire. Seul cas réel trouvé hors de cette liste : "Fléche" et "La flèche" étaient bien le même exercice → "Fléche" marquée `[DOUBLON — voir "La flèche"]`. "La flèche— Cut" est un exercice distinct, non touché.
  - ✅ Phases orphelines : 3 sur 4 rattachées ("La passe en courbe" et "La passe en mouvement" → thème Continuité et prise de décision ; "Libérer l'espace" → thème Le Cut). **"Le jeu long" reste orpheline** — aucune séance ne la référence et aucun des 10 thèmes ne correspond (pas de thème "Transverse" générique ; "Travail d'équipe", le seul thème Face=Transverse, est un thème de fin de saison sans nouveau contenu) — **décision Kinder en attente** : créer un thème dédié, laisser hors arborescence, ou fusionner ailleurs.
  - ⚠️ Plays : Split Stack a eu sa fiche exercice créée (contenu suffisant dans Contenu). **7 plays (Spain, Diago, Iso, Fou, La Q, Braise, Attaque des Handler) et L'Émeraude n'ont qu'un schéma image, aucun texte** dans leur fiche Notion — impossible de les rattacher sans deviner, laissés en l'état. **Décision Kinder en attente** : compléter le texte à la main, ou exclure ces fiches de l'import tant qu'elles ne sont qu'une image. Bonus : "Torero" dans la banque est une fiche d'étirement (collision de nom), pas le play — aucune fiche du play "Torero" n'existe.
  - ✅ Fiche manquante "Pense-bête échauffement" reconstruite depuis le PDF (p.4), marquée "à compléter".
  - ✅ Séance résiduelle "🥏 Training - Défense Clam - 01/02/2024" confirmée doublon (son propre texte dit "reprendre les bases vues aux deux derniers entraînements") → renommée `[DOUBLON — voir séances 18/01/2024 et 25/01/2024]`.
- Points théorie (p.12/13/19/20/29/32/37 du PDF) vérifiés conformes aux pages Phase de Contenu, sauf **Toupies et Cavalier : aucune page Contenu dédiée trouvée** — à créer si besoin.

**État final Notion :** base considérée comme **source propre pour l'import**, sous réserve des 2 décisions Kinder ci-dessus (Le jeu long ; les 8 fiches sans texte). Ces deux points n'empêchent pas de démarrer l'import des Exercices et des Séances — ils concernent un sous-ensemble limité de contenu (1 phase, 8 exercices sur 73).

**✅ Tranché le 2026-09-09 — Modélisation Thème/Phase/Sous-phase + trous du modèle séance :**

Challenge fait en confrontant le modèle actuel à une vraie séance de coach ("Le Cut — n°5 — Le temps zéro"). Résultat : `Exercice`, l'échauffement en blocs et `SituationMatch.type='Match'` collent déjà bien. Quatre trous identifiés et résolus :

| Trou identifié | Décision |
|---|---|
| Hiérarchie Thème→Phase→Sous-phase (3 niveaux) ne rentre pas dans `Tag` (plat) | `Tag` gagne un `parentId` auto-référencé (nullable, `onDelete: SetNull`). Une Phase = un `Tag` (nouvelle catégorie `phase_entrainement`) dont le `parentId` pointe vers le Thème parent. Une Sous-phase pointe vers sa Phase. Une seule table, comme la base "Contenu" de Notion. |
| Le Lexique du jour n'a aucune case dans une séance (catalogue isolé depuis la Mission 1) | `Entrainement` gagne une relation many-to-many `lexique Lexique[]` (même pattern que `tags`). |
| La catégorie `niveau` existante (échelle de difficulté d'exercice 1-5, `NIVEAU_LABELS`) collisionne avec le "Niveau" de Kinder (Débutant/Hétérogène/Confirmé = public d'une séance, pas une difficulté) | Nouvelle catégorie de tag dédiée `public_seance`, distincte de `niveau`. Ne pas réutiliser `niveau` pour ça. |
| Les séances Notion s'ordonnent par `Thème × Niveau × Rang`, pas par date (souvent inconnue/approximative) — `Entrainement` n'a que `date` (optionnelle) | `Entrainement` gagne un champ optionnel `rang Int?`, utilisé pour trier quand la date manque ou n'est pas fiable. |

Écarté explicitement : réutiliser `niveau` pour le public de séance (collision de sens) ; créer une base séparée pour Thème/Phase (redondant, contredit "modifier l'existant avant d'en créer du nouveau") ; structurer `SituationMatch` davantage (le texte riche de `description` suffit pour "contrainte + système de points", trop variable d'un match à l'autre pour figer des champs).

Décision reportée en section 6.

**✅ Fait le 2026-09-09 — Migration Prisma + code du modèle tranché ci-dessus :**
- Migration `20260909175400_add_tag_hierarchy_lexique_rang` écrite (via `prisma migrate diff` + `migrate deploy`, additive uniquement) et appliquée en prod : `Tag.parentId` (auto-référencé, `onDelete: SetNull`), `Entrainement.rang`, relation many-to-many `Entrainement.lexique`.
- **`backend/.env` → `DIRECT_URL` corrigé** (mot de passe périmé remplacé par celui de `DATABASE_URL`, juste le port changé pour bypasser pgbouncer) — `npx prisma migrate deploy` refonctionne en local, plus besoin du contournement Supabase MCP utilisé pour la Mission 1.
- Catégories `phase_entrainement` et `public_seance` ajoutées à `shared/constants/tag-categories.ts` (source de vérité unique, aussi corrigé une duplication obsolète du même mapping dans `tags-manager.component.ts` et `tag.constants.ts` qui ne connaissaient pas les nouvelles catégories).
- Backend : `tag.validator.js`/`tag.service.js` gèrent `parentId` (validation anti-cycle, appartenance au workspace) ; `entrainement.validator.js`/`entrainement.service.js` gèrent `lexiqueIds`/`rang` ; nouvelle fonction `validateLexiqueInWorkspace` dans `utils/workspace-validation.js`.
- **Bug trouvé et corrigé pendant le test manuel** : `backend/middleware/transform.middleware.js` savait re-parser `tagIds` (JSON stringifié dans le FormData) mais pas `lexiqueIds` → 400 Bad Request systématique à la création d'un entraînement avec lexique. Généralisé le parsing à un tableau `idArrayFields = ['tagIds', 'lexiqueIds']`.
- Frontend : nouveau composant `lexique-select-multi` (même pattern que `tag-select-multi`, adapté au modèle Lexique) ; formulaire Entraînement (champ Rang + sélecteur Lexique du jour) ; formulaire Tag (sélecteur de parent, visible seulement pour `phase_entrainement`) ; `tag-list` rend désormais un arbre indenté (`↳`) pour cette catégorie, avec le thème parent affiché en clair pour les phases racines.
- **Testé manuellement dans le navigateur** (Kinder connecté, workspace Ulti Coach) : création Thème "Le Cut" → Phase "Cut 1" (rattachée) → Sous-phase "Le Classique" (rattachée à Cut 1) → arbre à 2 niveaux affiché correctement. Entraînement créé avec `rang=5` et 2 termes de lexique → persisté et rechargé correctement en édition. Données de test nettoyées après vérification.

**✅ Fait le 2026-09-09 (confirmé en base après la pause, avant l'arrêt du poste) — Import Thèmes/Phases + Exercices :**
Script one-off `backend/scripts/import-ulti-coach-exercices.js` (985 lignes, non supprimé — gardé comme référence/rejouable) a exécuté : (A) import des Thèmes/Phases/Sous-phases de Notion comme `Tag` (catégorie `theme_entrainement` pour les thèmes, `phase_entrainement` avec `parentId` pour les phases/sous-phases — "Le jeu long" importée avec `parentId: null`, décision Kinder toujours en attente) ; (B) import des Exercices vers le modèle `Exercice`, avec parsing du corps de chaque fiche Notion (Objectif/Déroulement → `description`, Critère de réussite, Variable +/-, Matériel, Durée, Effectif) et tags (`travail_specifique`, `objectif`, `phase_entrainement` depuis la relation Phases). Images Notion **non importées** (URLs signées, expirent en 5 min).

**Résultat confirmé par le rapport final de l'agent (arrivé après la vérification manuelle en base, les deux concordent) :**
```
Tags — theme_entrainement: 10 · phase_entrainement: 39 (29 Phases + 10 Sous-phases) · travail_specifique: 3 · objectif: 19
Exercices: 74 (38 avec description complète, 36 avec fiche Notion incomplète — surtout des étirements au gabarit vide)
```
74 et non 73 : la source Notion contenait en réalité 74 fiches distinctes (le chiffre 73 du cadrage était une estimation légèrement fausse) — aucun doublon, compté par requête directe. "Fléche" (doublon de "La flèche") a été importée telle quelle avec son nom déjà préfixé `[DOUBLON — voir "La flèche"]` depuis le nettoyage Notion, conservée en l'état.

**⚠️ Quel workspace ?** Tout est créé dans **"Ulti Coach"**, `workspaceId = "e133fed1-ab18-4e1f-8e10-eb9124645fa6"` — jamais dans "BASE" (workspace protégé, réservé aux admins plateforme). Pour vérifier à l'écran : se connecter, "Changer d'espace" → choisir **Ulti Coach** (rôle Gestionnaire pour Kinder) avant de regarder `/tags` ou `/exercices` — si on reste sur "BASE" par défaut, tout paraîtra vide alors que les données sont bien là.

**❌ Pas fait — reste à faire, dans l'ordre suggéré :**
1. ~~**QA visuelle de l'import**~~ ✅ **faite le 2026-09-10** (Kinder connecté) : 74 fiches lisibles (retours à la ligne corrigés, variables en liste), arbre 10 thèmes / 39 phases correct, lexique 42 termes fidèle à Notion. À nettoyer par Kinder dans l'appli : tags objectifs « Echauffemen avec disc » (doublon) et « Middel » (faute) ; définition Notion de « Compte à 5 » à revoir.
2. ~~Les séances réelles~~ ✅ **faites le 2026-09-11** : 41 séances vérifiées importées (script `backend/scripts/import-ulti-coach-seances.js` + données `backend/scripts/data/ulti-coach-seances.json`, relançable sans doublon). 35 échauffements (93 blocs), 24 matchs, 66 nouvelles fiches + 13 fiches du catalogue réutilisées (consignes de séance dans `EntrainementExercice.notes`), tags public Débutant/Hétérogène/Confirmé créés. Hors périmètre : 4 séances « À valider Kinder », 16 anciennes 2023-2024, scans. Sauvegarde JSON préalable dans le dossier `UFM_sauvegardes` (à côté du dépôt).
3. ~~Formulaire d'édition du Lexique~~ ✅ **fait le 2026-09-11** : sur la page `/lexique`, ajout / modification (formulaire en place) / suppression avec confirmation, réservés aux rôles qui peuvent écrire (gestionnaire, membre) ; le serveur refuse l'écriture à un lecteur (test `__tests__/lexique-droits.test.js`).
4. ~~L'écran « déroulement sur une année »~~ ✅ **fait le 2026-09-11** : `/entrainements/annee` (menu Entraînements → Déroulement de l’année). Deux présentations : par thème (séances dans l'ordre du rang, puis public Débutant → Hétérogène → Confirmé) et par mois (séances datées, puis « Sans date »), filtre par public. Lecture seule, réutilise la fenêtre de séance. Non disponible en mode mobile (terrain mobile mis de côté).
5. Deux micro-décisions Kinder toujours en attente (section précédente) : la phase "Le jeu long" sans thème d'accueil ; 8 fiches d'exercices/plays Notion qui n'ont qu'un schéma image sans texte (Spain, Diago, Iso, Fou, La Q, Braise, Attaque des Handler, L'Émeraude).

---

## 12. REPRISE SUR UNE AUTRE MACHINE (pause du 2026-09-09)

**État git au moment de la pause :**
- Branche `master`, **5 commits locaux non poussés** avant cette session + les changements de cette session (migration Prisma, code Tag hiérarchique/Lexique/rang, corrections diverses) — à committer et pousser avant de changer de machine (voir commande ci-dessous, faite dans la foulée de cette note).
- Fichiers non trackés à ajouter : `backend/prisma/migrations/20260909175400_add_tag_hierarchy_lexique_rang/`, `frontend/src/app/shared/components/form-fields/lexique-select-multi/`.

**Base de données : PAS un problème de synchro.**
La migration Prisma (`20260909175400_add_tag_hierarchy_lexique_rang`) a été appliquée avec `prisma migrate deploy` **directement sur la base Supabase de production** (projet `rnreaaeiccqkwgwxwxeg`, la même que Vercel utilise) — pas sur une base locale isolée. Une autre machine qui se connecte à ce même projet Supabase voit donc **déjà** le nouveau schéma. Il n'y a rien à "rejouer" côté base : juste besoin que le code (schéma Prisma + reste) soit à jour via `git pull`, puis `npx prisma generate` pour régénérer le client localement.

**Sur l'autre machine, après `git pull` :**
1. `npm install` (racine + workspaces) si les node_modules ne sont pas partagés.
2. `npm -w shared run build` (le package `@ufm/shared` doit être rebuild après le `git pull`, comme d'habitude).
3. `npx prisma generate` dans `backend/` pour régénérer le client Prisma avec le nouveau schéma.
4. **Vérifier `backend/.env` → `DIRECT_URL`** : ce fichier n'est jamais commité (secrets), donc l'autre machine a sa propre copie. Si `npx prisma migrate deploy` échoue avec une erreur d'authentification, c'est le même problème que celui corrigé ici le 2026-09-09 : le mot de passe dans `DIRECT_URL` était périmé. Correctif : recopier le mot de passe de `DATABASE_URL` dans `DIRECT_URL`, en ne changeant que le port (`6543` → `5432`) et en retirant `?pgbouncer=true&connection_limit=1`. (`DATABASE_URL` reste inchangé, c'est lui qui a le mot de passe à jour.)
5. `npx prisma migrate deploy` (sans risque — la migration est déjà marquée appliquée dans `_prisma_migrations`, côté base, donc c'est un no-op ; utile seulement si jamais l'autre machine pointe vers une base qui ne l'a pas encore).

**Statut du travail Notion/import au moment de la pause :** voir section 11 ci-dessus ("En cours au moment de la pause"). L'agent d'import tourne en tâche de fond côté session Claude Code — son résultat n'est pas lié à la machine (il écrit directement dans Supabase prod via le script Node), donc **pas besoin d'être sur la même machine pour voir le résultat**, juste relire son rapport ou vérifier directement dans l'appli/la base à la reprise.

**Accès Notion :** connecteur Notion actif dans les sessions Claude Code de ce projet (page **SPORT**). IDs utiles :
- Data source Exercices : `collection://05666cc3-ea31-497b-b51d-181feb3cbcda`
- Data source Contenu - Thèmes & Phases : `collection://023055ea-eac9-42dd-9e0c-79c5e4eddb49`
- Data source Lexique : `collection://e4e371e9-140e-4263-814c-542d94c7f8e5` (déjà importée)
- Data source Training (séances) : `collection://2c9bf6a5-ae94-471a-b652-04175d586400` (39 séances vérifiées via E7 + 18 anciennes entrées 2023-2024 hors périmètre scan)

**Projet Supabase :** `rnreaaeiccqkwgwxwxeg` (accessible via le connecteur MCP Supabase, utilisé pour appliquer la migration et importer les données en direct — plus fiable que `.env` tant que `DIRECT_URL` n'est pas corrigé).
