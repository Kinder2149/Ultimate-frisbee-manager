# 📋 Valeurs Exactes pour Vercel - À Copier-Coller

**Date**: 2026-01-26  
**Action**: Copier ces valeurs dans Vercel Environment Variables

---

## 🔴 VARIABLES CRITIQUES - Production

### 1. DATABASE_URL

**Valeur à copier:**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
```

**Note importante:**
- Le caractère `@` dans votre mot de passe a été encodé en `%40`
- Port **6543** (Transaction mode pour production)

**Comment l'ajouter:**
1. Vercel Dashboard → Settings → Environment Variables
2. Trouver `DATABASE_URL` → Éditer (ou Ajouter si n'existe pas)
3. Copier-coller la valeur ci-dessus
4. Environnement: **Production** ✅
5. Sauvegarder

---

### 2. JWT_SECRET

**Valeur à copier:**
```
k8mP2vN9xQ4wR7tY3uZ6aB1cD5eF0gH8iJ2kL4mN7oP9qR3sT6uV8wX1yZ4aB7cD
```

**Comment l'ajouter:**
1. Vercel Dashboard → Settings → Environment Variables
2. Cliquer "Add Environment Variable"
3. Name: `JWT_SECRET`
4. Value: Copier-coller la valeur ci-dessus
5. Environnement: **Production** ✅
6. Sauvegarder

---

### 3. JWT_REFRESH_SECRET

**Valeur à copier:**
```
9nM6kJ3hG1fE4dC7bA0zY8xW5vU2tS9rQ6pO3nM0lK7jI4hG1fE8dC5bA2zY9xW6v
```

**Note:** Ce secret est différent de JWT_SECRET (requis)

**Comment l'ajouter:**
1. Vercel Dashboard → Settings → Environment Variables
2. Cliquer "Add Environment Variable"
3. Name: `JWT_REFRESH_SECRET`
4. Value: Copier-coller la valeur ci-dessus
5. Environnement: **Production** ✅
6. Sauvegarder

---

### 4. CLOUDINARY_URL

**Valeur à copier:**
```
cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6
```

**Comment l'ajouter:**
1. Vercel Dashboard → Settings → Environment Variables
2. Trouver `CLOUDINARY_URL` → Éditer (ou Ajouter si n'existe pas)
3. Copier-coller la valeur ci-dessus
4. Environnement: **Production** ✅
5. Sauvegarder

---

### 5. CORS_ORIGINS

**Valeur à copier (à adapter avec votre URL exacte):**
```
https://ultimate-frisbee-manager.vercel.app
```

**⚠️ IMPORTANT:** Remplacez par l'URL exacte de votre déploiement Vercel

**Comment trouver votre URL:**
1. Vercel Dashboard → Deployments
2. Cliquer sur le dernier déploiement
3. Copier l'URL affichée en haut

**Comment l'ajouter:**
1. Vercel Dashboard → Settings → Environment Variables
2. Trouver `CORS_ORIGINS` → Éditer (ou Ajouter si n'existe pas)
3. Copier-coller votre URL Vercel
4. Environnement: **Production** ✅
5. Sauvegarder

---

## 🟡 VARIABLES OPTIONNELLES - Production

### 6. NODE_ENV

**Valeur à copier:**
```
production
```

**Note:** Déjà défini dans vercel.json, mais peut être ajouté ici pour être explicite

---

### 7. SUPABASE_PROJECT_REF

**Valeur à copier:**
```
rnreaaeiccqkwgwxwxeg
```

---

## ✅ RÉCAPITULATIF - Checklist de Vérification

Après avoir ajouté toutes les variables, vérifier dans Vercel Environment Variables:

```
✅ DATABASE_URL                Production
   postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres

✅ JWT_SECRET                  Production
   k8mP2vN9xQ4wR7tY3uZ6aB1cD5eF0gH8iJ2kL4mN7oP9qR3sT6uV8wX1yZ4aB7cD

✅ JWT_REFRESH_SECRET          Production
   9nM6kJ3hG1fE4dC7bA0zY8xW5vU2tS9rQ6pO3nM0lK7jI4hG1fE8dC5bA2zY9xW6v

✅ CLOUDINARY_URL              Production
   cloudinary://937631178698815:N4HlT6CFvZbnffM62qudAUc313g@dmiqnc2o6

✅ CORS_ORIGINS                Production
   https://[VOTRE-URL].vercel.app

🟡 NODE_ENV                    Production (optionnel)
   production

🟡 SUPABASE_PROJECT_REF        Production (optionnel)
   rnreaaeiccqkwgwxwxeg
```

---

## 🚀 APRÈS AVOIR AJOUTÉ LES VARIABLES

### 1. Redéployer (OBLIGATOIRE)

**Via l'interface Vercel:**
1. Deployments → `...` → Redeploy
2. Attendre 2-3 minutes

**Ou via CLI:**
```bash
vercel --prod
```

### 2. Tester

**Health Check:**
```
https://votre-projet.vercel.app/api/health
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

**Script de validation:**
```powershell
.\validate-production.ps1 https://votre-projet.vercel.app
```

---

## 🔒 SÉCURITÉ

**⚠️ IMPORTANT:**
- Ces valeurs sont sensibles et confidentielles
- Ne JAMAIS les commiter dans Git
- Ne JAMAIS les partager publiquement
- Les secrets JWT générés sont uniques pour votre production

**Après déploiement réussi:**
- Supprimer ce fichier de votre machine locale
- Ou le garder dans un endroit sécurisé (pas dans Git)

---

## 📝 NOTES TECHNIQUES

### Encodage du mot de passe

Votre mot de passe: `0@816N7m661C`
- Le caractère `@` est encodé en `%40` pour l'URL
- Résultat: `0%40816N7m661C`

### Pourquoi port 6543 ?

- **Port 5432**: Session mode (connexions longues, dev local)
- **Port 6543**: Transaction mode (connexions courtes, serverless, production)

Vercel utilise des serverless functions qui nécessitent le Transaction mode (port 6543).

---

**Dernière mise à jour**: 2026-01-26  
**Statut**: ✅ Prêt à copier dans Vercel
