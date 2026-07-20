# WORKFLOW GIT & ENVIRONNEMENTS

**Statut** : REFERENCE  
**Version** : 1.0  
**Date de création** : 18 février 2026  
**Dernière mise à jour** : 18 février 2026  

---

## 📋 OBJECTIF

Ce document définit le workflow Git et la gestion des environnements pour le projet Ultimate Frisbee Manager. Il garantit :
- ✅ Protection de la production (testeurs actifs)
- ✅ Développement sécurisé de nouvelles fonctionnalités
- ✅ Tests avant déploiement
- ✅ Traçabilité des changements

---

## 🌳 STRUCTURE DES BRANCHES

### Branches principales

```
main (production)
  ├─ Déploiement : Vercel Production (https://ultimate-frisbee-manager.vercel.app)
  ├─ Base de données : Supabase Production
  ├─ Protection : ⛔ Merge uniquement depuis develop après validation
  └─ Testeurs : Actifs sur cet environnement
  
develop (staging)
  ├─ Déploiement : Vercel Preview automatique
  ├─ Base de données : Supabase Production (partagée)
  ├─ Rôle : Intégration et tests avant production
  └─ Merge : Depuis les branches feature/*
  
feature/* (développement)
  ├─ Déploiement : Vercel Preview automatique par branche
  ├─ Base de données : Supabase Production (partagée)
  ├─ Rôle : Développement isolé d'une fonctionnalité
  └─ Exemples : feature/mobile-view, feature/export-pdf
```

---

## 🔄 WORKFLOW COMPLET

### 1️⃣ DÉMARRER UNE NOUVELLE FONCTIONNALITÉ

**Situation** : Vous voulez développer une nouvelle feature (ex: vue mobile)

```bash
# 1. Se positionner sur develop et mettre à jour
git checkout develop
git pull origin develop

# 2. Créer une branche feature depuis develop
git checkout -b feature/mobile-view

# 3. Travailler localement
# ... modifications de code ...

# 4. Commit réguliers
git add .
git commit -m "feat(mobile): ajout responsive header"

# 5. Pousser la branche sur GitHub
git push origin feature/mobile-view
```

**✅ Résultat** : Vercel crée automatiquement un environnement de preview pour `feature/mobile-view`

---

### 2️⃣ TESTER VOTRE FONCTIONNALITÉ

**Environnements disponibles** :

| Environnement | URL | Base de données | Usage |
|---------------|-----|-----------------|-------|
| **Local** | `http://localhost:4200` | Supabase Production | Développement rapide |
| **Preview Feature** | `https://ultimate-frisbee-manager-[hash].vercel.app` | Supabase Production | Test de la feature isolée |
| **Preview Develop** | `https://ultimate-frisbee-manager-develop.vercel.app` | Supabase Production | Test d'intégration |
| **Production** | `https://ultimate-frisbee-manager.vercel.app` | Supabase Production | Testeurs actifs ⛔ |

**Checklist de test** :
- [ ] Tests locaux (`npm run dev` backend + `ng serve` frontend)
- [ ] Tests sur Preview Vercel de la branche feature
- [ ] Vérification responsive (mobile, tablette, desktop)
- [ ] Vérification que les testeurs ne sont pas impactés
- [ ] Tests de non-régression sur les fonctionnalités existantes

---

### 3️⃣ INTÉGRER DANS DEVELOP (STAGING)

**Situation** : Votre feature est testée et validée

```bash
# 1. Se positionner sur develop
git checkout develop
git pull origin develop

# 2. Merger la feature dans develop
git merge feature/mobile-view

# 3. Résoudre les conflits si nécessaire
# ... résolution manuelle ...

# 4. Pousser develop
git push origin develop
```

**✅ Résultat** : Vercel met à jour l'environnement de preview `develop`

**⚠️ Tests obligatoires** :
- Tester sur l'URL de preview `develop`
- Vérifier l'intégration avec les autres features mergées
- Valider que tout fonctionne ensemble

---

### 4️⃣ DÉPLOYER EN PRODUCTION

**Situation** : Develop est stable et prêt pour la production

```bash
# 1. Se positionner sur main
git checkout main
git pull origin main

# 2. Merger develop dans main
git merge develop

# 3. Pousser main
git push origin main
```

**✅ Résultat** : Vercel déploie automatiquement en production

**⚠️ ATTENTION** :
- ⛔ Ne jamais pousser directement sur `main` sans passer par `develop`
- ⛔ Ne jamais merger une feature directement dans `main`
- ✅ Toujours tester sur `develop` avant de merger dans `main`
- ✅ Prévenir les testeurs avant un déploiement majeur

---

### 5️⃣ NETTOYER LES BRANCHES

**Situation** : Une feature est mergée et déployée

```bash
# 1. Supprimer la branche locale
git branch -d feature/mobile-view

# 2. Supprimer la branche distante
git push origin --delete feature/mobile-view
```

**✅ Résultat** : Vercel supprime automatiquement le preview de la branche

---

## 🚨 SITUATIONS D'URGENCE

### Hotfix en production

**Situation** : Bug critique en production, les testeurs sont bloqués

```bash
# 1. Créer une branche hotfix depuis main
git checkout main
git checkout -b hotfix/fix-critical-bug

# 2. Corriger le bug
# ... modifications ...

# 3. Commit et push
git add .
git commit -m "fix: correction bug critique connexion"
git push origin hotfix/fix-critical-bug

# 4. Merger dans main ET develop
git checkout main
git merge hotfix/fix-critical-bug
git push origin main

git checkout develop
git merge hotfix/fix-critical-bug
git push origin develop

# 5. Supprimer la branche hotfix
git branch -d hotfix/fix-critical-bug
git push origin --delete hotfix/fix-critical-bug
```

---

## 📊 CONFIGURATION VERCEL

### Paramètres actuels

**Production (main)** :
- Branche : `main`
- Déploiement automatique : ✅ Activé
- URL : `https://ultimate-frisbee-manager.vercel.app`

**Preview (toutes les autres branches)** :
- Déploiement automatique : ✅ Activé
- URL : `https://ultimate-frisbee-manager-[branch-name]-[hash].vercel.app`
- Commentaires GitHub : ✅ Activés (lien preview dans les PR)

### Variables d'environnement

Toutes les branches utilisent les mêmes variables d'environnement :
- `DATABASE_URL` : Supabase Production
- `SUPABASE_URL` : Production
- `CLOUDINARY_URL` : Production
- `NODE_ENV` : `production` (même pour les previews)

**⚠️ Note** : Tous les environnements partagent la même base de données. Les testeurs voient les mêmes données que vous en développement.

---

## ✅ CHECKLIST AVANT CHAQUE DÉPLOIEMENT

### Avant de merger dans develop

- [ ] Code testé localement
- [ ] Tests automatiques passent (si existants)
- [ ] Preview Vercel de la feature validé
- [ ] Pas de régression sur les fonctionnalités existantes
- [ ] Code reviewé (si travail en équipe)

### Avant de merger dans main

- [ ] Develop testé et stable
- [ ] Preview Vercel de develop validé
- [ ] Tests de non-régression complets
- [ ] Testeurs prévenus (si changements majeurs)
- [ ] Documentation mise à jour (si nécessaire)

---

## 🔧 COMMANDES UTILES

### Voir l'état des branches

```bash
# Branches locales
git branch

# Branches distantes
git branch -r

# Toutes les branches
git branch -a

# Voir les différences entre branches
git diff develop..feature/mobile-view
```

### Synchroniser avec le dépôt distant

```bash
# Récupérer toutes les branches distantes
git fetch origin

# Mettre à jour la branche courante
git pull origin <nom-branche>

# Mettre à jour develop depuis main (si main a été mis à jour)
git checkout develop
git merge main
git push origin develop
```

### Annuler des modifications

```bash
# Annuler les modifications non commitées
git checkout -- <fichier>

# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1

# Annuler le dernier commit (supprimer les modifications)
git reset --hard HEAD~1
```

---

## 📝 CONVENTIONS DE NOMMAGE

### Branches

- `main` : Production
- `develop` : Staging
- `feature/<nom-feature>` : Nouvelle fonctionnalité
- `fix/<nom-fix>` : Correction de bug
- `hotfix/<nom-hotfix>` : Correction urgente en production
- `refactor/<nom-refactor>` : Refactoring sans changement fonctionnel

### Commits (Convention Conventional Commits)

```
<type>(<scope>): <description>

Types :
- feat: Nouvelle fonctionnalité
- fix: Correction de bug
- docs: Documentation
- style: Formatage, style
- refactor: Refactoring
- test: Ajout de tests
- chore: Tâches de maintenance

Exemples :
feat(mobile): ajout du menu responsive
fix(auth): correction boucle connexion
docs(workflow): mise à jour procédure déploiement
```

---

## 🎯 RÉSUMÉ VISUEL

```
┌─────────────────────────────────────────────────────────────┐
│                     WORKFLOW GIT FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. Créer feature depuis develop
   develop ──→ feature/mobile-view
   
2. Développer et tester
   feature/mobile-view ──→ Vercel Preview
   
3. Merger dans develop
   feature/mobile-view ──→ develop ──→ Vercel Preview Develop
   
4. Tester develop
   Vercel Preview Develop ──→ Validation
   
5. Déployer en production
   develop ──→ main ──→ Vercel Production
   
6. Nettoyer
   Supprimer feature/mobile-view
```

---

## 📞 AIDE ET SUPPORT

### En cas de problème

1. **Conflit Git** : Demander de l'aide avant de forcer un push
2. **Preview Vercel ne se crée pas** : Vérifier que la branche est bien poussée sur GitHub
3. **Bug en production** : Suivre la procédure hotfix
4. **Doute sur une manipulation** : Demander confirmation avant d'agir

### Ressources

- Documentation Git : https://git-scm.com/doc
- Documentation Vercel : https://vercel.com/docs
- Conventional Commits : https://www.conventionalcommits.org/

---

## 🔄 HISTORIQUE DES VERSIONS

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 18/02/2026 | Création du document - Git Flow Simple avec Vercel |

