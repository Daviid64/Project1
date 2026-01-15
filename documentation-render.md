# Documentation de Déploiement Backend sur Render

## 📌 Aperçu

Ce document décrit le déploiement du backend sur Render pour le projet.
Le backend est accessible publiquement via l'URL suivante :

**Backend URL (Production)** : https://projet-stage-afec-2.onrender.com

------------------------------------------------------------------------

## 🚀 Déploiement sur Render

Le backend est hébergé sur Render en tant que **Web Service**. Le
service effectue automatiquement le build et le déploiement à chaque
push sur la branche configurée.

### 🛠️ Commandes de build et de démarrage


Exemple Node.js : - **Build Command** : `yarn install` - **Start
Command** : `yarn start`

------------------------------------------------------------------------

## 🔐 Variables d'environnement

Les variables d'environnement suivantes sont configurées dans
"Environment" sur Render :

  Variable                Description
  ----------------------- -------------------------------------------------
  **DB_HOST**             Adresse de l'hôte de la base de données
  **DB_NAME**             Nom de la base de données
  **DB_PASSWORD**         Mot de passe de connexion DB
  **DB_USER**             Nom d'utilisateur DB
  **EMAIL_PASS**          Mot de passe pour l'envoi d'emails
  **EMAIL_USER**          Adresse email utilisée pour l'envoi
  **FRONTEND_URL_PROD**   URL du frontend en production
  **JWT_SECRET**          Clé secrète utilisée pour signer les tokens JWT

> **Note :** Ne jamais exposer ces valeurs dans la documentation
> publique.

------------------------------------------------------------------------

## 🔄 Déploiement continu

Render redeploie automatiquement le service lors d'un push sur la
branche suivie.

Tu peux aussi redeployer manuellement via :\
- Le bouton **"Manual Deploy \> Clear build cache & deploy"** sur
Render.

------------------------------------------------------------------------

## 📝 Logs et Monitoring

Render fournit : - Des **logs en temps réel** - L'historique des
déploiements - L'état du service (healthy / failed)

------------------------------------------------------------------------

## Fonctionnement

-   Le service répond bien sur `/` ou la route choisie pour le health
    check.
-   Les variables d'environnement sont bien définies.
-   La base de données est accessible depuis Render.

------------------------------------------------------------------------

## Statut actuel

Backend déployé, fonctionnel, accessible publiquement.

--------------------------------------------------------------------------------------------------------------------------------

# Documentation de Déploiement Frontend sur Render

## 📌 Aperçu

Ce document décrit le déploiement du frontend sur Render pour le projet.
Le frontend est accessible publiquement via l'URL suivante :

**Frontend URL (Production)** : https://projet-stage-afec.onrender.com

------------------------------------------------------------------------

## 🚀 Déploiement sur Render

Le frontend est hébergé sur Render en tant que **Static Site**. Le
service effectue automatiquement le build et le déploiement à chaque
push GitHub sur la branche configurée.

### 🛠️ Commandes de build et de démarrage

Exemple Node.js : - **Build Command** : `yarn install` - **Start
Command** : `yarn start`

------------------------------------------------------------------------

## 🔐 Variables d'environnement

Les variables d'environnement suivantes sont configurées dans
"Environment" sur Render :

  Variable                Description
  ----------------------- -------------------------------------------------
  **VITE_API_URL**        URL du backend en production

> **Note :** Ne jamais exposer ces valeurs dans la documentation
> publique.

------------------------------------------------------------------------

## 🔄 Déploiement continu

Render redeploie automatiquement le service lors d'un push sur la
branche suivie.

Tu peux aussi redeployer manuellement via :\
- Le bouton **"Manual Deploy \> Clear build cache & deploy"** sur
Render.

------------------------------------------------------------------------

## 📝 Logs et Monitoring

Render fournit : - Des **logs en temps réel** - L'historique des
déploiements - L'état du service (healthy / failed)

------------------------------------------------------------------------

## Fonctionnement

-   Le service répond bien sur `/` ou la route choisie pour le health
    check. Dans le cas du frontend il renvoit à la page d'authentification. 
-   Les variables d'environnement sont bien définies.
-   La base de données est accessible depuis Render.

------------------------------------------------------------------------

## Statut actuel

Frontend déployé, fonctionnel, accessible publiquement.
