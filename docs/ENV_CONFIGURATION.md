# 🔐 Configuration des Variables d'Environnement

## Vue d'ensemble

Ce document explique le rôle de chaque fichier `.env` dans le projet.

---

## 📁 Fichiers Backend

### `backend/.env` (NON COMMITÉ)
**Rôle** : Configuration locale de développement  
**Utilisation** : Développement local uniquement  
**Contenu** : Variables réelles avec secrets

```bash
# Créer à partir de .env.example
cp backend/.env.example backend/.env
```

### `backend/.env.example`
**Rôle** : Template de référence pour toutes les variables nécessaires  
**Utilisation** : Documentation + base pour créer .env local  
**Contenu** : Toutes les variables avec valeurs d'exemple (pas de secrets réels)

**Variables principales :**
- `DATABASE_URL` : Connexion PostgreSQL Supabase
- `JWT_SECRET` / `JWT_REFRESH_SECRET` : Secrets pour tokens JWT
- `CLOUDINARY_URL` : Configuration Cloudinary pour images
- `CORS_ORIGINS` : Origines autorisées pour CORS
- `NODE_ENV` : Environnement (development/production)

---

## 🌐 Fichiers Frontend

### `frontend/src/environments/environment.ts`
**Rôle** : Configuration de développement  
**Utilisation** : `ng serve` (développement local)  
**Contenu** : 
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3002/api',
  supabaseUrl: '...',
  supabaseKey: '...'
};
```

### `frontend/src/environments/environment.prod.ts`
**Rôle** : Configuration de production  
**Utilisation** : `ng build` (build production)  
**Contenu** :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://[PROJET].vercel.app/api', // À mettre à jour après déploiement
  supabaseUrl: '...',
  supabaseKey: '...' // Clé publique uniquement
};
```

⚠️ **IMPORTANT** : Mettre à jour `apiUrl` après déploiement backend sur Vercel

---

## 🚀 Configuration Vercel (Production)

### Variables d'environnement Vercel
**Rôle** : Configuration production pour le backend déployé  
**Configuration** : Via dashboard Vercel ou CLI  

**Variables requises :**
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_URL=cloudinary://...
CORS_ORIGINS=https://[frontend].vercel.app
NODE_ENV=production
```

**Comment configurer :**
```bash
# Via CLI
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
# etc.

# Ou via dashboard Vercel
# Settings > Environment Variables
```

---

## 🔒 Sécurité

### ✅ À FAIRE
- Ajouter `.env` à `.gitignore` (déjà fait)
- Utiliser des secrets forts (min 32 caractères)
- Rotation régulière des secrets JWT
- Utiliser `CLOUDINARY_URL` format complet

### ❌ NE JAMAIS FAIRE
- Commiter `.env` avec secrets réels
- Partager secrets dans Slack/Discord
- Utiliser mêmes secrets dev/prod
- Hardcoder secrets dans le code

---

## 📋 Checklist Déploiement

### Backend (Vercel Functions)
- [ ] Configurer toutes les variables d'environnement dans Vercel
- [ ] Vérifier `NODE_ENV=production`
- [ ] Tester connexion DATABASE_URL
- [ ] Vérifier CORS_ORIGINS correspond au frontend

### Frontend (Vercel Static)
- [ ] Mettre à jour `environment.prod.ts` avec URL backend Vercel
- [ ] Vérifier clés Supabase (publiques uniquement)
- [ ] Tester build production : `npm run build`

---

## 🆘 Dépannage

### Erreur "DATABASE_URL not defined"
→ Vérifier variable dans Vercel dashboard

### Erreur CORS
→ Vérifier `CORS_ORIGINS` inclut l'URL frontend

### Erreur JWT
→ Vérifier `JWT_SECRET` et `JWT_REFRESH_SECRET` définis

### Erreur Cloudinary
→ Utiliser format `CLOUDINARY_URL=cloudinary://key:secret@cloud_name`

---

**Dernière mise à jour** : 2026-01-24
