Structure Prisma sur SQLite avec 8 modèles principaux : Exercice, Tag, Entrainement, EntrainementExercice (liaison), Echauffement, BlocEchauffement, SituationMatch, User. Les relations couvrent M:N via relations nommées (ExerciseTags, EntrainementTags, SituationMatchTags) et des FK directes (ex: EntrainementExercice.entrainementId/exerciceId). Les champs createdAt sont standardisés et quelques contraintes d’unicité existent (Tag[label,category], EntrainementExercice[entrainementId,exerciceId], User.email).

Diagramme ER (Mermaid) :
```mermaid
erDiagram
  Exercice {
    String id PK
    String nom
    String description
    String imageUrl?
    String schemaUrl?
    String materiel?
    String notes?
    String critereReussite?
    String variablesPlus
    String variablesMinus
    DateTime createdAt
  }
  Tag {
    String id PK
    String label
    String category
    String color?
    Int level?
    DateTime createdAt
  }
  Entrainement {
    String id PK
    String titre
    DateTime date?
    String imageUrl?
    DateTime createdAt
    String echauffementId?
    String situationMatchId?
  }
  EntrainementExercice {
    String id PK
    String entrainementId FK
    String exerciceId FK
    Int ordre
    Int duree?
    String notes?
    DateTime createdAt
  }
  Echauffement {
    String id PK
    String nom
    String description?
    String imageUrl?
    DateTime createdAt
  }
  BlocEchauffement {
    String id PK
    String echauffementId FK
    Int ordre
    String titre
    String repetitions?
    String temps?
    String informations?
    String fonctionnement?
    String notes?
    DateTime createdAt
  }
  SituationMatch {
    String id PK
    String nom?
    String type
    String description?
    String temps?
    String imageUrl?
    DateTime createdAt
  }
  User {
    String id PK
    String email UNIQUE
    String passwordHash
    String nom
    String prenom?
    String role
    Boolean isActive
    String iconUrl?
    DateTime createdAt
    DateTime updatedAt
  }

  Exercice }o--o{ Tag : ExerciseTags
  Entrainement }o--o{ Tag : EntrainementTags
  SituationMatch }o--o{ Tag : SituationMatchTags
  Entrainement ||--o{ EntrainementExercice : contient
  Exercice ||--o{ EntrainementExercice : est_utilise_dans
  Echauffement ||--o{ BlocEchauffement : compose
  Entrainement }o--|| Echauffement : optionnel
  Entrainement }o--|| SituationMatch : optionnel
```

Recommandations prioritaires :
- **Index FK**: ajouter `@@index([entrainementId])`, `@@index([exerciceId])`, `@@index([echauffementId])`, `@@index([situationMatchId])` pour optimiser les jointures et suppressions en cascade.
- **Index tri/filtre**: ajouter `@@index([createdAt])` sur les tables listées dans le dashboard et, si nécessaire, `@@index([ordre, echauffementId])` sur `BlocEchauffement`.
- **JSON natif (Postgres)**: si bascule vers Postgres, migrer `variablesPlus/Minus` en `Json`.
- **Seeds/migrations**: valider la cohérence des seeds (`seed.js`, `seed-tags.js`, `seed-auth.js`) avec le schéma actuel et archiver les anciennes migrations si obsolètes.

Commandes utiles :
- `npx prisma validate --schema .\backend\prisma\schema.prisma`
- `npx prisma migrate dev --name add_indexes --schema .\backend\prisma\schema.prisma`
- `npx prisma format --schema .\backend\prisma\schema.prisma`
`