# V2_M7 — Feature Flag + Polish

## Objectif
Ajouter le feature flag pour router vers le V2, fixer Bug 1 (drag bounce-back) si toujours present, et faire le polish final (console.log, test 375px, flow complet).

## Fichiers a lire avant de coder

### Hub
- `app/(app)/layout.tsx` — navigation, tabs
- `components/features/calendar/ItemDetailSheet.tsx` — bouton "Editer" dans le calendrier (ou equivalent)
- `components/features/ideas/IdeaDetailSheet.tsx` — bouton "Editer" dans les idees (ou equivalent)
- `lib/types/index.ts` — ContentItem

### Editor V2 (cree en M1-M6)
- `components/features/editor-v2/TracksPanel.tsx` — timeline avec blocs draggables
- `components/features/editor-v2/TrackBlock.tsx` — bloc individuel dans la timeline
- `components/features/editor/timeline/TrimHandle.tsx` — pattern de drag du V1 (pointer events + RAF + setPointerCapture)
- `lib/store/useEditorV2Store.ts` — actions `moveVideoClip`, `moveSubtitleBlock`, `moveTextOverlay`

## Ce que ce milestone doit accomplir

### 1. Feature flag `NEXT_PUBLIC_EDITOR_V2`

Ajouter une variable d'environnement `NEXT_PUBLIC_EDITOR_V2` (boolean string "true"/"false").

Quand `NEXT_PUBLIC_EDITOR_V2=true` :
- Les boutons "Editer" dans le calendrier et les idees pointent vers `/editeur-v2/[id]` au lieu de `/editeur/[id]`
- La creation d'un nouveau contenu a editer navigue vers `/editeur-v2/[id]`

Quand `NEXT_PUBLIC_EDITOR_V2` est absent ou "false" :
- Tout reste identique (V1)

Chercher dans la codebase tous les endroits ou on navigue vers `/editeur/` et les conditionner :
```typescript
const editorPath = process.env.NEXT_PUBLIC_EDITOR_V2 === 'true' ? '/editeur-v2' : '/editeur';
```

Endroits probables :
- `ItemDetailSheet` ou equivalent (bouton Editer depuis le calendrier)
- `IdeaDetailSheet` ou equivalent (bouton Editer depuis les idees)
- Tout `router.push('/editeur/...')` dans le codebase

### 2. Fixer Bug 1 — Timeline drag bounce-back (si toujours present)

**Probleme :** Les blocs dans la timeline (TracksPanel) ne restent pas a leur position apres un drag. Le clip revient a sa position originale. Ca affecte les clips video, les blocs sous-titres et les text overlays.

**Pattern de reference :** `TrimHandle.tsx` du V1 utilise :
- `onPointerDown` avec `setPointerCapture(pointerId)` pour capturer le pointer
- `onPointerMove` avec RAF pour throttler les updates
- `onPointerUp` avec `releasePointerCapture(pointerId)`
- Le delta est calcule depuis `startX` et transmis au parent via callback

**Ou chercher :** `TracksPanel.tsx` et `TrackBlock.tsx` dans la copie. Le bug vient probablement de :
- Un re-render React qui reset la position pendant le drag
- Un delta calcule sur le mauvais referentiel
- Un state qui n'est pas committe a la fin du drag

**Resultat attendu :** Drag un bloc dans la timeline → le bloc reste a sa nouvelle position. Ca fonctionne pour les clips video, les blocs sous-titres, et les text overlays.

### 3. Polish final

Passer en revue tous les fichiers crees dans M1-M6 :

**Console.log :**
- Supprimer tous les `console.log` des fichiers dans `lib/editor-v2/`, `lib/store/useEditorV2Store.ts`, `lib/hooks/useEditorV2*.ts`, `components/features/editor-v2/`
- Les `console.error` dans les catch blocks sont ok

**Test 375px :**
- Le layout doit fonctionner sur un ecran de 375px de large (iPhone SE)
- Le canvas doit etre visible et centree
- Les bottom sheets ne doivent pas depasser l'ecran
- Le header doit etre lisible
- La toolbar doit etre utilisable (pas de boutons tronques)

**Flow complet a verifier :**
1. Naviguer vers `/editeur-v2/{itemId}` (ou via le bouton Editer avec le flag)
2. Importer une video
3. La premiere frame s'affiche immediatement
4. Transcrire → sous-titres affiches
5. Changer le preset de sous-titres
6. Ajouter un filtre
7. Ajouter un text overlay
8. Scrubber → frame correcte
9. Play/Pause fonctionne
10. Refresh → tout est restaure (video re-telechargee, sous-titres, filtres, overlays)
11. Exporter → MP4 genere → upload → PublishSheet
12. Retour → calendrier

**Nettoyage :**
- Verifier qu'aucun import n'est casse
- Verifier qu'aucun fichier du V1 n'a ete modifie (sauf les fichiers de navigation pour le feature flag)

### 4. Ajouter `NEXT_PUBLIC_EDITOR_V2` dans `.env.local.example` ou equivalent

Si un fichier `.env.example` ou `.env.local.example` existe, ajouter :
```
NEXT_PUBLIC_EDITOR_V2=false
```

## Ce que ce milestone ne fait PAS
- Pas d'activation par defaut du V2 (le flag est false par defaut)
- Pas de migration des donnees V1 vers V2
- Pas de suppression du V1

## Definition of Done
1. `npm run build` passe sans erreur
2. Avec `NEXT_PUBLIC_EDITOR_V2=true`, les boutons Editer naviguent vers `/editeur-v2/[id]`
3. Avec `NEXT_PUBLIC_EDITOR_V2` absent ou false, tout reste en V1
4. Le drag des blocs dans la timeline fonctionne sans bounce-back (Bug 1 fixe)
5. Aucun `console.log` dans les fichiers V2
6. Le layout fonctionne sur 375px
7. Le flow complet fonctionne de bout en bout (import → transcription → edit → export → publish)
8. Un refresh restaure l'etat complet depuis Firestore
9. Le V1 fonctionne toujours identiquement
10. Tous les 5 bugs listes dans le specs sont resolus (B1: drag, B2: Safari filters, B3: scrubber, B4: filter thumbnails, B5: gradient)
