# P1.6 — Preview haute qualite (Canvas frame on pause)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
La preview actuelle utilise le DOM : le `<video>` element avec un filtre CSS, les
overlays texte via des `<div>` absolus, et les sous-titres via un composant React.
Le probleme : le rendu DOM ne correspond pas exactement a l'export Canvas (wrapText,
effets texte, styles de sous-titres avances). Ce prompt genere une frame Canvas haute
qualite quand la video est en pause, affichee au-dessus du `<video>` element.

**Prerequis :** P1.1-P1.5 sont completes (fonts, sous-titres pro, effets texte, filtres, themes).

## Stack
Next.js 15 App Router, TypeScript, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `components/features/editor/VideoPreview.tsx` → 181 lignes. Preview video avec filtre CSS (ligne 149-150), TextOverlayLayer (ligne 169), SubtitlePreview (ligne 170). `isPlaying` du store controle play/pause.
- `lib/utils/drawOverlays.ts` → ~85 lignes. `drawTextOverlays(ctx, overlays, time, w, h)` — rendu Canvas des overlays avec effets.
- `lib/utils/drawSubtitles.ts` → ~80 lignes. `drawSubtitles(ctx, subtitles, style, time, w, h, palette?)` — rendu Canvas des sous-titres avec palette.
- `lib/utils/exportWebCodecs.ts` → 128 lignes. Pipeline export — reference pour le rendu (lignes 75-85 : filter, drawImage, drawOverlays, drawSubtitles).
- `lib/store/useEditorStore.ts` → ~244 lignes. `isPlaying`, `currentTime`, `filter`, `overlays`, `subtitles`, `subtitleStyle`, `activeThemeId`.
- `lib/data/videoThemes.ts` → 173 lignes. `getTheme()`, `getThemePalette()`.

---

## Livrable 1 — Hook useCanvasPreview

**Nouveau fichier :** `lib/hooks/useCanvasPreview.ts`

Hook qui genere une frame Canvas quand la video est en pause. Retourne un data URL
ou null (quand playing).

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { FILTERS } from '@/lib/utils/filters';
import { drawTextOverlays } from '@/lib/utils/drawOverlays';
import { drawSubtitles } from '@/lib/utils/drawSubtitles';
import { getTheme, getThemePalette } from '@/lib/data/videoThemes';
import type { SubtitleStyle } from '@/lib/types';

/**
 * Genere une frame Canvas haute qualite quand la video est en pause.
 * Utilise les MEMES fonctions de rendu que l'export.
 */
export function useCanvasPreview(videoEl: HTMLVideoElement | null, containerW: number, containerH: number) {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const state = useEditorStore.getState();
    const { isPlaying, currentTime, filter, overlays, subtitles, subtitleStyle, activeThemeId } = state;

    if (isPlaying || !videoEl || videoEl.readyState < 2) {
      setFrameUrl(null);
      return;
    }

    // Canvas a la taille du conteneur (pas 1080x1920 — preview seulement)
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const canvas = canvasRef.current;
    const w = containerW * (window.devicePixelRatio || 1);
    const h = containerH * (window.devicePixelRatio || 1);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Filtre CSS
    const filterCss = FILTERS.find(f => f.id === filter)?.css ?? 'none';
    if (filterCss !== 'none') ctx.filter = filterCss;

    // Dessiner la video (cover fit)
    const { videoWidth: vw, videoHeight: vh } = videoEl;
    const videoAspect = vw / vh, canvasAspect = w / h;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (videoAspect > canvasAspect) { sw = vh * canvasAspect; sx = (vw - sw) / 2; }
    else { sh = vw / canvasAspect; sy = (vh - sh) / 2; }
    ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, w, h);
    ctx.filter = 'none';

    // Overlays texte
    if (overlays.length > 0) drawTextOverlays(ctx, overlays, currentTime, w, h);

    // Sous-titres
    if (subtitles.length > 0) {
      const theme = getTheme(activeThemeId);
      const palette = getThemePalette(theme);
      drawSubtitles(ctx, subtitles, subtitleStyle as SubtitleStyle, currentTime, w, h, palette);
    }

    setFrameUrl(canvas.toDataURL('image/jpeg', 0.92));
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (frameUrl) URL.revokeObjectURL(frameUrl);
      canvasRef.current = null;
    };
  }, []);

  return frameUrl;
}
```

**Note :** Le `useEffect` sans deps se re-execute a chaque render. C'est voulu :
quand l'utilisateur change un overlay/filtre/sous-titre en pause, la frame se regenere.
La generation est rapide (< 50ms pour une frame a resolution preview).

---

## Livrable 2 — Integrer la preview Canvas dans VideoPreview

**Fichier :** `components/features/editor/VideoPreview.tsx`

Ajouter le canvas frame overlay quand `isPlaying === false` :

1. Importer le hook :
```typescript
import { useCanvasPreview } from '@/lib/hooks/useCanvasPreview';
```

2. Dans le composant, apres le ref video et size :
```typescript
const frameUrl = useCanvasPreview(videoRef.current, size.w, size.h);
```

3. Dans le JSX, apres le `<video>` element et avant TextOverlayLayer :
```typescript
{/* Canvas preview HQ on pause — montre le rendu exact de l'export */}
{frameUrl && !isPlaying && (
  <img
    src={frameUrl}
    alt=""
    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
  />
)}
```

4. Quand la frame Canvas est visible, cacher les overlays DOM et SubtitlePreview
pour eviter le doublon (le Canvas les dessine deja) :

```typescript
{/* Overlays et sous-titres DOM — caches quand la preview Canvas est active */}
{(!frameUrl || isPlaying) && size.w > 0 && <TextOverlayLayer width={size.w} height={size.h} interactive={interactive} />}
{(!frameUrl || isPlaying) && <SubtitlePreview />}
```

**Exception :** En mode `interactive` (onglet texte), toujours afficher le TextOverlayLayer
DOM car l'utilisateur peut deplacer les overlays. Dans ce cas, cacher la frame Canvas :

```typescript
const showCanvasFrame = frameUrl && !isPlaying && !interactive;
```

---

## Livrable 3 — Performance : limiter les regenerations

Pour eviter de regenerer la frame a chaque render (ex: pendant le scrub de la timeline),
ajouter un debounce. La frame se regenere seulement quand la video est en pause
ET que l'etat n'a pas change depuis 100ms.

Dans `useCanvasPreview`, utiliser un `setTimeout` :

```typescript
useEffect(() => {
  const unsub = useEditorStore.subscribe(() => {
    const { isPlaying } = useEditorStore.getState();
    if (isPlaying) { setFrameUrl(null); return; }
    // Debounce 100ms pour eviter les regenerations pendant le scrub
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => generateFrame(), 100);
  });
  return () => { unsub(); clearTimeout(timerRef.current); };
}, [videoEl, containerW, containerH]);
```

---

## Contraintes
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, ou exportWebCodecs.ts
- NE PAS modifier le store Zustand
- NE PAS modifier les Cloud Functions
- La frame Canvas est generee a la resolution du CONTENEUR (pas 1080x1920) pour la performance
- Le Canvas preview est desactive en mode interactive (onglet texte) pour permettre le drag
- Debounce 100ms pour eviter les regenerations pendant le scrub
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] Sur pause, une frame Canvas haute qualite s'affiche au-dessus de la video
- [ ] La frame inclut : filtre CSS, overlays texte avec effets, sous-titres avec style
- [ ] Les overlays/sous-titres DOM sont caches quand la frame Canvas est visible
- [ ] En mode interactive (texte), la frame Canvas est desactivee
- [ ] Le changement d'overlay/filtre/sous-titre en pause regenere la frame
- [ ] Debounce 100ms pour eviter les regenerations excessives
- [ ] La generation de frame prend < 100ms
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `components/features/editor/VideoPreview.tsx`
- `lib/utils/drawOverlays.ts`
- `lib/utils/drawSubtitles.ts`
- `lib/utils/exportWebCodecs.ts`
- `lib/store/useEditorStore.ts`
- `lib/data/videoThemes.ts`
- `lib/utils/filters.ts`
