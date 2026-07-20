# MISSION MOBILE --- VERSION FINALE VALIDÉE

**⚠️ DOCUMENT ARCHIVÉ - Remplacé par `docs/reference/MOBILE_SPECIFICATION.md` v3.0**

**Projet : Ultimate Frisbee Manager**\
**Statut : ARCHIVED**\
**Version : 2.0**\
**Date : 2026-02-18**\
**Archivé le : 2026-02-19**\
**Remplacé par : docs/reference/MOBILE_SPECIFICATION.md v3.0**

------------------------------------------------------------------------

# 1. POSITIONNEMENT PRODUIT MOBILE

## Objectif

Créer une version mobile :

-   Fonctionnellement équivalente au desktop
-   Utilisant les mêmes objets métier
-   Utilisant les mêmes termes
-   Utilisant les mêmes structures de données
-   Utilisant les mêmes formulaires
-   Avec une organisation et ergonomie 100% mobile

La mobile n'est pas : - Une version simplifiée - Une app terrain
indépendante - Une PWA offline-first

La mobile est : \> Une continuité naturelle multi-device du produit
principal.

------------------------------------------------------------------------

# 2. ALIGNEMENT AVEC L'ÉTAT ACTUEL

## Routes conservées

    /mobile
      /home
      /library
      /terrain
      /profile
      /detail/:type/:id

## Services conservés

-   MobileStateService
-   MobileDataService
-   MobileFiltersService
-   MobileDetectorService
-   WorkspaceDataStore
-   Services CRUD existants

Aucune nouvelle architecture offline. Aucune IndexedDB. Aucune queue
d'actions.

------------------------------------------------------------------------

# 3. SUPPRESSIONS OFFICIELLES

Les éléments suivants sont supprimés :

-   Mode hors ligne complet
-   Service Worker avancé
-   IndexedDB
-   Synchronisation différée
-   Résolution de conflits
-   Background sync
-   Notifications push
-   Architecture offline dédiée

Nous utilisons uniquement le cache navigateur standard comme la version
desktop.

------------------------------------------------------------------------

# 4. ARCHITECTURE FINALE MOBILE

## Navigation (Bottom Nav)

1.  Accueil
2.  Bibliothèque
3.  Créer
4.  Terrain
5.  Profil

Ajout officiel de l'onglet "Créer".

------------------------------------------------------------------------

# 5. STRUCTURE DES ÉCRANS

## Accueil

-   Vue synthétique
-   Accès rapide
-   Derniers contenus
-   Séance du jour
-   Alignement terminologique complet avec desktop

## Bibliothèque

-   Exercices
-   Échauffements
-   Situations
-   Entraînements

Fonctionnalités : - Recherche - Filtres (tags, durée, etc.) - Tri - Vue
liste optimisée mobile - Navigation vers détail

## Création --- Organisation en Stepper multi-étapes

### Étape 1 --- Informations générales

-   Nom
-   Description
-   Image

### Étape 2 --- Paramètres métier

-   Durée
-   Nombre de joueurs
-   Type
-   Autres champs spécifiques

### Étape 3 --- Relations

-   Sélection exercices (pour entraînement)
-   Sélection échauffement
-   Sélection situation

### Étape 4 --- Tags

### Étape 5 --- Validation & résumé

Les formulaires doivent être strictement alignés avec les champs desktop
existants.

## Mode Terrain

Fonctionnalités : - Chronomètre simple - Affichage de la séance
sélectionnée - Bloc Notes - Sauvegarde des notes

Suppression : - Favoris rapides avancés - Progression complexe - Alertes
configurables - Historique détaillé

## Détail

Doit supporter : - Toutes les métadonnées - Toutes les sections - Toutes
les actions (éditer, dupliquer, supprimer) - Aucun renvoi vers la
version desktop

------------------------------------------------------------------------

# 6. NOUVEAUX COMPOSANTS À CRÉER

-   MobileCreateExerciceComponent
-   MobileCreateEchauffementComponent
-   MobileCreateSituationComponent
-   MobileCreateEntrainementComponent
-   MobileEdit equivalents
-   MobileStepperComponent
-   MobileTagSelectorComponent
-   MobileRelationSelectorComponent

------------------------------------------------------------------------

# 7. MODIFICATIONS À EFFECTUER

## MobileLibraryComponent

-   Refonte UI
-   Ajout recherche
-   Ajout filtres
-   Ajout tri
-   Alignement visuel

## MobileHomeComponent

-   Alignement terminologique
-   Structuration claire

## MobileTerrainComponent

-   Arrêt automatique chrono au changement page
-   Ajout bloc Notes
-   Liaison notes ↔ séance

## MobileDetailComponent

-   Implémentation duplication
-   Implémentation suppression
-   Implémentation édition mobile
-   Suppression redirection desktop

------------------------------------------------------------------------

# 8. CONTRAINTES TECHNIQUES STRICTES

-   Aucune duplication logique métier
-   Réutilisation services desktop
-   Aucun mock
-   Aucune donnée fictive
-   Respect total architecture Angular actuelle
-   Respect des modèles existants

------------------------------------------------------------------------

# 9. PLAN D'IMPLÉMENTATION STRUCTURÉ

## Phase 1

-   Ajout onglet Créer
-   Création MobileStepperComponent

## Phase 2

-   Implémentation MobileCreateExercice
-   Implémentation MobileTagSelector

## Phase 3

-   Implémentation autres types

## Phase 4

-   Refonte Library

## Phase 5

-   Finalisation Detail

## Phase 6

-   Mode terrain final

------------------------------------------------------------------------

# PROMPT À DONNER À L'IA EXÉCUTANTE

Tu es une IA développeur Angular senior.

MISSION :

Refondre complètement la vue mobile du projet Ultimate Frisbee Manager.

Contraintes obligatoires :

1.  Ne pas créer d'architecture offline.
2.  Ne pas créer de Service Worker.
3.  Ne pas modifier la logique backend.
4.  Réutiliser tous les services existants.
5.  Respecter strictement les modèles de données existants.
6.  Implémenter les formulaires mobile sous forme de Stepper
    multi-étapes.
7.  Implémenter l'édition complète en mobile.
8.  Ajouter un onglet "Créer" dans la bottom navigation.
9.  Supprimer toute redirection vers la version desktop.

Produire :

-   La liste exacte des fichiers à créer
-   La liste exacte des fichiers à modifier
-   La liste exacte des suppressions
-   La séquence d'implémentation
-   Les dépendances Angular nécessaires
-   Les risques techniques identifiés

Ne produire aucun code tant que le plan complet n'est pas validé.
