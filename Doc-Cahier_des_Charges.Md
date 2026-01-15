# PARTIE CAHIER DES CHARGES

## Projet AFEC — Plateforme Web Full Stack
Une plateforme web complète développée pour le **centre de formation AFEC**, permettant la **gestion de l'inscription des stagiaires**, la **validation des inscriptions** et la **présentation des métiers du numérique**.  
Le projet comprend une **interface stagiaire**, une **interface administrateur** et plusieurs pages publiques de présentation et d’apprentissage.

---

## Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Architecture](#-architecture)
- [Technologies utilisées](#-technologies-utilisées)
- [Installation & Configuration](#-installation--configuration)
- [Structure du projet](#-structure-du-projet)
- [Authentification & Sécurité](#-authentification--sécurité)
- [Déploiement](#-déploiement)
- [Évolutions prévues](#-évolutions-prévues)
- [Licence & Contributions](#-licence--contributions)

---

##  Aperçu du projet

Le site web AFEC a pour objectif de :
- Fournir aux **stagiaires** un espace sécurisé pour accèder aux ressources pédagogique 
- Offrir aux **coordinateurs** un tableau de bord pour **accèder aux comptes des stagières de leurs organisme de formation** , **valider les inscriptions** et **gérer manuellement la suppression des comptes (compte par compte et l'ensemble des comptes)**.
- Présenter les **différents métiers du numérique** et ceux qui vont etre mis en place par l'organisme de Formation AFEC avec contenu fourni par l'AFEC (texte à insérer , image illustrant le métier, liens vers des sites wiki similaire comme CIDJ , ONISEP ou autre ...).
- (Falcultatif !!) Proposer des **quizz interactifs** permettant de tester ses connaissances sur ces métiers (notation sur 10).

---

##  Fonctionnalités principales

### Espace Stagiaire
- Inscription et authentification sécurisée
- Consultation d’informations liées au centre et aux formations du numérique proposé

###  Espace Coordinateurs
- Validation manuelle des inscriptions des stagiaires (système de coche)
- Suppression manuelle des comptes par les coordinateurs
- Tableau de bord simple pour la gestion des comptes

###  Pages Publiques
- **Accueil** : Présentation du centre et du contenu du site
- **Métiers du numérique** : Description des différents métiers proposés (avec débouchés professionnel salaire moyen du métier ect ...)
- (Facultatif) **Quizz métiers** : Tests de connaissances interactifs avec score sur /10 

---

### Évolutions prévues

- Mise en place de quizz interactifs simples pour chaque métiers proposés sur le site avec 10 questions à choix multiple et affichage d'un score sur /10 et affichage du résultat

# ---- PARTIE DOC TECHNIQUE ----

## Architecture


> Le backend expose des routes sécurisées consommées par le frontend via fetch/Axios.  
> L'application est déployée sur [Render](Consulter la documentation Render pour + d'infos).

---

## Technologies utilisées

### **Frontend**
- React (JSX)
- CSS3 / HTML5
- React Router (navigation)
- ViteJS

### **Backend**
- Node.js
- Express.js
- JSON Web Token (JWT)
- Bcrypt (hachage des mots de passe)
- Helmet (sécurité des en-têtes HTTP)
- express-rate-limit
- Crypto
- Nodemailer
- mysql2
- dotenv

### **Déploiement**
- Render (hébergement)
- GitHub (gestion de version)

---

##  Installation & Configuration

### Cloner le projet
```bash
git clone https://github.com/Daviid64/Projet-Stage-Afec.git


ProjetStage/
│
├── backend/
│   ├── app.js
│   ├── routes/
│   ├── controller/
│   ├── models/
│   ├── middleware/
│   ├── script/
│   ├── services/
│   └── Limiter_Security/
│
├── ReactFrontendProject/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── main.jsx
│   │   └── App.jsx
│
├── index.html
├── .env
├── README.md
└── package.json



