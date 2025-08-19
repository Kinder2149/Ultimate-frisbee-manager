# Documentation des Endpoints API - Ultimate Frisbee Manager

## Introduction

Ce document centralise la liste complète des endpoints API de l'application Ultimate Frisbee Manager, incluant les récentes améliorations et corrections. Il sert de référence pour garantir la cohérence entre frontend et backend.

## Structure des URLs

Toutes les URLs d'API suivent la structure de base suivante :
```
http://localhost:3001/api/{resource}/{id?}
```

Où :
- `{resource}` est la ressource concernée (entrainements, exercices, tags, etc.)
- `{id?}` est l'identifiant optionnel de la ressource pour les opérations CRUD spécifiques

## Endpoints API disponibles

### Entraînements Complets

| Méthode | Endpoint                       | Description                                          |
|---------|--------------------------------|------------------------------------------------------|
| GET     | `/api/entrainements`           | Récupère la liste des entraînements avec phases     |
| GET     | `/api/entrainements/{id}`      | Récupère un entraînement spécifique par son ID       |
| POST    | `/api/entrainements`           | Ajoute un nouvel entraînement avec phases           |
| PUT     | `/api/entrainements/{id}`      | Met à jour un entraînement existant                  |
| DELETE  | `/api/entrainements/{id}`      | Supprime un entraînement existant (cascade)          |
| POST    | `/api/entrainements/{id}/duplicate` | Duplique un entraînement complet avec phases    |

### Phases d'Entraînement

| Méthode | Endpoint                                           | Description                                    |
|---------|---------------------------------------------------|------------------------------------------------|
| GET     | `/api/entrainements/{id}/phases`                  | Récupère les phases d'un entraînement         |
| POST    | `/api/entrainements/{id}/phases`                  | Ajoute une phase à un entraînement            |
| PUT     | `/api/entrainements/{entrainementId}/phases/{phaseId}` | Met à jour une phase                      |
| DELETE  | `/api/entrainements/{entrainementId}/phases/{phaseId}` | Supprime une phase                        |

### Exercices dans les Phases

| Méthode | Endpoint                                                              | Description                                    |
|---------|----------------------------------------------------------------------|------------------------------------------------|
| POST    | `/api/entrainements/{id}/phases/{phaseId}/exercices`                 | Ajoute un exercice à une phase                |
| PUT     | `/api/entrainements/{id}/phases/{phaseId}/exercices/{exerciceId}`    | Met à jour un exercice dans une phase         |
| DELETE  | `/api/entrainements/{id}/phases/{phaseId}/exercices/{exerciceId}`    | Supprime un exercice d'une phase              |

### Entraînements Simplifiés

| Méthode | Endpoint                       | Description                                          |
|---------|--------------------------------|------------------------------------------------------|
| GET     | `/api/entrainements-simple`   | Récupère la liste des entraînements (titre seul)   |
| POST    | `/api/entrainements-simple`   | Ajoute un entraînement simple (titre seul)         |
| PUT     | `/api/entrainements-simple/{id}` | Met à jour un entraînement simple               |
| DELETE  | `/api/entrainements-simple/{id}` | Supprime un entraînement simple                 |

### Exercices

| Méthode | Endpoint                       | Description                                          |
|---------|--------------------------------|------------------------------------------------------|
| GET     | `/api/exercices`               | Récupère la liste des exercices                      |
| GET     | `/api/exercices/{id}`          | Récupère un exercice spécifique par son ID           |
| POST    | `/api/exercices`               | Ajoute un nouvel exercice (avec support imageUrl)    |
| PUT     | `/api/exercices/{id}`          | Met à jour un exercice existant (avec imageUrl)      |
| POST    | `/api/exercices/{id}/duplicate`| Duplique un exercice existant (avec tous les champs) |
| DELETE  | `/api/exercices/{id}`          | Supprime un exercice existant                        |

**Champs supportés pour les exercices :**
- `nom` (string, requis)
- `description` (string, optionnel)
- `duree` (number, optionnel)
- `materiel` (string, optionnel)
- `imageUrl` (string, optionnel) - **Nouveau champ**
- `variables` (object, optionnel)
- `variablesPlus` (string, optionnel)
- `variablesMinus` (string, optionnel)

### Tags (Exercices)

| Méthode | Endpoint                       | Description                                          |
|---------|--------------------------------|------------------------------------------------------|
| GET     | `/api/tags`                    | Récupère la liste des tags pour exercices           |
| GET     | `/api/tags/{id}`               | Récupère un tag spécifique par son ID                |
| POST    | `/api/tags`                    | Ajoute un nouveau tag                                |
| PUT     | `/api/tags/{id}`               | Met à jour un tag existant                           |
| DELETE  | `/api/tags/{id}`               | Supprime un tag existant                             |

### Tags d'Entraînement

| Méthode | Endpoint                       | Description                                          |
|---------|--------------------------------|------------------------------------------------------|
| GET     | `/api/training-tags`           | Récupère la liste des tags pour entraînements       |
| GET     | `/api/training-tags/{id}`      | Récupère un tag d'entraînement par son ID           |
| POST    | `/api/training-tags`           | Ajoute un nouveau tag d'entraînement                |
| PUT     | `/api/training-tags/{id}`      | Met à jour un tag d'entraînement existant           |
| DELETE  | `/api/training-tags/{id}`      | Supprime un tag d'entraînement existant             |

## Services Angular associés

| Service Angular        | Endpoint API associé     | Méthode dans ApiUrlService    |
|-----------------------|----------------------|------------------------------|
| TrainingSimpleService | `/api/entrainements-simple`| `getEntrainementsUrl()`   |
| ExerciceService       | `/api/exercices`     | `getExercicesUrl()`          |
| TagService            | `/api/tags`          | `getTagsUrl()`               |
| TrainingTagService    | `/api/training-tags` | `getTrainingTagsUrl()`       |
| PhaseOptimizedService | `/api/entrainements` | Corrigé pour utiliser la bonne URL |

**Note importante :** Le service `PhaseOptimizedService` a été corrigé pour utiliser les bonnes URLs d'API (`/api/entrainements` au lieu de `/api/phases`).

## Bonnes pratiques

1. **Toujours utiliser ApiUrlService** pour construire les URLs d'API
2. **Ne pas dupliquer les segments d'URL** dans les services spécifiques
3. **Utiliser la méthode `getResourceUrl(baseUrl, id)`** pour les opérations sur une ressource spécifique
4. **Documenter tout nouveau endpoint** dans ce fichier
5. **Maintenir la cohérence** entre le frontend et le backend

## Améliorations récentes

### Support des images pour les exercices
- **Ajout du champ `imageUrl`** dans tous les endpoints d'exercices
- Support complet dans création, mise à jour et duplication
- Intégration frontend avec validation de formulaire

### Correction de la suppression optimiste
- **Fix du bug 404** lors de la suppression d'entraînements
- Amélioration de la gestion d'erreur côté frontend
- Restauration automatique de la liste en cas d'échec

### Alignement des services frontend/backend
- **Correction de `PhaseOptimizedService`** pour utiliser `/api/entrainements`
- Harmonisation des URLs entre tous les services
- Élimination des doublons de segments d'URL

### Duplication complète
- **Endpoint de duplication d'entraînements** : `POST /api/entrainements/{id}/duplicate`
- Copie de toutes les phases et exercices associés
- Préservation des relations et tags

## Historique des problèmes résolus

- **Double segment `/entrainements`** : URLs incorrectes comme `/api/entrainements/entrainements`
- **Mapping incorrect des tags** : Utilisation de `training-tags` au lieu de `tags`
- **Fonction dupliquer manquante** : Ajout des endpoints de duplication
- **Champ image exercices** : Ajout complet du support `imageUrl`
- **Clarification système tags** : Distinction entre Tag (exercices) et TrainingTag (entraînements)
- **URLs incorrectes dans PhaseOptimizedService** : Correction vers les bonnes routes backend

## Maintenance

Ce document doit être mis à jour à chaque modification des endpoints API. Il est recommandé de le réviser lors des réunions d'équipe pour s'assurer que tous les développeurs sont alignés sur les conventions d'API.
