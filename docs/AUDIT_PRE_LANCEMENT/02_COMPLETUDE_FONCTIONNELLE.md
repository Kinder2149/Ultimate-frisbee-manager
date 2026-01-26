# ✅ AUDIT COMPLÉTUDE FONCTIONNELLE

**Date** : 26 janvier 2026  
**Statut** : ⏳ En cours d'analyse

---

## 🎯 OBJECTIF

Vérifier que **chaque fonctionnalité est complète de bout en bout** :
- Toutes les actions CRUD sont implémentées
- Les workflows utilisateur sont complets
- Les cas limites sont gérés
- L'intégrité des données est assurée

---

## 📋 ENTITÉS DU SYSTÈME

### 1. 👤 UTILISATEURS (Users)

#### Modèle de Données
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  nom       String?
  prenom    String?
  role      UserRole @default(COACH)
  isActive  Boolean  @default(true)
  iconUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Fonctionnalités Attendues

| Action | Endpoint | Frontend | Backend | Statut |
|--------|----------|----------|---------|--------|
| **Inscription** | POST /api/auth/register | ❓ | ❓ | ⏳ À vérifier |
| **Connexion** | POST /api/auth/login | ✅ | ✅ | ⏳ À tester |
| **Déconnexion** | POST /api/auth/logout | ✅ | ✅ | ⏳ À tester |
| **Profil** | GET /api/auth/profile | ✅ | ✅ | ⏳ À tester |
| **Refresh token** | POST /api/auth/refresh | ✅ | ✅ | ⏳ À tester |
| **Modifier profil** | PUT /api/auth/profile | ❓ | ❓ | ⏳ À vérifier |
| **Changer mot de passe** | PUT /api/auth/password | ❓ | ❓ | ⏳ À vérifier |
| **Liste utilisateurs** (admin) | GET /api/admin/users | ❓ | ✅ | ⏳ À vérifier |
| **Activer/désactiver** (admin) | PUT /api/admin/users/:id | ❓ | ✅ | ⏳ À vérifier |

#### 🔍 Points à Vérifier
- [ ] **Inscription** : Existe-t-elle ou création manuelle uniquement ?
- [ ] **Gestion du profil** : L'utilisateur peut-il modifier ses infos ?
- [ ] **Changement de mot de passe** : Fonctionnalité implémentée ?
- [ ] **Rôles** : ADMIN vs COACH → différences fonctionnelles ?
- [ ] **Icône utilisateur** : Upload et affichage fonctionnels ?

---

### 2. 🏃 EXERCICES

#### Modèle de Données
```prisma
model Exercice {
  id                String   @id @default(uuid())
  titre             String
  description       String?
  objectif          String?
  consignes         String?
  variantes         String?
  materiel          String?
  dureeEstimee      Int?
  nombreJoueurs     String?
  niveauDifficulte  String?
  imageUrl          String?
  tags              Tag[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### Fonctionnalités CRUD

| Action | Endpoint | Frontend | Backend | Statut |
|--------|----------|----------|---------|--------|
| **Créer** | POST /api/exercices | ✅ | ✅ | ⏳ À tester |
| **Lire (liste)** | GET /api/exercices | ✅ | ✅ | ⏳ À tester |
| **Lire (détail)** | GET /api/exercices/:id | ✅ | ✅ | ⏳ À tester |
| **Modifier** | PUT /api/exercices/:id | ✅ | ✅ | ⏳ À tester |
| **Supprimer** | DELETE /api/exercices/:id | ✅ | ✅ | ⏳ À tester |
| **Upload image** | POST /api/exercices/:id/image | ✅ | ✅ | ⏳ À tester |
| **Filtrer par tags** | GET /api/exercices?tags=... | ✅ | ✅ | ⏳ À tester |
| **Recherche** | GET /api/exercices?search=... | ❓ | ❓ | ⏳ À vérifier |

#### 🔍 Points à Vérifier
- [ ] **Formulaire de création** : Tous les champs sont présents et fonctionnels ?
- [ ] **Validation** : Champs obligatoires respectés (titre minimum) ?
- [ ] **Upload d'image** : Fonctionne avec Cloudinary ?
- [ ] **Tags** : Ajout/suppression de tags fonctionne ?
- [ ] **Édition** : Tous les champs sont modifiables ?
- [ ] **Suppression** : Confirmation demandée ? Cascade sur les relations ?
- [ ] **Filtres** : Les filtres par tags fonctionnent correctement ?
- [ ] **Recherche textuelle** : Implémentée ?

#### Workflow Complet à Tester
1. Créer un exercice avec tous les champs remplis
2. Uploader une image
3. Ajouter des tags
4. Modifier l'exercice
5. Filtrer la liste par tags
6. Supprimer l'exercice

---

### 3. 🔥 ÉCHAUFFEMENTS

#### Modèle de Données
```prisma
model Echauffement {
  id          String   @id @default(uuid())
  titre       String
  description String?
  duree       Int?
  blocs       BlocEchauffement[]
  tags        Tag[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BlocEchauffement {
  id             String       @id @default(uuid())
  echauffementId String
  echauffement   Echauffement @relation(fields: [echauffementId], references: [id], onDelete: Cascade)
  titre          String
  description    String?
  duree          Int?
  ordre          Int
}
```

#### Fonctionnalités CRUD

| Action | Endpoint | Frontend | Backend | Statut |
|--------|----------|----------|---------|--------|
| **Créer** | POST /api/echauffements | ✅ | ✅ | ⏳ À tester |
| **Lire (liste)** | GET /api/echauffements | ✅ | ✅ | ⏳ À tester |
| **Lire (détail)** | GET /api/echauffements/:id | ✅ | ✅ | ⏳ À tester |
| **Modifier** | PUT /api/echauffements/:id | ✅ | ✅ | ⏳ À tester |
| **Supprimer** | DELETE /api/echauffements/:id | ✅ | ✅ | ⏳ À tester |
| **Ajouter bloc** | POST /api/echauffements/:id/blocs | ✅ | ✅ | ⏳ À tester |
| **Modifier bloc** | PUT /api/echauffements/:id/blocs/:blocId | ✅ | ✅ | ⏳ À tester |
| **Supprimer bloc** | DELETE /api/echauffements/:id/blocs/:blocId | ✅ | ✅ | ⏳ À tester |
| **Réordonner blocs** | PUT /api/echauffements/:id/blocs/reorder | ❓ | ❓ | ⏳ À vérifier |

#### 🔍 Points à Vérifier
- [ ] **Création avec blocs** : Peut-on créer un échauffement avec plusieurs blocs d'un coup ?
- [ ] **Gestion des blocs** : Ajout/modification/suppression de blocs fonctionne ?
- [ ] **Ordre des blocs** : Le champ `ordre` est-il respecté à l'affichage ?
- [ ] **Réorganisation** : Peut-on réordonner les blocs (drag & drop ou boutons) ?
- [ ] **Suppression en cascade** : Supprimer un échauffement supprime ses blocs ?
- [ ] **Durée totale** : Calculée automatiquement à partir des blocs ?

#### Workflow Complet à Tester
1. Créer un échauffement
2. Ajouter 3 blocs avec des ordres différents
3. Vérifier l'ordre d'affichage
4. Modifier un bloc
5. Supprimer un bloc
6. Réordonner les blocs (si fonctionnalité existe)
7. Supprimer l'échauffement

---

### 4. 🎯 SITUATIONS DE MATCH

#### Modèle de Données
```prisma
model SituationMatch {
  id          String   @id @default(uuid())
  titre       String
  description String?
  objectif    String?
  regles      String?
  variantes   String?
  duree       Int?
  nombreJoueurs String?
  tags        Tag[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Fonctionnalités CRUD

| Action | Endpoint | Frontend | Backend | Statut |
|--------|----------|----------|---------|--------|
| **Créer** | POST /api/situations-matchs | ✅ | ✅ | ⏳ À tester |
| **Lire (liste)** | GET /api/situations-matchs | ✅ | ✅ | ⏳ À tester |
| **Lire (détail)** | GET /api/situations-matchs/:id | ✅ | ✅ | ⏳ À tester |
| **Modifier** | PUT /api/situations-matchs/:id | ✅ | ✅ | ⏳ À tester |
| **Supprimer** | DELETE /api/situations-matchs/:id | ✅ | ✅ | ⏳ À tester |
| **Filtrer par tags** | GET /api/situations-matchs?tags=... | ✅ | ✅ | ⏳ À tester |

#### 🔍 Points à Vérifier
- [ ] **Similaire aux exercices** : Même logique CRUD ?
- [ ] **Champs spécifiques** : `regles` bien géré ?
- [ ] **Tags** : Fonctionnent comme pour les exercices ?

---

### 5. 📅 ENTRAÎNEMENTS

#### Modèle de Données
```prisma
model Entrainement {
  id          String   @id @default(uuid())
  titre       String
  description String?
  date        DateTime?
  duree       Int?
  lieu        String?
  objectifs   String?
  notes       String?
  exercices   EntrainementExercice[]
  tags        Tag[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model EntrainementExercice {
  id              String       @id @default(uuid())
  entrainementId  String
  entrainement    Entrainement @relation(fields: [entrainementId], references: [id], onDelete: Cascade)
  exerciceId      String?
  exercice        Exercice?    @relation(fields: [exerciceId], references: [id])
  echauffementId  String?
  echauffement    Echauffement? @relation(fields: [echauffementId], references: [id])
  situationMatchId String?
  situationMatch  SituationMatch? @relation(fields: [situationMatchId], references: [id])
  ordre           Int
  duree           Int?
  notes           String?
}
```

#### Fonctionnalités CRUD

| Action | Endpoint | Frontend | Backend | Statut |
|--------|----------|----------|---------|--------|
| **Créer** | POST /api/entrainements | ✅ | ✅ | ⏳ À tester |
| **Lire (liste)** | GET /api/entrainements | ✅ | ✅ | ⏳ À tester |
| **Lire (détail)** | GET /api/entrainements/:id | ✅ | ✅ | ⏳ À tester |
| **Modifier** | PUT /api/entrainements/:id | ✅ | ✅ | ⏳ À tester |
| **Supprimer** | DELETE /api/entrainements/:id | ✅ | ✅ | ⏳ À tester |
| **Ajouter exercice** | POST /api/entrainements/:id/exercices | ✅ | ✅ | ⏳ À tester |
| **Modifier exercice** | PUT /api/entrainements/:id/exercices/:exId | ✅ | ✅ | ⏳ À tester |
| **Supprimer exercice** | DELETE /api/entrainements/:id/exercices/:exId | ✅ | ✅ | ⏳ À tester |
| **Réordonner exercices** | PUT /api/entrainements/:id/exercices/reorder | ❓ | ❓ | ⏳ À vérifier |
| **Exporter** | GET /api/entrainements/:id/export | ✅ | ✅ | ⏳ À tester |

#### 🔍 Points à Vérifier
- [ ] **Composition** : Peut-on ajouter exercices, échauffements ET situations de match ?
- [ ] **Ordre** : Les éléments s'affichent dans le bon ordre ?
- [ ] **Durée totale** : Calculée automatiquement ?
- [ ] **Réorganisation** : Drag & drop ou boutons pour réordonner ?
- [ ] **Export** : Format JSON/Markdown fonctionnel ?
- [ ] **Suppression** : Que se passe-t-il si on supprime un exercice utilisé dans un entraînement ?

#### Workflow Complet à Tester
1. Créer un entraînement
2. Ajouter un échauffement (ordre 1)
3. Ajouter 2 exercices (ordre 2 et 3)
4. Ajouter une situation de match (ordre 4)
5. Vérifier l'ordre d'affichage
6. Modifier la durée d'un élément
7. Réordonner les éléments
8. Exporter l'entraînement
9. Supprimer un élément
10. Supprimer l'entraînement

---

### 6. 🏷️ TAGS

#### Modèle de Données
```prisma
model Tag {
  id          String   @id @default(uuid())
  nom         String   @unique
  categorie   String?
  exercices   Exercice[]
  echauffements Echauffement[]
  situationsMatchs SituationMatch[]
  entrainements Entrainement[]
  createdAt   DateTime @default(now())
}
```

#### Fonctionnalités

| Action | Endpoint | Frontend | Backend | Statut |
|--------|----------|----------|---------|--------|
| **Lire (liste)** | GET /api/tags | ✅ | ✅ | ⏳ À tester |
| **Créer** | POST /api/tags | ❓ | ❓ | ⏳ À vérifier |
| **Supprimer** | DELETE /api/tags/:id | ❓ | ❓ | ⏳ À vérifier |
| **Fusionner** | POST /api/tags/merge | ❓ | ❓ | ⏳ À vérifier |

#### 🔍 Points à Vérifier
- [ ] **Création automatique** : Les tags sont-ils créés automatiquement lors de l'ajout ?
- [ ] **Catégories** : Les tags sont-ils organisés par catégorie ?
- [ ] **Gestion manuelle** : Peut-on créer/supprimer des tags manuellement ?
- [ ] **Fusion** : Peut-on fusionner des tags similaires ?
- [ ] **Suppression** : Que se passe-t-il si on supprime un tag utilisé ?

---

## 🔄 WORKFLOWS TRANSVERSAUX

### Import/Export

| Fonctionnalité | Statut | Notes |
|----------------|--------|-------|
| **Export entraînement** (JSON) | ⏳ | Format UFM défini dans `shared/formats/` |
| **Export entraînement** (Markdown) | ⏳ | Pour impression/partage |
| **Import entraînement** | ❓ | À vérifier |
| **Export base complète** | ❓ | Backup de toutes les données |

### Recherche et Filtres

| Fonctionnalité | Statut | Notes |
|----------------|--------|-------|
| **Recherche textuelle** | ❓ | Sur titre/description |
| **Filtres par tags** | ✅ | Implémenté |
| **Filtres multiples** | ⏳ | Combinaison de tags |
| **Tri** (date, titre, durée) | ❓ | À vérifier |

### Gestion des Fichiers

| Fonctionnalité | Statut | Notes |
|----------------|--------|-------|
| **Upload image exercice** | ✅ | Via Cloudinary |
| **Upload icône utilisateur** | ❓ | À vérifier |
| **Suppression image** | ❓ | Nettoyage Cloudinary |
| **Optimisation images** | ⏳ | Resize automatique |

---

## 🚨 CAS LIMITES ET GESTION D'ERREURS

### Validation des Données

| Cas | Comportement Attendu | Statut |
|-----|----------------------|--------|
| **Champ obligatoire vide** | Message d'erreur clair | ⏳ |
| **Email invalide** | Validation côté front + back | ⏳ |
| **Durée négative** | Rejet ou conversion en 0 | ⏳ |
| **Ordre de blocs en doublon** | Réorganisation automatique | ⏳ |
| **Tag avec caractères spéciaux** | Normalisation ou rejet | ⏳ |

### Intégrité Référentielle

| Cas | Comportement Attendu | Statut |
|-----|----------------------|--------|
| **Supprimer exercice utilisé** | Cascade ou empêcher | ⏳ |
| **Supprimer tag utilisé** | Détacher ou empêcher | ⏳ |
| **Supprimer entraînement** | Cascade sur EntrainementExercice | ⏳ |
| **Supprimer échauffement** | Cascade sur BlocEchauffement | ⏳ |

### Gestion des Erreurs Réseau

| Cas | Comportement Attendu | Statut |
|-----|----------------------|--------|
| **API inaccessible** | Message d'erreur + retry | ⏳ |
| **Token expiré** | Refresh automatique | ✅ |
| **Upload échoué** | Message d'erreur + possibilité de réessayer | ⏳ |
| **Timeout** | Message d'erreur après X secondes | ⏳ |

---

## 🎯 CHECKLIST DE VÉRIFICATION

### Pour Chaque Entité (Exercices, Échauffements, etc.)

#### Création
- [ ] Formulaire accessible et clair
- [ ] Tous les champs présents
- [ ] Validation des champs obligatoires
- [ ] Messages d'erreur explicites
- [ ] Retour visuel après création (toast, redirection)
- [ ] Données bien enregistrées en DB

#### Lecture
- [ ] Liste affichée correctement
- [ ] Pagination si nécessaire
- [ ] Détail complet accessible
- [ ] Images chargées correctement
- [ ] Tags affichés
- [ ] Gestion du cas "aucun élément"

#### Modification
- [ ] Formulaire pré-rempli avec les données existantes
- [ ] Tous les champs modifiables
- [ ] Validation identique à la création
- [ ] Retour visuel après modification
- [ ] Données bien mises à jour en DB

#### Suppression
- [ ] Confirmation demandée
- [ ] Message clair sur les conséquences
- [ ] Suppression effective en DB
- [ ] Cascade sur les relations
- [ ] Retour visuel après suppression

---

## 📊 MATRICE DE COMPLÉTUDE

| Entité | Create | Read | Update | Delete | Relations | Filtres | Export | Score |
|--------|--------|------|--------|--------|-----------|---------|--------|-------|
| **Users** | ⏳ | ⏳ | ⏳ | ⏳ | N/A | N/A | N/A | 0/4 |
| **Exercices** | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A | 0/6 |
| **Échauffements** | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A | 0/6 |
| **Situations** | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | N/A | 0/6 |
| **Entraînements** | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | 0/7 |
| **Tags** | ⏳ | ⏳ | N/A | ⏳ | ⏳ | N/A | N/A | 0/4 |

**Légende** : ✅ Validé | ⚠️ Partiel | ❌ Manquant | ⏳ À tester

---

## 🎯 ACTIONS PRIORITAIRES

### 🔴 BLOQUANT
1. **Tester tous les CRUD de base**
   - Créer, lire, modifier, supprimer pour chaque entité
   - Vérifier que les données sont bien persistées

2. **Vérifier les relations**
   - Entraînements ↔ Exercices/Échauffements/Situations
   - Cascade de suppression

### 🟠 MAJEUR
3. **Tester les workflows complets**
   - Créer un entraînement complet de A à Z
   - Exporter et vérifier le format

4. **Valider la gestion d'erreurs**
   - Champs obligatoires
   - Validation des données
   - Messages d'erreur clairs

### 🟡 MINEUR
5. **Vérifier les fonctionnalités avancées**
   - Recherche textuelle
   - Tri et pagination
   - Fusion de tags

---

**Statut** : ⏳ Analyse en cours  
**Prochaine étape** : Auditer l'expérience utilisateur (UI/UX)
