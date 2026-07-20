# 🔐 Configuration Supabase - Guide complet

## 📋 Checklist de configuration

### ✅ 1. URL Configuration

**Menu** : Authentication → URL Configuration

#### Site URL
```
https://ultimate-frisbee-manager.vercel.app
```

#### Redirect URLs (ajouter toutes ces URLs)
```
https://ultimate-frisbee-manager.vercel.app/**
https://ultimate-frisbee-manager.vercel.app/reset-password
https://ultimate-frisbee-manager.vercel.app/auth/confirm
http://localhost:4200/**
http://localhost:4200/reset-password
http://localhost:4200/auth/confirm
```

**⚠️ Important** : Les URLs localhost sont nécessaires pour le développement local.

---

### ✅ 2. Sign In / Providers

**Menu** : Authentication → Sign In / Providers

#### User Signups
- ✅ **Allow new users to sign up** : ACTIVÉ
- ✅ **Confirm email** : ACTIVÉ (obligatoire pour la sécurité)

#### Auth Providers
- ✅ **Email** : Enabled

---

### ✅ 3. Email Templates

**Menu** : Authentication → Email Templates

Tu dois personnaliser 3 templates (déjà fait selon toi ✅) :

#### Template 1 : Confirm signup
- **Sujet** : `Confirmez votre inscription à Ultimate Frisbee Manager`
- **Template HTML** : Voir le fichier fourni précédemment

#### Template 2 : Reset password
- **Sujet** : `Réinitialisez votre mot de passe - Ultimate Frisbee Manager`
- **Template HTML** : Voir le fichier fourni précédemment

#### Template 3 : Change email
- **Sujet** : `Confirmez votre nouvelle adresse email - Ultimate Frisbee Manager`
- **Template HTML** : Voir le fichier fourni précédemment

---

### ✅ 4. Créer le compte admin

**Menu** : Authentication → Users → Add user

1. Clique sur **"Add user"**
2. Remplis :
   - **Email** : `admin@ultimate.com`
   - **Password** : (choisis un mot de passe fort)
   - ✅ **Auto Confirm User** : ACTIVÉ (pour ne pas avoir à confirmer l'email)
3. Clique sur **"Create user"**
4. **Note l'UUID généré** (format : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

---

## 🔄 Flux d'authentification

### Inscription d'un nouvel utilisateur

1. **Frontend** : L'utilisateur remplit le formulaire `/login/signup`
2. **Supabase** : Crée le compte et envoie un email de confirmation
3. **Email** : L'utilisateur clique sur le lien de confirmation
4. **Supabase** : Redirige vers `https://ton-domaine/auth/confirm`
5. **Frontend** : Affiche la page de confirmation
6. **Backend** : Crée le profil utilisateur en base via `/api/auth/register`
7. **Frontend** : Redirige vers le dashboard

### Connexion

1. **Frontend** : L'utilisateur remplit le formulaire `/login`
2. **Supabase** : Vérifie les credentials
3. **Frontend** : Récupère le token JWT Supabase
4. **Backend** : Vérifie le token et charge le profil utilisateur
5. **Frontend** : Redirige vers le dashboard

### Mot de passe oublié

1. **Frontend** : L'utilisateur saisit son email sur `/forgot-password`
2. **Supabase** : Envoie un email avec un lien de reset
3. **Email** : L'utilisateur clique sur le lien
4. **Supabase** : Redirige vers `https://ton-domaine/reset-password`
5. **Frontend** : Affiche le formulaire de nouveau mot de passe
6. **Supabase** : Met à jour le mot de passe
7. **Frontend** : Redirige vers `/login` avec un message de succès

---

## 🧪 Tests à effectuer

### Test 1 : Inscription complète
1. Va sur `http://localhost:4200/login/signup`
2. Crée un compte avec un email valide
3. Vérifie que tu reçois l'email de confirmation
4. Clique sur le lien dans l'email
5. Vérifie que tu arrives sur `/auth/confirm` avec un message de succès
6. Clique sur "Accéder au tableau de bord"
7. Vérifie que tu es bien connecté

### Test 2 : Connexion
1. Va sur `http://localhost:4200/login`
2. Connecte-toi avec tes identifiants
3. Vérifie que tu arrives sur le dashboard

### Test 3 : Mot de passe oublié
1. Va sur `http://localhost:4200/forgot-password`
2. Saisis ton email
3. Vérifie que tu reçois l'email de reset
4. Clique sur le lien dans l'email
5. Vérifie que tu arrives sur `/reset-password`
6. Saisis un nouveau mot de passe
7. Vérifie que tu peux te connecter avec le nouveau mot de passe

### Test 4 : Compte admin
1. Connecte-toi avec `admin@ultimate.com`
2. Vérifie que tu as accès aux fonctionnalités admin

---

## 🔧 Variables d'environnement

### Backend (.env)
```env
SUPABASE_PROJECT_REF=rnreaaeiccqkwgwxwxeg
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3002/api',
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
};
```

### Frontend (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ultimate-frisbee-manager.vercel.app/api',
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmVhYWVpY2Nxa3dnd3h3eGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MzI3NjAsImV4cCI6MjA1MDMwODc2MH0.5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
};
```

---

## 🐛 Dépannage

### L'email de confirmation n'arrive pas
- Vérifie tes spams
- Vérifie que "Confirm email" est activé dans Supabase
- Vérifie les logs dans Supabase Dashboard → Authentication → Logs

### Le lien de confirmation ne fonctionne pas
- Vérifie que l'URL est bien dans les "Redirect URLs"
- Vérifie que la route `/auth/confirm` existe dans ton app

### Erreur "User not found" après connexion
- L'utilisateur n'a pas été créé en base locale
- Vérifie que la route `/api/auth/register` fonctionne
- Vérifie les logs backend

### Le reset password ne fonctionne pas
- Vérifie que l'URL `/reset-password` est dans les "Redirect URLs"
- Vérifie que la route existe dans ton app
- Vérifie les logs Supabase

---

## 📞 Support

En cas de problème :
1. Vérifie les logs Supabase : Dashboard → Authentication → Logs
2. Vérifie les logs backend : Console du serveur
3. Vérifie les logs frontend : Console du navigateur (F12)
