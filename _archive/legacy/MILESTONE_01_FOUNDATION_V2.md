# MILESTONE_01_FOUNDATION_V2.md
# Stabilisation — Version exécutable avec plan de migration
*Version 2.0 — Mars 2026*

---

## Objectif
Rendre le produit sûr et cohérent SANS casser le MVP existant.

## Critères de DONE
- [ ] Un utilisateur non authentifié voit une page de login
- [ ] Les données Firestore ne sont accessibles qu'à l'utilisateur authentifié
- [ ] L'URL canonique est `mon-acupunctrice-hub1.onrender.com`
- [ ] 0 console.log de debug en production
- [ ] Le schéma ContentItem est documenté

## Critère de STOP
> Auth + Security rules = DONE.
> Ne pas refactorer le modèle de données complet avant d'avoir
> validé que l'auth fonctionne avec les données existantes.

---

## M1.1 — Firebase Auth

### Plan d'implémentation

```
Étape 1: Ajouter firebase/auth au projet
Étape 2: Créer AuthContext (React Context)
Étape 3: Créer LoginPage (Google Sign-In, 1 bouton)
Étape 4: Créer ProtectedRoute wrapper
Étape 5: Wrapper App avec AuthProvider
Étape 6: Ajouter userId aux nouvelles données
```

### Plan de migration des données existantes

**Problème :** Les contentItems existants n'ont pas de userId.

**Solution — Migration douce (sans downtime) :**
```js
// Option A — Assigner à un userId "owner" fixe
// Lors du premier login de Judith, tous les items sans userId
// sont migrés vers son uid via une Cloud Function one-time.

export const migrateExistingItems = onCall(async (req) => {
  const { userId } = req.auth
  const items = await db.collection('contentItems')
    .where('userId', '==', null)
    .get()

  const batch = db.batch()
  items.docs.forEach(doc => {
    batch.update(doc.ref, { userId })
  })
  await batch.commit()
  return { migrated: items.size }
})
```

**Fallback UI pendant la migration :**
```jsx
// Si items sans userId → les afficher avec badge "Migration..."
// Pas de downtime, migration transparente
```

### Firestore Security Rules
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contentItems/{itemId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;

      // Permettre la création si userId correspond à l'auteur
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }

    match /reminderLog/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

### Storage Security Rules
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

---

## M1.2 — URL canonique

**Action requise :**
1. Dans le dashboard Render, ajouter un redirect sur l'ancien service :
   `mon-acupunctrice.onrender.com` → 301 vers `mon-acupunctrice-hub1.onrender.com`
2. Mettre à jour le README.md avec l'URL canonique
3. Supprimer l'ancien service dans 30 jours si aucun problème

---

## M1.3 — Nettoyer les console.log

**Fichiers à modifier :**
```
hub/src/editor/hooks/useVideoPlayer.js
  - Supprimer: [useVideoPlayer] seekTo called
  - Supprimer: [useVideoPlayer] Music playing
  - Supprimer: [useVideoPlayer] Audio element created

hub/src/editor/components/AudioPanel.jsx
  - Supprimer: [Audio] Importing from URL
  - Supprimer: [Audio] Fetch response
  - Supprimer: [Audio] Blob size
  - Supprimer: [Audio] ObjectURL created
  - Supprimer: [Audio] setAudio called
  - Supprimer: [AudioPanel] audioUrl changed
  - Supprimer: [WaveSurfer] initWaveSurfer called
  - Supprimer: [WaveSurfer] Loading
  - Supprimer: [WaveSurfer] Ready! Duration

hub/src/editor/components/Timeline.jsx
  - Supprimer: [Timeline] PointerDown!
  - Supprimer: [Timeline] PointerMove!
```

**Garder (utiles en prod) :**
```
- Erreurs WaveSurfer: ws.on('error', ...) → garder
- Erreurs d'export → garder
- Erreurs Cloud Functions → garder
```

---

## M1.4 — Schéma ContentItem v2

**Ne pas migrer maintenant — documenter seulement.**
La migration se fera progressivement au fil des nouvelles features.

```js
// hub/src/types/ContentItem.js
export const ContentItemSchema = {
  // Champs existants (compatibilité)
  id: 'string',
  title: 'string',
  category: 'string',
  status: 'string',        // LEGACY — garder pour compatibilité
  videoUrl: 'string',      // LEGACY — migrer vers asset.videoUrl
  thumbnailUrl: 'string',  // LEGACY — migrer vers asset.thumbnailUrl
  scheduledDate: 'timestamp', // LEGACY — migrer vers distribution

  // Nouveaux champs (ajoutés progressivement)
  userId: 'string',        // REQUIS après M1.1
  workflowState: 'string', // NOUVEAU — remplace partiellement status
  distributionStatus: 'string', // NOUVEAU

  // Futur
  // idea: {...}
  // production: {...}
  // asset: {...}
  // distribution: {...}
  // memory: {...}
}
```

---

## Gestion du downtime

**L'auth va temporairement casser l'app.** Plan :

```
1. Déployer LoginPage + AuthContext (sans ProtectedRoute)
   → App fonctionne encore sans auth

2. Tester le login Google en staging

3. Activer ProtectedRoute + lancer migration des données

4. Valider que Judith peut se connecter et voir ses données

5. Activer les Firestore rules restrictives
```

**Durée estimée de downtime partiel :** 15-30 minutes max.

---

## Ordre d'exécution
1. M1.3 — Nettoyer console.log (15 min, maintenant)
2. M1.2 — URL canonique (30 min)
3. M1.1 — Auth (1 session dédiée)
4. M1.4 — Schéma (documentation seulement)
