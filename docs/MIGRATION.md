# Guide de Migration - Système de Tags

Ce document explique comment migrer les exercices existants vers le nouveau système de gestion des tags.

## Contexte

Dans la première version de l'application Ultimate Frisbee Manager, les exercices stockaient les informations suivantes dans des champs textuels :
- `objectif` : Un texte parmi "Technique", "Tactique", "Physique", ou "Mental"
- `elementsTravail` : Un tableau JSON de chaînes de texte
- `variables` : Un tableau JSON de chaînes de texte

Le nouveau système utilise une approche relationnelle avec un modèle `Tag` qui permet :
- Une gestion centralisée des tags par catégorie
- L'attribution de couleurs et de niveaux (pour les tags de type "niveau")
- Une relation N-N entre les exercices et les tags

## Procédure de Migration

### 1. Exécuter le script de migration automatique

Un script de migration a été créé pour convertir automatiquement les anciens champs en relations avec le modèle `Tag`.

```bash
# Se placer dans le dossier backend
cd backend

# Exécuter le script de migration
node scripts/migrate-tags.js
```

Ce script effectue les actions suivantes :
1. Récupère tous les exercices existants
2. Pour chaque exercice :
   - Crée un tag de catégorie "objectif" basé sur la valeur du champ `objectif`
   - Crée des tags de catégorie "element" pour chaque élément dans le tableau `elementsTravail`
   - Crée des tags de catégorie "variable" pour chaque variable dans le tableau `variables`
3. Établit les relations entre les exercices et les tags créés

### 2. Vérification de la migration

Après la migration, vous pouvez vérifier que tout fonctionne correctement :

1. Ouvrez l'interface de gestion des tags (/tags)
2. Vérifiez que les tags ont bien été créés dans chaque catégorie
3. Ouvrez un exercice existant pour confirmer que les tags apparaissent correctement

### 3. Compatibilité

Pour assurer la compatibilité entre l'ancien et le nouveau système :

- Les anciens champs (`objectif`, `elementsTravail`, `variables`) sont conservés dans la base de données
- Lors de la création d'un exercice, le frontend envoie à la fois les tags IDs et les anciennes valeurs textuelles
- Le backend gère les deux formats pour assurer une transition en douceur

### 4. Nettoyage (optionnel)

Une fois la migration complètement validée et que tous les utilisateurs sont passés à la nouvelle version, vous pouvez envisager de supprimer les champs obsolètes du schéma de base de données. Ce nettoyage n'est pas obligatoire et peut être réalisé ultérieurement.

## Nouveaux Types de Tags

Le nouveau système supporte quatre catégories de tags :

1. **objectif** : L'objectif principal de l'exercice (ex: Technique, Tactique, etc.)
2. **element** : Les éléments travaillés dans l'exercice
3. **variable** : Les variables qui peuvent modifier l'exercice
4. **niveau** : Des niveaux de difficulté ou de progression (avec un système d'étoiles de 1 à 5)

## Dépannage

Si vous rencontrez des problèmes pendant la migration :

1. **Erreur de parsing JSON** : Vérifiez que les champs `elementsTravail` et `variables` contiennent des JSON valides
2. **Tags en double** : Le script ignore automatiquement les tags en double par catégorie
3. **Échec de connexion à la base de données** : Vérifiez que la base de données est accessible et que les variables d'environnement sont correctement configurées
