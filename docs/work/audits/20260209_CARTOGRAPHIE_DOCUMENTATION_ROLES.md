# CARTOGRAPHIE DE LA DOCUMENTATION — RÔLES & PERMISSIONS

**Date d'analyse:** 9 février 2026  
**Analyste:** IA Architecte Senior  
**Périmètre:** Documentation rôles plateforme/workspace

---

## SYNTHÈSE EXÉCUTIVE

**Documents identifiés:** 7 documents principaux  
**Documents de référence:** 1 seul (ROLES_SPECIFICATION.md)  
**Documents obsolètes:** 3  
**Documents temporaires/WIP:** 3  

**Recommandation:** Archivage massif nécessaire. Un seul document fait foi.

---

## INVENTAIRE COMPLET

### 📂 Localisation: `docs/`

| Fichier | Taille | Dernière modif | Statut analysé |
|---------|--------|----------------|----------------|
| `GOUVERNANCE_ROLES_REFERENCE.md` | 12.9 KB | 5 fév 2026 | OBSOLÈTE |
| `ETAT_AVANCEMENT_ROLES.md` | 14.2 KB | 5 fév 2026 | OBSOLÈTE |
| `FRONTEND_PERMISSIONS_PATTERN.md` | 5.7 KB | 5 fév 2026 | OBSOLÈTE |
| `FRONTEND_ADAPTATION_STATUS.md` | 8.8 KB | 5 fév 2026 | OBSOLÈTE |

### 📂 Localisation: `docs/BASE/`

| Fichier | Taille | Dernière modif | Statut analysé |
|---------|--------|----------------|----------------|
| `ROLES_SPECIFICATION.md` | 6.4 KB | 9 fév 2026 | **RÉFÉRENCE UNIQUE** |

### 📂 Localisation: `docs/archive/`

| Fichier | Taille | Statut analysé |
|---------|--------|----------------|
| `CORRECTION_SERVICE_ROLE_KEY.md` | 2.6 KB | Archivé (hors périmètre) |
| `AUDIT_COMPLET_NAVIGATION.md` | 9.2 KB | Archivé (hors périmètre) |
| `RAPPORT_AUDIT_CACHE_COMPLET.md` | 14.5 KB | Archivé (hors périmètre) |
| `RAPPORT_AUDIT_COMPLET.md` | 24.0 KB | Archivé (hors périmètre) |

---

## ANALYSE DÉTAILLÉE PAR DOCUMENT

### 1. `GOUVERNANCE_ROLES_REFERENCE.md`

**Statut:** ❌ **OBSOLÈTE**

**Date:** 5 février 2026  
**Taille:** 12.9 KB (432 lignes)  
**Localisation:** `docs/`

#### Ce qu'il apporte
- Modèle conceptuel des rôles plateforme/workspace
- Distinction plateforme vs workspace
- Matrice des permissions
- État d'implémentation au 5 février 2026
- Rôles: ADMIN, USER, Testeur (plateforme) + MANAGER, MEMBER, VIEWER (workspace)
- Mapping legacy: OWNER→MANAGER, USER→MEMBER

#### Chevauchements
- **100% redondant avec** `ROLES_SPECIFICATION.md` (version 2.0, 9 février 2026)
- Même structure conceptuelle
- Même matrice de permissions
- Même règles BASE

#### Problèmes identifiés
- **Antérieur de 4 jours** à la version de référence
- Contient des **références à du code legacy** (OWNER, normalisation)
- Mentionne des **middlewares obsolètes** (`requireWorkspaceOwner`)
- État d'implémentation **périmé** (avant nettoyage du 9 février)

#### Décision
**À ARCHIVER**  
Raison: Remplacé par `ROLES_SPECIFICATION.md` qui reflète l'état post-nettoyage.

---

### 2. `ETAT_AVANCEMENT_ROLES.md`

**Statut:** ❌ **OBSOLÈTE**

**Date:** 5 février 2026  
**Taille:** 14.2 KB (467 lignes)  
**Localisation:** `docs/`

#### Ce qu'il apporte
- Suivi de progression par phase (1 à 5)
- État d'avancement détaillé au 5 février 2026
- 11 missions complètes (100%)
- Références aux fichiers modifiés avec numéros de lignes
- Checklist de validation

#### Chevauchements
- Aucun chevauchement direct avec `ROLES_SPECIFICATION.md`
- Complémentaire mais **temporel** (snapshot à une date donnée)

#### Problèmes identifiés
- **Document de suivi de projet**, pas de spécification
- Références à du **code qui a été modifié depuis** (9 février)
- Numéros de lignes **obsolètes**
- Mentionne des **éléments supprimés** (normalisation legacy, requireWorkspaceOwner)
- Statut "100% complété" **invalide** car nettoyage ultérieur a eu lieu

#### Décision
**À ARCHIVER**  
Raison: Document de travail historique. Valeur = traçabilité, pas référence technique.

---

### 3. `FRONTEND_PERMISSIONS_PATTERN.md`

**Statut:** ❌ **OBSOLÈTE**

**Date:** 5 février 2026  
**Taille:** 5.7 KB (261 lignes)  
**Localisation:** `docs/`

#### Ce qu'il apporte
- Guide technique d'implémentation frontend
- Patterns TypeScript/HTML pour adaptation des composants
- Exemples de code concrets
- Checklist d'adaptation
- Scénarios de test manuels

#### Chevauchements
- Aucun avec `ROLES_SPECIFICATION.md` (périmètres différents)
- Complémentaire mais **niveau implémentation**

#### Problèmes identifiés
- **Guide d'implémentation**, pas spécification de référence
- Mentionne **normalisation legacy** (OWNER→MANAGER, USER→MEMBER)
- Code obsolète depuis le nettoyage du 9 février
- Références à `PermissionsService` avec méthode `normalizeRole()` **supprimée**

#### Décision
**À ARCHIVER**  
Raison: Guide technique périmé. Le code a évolué depuis. Valeur historique uniquement.

---

### 4. `FRONTEND_ADAPTATION_STATUS.md`

**Statut:** ❌ **OBSOLÈTE**

**Date:** 5 février 2026  
**Taille:** 8.8 KB (272 lignes)  
**Localisation:** `docs/`

#### Ce qu'il apporte
- État d'avancement adaptation frontend
- Progression: 60% au 5 février 2026
- Liste des composants adaptés vs à adapter
- Détails par composant (exercices, entraînements, etc.)

#### Chevauchements
- Aucun avec `ROLES_SPECIFICATION.md`
- Complémentaire à `FRONTEND_PERMISSIONS_PATTERN.md`

#### Problèmes identifiés
- **Document de suivi temporel**
- Progression "60%" **obsolète** (travaux ultérieurs non reflétés)
- Mentionne `PermissionsService` avec **méthodes supprimées** (normalizeRole)
- Liste de composants "à adapter" potentiellement **déjà traités**

#### Décision
**À ARCHIVER**  
Raison: Snapshot temporel périmé. Pas de valeur de référence.

---

### 5. `ROLES_SPECIFICATION.md` ⭐

**Statut:** ✅ **RÉFÉRENCE UNIQUE ET VALIDE**

**Date:** 9 février 2026  
**Version:** 2.0 (après nettoyage legacy)  
**Taille:** 6.4 KB (210 lignes)  
**Localisation:** `docs/BASE/`

#### Ce qu'il apporte
- **Spécification officielle post-nettoyage**
- Rôles plateforme: ADMIN, USER
- Rôles workspace: MANAGER, MEMBER, VIEWER
- Matrice des permissions complète
- Règles spéciales (BASE, Testeurs)
- **Rôles obsolètes documentés** (OWNER, USER workspace)
- Implémentation technique (DB, Backend, Frontend)
- Exemples d'usage par scénario
- Historique des modifications (v1.0 → v2.0)

#### Chevauchements
- **Remplace complètement** `GOUVERNANCE_ROLES_REFERENCE.md`
- Aucun autre chevauchement (document unique)

#### Points forts
- ✅ **À jour** (9 février 2026, post-nettoyage)
- ✅ **Complet** (plateforme + workspace + exceptions)
- ✅ **Précis** (noms techniques uppercase, enum DB)
- ✅ **Structuré** (sections claires, tableaux, exemples)
- ✅ **Versionné** (v2.0 avec historique)
- ✅ **Localisation correcte** (`docs/BASE/` = références)

#### Décision
**CONSERVER COMME RÉFÉRENCE UNIQUE**  
Raison: Document officiel, à jour, complet, bien structuré.

---

### 6. Documents archivés (hors périmètre)

**Localisation:** `docs/archive/`

Les documents suivants sont déjà archivés et **hors périmètre** de cette analyse:
- `CORRECTION_SERVICE_ROLE_KEY.md` (authentification, pas rôles)
- `AUDIT_COMPLET_NAVIGATION.md` (navigation, pas rôles)
- `RAPPORT_AUDIT_CACHE_COMPLET.md` (cache, pas rôles)
- `RAPPORT_AUDIT_COMPLET.md` (audit général, pas rôles spécifiques)

**Décision:** Aucune action. Déjà archivés.

---

## CLASSIFICATION FINALE

### 🟢 RÉFÉRENCE OFFICIELLE (1 document)

| Document | Localisation | Statut | Action |
|----------|--------------|--------|--------|
| `ROLES_SPECIFICATION.md` | `docs/BASE/` | ✅ Valide | **CONSERVER** |

**Justification:**
- Seul document à jour (9 février 2026)
- Reflète l'état post-nettoyage legacy
- Complet et structuré
- Bien localisé (`docs/BASE/`)

---

### 🔴 OBSOLÈTES (4 documents)

| Document | Localisation | Raison obsolescence | Action |
|----------|--------------|---------------------|--------|
| `GOUVERNANCE_ROLES_REFERENCE.md` | `docs/` | Remplacé par ROLES_SPECIFICATION.md | **ARCHIVER** |
| `ETAT_AVANCEMENT_ROLES.md` | `docs/` | Suivi temporel périmé (5 fév) | **ARCHIVER** |
| `FRONTEND_PERMISSIONS_PATTERN.md` | `docs/` | Guide technique obsolète | **ARCHIVER** |
| `FRONTEND_ADAPTATION_STATUS.md` | `docs/` | Progression périmée (60%, 5 fév) | **ARCHIVER** |

**Justification commune:**
- Tous datés du 5 février 2026 (antérieurs au nettoyage)
- Contiennent références à code legacy supprimé
- Valeur = historique uniquement, pas référence

---

### ⚪ ARCHIVÉS (hors périmètre)

Déjà dans `docs/archive/`, aucune action nécessaire.

---

## INCOHÉRENCES DÉTECTÉES

### I1: Redondance totale GOUVERNANCE vs ROLES_SPECIFICATION
- **Nature:** Même contenu, versions différentes
- **Impact:** Confusion sur document de référence
- **Résolution:** Archiver GOUVERNANCE, conserver ROLES_SPECIFICATION

### I2: Références à code supprimé
- **Localisation:** Tous les documents du 5 février
- **Exemples:**
  - Fonction `normalizeWorkspaceRole()` (supprimée le 9 février)
  - Middleware `requireWorkspaceOwner` (supprimé le 9 février)
  - Rôles OWNER, USER (workspace) (supprimés le 9 février)
- **Impact:** Documentation trompeuse
- **Résolution:** Archivage des documents obsolètes

### I3: Numéros de lignes périmés
- **Localisation:** `ETAT_AVANCEMENT_ROLES.md`
- **Exemples:** 
  - "lignes 10-32" (middleware)
  - "lignes 530-544" (controller)
- **Impact:** Références invalides
- **Résolution:** Archivage du document

### I4: États de progression invalides
- **Localisation:** `ETAT_AVANCEMENT_ROLES.md`, `FRONTEND_ADAPTATION_STATUS.md`
- **Exemples:**
  - "100% complété" alors que nettoyage ultérieur
  - "60% complété" sans mise à jour
- **Impact:** Fausse impression de complétude
- **Résolution:** Archivage des documents

---

## PLAN D'ASSAINISSEMENT

### Étape 1: Archivage immédiat

**Déplacer vers `docs/archive/`:**
1. `GOUVERNANCE_ROLES_REFERENCE.md`
2. `ETAT_AVANCEMENT_ROLES.md`
3. `FRONTEND_PERMISSIONS_PATTERN.md`
4. `FRONTEND_ADAPTATION_STATUS.md`

**Commande:**
```bash
mv docs/GOUVERNANCE_ROLES_REFERENCE.md docs/archive/
mv docs/ETAT_AVANCEMENT_ROLES.md docs/archive/
mv docs/FRONTEND_PERMISSIONS_PATTERN.md docs/archive/
mv docs/FRONTEND_ADAPTATION_STATUS.md docs/archive/
```

---

### Étape 2: Validation référence unique

**Vérifier que `docs/BASE/ROLES_SPECIFICATION.md`:**
- ✅ Existe
- ✅ Est à jour (9 février 2026)
- ✅ Version 2.0
- ✅ Contient historique des modifications

**Aucune modification nécessaire.**

---

### Étape 3: Mise à jour index (si existant)

**Si `docs/README.md` ou index existe:**
- Supprimer références aux documents archivés
- Pointer uniquement vers `BASE/ROLES_SPECIFICATION.md`

---

## DOCUMENTATION FINALE

### Structure cible

```
docs/
├── BASE/
│   ├── ROLES_SPECIFICATION.md          ⭐ RÉFÉRENCE UNIQUE
│   ├── API_DOCUMENTATION_GUIDE.md
│   ├── AUTH_STATE_SPECIFICATION.md
│   ├── BACKEND_ERRORS_SPECIFICATION.md
│   ├── ENV_CONFIGURATION.md
│   ├── REFERENCE_GUIDE.md
│   ├── SECURITY.md
│   └── SUPABASE_CONFIGURATION.md
│
└── archive/
    ├── GOUVERNANCE_ROLES_REFERENCE.md   (archivé 9 fév 2026)
    ├── ETAT_AVANCEMENT_ROLES.md         (archivé 9 fév 2026)
    ├── FRONTEND_PERMISSIONS_PATTERN.md  (archivé 9 fév 2026)
    ├── FRONTEND_ADAPTATION_STATUS.md    (archivé 9 fév 2026)
    └── [autres documents archivés...]
```

---

## LISTE DE RÉFÉRENCE OFFICIELLE

### Documents qui font foi (rôles & permissions)

**1 seul document:**
- `docs/BASE/ROLES_SPECIFICATION.md` (v2.0, 9 février 2026)

**Périmètre couvert:**
- Rôles plateforme (ADMIN, USER)
- Rôles workspace (MANAGER, MEMBER, VIEWER)
- Matrice des permissions
- Règles spéciales (BASE, Testeurs)
- Implémentation technique
- Rôles obsolètes (OWNER, USER workspace)

---

## LISTE D'EXCLUSION DÉFINITIVE

### Documents à ne JAMAIS utiliser comme référence

**Obsolètes (à archiver):**
1. `GOUVERNANCE_ROLES_REFERENCE.md` — Remplacé par ROLES_SPECIFICATION.md
2. `ETAT_AVANCEMENT_ROLES.md` — Suivi temporel périmé
3. `FRONTEND_PERMISSIONS_PATTERN.md` — Guide technique obsolète
4. `FRONTEND_ADAPTATION_STATUS.md` — Progression périmée

**Raison commune:** Antérieurs au nettoyage legacy du 9 février 2026.

---

## RECOMMANDATIONS

### Immédiat
1. ✅ **Archiver les 4 documents obsolètes**
2. ✅ **Communiquer la référence unique** à l'équipe
3. ✅ **Mettre à jour tout index/README** pointant vers les anciens docs

### Court terme
1. Ajouter un fichier `docs/archive/README.md` expliquant pourquoi ces documents sont archivés
2. Créer un `docs/INDEX.md` listant clairement les documents de référence par thème

### Moyen terme
1. Établir une **politique de versioning** pour les documents de référence
2. Définir un **processus d'archivage** systématique lors de mises à jour majeures
3. Créer un **changelog** pour `ROLES_SPECIFICATION.md`

---

## CONCLUSION

**État actuel:** Documentation fragmentée avec redondances et obsolescence.

**État cible:** Un seul document de référence, clairement identifié, à jour.

**Action critique:** Archivage immédiat des 4 documents obsolètes.

**Bénéfice attendu:**
- Clarté totale sur la source de vérité
- Élimination des incohérences
- Réduction de la dette documentaire
- Facilitation de la maintenance future

---

**Rapport produit le:** 9 février 2026  
**Analyste:** IA Architecte Senior  
**Statut:** ✅ Analyse complète
