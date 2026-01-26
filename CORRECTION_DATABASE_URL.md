# 🔴 CORRECTION URGENTE - DATABASE_URL pour Vercel

**Date**: 2026-01-26 11:00  
**Problème**: `prepared statement "s0" already exists` (Code PostgreSQL: 42P05)

---

## 🚨 Erreur Identifiée dans les Logs

```
PrismaClientUnknownRequestError: prepared statement "s0" already exists
ConnectorError: QueryError(PostgresError { code: "42P05" })
```

**Cause**: Supabase Connection Pooler en mode Transaction nécessite `pgbouncer=true` dans l'URL pour désactiver les prepared statements.

---

## ✅ SOLUTION IMMÉDIATE

### Étape 1: Mettre à Jour DATABASE_URL sur Vercel

**Ancienne URL (INCORRECTE):**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
```

**Nouvelle URL (CORRECTE avec pgbouncer=true):**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Changements:**
- ✅ Ajout de `?pgbouncer=true` - Désactive les prepared statements
- ✅ Ajout de `&connection_limit=1` - Limite les connexions en serverless

---

## 📋 PROCÉDURE DE CORRECTION

### 1. Mettre à Jour sur Vercel

1. **Aller sur**: https://vercel.com/dashboard
2. **Sélectionner** votre projet
3. **Settings** → **Environment Variables**
4. **Trouver** `DATABASE_URL`
5. **Cliquer** sur `...` → **Edit**
6. **Remplacer** par la nouvelle URL ci-dessus
7. **Environnement**: Production ✅
8. **Sauvegarder**

### 2. Redéployer

**Via l'interface:**
1. **Deployments** → `...` → **Redeploy**
2. Attendre 2-3 minutes

**Via CLI:**
```bash
vercel --prod
```

### 3. Tester

**Test 1: Health Check**
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

**Test 2: Login**
```
https://ultimate-frisbee-manager.vercel.app
```
- Se connecter avec vos identifiants
- Vérifier qu'il n'y a plus d'erreurs 500

---

## 🔍 Explication Technique

### Pourquoi `pgbouncer=true` ?

**Supabase Connection Pooler** utilise PgBouncer en mode Transaction:
- **Sans `pgbouncer=true`**: Prisma utilise des prepared statements
- **Problème**: En serverless, chaque invocation peut réutiliser une connexion poolée
- **Résultat**: Conflit "prepared statement already exists"
- **Solution**: `pgbouncer=true` force Prisma à désactiver les prepared statements

### Pourquoi `connection_limit=1` ?

**Vercel Serverless Functions**:
- Chaque invocation est isolée
- Limiter à 1 connexion évite les fuites de connexions
- Optimise l'utilisation du pool Supabase

---

## 📊 Résumé des Erreurs Corrigées

### Avant la Correction

| Endpoint | Status | Erreur |
|----------|--------|--------|
| `/api/health` | 503 | database_unreachable |
| `/api/auth/login` | 500 | prepared statement "s0" already exists |
| `/api/exercises` | 500 | prepared statement "s0" already exists |
| `/api/dashboard/stats` | 500 | prepared statement "s0" already exists |
| `/api/workspaces/me` | 401 | No token (car login échoue) |

### Après la Correction (Attendu)

| Endpoint | Status | Résultat |
|----------|--------|----------|
| `/api/health` | 200 | `{"status":"ok","db":true}` |
| `/api/auth/login` | 200 | Token JWT retourné |
| `/api/exercises` | 200 | Liste des exercices |
| `/api/dashboard/stats` | 200 | Statistiques |
| `/api/workspaces/me` | 200 | Workspace actif |

---

## 🔧 Modifications du Code

### Fichier Modifié: `backend/services/prisma.js`

**Amélioration**: Configuration explicite pour production avec commentaires sur pgbouncer.

**Changement**:
```javascript
// Production: Configuration pour Vercel serverless
prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

**Note**: Le paramètre `pgbouncer=true` doit être dans `DATABASE_URL`, pas dans le code.

---

## ⚠️ IMPORTANT

### DATABASE_URL Complète à Copier

**Si votre mot de passe Supabase est `0@816N7m661C`:**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Si vous avez un autre mot de passe:**
1. Encoder les caractères spéciaux (`@` → `%40`)
2. Utiliser ce format:
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:[MOT_DE_PASSE_ENCODÉ]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

---

## 🆘 Si le Problème Persiste

### Vérifier les Logs Vercel

```bash
vercel logs --follow
```

**Chercher:**
- ✅ Plus d'erreur "prepared statement"
- ✅ Connexions DB réussies
- ❌ Nouvelles erreurs (si oui, les copier)

### Vérifier Supabase

1. https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
2. Vérifier que le projet n'est pas en pause
3. Vérifier les logs de connexion

---

## 📞 Ressources

- **Documentation Prisma + PgBouncer**: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#pgbouncer
- **Supabase Connection Pooling**: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
- **Vercel Serverless Functions**: https://vercel.com/docs/functions/serverless-functions

---

**Dernière mise à jour**: 2026-01-26 11:00 UTC+1  
**Priorité**: 🔴 CRITIQUE  
**Action requise**: Mettre à jour DATABASE_URL sur Vercel MAINTENANT
