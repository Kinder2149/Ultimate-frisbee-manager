# 🔧 SETUP PROPRE - COMMANDES FINALES

## Problème Identifié

1. ❌ Prisma 7 installé (incompatible) au lieu de Prisma 5.22.0
2. ❌ `nodemon` manquant dans node_modules
3. ❌ Node 24 au lieu de Node 20

---

## ✅ SOLUTION COMPLÈTE (Copier-Coller)

### Dans le terminal Codespaces, exécutez ces commandes:

```bash
# 1. Nettoyer complètement
cd /workspaces/Ultimate-frisbee-manager/backend
rm -rf node_modules package-lock.json
rm -rf ../node_modules ../package-lock.json

# 2. Copier la configuration
cp .env.codespaces .env

# 3. Installer les dépendances avec les bonnes versions
npm install

# 4. Vérifier que Prisma 5.22.0 est installé
npx prisma --version
# Doit afficher: prisma: 5.22.0

# 5. Exécuter la migration
npx prisma migrate dev --name add_updated_at_fields

# 6. Démarrer le serveur
npm run dev
```

---

## 📊 RÉSULTATS ATTENDUS

### ✅ Après `npm install`:
```
added 1538 packages
```

### ✅ Après `npx prisma --version`:
```
prisma                  : 5.22.0
@prisma/client          : 5.22.0
```

### ✅ Après migration:
```
✔ Migration applied successfully
OU
⚠️ Migration already applied (normal si déjà fait en production)
```

### ✅ Après `npm run dev`:
```
[Startup] Server listening on http://0.0.0.0:3000
✅ Database connected
```

---

## 🆘 SI ERREUR "Migration already applied"

C'est **NORMAL** ! La migration a déjà été appliquée en production via Vercel.

Dans ce cas:
```bash
# Juste vérifier le statut
npx prisma migrate status

# Générer le client
npx prisma generate

# Démarrer
npm run dev
```

---

## ✅ VÉRIFICATION FINALE

Une fois le serveur démarré, tester:

```bash
# Dans un nouveau terminal
curl http://localhost:3000/api/sync/health
```

Devrait retourner:
```json
{"status":"ok","timestamp":"2026-01-27T..."}
```

---

**Exécutez ces commandes et envoyez-moi le résultat !**
