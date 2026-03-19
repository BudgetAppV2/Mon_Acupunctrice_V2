# User Flows

Ce document décrit les parcours utilisateur clés de l'application Mon Acupunctrice.

## 1. Première connexion

Ce flow décrit la première expérience de l'utilisateur en arrivant sur l'application.

1.  L'utilisateur navigue vers l'URL racine (`/`).
2.  Le système le redirige automatiquement vers la page `/calendrier`.
3.  La page `CalendarPage` s'affiche, montrant une vue mensuelle du calendrier éditorial.
4.  L'utilisateur voit les contenus planifiés, les espaces vides et les codes couleurs.
5.  Aucun item n'est sélectionné, le panneau latéral `ItemPanel` est masqué.
6.  L'utilisateur peut naviguer entre les onglets "Blitz", "Calendrier" et "Banque d'idées".

## 2. Ajouter une idée

Ce flow décrit comment un utilisateur ajoute une nouvelle idée de contenu.

1.  L'utilisateur clique sur l'onglet "💡 Banque d'idées".
2.  Le système affiche la page `IdeasPage`.
3.  La page contient un champ de saisie simple pour ajouter une nouvelle idée et une liste des idées existantes.
4.  L'utilisateur tape le texte de sa nouvelle idée (ex: "Les 5 points d'acupression pour soulager le stress").
5.  L'utilisateur clique sur le bouton "Ajouter".
6.  La nouvelle idée apparaît instantanément dans la liste des idées.
    - **État d'erreur :** Si le champ est vide, le bouton "Ajouter" est désactivé ou un message d'erreur s'affiche.
    - **État d'erreur :** Si l'ajout échoue (ex: problème réseau), un message d'erreur temporaire (toast) s'affiche.

## 3. Préparer une session Blitz

Ce flow décrit comment l'utilisateur prépare un lot de vidéos à tourner.

1.  L'utilisateur navigue vers l'onglet "🎬 Blitz".
2.  Le système affiche la page `BlitzPage`.
3.  La page montre une liste de "cartes de tournage" basées sur les idées de la "Banque d'idées".
4.  L'utilisateur peut réorganiser les cartes par glisser-déposer pour définir l'ordre de tournage.
5.  L'utilisateur clique sur une carte pour voir plus de détails ou ajouter des notes.
6.  Le panneau latéral `ItemPanel` s'ouvre avec les détails de l'idée (titre, notes, statut).
7.  L'utilisateur peut marquer une idée comme "Prête pour tournage".

## 4. Monter une vidéo dans l'éditeur

Ce flow décrit le processus de montage d'une vidéo.

1.  Depuis le Calendrier, le Blitz ou la Banque d'idées, l'utilisateur a un item de contenu (vidéo) sélectionné.
2.  Dans le panneau latéral `ItemPanel`, l'utilisateur clique sur le bouton "Ouvrir dans l'éditeur".
3.  Le système navigue vers `/editeur/:id`, où `:id` est l'identifiant de la vidéo.
4.  L'interface de l'éditeur `EditorPage` s'affiche en plein écran.
5.  L'utilisateur peut :
    - Importer un fichier vidéo depuis son appareil.
    - Voir un aperçu de la vidéo.
    - Couper le début et la fin de la vidéo (trimming).
    - Ajouter une piste audio (musique de fond).
    - Ajouter des superpositions de texte.
    - Ajouter des sous-titres générés automatiquement.
6.  Une fois le montage terminé, l'utilisateur clique sur "Exporter".
7.  Un modal `ExportModal` apparaît, montrant la progression de l'encodage.
    - **Si/Sinon :** Si l'utilisateur quitte la page pendant l'encodage, un avertissement s'affiche.
    - **État d'erreur :** Si l'export échoue, un message d'erreur détaillé est montré dans le modal.
8.  Une fois l'export terminé, le fichier est automatiquement sauvegardé dans le stockage (Storage) associé à l'item de contenu.
9.  L'utilisateur est redirigé vers la page précédente (ex: Calendrier), et le statut de l'item est mis à jour à "Monté".

## 5. Publier sur Instagram

Ce flow décrit la publication d'une vidéo finalisée sur Instagram.

1.  L'utilisateur sélectionne un item de contenu avec le statut "Monté" depuis le Calendrier.
2.  Le panneau latéral `ItemPanel` s'ouvre.
3.  L'utilisateur clique sur le bouton "Publier".
4.  Un modal de confirmation s'affiche, présentant :
    - Un aperçu de la vidéo.
    - La légende (caption) générée automatiquement.
    - Le premier commentaire (contenant les hashtags) généré automatiquement.
    - L'heure de publication (maintenant ou planifiée).
5.  L'utilisateur peut modifier la légende et le premier commentaire.
6.  L'utilisateur clique sur "Confirmer la publication".
7.  Le système envoie la vidéo et les métadonnées à l'API de publication Instagram via une fonction serverless.
    - **État d'erreur :** Si la publication échoue (API Instagram, etc.), le statut de l'item est changé en "Erreur de publication" et un message d'erreur est enregistré.
8.  Une fois la publication réussie, le statut de l'item passe à "Publié" et l'icône sur le calendrier change de couleur.

## 6. Consulter le calendrier

Ce flow décrit comment l'utilisateur interagit avec son planning de contenu.

1.  L'utilisateur navigue vers l'onglet "📅 Calendrier" (ou y est redirigé par défaut).
2.  La page `CalendarPage` s'affiche avec une vue mensuelle.
3.  Les jours de la semaine sont affichés en colonnes.
4.  Chaque case de jour peut contenir un ou plusieurs items de contenu, représentés par des badges colorés.
    - Le code couleur indique le statut : Idée, Prêt, Monté, Publié, Erreur.
5.  L'utilisateur clique sur un item dans le calendrier.
6.  Le panneau latéral `ItemPanel` s'ouvre et affiche les détails de cet item (titre, statut, aperçu, actions possibles).
7.  L'utilisateur peut naviguer vers les mois précédents ou suivants.
8.  L'utilisateur peut glisser-déposer un item d'un jour à un autre pour le reprogrammer.
    - **Si/Sinon :** Si la reprogrammation échoue, l'item retourne à sa position d'origine et un message d'erreur est affiché.
