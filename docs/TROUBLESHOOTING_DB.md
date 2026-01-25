# 🔧 Troubleshooting - Connexion Base de Données

**Date** : 2026-01-25  
**Problème résolu** : Connexion Supabase bloquée

---

## 🚨 Symptôme

```
❌ Impossible de se connecter à la base de données au démarrage.
PrismaClientInitializationError: Can't reach database server at `db.rnreaaeiccqkwgwxwxeg.supabase.co:5432`
```

**Erreur Prisma** : `P1001` (Can't reach database server)

---

## 🔍 Cause racine

**L'URL directe Supabase est bloquée par certains firewalls/réseaux** :
- ❌ `db.rnreaaeiccqkwgwxwxeg.supabase.co:5432` (Direct connection)
- ❌ `db.rnreaaeiccqkwgwxwxeg.supabase.co:6543` (Direct pooler)

**Raisons possibles** :
1. Firewall Windows/antivirus bloque les connexions sortantes
2. Réseau d'entreprise avec restrictions
3. IPv6 mal configuré
4. Supabase a changé d'infrastructure

---

## ✅ Solution

**Utiliser l'URL Pooler AWS de Supabase** au lieu de l'URL directe.

### URL qui fonctionne

```bash
# Session mode (développement local) - Port 5432
DATABASE_URL="postgresql://postgres.rnreaaeiccqkwgwxwxeg:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"

# Transaction mode (production Vercel) - Port 6543
DATABASE_URL="postgresql://postgres.rnreaaeiccqkwgwxwxeg:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"
```

### Où trouver l'URL correcte

**Dashboard Supabase** :
1. Aller sur https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg
2. **Settings** → **Database**
3. **Connection Pooling** → Onglet **"Session mode"** (dev) ou **"Transaction mode"** (prod)
4. Copier l'URL complète
5. Remplacer `[YOUR-PASSWORD]` par votre mot de passe

---

## 🧪 Test de connexion réseau

**Vérifier si le pooler est accessible** :

```powershell
# Test port 5432 (Session mode)
Test-NetConnection -ComputerName aws-1-eu-west-3.pooler.supabase.com -Port 5432

# Test port 6543 (Transaction mode)
Test-NetConnection -ComputerName aws-1-eu-west-3.pooler.supabase.com -Port 6543
```

**Résultat attendu** :
```
TcpTestSucceeded : True ✅
```

---

## 📝 Configuration

### Développement local (.env)

```bash
# Session mode recommandé pour dev local
DATABASE_URL="postgresql://postgres.rnreaaeiccqkwgwxwxeg:0%408l6N7m661C@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
```

### Production Vercel

**Variables d'environnement Vercel** :

```bash
# Transaction mode recommandé pour production
DATABASE_URL="postgresql://postgres.rnreaaeiccqkwgwxwxeg:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"
```

---

## 🔄 Différences Session vs Transaction mode

### Session mode (port 5432)

**Utilisation** : Développement local, scripts, migrations

**Caractéristiques** :
- Connexions longues durées
- Meilleure performance pour requêtes complexes
- Limite de connexions simultanées

**Quand l'utiliser** :
- `npm run dev` (développement)
- `npx prisma migrate dev`
- `npx prisma db seed`

### Transaction mode (port 6543)

**Utilisation** : Production, serverless (Vercel Functions)

**Caractéristiques** :
- Connexions courtes (par transaction)
- Optimisé pour serverless
- Pool de connexions partagé
- Pas de limite stricte de connexions

**Quand l'utiliser** :
- Déploiement Vercel
- Environnement serverless
- Forte concurrence

---

## ⚠️ Encodage du mot de passe

**Si votre mot de passe contient des caractères spéciaux**, ils doivent être encodés :

| Caractère | Encodage |
|-----------|----------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `%` | `%25` |

**Exemple** :
- Mot de passe : `0@8l6N7m661C`
- Encodé : `0%408l6N7m661C`

---

## 🆘 Si ça ne fonctionne toujours pas

### 1. Vérifier le statut Supabase

https://status.supabase.com/

### 2. Vérifier que le projet n'est pas en pause

Dashboard → Projet → Si "Paused" → Cliquer "Resume"

### 3. Régénérer le mot de passe

Dashboard → Settings → Database → "Reset database password"

### 4. Tester avec psql (si installé)

```bash
psql "postgresql://postgres.rnreaaeiccqkwgwxwxeg:[PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
```

### 5. Solution de secours : PostgreSQL local

```bash
# Installer PostgreSQL localement
winget install PostgreSQL.PostgreSQL

# Créer la DB
createdb ultimate_frisbee

# Dans .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ultimate_frisbee"

# Appliquer migrations
cd backend
npx prisma migrate dev
npx prisma db seed
```

---

## 📚 Ressources

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

---

## ✅ Checklist de résolution

- [x] Tester connexion réseau au pooler
- [x] Mettre à jour DATABASE_URL dans `.env`
- [x] Vérifier encodage du mot de passe
- [x] Tester `npm run dev`
- [x] Vérifier logs : `✅ Connexion à la base de données établie.`
- [x] Mettre à jour `.env.example`
- [x] Documenter solution

---

**Dernière mise à jour** : 2026-01-25  
**Statut** : ✅ Résolu
