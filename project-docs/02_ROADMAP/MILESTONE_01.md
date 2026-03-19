# Milestone 01 — Fondation Technique & Auth

## Objectif
Mettre en place la structure d'un projet Next.js 15 (App Router), configurer l'authentification Google avec Firebase, et établir les bases du styling avec Tailwind CSS pour une PWA robuste et mobile-first.

## User stories couvertes
Aucune user story métier directe. Ce milestone pose les fondations techniques indispensables pour toutes les autres features.

## Dépendances
Aucune. C'est le point de départ.

## Livrables précis

- **Configuration Projet :**
    - `/.gitignore` : Fichier standard pour Next.js et Firebase.
    - `/package.json` : Dépendances (`next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `firebase`, `next-pwa`, `@heroicons/react`, `zustand`).
    - `/tsconfig.json` : Configuration TypeScript avec `strict: true`.
    - `/next.config.mjs` : Configuration Next.js avec `next-pwa` et headers `COOP/COEP` pour le futur usage de FFmpeg.
    - `/tailwind.config.ts` : Configuration Tailwind avec la palette de couleurs (sage, sand) et les statuts.
    - `/postcss.config.js` : Configuration standard pour Tailwind.
    - `/public/manifest.json` : Manifeste PWA de base (nom, icônes, `display: 'standalone'`).

- **Structure des dossiers :**
    - `/app/(auth)/login/page.tsx` : Page de connexion avec le bouton Google Sign-In.
    - `/app/(app)/layout.tsx` : Layout protégé qui valide la session utilisateur et redirige vers `/login` si non authentifié.
    - `/app/(app)/calendrier/page.tsx` : Page placeholder pour le calendrier, accessible uniquement si connecté.
    - `/app/layout.tsx` : Layout racine avec `meta` tags pour PWA et viewport.
    - `/app/globals.css` : Styles globaux Tailwind.

- **Logique Auth & State :**
    - `/lib/firebase.ts` : Initialisation du client Firebase et configuration de la persistance de session.
    - `/lib/hooks/useAuth.ts` : Hook custom pour accéder à l'état de l'utilisateur et aux fonctions de connexion/déconnexion.
    - `/lib/store/useAuthStore.ts` : Store Zustand pour gérer l'état global de l'utilisateur.

- **Types :**
    - `/lib/types/index.ts` : Définitions TypeScript initiales pour `User`.

## Spécifications techniques détaillées

- **Auth Google :**
    - Utiliser `firebase/auth` avec `signInWithPopup` et `GoogleAuthProvider`.
    - La session doit être persistante grâce à `browserLocalPersistence`. Une fois connecté, Judith ne doit plus jamais avoir à se reconnecter manuellement.
    - Le hook `useAuth` exposera l'état `user`, `loading`, `signIn`, et `signOut`.

- **Structure Next.js (App Router) :**
    - `(auth)` et `(app)` seront des "Route Groups" pour structurer les layouts.
    - Le layout de `(app)` vérifiera la session. Si l'utilisateur n'est pas connecté, il redirigera vers `/login` en utilisant le hook `useRouter` de `next/navigation`.

- **PWA (Progressive Web App) :**
    - Configurer `next-pwa` pour générer un service worker.
    - Le `manifest.json` doit inclure le nom de l'app "Mon Acu Hub", les couleurs du thème, et des icônes de différentes tailles.
    - Les meta tags iOS (`apple-mobile-web-app-capable`, etc.) seront dans le layout racine pour une expérience "app-like" sur iPhone.

- **Styling :**
    - `tailwind.config.ts` doit inclure la palette :
        - `sage`: #5C7A5F (primaire)
        - `sand`: #F5F1E9 (fond)
        - Statuts : `idea` (blue), `planned` (yellow), `shot` (orange), `editing` (purple), `ready` (green), `published` (gray).
    - `@heroicons/react` sera la seule bibliothèque d'icônes.

## Contraintes
- **App Router ONLY** : Ne pas utiliser le `pages` directory.
- **TypeScript Strict** : `strict: true` dans `tsconfig.json`.
- **Mobile First** : Toutes les vues doivent être fonctionnelles et esthétiques sur une largeur de 375px.
- **Zéro logique métier** : Ce milestone est purement technique.

## Definition of Done
- [ ] Le projet se build sans erreur (`npm run build`).
- [ ] La page `/login` s'affiche correctement.
- [ ] Cliquer sur "Connexion avec Google" ouvre la popup de connexion.
- [ ] Après connexion, l'utilisateur est redirigé vers `/calendrier`.
- [ ] En étant connecté, rafraîchir la page `/calendrier` ne déconnecte pas.
- [ ] Tenter d'accéder à `/calendrier` sans être connecté redirige vers `/login`.
- [ ] Le store Zustand est correctement mis à jour avec les informations de l'utilisateur.
- [ ] L'application peut être ajoutée à l'écran d'accueil sur un appareil mobile (PWA).

## Prompt one shot pour Claude Code

```
# Milestone 01 — Fondation Technique & Auth Next.js

## Contexte
Tu initialises "Mon Acupunctrice Hub V2", une PWA pour une acupunctrice solo. Ce premier milestone consiste à créer la structure du projet Next.js 15 (App Router), l'authentification Google avec Firebase, et la configuration de base.

## Stack
- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Firebase (Auth)
- Zustand
- next-pwa
- @heroicons/react

## Objectif
Créer toute la fondation technique : structure des fichiers, configuration des outils, et un flow d'authentification Google fonctionnel avec une route protégée.

## Livrables à créer

1.  **`package.json`** : Inclure `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `firebase`, `zustand`, `next-pwa`, `@heroicons/react`.
2.  **`next.config.mjs`** :
    - Importer `withPWA` de `next-pwa`.
    - Configurer `pwa: { dest: 'public', register: true, skipWaiting: true }`.
    - Ajouter les headers `Cross-Origin-Opener-Policy: same-origin` et `Cross-Origin-Embedder-Policy: require-corp`.
3.  **`tailwind.config.ts`** :
    - Configurer `content` pour scanner `/app` et `/components`.
    - Étendre `theme.colors` avec :
        - `sage`: '#5C7A5F'
        - `sand`: '#F5F1E9'
        - `status-idea`: '#3b82f6'`, `status-planned`: '#f97316'`, `status-ready`: '#22c55e'`, `status-published`: '#6b7280'`
4.  **`lib/firebase.ts`** :
    - Initialiser l'app Firebase avec les variables d'environnement (`NEXT_PUBLIC_FIREBASE_*`).
    - Exporter `auth`.
    - Configurer `setPersistence(auth, browserLocalPersistence)`.
5.  **`lib/types/index.ts`** :
    - Définir `interface FirebaseUser` avec `uid`, `email`, `displayName`, `photoURL`.
6.  **`lib/store/useAuthStore.ts`** :
    - Créer un store Zustand avec `user: FirebaseUser | null`, `loading: boolean`.
    - Actions : `setUser`, `setLoading`.
7.  **`lib/hooks/useAuth.ts`** :
    - Créer un hook qui utilise `useAuthStore`.
    - Exposer `user`, `loading`.
    - Implémenter `signInWithGoogle` (avec `signInWithPopup`) et `signOut`.
    - Utiliser `onAuthStateChanged` pour synchroniser l'état avec le store Zustand.
8.  **`app/layout.tsx`** :
    - Layout racine avec `<html>` et `<body>`.
    - Inclure les meta tags pour PWA : `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`.
9.  **`app/(auth)/login/page.tsx`** :
    - Page centrée verticalement et horizontalement.
    - Afficher un bouton "Connexion avec Google" (avec l'icône Google).
    - Utiliser le hook `useAuth`. Si `loading`, afficher un spinner. Si `user`, rediriger vers `/calendrier` avec `useRouter`.
    - Le clic sur le bouton appelle `signInWithGoogle`.
10. **`app/(app)/layout.tsx`** :
    - Layout pour les routes protégées.
    - Utiliser `useAuth`.
    - Si `loading`, afficher un spinner en plein écran.
    - Si `!user` et `!loading`, rediriger vers `/login`.
    - Si `user`, rendre `{children}`.
11. **`app/(app)/calendrier/page.tsx`** :
    - Page simple affichant "Calendrier" et un bouton "Déconnexion".
    - Le clic sur le bouton appelle `signOut` du hook `useAuth`.
12. **`public/manifest.json`** :
    - Configurer le manifeste PWA de base.

## Definition of Done
- `npm install && npm run dev` fonctionne.
- La connexion via Google est fonctionnelle.
- La session est persistée après un refresh.
- Les routes sous `(app)` sont inaccessibles sans être connecté.
```
