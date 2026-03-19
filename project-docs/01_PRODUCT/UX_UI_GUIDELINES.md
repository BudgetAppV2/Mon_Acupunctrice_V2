# UX/UI Guidelines

Ce document définit les standards visuels et d'interaction pour l'application Mon Acupunctrice, assurant une expérience utilisateur cohérente et agréable.

## 1. Palette de couleurs

La palette est conçue pour être apaisante, professionnelle et naturelle, reflétant le domaine de l'acupuncture.

### Couleurs Primaires
-   **Sage (Sauge)** : Utilisée pour les éléments principaux, les actions, les fonds et les accents. C'est la couleur signature de la marque.
    -   `sage-50`: `#f4f7f4` (Fonds très clairs)
    -   `sage-100`: `#e5ede5` (Fonds clairs)
    -   `sage-200`: `#c8d9c8` (Bordures subtiles)
    -   `sage-500`: `#4e7a4e` (Actions principales, boutons, liens actifs)
    -   `sage-700`: `#324e32` (Texte principal, titres)
-   **Sand (Sable)** : Utilisée pour les fonds de page, les cartes et les sections pour créer une chaleur douce.
    -   `sand-50`: `#faf8f4` (Fond de page principal)
    -   `sand-100`: `#f3ede2` (Fond de carte)
    -   `sand-200`: `#e5d9c3` (Bordures de cartes)
    -   `sand-500`: `#ad8757` (Accents secondaires)
    -   `sand-700`: `#855f3f` (Texte secondaire)

### Couleurs Neutres
-   **Gray (Gris)** : Utilisé pour le texte, les icônes et les éléments d'interface neutres.
    -   `gray-400`: Texte d'aide, placeholders
    -   `gray-500`: Texte et icônes inactifs
    -   `gray-700`: Texte de corps
    -   `gray-900`: Titres importants

### Couleurs Sémantiques
-   **Erreur (Rouge)** : Une teinte de rouge douce pour les messages d'erreur.
-   **Succès (Vert)** : Coordonné avec la palette Sage pour les confirmations.
-   **Avertissement (Jaune)** : Une teinte ocre/jaune pour les avertissements.

## 2. Typographie

La typographie doit être lisible, claire et moderne.

-   **Police de caractères** : Inter
-   **Titres (h1, h2, h3)** : `font-semibold` ou `font-bold`, couleur `sage-700`.
-   **Texte de corps** : `font-normal`, couleur `gray-700`.
-   **Liens** : `font-medium`, couleur `sage-500`, souligné au survol.

## 3. Composants de base

### Button
-   **Primaire** : Fond `sage-500`, texte blanc. Utilisé pour les actions principales (Ajouter, Sauvegarder, Publier).
-   **Secondaire** : Fond blanc, bordure `sage-500`, texte `sage-500`. Utilisé pour les actions secondaires (Annuler, Exporter).
-   **Fantôme** : Pas de fond, texte `sage-500`. Utilisé pour les actions moins importantes (Ex: "Voir plus").
-   **États** : `hover` (assombrir/éclaircir), `disabled` (opacité réduite, curseur non autorisé).

### Input
-   Fond `sand-50` ou blanc.
-   Bordure `sand-200`.
-   Au focus : bordure `sage-500`.
-   Placeholder : `gray-400`.

### Card
-   Fond `sand-100` ou blanc.
-   Bordure `sand-200`.
-   Ombre subtile (`shadow-sm`).
-   Coins arrondis (`rounded-lg`).

### Badge
-   Utilisé pour les statuts d'item (Idée, Monté, Publié).
-   Fond coloré (ex: `blue-100`), texte contrasté (ex: `blue-800`).
-   Coins arrondis (`rounded-full`).
-   Taille de police petite (`text-xs`).

### Modal
-   Superposition sombre (`bg-black/50`).
-   Conteneur central avec fond blanc ou `sand-50`, coins arrondis et ombre.
-   Doit inclure un titre, un contenu et des actions claires (boutons).
-   Fermable en cliquant sur l'icône "X" ou en dehors du modal.

## 4. Navigation

-   **Mobile First** : La navigation principale est une barre d'onglets en bas de l'écran.
-   **Desktop** : La navigation est une barre d'onglets horizontale en haut de la page.
-   L'onglet actif est clairement indiqué visuellement (fond `sage-500`, texte blanc).

## 5. Ton de voix

Le ton doit être encourageant, simple et humain.

-   **Messages d'erreur** : "Oups, quelque chose n'a pas fonctionné. Veuillez réessayer." plutôt que "Erreur 500".
-   **États vides (Empty States)** : "Votre banque d'idées est vide. Lancez-vous en ajoutant une première idée !" avec une illustration ou une icône sympathique.
-   **Messages de succès** : Clairs et concis. "Vidéo publiée avec succès !".

## 6. Règles Mobile First

-   Le design est conçu pour une largeur d'écran de **375px** en premier.
-   Utiliser des classes responsives de Tailwind (`sm:`, `md:`, `lg:`) pour adapter la mise en page aux écrans plus grands.
-   Les éléments cliquables doivent être assez grands pour être facilement touchés sur un écran tactile (min 44x44px).
-   Le texte doit être suffisamment grand pour être lisible sans zoom.
