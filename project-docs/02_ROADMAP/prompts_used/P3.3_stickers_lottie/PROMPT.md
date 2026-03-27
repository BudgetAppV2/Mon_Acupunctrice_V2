# P3.3 — Stickers Lottie

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Judith veut ajouter des stickers animes (fleches, coeurs, etoiles, check marks) a ses
Reels pour rendre le contenu plus dynamique. Ce prompt integre lottie-web pour le
rendering de stickers Lottie sur la preview DOM et dans l'export Canvas frame-par-frame.

Apres Phases 0-2, l'export WebCodecs fonctionne en Worker, les animations texte et
l'undo/redo sont en place.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, lottie-web, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `lib/store/useEditorStore.ts` → ~280 lignes post-P3.2. Store avec overlays, subtitles, themes, templates, undo/redo. Pas de champ `stickers` actuellement.
- `lib/types/editor.ts` → ~65 lignes. `TextOverlayItem`, `SubtitleSegment`, `VideoClip`. Pas de `StickerItem`.
- `lib/utils/exportWebCodecs.ts` → ~170 lignes post-P3.1. Pipeline export seek-based avec multi-clip concatene. Appelle `drawTextOverlays` et `drawSubtitles`. Pas de rendering de stickers.
- `lib/utils/drawOverlays.ts` → ~100 lignes post-P2.2. `drawTextOverlays` avec animations frame-by-frame.
- `components/features/editor/VideoPreview.tsx` → 180 lignes. Preview DOM avec `<video>`, `TextOverlayLayer`, `SubtitlePreview`. Pas de layer stickers.
- `components/features/editor/EditorToolbar.tsx` → ~40 lignes. Tabs : style, templates, trim, filtres, texte, subs, audio, cover.
- `components/features/editor/EditorLayout.tsx` → ~145 lignes. Layout editeur avec panels conditionnels.

---

## Livrable 1 — Installer lottie-web + type StickerItem

**Commande :** `npm install lottie-web`

**Fichier :** `lib/types/editor.ts`

Ajouter l'interface StickerItem :

```typescript
export interface StickerItem {
  id: string;
  /** Identifiant du sticker dans le catalogue */
  stickerId: string;
  /** URL ou path du fichier JSON Lottie */
  lottieUrl: string;
  /** Position relative (0-1) */
  x: number;
  y: number;
  /** Echelle (1 = taille originale, 0.5 = moitie, 2 = double) */
  scale: number;
  /** Timing */
  startTime: number;
  endTime: number;
  /** Loop : rejoue l'animation quand elle se termine */
  loop: boolean;
}
```

Re-exporter depuis `lib/types/index.ts` :
```typescript
export type { StickerItem } from './editor';
```

---

## Livrable 2 — Catalogue de stickers

**Fichier a creer :** `lib/data/stickerCatalog.ts`

Catalogue de 12 stickers simples inclus dans le projet (fichiers JSON Lottie).
Les stickers doivent etre des animations simples et legeres (<20KB chacun).

**IMPORTANT :** Plutot que de telecharger des fichiers LottieFiles (problemes de licence),
creer des stickers JSON Lottie minimalistes programmatiquement OU utiliser des stickers
open-source clairement libres de droits.

**Approche pragmatique :** Utiliser des SVG animes convertis en Lottie via des generateurs,
ou creer des animations simples directement en JSON Lottie.

```typescript
export interface StickerDef {
  id: string;
  name: string;
  category: 'pointer' | 'reaction' | 'decoration' | 'cta';
  /** URL du fichier JSON Lottie — stocke dans public/stickers/ */
  url: string;
  /** Taille originale (pour calculer le scale) */
  width: number;
  height: number;
  /** Duree de l'animation en secondes */
  animationDuration: number;
}

export const STICKER_CATEGORIES = [
  { id: 'pointer', label: 'Pointeurs' },
  { id: 'reaction', label: 'Reactions' },
  { id: 'decoration', label: 'Deco' },
  { id: 'cta', label: 'CTA' },
] as const;

export const STICKERS: StickerDef[] = [
  // Pointeurs
  { id: 'arrow_down', name: 'Fleche bas', category: 'pointer', url: '/stickers/arrow_down.json', width: 100, height: 100, animationDuration: 1.0 },
  { id: 'arrow_right', name: 'Fleche droite', category: 'pointer', url: '/stickers/arrow_right.json', width: 100, height: 100, animationDuration: 1.0 },
  { id: 'hand_point', name: 'Main pointeur', category: 'pointer', url: '/stickers/hand_point.json', width: 100, height: 100, animationDuration: 1.5 },

  // Reactions
  { id: 'heart', name: 'Coeur', category: 'reaction', url: '/stickers/heart.json', width: 100, height: 100, animationDuration: 1.0 },
  { id: 'star', name: 'Etoile', category: 'reaction', url: '/stickers/star.json', width: 100, height: 100, animationDuration: 1.2 },
  { id: 'sparkle', name: 'Etincelle', category: 'reaction', url: '/stickers/sparkle.json', width: 80, height: 80, animationDuration: 1.5 },

  // Decoration
  { id: 'circle_pulse', name: 'Cercle pulse', category: 'decoration', url: '/stickers/circle_pulse.json', width: 120, height: 120, animationDuration: 2.0 },
  { id: 'underline', name: 'Souligne', category: 'decoration', url: '/stickers/underline.json', width: 200, height: 40, animationDuration: 0.8 },
  { id: 'leaf', name: 'Feuille', category: 'decoration', url: '/stickers/leaf.json', width: 80, height: 80, animationDuration: 2.0 },

  // CTA
  { id: 'swipe_up', name: 'Swipe up', category: 'cta', url: '/stickers/swipe_up.json', width: 60, height: 120, animationDuration: 1.5 },
  { id: 'tap_finger', name: 'Tap', category: 'cta', url: '/stickers/tap_finger.json', width: 80, height: 80, animationDuration: 1.0 },
  { id: 'save_bookmark', name: 'Enregistrer', category: 'cta', url: '/stickers/save_bookmark.json', width: 80, height: 80, animationDuration: 1.2 },
];
```

**Fichiers Lottie a creer :** `public/stickers/*.json`

Creer des fichiers Lottie JSON minimalistes. Chaque sticker est une animation simple :
- Fleche : translation + opacite
- Coeur : scale pulse (0.8 → 1.2 → 1.0)
- Etoile : rotation + scale
- Cercle : scale 0 → 1 avec opacite
- Etc.

Structure minimale d'un fichier Lottie JSON :
```json
{
  "v": "5.7.0",
  "fr": 30,
  "ip": 0,
  "op": 30,
  "w": 100,
  "h": 100,
  "layers": [{
    "ty": 4,
    "nm": "Shape",
    "sr": 1,
    "ks": { /* transforms animes */ },
    "shapes": [{ /* forme SVG */ }]
  }]
}
```

**NOTE :** La creation des fichiers Lottie JSON est technique mais chaque fichier
fait <20 lignes de formes + keyframes. Utiliser des formes simples (cercles,
rectangles arrondis, lignes).

---

## Livrable 3 — Store : stickers + actions

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter au store :

```typescript
// Interface EditorState — ajouter :
stickers: StickerItem[];
selectedStickerId: string | null;
addSticker: (stickerId: string) => void;
updateSticker: (id: string, changes: Partial<StickerItem>) => void;
removeSticker: (id: string) => void;
selectSticker: (id: string | null) => void;

// Etat initial
stickers: [],
selectedStickerId: null,

// Actions (trackees par undo/redo)
addSticker: (stickerId) => {
  // pushSnapshot()
  const stickerDef = STICKERS.find(s => s.id === stickerId);
  if (!stickerDef) return;
  const { duration } = get();
  const item: StickerItem = {
    id: crypto.randomUUID(),
    stickerId,
    lottieUrl: stickerDef.url,
    x: 0.5, y: 0.5,
    scale: 1,
    startTime: 0,
    endTime: Math.min(duration || 10, stickerDef.animationDuration * 3),
    loop: true,
  };
  set({ stickers: [...get().stickers, item], selectedStickerId: item.id });
},

updateSticker: (id, changes) => {
  // pushSnapshot()
  set({ stickers: get().stickers.map(s => s.id === id ? { ...s, ...changes } : s) });
},

removeSticker: (id) => {
  // pushSnapshot()
  const { stickers, selectedStickerId } = get();
  set({
    stickers: stickers.filter(s => s.id !== id),
    selectedStickerId: selectedStickerId === id ? null : selectedStickerId,
  });
},

selectSticker: (id) => set({ selectedStickerId: id }),
```

Ajouter `stickers: [], selectedStickerId: null` au `reset()`.
Ajouter `stickers` au snapshot undo (dans `UNDOABLE_KEYS` de undoMiddleware.ts).

---

## Livrable 4 — Preview DOM : sticker Lottie en overlay

**Fichier a creer :** `components/features/editor/stickers/StickerLayer.tsx`

Affiche les stickers animes sur la preview video en utilisant lottie-web
avec le renderer SVG (pour la preview DOM temps reel).

```typescript
'use client';

import { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { useEditorStore } from '@/lib/store/useEditorStore';
import type { StickerItem } from '@/lib/types';

interface Props {
  width: number;
  height: number;
}

export default function StickerLayer({ width, height }: Props) {
  const { stickers, currentTime } = useEditorStore();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stickers.map(sticker => (
        <StickerPreviewItem
          key={sticker.id}
          sticker={sticker}
          currentTime={currentTime}
          containerWidth={width}
          containerHeight={height}
        />
      ))}
    </div>
  );
}

function StickerPreviewItem({
  sticker, currentTime, containerWidth, containerHeight,
}: {
  sticker: StickerItem;
  currentTime: number;
  containerWidth: number;
  containerHeight: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  const isVisible = currentTime >= sticker.startTime && currentTime <= sticker.endTime;

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: sticker.loop,
      autoplay: false,
      path: sticker.lottieUrl,
    });
    animRef.current = anim;

    return () => { anim.destroy(); animRef.current = null; };
  }, [sticker.lottieUrl, sticker.loop]);

  // Sync l'animation avec le currentTime de la video
  useEffect(() => {
    const anim = animRef.current;
    if (!anim || !isVisible) return;
    const localTime = currentTime - sticker.startTime;
    const totalFrames = anim.totalFrames || 30;
    const fps = anim.frameRate || 30;
    const duration = totalFrames / fps;
    const frame = sticker.loop
      ? (localTime % duration) / duration * totalFrames
      : Math.min(localTime / duration, 1) * totalFrames;
    anim.goToAndStop(frame, true);
  }, [currentTime, sticker.startTime, sticker.loop, isVisible]);

  if (!isVisible) return null;

  const size = 60 * sticker.scale; // Taille de base en px sur la preview
  const left = sticker.x * containerWidth - size / 2;
  const top = sticker.y * containerHeight - size / 2;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left, top,
        width: size, height: size,
      }}
    />
  );
}
```

**Fichier :** `components/features/editor/VideoPreview.tsx`

Ajouter `<StickerLayer />` apres `<SubtitlePreview />` (ligne 170) :

```typescript
import StickerLayer from './stickers/StickerLayer';

// Dans le JSX :
<SubtitlePreview />
{size.w > 0 && <StickerLayer width={size.w} height={size.h} />}
```

---

## Livrable 5 — Export Canvas : rendering Lottie frame-par-frame

**Fichier a creer :** `lib/utils/drawStickers.ts`

Dessine les stickers sur le Canvas d'export via lottie-web Canvas renderer.

```typescript
import lottie, { type AnimationItem } from 'lottie-web';
import type { StickerItem } from '@/lib/types';

// Cache des animations chargees
const animCache = new Map<string, { anim: AnimationItem; canvas: HTMLCanvasElement }>();

/**
 * Precharge les animations Lottie necessaires.
 * Doit etre appele AVANT la boucle d'export.
 */
export async function preloadStickers(stickers: StickerItem[]): Promise<void> {
  const uniqueUrls = [...new Set(stickers.map(s => s.lottieUrl))];
  for (const url of uniqueUrls) {
    if (animCache.has(url)) continue;
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;

    const animData = await fetch(url).then(r => r.json());
    const anim = lottie.loadAnimation({
      container: document.createElement('div'),
      renderer: 'canvas',
      rendererSettings: { context: ctx, clearCanvas: true },
      animationData: animData,
      autoplay: false,
    });
    animCache.set(url, { anim, canvas });
  }
}

/**
 * Dessine les stickers sur le canvas d'export.
 */
export function drawStickers(
  ctx: CanvasRenderingContext2D,
  stickers: StickerItem[],
  time: number,
  w: number, h: number,
) {
  for (const sticker of stickers) {
    if (time < sticker.startTime || time > sticker.endTime) continue;

    const cached = animCache.get(sticker.lottieUrl);
    if (!cached) continue;

    const { anim, canvas: stickerCanvas } = cached;
    const localTime = time - sticker.startTime;
    const totalFrames = anim.totalFrames || 30;
    const fps = anim.frameRate || 30;
    const duration = totalFrames / fps;
    const frame = sticker.loop
      ? (localTime % duration) / duration * totalFrames
      : Math.min(localTime / duration, 1) * (totalFrames - 1);

    anim.goToAndStop(Math.floor(frame), true);

    // Dessiner le canvas du sticker sur le canvas d'export
    const size = 200 * sticker.scale * (w / 1080);
    const dx = sticker.x * w - size / 2;
    const dy = sticker.y * h - size / 2;

    ctx.drawImage(stickerCanvas, dx, dy, size, size);
  }
}

/** Nettoyer le cache apres l'export */
export function clearStickerCache() {
  for (const { anim } of animCache.values()) anim.destroy();
  animCache.clear();
}
```

**Fichier :** `lib/utils/exportWebCodecs.ts`

Ajouter le rendering des stickers dans la boucle d'export, apres les overlays et
les sous-titres :

```typescript
import { drawStickers, preloadStickers, clearStickerCache } from './drawStickers';
import type { StickerItem } from '@/lib/types';

// Ajouter stickers a la signature
export async function exportWithWebCodecs(
  file, trimStart, trimEnd, onProgress,
  filterCss, overlays, subtitles, subtitleStyle,
  audioBlob, musicBlob, musicVolume, voiceVolume,
  duckingEnabled, voiceSegments,
  stickers?: StickerItem[],  // NOUVEAU
) {
  // Precharger les stickers AVANT la boucle
  if (stickers?.length) await preloadStickers(stickers);

  // Dans la boucle de rendering, apres drawSubtitles :
  if (stickers?.length) drawStickers(ctx, stickers, exportTime, W, H);

  // Apres l'export : nettoyer
  clearStickerCache();
}
```

---

## Livrable 6 — Panel Stickers dans l'editeur

**Fichier a creer :** `components/features/editor/panels/StickerPanel.tsx`

Panel de selection et gestion des stickers.

```typescript
'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { STICKERS, STICKER_CATEGORIES } from '@/lib/data/stickerCatalog';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function StickerPanel() {
  const { stickers, selectedStickerId, addSticker, removeSticker, updateSticker, selectSticker } = useEditorStore();
  const [activeCat, setActiveCat] = useState('pointer');
  const selected = stickers.find(s => s.id === selectedStickerId);

  // Vue edition d'un sticker selectionne
  if (selected) {
    return (
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <button onClick={() => selectSticker(null)} className="text-xs text-gray-400">
            Retour
          </button>
          <button onClick={() => removeSticker(selected.id)} className="text-xs text-red-400 flex items-center gap-1">
            <TrashIcon className="w-3 h-3" /> Supprimer
          </button>
        </div>
        <div>
          <label className="text-xs text-gray-500">Taille : {Math.round(selected.scale * 100)}%</label>
          <input type="range" min={0.3} max={3} step={0.1} value={selected.scale}
            onChange={e => updateSticker(selected.id, { scale: +e.target.value })}
            className="w-full accent-sage" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Debut : {selected.startTime.toFixed(1)}s</label>
            <input type="range" min={0} max={useEditorStore.getState().duration} step={0.1}
              value={selected.startTime}
              onChange={e => updateSticker(selected.id, { startTime: +e.target.value })}
              className="w-full accent-sage" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Fin : {selected.endTime.toFixed(1)}s</label>
            <input type="range" min={0} max={useEditorStore.getState().duration} step={0.1}
              value={selected.endTime}
              onChange={e => updateSticker(selected.id, { endTime: +e.target.value })}
              className="w-full accent-sage" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-400">
          <input type="checkbox" checked={selected.loop}
            onChange={e => updateSticker(selected.id, { loop: e.target.checked })}
            className="accent-sage" />
          Boucle
        </label>
      </div>
    );
  }

  // Vue catalogue
  return (
    <div className="px-3 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Stickers ({stickers.length})</span>
      </div>
      {/* Liste des stickers ajoutes */}
      {stickers.length > 0 && (
        <div className="space-y-1">
          {stickers.map(s => {
            const def = STICKERS.find(d => d.id === s.stickerId);
            return (
              <button key={s.id} onClick={() => selectSticker(s.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-gray-800 text-left">
                <span className="text-[10px] text-gray-500 w-10">{s.startTime.toFixed(1)}s</span>
                <span className="text-xs text-gray-300 truncate flex-1">{def?.name || s.stickerId}</span>
              </button>
            );
          })}
        </div>
      )}
      {/* Tabs categories */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {STICKER_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            className={`px-2 py-1 rounded-full text-[10px] whitespace-nowrap ${
              activeCat === cat.id ? 'bg-sage text-white' : 'bg-gray-800 text-gray-400'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>
      {/* Grille stickers */}
      <div className="grid grid-cols-4 gap-2">
        {STICKERS.filter(s => s.category === activeCat).map(s => (
          <button key={s.id} onClick={() => addSticker(s.id)}
            className="flex flex-col items-center gap-1 p-2 rounded bg-gray-800">
            <PlusIcon className="w-5 h-5 text-gray-500" />
            <span className="text-[9px] text-gray-400 truncate w-full text-center">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

Ajouter le tab "Stickers" dans EditorToolbar.tsx et le rendering dans EditorLayout.tsx.

---

## Contraintes
- NE PAS installer d'autre dependance que lottie-web
- NE PAS modifier drawOverlays.ts ni drawSubtitles.ts
- NE PAS modifier les Cloud Functions ou les routes API
- Les fichiers Lottie JSON doivent etre dans `public/stickers/` et <20KB chacun
- Les animations Lottie doivent etre PRECHARGEES avant l'export (pas de fetch pendant la boucle)
- Le renderer Canvas de lottie-web doit etre utilise pour l'export (pas SVG)
- Le renderer SVG est OK pour la preview DOM (plus fluide)
- Les stickers ne sont PAS draggables dans ce prompt (position via sliders, le drag viendra plus tard)
- Le cache d'animations doit etre nettoye apres l'export pour liberer la memoire
- Le sticker respecte le timing startTime/endTime (invisible hors de cette plage)
- Ajouter `stickers` au snapshot undo (undoMiddleware.ts)
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `npm install lottie-web` installe
- [ ] `StickerItem` interface dans editor.ts
- [ ] `stickerCatalog.ts` avec 12 stickers en 4 categories
- [ ] 12 fichiers Lottie JSON dans `public/stickers/`
- [ ] `stickers[]` et `selectedStickerId` dans le store avec actions CRUD
- [ ] `StickerLayer` preview DOM avec lottie-web SVG renderer
- [ ] Les stickers sont visibles sur la preview video
- [ ] `drawStickers.ts` dessine les stickers dans l'export via Canvas renderer
- [ ] `preloadStickers` charge les animations AVANT la boucle d'export
- [ ] Les stickers sont rendus dans le fichier MP4 exporte
- [ ] `StickerPanel` avec catalogue et controles (taille, timing, boucle)
- [ ] Tab "Stickers" dans EditorToolbar
- [ ] Les actions stickers sont trackees par l'undo/redo
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/store/useEditorStore.ts`
- `lib/types/editor.ts`
- `lib/utils/exportWebCodecs.ts`
- `lib/utils/drawOverlays.ts`
- `components/features/editor/VideoPreview.tsx`
- `components/features/editor/EditorToolbar.tsx`
- `components/features/editor/EditorLayout.tsx`
- `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` (section D — Stickers Lottie)
