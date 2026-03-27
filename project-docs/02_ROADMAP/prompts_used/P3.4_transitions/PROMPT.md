# P3.4 — Transitions entre clips

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Apres P3.1, l'editeur supporte les clips multiples (auto-silence removal cree des clips
a partir d'un meme fichier video). L'export concatene les clips sequentiellement sans
effet visuel entre eux — la coupure est brusque. Ce prompt ajoute 6 transitions
Canvas 2D entre les clips.

**PREREQUIS :** Ce prompt necessite que P3.1 (auto-silence removal) ou tout autre
mecanisme qui cree des clips multiples soit en place. Si l'editeur n'a qu'un seul clip,
les transitions ne sont pas visibles. Le multi-clip M2 (timeline visuelle multi-clip)
n'est PAS requis — les transitions fonctionnent entre les clips[] du store.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `lib/utils/exportWebCodecs.ts` → ~200 lignes post-P3.1. Export multi-clip concatene : boucle `for (const clip of clips)` avec seek-based pour chaque clip. Les frames sont encodees sequentiellement avec timestamps continus. C'est ICI que les transitions doivent etre rendues.
- `lib/store/useEditorStore.ts` → ~300 lignes post-P3.3. `clips: VideoClip[]` avec `trimStart`, `trimEnd`, `timelineStart`. Pas de champ `transition` sur les clips.
- `lib/types/editor.ts` → ~75 lignes post-P3.3. `VideoClip` : `{id, file, blobUrl, duration, trimStart, trimEnd, timelineStart, sourceVideoUrl?}`. Pas de type Transition.
- `lib/data/videoThemes.ts` → 172 lignes. `VideoTheme` n'a pas de champ `defaultTransition`. On pourrait l'ajouter.
- `lib/utils/easings.ts` → cree en P2.2. `easeOutCubic`, `easeOutBounce`, `easeOutElastic`, `linear`.
- `components/features/editor/timeline/Timeline.tsx` → timeline de l'editeur. Affiche les blocs des clips. Candidat pour afficher les icones de transition entre les clips.

---

## Livrable 1 — Types et catalogue de transitions

**Fichier :** `lib/types/editor.ts`

Ajouter le type Transition :

```typescript
export type TransitionType = 'none' | 'dissolve' | 'slide_left' | 'slide_right' | 'wipe_down' | 'zoom_in' | 'blur';

export interface ClipTransition {
  type: TransitionType;
  /** Duree de la transition en secondes (200-1000ms) */
  duration: number;
}
```

Ajouter `transition` a `VideoClip` :

```typescript
export interface VideoClip {
  id: string;
  file: File | null;
  blobUrl: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  timelineStart: number;
  sourceVideoUrl?: string;
  /** Transition VERS ce clip (depuis le clip precedent) */
  transition?: ClipTransition;
}
```

**Fichier a creer :** `lib/data/transitionCatalog.ts`

```typescript
import type { TransitionType } from '@/lib/types/editor';

export interface TransitionDef {
  id: TransitionType;
  name: string;
  description: string;
}

export const TRANSITIONS: TransitionDef[] = [
  { id: 'none', name: 'Aucune', description: 'Coupe directe' },
  { id: 'dissolve', name: 'Fondu', description: 'Fondu enchaine entre les deux clips' },
  { id: 'slide_left', name: 'Glisser gauche', description: 'Le nouveau clip glisse depuis la droite' },
  { id: 'slide_right', name: 'Glisser droite', description: 'Le nouveau clip glisse depuis la gauche' },
  { id: 'wipe_down', name: 'Rideau', description: 'Revelation verticale du haut vers le bas' },
  { id: 'zoom_in', name: 'Zoom', description: 'Le clip sortant zoome et revele le suivant' },
  { id: 'blur', name: 'Flou', description: 'Transition via flou' },
];

export const DEFAULT_TRANSITION_DURATION = 0.5; // secondes
```

---

## Livrable 2 — Rendu des transitions dans l'export Canvas

**Fichier a creer :** `lib/utils/drawTransition.ts`

Fonctions de rendu pour chaque type de transition. Chaque fonction recoit
les 2 frames (sortante et entrante) et un `progress` (0 a 1).

```typescript
import { easeOutCubic } from './easings';

/**
 * Dessine une frame de transition entre deux clips.
 *
 * @param ctx - Canvas context de sortie
 * @param fromCanvas - Canvas contenant la frame du clip sortant
 * @param toCanvas - Canvas contenant la frame du clip entrant
 * @param type - Type de transition
 * @param progress - Progression de 0 (debut) a 1 (fin)
 * @param w - Largeur du canvas
 * @param h - Hauteur du canvas
 */
export function drawTransition(
  ctx: CanvasRenderingContext2D,
  fromCanvas: HTMLCanvasElement | OffscreenCanvas,
  toCanvas: HTMLCanvasElement | OffscreenCanvas,
  type: string,
  progress: number,
  w: number, h: number,
) {
  const p = easeOutCubic(progress);

  switch (type) {
    case 'dissolve': {
      // Cross-fade : clip A disparait, clip B apparait
      ctx.globalAlpha = 1 - p;
      ctx.drawImage(fromCanvas, 0, 0, w, h);
      ctx.globalAlpha = p;
      ctx.drawImage(toCanvas, 0, 0, w, h);
      ctx.globalAlpha = 1;
      break;
    }

    case 'slide_left': {
      // Clip A glisse vers la gauche, clip B entre depuis la droite
      const offset = p * w;
      ctx.drawImage(fromCanvas, -offset, 0, w, h);
      ctx.drawImage(toCanvas, w - offset, 0, w, h);
      break;
    }

    case 'slide_right': {
      // Clip A glisse vers la droite, clip B entre depuis la gauche
      const offset = p * w;
      ctx.drawImage(fromCanvas, offset, 0, w, h);
      ctx.drawImage(toCanvas, -w + offset, 0, w, h);
      break;
    }

    case 'wipe_down': {
      // Clip A visible en bas, clip B revele du haut
      const splitY = p * h;
      ctx.drawImage(fromCanvas, 0, 0, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, splitY);
      ctx.clip();
      ctx.drawImage(toCanvas, 0, 0, w, h);
      ctx.restore();
      break;
    }

    case 'zoom_in': {
      // Clip A zoome (scale croissant) et clip B apparait par-dessous
      const scale = 1 + p * 0.5; // zoom de 1x a 1.5x
      ctx.drawImage(toCanvas, 0, 0, w, h); // B en fond
      ctx.globalAlpha = 1 - p;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2, -h / 2);
      ctx.drawImage(fromCanvas, 0, 0, w, h);
      ctx.restore();
      ctx.globalAlpha = 1;
      break;
    }

    case 'blur': {
      // Transition via flou : A se floute, B defloute
      // Note: ctx.filter avec blur() est supportee sur Safari et Chrome
      const blurAmount = Math.sin(progress * Math.PI) * 15; // 0 → 15 → 0
      if (progress < 0.5) {
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(fromCanvas, 0, 0, w, h);
        ctx.filter = 'none';
      } else {
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(toCanvas, 0, 0, w, h);
        ctx.filter = 'none';
      }
      break;
    }

    default: // 'none' — ne devrait pas etre appele
      ctx.drawImage(toCanvas, 0, 0, w, h);
      break;
  }
}
```

---

## Livrable 3 — Integrer les transitions dans exportWebCodecs

**Fichier :** `lib/utils/exportWebCodecs.ts`

La logique multi-clip actuelle (post-P3.1) itere sur chaque clip sequentiellement.
Pour les transitions, il faut rendre les frames de chevauchement.

**Principe :**
- Pendant une transition de duree D entre clip A et clip B :
  - Les D*FPS dernieres frames de clip A chevauchent les D*FPS premieres frames de clip B
  - Pour chaque frame de chevauchement : seeker clip A ET clip B, les dessiner sur 2 canvas
    temporaires, puis appeler `drawTransition(ctx, canvasA, canvasB, type, progress)`
- La duree totale de l'export est reduite de D secondes par transition

**Implementation :**

```typescript
import { drawTransition } from './drawTransition';

// Creer 2 canvas temporaires pour les transitions
const tempCanvasA = document.createElement('canvas');
tempCanvasA.width = W; tempCanvasA.height = H;
const ctxA = tempCanvasA.getContext('2d')!;

const tempCanvasB = document.createElement('canvas');
tempCanvasB.width = W; tempCanvasB.height = H;
const ctxB = tempCanvasB.getContext('2d')!;

// Pour chaque paire de clips consecutifs :
for (let ci = 0; ci < clips.length; ci++) {
  const clip = clips[ci];
  const nextClip = clips[ci + 1];
  const transition = nextClip?.transition;
  const transDuration = transition && transition.type !== 'none' ? transition.duration : 0;
  const transFrames = Math.ceil(transDuration * FPS);

  // Frames normales du clip (sans la zone de transition en fin)
  const clipFrames = Math.ceil((clip.trimEnd - clip.trimStart) * FPS);
  const normalFrames = clipFrames - transFrames;

  // Rendre les frames normales
  for (let i = 0; i < normalFrames; i++) {
    const videoTime = clip.trimStart + i / FPS;
    // ... seek + draw normal (comme avant)
  }

  // Rendre la zone de transition
  if (transFrames > 0 && nextClip && transition) {
    for (let i = 0; i < transFrames; i++) {
      const progress = i / transFrames;
      const timeA = clip.trimStart + (normalFrames + i) / FPS;
      const timeB = nextClip.trimStart + i / FPS;

      // Seeker et dessiner clip A sur tempCanvasA
      video.currentTime = timeA;
      await new Promise<void>(r => { video.onseeked = () => r(); });
      if (filterCss && filterCss !== 'none') ctxA.filter = filterCss;
      ctxA.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
      ctxA.filter = 'none';

      // Seeker et dessiner clip B sur tempCanvasB
      video.currentTime = timeB;
      await new Promise<void>(r => { video.onseeked = () => r(); });
      if (filterCss && filterCss !== 'none') ctxB.filter = filterCss;
      ctxB.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
      ctxB.filter = 'none';

      // Dessiner la transition sur le canvas principal
      drawTransition(ctx, tempCanvasA, tempCanvasB, transition.type, progress, W, H);

      // Encoder la frame
      const ts = Math.round(globalFrameIndex * FRAME_DUR);
      const frame = new VideoFrame(canvas, { timestamp: ts });
      vEnc.encode(frame, { keyFrame: globalFrameIndex % 30 === 0 });
      frame.close();
      globalFrameIndex++;
    }
  }
}
```

**NOTE :** Les overlays texte et sous-titres sont dessines SUR la frame de transition
(apres le `drawTransition`), pour que les textes restent nets pendant la transition.

---

## Livrable 4 — Store : transition par clip

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter une action pour definir la transition d'un clip :

```typescript
// Dans l'interface EditorState
setClipTransition: (clipId: string, transition: ClipTransition) => void;

// Implementation (trackee par undo/redo)
setClipTransition: (clipId, transition) => {
  // pushSnapshot()
  const clips = get().clips.map(c =>
    c.id === clipId ? { ...c, transition } : c
  );
  set({ clips });
},
```

Quand `applySilenceCut` cree des clips, ajouter une transition par defaut `dissolve` :

```typescript
// Dans applySilenceCut, lors de la creation des clips
const newClips = keepSegments.map((seg, i) => ({
  ...clipBase,
  trimStart: seg.start,
  trimEnd: seg.end,
  transition: i > 0 ? { type: 'dissolve' as const, duration: 0.3 } : undefined,
}));
```

---

## Livrable 5 — UI : selecteur de transition entre les clips

**Fichier a creer :** `components/features/editor/timeline/TransitionPicker.tsx`

Petit composant qui apparait entre les clips dans la timeline.

```typescript
'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { TRANSITIONS, DEFAULT_TRANSITION_DURATION } from '@/lib/data/transitionCatalog';
import type { TransitionType, ClipTransition } from '@/lib/types/editor';

interface Props {
  clipId: string;
  currentTransition?: ClipTransition;
}

export default function TransitionPicker({ clipId, currentTransition }: Props) {
  const { setClipTransition } = useEditorStore();
  const [open, setOpen] = useState(false);

  const current = currentTransition?.type || 'none';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center mx-1 shrink-0"
        title="Transition"
      >
        <span className="text-[8px] text-gray-400">
          {current === 'none' ? '+' : current.charAt(0).toUpperCase()}
        </span>
      </button>
    );
  }

  return (
    <div className="absolute z-20 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 w-48">
      <p className="text-[10px] text-gray-400 mb-1">Transition</p>
      <div className="space-y-0.5">
        {TRANSITIONS.map(t => (
          <button
            key={t.id}
            onClick={() => {
              setClipTransition(clipId, {
                type: t.id,
                duration: current === 'none' ? DEFAULT_TRANSITION_DURATION : (currentTransition?.duration ?? DEFAULT_TRANSITION_DURATION),
              });
              setOpen(false);
            }}
            className={`w-full text-left px-2 py-1 rounded text-xs ${
              current === t.id ? 'bg-sage/20 text-sage' : 'text-gray-300'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
      {current !== 'none' && currentTransition && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <label className="text-[10px] text-gray-500">
            Duree : {currentTransition.duration.toFixed(1)}s
          </label>
          <input
            type="range" min={0.2} max={1.0} step={0.1}
            value={currentTransition.duration}
            onChange={e => setClipTransition(clipId, {
              type: currentTransition.type,
              duration: +e.target.value,
            })}
            className="w-full accent-sage"
          />
        </div>
      )}
      <button
        onClick={() => setOpen(false)}
        className="mt-1 w-full text-[10px] text-gray-500 text-center"
      >
        Fermer
      </button>
    </div>
  );
}
```

**Integration dans Timeline.tsx :**

Afficher un `TransitionPicker` entre chaque paire de blocs de clips dans la timeline.
Le `TransitionPicker` est un cercle cliquable entre les blocs. Il n'apparait que
quand il y a 2+ clips.

---

## Contraintes
- NE PAS installer de dependance externe (transitions en Canvas 2D pur)
- NE PAS utiliser WebGL ou gl-transitions (reserve pour Phase 4)
- NE PAS modifier drawOverlays.ts ni drawSubtitles.ts
- NE PAS modifier les Cloud Functions ou les routes API
- Les transitions ne sont visibles que quand il y a 2+ clips
- La duree de transition est ajustable (200ms a 1000ms)
- Les transitions sont rendues dans l'export ENTRE les clips
- Les overlays et sous-titres sont dessines APRES la transition (restent nets)
- La transition `blur` utilise `ctx.filter = blur()` — verifier la compatibilite Safari
- Le premier clip n'a PAS de transition (la transition est "vers" un clip)
- Les transitions sont trackees par l'undo/redo
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `TransitionType` et `ClipTransition` dans editor.ts
- [ ] `VideoClip` a un champ optionnel `transition`
- [ ] `transitionCatalog.ts` avec 6 transitions + 'none'
- [ ] `drawTransition.ts` avec les 6 fonctions de rendu Canvas 2D
- [ ] `dissolve` : cross-fade opacite
- [ ] `slide_left` et `slide_right` : translation horizontale
- [ ] `wipe_down` : revelation verticale via clip region
- [ ] `zoom_in` : scale + fade du clip sortant
- [ ] `blur` : transition via flou (ctx.filter)
- [ ] L'export rend les transitions entre les clips (2 frames sources → 1 frame sortie)
- [ ] Les overlays/sous-titres restent nets pendant les transitions
- [ ] `setClipTransition` dans le store, trackee par undo/redo
- [ ] `auto-silence removal` ajoute une transition `dissolve` par defaut
- [ ] `TransitionPicker` dans la timeline entre les clips
- [ ] La duree de transition est ajustable (0.2s-1.0s)
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/exportWebCodecs.ts`
- `lib/utils/easings.ts`
- `lib/store/useEditorStore.ts`
- `lib/types/editor.ts`
- `lib/data/videoThemes.ts`
- `components/features/editor/timeline/Timeline.tsx`
- `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` (section C — Transitions)
