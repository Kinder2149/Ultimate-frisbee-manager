# 🎯 SOLUTION DÉFINITIVE - PRISMA 5.22.0

## Problème Racine

npm installe Prisma 7 au lieu de Prisma 5.22.0 à cause du cache et de l'installation au mauvais niveau (root workspace).

---

## ✅ COMMANDES FINALES (Copier-Coller)

```bash
# 1. Nettoyage COMPLET (cache npm inclus)
cd /workspaces/Ultimate-frisbee-manager/backend
rm -rf node_modules package-lock.json
rm -rf ../node_modules ../package-lock.json
npm cache clean --force

# 2. Configuration
cp .env.codespaces .env

# 3. Installation UNIQUEMENT dans backend (pas root)
npm install --legacy-peer-deps

# 4. Vérifier versions
node --version
npx prisma --version

# 5. Générer client
npx prisma generate

# 6. Migration (utiliser deploy pour éviter Prisma 7)
npx prisma migrate deploy

# 7. Si migrate deploy échoue, essayer:
npx prisma db push

# 8. Démarrer
npm run dev
```

---

## 📊 RÉSULTATS ATTENDUS

### Après `npx prisma --version`:
```
prisma                  : 5.22.0
@prisma/client          : 5.22.0
```

### Après `npx prisma migrate deploy`:
```
✔ Applied migration(s)
OU
No pending migrations
```

### Après `npm run dev`:
```
[Startup] Server listening on http://0.0.0.0:3000
✅ Database connected
```

---

## 🆘 SI ENCORE PRISMA 7

Si `npx prisma --version` montre encore 7.x:

```bash
# Forcer désinstallation globale
npm uninstall -g prisma
npm cache clean --force

# Réinstaller localement
cd /workspaces/Ultimate-frisbee-manager/backend
rm -rf node_modules
npm install prisma@5.22.0 @prisma/client@5.22.0 --save-exact
npm install
```

---

## 🎯 ALTERNATIVE: Utiliser db push

Si la migration échoue toujours:

```bash
# db push applique le schéma sans créer de fichier migration
npx prisma db push

# Puis démarrer
npm run dev
```

**Avantage**: Fonctionne même avec Prisma 7 car ne nécessite pas de fichier migration.

---

## ✅ VÉRIFICATION FINALE

Une fois le serveur démarré:

```bash
# Tester health
curl http://localhost:3000/api/sync/health

# Devrait retourner:
{"status":"ok","timestamp":"..."}
```

---

**Exécutez ces commandes et dites-moi le résultat !**
