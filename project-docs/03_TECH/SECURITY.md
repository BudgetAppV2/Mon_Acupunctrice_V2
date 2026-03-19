# Security

Ce document détaille les mesures de sécurité mises en place pour protéger l'application Mon Acupunctrice et ses données.

## 1. Authentification

### Flux d'Authentification
1.  L'utilisateur est dirigé vers la page `/login`.
2.  Il clique sur "Se connecter avec Google", ce qui déclenche le `signInWithPopup` du SDK client Firebase.
3.  Après une connexion réussie, Firebase retourne un jeton d'identification (ID Token).
4.  Le SDK Firebase gère automatiquement ce jeton, l'envoie à Next.js et l'utilise pour maintenir une session authentifiée avec le backend Firebase.

### Persistance de la Session
-   La persistance de la session est configurée sur `local` dans le SDK Firebase (`browserLocalPersistence`).
-   Cela signifie que la session de l'utilisateur est conservée même après la fermeture de l'onglet ou du navigateur.
-   Le SDK Firebase rafraîchit automatiquement les jetons en arrière-plan, assurant une expérience utilisateur fluide et sécurisée.
-   La déconnexion se fait en appelant `auth.signOut()`, ce qui efface la session locale.

## 2. Règles de Sécurité Firestore

Les règles Firestore sont la principale ligne de défense pour la base de données. Elles garantissent que les utilisateurs ne peuvent accéder qu'à leurs propres données.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Les utilisateurs ne peuvent lire et écrire que leurs propres documents.
    // La création est autorisée si le nouvel item appartient à l'utilisateur authentifié.
    match /contentItems/{itemId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }

    // Un utilisateur ne peut lire et modifier que son propre profil.
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

## 3. Règles de Sécurité Storage

Les règles de Firebase Storage contrôlent l'accès aux fichiers (vidéos, images).

-   Les fichiers sont stockés avec un chemin qui inclut l'UID de l'utilisateur (ex: `videos/{userId}/{itemId}.mp4`).
-   Les règles vérifient que l'UID dans le chemin correspond à l'UID de l'utilisateur authentifié.

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Les utilisateurs ne peuvent lire et écrire que dans leur propre "dossier"
    match /videos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Les fichiers temporaires pour la transcription sont accessibles en écriture
    // par l'utilisateur authentifié et en lecture/suppression par les fonctions serverless.
    match /temp_audio/{userId}/{allPaths=**} {
       allow write: if request.auth != null && request.auth.uid == userId;
       // La lecture/suppression est gérée par les fonctions avec des droits admin.
    }
  }
}
```

## 4. Variables d'Environnement (Vercel)

Ces variables doivent être configurées dans les paramètres du projet Vercel. Elles ne sont jamais exposées côté client.

### Next.js (Application Web)
-   `NEXT_PUBLIC_FIREBASE_API_KEY`: Clé d'API Firebase pour le SDK client.
-   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Domaine d'authentification Firebase.
-   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: ID du projet Firebase.
-   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Bucket de stockage Firebase.
-   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: ID de l'expéditeur de messagerie Firebase.
-   `NEXT_PUBLIC_FIREBASE_APP_ID`: ID de l'application Firebase.
-   `FIREBASE_SERVICE_ACCOUNT_KEY`: Les credentials du compte de service Firebase (format JSON, encodé en Base64), pour les actions côté serveur dans les API Routes.

## 5. Secrets des Fonctions Firebase

Ces secrets doivent être configurés dans Firebase Functions (via la CLI ou la console Google Cloud) pour être accessibles par les fonctions serverless.

-   `OPENAI_API_KEY`: Clé d'API pour OpenAI (utilisée par Whisper pour la transcription).
-   `ANTHROPIC_API_KEY`: Clé d'API pour Anthropic (utilisée par Claude pour la génération de légendes).
-   `JAMENDO_CLIENT_ID`: ID client pour l'API Jamendo (recherche de musique).
-   `META_USER_TOKEN`: Jeton d'accès utilisateur de longue durée pour l'API Graph de Meta/Instagram.
-   `META_IG_ACCOUNT_ID`: L'ID du compte professionnel Instagram cible pour la publication.
