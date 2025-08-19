# Ultimate Frisbee Manager

Application web pour gérer une base d'exercices d'ultimate frisbee, permettant à un coach sportif d'organiser ses séances d'entraînement. Cette application permet de créer, stocker et gérer une bibliothèque d'exercices pour les entraînements d'ultimate frisbee.

## Architecture du projet

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: Angular 17+ avec système de composants réactifs et formulaires

## Prérequis

- Node.js (v14+)
- PostgreSQL (v12+)
- Angular CLI (dernière version)

## Structure du projet

```
ultimate-frisbee-manager/
├── backend/                # API REST avec Express et Prisma
│   ├── controllers/        # Contrôleurs pour la logique métier
│   ├── prisma/             # Schéma et migrations Prisma
│   ├── routes/             # Routes API organisées par domaine
│   ├── scripts/            # Scripts utilitaires et de migration
│   └── server.js           # Point d'entrée du backend
└── frontend/               # Application Angular 17+
    └── src/                # Code source Angular
        └── app/
            ├── core/       # Services et modèles partagés
            │   ├── models/ # Interfaces et modèles de données
            │   └── services/ # Services globaux
            ├── features/   # Fonctionnalités organisées par domaine
            │   ├── exercices/ # Feature d'exercices
            │   └── tags/      # Feature de gestion des tags
            └── shared/     # Composants et pipes partagés
```

## Installation

### Configuration de la base de données

1. Installez PostgreSQL si ce n'est pas déjà fait
2. Créez une base de données nommée `ultimate_frisbee_db`
3. Configurez les informations de connexion dans le fichier `backend/.env` :

```
DATABASE_URL="postgresql://username:password@localhost:5432/ultimate_frisbee_db?schema=public"
```

### Installation du Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### Lancement du Backend

```bash
cd backend
npm run dev
```

Le serveur démarrera sur http://localhost:3000

Pour exécuter le script de migration des tags (si nécessaire) :

```bash
cd backend
node scripts/migrate-tags.js
```

### Installation du Frontend

```bash
cd frontend
npm install
```

### Lancement du Frontend

```bash
cd frontend
ng serve
```

L'application sera accessible sur http://localhost:4200

## Fonctionnalités

- Création d'exercices d'ultimate frisbee via un formulaire
- Stockage des exercices en base de données
- Affichage des exercices existants
- Gestion avancée des tags par catégories (objectif, élément, variable, niveau)
- Sélection dynamique de tags pour les exercices
- Attribution de couleurs et niveaux aux tags

## Exemple d'exercice (format JSON)

```json
{
  "nom": "3v3 zone haute",
  "description": "Travail du bloc haut en zone",
  "objectif": "Tactique",
  "travailSpecifique": ["placement", "déclenchement", "appel"],
  "variables": ["nb joueurs", "taille de zone"],
  "niveau": ["Intermédiaire"],
  "temps": ["15-20 min"],
  "format": ["3vs3", "Small sided"],
  "schemaUrl": "https://monlien.fr/schema.png",
  "tagIds": ["id-tag-tactique", "id-tag-placement", "id-tag-declenchement", "id-tag-appel", "id-tag-nbjoueurs", "id-tag-taillezone", "id-tag-intermediaire", "id-tag-15-20min", "id-tag-3vs3", "id-tag-smallsided"]
}
```

## Système de gestion des tags

L'application dispose désormais d'un système complet de gestion des tags, permettant :

- La création et l'édition de tags par catégorie
- L'attribution de couleurs personnalisées
- Un système de niveau (étoiles) pour les tags de catégorie "niveau"
- La réutilisation des tags entre différents exercices

### Catégories de tags

1. **Objectif** : Défini l'objectif principal de l'exercice (Technique, Tactique, Physique, Mental)
2. **Travail Spécifique** : Décrit les compétences ou aspects travaillés dans l'exercice
3. **Variable** : Représente les paramètres qui peuvent être ajustés dans l'exercice
4. **Niveau** : Indique le niveau de difficulté ou de progression
5. **Temps** : Indique la durée approximative de l'exercice
6. **Format** : Précise le nombre de joueurs ou la configuration de l'exercice

### Migration depuis l'ancien système

Si vous utilisez déjà cette application et avez des exercices existants, consultez le [guide de migration](docs/MIGRATION.md) pour passer au nouveau système de tags.

## Architecture et refactorisation

L'application a été entièrement refactorisée pour suivre les principes d'architecture Angular modernes :

- **Architecture modulaire** : Organisation par fonctionnalités (features) pour une meilleure séparation des préoccupations
- **Core Module** : Services et modèles partagés centralisés
- **Composants réutilisables** : Extraction de composants communs dans des modules partagés
- **Gestion optimisée du state** : Services centralisés pour la gestion des données

### Mise à jour des catégories de tags

La catégorie "Élément travaillé" a été renommée en "Travail Spécifique" pour mieux refléter son usage. De plus, deux nouvelles catégories ont été ajoutées :

- **Temps** : Pour indiquer la durée estimée d'un exercice (ex: "5-10 min", "15-20 min", etc.)
- **Format** : Pour préciser le format de jeu ou le nombre de joueurs (ex: "3vs3", "Small sided", "7vs7", etc.)

Ces évolutions permettent une meilleure catégorisation et recherche des exercices.
