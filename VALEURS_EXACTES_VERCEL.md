# 🎯 VALEURS EXACTES À COPIER DANS VERCEL

**Date**: 2026-01-26  
**Action**: Copier-coller ces valeurs dans Vercel Environment Variables

---

## 🔴 CRITIQUE: DATABASE_URL

### ⚠️ IMPORTANT: Vérifier d'abord votre mot de passe Supabase

**Avant de copier cette valeur, vous DEVEZ vérifier que votre mot de passe Supabase est bien:**
```
0@816N7m661C
```

**Comment vérifier:**
1. Aller sur: https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
2. **Settings** → **Database**
3. Vérifier le mot de passe ou le réinitialiser si nécessaire

---

### Si le mot de passe est `0@816N7m661C`

**Copier cette valeur exacte:**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
```

**Détails de l'encodage:**
- Mot de passe brut: `0@816N7m661C`
- Caractère `@` encodé en `%40`
- Mot de passe encodé: `0%40816N7m661C`
- Port: **6543** (Transaction mode - OBLIGATOIRE pour Vercel)

---

### Si vous avez réinitialisé le mot de passe

**Si votre nouveau mot de passe est différent, utilisez ce format:**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:[VOTRE_MOT_DE_PASSE_ENCODÉ]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
```

**Encodage des caractères spéciaux:**
| Caractère | Encodage |
|-----------|----------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `=` | `%3D` |

**Exemple:**
- Mot de passe: `MyP@ss:123`
- Encodé: `MyP%40ss%3A123`
- URL: `postgresql://postgres.rnreaaeiccqkwgwxwxeg:MyP%40ss%3A123@aws-1-eu-west-3.pooler.supabase.com:6543/postgres`

---

## 🟡 JWT_SECRET

**Copier cette valeur exacte:**
```
k8mP2vN9xQ4wR7tY3uZ6aB1cD5eF0gH8iJ2kL4mN7oP9qR3sT6uV8wX1yZ4aB7cD
```

---

## 🟡 JWT_REFRESH_SECRET

**Copier cette valeur exacte:**
```
9nM6kJ3hG1fE4dC7bA0zY8xW5vU2tS9rQ6pO3nM0lK7jI4hG1fE8dC5bA2zY9xW6v
```

---

## 🟢 CLOUDINARY_URL

**Copier cette valeur exacte:**
```
cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6
```

---

## 🟢 CORS_ORIGINS

**Copier cette valeur exacte:**
```
https://ultimate-frisbee-manager.vercel.app
```

**⚠️ IMPORTANT:** Si votre URL Vercel est différente, adaptez cette valeur.

---

## 📋 PROCÉDURE DE MISE À JOUR SUR VERCEL

### Étape 1: Accéder aux Variables d'Environnement

1. Aller sur: https://vercel.com/dashboard
2. Sélectionner votre projet
3. **Settings** → **Environment Variables**

### Étape 2: Mettre à Jour DATABASE_URL

1. Trouver `DATABASE_URL`
2. Cliquer sur `...` → **Edit**
3. **Coller** la valeur ci-dessus
4. **Vérifier** que l'environnement **Production** est coché ✅
5. **Sauvegarder**

### Étape 3: Vérifier les Autres Variables

Pour chaque variable (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_URL`, `CORS_ORIGINS`):
1. Vérifier qu'elle existe
2. Vérifier que la valeur correspond
3. Vérifier que **Production** est coché ✅

### Étape 4: Redéployer

1. Aller dans **Deployments**
2. Cliquer sur `...` du dernier déploiement
3. **Redeploy**
4. Attendre 2-3 minutes

### Étape 5: Tester

**Ouvrir dans le navigateur:**
```
https://ultimate-frisbee-manager.vercel.app/api/health
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "db": true,
  "timestamp": "2026-01-26T...",
  "env": "production"
}
```

**Si `"db": false`:**
- Le mot de passe Supabase est incorrect
- Vérifier/réinitialiser le mot de passe sur Supabase
- Mettre à jour DATABASE_URL avec le nouveau mot de passe encodé

---

## 🔍 VÉRIFICATIONS SUPPLÉMENTAIRES

### Vérifier que Supabase n'est pas en pause

1. https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
2. Vérifier le statut du projet
3. Si "Paused" → Cliquer **"Resume"**

### Vérifier les logs Vercel

```bash
vercel logs --follow
```

**Chercher:**
- `Authentication failed` → Mot de passe incorrect
- `Can't reach database server` → Supabase indisponible
- `Missing environment variable` → Variable manquante

---

## ⚠️ POINTS CRITIQUES

### ✅ Port 6543 OBLIGATOIRE

**NE PAS utiliser le port 5432 sur Vercel!**

- Port 5432 = Session mode (dev local uniquement)
- Port 6543 = Transaction mode (production Vercel)

### ✅ Encodage du Mot de Passe

**Le caractère `@` DOIT être encodé en `%40`**

- ❌ Incorrect: `0@816N7m661C`
- ✅ Correct: `0%40816N7m661C`

### ✅ Environnement Production

**Toutes les variables DOIVENT avoir "Production" coché**

---

## 🆘 SI LE PROBLÈME PERSISTE

### Scénario 1: Toujours "Authentication failed"

**Solution:**
1. Réinitialiser le mot de passe sur Supabase
2. Encoder le nouveau mot de passe (remplacer `@` par `%40`, etc.)
3. Mettre à jour DATABASE_URL sur Vercel
4. Redéployer

### Scénario 2: "Can't reach database server"

**Solution:**
1. Vérifier: https://status.supabase.com/
2. Vérifier que le projet n'est pas en pause
3. Attendre et réessayer

### Scénario 3: Autres erreurs

**Consulter les logs:**
```bash
vercel logs --follow
```

---

## 📞 LIENS UTILES

- **Supabase Dashboard**: https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Status**: https://status.supabase.com/
- **Encodeur URL**: https://www.urlencoder.org/

---

**Dernière mise à jour**: 2026-01-26 09:47 UTC+1  
**Priorité**: 🔴 CRITIQUE
