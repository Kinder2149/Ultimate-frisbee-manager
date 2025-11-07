## Freeze page modification exercice

- **Hypothèse initiale :** Problème dans la logique de chargement des données de l'exercice.
- **Hypothèse validée :** Boucle infinie dans `ExerciceFormComponent` due à une mauvaise gestion d'un `Observable` (`tagsUpdated) qui rechargeait les données en continu.
# Historique des tentatives

Ce document retrace les hypothèses testées, les approches qui n'ont pas fonctionné et les leçons apprises lors des sessions de débogging.

## 📌 Objectif
- Noter les **hypothèses rejetées** pour éviter de les retester
- Documenter les **approches qui n'ont pas marché** et pourquoi
- Garder une trace des **tests effectués** pour chaque problème

## 📝 Format recommandé
Pour chaque problème :
- **Problème** : Description courte
- **Hypothèses testées** : Liste des causes explorées
- **Résultats des tests** : Ce qui a été observé
- **Conclusion** : Hypothèse validée ou rejetée

---

## Photo de profil non sauvegardée

- **Hypothèses testées :**
  1. Mauvais format d'envoi (JSON au lieu de FormData) → ✅ Validée
  2. Middleware upload mal configuré → ❌ Rejetée (middleware correct)
  3. Problème d'affichage de l'URL → ❌ Rejetée (problème en amont)

- **Résultats des tests :**
  - Analyse du code : fichier ajouté à un objet JSON (`payload.icon = this.selectedFile`)
  - Vérification backend : middleware attend `multipart/form-data` via `createUploader('icon', 'avatars')`
  - Vérification de l'upload : système Cloudinary configuré correctement
  - Problème d'affichage : `currentUser$` pas rafraîchi après mise à jour

- **Conclusion :** Il fallait utiliser FormData pour envoyer le fichier et rafraîchir le profil utilisateur après la mise à jour.

## Erreur 404 sur modification photo de profil

- **Hypothèses testées :**
  1. Route non enregistrée dans le backend → ❌ Rejetée (route existe bien dans `auth.routes.js` ligne 18)
  2. Problème de méthode HTTP → ❌ Rejetée (c'est bien PUT des deux côtés)
  3. Désynchronisation frontend/backend sur le chemin de la route → ✅ Validée

- **Résultats des tests :**
  - Vérification de `auth.routes.js` : route existe sur `/profile` montée sur `/api/auth`
  - Vérification de `routes/index.js` : routes auth montées sur `/api/auth` (ligne 36)
  - Vérification du frontend : appels vers `/api/users/profile` au lieu de `/api/auth/profile`
  - Découverte de 2 autres routes manquantes : `change-password` et `security-question`

- **Conclusion :** Le frontend utilisait un préfixe incorrect (`users` au lieu de `auth`). Correction appliquée sur 3 appels dans `profile-page.component.ts`.

## Erreur de type sur `createEchauffement`

- **Hypothèses testées :**
  1. Le service attendait le fichier image comme un argument séparé (`createEchauffement(data, image)`). → ❌ **Rejetée**
  2. Le type `EchauffementFormData` était incompatible avec `Partial<Echauffement>` à cause de la propriété `image` et de l'assignation de `null` à `imageUrl`. → ✅ **Validée**

- **Résultats des tests :**
  - La tentative de passer l'image comme un second argument a provoqué une erreur `Expected 1 arguments, but got 2`.
