# Système de Documentation - Ultimate Frisbee Manager

> **Guide rapide** pour naviguer dans le système de documentation du projet

---

## 📚 Vue d'ensemble

Le projet utilise un système de documentation structuré pour tracer toutes les décisions techniques, problèmes rencontrés et solutions appliquées.

---

## 📁 Fichiers Principaux

### 1. `AGENT_GUIDE.md` 📖
**Rôle** : Guide complet de la méthodologie de l'agent développeur
**Contenu** :
- Workflow en 10 étapes détaillé
- Règles critiques (à faire / à éviter)
- Gestion des incertitudes
- Checklist de fin de résolution

**Quand consulter** : 
- Au début de chaque nouvelle session
- Avant d'analyser un problème
- Pour comprendre la méthodologie

---

### 2. `WORKFLOW_TEMPLATE.md` 📋
**Rôle** : Template vierge à copier pour chaque nouveau problème
**Contenu** :
- Structure en 10 étapes pré-formatée
- Checklists et sections à remplir
- Format standardisé pour la traçabilité

**Comment utiliser** :
1. Copier le fichier au début d'un problème
2. Remplir au fur et à mesure de l'analyse
3. Archiver dans `docs/resolutions/` une fois résolu

---

### 3. `plan.md` 📊
**Rôle** : Vue d'ensemble de tous les problèmes et solutions
**Contenu** :
- Méthodologie en 10 étapes (résumé)
- Historique de tous les problèmes résolus
- Format : Date, Symptôme, Cause, Solution, État final

**Mise à jour** :
- À chaque problème résolu
- Format standardisé (voir section 9 du workflow)

---

### 4. `history.md` 🔍
**Rôle** : Tentatives, hypothèses testées, approches qui n'ont pas marché
**Contenu** :
- Hypothèses explorées (validées/rejetées)
- Résultats des tests effectués
- Leçons apprises pendant l'analyse

**Mise à jour** :
- Pendant l'analyse (étapes 4-5 du workflow)
- Avant la solution finale
- Pour éviter de retester les mêmes hypothèses

---

### 5. `pitfalls.md` ⚠️
**Rôle** : Registre des pièges récurrents et erreurs fréquentes
**Contenu** :
- Description du piège
- Symptômes pour le détecter
- Cause racine
- Solution/Prévention

**Mise à jour** :
- Dès qu'un pattern d'erreur se répète
- Après résolution d'un problème récurrent
- **À consulter AVANT toute analyse** pour éviter les pistes déjà explorées

---

### 6. `docs/resolutions/` 📂
**Rôle** : Archive détaillée de tous les problèmes résolus
**Contenu** :
- Un fichier par problème : `probleme-XXX-[titre].md`
- Template complet rempli (10 étapes)
- Code avant/après, logs, tests effectués

**Organisation** :
- `README.md` : Index de tous les problèmes
- Fichiers numérotés chronologiquement
- Auto-suffisants (contexte inclus)

---

## 🔄 Workflow Complet

### Étape 1 : Nouveau Problème Détecté
1. ✅ Consulter `pitfalls.md` pour vérifier si déjà rencontré
2. ✅ Consulter `history.md` pour voir les hypothèses déjà testées
3. ✅ Copier `WORKFLOW_TEMPLATE.md` → `probleme-en-cours.md`

### Étape 2 : Analyse (Étapes 1-6 du workflow)
1. ✅ Reformuler le problème (naturel → technique)
2. ✅ Identifier le contexte et les fichiers impactés
3. ✅ Formuler plusieurs hypothèses
4. ✅ Proposer plusieurs solutions
5. ✅ Choisir et justifier la solution
6. ✅ Remplir le template au fur et à mesure

### Étape 3 : Implémentation (Étapes 7-8 du workflow)
1. ✅ Appliquer la correction
2. ✅ Ajouter logs/commentaires pour tests
3. ✅ Lister les tests à effectuer

### Étape 4 : Documentation (Étape 9 du workflow)
1. ✅ Mettre à jour `plan.md` (résumé du problème)
2. ✅ Mettre à jour `history.md` (hypothèses testées)
3. ✅ Mettre à jour `pitfalls.md` (si nouveau piège)

### Étape 5 : Bilan et Archivage (Étape 10 du workflow)
1. ✅ Rédiger le bilan final dans le template
2. ✅ Renommer : `probleme-XXX-[titre].md`
3. ✅ Déplacer dans `docs/resolutions/`
4. ✅ Mettre à jour l'index dans `docs/resolutions/README.md`
5. ✅ Nettoyer les fichiers temporaires

---

## 🎯 Objectifs du Système

### Traçabilité
- Chaque décision technique est documentée
- Chaque hypothèse testée est tracée
- Chaque erreur récurrente est capitalisée

### Éviter les Répétitions
- `pitfalls.md` : Ne pas retomber dans les mêmes pièges
- `history.md` : Ne pas retester les mêmes hypothèses
- `docs/resolutions/` : Réutiliser les solutions qui ont marché

### Faciliter l'Onboarding
- Nouveaux développeurs peuvent comprendre l'historique
- Documentation auto-suffisante
- Décisions techniques justifiées

### Amélioration Continue
- Leçons apprises extraites après chaque problème
- Patterns d'erreurs identifiés
- Base de connaissances du projet

---

## 📊 Schéma de Navigation

```
Nouveau Problème
       ↓
   pitfalls.md ← Vérifier si déjà rencontré
       ↓
   history.md ← Vérifier hypothèses déjà testées
       ↓
WORKFLOW_TEMPLATE.md ← Copier et remplir
       ↓
   [Analyse et Résolution]
       ↓
   plan.md ← Ajouter résumé
   history.md ← Ajouter hypothèses
   pitfalls.md ← Ajouter piège (si applicable)
       ↓
docs/resolutions/ ← Archiver template complet
       ↓
   [Problème Résolu]
```

---

## 🚀 Démarrage Rapide

### Pour l'Agent Développeur
1. Lire `AGENT_GUIDE.md` (une fois)
2. À chaque problème :
   - Consulter `pitfalls.md`
   - Copier `WORKFLOW_TEMPLATE.md`
   - Suivre les 10 étapes
   - Mettre à jour la documentation

### Pour l'Utilisateur
1. Décrire le problème en langage naturel
2. Fournir logs/erreurs si disponibles
3. Tester les corrections proposées
4. Valider la résolution

### Pour un Nouveau Développeur
1. Lire `projet.md` (vue d'ensemble)
2. Lire `plan.md` (historique des problèmes)
3. Parcourir `docs/resolutions/` (solutions détaillées)
4. Consulter `pitfalls.md` (pièges à éviter)

---

## 📝 Formats Standardisés

### Entrée dans plan.md
```markdown
## Problème n°X : [Titre court]

- **Date :** JJ/MM/AAAA
- **Symptôme :** [Description courte]
- **Cause racine :** [Explication technique]
- **Solution appliquée :** [Résumé de la correction]
- **État final :** [Résultat]
```

### Entrée dans history.md
```markdown
## [Titre du problème]

- **Hypothèses testées :**
  1. [Hypothèse 1] → ❌ Rejetée car [raison]
  2. [Hypothèse 2] → ✅ Validée

- **Résultats des tests :** [Observations]
- **Conclusion :** [Synthèse]
```

### Entrée dans pitfalls.md
```markdown
### [Titre du piège]

- **Piège :** [Description]
- **Symptôme :** [Comment détecter]
- **Cause :** [Pourquoi ça arrive]
- **Solution/Prévention :** [Comment éviter]
```

---

## ✅ Checklist de Qualité

### Documentation Complète
- [ ] Problème reformulé (naturel + technique)
- [ ] Contexte et fichiers impactés documentés
- [ ] Plusieurs hypothèses explorées
- [ ] Solutions comparées
- [ ] Choix justifié
- [ ] Code avant/après documenté
- [ ] Tests listés avec commandes
- [ ] Bilan final rédigé

### Fichiers à Jour
- [ ] `plan.md` mis à jour
- [ ] `history.md` mis à jour
- [ ] `pitfalls.md` mis à jour (si applicable)
- [ ] Template archivé dans `docs/resolutions/`
- [ ] Index `docs/resolutions/README.md` mis à jour

### Nettoyage
- [ ] Fichiers temporaires supprimés
- [ ] Logs de debug commentés ou supprimés
- [ ] Code ancien commenté avec date
- [ ] Backups archivés si nécessaire

---

## 🔗 Liens Rapides

- **Guide méthodologie** : `AGENT_GUIDE.md`
- **Template problème** : `WORKFLOW_TEMPLATE.md`
- **Vue d'ensemble** : `plan.md`
- **Tentatives** : `history.md`
- **Pièges** : `pitfalls.md`
- **Archive** : `docs/resolutions/README.md`
- **Projet** : `projet.md`

---

## 💡 Conseils

### Pour l'Efficacité
- Toujours consulter `pitfalls.md` en premier
- Ne pas hésiter à créer plusieurs hypothèses
- Documenter au fur et à mesure (pas à la fin)
- Archiver rapidement après résolution

### Pour la Qualité
- Expliquer en français simple
- Justifier chaque choix technique
- Ajouter des logs pour faciliter les tests
- Extraire les leçons apprises

### Pour la Maintenance
- Garder les formats standardisés
- Numéroter les problèmes chronologiquement
- Mettre à jour l'index régulièrement
- Nettoyer les fichiers obsolètes

---

**Ce système est vivant** : il évolue avec le projet. N'hésitez pas à l'améliorer si nécessaire !
