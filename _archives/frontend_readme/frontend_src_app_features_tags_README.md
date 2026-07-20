# Module Tags

Ce module contient toutes les fonctionnalités liées à la gestion des tags dans l'application Ultimate Frisbee Manager.

## Structure

```
tags/
├── components/                  # Composants réutilisables
│   ├── tag-form/                # Formulaire pour créer/éditer un tag
│   │   ├── tag-form.component.css
│   │   ├── tag-form.component.html
│   │   └── tag-form.component.ts
│   └── tag-list/                # Liste des tags d'une catégorie
│       ├── tag-list.component.css
│       ├── tag-list.component.html
│       └── tag-list.component.ts
├── pages/                       # Pages principales
│   ├── tags-manager.component.css
│   ├── tags-manager.component.html
│   └── tags-manager.component.ts
└── tags.module.ts               # Définition du module et routes
```

## Fonctionnalités

- Création et édition de tags par catégories (Objectif, Élément, Variable, Niveau)
- Attribution de couleurs personnalisées aux tags
- Organisation des tags par catégorie
- Suppression de tags (avec vérification d'utilisation dans les exercices)

## Composants

### TagsManagerComponent (Standalone)

Page principale de gestion des tags qui orchestre les autres composants et gère l'état global.

### TagFormComponent (Standalone)

Formulaire permettant de créer ou modifier un tag avec sa couleur et sa catégorie.

### TagListComponent (Standalone)

Composant affichant la liste des tags d'une catégorie avec leurs couleurs et options d'édition/suppression.

## Utilisation

Ce module est chargé en lazy loading dans le routeur principal :

```typescript
{
  path: 'tags',
  loadChildren: () => import('./features/tags/tags.module')
    .then(m => m.TagsModule)
}
```

## Conventions et bonnes pratiques

- Tous les composants sont configurés en standalone pour une meilleure modularité
- Les interactions entre composants se font par @Input/@Output clairement définis
- Les services partagés sont importés depuis le module Core
- Les couleurs des tags sont gérées avec un système de contraste automatique
- La suppression des tags vérifie les dépendances avec les exercices
