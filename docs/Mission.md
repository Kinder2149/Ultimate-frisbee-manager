🏗️ PLAN COMPLET — TRANSFORMATION MOBILE SANS DETTE

Je découpe volontairement en phases strictes, avec points de contrôle.
👉 On ne saute jamais une phase.

🔹 PHASE 0 — Sécurisation & gel de l’existant (OBLIGATOIRE)
🎯 Objectif

Comprendre où se branche le mobile aujourd’hui, sans rien casser.

Actions (sans modifier le code) :

Cartographier :

où est définie la navigation actuelle

comment mobile-optimizations.scss override le layout

quels composants sont utilisés à la fois desktop & mobile

Identifier :

les points CSS-only

les points logique Angular

Lister les composants réutilisables existants :

cards

filtres

boutons profil / tags / auth

👉 Aucune suppression, aucun déplacement à ce stade.

📌 Livrable attendu
Une carte mentale ou liste claire :

“ce qui est mobile par CSS”

“ce qui est structurel”

🔹 PHASE 1 — Définition de l’architecture mobile cible (SANS CODE)
🎯 Objectif

Avoir une architecture écrite avant toute implémentation.

Architecture cible (conceptuelle)
MobilePage (unique)
├── MobileHeader (fixed)
│   ├── Logo / identité
│   ├── Bouton recherche
│   ├── Bouton paramètres
│
├── MobileFilterBar
│   ├── Bulle Exercices
│   ├── Bulle Entraînements
│   ├── Bulle Échauffements
│   ├── Bulle Situations
│   └── Sélecteur de tri (récent / ancien)
│
├── HeroContextuel
│   └── Carte mise en avant selon état
│
└── ContentFeed
    └── Liste filtrée de cartes existantes


👉 Important :

Aucun nouveau modèle métier

Aucune nouvelle API

Aucune duplication de page

📌 Décision clé actée

Le mobile devient une vue composite, pas une collection de pages.

🔹 PHASE 2 — Définition des états (clé anti-dette)
🎯 Objectif

Centraliser toute la logique mobile dans un état unique.

État minimal requis (exemple conceptuel) :

activeCategory : all | exercice | entrainement | echauffement | situation

sortOrder : recent | old

searchQuery : string

heroItem : référence calculée

👉 Aucun composant ne décide seul
👉 Tout lit l’état, rien ne le recrée

📌 Règle absolue

Si deux composants ont besoin de la même info → état central
Pas de logique dupliquée

🔹 PHASE 3 — Réutilisation stricte de l’existant (anti-doublon)
🎯 Objectif

Ne RIEN recréer de ce qui existe déjà.

Ce qu’on réutilise tel quel :

cartes (exercices, entraînements, etc.)

composants profil

gestionnaire de tags

auth / logout

services API

Ce qu’on fait :

adapter le CONTENEUR

pas le contenu

📌 Exemple de bonne pratique :

Le composant carte ne “sait pas” qu’il est mobile
C’est le layout qui décide comment l’afficher

🔹 PHASE 4 — Implémentation du Header mobile FIXED
🎯 Objectif

Créer UN point d’entrée mobile clair.

Règles strictes :

visible uniquement sous 768px

remplace totalement la navbar desktop

position fixed

hauteur connue (pour le layout)

Fonctionnalités :

🔍 Recherche → réutilise la logique existante

⚙️ Paramètres → ouvre menu mobile

profil

tags

auth

📌 Interdiction

pas de nouveaux écrans

pas de nouvelles routes

🔹 PHASE 5 — Filter Bar + tri (cœur du système)
🎯 Objectif

Piloter toute la vue par état.

Fonctionnement :

État initial :

catégorie = all

tri = recent

Changement de filtre :

recalcul du feed

recalcul du hero

👉 Le tri par date est une simple transformation, pas une logique métier nouvelle.

📌 Règle

Le tri n’appelle jamais l’API différemment
Il trie les données déjà chargées

🔹 PHASE 6 — Hero contextuelle (valeur ajoutée)
🎯 Objectif

Donner du sens à la vue, sans complexité.

Règle simple :

catégorie = all → dernier élément global

catégorie = X → dernier élément de X

tri = ancien → élément le plus ancien

👉 Aucune magie
👉 Aucune recommandation algorithmique

🔹 PHASE 7 — Nettoyage progressif (TRÈS IMPORTANT)
🎯 Objectif

Éviter la dette post-refonte.

Méthodologie :

Identifier les règles CSS mobile devenues inutiles

Les commenter

Puis les supprimer par lots

Vérifier visuellement à chaque étape

📌 Jamais tout d’un coup

🔹 PHASE 8 — Validation finale

Checklist finale :

✅ Desktop inchangé

✅ Mobile sans duplication

✅ Pas de logique métier doublée

✅ Navigation claire

✅ Performance stable

🧠 MÉTHODOLOGIE GÉNÉRALE (À NE JAMAIS VIOLER)

❌ Pas de “vite fait”

❌ Pas de composant jetable

❌ Pas de logique dans le CSS

✅ État central

✅ Réutilisation
✅ Découpage clair