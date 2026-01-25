# 🔐 VARIABLES D'ENVIRONNEMENT À AJOUTER SUR VERCEL

**URGENT** : Ces variables sont nécessaires pour que le backend fonctionne.

---

## 📋 LISTE DES VARIABLES OBLIGATOIRES

### **1. DATABASE_URL** (CRITIQUE)
```
postgresql://postgres.rnreaaeiccqkwgwxwxeg:TON_NOUVEAU_MOT_DE_PASSE@aws-1-eu-west-3.pooler.supabase.com:5432/postgres
```

⚠️ **IMPORTANT** : Utilise le **nouveau mot de passe** que tu as régénéré sur Supabase (pas l'ancien exposé).

---

### **2. JWT_SECRET** (CRITIQUE)
```
TON_NOUVEAU_JWT_SECRET_64_CARACTERES_MINIMUM
```

⚠️ **IMPORTANT** : Génère un nouveau secret fort (pas celui exposé).

**Générer sur PowerShell** :
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### **3. JWT_REFRESH_SECRET** (CRITIQUE)
```
TON_NOUVEAU_JWT_REFRESH_SECRET_64_CARACTERES_MINIMUM
```

⚠️ **IMPORTANT** : Génère un nouveau secret fort (différent de JWT_SECRET).

**Générer sur PowerShell** :
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### **4. CLOUDINARY_URL** (CRITIQUE)
```
cloudinary://937631178698815:TON_NOUVEAU_API_SECRET@dmiqnc2o6
```

⚠️ **IMPORTANT** : Utilise le **nouveau API Secret** que tu as régénéré sur Cloudinary (pas l'ancien exposé).

---

### **5. CORS_ORIGINS** (CRITIQUE)
```
http://localhost:4200,https://ultimate-frisbee-manager.vercel.app
```

⚠️ **IMPORTANT** : Utilise le domaine exact de ton projet Vercel.

---

### **6. NODE_ENV** (OBLIGATOIRE)
```
production
```

---

### **7. JWT_EXPIRES_IN** (OPTIONNEL)
```
7d
```

---

### **8. JWT_REFRESH_EXPIRES_IN** (OPTIONNEL)
```
30d
```

---

## 🎯 COMMENT AJOUTER SUR VERCEL

### **Étape 1 : Aller sur Environment Variables**
Tu y es déjà ! (capture d'écran 1)

### **Étape 2 : Cliquer sur "Add Environment Variable"**
Bouton en haut à droite.

### **Étape 3 : Ajouter chaque variable**

Pour chaque variable :
1. **Name** : Le nom (ex: `DATABASE_URL`)
2. **Value** : La valeur (ex: `postgresql://...`)
3. **Environment** : Sélectionner **Production** (et éventuellement Preview/Development)
4. Cliquer sur **Add**

### **Étape 4 : Répéter pour toutes les variables**

Ajoute les 6 variables obligatoires :
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] CLOUDINARY_URL
- [ ] CORS_ORIGINS
- [ ] NODE_ENV

---

## ⚠️ SECRETS À RÉGÉNÉRER AVANT

**NE PAS utiliser les anciens secrets exposés !**

### **1. Supabase - Nouveau mot de passe**
1. https://supabase.com
2. Projet → Settings → Database
3. "Reset Database Password"
4. Copier le nouveau mot de passe
5. Mettre à jour `DATABASE_URL`

### **2. Cloudinary - Nouveau API Secret**
1. https://cloudinary.com
2. Settings → Security
3. "Reset API Secret"
4. Copier le nouveau secret
5. Mettre à jour `CLOUDINARY_URL`

### **3. JWT Secrets - Nouveaux secrets**
Générer 2 nouveaux secrets avec PowerShell :
```powershell
# JWT_SECRET
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# JWT_REFRESH_SECRET
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🚀 APRÈS AJOUT DES VARIABLES

### **Vercel va redéployer automatiquement**

1. Attendre 3-5 minutes
2. Vérifier que le déploiement est "Ready"
3. Tester l'application

### **Tests à effectuer**

```
https://ultimate-frisbee-manager.vercel.app/api/health
```

**Résultat attendu** : 
```json
{ "status": "ok" }
```

---

## 📊 RÉCAPITULATIF

| Variable | Obligatoire | Où la trouver |
|----------|-------------|---------------|
| DATABASE_URL | ✅ OUI | Supabase (régénérer password) |
| JWT_SECRET | ✅ OUI | Générer avec PowerShell |
| JWT_REFRESH_SECRET | ✅ OUI | Générer avec PowerShell |
| CLOUDINARY_URL | ✅ OUI | Cloudinary (régénérer secret) |
| CORS_ORIGINS | ✅ OUI | `https://ultimate-frisbee-manager.vercel.app` |
| NODE_ENV | ✅ OUI | `production` |
| JWT_EXPIRES_IN | ⚪ Non | `7d` |
| JWT_REFRESH_EXPIRES_IN | ⚪ Non | `30d` |

---

## ⏱️ TEMPS ESTIMÉ

- Régénérer secrets : 15 minutes
- Ajouter variables Vercel : 5 minutes
- Redéploiement : 3-5 minutes

**Total** : ~25 minutes

---

## 🎯 ORDRE RECOMMANDÉ

1. **Régénérer Supabase password** (5 min)
2. **Régénérer Cloudinary secret** (5 min)
3. **Générer JWT secrets** (2 min)
4. **Ajouter toutes les variables sur Vercel** (5 min)
5. **Attendre redéploiement** (3-5 min)
6. **Tester** (2 min)

---

## ✅ CHECKLIST

- [ ] Supabase : Password régénéré
- [ ] Cloudinary : API Secret régénéré
- [ ] JWT_SECRET généré
- [ ] JWT_REFRESH_SECRET généré
- [ ] DATABASE_URL ajoutée sur Vercel
- [ ] JWT_SECRET ajouté sur Vercel
- [ ] JWT_REFRESH_SECRET ajouté sur Vercel
- [ ] CLOUDINARY_URL ajoutée sur Vercel
- [ ] CORS_ORIGINS ajouté sur Vercel
- [ ] NODE_ENV ajouté sur Vercel
- [ ] Redéploiement terminé
- [ ] Tests effectués

---

**Une fois les variables ajoutées, Vercel redéploiera automatiquement et tout fonctionnera !** 🚀
