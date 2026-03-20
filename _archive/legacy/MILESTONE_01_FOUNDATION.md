# MILESTONE_01_FOUNDATION.md
# Stabilisation — Socle sécurisé et cohérent
*Priorité : IMMÉDIATE avant toute nouvelle feature*

---

## Objectif

Rendre le produit sûr, cohérent et maintenable.
Sans cette fondation, tout ce qu'on ajoute est fragile.

## Critères de succès

- [ ] Un utilisateur non authentifié ne peut pas accéder à l'app
- [ ] Les données Firestore ne sont accessibles qu'à l'utilisateur connecté
- [ ] Le schéma `ContentItem` est documenté et respecté partout
- [ ] Il n'y a qu'un seul deployment actif et documenté
- [ ] Les console.log de debug sont retirés

---

## Tâches

### M1.1 — Firebase Auth (priorité #1 absolue)
**Pourquoi :** Les données de Judith (idées, vidéos, stratégie de contenu)
sont actuellement publiques.

- Ajouter Firebase Auth (Google Sign-In, simple)
- Protéger toutes les routes React avec un `<ProtectedRoute>`
- Rattacher chaque `ContentItem` à un `userId`
- Règles Firestore :
  ```
  match /contentItems/{id} {
    allow read, write: if request.auth.uid == resource.data.userId;
  }
  ```
- Règles Storage similaires

**Dépendances :** Aucune
**Risque :** Cassera l'app temporairement — prévoir 1 session dédiée
**Effort estimé :** 1 session Claude Code

### M1.2 — Clarifier les deployments
**Pourquoi :** Deux URLs actives créent de la confusion.

- `mon-acupunctrice.onrender.com` → rediriger vers hub1 ou supprimer
- `mon-acupunctrice-hub1.onrender.com` → URL canonique
- Documenter dans README.md

**Effort estimé :** 30 minutes

### M1.3 — Nettoyer les console.log de debug
**Pourquoi :** Performance + sécurité en production.

Fichiers à nettoyer :
- `useVideoPlayer.js` — logs seekTo, Music playing, Audio element
- `AudioPanel.jsx` — logs Audio importing, WaveSurfer
- `Timeline.jsx` — logs PointerDown, PointerMove
- `ExportModal.jsx` — logs Firestore saving

**Effort estimé :** 15 minutes

### M1.4 — Unifier les statuts métier
**Pourquoi :** `status` porte trop de significations mélangées.

Migration progressive (ne pas casser le MVP) :
- Garder `status` existant pour la compatibilité
- Ajouter `workflowState` (production) et `distributionStatus`
- Migrer l'UI progressivement

**Effort estimé :** 1 session Claude Code

### M1.5 — Schéma ContentItem partagé
Créer `hub/src/types/ContentItem.js` avec la définition canonique.
Référencé par le frontend et les Cloud Functions.

**Effort estimé :** 30 minutes

---

## Ordre recommandé
1. M1.3 (console.log) — rapide, maintenant
2. M1.2 (deployments) — rapide
3. M1.1 (Auth) — une session dédiée, bloquant pour la suite
4. M1.4 + M1.5 (schéma) — après Auth
