# 🔧 AUDIT BACKEND API & BASE DE DONNÉES

**Date** : 26 janvier 2026  
**Statut** : ⏳ En cours d'analyse

---

## 🎯 OBJECTIF

Vérifier que le backend est **robuste et complet** :
- Tous les endpoints API documentés et fonctionnels
- Schéma de base de données cohérent
- Gestion des erreurs appropriée
- Performance des requêtes optimisée

---

## 🌐 ENDPOINTS API

### Authentification (`/api/auth`)

| Endpoint | Méthode | Auth | Fonction | Statut |
|----------|---------|------|----------|--------|
| `/auth/login` | POST | Non | Connexion utilisateur | ⏳ |
| `/auth/logout` | POST | Oui | Déconnexion | ⏳ |
| `/auth/profile` | GET | Oui | Récupérer profil | ⏳ |
| `/auth/refresh` | POST | Non | Refresh token | ⏳ |
| `/auth/register` | POST | Non | Inscription (?) | ❓ |
| `/auth/password` | PUT | Oui | Changer mot de passe (?) | ❓ |

#### Points de Vérification
- [ ] Login retourne access + refresh tokens
- [ ] Logout invalide le refresh token
- [ ] Profile retourne les infos utilisateur
- [ ] Refresh génère un nouveau access token
- [ ] Rate limiting sur login (5 tentatives / 15min)
- [ ] Validation des données (email, password)

#### Tests à Effectuer
```http
### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@ultimate.com",
  "password": "Ultim@t+"
}

### Profile
GET {{baseUrl}}/api/auth/profile
Authorization: Bearer {{token}}

### Refresh
POST {{baseUrl}}/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

---

### Exercices (`/api/exercices`)

| Endpoint | Méthode | Auth | Fonction | Statut |
|----------|---------|------|----------|--------|
| `/exercices` | GET | Oui | Liste des exercices | ⏳ |
| `/exercices` | POST | Oui | Créer un exercice | ⏳ |
| `/exercices/:id` | GET | Oui | Détail d'un exercice | ⏳ |
| `/exercices/:id` | PUT | Oui | Modifier un exercice | ⏳ |
| `/exercices/:id` | DELETE | Oui | Supprimer un exercice | ⏳ |
| `/exercices/:id/image` | POST | Oui | Upload image | ⏳ |
| `/exercices?tags=...` | GET | Oui | Filtrer par tags | ⏳ |
| `/exercices?search=...` | GET | Oui | Recherche textuelle | ❓ |

#### Paramètres de Requête
- `tags` : Filtrage par tags (comma-separated)
- `search` : Recherche textuelle (titre, description)
- `page` : Pagination (si implémentée)
- `limit` : Nombre de résultats par page

#### Points de Vérification
- [ ] GET retourne tous les exercices avec relations (tags)
- [ ] POST valide les données (titre obligatoire)
- [ ] PUT met à jour uniquement les champs fournis
- [ ] DELETE vérifie les relations (cascade ou empêcher)
- [ ] Upload image vers Cloudinary
- [ ] Filtres par tags fonctionnels
- [ ] Recherche textuelle implémentée

#### Tests à Effectuer
```http
### Liste
GET {{baseUrl}}/api/exercices
Authorization: Bearer {{token}}

### Créer
POST {{baseUrl}}/api/exercices
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "titre": "Test Exercice",
  "description": "Description test",
  "dureeEstimee": 15,
  "tags": ["Passes", "Débutant"]
}

### Détail
GET {{baseUrl}}/api/exercices/{{exerciceId}}
Authorization: Bearer {{token}}

### Modifier
PUT {{baseUrl}}/api/exercices/{{exerciceId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "titre": "Test Exercice Modifié"
}

### Supprimer
DELETE {{baseUrl}}/api/exercices/{{exerciceId}}
Authorization: Bearer {{token}}

### Filtrer
GET {{baseUrl}}/api/exercices?tags=Passes,Débutant
Authorization: Bearer {{token}}
```

---

### Échauffements (`/api/echauffements`)

| Endpoint | Méthode | Auth | Fonction | Statut |
|----------|---------|------|----------|--------|
| `/echauffements` | GET | Oui | Liste des échauffements | ⏳ |
| `/echauffements` | POST | Oui | Créer un échauffement | ⏳ |
| `/echauffements/:id` | GET | Oui | Détail d'un échauffement | ⏳ |
| `/echauffements/:id` | PUT | Oui | Modifier un échauffement | ⏳ |
| `/echauffements/:id` | DELETE | Oui | Supprimer un échauffement | ⏳ |
| `/echauffements/:id/blocs` | POST | Oui | Ajouter un bloc | ⏳ |
| `/echauffements/:id/blocs/:blocId` | PUT | Oui | Modifier un bloc | ⏳ |
| `/echauffements/:id/blocs/:blocId` | DELETE | Oui | Supprimer un bloc | ⏳ |

#### Points de Vérification
- [ ] GET inclut les blocs (relation)
- [ ] POST crée l'échauffement + blocs en une transaction
- [ ] Blocs ordonnés correctement (champ `ordre`)
- [ ] Suppression d'échauffement supprime les blocs (cascade)
- [ ] Validation de l'ordre des blocs

---

### Situations de Match (`/api/situations-matchs`)

| Endpoint | Méthode | Auth | Fonction | Statut |
|----------|---------|------|----------|--------|
| `/situations-matchs` | GET | Oui | Liste des situations | ⏳ |
| `/situations-matchs` | POST | Oui | Créer une situation | ⏳ |
| `/situations-matchs/:id` | GET | Oui | Détail d'une situation | ⏳ |
| `/situations-matchs/:id` | PUT | Oui | Modifier une situation | ⏳ |
| `/situations-matchs/:id` | DELETE | Oui | Supprimer une situation | ⏳ |

#### Points de Vérification
- [ ] Similaire aux exercices
- [ ] Champ `regles` bien géré
- [ ] Tags fonctionnels

---

### Entraînements (`/api/entrainements`)

| Endpoint | Méthode | Auth | Fonction | Statut |
|----------|---------|------|----------|--------|
| `/entrainements` | GET | Oui | Liste des entraînements | ⏳ |
| `/entrainements` | POST | Oui | Créer un entraînement | ⏳ |
| `/entrainements/:id` | GET | Oui | Détail d'un entraînement | ⏳ |
| `/entrainements/:id` | PUT | Oui | Modifier un entraînement | ⏳ |
| `/entrainements/:id` | DELETE | Oui | Supprimer un entraînement | ⏳ |
| `/entrainements/:id/exercices` | POST | Oui | Ajouter un exercice/échauffement/situation | ⏳ |
| `/entrainements/:id/exercices/:exId` | PUT | Oui | Modifier un élément | ⏳ |
| `/entrainements/:id/exercices/:exId` | DELETE | Oui | Supprimer un élément | ⏳ |
| `/entrainements/:id/export` | GET | Oui | Exporter (JSON/MD) | ⏳ |

#### Points de Vérification
- [ ] GET inclut les exercices/échauffements/situations (relations)
- [ ] Éléments ordonnés correctement
- [ ] Durées personnalisées sauvegardées
- [ ] Export JSON conforme au format UFM
- [ ] Export Markdown bien formaté
- [ ] Suppression en cascade des relations

---

### Tags (`/api/tags`)

| Endpoint | Méthode | Auth | Fonction | Statut |
|----------|---------|------|----------|--------|
| `/tags` | GET | Oui | Liste des tags | ⏳ |
| `/tags` | POST | Oui | Créer un tag | ❓ |
| `/tags/:id` | DELETE | Oui | Supprimer un tag | ❓ |

#### Points de Vérification
- [ ] GET retourne tous les tags avec catégories
- [ ] Création automatique lors de l'ajout à un exercice
- [ ] Suppression gère les relations (détacher ou empêcher)

---

### Admin (`/api/admin`)

| Endpoint | Méthode | Auth | Fonction | Statut |
|----------|---------|------|----------|--------|
| `/admin/users` | GET | Admin | Liste des utilisateurs | ⏳ |
| `/admin/users/:id` | PUT | Admin | Activer/désactiver | ⏳ |
| `/admin/users/:id` | DELETE | Admin | Supprimer utilisateur | ❓ |

#### Points de Vérification
- [ ] Middleware vérifie le rôle ADMIN
- [ ] Liste des utilisateurs accessible
- [ ] Activation/désactivation fonctionne
- [ ] Suppression gère les relations (exercices créés, etc.)

---

## 🗄️ SCHÉMA DE BASE DE DONNÉES

### Modèle Prisma

#### User
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

enum UserRole {
  ADMIN
  COACH
}
```

**Points de Vérification** :
- [ ] UUID utilisé (pas d'auto-increment)
- [ ] Email unique
- [ ] Password hashé (jamais en clair)
- [ ] Role avec enum
- [ ] Timestamps automatiques

---

#### Exercice
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
  tags              Tag[]    @relation("ExerciceToTag")
  entrainements     EntrainementExercice[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**Points de Vérification** :
- [ ] Titre obligatoire (non nullable)
- [ ] Durée en Int (minutes)
- [ ] Relation many-to-many avec Tag
- [ ] Relation avec EntrainementExercice

---

#### Echauffement
```prisma
model Echauffement {
  id          String             @id @default(uuid())
  titre       String
  description String?
  duree       Int?
  blocs       BlocEchauffement[]
  tags        Tag[]              @relation("EchauffementToTag")
  entrainements EntrainementExercice[]
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

model BlocEchauffement {
  id             String       @id @default(uuid())
  echauffementId String
  echauffement   Echauffement @relation(fields: [echauffementId], references: [id], onDelete: Cascade)
  titre          String
  description    String?
  duree          Int?
  ordre          Int
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

**Points de Vérification** :
- [ ] Relation one-to-many avec BlocEchauffement
- [ ] `onDelete: Cascade` sur les blocs
- [ ] Champ `ordre` pour le tri
- [ ] Durée totale calculée ou stockée ?

---

#### SituationMatch
```prisma
model SituationMatch {
  id            String   @id @default(uuid())
  titre         String
  description   String?
  objectif      String?
  regles        String?
  variantes     String?
  duree         Int?
  nombreJoueurs String?
  tags          Tag[]    @relation("SituationMatchToTag")
  entrainements EntrainementExercice[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Points de Vérification** :
- [ ] Structure similaire à Exercice
- [ ] Champ `regles` spécifique

---

#### Entrainement
```prisma
model Entrainement {
  id          String                 @id @default(uuid())
  titre       String
  description String?
  date        DateTime?
  duree       Int?
  lieu        String?
  objectifs   String?
  notes       String?
  exercices   EntrainementExercice[]
  tags        Tag[]                  @relation("EntrainementToTag")
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt
}

model EntrainementExercice {
  id              String          @id @default(uuid())
  entrainementId  String
  entrainement    Entrainement    @relation(fields: [entrainementId], references: [id], onDelete: Cascade)
  exerciceId      String?
  exercice        Exercice?       @relation(fields: [exerciceId], references: [id])
  echauffementId  String?
  echauffement    Echauffement?   @relation(fields: [echauffementId], references: [id])
  situationMatchId String?
  situationMatch  SituationMatch? @relation(fields: [situationMatchId], references: [id])
  ordre           Int
  duree           Int?
  notes           String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

**Points de Vérification** :
- [ ] Table de liaison avec 3 relations optionnelles
- [ ] Un seul des 3 IDs doit être rempli (validation ?)
- [ ] `onDelete: Cascade` sur entrainementId
- [ ] Que se passe-t-il si exercice/échauffement/situation supprimé ?
- [ ] Champ `ordre` pour le tri
- [ ] Durée personnalisable

---

#### Tag
```prisma
model Tag {
  id               String           @id @default(uuid())
  nom              String           @unique
  categorie        String?
  exercices        Exercice[]       @relation("ExerciceToTag")
  echauffements    Echauffement[]   @relation("EchauffementToTag")
  situationsMatchs SituationMatch[] @relation("SituationMatchToTag")
  entrainements    Entrainement[]   @relation("EntrainementToTag")
  createdAt        DateTime         @default(now())
}
```

**Points de Vérification** :
- [ ] Nom unique
- [ ] Catégorie pour regroupement
- [ ] Relations many-to-many avec toutes les entités

---

## 🔍 INTÉGRITÉ DES DONNÉES

### Contraintes

| Contrainte | Entité | Statut | Notes |
|------------|--------|--------|-------|
| **Email unique** | User | ✅ | `@unique` |
| **Tag nom unique** | Tag | ✅ | `@unique` |
| **Cascade Blocs** | BlocEchauffement | ✅ | `onDelete: Cascade` |
| **Cascade EntrainementExercice** | EntrainementExercice | ✅ | `onDelete: Cascade` |
| **Titre obligatoire** | Toutes | ✅ | Non nullable |

### Relations Problématiques

#### Suppression d'un Exercice utilisé dans un Entraînement
```prisma
exercice Exercice? @relation(fields: [exerciceId], references: [id])
```

**Problème** : Pas de `onDelete` défini → Comportement par défaut ?

**Options** :
1. `onDelete: Cascade` → Supprime la relation
2. `onDelete: SetNull` → Met exerciceId à NULL
3. `onDelete: Restrict` → Empêche la suppression

**À vérifier** : Quel comportement est implémenté ?

---

## ⚡ PERFORMANCE

### Requêtes N+1

#### Problème Potentiel
```javascript
// ❌ Mauvais : N+1 queries
const entrainements = await prisma.entrainement.findMany();
for (const e of entrainements) {
  const exercices = await prisma.entrainementExercice.findMany({
    where: { entrainementId: e.id }
  });
}

// ✅ Bon : 1 query avec include
const entrainements = await prisma.entrainement.findMany({
  include: {
    exercices: {
      include: {
        exercice: true,
        echauffement: true,
        situationMatch: true
      }
    },
    tags: true
  }
});
```

**À vérifier** : Les controllers utilisent-ils `include` ?

### Index

**Index recommandés** :
- [ ] `User.email` (déjà unique)
- [ ] `Tag.nom` (déjà unique)
- [ ] `EntrainementExercice.entrainementId`
- [ ] `EntrainementExercice.ordre`
- [ ] `BlocEchauffement.echauffementId`
- [ ] `BlocEchauffement.ordre`

### Pagination

**À vérifier** :
- [ ] Limite de résultats (ex: 100 max)
- [ ] Pagination implémentée (skip/take)
- [ ] Comptage total disponible

```javascript
const exercices = await prisma.exercice.findMany({
  skip: (page - 1) * limit,
  take: limit
});

const total = await prisma.exercice.count();
```

---

## 🛡️ GESTION DES ERREURS

### Middleware d'Erreurs

**À vérifier** :
- [ ] Middleware global de gestion d'erreurs
- [ ] Codes HTTP appropriés (400, 401, 403, 404, 500)
- [ ] Messages d'erreur clairs
- [ ] Stack traces en dev uniquement
- [ ] Logs des erreurs

### Erreurs Courantes

| Erreur | Code HTTP | Message | Statut |
|--------|-----------|---------|--------|
| **Validation échouée** | 400 | "Le titre est obligatoire" | ⏳ |
| **Non authentifié** | 401 | "Token invalide ou expiré" | ⏳ |
| **Non autorisé** | 403 | "Accès refusé" | ⏳ |
| **Ressource non trouvée** | 404 | "Exercice non trouvé" | ⏳ |
| **Conflit** | 409 | "Email déjà utilisé" | ⏳ |
| **Erreur serveur** | 500 | "Erreur interne" | ⏳ |

---

## 📝 VALIDATION DES DONNÉES

### Schémas Zod

**À vérifier** :
- [ ] Schéma pour chaque entité
- [ ] Validation des champs obligatoires
- [ ] Validation des types
- [ ] Validation des formats (email, URL)
- [ ] Validation des longueurs (min/max)

```javascript
// Exemple
const exerciceSchema = z.object({
  titre: z.string().min(1, "Le titre est obligatoire"),
  description: z.string().optional(),
  dureeEstimee: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional()
});
```

---

## 🎯 CHECKLIST BACKEND

### Endpoints
- [ ] Tous les endpoints documentés
- [ ] Tous les endpoints testés
- [ ] Authentification requise sur les routes protégées
- [ ] Validation des données sur tous les POST/PUT
- [ ] Gestion des erreurs appropriée

### Base de Données
- [ ] Schéma Prisma à jour
- [ ] Migrations appliquées en production
- [ ] Relations correctement définies
- [ ] Contraintes d'intégrité en place
- [ ] Index sur les champs fréquemment requêtés

### Performance
- [ ] Pas de requêtes N+1
- [ ] Pagination implémentée
- [ ] Limites de résultats
- [ ] Includes optimisés

### Sécurité
- [ ] Validation de toutes les entrées
- [ ] Sanitization des données
- [ ] Rate limiting sur endpoints sensibles
- [ ] Logs sans données sensibles

---

## 🎯 ACTIONS PRIORITAIRES

### 🔴 BLOQUANT

1. **Tester tous les endpoints CRUD**
   - Vérifier que chaque endpoint fonctionne
   - Valider les codes HTTP retournés
   - Tester avec des données valides et invalides

2. **Vérifier les relations DB**
   - Tester la suppression en cascade
   - Vérifier le comportement si exercice supprimé utilisé dans entraînement

### 🟠 MAJEUR

3. **Optimiser les requêtes**
   - Vérifier l'utilisation de `include`
   - Ajouter la pagination si manquante
   - Ajouter des index si nécessaire

4. **Améliorer la gestion d'erreurs**
   - Middleware global
   - Messages clairs
   - Logs structurés

### 🟡 MINEUR

5. **Documenter l'API**
   - Créer un fichier OpenAPI/Swagger
   - Ou documenter dans un README
   - Exemples de requêtes

---

**Statut** : ⏳ Analyse en cours  
**Prochaine étape** : Auditer le frontend Angular
