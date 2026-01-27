# 🎯 Guide Visuel - Interface Vercel

**Navigation rapide pour corriger les erreurs de production**

---

## 📍 Accéder aux Variables d'Environnement

### Étape 1: Aller sur le Dashboard Vercel
```
https://vercel.com/dashboard
```

### Étape 2: Sélectionner votre projet
- Cliquer sur le projet **"ultimate-frisbee-manager"** (ou le nom de votre projet)

### Étape 3: Ouvrir les Settings
```
Barre de navigation en haut → Settings
```

### Étape 4: Accéder aux Environment Variables
```
Menu latéral gauche → Environment Variables
```

**Vous devriez voir une interface similaire à votre capture d'écran avec:**
- Liste des variables existantes
- Bouton "Add Environment Variable" en haut à droite

---

## ✏️ Modifier une Variable Existante

### Pour DATABASE_URL (exemple)

1. **Trouver la variable** `DATABASE_URL` dans la liste
2. **Cliquer sur les 3 points** `...` à droite de la variable
3. **Sélectionner "Edit"**
4. **Modifier la valeur**:
   ```
   postgresql://postgres.rnreaaeiccqkwgwxwxeg:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
   ```
5. **Vérifier l'environnement**: Production ✅
6. **Cliquer sur "Save"**

---

## ➕ Ajouter une Nouvelle Variable

### Pour JWT_SECRET (exemple)

1. **Cliquer sur "Add Environment Variable"** (bouton en haut à droite)
2. **Remplir le formulaire**:
   - **Name**: `JWT_SECRET`
   - **Value**: `[votre-secret-32-caracteres]`
   - **Environment**: Cocher **Production** ✅
3. **Cliquer sur "Save"**

---

## 🔄 Redéployer Après Modifications

**IMPORTANT**: Les modifications de variables ne sont appliquées qu'après un redéploiement!

### Méthode 1: Via l'interface (Recommandé)

1. **Aller sur "Deployments"** (menu du haut)
2. **Trouver le dernier déploiement** (en haut de la liste)
3. **Cliquer sur les 3 points** `...` à droite
4. **Sélectionner "Redeploy"**
5. **Confirmer** en cliquant sur "Redeploy" dans la popup

### Méthode 2: Via CLI

```bash
# Se connecter à Vercel (si pas déjà fait)
vercel login

# Lier le projet (si pas déjà fait)
vercel link

# Déployer en production
vercel --prod
```

---

## 📊 Vérifier les Logs

### Via l'interface

1. **Aller sur "Deployments"**
2. **Cliquer sur le dernier déploiement**
3. **Onglet "Functions"** (si vous avez des serverless functions)
4. **Cliquer sur une fonction** (ex: `backend/server.js`)
5. **Voir les logs** en temps réel

### Via CLI

```bash
# Logs en temps réel
vercel logs --follow

# Logs du dernier déploiement
vercel logs
```

---

## 🔍 Vérifier l'URL de Déploiement

### Trouver l'URL exacte de votre application

1. **Aller sur "Deployments"**
2. **Cliquer sur le dernier déploiement** (celui avec ✅ Ready)
3. **L'URL est affichée en haut** (ex: `https://ultimate-frisbee-manager-abc123.vercel.app`)
4. **Copier cette URL** pour la mettre dans `CORS_ORIGINS`

**Ou cliquer sur "Visit"** pour ouvrir l'application dans un nouvel onglet.

---

## 🎯 Checklist Visuelle

Dans l'interface **Environment Variables**, vous devriez voir:

```
✅ DATABASE_URL                Production
   postgresql://postgres.rnreaaeiccqkwgwxwxeg:***@aws-1-eu-west-3.pooler.supabase.com:6543/postgres

✅ JWT_SECRET                  Production
   [Hidden]

✅ JWT_REFRESH_SECRET          Production
   [Hidden]

✅ CLOUDINARY_URL              Production
   cloudinary://937631178698815:***@dmiqnc2o6

✅ CORS_ORIGINS                Production
   https://ultimate-frisbee-manager.vercel.app

🟡 NODE_ENV                    Production (optionnel)
   production

🟡 SUPABASE_PROJECT_REF        Production (optionnel)
   rnreaaeiccqkwgwxwxeg
```

---

## 🚨 Erreurs Courantes

### "Variable not found in environment"

**Cause**: Variable manquante  
**Solution**: Ajouter la variable (voir section "Ajouter une Nouvelle Variable")

### "Changes not applied"

**Cause**: Pas de redéploiement après modification  
**Solution**: Redéployer (voir section "Redéployer Après Modifications")

### "Invalid value format"

**Cause**: Format de valeur incorrect  
**Solution**: Vérifier le format dans `VERCEL_PRODUCTION_CHECKLIST.md`

---

## 💡 Astuces

### Copier une variable d'un environnement à l'autre

1. Éditer la variable
2. Cocher les environnements supplémentaires (Preview, Development)
3. Sauvegarder

### Voir la valeur d'une variable

1. Cliquer sur les 3 points `...`
2. Sélectionner "Edit"
3. La valeur est visible (mais peut être masquée pour les secrets)

### Supprimer une variable

1. Cliquer sur les 3 points `...`
2. Sélectionner "Delete"
3. Confirmer

---

## 📱 Interface Mobile

L'interface Vercel est responsive. Sur mobile:
- Menu hamburger ☰ en haut à gauche
- Même navigation que sur desktop
- Peut être plus pratique d'utiliser un ordinateur pour les modifications

---

## 🔗 Liens Rapides

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Documentation Vercel**: https://vercel.com/docs
- **Support Vercel**: https://vercel.com/support

---

**Dernière mise à jour**: 2026-01-26
