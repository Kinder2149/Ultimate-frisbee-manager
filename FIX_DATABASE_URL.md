# 🔧 CORRIGER L'ERREUR DATABASE_URL

## Problème Actuel

Votre `.env` contient encore les valeurs d'exemple:
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

Il faut une **vraie base de données PostgreSQL**.

---

## ✅ SOLUTION: Créer une DB Supabase (2 minutes)

### ÉTAPE 1: Créer un Projet Supabase

1. Ouvrir un nouvel onglet: **https://supabase.com/**
2. Cliquer **"Start your project"**
3. Se connecter avec GitHub
4. Cliquer **"New project"**
5. Remplir:
   - **Name**: `ultimate-frisbee-db`
   - **Database Password**: Choisir un mot de passe fort (noter quelque part!)
   - **Region**: Choisir le plus proche (ex: Europe West)
   - **Pricing Plan**: **Free** (0$/mois)
6. Cliquer **"Create new project"**
7. Attendre 2 minutes (barre de progression)

### ÉTAPE 2: Copier la Connection String

1. Dans Supabase, aller dans **Settings** (icône engrenage en bas à gauche)
2. Cliquer **Database** (dans le menu)
3. Scroll jusqu'à **Connection string**
4. Sélectionner **"Session mode"** (pas Transaction!)
5. Copier l'URL qui ressemble à:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
6. **IMPORTANT**: Remplacer `[YOUR-PASSWORD]` par votre vrai mot de passe

### ÉTAPE 3: Mettre à Jour .env dans Codespaces

Dans Codespaces:

1. Ouvrir le fichier `backend/.env` (cliquer dans l'explorateur)
2. Remplacer la ligne `DATABASE_URL=...` par votre vraie URL:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:VOTRE_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
   ```
3. Générer des secrets JWT (textes aléatoires):
   ```env
   JWT_SECRET="mon-super-secret-jwt-aleatoire-minimum-32-caracteres-abc123xyz"
   JWT_REFRESH_SECRET="mon-autre-secret-refresh-aleatoire-minimum-32-caracteres-def456uvw"
   ```
4. **Sauvegarder** (Ctrl+S ou Cmd+S)

### ÉTAPE 4: Relancer la Migration

Dans le terminal Codespaces:

```bash
# Arrêter le serveur actuel (Ctrl+C)

# Relancer la migration
npx prisma migrate dev --name add_updated_at_fields

# Devrait afficher:
# ✔ Migration applied successfully
```

---

## 🎯 EXEMPLE DE .env COMPLET

```env
# Base de données Supabase (REMPLACER PAR VOS VRAIES VALEURS)
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:VotreMdp123!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# JWT Secrets (générer des textes aléatoires)
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
JWT_REFRESH_SECRET="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4"

# Port
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGINS="*"

# Cloudinary (OPTIONNEL - laisser vide si vous n'en avez pas)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

---

## ✅ VÉRIFICATION

Après avoir mis à jour `.env` et relancé la migration, vous devriez voir:

```bash
✔ Migration applied successfully
✔ Generated Prisma Client

# Puis démarrer le serveur:
npm run dev

# Devrait afficher:
🚀 Server running on http://0.0.0.0:3002
✅ Database connected
```

---

## 🆘 SI PROBLÈME PERSISTE

### Erreur: "Can't reach database server"

**Vérifier**:
1. Mot de passe correct dans `DATABASE_URL`
2. Pas d'espaces avant/après l'URL
3. Mode **"Session"** (pas Transaction) dans Supabase
4. Port **5432** (pas 6543)

### Erreur: "Invalid connection string"

**Format correct**:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Exemple réel:
```
postgresql://postgres.abcdefg:MonMdp123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### Caractères spéciaux dans le mot de passe

Si votre mot de passe contient `@`, `#`, `%`, etc., il faut les encoder:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

Ou choisir un mot de passe sans caractères spéciaux.

---

## 📋 CHECKLIST

- [ ] Projet Supabase créé
- [ ] Mot de passe noté quelque part
- [ ] Connection String copiée (mode Session)
- [ ] Mot de passe remplacé dans l'URL
- [ ] `.env` mis à jour avec la vraie DATABASE_URL
- [ ] JWT_SECRET et JWT_REFRESH_SECRET configurés
- [ ] Fichier `.env` sauvegardé
- [ ] Migration relancée avec succès
- [ ] Serveur démarre sans erreur

---

**Une fois la migration réussie, on pourra continuer avec l'adaptation des 4 services restants !** 🚀
