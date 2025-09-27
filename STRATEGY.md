# Stratégie d'Architecture - Ultimate Frisbee Manager

Ce document définit l'architecture technique du projet et sert de guide pour les développements futurs. La stratégie adoptée est une architecture **hybride**, conçue pour maximiser la flexibilité, le contrôle et la performance.

## 1. Vue d'ensemble de l'Architecture

Le projet est composé de trois services principaux, chacun hébergé sur une plateforme spécialisée :

-   **Frontend :** Une application Single-Page (SPA) développée avec **Angular**.
    -   **Hébergement :** [**Vercel**](https://vercel.com/)

-   **Backend :** Une API RESTful développée avec **Node.js** et le framework **Express.js**.
    -   **Hébergement :** [**Render**](https://render.com/)

-   **Base de données :** Une base de données relationnelle **PostgreSQL**.
    -   **Hébergement :** [**Supabase**](https://supabase.com/)

 *(Note: Ceci est un placeholder pour un futur diagramme)*

## 2. Rôle de chaque service

### Frontend (Vercel)
-   **Responsabilité :** Gérer toute l'interface utilisateur et l'expérience client.
-   **Pourquoi Vercel ?** Vercel est optimisé pour le déploiement d'applications frontend modernes. Il offre un déploiement continu (CI/CD) intégré avec GitHub, des performances de premier ordre grâce à son réseau de distribution global (CDN), et une gestion simplifiée des environnements.

### Backend (Render)
-   **Responsabilité :** Exposer une API sécurisée pour toutes les opérations métier (CRUD, authentification, logique complexe). Il sert d'intermédiaire unique entre le frontend et la base de données.
-   **Pourquoi Render ?** Render permet d'héberger des services backend conteneurisés avec une grande flexibilité. Notre backend Node.js/Express peut évoluer sans les contraintes d'un environnement serverless pur. Nous avons un contrôle total sur l'environnement d'exécution, les dépendances et la logique métier.

### Base de Données (Supabase)
-   **Responsabilité :** Fournir une base de données PostgreSQL managée, sécurisée et performante.
-   **Pourquoi Supabase ?** Supabase est utilisé ici **uniquement pour son service de base de données PostgreSQL**. Il offre une solution fiable, avec des sauvegardes automatiques, une excellente interface de gestion et une mise à l'échelle facile, sans que nous ayons à gérer l'infrastructure de la base de données nous-mêmes.

## 3. Justification de la Stratégie

Cette architecture a été choisie pour les raisons suivantes :

-   **Contrôle et Flexibilité :** En ayant notre propre backend Express, nous ne sommes pas limités par les contraintes d'une plateforme "tout-en-un". Nous pouvons implémenter n'importe quelle logique métier, aussi complexe soit-elle.
-   **Évolutivité :** Chaque partie de l'application (frontend, backend, base de données) peut être mise à l'échelle indépendamment des autres.
-   **Découplage (Pas de "Vendor Lock-in") :** Le code est portable. Le backend peut être déplacé sur un autre hébergeur compatible Node.js, et la base de données peut être migrée vers un autre fournisseur PostgreSQL avec un minimum d'effort.
-   **Séparation Claire des Responsabilités :** Chaque service a un rôle unique, ce qui rend le système plus facile à maintenir, à déboguer et à faire évoluer.

## 4. Directives pour les Développements Futurs

-   Toute nouvelle logique métier doit être implémentée dans le **backend Express**.
-   La communication avec la base de données doit **exclusivement** passer par le backend. Le frontend ne doit jamais se connecter directement à la base de données.
-   Les autres services de Supabase (Auth, Storage, Edge Functions) **ne doivent pas être utilisés**. L'authentification est gérée par notre backend (JWT), et le stockage de fichiers est également géré via l'API backend.
