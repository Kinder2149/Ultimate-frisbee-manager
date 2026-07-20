# PLAN DE RESTRUCTURATION DOCUMENTATION

**Date:** 9 février 2026  
**Objectif:** Organisation documentaire claire et pérenne  
**Principe:** Séparation stricte entre références, travaux en cours et historique

---

## 1. ARBORESCENCE CIBLE

### Vue d'ensemble

```
docs/
├── reference/          ⭐ Documents contractuels validés
├── work/               🔧 Documents de travail en cours
├── history/            📦 Archive historique (lecture seule)
└── _meta/              📋 Métadonnées et index
```

---

## 2. DÉFINITION DES DOSSIERS

### 2.1 `/docs/reference/` ⭐

**Rôle:**  
Contient **uniquement** les documents de spécification validés, contractuels et à jour.  
Ces documents font **foi** et sont la source de vérité unique.

**Caractéristiques:**
- Documents **gelés** (modification = nouvelle version)
- **Versionning obligatoire** (v1.0, v2.0, etc.)
- **Date de validation** explicite
- **Revue technique** requise avant ajout
- **Aucun document temporaire** autorisé

**Règles d'entrée:**
- ✅ Document validé par revue technique
- ✅ Contenu stable et complet
- ✅ Versioning en place
- ✅ Pas de redondance avec documents existants
- ✅ Périmètre clairement défini

**Règles de sortie:**
- Document obsolète → déplacé vers `/history/` avec raison
- Document remplacé → ancienne version vers `/history/`
- Document incomplet → déplacé vers `/work/`

**Interdictions:**
- ❌ Documents "work in progress"
- ❌ Documents de suivi de projet
- ❌ Guides d'implémentation temporaires
- ❌ États d'avancement
- ❌ Rapports d'audit ponctuels
- ❌ Documents sans version

**Sous-structure recommandée:**
```
reference/
├── architecture/       (Specs architecture globale)
├── api/               (Specs API et contrats)
├── security/          (Specs sécurité et authentification)
├── features/          (Specs fonctionnelles par domaine)
└── data/              (Modèles de données, schémas)
```

---

### 2.2 `/docs/work/` 🔧

**Rôle:**  
Espace de travail pour documents en cours de rédaction, audits en cours, analyses temporaires.  
Documents **non contractuels**, **modifiables**, destinés à devenir des références ou à être archivés.

**Caractéristiques:**
- Documents **modifiables** librement
- **Pas de versioning** requis
- **Durée de vie limitée** (max 3 mois recommandé)
- **Revue périodique** (mensuelle)
- Peut contenir des **brouillons**, **analyses**, **audits**

**Règles d'entrée:**
- ✅ Tout document non finalisé
- ✅ Audits en cours
- ✅ Analyses ponctuelles
- ✅ Guides d'implémentation temporaires
- ✅ États d'avancement de projets
- ✅ Rapports de mission

**Règles de sortie:**
- Document finalisé et validé → `/reference/`
- Document obsolète ou mission terminée → `/history/`
- Document abandonné → suppression ou `/history/`

**Obligations:**
- ✅ Préfixe de date recommandé (YYYYMMDD_NOM.md)
- ✅ Statut explicite en en-tête (DRAFT, IN_REVIEW, etc.)
- ✅ Auteur et date de création
- ✅ Revue mensuelle obligatoire

**Interdictions:**
- ❌ Documents de plus de 6 mois sans revue
- ❌ Documents validés (doivent aller en `/reference/`)

**Sous-structure recommandée:**
```
work/
├── audits/            (Audits en cours)
├── analyses/          (Analyses ponctuelles)
├── migrations/        (Plans de migration)
└── drafts/            (Brouillons de specs)
```

---

### 2.3 `/docs/history/` 📦

**Rôle:**  
Archive **en lecture seule** des documents obsolètes, remplacés ou historiques.  
Conserve la **traçabilité** et l'**historique des décisions**.

**Caractéristiques:**
- Documents **en lecture seule** (aucune modification)
- **Horodatage** de l'archivage obligatoire
- **Raison de l'archivage** documentée
- **Indexation** par date et thème
- Peut être **nettoyé** après 2 ans (selon politique)

**Règles d'entrée:**
- ✅ Document obsolète (remplacé par version plus récente)
- ✅ Document de travail terminé (mission accomplie)
- ✅ Document périmé (contenu dépassé)
- ✅ Ancienne version de document de référence

**Règles de sortie:**
- Suppression définitive après 2 ans (optionnel, selon politique)
- Aucune sortie vers `/reference/` ou `/work/`

**Obligations:**
- ✅ Fichier `_ARCHIVED_YYYY-MM-DD.txt` à côté du document
- ✅ Raison de l'archivage dans le fichier
- ✅ Référence au document de remplacement (si applicable)

**Interdictions:**
- ❌ Modification des documents archivés
- ❌ Ajout de documents actifs

**Sous-structure recommandée:**
```
history/
├── 2026/
│   ├── 01-janvier/
│   ├── 02-fevrier/
│   └── ...
├── 2025/
└── _INDEX.md          (Index des documents archivés)
```

---

### 2.4 `/docs/_meta/` 📋

**Rôle:**  
Métadonnées, index, guides de contribution, templates.  
Documents **sur** la documentation elle-même.

**Contenu:**
- `INDEX.md` — Index général de toute la documentation
- `CONTRIBUTING.md` — Guide de contribution
- `TEMPLATES/` — Templates de documents
- `CHANGELOG.md` — Historique des changements structurels
- `README.md` — Guide d'utilisation de la documentation

**Caractéristiques:**
- Documents **métadocumentaires**
- **Maintenus activement**
- **Pas de versioning** (sauf CHANGELOG)

---

## 3. RÈGLES TRANSVERSES

### 3.1 Nommage des fichiers

**Format obligatoire:**
- Documents de référence: `NOM_DOMAINE_SPECIFICATION.md`
- Documents de travail: `YYYYMMDD_NOM_DESCRIPTIF.md`
- Documents archivés: conservent leur nom original

**Exemples:**
- ✅ `ROLES_SPECIFICATION.md` (référence)
- ✅ `20260209_AUDIT_COHERENCE_ROLES.md` (work)
- ✅ `API_AUTHENTICATION_SPECIFICATION.md` (référence)

**Interdictions:**
- ❌ Espaces dans les noms
- ❌ Caractères spéciaux (sauf `-` et `_`)
- ❌ Noms génériques (`doc.md`, `notes.md`)

---

### 3.2 En-tête obligatoire

**Tous les documents doivent avoir:**

```markdown
# TITRE DU DOCUMENT

**Statut:** [REFERENCE | WORK | ARCHIVED]  
**Version:** [si REFERENCE]  
**Date:** [création ou validation]  
**Auteur:** [optionnel]  
**Remplace:** [si applicable]

---
```

---

### 3.3 Processus de validation

**Pour passer de `/work/` à `/reference/`:**

1. ✅ Document complet et stable
2. ✅ Revue technique effectuée
3. ✅ Versioning ajouté (v1.0)
4. ✅ En-tête mis à jour (statut REFERENCE)
5. ✅ Déplacement vers `/reference/`
6. ✅ Mise à jour de `/meta/INDEX.md`

---

### 3.4 Processus d'archivage

**Pour déplacer vers `/history/`:**

1. ✅ Créer fichier `_ARCHIVED_YYYY-MM-DD.txt` avec raison
2. ✅ Déplacer vers `/history/YYYY/MM-mois/`
3. ✅ Mettre à jour `/meta/INDEX.md`
4. ✅ Supprimer de l'index actif

---

## 4. MAPPING DES DOCUMENTS EXISTANTS

### 4.1 Destination: `/docs/reference/`

**Documents à déplacer:**

| Document actuel | Nouvelle localisation | Justification |
|-----------------|----------------------|---------------|
| `BASE/ROLES_SPECIFICATION.md` | `reference/features/ROLES_SPECIFICATION.md` | ⭐ Référence unique validée (v2.0) |
| `BASE/API_DOCUMENTATION_GUIDE.md` | `reference/api/API_DOCUMENTATION_GUIDE.md` | Spécification API validée |
| `BASE/AUTH_STATE_SPECIFICATION.md` | `reference/security/AUTH_STATE_SPECIFICATION.md` | Spécification auth validée |
| `BASE/BACKEND_ERRORS_SPECIFICATION.md` | `reference/api/BACKEND_ERRORS_SPECIFICATION.md` | Spécification erreurs validée |
| `BASE/ENV_CONFIGURATION.md` | `reference/architecture/ENV_CONFIGURATION.md` | Configuration validée |
| `BASE/REFERENCE_GUIDE.md` | `reference/REFERENCE_GUIDE.md` | Guide général validé |
| `BASE/SECURITY.md` | `reference/security/SECURITY.md` | Spécification sécurité validée |
| `BASE/SUPABASE_CONFIGURATION.md` | `reference/architecture/SUPABASE_CONFIGURATION.md` | Configuration validée |

**Total:** 8 documents

---

### 4.2 Destination: `/docs/work/`

**Documents à déplacer:**

| Document actuel | Nouvelle localisation | Justification |
|-----------------|----------------------|---------------|
| `CARTOGRAPHIE_DOCUMENTATION_ROLES.md` | `work/audits/20260209_CARTOGRAPHIE_DOCUMENTATION_ROLES.md` | Audit ponctuel (9 fév 2026) |

**Total:** 1 document

---

### 4.3 Destination: `/docs/history/`

**Documents à archiver:**

| Document actuel | Nouvelle localisation | Raison archivage |
|-----------------|----------------------|------------------|
| `GOUVERNANCE_ROLES_REFERENCE.md` | `history/2026/02-fevrier/GOUVERNANCE_ROLES_REFERENCE.md` | Remplacé par ROLES_SPECIFICATION.md v2.0 |
| `ETAT_AVANCEMENT_ROLES.md` | `history/2026/02-fevrier/ETAT_AVANCEMENT_ROLES.md` | Suivi temporel périmé (5 fév 2026) |
| `FRONTEND_PERMISSIONS_PATTERN.md` | `history/2026/02-fevrier/FRONTEND_PERMISSIONS_PATTERN.md` | Guide technique obsolète |
| `FRONTEND_ADAPTATION_STATUS.md` | `history/2026/02-fevrier/FRONTEND_ADAPTATION_STATUS.md` | Progression périmée |
| `archive/*` (25 fichiers) | `history/2026/01-janvier/` et `history/2025/` | Déjà archivés, réorganisation |

**Total:** 29 documents (4 nouveaux + 25 existants)

---

### 4.4 À supprimer

**Aucun document à supprimer.**  
Tous les documents ont une valeur historique ou de référence.

---

### 4.5 À geler (lecture seule)

**Documents en `/reference/`:**
- Tous les 8 documents déplacés vers `/reference/`
- Modification = création nouvelle version

---

## 5. PLAN D'EXÉCUTION

### Phase 1: Création de l'arborescence

```bash
# Créer les nouveaux dossiers
mkdir -p docs/reference/architecture
mkdir -p docs/reference/api
mkdir -p docs/reference/security
mkdir -p docs/reference/features
mkdir -p docs/work/audits
mkdir -p docs/work/analyses
mkdir -p docs/work/migrations
mkdir -p docs/work/drafts
mkdir -p docs/history/2026/02-fevrier
mkdir -p docs/history/2026/01-janvier
mkdir -p docs/history/2025
mkdir -p docs/_meta/templates
```

---

### Phase 2: Déplacement vers `/reference/`

```bash
# Déplacer les documents de référence
mv docs/BASE/ROLES_SPECIFICATION.md docs/reference/features/
mv docs/BASE/API_DOCUMENTATION_GUIDE.md docs/reference/api/
mv docs/BASE/AUTH_STATE_SPECIFICATION.md docs/reference/security/
mv docs/BASE/BACKEND_ERRORS_SPECIFICATION.md docs/reference/api/
mv docs/BASE/ENV_CONFIGURATION.md docs/reference/architecture/
mv docs/BASE/REFERENCE_GUIDE.md docs/reference/
mv docs/BASE/SECURITY.md docs/reference/security/
mv docs/BASE/SUPABASE_CONFIGURATION.md docs/reference/architecture/

# Supprimer le dossier BASE vide
rmdir docs/BASE
```

---

### Phase 3: Déplacement vers `/work/`

```bash
# Renommer et déplacer l'audit
mv docs/CARTOGRAPHIE_DOCUMENTATION_ROLES.md docs/work/audits/20260209_CARTOGRAPHIE_DOCUMENTATION_ROLES.md
```

---

### Phase 4: Archivage vers `/history/`

```bash
# Archiver les documents obsolètes (février 2026)
mv docs/GOUVERNANCE_ROLES_REFERENCE.md docs/history/2026/02-fevrier/
mv docs/ETAT_AVANCEMENT_ROLES.md docs/history/2026/02-fevrier/
mv docs/FRONTEND_PERMISSIONS_PATTERN.md docs/history/2026/02-fevrier/
mv docs/FRONTEND_ADAPTATION_STATUS.md docs/history/2026/02-fevrier/

# Créer les fichiers d'archivage
echo "Archivé le: 2026-02-09
Raison: Remplacé par /reference/features/ROLES_SPECIFICATION.md v2.0
Voir: CARTOGRAPHIE_DOCUMENTATION_ROLES.md pour détails" > docs/history/2026/02-fevrier/_ARCHIVED_2026-02-09.txt

# Réorganiser l'archive existante
mv docs/archive/* docs/history/2026/01-janvier/
rmdir docs/archive
```

---

### Phase 5: Création des métadonnées

```bash
# Créer les fichiers méta
touch docs/_meta/INDEX.md
touch docs/_meta/CONTRIBUTING.md
touch docs/_meta/CHANGELOG.md
touch docs/_meta/README.md
```

---

### Phase 6: Création de l'index

**Contenu de `docs/_meta/INDEX.md`:**

```markdown
# INDEX DE LA DOCUMENTATION

**Dernière mise à jour:** 9 février 2026

## Documents de référence (contractuels)

### Architecture
- [ENV_CONFIGURATION.md](../reference/architecture/ENV_CONFIGURATION.md)
- [SUPABASE_CONFIGURATION.md](../reference/architecture/SUPABASE_CONFIGURATION.md)

### API
- [API_DOCUMENTATION_GUIDE.md](../reference/api/API_DOCUMENTATION_GUIDE.md)
- [BACKEND_ERRORS_SPECIFICATION.md](../reference/api/BACKEND_ERRORS_SPECIFICATION.md)

### Sécurité
- [AUTH_STATE_SPECIFICATION.md](../reference/security/AUTH_STATE_SPECIFICATION.md)
- [SECURITY.md](../reference/security/SECURITY.md)

### Fonctionnalités
- [ROLES_SPECIFICATION.md](../reference/features/ROLES_SPECIFICATION.md) ⭐ v2.0

### Général
- [REFERENCE_GUIDE.md](../reference/REFERENCE_GUIDE.md)

## Documents de travail

### Audits
- [20260209_CARTOGRAPHIE_DOCUMENTATION_ROLES.md](../work/audits/20260209_CARTOGRAPHIE_DOCUMENTATION_ROLES.md)

## Archive

Voir [/history/](../history/) pour les documents archivés.
```

---

## 6. STRUCTURE FINALE

```
docs/
│
├── reference/                    ⭐ 8 documents validés
│   ├── architecture/
│   │   ├── ENV_CONFIGURATION.md
│   │   └── SUPABASE_CONFIGURATION.md
│   ├── api/
│   │   ├── API_DOCUMENTATION_GUIDE.md
│   │   └── BACKEND_ERRORS_SPECIFICATION.md
│   ├── security/
│   │   ├── AUTH_STATE_SPECIFICATION.md
│   │   └── SECURITY.md
│   ├── features/
│   │   └── ROLES_SPECIFICATION.md        ⭐ v2.0
│   └── REFERENCE_GUIDE.md
│
├── work/                         🔧 1 document actif
│   ├── audits/
│   │   └── 20260209_CARTOGRAPHIE_DOCUMENTATION_ROLES.md
│   ├── analyses/
│   ├── migrations/
│   └── drafts/
│
├── history/                      📦 29 documents archivés
│   ├── 2026/
│   │   ├── 02-fevrier/
│   │   │   ├── GOUVERNANCE_ROLES_REFERENCE.md
│   │   │   ├── ETAT_AVANCEMENT_ROLES.md
│   │   │   ├── FRONTEND_PERMISSIONS_PATTERN.md
│   │   │   ├── FRONTEND_ADAPTATION_STATUS.md
│   │   │   └── _ARCHIVED_2026-02-09.txt
│   │   └── 01-janvier/
│   │       └── [25 documents de l'ancienne archive/]
│   └── _INDEX.md
│
└── _meta/                        📋 Métadonnées
    ├── INDEX.md
    ├── CONTRIBUTING.md
    ├── CHANGELOG.md
    ├── README.md
    └── templates/
```

---

## 7. RÈGLES DE GOUVERNANCE

### 7.1 Revue mensuelle obligatoire

**Responsable:** Tech Lead ou Architecte

**Actions:**
1. Vérifier `/work/` — archiver documents terminés
2. Vérifier `/reference/` — identifier documents à mettre à jour
3. Vérifier `/history/` — nettoyer si > 2 ans (optionnel)
4. Mettre à jour `/meta/INDEX.md`

---

### 7.2 Processus de création de document

**Nouveau document:**
1. Créer dans `/work/` avec préfixe date
2. Ajouter en-tête avec statut DRAFT
3. Travailler librement
4. Quand finalisé → revue technique
5. Si validé → déplacer vers `/reference/` avec version
6. Mettre à jour INDEX

---

### 7.3 Processus de mise à jour de référence

**Modification d'un document en `/reference/`:**
1. Copier vers `/work/` avec nouveau nom
2. Modifier la copie
3. Revue technique
4. Si validé → incrémenter version
5. Ancienne version → `/history/`
6. Nouvelle version → `/reference/`
7. Mettre à jour INDEX

---

## 8. BÉNÉFICES ATTENDUS

### Avant restructuration
- ❌ Documents éparpillés (racine + BASE + archive)
- ❌ Confusion sur documents de référence
- ❌ Redondances (GOUVERNANCE vs ROLES_SPECIFICATION)
- ❌ Pas de distinction travail/référence
- ❌ Archive non organisée

### Après restructuration
- ✅ Séparation claire référence/travail/historique
- ✅ Un seul document de référence par sujet
- ✅ Traçabilité complète (history)
- ✅ Processus de validation explicite
- ✅ Maintenance facilitée
- ✅ Onboarding simplifié (INDEX clair)

---

## 9. CHECKLIST D'EXÉCUTION

### Préparation
- [ ] Backup complet de `/docs/` avant modification
- [ ] Validation du plan par l'équipe
- [ ] Création d'une branche Git dédiée

### Exécution
- [ ] Phase 1: Création arborescence
- [ ] Phase 2: Déplacement `/reference/`
- [ ] Phase 3: Déplacement `/work/`
- [ ] Phase 4: Archivage `/history/`
- [ ] Phase 5: Création métadonnées
- [ ] Phase 6: Création INDEX

### Validation
- [ ] Vérifier tous les liens internes
- [ ] Vérifier structure finale
- [ ] Tester accès à tous les documents
- [ ] Commit et push

### Communication
- [ ] Annoncer nouvelle structure à l'équipe
- [ ] Partager `/meta/INDEX.md`
- [ ] Former sur processus de contribution

---

## 10. MAINTENANCE FUTURE

### Hebdomadaire
- Vérifier nouveaux documents dans `/work/`
- Identifier documents à finaliser

### Mensuelle
- Revue complète `/work/`
- Archivage documents terminés
- Mise à jour INDEX

### Trimestrielle
- Audit complet de la documentation
- Identification documents à mettre à jour
- Nettoyage `/history/` si nécessaire

---

**Plan produit le:** 9 février 2026  
**Statut:** ✅ Prêt à exécution  
**Validation requise:** Oui (avant exécution)
