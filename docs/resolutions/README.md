# Archive des Résolutions de Problèmes

Ce dossier contient l'historique détaillé de tous les problèmes résolus dans le projet Ultimate Frisbee Manager.

## 📁 Organisation

Chaque problème résolu est archivé dans un fichier séparé :
- `probleme-001-[titre-court].md`
- `probleme-002-[titre-court].md`
- etc.

## 📋 Format

Chaque fichier suit le template défini dans `WORKFLOW_TEMPLATE.md` avec les 10 étapes :
1. Reformulation du problème
2. Contexte projet
3. Fichiers impactés
4. Hypothèses
5. Solutions possibles
6. Choix retenu
7. Implémentation
8. Vérification
9. Documentation
10. Bilan final

## 🔍 Comment utiliser cette archive

### Pour retrouver une solution
1. Consulter la liste ci-dessous
2. Ouvrir le fichier correspondant
3. Lire la section "Bilan final" pour un résumé rapide

### Pour éviter un problème connu
1. Consulter `pitfalls.md` à la racine du projet
2. Vérifier si le pattern d'erreur est documenté
3. Si oui, appliquer la solution préventive

### Pour comprendre une décision technique
1. Rechercher le problème dans cette archive
2. Lire la section "Choix retenu" pour la justification
3. Consulter "Solutions possibles" pour les alternatives envisagées

## 📊 Index des Problèmes Résolus

### Problème #1 - Incohérence du nombre de tags
- **Date** : 03/10/2025
- **Fichier** : `probleme-001-incoherence-tags.md` (à créer)
- **Résumé** : Base de données pré-peuplée créait confusion entre dashboard et gestionnaire
- **Solution** : Neutralisation du seeding et reset de la DB

### Problème #2 - Crash authentification après nettoyage DB
- **Date** : 03/10/2025
- **Fichier** : `probleme-002-crash-auth-db.md` (à créer)
- **Résumé** : Table User inexistante + désynchronisation script de seed
- **Solution** : `prisma db push` + correction du script seed-auth.js

### Problème #3 - Freeze formulaire exercice en édition
- **Date** : 04/10/2025
- **Fichier** : `probleme-003-freeze-formulaire-exercice.md` (à créer)
- **Résumé** : Boucle infinie de détection de changements Angular
- **Solution** : Refactorisation avec FormGroup et mat-select

---

## 🔄 Processus de Documentation

### Pendant la résolution
1. Copier `WORKFLOW_TEMPLATE.md`
2. Remplir au fur et à mesure
3. Garder dans le dossier de travail

### Après la résolution
1. Finaliser le template avec le bilan
2. Renommer : `probleme-XXX-[titre].md`
3. Déplacer dans `docs/resolutions/`
4. Mettre à jour cet index

### Mise à jour des fichiers de suivi
1. Ajouter entrée dans `plan.md`
2. Ajouter hypothèses dans `history.md`
3. Ajouter piège dans `pitfalls.md` (si applicable)

---

## 🎯 Objectif

Créer une **base de connaissances** du projet pour :
- ✅ Tracer toutes les décisions techniques
- ✅ Éviter de répéter les mêmes erreurs
- ✅ Faciliter l'onboarding de nouveaux développeurs
- ✅ Comprendre l'évolution du projet

---

## 📝 Notes

- Les fichiers sont en Markdown pour faciliter la lecture
- Chaque problème est auto-suffisant (contexte inclus)
- Les solutions incluent le code avant/après
- Les leçons apprises sont extraites dans `pitfalls.md`
