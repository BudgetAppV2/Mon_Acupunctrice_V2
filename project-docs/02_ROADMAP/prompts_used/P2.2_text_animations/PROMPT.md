# P2.2 — Animations texte (5 animations)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Apres P2.1, l'export peut tourner dans un Worker. Les overlays texte sont dessines
dans `drawOverlays.ts` mais n'ont aucune animation frame-by-frame — le champ
`animation` existe dans le type `TextOverlayItem` mais n'est pas utilise pendant
le rendering export. Ce prompt ajoute 5 animations texte rendues frame-par-frame
dans l'export et la preview HQ (Canvas sur pause, livree en P1.6).

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `lib/utils/drawOverlays.ts` → 63 lignes. `drawTextOverlays(ctx, overlays, time, w, h)` — dessine les overlays texte. Utilise `wrapText` de designKnowledge. Boucle sur chaque overlay (ligne 17-44), verifie timing (ligne 18), dessine stroke (ligne 34-41) puis fillText via wrapText (ligne 42).
- `lib/types/editor.ts` → 63 lignes. `TextOverlayItem` (ligne 7-23) : champs `animation: TextAnimation` (type actuel : 'none' | 'fade' | 'slide_up' | 'slide_left' | 'bounce' | 'zoom'). Pas de champ `animationDuration`.
- `lib/data/designKnowledge.ts` → 338 lignes. `TEXT_ANIMATIONS` (ligne 242-249) : `['none', 'fade_in', 'typewriter', 'scale_pop', 'slide_up', 'bounce']`. `TextAnimationType` (ligne 251). `wrapText()` (ligne 284-313) et `measureWrappedText()` (ligne 318-338).
- `lib/data/videoThemes.ts` → 172 lignes. `VideoTheme.defaultAnimation: TextAnimationType` — chaque theme definit l'animation par defaut pour les nouveaux overlays (ex: sage_zen = 'fade_in', bold_energy = 'scale_pop').
- `lib/store/useEditorStore.ts` → 241 lignes. `addOverlay` (ligne 172-176) cree un overlay avec `animation: 'none'`. Pas de champ `animationDuration`.
- `lib/utils/exportWebCodecs.ts` → ~127 lignes. Appelle `drawTextOverlays(ctx, overlays, t, W, H)` a la ligne 84.
- `components/features/editor/panels/TextEditView.tsx` → panneau d'edition d'un overlay texte.

---

## Livrable 1 — Ajouter animationDuration au type et au store

**Fichier :** `lib/types/editor.ts`

Aligner `TextAnimation` avec `TextAnimationType` de designKnowledge et ajouter `animationDuration` :

```typescript
// Remplacer le type TextAnimation existant (ligne 5)
export type TextAnimation = 'none' | 'fade_in' | 'typewriter' | 'scale_pop' | 'slide_up' | 'bounce';

// Ajouter animationDuration a TextOverlayItem (apres animation, ligne 22)
export interface TextOverlayItem {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  x: number;
  y: number;
  startTime: number;
  endTime: number;
  style: TextStylePreset;
  animation: TextAnimation;
  animationDuration: number;  // duree de l'animation d'entree en secondes (defaut 0.5)
}
```

**Fichier :** `lib/store/useEditorStore.ts`

Modifier `addOverlay` (ligne ~172) pour utiliser l'animation et la duree du theme actif :

```typescript
addOverlay: (text) => {
  const id = crypto.randomUUID();
  const { duration, activeThemeId } = get();
  const theme = getTheme(activeThemeId);
  set({
    overlays: [...get().overlays, {
      id, text: text || 'Texte', fontFamily: theme.fontTitle, fontSize: 32,
      fill: '#ffffff', x: 0.5, y: 0.5, startTime: 0, endTime: duration || 10,
      style: 'classic' as const, animation: theme.defaultAnimation,
      animationDuration: 0.5,
    }],
    selectedOverlayId: id,
  });
  markEditorTouched();
},
```

Faire la meme chose dans `handleNarration` de TextPanel.tsx.

---

## Livrable 2 — Fonctions d'easing

**Fichier a creer :** `lib/utils/easings.ts`

Fonctions d'easing pures en JS, sans dependance externe :

```typescript
/** t va de 0 a 1, retourne une valeur eased de 0 a 1 */

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
  if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
  t -= 2.625 / 2.75;
  return 7.5625 * t * t + 0.984375;
}

export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}

export function linear(t: number): number {
  return t;
}
```

---

## Livrable 3 — Rendu des animations dans drawOverlays

**Fichier :** `lib/utils/drawOverlays.ts`

Modifier `drawTextOverlays` pour appliquer les animations frame-by-frame.
L'animation ne joue que pendant les N premieres secondes de l'overlay
(de `startTime` a `startTime + animationDuration`). Apres, l'overlay est affiche normalement.

```typescript
import type { TextOverlayItem } from '@/lib/types';
import { wrapText, measureWrappedText } from '@/lib/data/designKnowledge';
import { easeOutCubic, easeOutBounce, easeOutElastic, linear } from './easings';

export function drawTextOverlays(
  ctx: CanvasRenderingContext2D,
  overlays: TextOverlayItem[],
  time: number,
  w: number,
  h: number,
) {
  const scale = w / 375;
  for (const o of overlays) {
    if (time < o.startTime || time > o.endTime) continue;
    ctx.save();

    // Calculer la progression de l'animation
    const elapsed = time - o.startTime;
    const animDuration = o.animationDuration ?? 0.5;
    const animProgress = animDuration > 0 ? Math.min(elapsed / animDuration, 1) : 1;

    // Appliquer l'animation
    applyAnimation(ctx, o, animProgress, w, h, scale);

    ctx.restore();
  }
}

function applyAnimation(
  ctx: CanvasRenderingContext2D,
  o: TextOverlayItem,
  progress: number,
  w: number, h: number, scale: number,
) {
  const fontSize = Math.round(o.fontSize * scale);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.font = `bold ${fontSize}px "${o.fontFamily}", sans-serif`;
  ctx.fillStyle = o.fill;

  if (o.shadowColor && o.shadowBlur) {
    ctx.shadowColor = o.shadowColor;
    ctx.shadowBlur = o.shadowBlur * scale;
  }

  const px = o.x * w;
  const py = o.y * h;
  const maxWidth = w - 120 * scale;
  const lineH = fontSize * 1.2;

  const anim = o.animation || 'none';

  switch (anim) {
    case 'fade_in': {
      ctx.globalAlpha = easeOutCubic(progress);
      drawOverlayText(ctx, o, px, py, maxWidth, lineH, scale);
      ctx.globalAlpha = 1;
      break;
    }

    case 'typewriter': {
      // Reveler lettre par lettre
      const totalChars = o.text.length;
      const visibleChars = Math.floor(linear(progress) * totalChars);
      const visibleText = o.text.slice(0, visibleChars);
      const tempOverlay = { ...o, text: visibleText };
      drawOverlayText(ctx, tempOverlay, px, py, maxWidth, lineH, scale);
      break;
    }

    case 'scale_pop': {
      const s = 0.3 + 0.7 * easeOutElastic(progress);
      // Calculer le centre du texte pour scaler autour
      const textH = measureWrappedText(ctx, o.text, maxWidth, lineH);
      const centerX = px;
      const centerY = py + textH / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(s, s);
      ctx.translate(-centerX, -centerY);
      drawOverlayText(ctx, o, px, py, maxWidth, lineH, scale);
      break;
    }

    case 'slide_up': {
      const offsetY = (1 - easeOutCubic(progress)) * 100 * scale;
      ctx.globalAlpha = easeOutCubic(progress);
      drawOverlayText(ctx, o, px, py + offsetY, maxWidth, lineH, scale);
      ctx.globalAlpha = 1;
      break;
    }

    case 'bounce': {
      const s = easeOutBounce(progress);
      const textH = measureWrappedText(ctx, o.text, maxWidth, lineH);
      const centerX = px;
      const centerY = py + textH / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(s, s);
      ctx.translate(-centerX, -centerY);
      ctx.globalAlpha = Math.min(progress * 3, 1); // Fade in rapide
      drawOverlayText(ctx, o, px, py, maxWidth, lineH, scale);
      ctx.globalAlpha = 1;
      break;
    }

    default: // 'none'
      drawOverlayText(ctx, o, px, py, maxWidth, lineH, scale);
      break;
  }
}

/** Dessine le texte d'un overlay (stroke + fill) — extrait de la boucle actuelle */
function drawOverlayText(
  ctx: CanvasRenderingContext2D,
  o: TextOverlayItem,
  px: number, py: number,
  maxWidth: number, lineH: number, scale: number,
) {
  if (o.strokeWidth && o.stroke) {
    ctx.strokeStyle = o.stroke;
    ctx.lineWidth = o.strokeWidth * scale;
    const lines = getLines(ctx, o.text, maxWidth);
    for (let i = 0; i < lines.length; i++) {
      ctx.strokeText(lines[i], px, py + i * lineH);
    }
  }
  wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
}

function getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  return lines;
}
```

---

## Livrable 4 — Selecteur d'animation dans TextEditView

**Fichier :** `components/features/editor/panels/TextEditView.tsx`

Ajouter un selecteur d'animation et un slider de duree dans le panneau d'edition texte.

Utiliser les constantes de `designKnowledge.ts` :

```typescript
import { TEXT_ANIMATIONS } from '@/lib/data/designKnowledge';

const ANIMATION_LABELS: Record<string, string> = {
  none: 'Aucune',
  fade_in: 'Fondu',
  typewriter: 'Machine',
  scale_pop: 'Pop',
  slide_up: 'Glisser',
  bounce: 'Rebond',
};
```

UI : une rangee de boutons compacts (comme les categories de fonts) + un slider
pour `animationDuration` (0.3s a 2.0s, pas de 0.1s, defaut 0.5s).

```tsx
{/* Animation */}
<div className="space-y-1">
  <label className="text-xs text-gray-500">Animation</label>
  <div className="flex gap-1 overflow-x-auto scrollbar-hide">
    {TEXT_ANIMATIONS.map(a => (
      <button
        key={a}
        onClick={() => updateOverlay(overlay.id, { animation: a })}
        className={`px-2 py-1 rounded-full text-[10px] whitespace-nowrap ${
          overlay.animation === a ? 'bg-sage text-white' : 'bg-gray-800 text-gray-400'
        }`}
      >
        {ANIMATION_LABELS[a] || a}
      </button>
    ))}
  </div>
  {overlay.animation !== 'none' && (
    <div>
      <label className="text-xs text-gray-500">Duree : {(overlay.animationDuration ?? 0.5).toFixed(1)}s</label>
      <input
        type="range" min={0.3} max={2.0} step={0.1}
        value={overlay.animationDuration ?? 0.5}
        onChange={e => updateOverlay(overlay.id, { animationDuration: +e.target.value })}
        className="w-full accent-sage"
      />
    </div>
  )}
</div>
```

---

## Contraintes
- NE PAS modifier exportWebCodecs.ts (les animations sont rendues dans drawOverlays qui est deja appele)
- NE PAS modifier drawSubtitles.ts
- NE PAS ajouter de dependances externes (easing en pur JS)
- NE PAS ajouter plus de 5 animations (les 6 restantes sont en Phase 4)
- NE PAS modifier les Cloud Functions ou les routes API
- NE PAS modifier videoThemes.ts (les themes definissent deja `defaultAnimation`)
- Les animations doivent etre visibles dans la preview HQ (P1.6) et l'export
- L'animation ne joue que pendant `animationDuration` secondes apres `startTime`
- Apres l'animation, l'overlay est affiche normalement (pas de boucle)
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `TextOverlayItem` a un champ `animationDuration: number` (defaut 0.5)
- [ ] `TextAnimation` type aligne avec `TextAnimationType` : 'none' | 'fade_in' | 'typewriter' | 'scale_pop' | 'slide_up' | 'bounce'
- [ ] `drawTextOverlays` applique les animations frame-by-frame
- [ ] `fade_in` : opacite 0 → 1 avec easeOutCubic
- [ ] `typewriter` : lettres revelees progressivement
- [ ] `scale_pop` : zoom de 0.3 a 1.0 avec easeOutElastic
- [ ] `slide_up` : glissement du bas avec fade + easeOutCubic
- [ ] `bounce` : echelle avec easeOutBounce
- [ ] Animation visible dans la preview HQ (Canvas sur pause, P1.6)
- [ ] Selecteur d'animation dans TextEditView avec 6 boutons (none + 5 animations)
- [ ] Slider de duree (0.3s-2.0s) visible quand animation != 'none'
- [ ] `addOverlay` utilise `theme.defaultAnimation` et `animationDuration: 0.5`
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/drawOverlays.ts`
- `lib/types/editor.ts`
- `lib/data/designKnowledge.ts`
- `lib/data/videoThemes.ts`
- `lib/store/useEditorStore.ts`
- `lib/utils/exportWebCodecs.ts`
- `components/features/editor/panels/TextEditView.tsx`
- `components/features/editor/panels/TextPanel.tsx`
