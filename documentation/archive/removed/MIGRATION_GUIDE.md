# Guide de Migration et de Seeding de la Base de Données

Ce document décrit le processus à suivre pour gérer les migrations de la base de données Prisma et le seeding des données initiales. Suivre ce guide est essentiel pour maintenir la cohérence entre les environnements de développement (local) et de production.

## Principes Fondamentaux

1.  **Source de vérité** : Le fichier `prisma/schema.prisma` est l'unique source de vérité pour la structure de la base de données.
2.  **Migrations versionnées** : Toute modification du schéma DOIT être accompagnée d'un fichier de migration généré par Prisma. Ne modifiez jamais la base de données manuellement.
3.  **Seed idempotent** : Le script de seed (`prisma/seed.js`) est conçu pour être exécuté plusieurs fois sans créer de doublons ni d'erreurs. Il utilise des opérations `upsert`.

---

## Workflow en Développement (Local)

L'objectif en local est de pouvoir modifier le schéma et de tester rapidement.

**Quand ?** À chaque fois que vous modifiez le fichier `prisma/schema.prisma`.

**Commande à utiliser :**

```bash
npx prisma migrate dev --name <nom_descriptif_de_la_migration>
```

**Exemple :**

```bash
npx prisma migrate dev --name add_user_avatar
```

**Ce que cette commande fait :**

1.  Crée un nouveau fichier de migration SQL dans `prisma/migrations/`.
2.  Applique cette migration à votre base de données locale.
3.  Génère le client Prisma pour refléter les nouveaux changements.
4.  Exécute le script de seed (`prisma/seed.js`) si configuré.

> **Note** : Le nom de la migration doit être court et en anglais (par convention), par exemple `add_user_roles` ou `create_posts_table`.

---

## Workflow en Production

L'objectif en production est d'appliquer les migrations de manière sécurisée et contrôlée, sans jamais perdre de données.

**Quand ?** Lors d'un déploiement sur le serveur de production (ex: Render).

**Commande à utiliser :**

```bash
npx prisma migrate deploy
```

**Ce que cette commande fait :**

1.  Compare les migrations déjà appliquées en base avec les fichiers présents dans le dossier `prisma/migrations/`.
2.  Applique uniquement les migrations qui n'ont pas encore été exécutées, dans l'ordre chronologique.

> **Important** : Cette commande ne génère jamais de nouvelles migrations et ne modifie jamais votre schéma. Elle ne fait qu'appliquer des changements déjà versionnés et testés en local. C'est la commande à utiliser dans vos scripts de déploiement continu (CI/CD).

---

## Gestion du Seeding

Le script de seed est utilisé pour peupler la base avec des données essentielles (tags, compte admin, etc.).

-   **Exécution manuelle** : Pour exécuter le seed sans toucher aux migrations :

    ```bash
    npx prisma db seed
    ```

-   **Mode non destructif (par défaut)** : Le script ne supprime aucune donnée. Il se contente de créer ou de mettre à jour les données de base (tags, utilisateur admin).

-   **Mode destructif (pour le développement uniquement)** : Si vous avez besoin de repartir d'une base de données propre en local, vous pouvez activer le mode destructif. **NE JAMAIS UTILISER EN PRODUCTION.**

    ```bash
    SEED_DESTRUCTIVE=true npx prisma db seed
    ```

    Cela supprimera les exercices, les entraînements et les tags avant de les recréer.

---

## Résolution des Problèmes Courants

### Erreur : "Drift detected"

Cette erreur se produit lorsque le schéma de votre base de données ne correspond plus à l'historique de vos migrations. Cela arrive si vous avez modifié la base manuellement.

**Solution :**

1.  **Ne paniquez pas.** Ne supprimez rien manuellement.
2.  En local, la solution la plus simple est souvent de réinitialiser la base de développement :
    ```bash
    npx prisma migrate reset
    ```
3.  Si cela se produit en production, la situation est plus délicate. Contactez un administrateur de base de données. La meilleure prévention est de toujours suivre le workflow ci-dessus.

### Erreur : "The column ... does not exist"

Cela signifie que votre code utilise un champ qui n'existe pas dans la base de données. C'est généralement dû à l'oubli de lancer `npx prisma migrate deploy` en production après avoir ajouté une migration.
