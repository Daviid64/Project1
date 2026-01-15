# Guide d'utilisation des routes API

Ce document explique comment utiliser les différentes routes de l'application backend pour gérer les utilisateurs et les administrateurs.

---

## Base URL

http://localhost:5000

---

## 1. Utilisateurs

### 1.1. Inscription

**Endpoint :**

POST /auth/register


**Body :**

```json
{
  "first_name": "Kizaru",
  "last_name": "Borsalino",
  "email": "kizaru@test.com",
  "password": "12345678",
  "confirmPassword": "12345678",
  "agency_id": 1,
  "role": "coordinateur"
}

Réponse :

{
  "success": true,
  "message": "Utilisateur créé ! Vérifiez votre email ✅",
  "userId": 2
}

    Remarque : l'utilisateur ou coordinateur sera en statut "pending" jusqu'à validation par un admin.

1.2 Connexion

Endpoint :

POST /auth/login

Body :

{
  "email": "emilie@afec.fr",
  "password": "motdepasse123"
}

Réponse :

{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": null
}

    Remarque : l'utilisateur doit être "approved" pour se connecter.

1.3 Récupérer tous les utilisateurs

Endpoint :

GET /admin/users

Réponse :

{
  "success": true,
  "users": [
    {
      "id": 1,
      "first_name": "Borsalino",
      "last_name": "Kizaru",
      "email": "kizaru@marine.gov",
      "status": "approved",
      "roles": "super_admin"
    },
    ...
  ]
}

NB : Cette route à été sécurisé de manière que seul le super_admin et le coordinateur puisse voir les utilisateurs inscrit

1.4. Récupérer tous les utilisateurs (admin)

Endpoint :

GET : http://localhost:5000/admin/users

Réponse :

[
  {
    "id": 80,
    "first_name": "Sylvain",
    "last_name": "PierreDurif",
    "email": "silvain.durif@mail.com",
    "status": "approved",
    "created_at": "2025-11-25T17:30:48.000Z",
    "last_login": null,
    "role_name": "stagiaire"
  },
  {
    "id": 78,
    "first_name": "Hector",
    "last_name": "Legros",
    "email": "hector.legros@gmail.com",
    "status": "approved",
    "created_at": "2025-11-24T14:42:06.000Z",
    "last_login": "2025-11-24T14:44:13.000Z",
    "role_name": "stagiaire"
  },
  {
    "id": 77,
    "first_name": "Nouveau",
    "last_name": "membre",
    "email": "nouveau.membre@gmail.com",
    "status": "approved",
    "created_at": "2025-11-24T13:43:36.000Z",
    "last_login": "2025-11-24T14:24:14.000Z",
    "role_name": "stagiaire"
  },
  {
    "id": 73,
    "first_name": "Damien",
    "last_name": "Dupont",
    "email": "damien@mail.com",
    "status": "approved",
    "created_at": "2025-11-21T08:46:48.000Z",
    "last_login": "2025-11-25T15:31:44.000Z",
    "role_name": "stagiaire"
  },
  {
    "id": 72,
    "first_name": "Julien",
    "last_name": "Dubois",
    "email": "julien@mail.com",
    "status": "approved",
    "created_at": "2025-11-18T08:21:30.000Z",
    "last_login": null,
    "role_name": "stagiaire"
  },
  {
    "id": 65,
    "first_name": "Eliot",
    "last_name": "Dubois",
    "email": "Eliot.dubois@mail.com",
    "status": "approved",
    "created_at": "2025-11-12T10:07:41.000Z",
    "last_login": null,
    "role_name": "stagiaire"
  },
  {
    "id": 57,
    "first_name": "Edward",
    "last_name": "Newgate",
    "email": "Edward.newgate@gmail.com",
    "status": "approved",
    "created_at": "2025-11-07T14:43:08.000Z",
    "last_login": "2025-11-24T09:35:28.000Z",
    "role_name": "stagiaire"
  },
  {
    "id": 9,
    "first_name": "Admin",
    "last_name": "Principal",
    "email": "deltanumwork@gmail.com",
    "status": "active",
    "created_at": "2025-10-28T11:29:42.000Z",
    "last_login": "2025-11-26T08:33:54.000Z",
    "role_name": "super_admin"
  }
]

1.5. Supprimer un utilisateur

Endpoint :

DELETE /users/:id

Réponse :

{
  "success": true,
  "message": "Utilisateur supprimé avec succès"
}

NB: Seulement possible depuis la page admin par les coordinateurs et le super_admin


2. Administrateurs

    Toutes les routes suivantes nécessitent un JWT de super_admin dans l’Authorization Header :
    Authorization: Bearer <token>

2.1. 

Endpoint :

GET /admin/users

Réponse :

[
  {
    "id": 1,
    "first_name": "Borsalino",
    "last_name": "Kizaru",
    "email": "kizaru@marine.gov",
    "created_at": "2025-10-23T10:00:00.000Z"
  },
  ...
]

2.2. Valider un utilisateur

Endpoint :

PATCH /admin/users/:id/validate

Body :

{
  "status": "approved"
}

Réponse :

{
  "message": "Utilisateur approved"
}

    status peut être "approved" ou "rejected".
