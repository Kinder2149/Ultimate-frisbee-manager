# 🚨 Diagnostic Erreur 503 - Service Unavailable

**Date**: 2026-01-26  
**Problème**: `/api/health` retourne 503 après mise à jour des variables

---

## 📊 Analyse de l'Erreur

### Erreurs constatées
- ❌ **503** sur `/api/health` (répété plusieurs fois)
- ❌ **401** sur `/api/auth/profile` et `/api/workspaces/me`
- ⚠️ Erreur LockManager Supabase (problème d'authentification frontend)

### Signification du 503
Le code 503 sur `/api/health` indique que:
1. Le backend démarre mais ne peut pas se connecter à la base de données
2. Le test de connexion DB échoue (`await prisma.$queryRaw\`SELECT 1\``)

---

## 🔍 ÉTAPES DE DIAGNOSTIC

### 1️⃣ Vérifier les Logs Vercel (PRIORITÉ)

**Via l'interface:**
1. Vercel Dashboard → Votre projet
2. **Deployments** → Cliquer sur le dernier déploiement
3. **Functions** → Cliquer sur `backend/server.js`
4. **Voir les logs**

**Via CLI:**
```bash
vercel logs --follow
```

**Logs à chercher:**

#### ✅ Logs de succès (attendus)
```
[Startup] DB target => host: aws-1-eu-west-3.pooler.supabase.com port: 6543
✅ Connexion à la base de données établie.
✅ Cloudinary connecté (api.ping).
Server listening on 0.0.0.0:3000
```

#### ❌ Logs d'erreur (à identifier)
```
❌ Impossible de se connecter à la base de données au démarrage.
PrismaClientInitializationError: Can't reach database server
Error: P1001 - Can't reach database server at ...
```

---

### 2️⃣ Vérifier DATABASE_URL sur Vercel

**Action:**
1. Vercel Dashboard → Settings → Environment Variables
2. Trouver `DATABASE_URL`
3. Vérifier la valeur (cliquer sur Edit pour voir)

**Valeur attendue:**
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%40816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
```

**Points de vérification:**
- ✅ Host: `aws-1-eu-west-3.pooler.supabase.com`
- ✅ Port: `6543` (pas 5432)
- ✅ Mot de passe: `0%40816N7m661C` (avec `%40` pour `@`)
- ✅ Environnement: **Production** coché

**Si la valeur est différente:**
- Éditer et corriger
- Redéployer

---

### 3️⃣ Vérifier l'État de Supabase

#### Vérifier que le projet n'est pas en pause
1. Aller sur: https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
2. Vérifier le statut du projet
3. Si "Paused" → Cliquer "Resume"

#### Vérifier le statut des services
- https://status.supabase.com/

#### Tester la connexion depuis votre machine
```powershell
# Test du pooler Supabase (port 6543)
Test-NetConnection -ComputerName aws-1-eu-west-3.pooler.supabase.com -Port 6543
```

**Résultat attendu:**
```
TcpTestSucceeded : True ✅
```

**Si False:**
- Problème réseau ou Supabase indisponible
- Vérifier status.supabase.com

---

### 4️⃣ Vérifier le Mot de Passe Supabase

**Le mot de passe peut avoir expiré ou été changé.**

#### Tester la connexion avec psql (si installé)
```bash
psql "postgresql://postgres.rnreaaeiccqkwgwxwxeg:0@816N7m661C@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"
```

**Si erreur d'authentification:**
1. Aller sur Supabase Dashboard
2. Settings → Database → "Reset database password"
3. Copier le nouveau mot de passe
4. Encoder le `@` en `%40`
5. Mettre à jour DATABASE_URL sur Vercel
6. Redéployer

---

### 5️⃣ Vérifier les Autres Variables

**Dans Vercel Environment Variables, vérifier:**

```
✅ JWT_SECRET                  Production
✅ JWT_REFRESH_SECRET          Production
✅ CLOUDINARY_URL              Production
✅ CORS_ORIGINS                Production
```

**Si une variable manque:**
- Le backend peut échouer au démarrage
- Voir les logs pour identifier la variable manquante

---

## 🛠️ SOLUTIONS POSSIBLES

### Solution 1: DATABASE_URL incorrect

**Symptôme:** Logs montrent "Can't reach database server"

**Action:**
1. Vérifier DATABASE_URL sur Vercel
2. S'assurer du port 6543
3. S'assurer de l'encodage du mot de passe (`%40` pour `@`)
4. Redéployer

### Solution 2: Mot de passe Supabase incorrect

**Symptôme:** Logs montrent "password authentication failed"

**Action:**
1. Réinitialiser le mot de passe sur Supabase
2. Mettre à jour DATABASE_URL sur Vercel
3. Redéployer

### Solution 3: Projet Supabase en pause

**Symptôme:** Connexion timeout

**Action:**
1. Dashboard Supabase → Vérifier statut
2. Cliquer "Resume" si en pause
3. Attendre 1-2 minutes
4. Redéployer sur Vercel

### Solution 4: Limite de connexions Supabase atteinte

**Symptôme:** "too many connections"

**Action:**
1. Utiliser le pooler (port 6543) ✅ (déjà fait)
2. Vérifier qu'aucun autre service n'utilise trop de connexions
3. Redémarrer le projet Supabase

### Solution 5: Variables non appliquées

**Symptôme:** Logs montrent anciennes valeurs

**Action:**
1. Vérifier que les variables sont pour l'environnement **Production**
2. Forcer un nouveau déploiement (pas juste Redeploy)
3. Ou déployer via CLI: `vercel --prod --force`

---

## 📋 CHECKLIST DE VÉRIFICATION

- [ ] Logs Vercel consultés
- [ ] DATABASE_URL vérifiée (port 6543, mot de passe encodé)
- [ ] Projet Supabase actif (pas en pause)
- [ ] Test de connexion réseau OK (Test-NetConnection)
- [ ] Toutes les variables critiques présentes
- [ ] Variables définies pour l'environnement **Production**
- [ ] Redéploiement effectué après vérifications

---

## 🔧 COMMANDES UTILES

### Voir les logs Vercel
```bash
vercel logs --follow
```

### Forcer un nouveau déploiement
```bash
vercel --prod --force
```

### Tester la connexion Supabase
```powershell
Test-NetConnection -ComputerName aws-1-eu-west-3.pooler.supabase.com -Port 6543
```

### Tester l'API health
```powershell
Invoke-RestMethod -Uri "https://ultimate-frisbee-manager.vercel.app/api/health" -Method Get
```

---

## 📞 PROCHAINES ACTIONS

1. **IMMÉDIAT**: Consulter les logs Vercel pour voir l'erreur exacte
2. **Vérifier**: DATABASE_URL sur Vercel (valeur et environnement)
3. **Vérifier**: Statut du projet Supabase
4. **Tester**: Connexion réseau au pooler
5. **Corriger**: Selon l'erreur identifiée dans les logs
6. **Redéployer**: Après correction

---

**Dernière mise à jour**: 2026-01-26  
**Statut**: En diagnostic
