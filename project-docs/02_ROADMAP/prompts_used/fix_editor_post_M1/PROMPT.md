# Fix post-M1 — Playhead, preview noire, play/pause global

## Problèmes constatés après le refactor M1 du store multi-clip

### Bug 1 — Le playhead ne contrôle plus la preview
Quand on drag le playhead sur la timeline, la preview vidéo ne suit plus.
Le `seekTo` dans le store fait `_videoEl.currentTime = c` mais soit `_videoEl`
est null, soit le `duration` clamp le temps à 0.

**Diagnostic à faire :**
1. Vérifier que `registerVideoElement` est bien appelé dans VideoPreview
2. Vérifier que `_videoEl` n'est pas null quand `seekTo` est appelé
3. Vérifier que `duration` dans le store est > 0 quand le playhead est draggé
4. Ajouter un `console.log` temporaire dans `seekTo` pour voir les valeurs

**Le problème est probablement lié à M1 :** Le `syncLegacyFields` met
`duration: first?.duration ?? 0`. Si `setDuration` n'a pas encore été
appelé (la vidéo n'a pas fini de charger), `duration` est 0, et `seekTo`
clamp tout à 0.

### Bug 2 — Preview noire quand le playhead est hors du bloc vidéo
Quand le playhead est positionné avant `trimStart` ou après `trimEnd`,
la preview devrait afficher du noir (car cette portion est hors-trim).
Actuellement la preview montre toujours la dernière frame.

**Fix :** Dans `VideoPreview.tsx`, vérifier si `currentTime < trimStart` ou
`currentTime > trimEnd`. Si oui, afficher un overlay noir sur la vidéo.

### Bug 3 — Pas de bouton play/pause dans tous les onglets
Le bouton play/pause overlay n'est visible que dans l'onglet Trim (quand
`interactive` est false). Mais Judith devrait pouvoir jouer/pauser la vidéo
depuis n'importe quel onglet de l'éditeur (Filtres, Texte, Sous-titres, Audio, Cover).

**Fix :** Le bouton play/pause doit toujours être visible dans la preview,
sauf quand on est en mode interactive (onglet Texte où on drag les overlays).
En fait `interactive` est déjà false pour tous les onglets sauf Texte — vérifier
que le play/pause fonctionne partout.

## Stack
Next.js 15, TypeScript, Zustand, Tailwind.

## Livrables attendus

### 1. Fix playhead → preview sync

**Fichiers à investiguer :**
- `lib/store/useEditorStore.ts` — `seekTo`, `syncLegacyFields`, `setDuration`
- `components/features/editor/VideoPreview.tsx` — `registerVideoElement`
- `components/features/editor/timeline/Timeline.tsx` — `timeFromPointer`

**Actions :**
- Ajouter des `console.log` dans `seekTo` pour diagnostiquer (puis les retirer)
- S'assurer que `seekTo` n'est pas bloqué par un `duration === 0` 
- S'assurer que `_videoEl` est bien enregistré
- Vérifier que le `duration` dans le store correspond bien à la durée source du fichier

### 2. Preview noire hors-trim

**Fichier :** `components/features/editor/VideoPreview.tsx`

Ajouter un overlay noir conditionnel :
```typescript
const isOutOfTrim = currentTime < trimStart || currentTime > trimEnd;
```

```jsx
{isOutOfTrim && (
  <div className="absolute inset-0 bg-black z-5" />
)}
```

Placer l'overlay APRÈS le `<video>` mais AVANT les overlays texte et sous-titres
(ils ne doivent pas être cachés par le noir — les overlays sont sur la timeline globale).

### 3. Play/pause visible sur tous les onglets

**Fichier :** `components/features/editor/VideoPreview.tsx`

Vérifier que le bouton play/pause est visible quand `interactive === false`.
Les onglets de l'éditeur passent `interactive={activeTab === 'texte'}` :
- Trim → interactive=false → play/pause visible ✅
- Filtres → interactive=false → play/pause visible ✅
- Texte → interactive=true → play/pause caché (pour ne pas interférer avec le drag d'overlay) ✅
- Sous-titres → interactive=false → play/pause visible ✅
- Audio → interactive=false → play/pause visible ✅
- Cover → interactive=false → play/pause visible ✅

Si le play/pause est déjà visible sur tous les onglets sauf Texte, le problème
est peut-être que le tap sur la preview ne toggle pas le play/pause correctement.
Vérifier que `handleTap` est bien appelé.

## Contraintes
- NE PAS modifier le store multi-clip (clips[], syncLegacyFields)
- NE PAS modifier la timeline (Track, TextTrack, etc.)
- NE PAS modifier l'export
- Les `console.log` de diagnostic doivent être retirés après le fix
- Mobile first 375px

## Definition of Done
- [ ] Dragger le playhead sur la timeline met à jour la preview en temps réel
- [ ] La preview affiche du noir quand le playhead est hors du trim (avant trimStart ou après trimEnd)
- [ ] Le bouton play/pause est visible et fonctionnel sur tous les onglets (sauf Texte)
- [ ] Play respecte le trim — joue de trimStart à trimEnd, puis s'arrête
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `lib/store/useEditorStore.ts` (seekTo, play, pause, syncLegacyFields)
- `components/features/editor/VideoPreview.tsx` (preview + play/pause)
- `components/features/editor/timeline/Timeline.tsx` (playhead drag)
- `components/features/editor/EditorLayout.tsx` (activeTab → interactive)
