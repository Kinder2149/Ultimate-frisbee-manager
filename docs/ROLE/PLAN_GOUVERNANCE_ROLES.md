# PLAN D’ACTION — Gouvernance des rôles (Plateforme & Workspaces)

## 0. Statut et règles de ce document

- Ce document est un **plan d’action** (pas une implémentation).
- Il est construit en **continuité stricte avec l’existant**.
- Il ne contient :
  - aucun code,
  - aucune logique d’implémentation,
  - aucune permission fine (cela viendra ultérieurement).
- Toute affirmation sur l’existant est basée sur des éléments **observables** dans le projet (documents BASE et code), et doit pouvoir être vérifiée.

---

## 1. Rappel synthétique de la vision validée (sans la réécrire)

Référence unique : `docs/BASE/ROLES_ET_GOUVERNANCE.md`

- La gouvernance repose sur une séparation **plateforme** vs **workspaces (clubs)**.
- Rôles validés (noms français) :
  - **Plateforme** : Administrateur, Testeur
  - **Workspace** : Gestionnaire, Utilisateur
- Points clés explicitement validés :
  - L’Administrateur a l’autorité suprême et une vision globale.
  - Le Testeur voit tous les workspaces, agit uniquement sur ceux où il a des droits explicites, et ne modifie jamais la BASE.
  - Le Gestionnaire administre un workspace (dont les utilisateurs), sans visibilité globale.
  - L’Utilisateur gère ses contenus et son profil, sans gestion d’autres utilisateurs.

---

## 2. Base obligatoire (source de vérité consolidée)

Référence unique : `docs/BASE/ROLES_ET_GOUVERNANCE.md` (version consolidée)

Ce plan de missions est dérivé du référentiel ci-dessus, en particulier :

- la distinction **plateforme** vs **workspaces**,
- les rôles validés (Administrateur, Testeur, Gestionnaire, Utilisateur),
- l’**état réel du code** (rôles techniques observés `ADMIN/USER/OWNER/USER/VIEWER`, contrôles effectifs),
- les **écarts/zones non alignées** (Testeur non modélisé, `VIEWER` non gouverné, protection BASE non globale).

---

## 3. Plan de missions unique (checklist exécutable)

> Lecture :
> - Les missions sont **ordonnées**.
> - Chaque mission indique **objectif**, **périmètre**, **dépendances**, **livrables vérifiables**, **critères de fin**.
> - Les missions sont qualifiées : Audit / Décision / Sécurisation / Préparation à l’implémentation.

### Mission 1 — [AUDIT] Inventaire exhaustif des contrôles d’accès appliqués (backend)

- Objectif : disposer d’une liste exhaustive des points de contrôle réellement appliqués (auth, admin, workspace, owner) et de leur montage effectif.
- Périmètre : backend uniquement (routes + middlewares).
- Dépendances : aucune.
- Livrables vérifiables :
  - inventaire “Endpoint → middlewares/conditions exactes → preuves fichier:ligne”.
- Critères de fin :
  - chaque endpoint backend exposé est présent,
  - chaque condition d’accès citée est traçable par `fichier:ligne`.

### Mission 2 — [AUDIT] Inventaire des rôles techniques effectivement utilisés (écritures)

- Objectif : lister de manière exhaustive où des valeurs de rôles sont écrites dans le système (plateforme et workspace).
- Périmètre :
  - `User.role` (plateforme),
  - `WorkspaceUser.role` (workspace),
  - scripts et flux d’inscription/synchronisation.
- Dépendances : aucune.
- Livrables vérifiables :
  - liste “écriture de rôle → valeur → contexte → preuve fichier:ligne”.
- Critères de fin :
  - les valeurs observées et leurs sources sont exhaustives pour le code du repo.

### Mission 3 — [AUDIT] Audit des données réelles : valeurs présentes en base pour `WorkspaceUser.role`

- Objectif : confirmer les valeurs réellement présentes en base (incluant la présence/absence de `VIEWER`) et leur répartition par workspace.
- Périmètre : base de données (dev/staging selon procédure) sur `WorkspaceUser.role`.
- Dépendances : Mission 2.
- Livrables vérifiables :
  - rapport “valeurs distinctes + volumes + workspaces concernés”,
  - méthode et requêtes/exports utilisés (documentés).
- Critères de fin :
  - les valeurs et volumes sont établis de manière reproductible.

### Mission 4 — [AUDIT] Cartographie des opérations potentiellement “sensibles BASE”

- Objectif : identifier quelles opérations peuvent toucher des données lorsque le workspace actif est `BASE`, et sur quels flux (routes, scripts).
- Périmètre :
  - routes de mutation des entités scopées workspace,
  - opérations de duplication/import/export lorsqu’elles interagissent avec un workspace.
- Dépendances : Mission 1.
- Livrables vérifiables :
  - liste “opération → peut cibler BASE ? (oui/non/inconnu) → preuves fichier:ligne”.
- Critères de fin :
  - chaque mutation identifiée a un statut documenté vis-à-vis de BASE.

### Mission 5 — [DECISION] Décider du statut du rôle plateforme “Testeur” dans le modèle

- Objectif : trancher la question “Testeur non modélisé” à partir du référentiel, sans implémentation.
- Périmètre : gouvernance des rôles plateforme ; articulation attendue avec droits explicites workspace.
- Dépendances : Missions 1 et 2 (constats techniques) ; Mission 3 (si besoin de données réelles).
- Livrables vérifiables :
  - décision écrite et datée sur :
    - existence ou non d’un rôle plateforme Testeur dans le modèle,
    - périmètre de visibilité “voit tous les workspaces”,
    - statut vis-à-vis de BASE.
- Critères de fin :
  - aucune ambiguïté entre référentiel et décision ; décisions explicitement séparées des constats.

### Mission 6 — [DECISION] Décider de la liste officielle des rôles workspace et du traitement de `VIEWER`

- Objectif : trancher le fait qu’un rôle `VIEWER` est observé sans être gouverné.
- Périmètre : gouvernance des rôles workspace ; statut d’un rôle “lecture” (si retenu) ; compatibilité avec l’existant (données/scripts).
- Dépendances : Missions 2 et 3.
- Livrables vérifiables :
  - décision écrite et datée :
    - liste officielle des rôles workspace,
    - politique explicite pour les valeurs existantes non retenues.
- Critères de fin :
  - décisions compatibles avec la réalité mesurée (Mission 3) ou explicitement accompagnées d’un plan de transition (Mission 10).

### Mission 7 — [DECISION] Décider du périmètre exact “BASE modifiable” et des règles associées

- Objectif : rendre la règle “BASE à statut spécial” vérifiable en exigences (sans implémentation).
- Périmètre : définition “modifier BASE” (tags, contenus, membres, settings, duplication/import/export liés).
- Dépendances : Mission 4.
- Livrables vérifiables :
  - liste d’exigences de gouvernance BASE (interdits/autorisés) formulées sans solution technique.
- Critères de fin :
  - périmètre de BASE “modifiable/non modifiable” défini sans zone grise.

### Mission 8 — [SECURISATION] Définir un plan de tests de non-régression orienté gouvernance

- Objectif : disposer d’une checklist de tests permettant de vérifier que l’alignement rôles/BASE ne casse pas l’existant.
- Périmètre : tests fonctionnels API + parcours clés (auth, sélection workspace, admin, gestion membres, cas BASE).
- Dépendances : Missions 1, 6, 7.
- Livrables vérifiables :
  - checklist de tests (manuel), critères de réussite, jeux de données nécessaires.
- Critères de fin :
  - chaque exigence de gouvernance décidée a au moins un test associé.

### Mission 9 — [SECURISATION] Clarifier et figer la terminologie (libellés) vs source de vérité

- Objectif : éviter les ambiguïtés entre noms français (référentiel) et noms techniques (code/scripts).
- Périmètre : documentation et libellés ; pas d’implémentation.
- Dépendances : Missions 5 et 6.
- Livrables vérifiables :
  - décision écrite :
    - statut des noms français (libellés) vs noms techniques (source de vérité),
    - règles de documentation à appliquer.
- Critères de fin :
  - terminologie stable, non ambiguë, réutilisable dans les spécifications.

### Mission 10 — [PRÉPARATION À L’IMPLÉMENTATION] Plan de transition / migration contrôlée

- Objectif : préparer les étapes de transition nécessaires si les décisions (Testeur, rôles workspace, BASE) impliquent une évolution des données/contrôles.
- Périmètre : séquence conceptuelle (étapes, validations, rollback), sans code.
- Dépendances : Missions 3, 5, 6, 7, 8.
- Livrables vérifiables :
  - plan de transition “zéro surprise” :
    - étapes ordonnées,
    - conditions de passage,
    - stratégie de rollback,
    - critères de succès.
- Critères de fin :
  - plan utilisable comme checklist d’exécution sans présumer des choix techniques.

---

## 4. Pré-requis avant implémentation

Avant toute implémentation liée aux rôles, les conditions suivantes doivent être satisfaites :

1. Les constats d’audit sont complets et vérifiables (Missions 1 à 4).
2. Les décisions de gouvernance sont actées par écrit, datées, et séparées des constats (Missions 5 à 7, 9).
3. Un plan de tests de non-régression gouvernance est prêt et validé (Mission 8).
4. Un plan de transition/migration contrôlée existe si nécessaire (Mission 10).
