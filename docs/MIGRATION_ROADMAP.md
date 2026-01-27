# Feuille de Route de Migration - Ultimate Frisbee Manager

**Date**: 27 janvier 2026  
**Objectif**: Garantir l'intégrité des données de base après chaque migration

---

## 🎯 Problématique

Lors des migrations Prisma, certains éléments de base peuvent être perdus :
- Compte administrateur
- Workspaces par défaut (BASE, TEST)
- Tags de base pour la classification

## ✅ Solution : Script de Migration Idempotent

### Fichier principal
`backend/scripts/migration-complete.js`

### Caractéristiques
- **Idempotent** : Peut être exécuté plusieurs fois sans effets secondaires
- **Complet** : Couvre tous les éléments de base nécessaires
- **Sécurisé** : Vérifie l'existence avant création
- **Verbeux** : Rapport détaillé des actions effectuées

---

## 📋 Éléments Garantis

### 1. Compte Administrateur
```javascript
{
  email: 'admin@ultimate.com',
  password: 'Ultim@t+', // À changer en production
  nom: 'Admin',
  prenom: 'System',
  role: 'ADMIN'
}
```

### 2. Workspaces par défaut
- **BASE** : Workspace par défaut pour tous les utilisateurs
- **TEST** : Workspace de test pour les développements

### 3. Tags de base (38 tags au total)

#### Objectifs (4)
- Technique
- Tactique  
- Physique
- Mental

#### Travail spécifique (3)
- Lancement
- Réception
- Pivot

#### Niveaux (3)
- Débutant
- Intermédiaire
- Avancé

#### Temps (3)
- Court
- Moyen
- Long

#### Formats (3)
- Solo
- Paire
- Groupe

#### Thèmes d'entraînement (5)
- Offensif
- Défensif
- Transition
- Spécial
- Conditionnement

---

## 🚀 Utilisation

### Exécution manuelle
```bash
cd backend
node scripts/migration-complete.js
```

### Intégration dans le workflow

#### Après chaque migration Prisma
```bash
# 1. Appliquer la migration
npx prisma migrate deploy

# 2. Exécuter la migration de base
node scripts/migration-complete.js

# 3. Vérifier l'état
node scripts/verify-and-seed-auth.js
```

#### Avant chaque déploiement
```bash
# 1. Vérifier l'état actuel
node scripts/verify-and-seed-auth.js

# 2. Si problème, exécuter la migration complète
node scripts/migration-complete.js
```

---

## 📊 Rapport de Migration

Le script génère un rapport complet avec :

### Statistiques générales
- 👥 Utilisateurs
- 📁 Workspaces
- 🔗 Relations workspace-user
- 🏷️ Tags
- 🏃 Exercices
- 📋 Entraînements
- 🔥 Échauffements
- ⚽ Situations de match

### Vérifications spécifiques
- ✅ Admin présent et configuré
- ✅ Workspace BASE existant
- ✅ Workspace TEST existant

### Actions effectuées
- ➕ Éléments créés
- ✅ Éléments existants
- 🔗 Relations établies

---

## 🔧 Maintenance

### Mise à jour des éléments de base

Pour modifier les éléments de base :

1. **Éditer le script** `backend/scripts/migration-complete.js`
2. **Modifier les constantes** :
   - `ADMIN_CONFIG` pour le compte admin
   - `WORKSPACES_CONFIG` pour les workspaces
   - `TAGS_CONFIG` pour les tags

3. **Tester** :
   ```bash
   node scripts/migration-complete.js
   ```

### Ajout de nouveaux éléments

Pour ajouter de nouveaux types d'éléments :

1. **Créer une nouvelle fonction** (ex: `createOrUpdateRoles()`)
2. **Ajouter la configuration** correspondante
3. **Appeler la fonction** dans `main()`
4. **Mettre à jour le rapport** dans `generateReport()`

---

## 🚨 Dépannage

### Problèmes courants

#### 1. Module non trouvé
```
Error: Cannot find module 'bcryptjs'
```
**Solution** : Le script utilise `bcryptjs` qui est une dépendance du backend.

#### 2. Erreur de connexion
```
Error: PrismaClientValidationError
```
**Solution** : Vérifier que `DATABASE_URL` est correctement configuré dans `.env`.

#### 3. Tags avec label undefined
**Symptôme** : Des tags avec `label: null` apparaissent
**Solution** : Le script ne gère pas la suppression des tags invalides (contrainte Prisma).

### Logs utiles

Le script fournit des logs détaillés :
- 🔍 Étape en cours
- ✅ Élément existant
- ➕ Élément créé
- 🔗 Relation établie

---

## 🔄 Workflow Recommandé

### Développement local
```bash
# 1. Après une modification du schéma
npx prisma migrate dev --name nom_migration

# 2. Toujours exécuter la migration de base
node scripts/migration-complete.js

# 3. Vérifier
node scripts/verify-and-seed-auth.js
```

### Déploiement production
```bash
# 1. Déployer le schéma
npx prisma migrate deploy

# 2. Garantir les éléments de base
node scripts/migration-complete.js

# 3. Vérifier avant de continuer
node scripts/verify-and-seed-auth.js
```

### Récupération après problème
```bash
# 1. Diagnostic
node scripts/verify-and-seed-auth.js

# 2. Si éléments manquants
node scripts/migration-complete.js

# 3. Vérification finale
node scripts/verify-and-seed-auth.js
```

---

## 📝 Historique des migrations

### Migration du 27 janvier 2026
- **Problème** : Tags avec `label: undefined` après migration
- **Solution** : Script de migration complet créé
- **Résultat** : 38 tags corrects (au lieu de 23 invalides)
- **Impact** : Aucune perte de données, récupération transparente

### Éléments restaurés
- ✅ Compte admin : `admin@ultimate.com`
- ✅ Workspace BASE : `fa35b1ea-3021-448b-8fa5-eb64125d5cb3`
- ✅ Workspace TEST : `9371d317-a2d8-4d44-9b2e-56dd96bd0fa4`
- ✅ 38 tags de base corrects

---

## 🎯 Recommandations

### 1. Automatisation
Intégrer le script dans les hooks Git ou les pipelines CI/CD :
```bash
# .git/hooks/post-merge
#!/bin/bash
cd backend && node scripts/migration-complete.js
```

### 2. Surveillance
Ajouter une vérification régulière dans le monitoring :
```javascript
// Vérification hebdomadaire
const healthCheck = async () => {
  const result = await node scripts/verify-and-seed-auth.js;
  if (result.errors > 0) {
    alert('Éléments de base manquants - Migration requise');
  }
};
```

### 3. Documentation
Maintenir cette documentation à jour avec chaque modification du script.

---

## ✅ Conclusion

Le script `migration-complete.js` garantit que **tous les éléments de base sont toujours présents** après chaque migration, qu'elle soit manuelle ou automatique.

**Points clés** :
- 🔒 **Idempotent** : Safe à exécuter multiple fois
- 🛡️ **Complet** : Couvre tous les éléments critiques
- 📊 **Verbeux** : Rapport détaillé pour le debugging
- 🚀 **Automatisable** : Intégrable dans les workflows

**Commande à retenir** :
```bash
node backend/scripts/migration-complete.js
```

Cette commande devrait être exécutée **après chaque migration Prisma** pour garantir l'intégrité des données de base.
