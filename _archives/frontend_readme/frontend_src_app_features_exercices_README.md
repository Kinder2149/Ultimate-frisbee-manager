# Module Exercices

Ce module contient toutes les fonctionnalités liées à la gestion des exercices d'Ultimate Frisbee dans l'application.

## Structure

```
exercices/
├── components/                  # Composants réutilisables
│   └── exercice-card/           # Carte d'affichage d'un exercice
│       ├── exercice-card.component.css
│       ├── exercice-card.component.html
│       └── exercice-card.component.ts
├── pages/                       # Pages principales
│   ├── exercice-form/           # Formulaire d'ajout/édition d'exercice
│   │   ├── exercice-form.component.css
│   │   ├── exercice-form.component.html
│   │   └── exercice-form.component.ts
│   └── exercice-list/           # Liste des exercices
│       ├── exercice-list.component.css
│       ├── exercice-list.component.html
│       └── exercice-list.component.ts
├── services/                    # Services spécifiques (si nécessaire)
└── exercices.module.ts          # Définition du module et routes
```

## Fonctionnalités

- Affichage de la liste des exercices
- Création d'un nouvel exercice
- Modification d'un exercice existant
- Suppression d'exercices
- Attribution de tags aux exercices

## Composants

### ExerciceListComponent (Standalone)

Page principale affichant la liste des exercices avec options de filtrage et recherche.

### ExerciceCardComponent (Standalone)

Composant réutilisable pour afficher un exercice sous forme de carte avec ses tags.

### ExerciceFormComponent

Formulaire complet pour créer et modifier des exercices, incluant la sélection de tags par catégorie.

## Utilisation

Ce module est chargé en lazy loading dans le routeur principal :

```typescript
{
  path: 'exercices',
  loadChildren: () => import('./features/exercices/exercices.module')
    .then(m => m.ExercicesModule)
}
```

## Conventions et bonnes pratiques

- Les composants de présentation (comme ExerciceCard) sont standalone
- Le formulaire principal maintient son propre état
- Les tags sont chargés depuis le service central TagService dans le module Core
- Toujours utiliser le pattern OnPush pour les détections de changement quand possible
- Documenter les méthodes complexes avec JSDoc
