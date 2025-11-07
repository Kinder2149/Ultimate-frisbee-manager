# Documentation du système de tags

## Introduction

Ce document décrit l'architecture et l'implémentation du système de tags dans Ultimate Frisbee Manager. Il explique les différentes interfaces de tags, leur utilisation dans l'application et comment elles sont converties entre elles.

## Modèle de données

### Backend (Prisma Schema)

Le modèle Tag dans la base de données est défini comme suit :

```prisma
model Tag {
  id        String    @id @default(uuid())
  label     String
  category  String    // "objectif", "element", "variable", "niveau"
  color     String?   // Code couleur HEX
  level     Int?      // Nombre d'étoiles (1-5) pour la catégorie "niveau" 
  createdAt DateTime  @default(now())
  
  // Relation avec les exercices
  exercices Exercice[] @relation("ExerciseTags")
  
  // Contrainte d'unicité pour éviter les doublons par catégorie
  @@unique([label, category])
}
```

### Frontend (Interfaces TypeScript)

#### Interface Tag

Interface principale utilisée dans tout le frontend pour représenter un tag :

```typescript
export interface Tag {
  id: string;
  label: string;
  category: string;
  color?: string;
  level?: number;
}
```

#### Interface TagSuggestion

Utilisée pour représenter un tag suggéré par le système, avec des métadonnées de confiance et de source :

```typescript
export interface TagSuggestion {
  id: string;
  label: string;
  category: string;
  confidence: number;
  source: string;
  color?: string;
}
```

#### Interface TagUsageStats

Utilisée pour afficher des statistiques d'utilisation de tags :

```typescript
export interface TagUsageStats {
  tagId: string;
  tagLabel: string;
  tagCategory: string;
  count: number;
  percentage: number;
  color?: string;
}
```

## Conversion entre les interfaces

### Tag → TagUsageStats

Utilisée principalement dans le composant `TagsOverviewPageComponent` :

```typescript
const tagStats: TagUsageStats = {
  tagId: tag.id,
  tagLabel: tag.label,
  tagCategory: tag.category,
  count: usageCount, // Doit être fourni séparément
  percentage: usagePercentage, // Doit être fourni séparément
  color: tag.color
};
```

### TagUsageStats → Tag

Utilisée pour l'édition d'un tag via `openTagEditDialog` :

```typescript
const tagToEdit: Tag = {
  id: tagStats.tagId,
  label: tagStats.tagLabel,
  category: tagStats.tagCategory,
  color: tagStats.color
};
```

### Tag → TagSuggestion

Utilisée lors de la création de suggestions manuelles :

```typescript
const tagSuggestion: TagSuggestion = {
  ...tag,
  confidence: 1.0, // Valeur par défaut pour les suggestions manuelles
  source: 'Manuel'
};
```

## Détection du type avec Type Guards

Le composant `TagVisualizationComponent` utilise des type guards pour gérer les différents types :

```typescript
isTagSuggestion(tag: Tag | TagSuggestion | TagUsageStats): tag is TagSuggestion {
  return (tag as TagSuggestion).confidence !== undefined;
}

isTagUsageStats(tag: Tag | TagSuggestion | TagUsageStats): tag is TagUsageStats {
  return (tag as TagUsageStats).tagId !== undefined;
}

getTagLabel(tag: Tag | TagSuggestion | TagUsageStats): string {
  if (this.isTagUsageStats(tag)) {
    return tag.tagLabel;
  }
  return tag.label;
}
```

## Gestion des couleurs

Chaque catégorie de tag a une couleur par défaut :

```typescript
getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'objectif': '#4caf50',
    'element': '#2196f3',
    'variable': '#ff9800',
    'niveau': '#9c27b0'
  };
  
  return colors[category.toLowerCase()] || '#9e9e9e';
}
```

## Migration des anciens champs vers les tags

Le script `migrate-tags.js` convertit les anciens champs (`objectif`, `elementsTravail`, `variables`) en relations avec le nouveau modèle Tag. Il :

1. Crée des tags par défaut pour les objectifs
2. Parcourt tous les exercices existants
3. Pour chaque exercice :
   - Extrait l'objectif, les éléments et les variables
   - Crée les tags correspondants s'ils n'existent pas
   - Établit les relations entre l'exercice et ses tags

## Filtrage des tags

La méthode `filterTags` est utilisée dans plusieurs composants pour filtrer les tags selon la catégorie et un terme de recherche :

```typescript
filterTags(tags: Tag[], selectedCategories: string[], searchTerm: string): Tag[] {
  if (!tags) return [];
  
  // Filtrer par catégorie
  let filtered = tags.filter(tag => 
    selectedCategories.includes(tag.category)
  );
  
  // Filtrer par recherche
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(tag => 
      tag.label.toLowerCase().includes(search)
    );
  }
  
  return filtered;
}
```

## Bonnes pratiques

1. **Cohérence des types** : Utilisez l'interface appropriée selon le contexte :
   - `Tag` pour les opérations CRUD basiques
   - `TagSuggestion` pour les recommandations et suggestions
   - `TagUsageStats` pour l'affichage des statistiques

2. **Conversion explicite** : Toujours convertir explicitement entre les interfaces plutôt que de faire des casts implicites.

3. **Type Guards** : Utiliser des type guards pour détecter le type d'objet tag manipulé.

4. **Couleurs cohérentes** : Maintenir la cohérence des couleurs entre le frontend et le backend en utilisant la méthode `getCategoryColor`.
