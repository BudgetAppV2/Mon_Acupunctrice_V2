# FIX-7 — Filtres Safari, gradient, scrubber, timeline drag, text track

## Contexte
Bugs critiques identifies sur iPhone Safari :
- ctx.filter ne fonctionne PAS sur Safari (WebKit bug #198416)
- Gradient visible apres import (video pas affichee avant play)
- Scrubber ne fonctionne pas avant d'ajouter du contenu
- Trim gauche colle au bord, blocs pas draggables dans la timeline
- Text overlay pas visible dans la timeline tracks

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/components/SubtitleCanvas.tsx` → RAF loop, ctx.filter, video loading
- `subtitle-lab/components/TracksPanel.tsx` → pistes, blocs, trim
- `subtitle-lab/components/TrackBlock.tsx` → trim handles, drag
- `subtitle-lab/components/MiniScrubber.tsx` → scrubber
- `subtitle-lab/components/FilterPanel.tsx` → filtres
- `subtitle-lab/lib/store.ts` → tracks[], duration, textOverlays

---

## Fix 1 — CRITIQUE : ctx.filter ne fonctionne PAS sur Safari

**Probleme :** Safari/WebKit n'a JAMAIS implemente `CanvasRenderingContext2D.filter`.
C'est un bug WebKit ouvert (#198416). `ctx.filter = 'brightness(1.2)'` est
silencieusement ignore sur Safari iOS. Les filtres ne s'appliquent PAS.

**Fix :** Revenir a `style.filter` sur l'element canvas CSS. C'est la seule
approche qui fonctionne sur Safari. Le compromis est que les sous-titres
sont aussi filtres — c'est acceptable pour V1.

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

1. Retirer TOUTES les lignes `ctx.filter = ...` du RAF loop
2. Remettre le filtre CSS sur l'element canvas via un state/ref :

```typescript
// Calculer le filtre CSS a chaque render
const activeClip = findActiveClip(tracksRef.current, currentTime);
const clipFId = (activeClip?.clip.filterId && activeClip.clip.filterId !== 'normal')
  ? activeClip.clip.filterId : filterId;
const activeFilter = FILTERS.find(f => f.id === clipFId);
const cssFilter = (activeFilter?.css !== 'none' && fIntensity > 0)
  ? activeFilter?.css : undefined;

// ... dans le return :
<canvas ... style={{ ..., filter: cssFilter }} />
```

3. Dans le RAF loop, retirer les lignes ctx.filter :
```typescript
// SUPPRIMER :
// const cFid = ...
// const ff = FILTERS.find(x => x.id === cFid);
// if (ff?.css !== 'none' && filterIntensityRef.current > 0) ctx.filter = ff!.css;
// ...
// ctx.filter = 'none';
```

4. Remettre la generation de thumbnail pour les vignettes des filtres.
   Verifier que `thumbnailUrl` est bien genere dans le useEffect loadedmetadata
   (c'est peut-etre casse si le seek a 2s echoue).

---

## Fix 2 — Gradient visible apres import (video pas affichee avant play)

**Probleme :** Apres import d'une video, on voit le gradient au lieu de
la video. Il faut appuyer play pour voir l'image. L'utilisateur devrait
voir la premiere frame immediatement.

**Cause :** Entre `setVideo()` et `initClipDuration()`, le clip a
`trimEnd: 0` → `findActiveClip()` retourne null → le RAF loop dessine
le gradient (via renderFrame avec skipBackground=false).

**Fix :** Dans le RAF loop, quand il n'y a pas de clip actif MAIS
qu'il y a des clips dans le store (juste pas encore initialises),
dessiner du noir au lieu du gradient :

```typescript
// Dans le RAF loop :
const hasAnyClips = tracksRef.current.some(t => t.type === 'video' && t.clips && t.clips.length > 0);

if (!ar) {
  if (hasAnyClips) {
    // Des clips existent mais pas encore initialises → fond noir (PAS gradient)
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // skipBackground = true pour eviter le gradient
    renderFrame({ ..., skipBackground: true, ... });
  } else {
    // Vraiment aucun clip → gradient de demo OK
    renderFrame({ ..., skipBackground: false, ... });
  }
} else { ... }
```

AUSSI : forcer un seek a t=0 apres que initClipDuration est appele,
pour que la video affiche sa premiere frame :
Dans le useEffect loadedmetadata, apres `initClipDuration`, ajouter :
```typescript
vid.currentTime = 0.01; // Forcer l'affichage de la premiere frame
```

---

## Fix 3 — Scrubber ne fonctionne pas avant contenu

**Probleme :** Le MiniScrubber ne scrub pas si la seule chose importee
est une video (pas de sous-titres ni audio).

**Cause probable :** `duration` dans le store est 0 au moment du drag.
Le calcul `ratio * duration = ratio * 0 = 0` donc le scrub ne fait rien.

**Fix :** `subtitle-lab/components/MiniScrubber.tsx`

Si `duration` est 0, ne pas scrub (c'est normal). Mais verifier que
`initClipDuration` met bien a jour la `duration` du store.

Aussi verifier dans le store que `totalClipsDuration` est bien recalcule
quand un clip est initialise via `initClipDuration`.

---

## Fix 4 — Trim gauche colle au bord + blocs pas draggables dans la timeline

**Probleme 1 :** Le trim handle gauche ne peut pas creer d'espace a gauche
du clip. Le clip reste colle a gauche.

**Cause :** Le trimStart augmente mais `recalcTimelineStarts` recalcule
les positions sequentiellement en partant de 0. Le clip se repositionne
toujours a gauche parce que son timelineStart est toujours 0.

C'est le comportement correct pour un trim standard (couper le debut
ne cree PAS d'espace — le clip suivant se rapproche). Mais visuellement
c'est confus. Pour la V1, on garde ce comportement mais on montre
la zone trimmee en gris (deja fait dans FIX2).

**Probleme 2 :** Les blocs ne sont pas draggables pour les repositionner
sur la timeline. On a le reorder (long press drag) pour les CLIPS VIDEO
(A7), mais pas pour les blocs sous-titres ou text overlays.

**Fix :** Ajouter un drag horizontal pour repositionner les blocs de
sous-titres et text overlays dans la timeline.

**Fichier :** `subtitle-lab/components/TrackBlock.tsx`

Ajouter le drag horizontal (en plus du long press reorder qui existe
pour les clips video). Pour les blocs sous-titres et text overlays :
- Tap court = selection
- Drag horizontal = repositionner le bloc sur la timeline
  (modifier startMs/endMs du bloc)
- Les trim handles restent sur les bords

```typescript
const handleDrag = (deltaMs: number) => {
  if (block.type === 'subtitle') {
    // Deplacer le bloc sous-titre
    const store = useSubtitleStore.getState();
    const st = getSubtitleTrack(store.tracks);
    const block = st?.subtitles?.blocks.find(b => b.id === blockId);
    if (block) {
      const dur = block.endMs - block.startMs;
      const newStart = Math.max(0, block.startMs + deltaMs);
      store.updateBlock(blockId, { startMs: newStart, endMs: newStart + dur });
    }
  }
  // Meme logique pour text overlays
};
```

---

## Fix 5 — Text overlays dans le sheet Tracks

**Probleme :** Les text overlays ne sont pas visibles dans la timeline
du sheet Tracks. Ils devraient apparaitre comme des blocs sur une piste
dediee (ou sur la piste sous-titres en couleur differente).

**Fix :** `subtitle-lab/components/TracksPanel.tsx`

Ajouter les text overlays comme blocs sur la piste sous-titres,
en couleur differente (violet/rose au lieu de bleu) :
```typescript
// Dans le rendu de la piste sous-titres :
// Les blocs sous-titres en bleu
// Les text overlays en violet
{textOverlays.map(o => (
  <TrackBlock key={o.id} ...
    color="bg-purple-400/30" label={o.text} ... />
))}
```

Ou creer une 4e piste "Texte" dediee aux text overlays.
La 2e option est plus claire.

---

## Contraintes
- Les filtres DOIVENT utiliser CSS style.filter (ctx.filter ne marche PAS sur Safari)
- NE PAS modifier renderer.ts
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Les filtres s'appliquent visuellement sur iPhone Safari
- [ ] Le slider d'intensite fonctionne (filtre visible/invisible)
- [ ] Les vignettes des filtres utilisent l'image de la video
- [ ] La video apparait immediatement apres import (pas de gradient)
- [ ] Le scrubber fonctionne des qu'une video est importee
- [ ] Les blocs sous-titres et text overlays sont draggables dans la timeline
- [ ] Les text overlays sont visibles dans le sheet Tracks
- [ ] `npm run build` passe
