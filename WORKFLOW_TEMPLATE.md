# Template de Workflow - Résolution de Problème

> **Instructions** : Copier ce template pour chaque nouveau problème et le remplir étape par étape.

---

## 🔍 ÉTAPE 1 : Reformulation du problème

### Langage naturel (utilisateur)
> [Ce que vous décrivez avec vos mots]

### Langage technique (agent)
> [Traduction technique du problème]

---

## 📋 ÉTAPE 2 : Contexte projet

### Fichiers/modules concernés
- [ ] Backend (Node.js/Express)
- [ ] Frontend (Angular)
- [ ] Base de données (Prisma/SQLite)
- [ ] Configuration (env, build)
- [ ] Autre : _______

### Logs/erreurs disponibles
```
[Coller les logs/erreurs ici]
```

### État actuel du système
- Version : _______
- Environnement : [ ] Dev [ ] Prod
- Dernière modification liée : _______

---

## 📂 ÉTAPE 3 : Fichiers impactés

### Liste exhaustive
1. `chemin/fichier1.ts` - [Rôle dans le problème]
2. `chemin/fichier2.ts` - [Rôle dans le problème]
3. ...

### Dépendances identifiées
- Service A → Service B
- Composant X utilise Service Y
- ...

---

## 💡 ÉTAPE 4 : Hypothèses

### Hypothèse 1 : [Titre court]
- **Description** : [Explication de la cause possible]
- **Probabilité** : [ ] Haute [ ] Moyenne [ ] Faible
- **Impact si vraie** : [Conséquences]

### Hypothèse 2 : [Titre court]
- **Description** : [Explication de la cause possible]
- **Probabilité** : [ ] Haute [ ] Moyenne [ ] Faible
- **Impact si vraie** : [Conséquences]

### Hypothèse 3 : [Titre court]
- **Description** : [Explication de la cause possible]
- **Probabilité** : [ ] Haute [ ] Moyenne [ ] Faible
- **Impact si vraie** : [Conséquences]

---

## 🛠️ ÉTAPE 5 : Solutions possibles

### Solution A : [Titre]
- **Description** : [Comment corriger]
- **Avantages** :
  - ✅ [Avantage 1]
  - ✅ [Avantage 2]
- **Inconvénients** :
  - ❌ [Inconvénient 1]
  - ❌ [Inconvénient 2]
- **Complexité** : [ ] Faible [ ] Moyenne [ ] Élevée
- **Risque** : [ ] Faible [ ] Moyen [ ] Élevé

### Solution B : [Titre]
- **Description** : [Comment corriger]
- **Avantages** :
  - ✅ [Avantage 1]
  - ✅ [Avantage 2]
- **Inconvénients** :
  - ❌ [Inconvénient 1]
  - ❌ [Inconvénient 2]
- **Complexité** : [ ] Faible [ ] Moyenne [ ] Élevée
- **Risque** : [ ] Faible [ ] Moyen [ ] Élevé

### Solution C : [Titre]
- **Description** : [Comment corriger]
- **Avantages** :
  - ✅ [Avantage 1]
  - ✅ [Avantage 2]
- **Inconvénients** :
  - ❌ [Inconvénient 1]
  - ❌ [Inconvénient 2]
- **Complexité** : [ ] Faible [ ] Moyenne [ ] Élevée
- **Risque** : [ ] Faible [ ] Moyen [ ] Élevé

---

## ✅ ÉTAPE 6 : Choix retenu

### Solution choisie : [Lettre + Titre]

### Justification
1. [Raison 1 du choix]
2. [Raison 2 du choix]
3. [Raison 3 du choix]

### Alertes
⚠️ **Attention** : Cette correction impacte [X] fichiers/systèmes :
- [Système 1]
- [Système 2]
- ...

---

## 🔧 ÉTAPE 7 : Implémentation

### Modifications à apporter

#### Fichier 1 : `chemin/fichier1.ts`
```typescript
// AVANT (ligne X-Y)
[Code actuel]

// APRÈS
[Code corrigé]
```

#### Fichier 2 : `chemin/fichier2.ts`
```typescript
// AVANT (ligne X-Y)
[Code actuel]

// APRÈS
[Code corrigé]
```

### Sauvegarde/Versioning
- [ ] Code original commenté avec date
- [ ] Backup créé dans : _______
- [ ] Commit Git avec message : _______

---

## 🧪 ÉTAPE 8 : Vérification

### Logs ajoutés pour test
```typescript
// Dans fichier1.ts (ligne X)
console.log('[DEBUG] Valeur de X:', X);

// Dans fichier2.ts (ligne Y)
console.log('[TEST] État après modification:', state);
```

### Tests à effectuer
1. [ ] Test 1 : [Description]
   - Commande : `_______`
   - Résultat attendu : _______

2. [ ] Test 2 : [Description]
   - Commande : `_______`
   - Résultat attendu : _______

3. [ ] Test 3 : [Description]
   - Commande : `_______`
   - Résultat attendu : _______

### Checklist de validation
- [ ] Pas d'erreurs console
- [ ] Fonctionnalité restaurée
- [ ] Pas de régression sur autres modules
- [ ] Performance acceptable

---

## 📝 ÉTAPE 9 : Documentation

### Mise à jour plan.md
```markdown
## Problème n°X : [Titre court]

- **Date :** [JJ/MM/AAAA]
- **Symptôme :** [Description courte]
- **Cause racine :** [Explication technique]
- **Solution appliquée :** [Résumé de la correction]
- **État final :** [Résultat]
```

### Mise à jour history.md
```markdown
## [Titre du problème]

- **Hypothèses testées :**
  1. [Hypothèse 1] → ❌ Rejetée car [raison]
  2. [Hypothèse 2] → ❌ Rejetée car [raison]
  3. [Hypothèse 3] → ✅ Validée

- **Résultats des tests :**
  - Test A : [Résultat]
  - Test B : [Résultat]

- **Conclusion :** [Synthèse]
```

### Mise à jour pitfalls.md (si applicable)
```markdown
### [Titre du piège]

- **Piège :** [Description]
- **Symptôme :** [Comment le détecter]
- **Cause :** [Pourquoi ça arrive]
- **Solution/Prévention :** [Comment l'éviter]
```

---

## 📊 ÉTAPE 10 : Bilan final

### Résumé
- **Ce qui était cassé :** [Description]
- **Ce qui a été tenté :** [Liste des approches]
- **Ce qui a marché :** [Solution finale]
- **État final :** [Statut du système]

### Leçons apprises
1. [Leçon 1]
2. [Leçon 2]
3. [Leçon 3]

### Améliorations futures (optionnel)
- [ ] [Amélioration 1]
- [ ] [Amélioration 2]
- [ ] [Amélioration 3]

### Archivage
- [ ] Template rempli archivé dans : `docs/resolutions/probleme-X.md`
- [ ] Fichiers temporaires supprimés
- [ ] Documentation à jour

---

## 🏁 Statut final

- [x] Problème résolu
- [ ] Problème partiellement résolu (détails : _______)
- [ ] Problème non résolu (prochaines étapes : _______)

**Date de résolution :** [JJ/MM/AAAA]
**Temps passé :** [Estimation]
