# FIX-5 — Sheets Texte et Cover (version riche)

## Contexte
Le Lab a un moteur de rendu de sous-titres ultra-complet : 8 presets visuels,
7 types d'animations (fade, pop, slide-up, typewriter, karaoke, bounce,
neon-pulse), bgColor, outlineWidth, shadowBlur, letterSpacing, textTransform,
positionnement x/y. Le texte overlay doit etre AUSSI riche que les sous-titres
en reutilisant le meme moteur de rendu.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3, @heroicons/react.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/presets.ts` → 8 presets de style (capcut-bold, karaoke-glow,
  typewriter, bounce-pop, slide-up, minimal-shadow, neon-outline, handwritten)
- `subtitle-lab/lib/types.ts` → StylePreset, AnimationType, SubtitleBlock, WordToken
- `subtitle-lab/lib/renderer.ts` → renderFrame, renderBlock — LE moteur de rendu
  qui dessine les sous-titres avec tous les effets
- `subtitle-lab/lib/animations.ts` → computeWordStates, getWordAlpha, etc.
- `subtitle-lab/components/PresetGallery.tsx` → galerie horizontale de presets
- `subtitle-lab/components/ControlPanel.tsx` → controles de style (couleur, taille, etc.)
- `subtitle-lab/lib/store.ts` → tracks[], blocks, globalPreset
- `subtitle-lab/app/page.tsx` → sheets, bottom sheets
- `components/features/editor/panels/CoverPanel.tsx` (hub) → reference cover

---

## Concept cle : Les text overlays SONT des SubtitleBlock

Le moteur de rendu (renderer.ts) sait deja dessiner des blocs de texte
avec tous les effets. Un text overlay est simplement un SubtitleBlock
avec un seul mot qui couvre tout le texte. On reutilise le MEME moteur
de rendu — pas besoin d'ecrire un nouveau renderer.

Un TextOverlay dans le store est converti en SubtitleBlock avant le rendu :
```typescript
function textOverlayToBlock(overlay: TextOverlay): SubtitleBlock {
  return {
    id: overlay.id,
    text: overlay.text,
    startMs: overlay.startMs,
    endMs: overlay.endMs,
    words: [{
      text: overlay.text,
      startMs: overlay.startMs,
      endMs: overlay.endMs,
    }],
  };
}
```

Chaque TextOverlay a son propre StylePreset (copie d'un preset existant
avec ses personnalisations). Le renderer dessine les text overlays APRES
les sous-titres, avec le meme code.

---

## Livrable 1 — Type TextOverlay et store

**Fichier :** `subtitle-lab/lib/types.ts`

```typescript
export interface TextOverlay {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  style: StylePreset; // meme type que les sous-titres — tous les effets disponibles
}
```

**Fichier :** `subtitle-lab/lib/store.ts`

Ajouter au store :
```typescript
textOverlays: TextOverlay[];
selectedOverlayId: string | null;
addTextOverlay: () => void;
updateTextOverlay: (id: string, changes: Partial<TextOverlay>) => void;
removeTextOverlay: (id: string) => void;
selectOverlay: (id: string | null) => void;
duplicateTextOverlay: (id: string) => void;
```

`addTextOverlay` cree un overlay avec le preset 'capcut-bold' par defaut,
positionne au centre (x: 0.5, y: 0.5), visible de currentTime a +3s :
```typescript
addTextOverlay: () => set((s) => {
  const preset = PRESETS.find(p => p.id === 'capcut-bold')!;
  const overlay: TextOverlay = {
    id: crypto.randomUUID(),
    text: 'Texte',
    startMs: s.currentTime,
    endMs: Math.min(s.currentTime + 3000, s.duration || 10000),
    style: { ...preset, position: { x: 0.5, y: 0.5 } },
  };
  return { textOverlays: [...s.textOverlays, overlay], selectedOverlayId: overlay.id };
}),
```

---

## Livrable 2 — TextPanel.tsx (sheet Texte riche)

**Nouveau fichier :** `subtitle-lab/components/TextPanel.tsx`

**Vue liste** (quand aucun overlay selectionne) :
- Bouton "+ Ajouter texte" en haut (PlusIcon)
- Liste des overlays existants tries par startMs
- Chaque item : texte tronque + timing + petit preview du style
- Tap → selectionne l'overlay

**Vue edition** (quand un overlay est selectionne) :
- Bouton retour (ArrowLeftIcon) + Dupliquer + Supprimer
- Input texte
- **Galerie de presets** : les MEMES 8 presets que les sous-titres !
  Scroll horizontal avec les pills animees. Tap un preset → remplace
  le style de l'overlay selectionne (sauf position et text)
- **Controles de style** : reprendre les memes controles que ControlPanel :
  - Couleur texte (pastilles + custom)
  - Couleur fond (pastilles + transparent)
  - Taille (slider)
  - Position (picker x/y ou drag sur le canvas)
  - Animation (selector parmi les 7 types)
- **Timing** : sliders debut/fin
- Le rendu live sur le canvas montre l'overlay avec le preset choisi

L'idee c'est que c'est la MEME experience que les sous-titres :
l'utilisateur choisit un preset, personnalise, positionne, et voit
le resultat en temps reel sur le canvas.

---

## Livrable 3 — Rendu des text overlays via le moteur existant

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Dans le RAF loop, APRES le rendu des sous-titres, dessiner les text overlays
en utilisant le MEME `renderBlock` de renderer.ts :

```typescript
// Text overlays — reutilise le moteur de rendu des sous-titres
const overlays = textOverlaysRef.current;
for (const o of overlays) {
  if (timeRef.current < o.startMs || timeRef.current > o.endMs + 200) continue;
  // Convertir en SubtitleBlock pour le renderer
  const block: SubtitleBlock = {
    id: o.id,
    text: o.text,
    startMs: o.startMs,
    endMs: o.endMs,
    words: [{ text: o.text, startMs: o.startMs, endMs: o.endMs }],
  };
  renderBlock(ctx, block, o.style, timeRef.current, wallMs, CANVAS_W, CANVAS_H);
}
```

Note : `renderBlock` est actuellement une fonction interne de renderer.ts
(pas exportee). Il faudra soit l'exporter, soit deplacer le rendu des
overlays dans renderFrame en passant les overlays en parametre.

**Approche recommandee :** Ajouter `textOverlays` aux options de renderFrame :
```typescript
interface RendererOptions {
  // ... existant ...
  textOverlays?: TextOverlay[]; // AJOUTER
}
```
Et dans renderFrame, apres le rendu des blocs sous-titres, rendre les overlays :
```typescript
if (opts.textOverlays) {
  for (const o of opts.textOverlays) {
    if (currentMs < o.startMs || currentMs > o.endMs + 200) continue;
    const block: SubtitleBlock = { id: o.id, text: o.text, startMs: o.startMs, endMs: o.endMs,
      words: [{ text: o.text, startMs: o.startMs, endMs: o.endMs }] };
    renderBlock(ctx, block, o.style, currentMs, nowMs, canvasWidth, canvasHeight);
  }
}
```

Ajouter les refs necessaires dans SubtitleCanvas.tsx :
```typescript
const { textOverlays } = useSubtitleStore();
const textOverlaysRef = useRef(textOverlays);
useEffect(() => { textOverlaysRef.current = textOverlays; }, [textOverlays]);
```

Et passer textOverlays au renderFrame dans le RAF loop.

---

## Livrable 4 — CoverPanel.tsx (sheet Cover)

**Nouveau fichier :** `subtitle-lab/components/CoverPanel.tsx`

Le cover est la vignette qui represente la video (sur Instagram).
C'est une frame de la video a un moment choisi.

**UI :**
- Vignette preview (64px de large, ratio 9:16)
- Slider de frame : 0 a duration (ms), step 100ms
- Quand le slider change : seek une video cachee, capturer la frame
  dans un canvas 270x480 en JPEG
- Stocker le dataURL dans le store

**Le CoverPanel cree un element video CACHE** pour la capture (comme le hub).
Ne touche PAS le videoRef du canvas principal.

**Fichier :** `subtitle-lab/lib/store.ts`

Ajouter :
```typescript
coverFrameMs: number;
coverDataUrl: string | null;
setCoverFrame: (ms: number, dataUrl: string) => void;
```

---

## Livrable 5 — Integrer dans page.tsx

Remplacer les placeholders par TextPanel et CoverPanel.

---

## Contraintes
- Les text overlays reutilisent le MEME moteur de rendu que les sous-titres
  (renderer.ts renderBlock) — PAS un nouveau renderer
- Les 8 presets visuels sont disponibles pour les text overlays
- Les 7 animations sont disponibles pour les text overlays
- Le cover n'utilise PAS Firebase (dataURL local seulement)
- NE PAS modifier les presets existants
- NE PAS modifier les animations existantes
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Ajouter un text overlay fonctionne (texte + preset par defaut)
- [ ] Les 8 presets sont selectionnables pour les text overlays
- [ ] Le text overlay s'affiche sur le canvas avec le preset choisi
- [ ] Les animations fonctionnent sur les text overlays (pop, fade, etc.)
- [ ] Couleur texte, couleur fond, taille, position sont editables
- [ ] Timing start/end est editable avec sliders
- [ ] Le slider de frame cover capture une vignette
- [ ] La vignette cover est visible dans le sheet Cover
- [ ] Ajouter une 2e video via le bouton + → le clip s'affiche (pas fond noir)
- [ ] La 2e video a sa duree initialisee (pas duration=0)
- [ ] `npm run build` passe


---

## Livrable 6 — Fix addVideoClip duration=0 (2e video ne s'affiche pas)

**Probleme :** Quand on ajoute une 2e video via le bouton + dans le
sheet Tracks, `addVideoClip()` cree un clip avec `duration: 0` et
`trimEnd: 0`. Le clip n'est jamais trouve par `findActiveClip()` car
sa duree effective est 0ms. C'est le meme bug que le FIX-1 mais pour
les clips ajoutes apres le premier.

**Cause :** Le useEffect qui ecoute `loadedmetadata` (ligne ~65 de
SubtitleCanvas) reagit a `videoUrl` — le champ flat synchronise au
premier clip de V1. Quand on ajoute un clip sur V2, `videoUrl` ne
change pas, donc le useEffect ne se declenche pas.

**Fix :** Quand `addVideoClip` cree un clip, il faut immediatement
detecter la duree du fichier et appeler `initClipDuration`.

**Fichier :** `subtitle-lab/lib/store.ts`

Dans `addVideoClip`, extraire la duree du fichier immediatement :
```typescript
addVideoClip: (file) => {
  const blobUrl = URL.createObjectURL(file);
  const clip: VideoClip = { id: crypto.randomUUID(), file, blobUrl,
    duration: 0, trimStart: 0, trimEnd: 0, timelineStart: 0,
    filterId: 'normal', thumbnailUrl: null };
  // ... ajouter le clip au store comme avant ...

  // Extraire la duree immediatement
  const vid = document.createElement('video');
  vid.preload = 'metadata';
  vid.src = blobUrl;
  vid.addEventListener('loadedmetadata', () => {
    if (vid.duration && isFinite(vid.duration)) {
      get().initClipDuration(clip.id, vid.duration * 1000);
    }
    vid.removeAttribute('src');
    vid.load();
  });
},
```

Ca casse le cercle vicieux : le clip aura sa duree des que les
metadonnees sont chargees, et `findActiveClip` pourra le trouver.
