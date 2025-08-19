# Features

Ce dossier contient toutes les fonctionnalités métier de l'application Ultimate Frisbee Manager, organisées en modules fonctionnels.

## Structure

Chaque fonctionnalité est organisée dans son propre module, avec une structure cohérente :

```
features/
├── exercices/                # Module de gestion des exercices
│   ├── components/           # Composants réutilisables spécifiques aux exercices
│   ├── pages/                # Composants de page (vues principales)
│   ├── services/             # Services spécifiques aux exercices
│   └── exercices.module.ts   # Module Angular avec routes et déclarations
│
├── tags/                     # Module de gestion des tags
│   ├── components/           # Composants réutilisables spécifiques aux tags
│   ├── pages/                # Composants de page (vues principales)
│   ├── services/             # Services spécifiques aux tags
│   └── tags.module.ts        # Module Angular avec routes et déclarations
```

## Modules disponibles

- **exercices** - Gestion des exercices d'ultimate frisbee
- **tags** - Gestion des tags et catégories
- **tags-advanced** - Fonctionnalités avancées de gestion des tags (mapping, suggestions)

## Conventions de nommage

- Les modules de fonctionnalités utilisent le lazy loading pour optimiser le chargement
- Les composants de page sont dans un sous-dossier `pages/`
- Les composants réutilisables sont dans un sous-dossier `components/`
- Les services spécifiques à une fonctionnalité sont dans un sous-dossier `services/`
- Les fichiers suivent la convention Angular : `nom-fichier.type.ts`
  - Exemples : `exercice-list.component.ts`, `tag.service.ts`