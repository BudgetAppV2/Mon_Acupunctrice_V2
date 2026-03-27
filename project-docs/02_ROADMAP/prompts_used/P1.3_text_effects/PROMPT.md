# P1.3 — Effets texte (outline, glow, pill) dans drawOverlays

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Les overlays texte n'ont actuellement qu'un rendu basique (fill + optional stroke).
Ce prompt ajoute 3 effets visuels Canvas : outline, glow, pill_background.
Chaque overlay pourra avoir un `effect: TextEffectType` et le theme actif
definira l'effet par defaut pour les nouveaux overlays.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `lib/data/designKnowledge.ts` → 339 lignes. `TEXT_EFFECTS` (ligne 228-236) : none, outline, double_outline, glow, pill.
- `lib/types/editor.ts` → 64 lignes. `TextOverlayItem` (lignes 7-23) — n'a PAS de champ `effect` actuellement. A `style: TextStylePreset` et `animation: TextAnimation`.
- `lib/utils/drawOverlays.ts` → 64 lignes. `drawTextOverlays()` avec wrapText. Gere stroke/fill, shadow.
- `lib/data/videoThemes.ts` → 173 lignes. Chaque theme a `defaultTextEffect: TextEffectType` (ex: 'outline', 'pill', 'glow').
- `lib/store/useEditorStore.ts` → 242 lignes. `addOverlay` (ligne ~171) cree un overlay avec `style: 'classic'`.
- `components/features/editor/panels/TextEditView.tsx` → 65 lignes. Affiche FontSelector, StyleSelector, AnimationSelector.
- `components/features/editor/text/StyleSelector.tsx` — selecteur de style texte existant.

---

## Livrable 1 — Ajouter le champ effect a TextOverlayItem

**Fichier :** `lib/types/editor.ts`

Ajouter `effect` au type `TextOverlayItem` :
```typescript
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
  effect: 'none' | 'outline' | 'double_outline' | 'glow' | 'pill';
}
```

---

## Livrable 2 — Implementer les effets dans drawOverlays.ts

**Fichier :** `lib/utils/drawOverlays.ts`

Modifier `drawTextOverlays` pour appliquer l'effet de chaque overlay. L'effet remplace
la logique stroke/fill actuelle quand `effect !== 'none'`.

```typescript
import type { TextOverlayItem } from '@/lib/types';
import { wrapText } from '@/lib/data/designKnowledge';

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
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    const fontSize = Math.round(o.fontSize * scale);
    ctx.font = `bold ${fontSize}px "${o.fontFamily}", sans-serif`;
    const px = o.x * w;
    const py = o.y * h;
    const maxWidth = w - 120 * scale;
    const lineH = fontSize * 1.2;
    const effect = o.effect ?? 'none';

    if (effect === 'pill') {
      // Fond arrondi semi-transparent derriere le texte
      const lines = getLines(ctx, o.text, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        const tw = ctx.measureText(lines[i]).width;
        const pad = 8 * scale;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.roundRect(px - tw / 2 - pad, py + i * lineH - pad / 2, tw + pad * 2, lineH + pad, fontSize / 3);
        ctx.fill();
      }
      ctx.fillStyle = o.fill;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    } else if (effect === 'glow') {
      // Lueur neon : double draw avec shadowBlur
      ctx.shadowColor = o.fill;
      ctx.shadowBlur = 12 * scale;
      ctx.fillStyle = o.fill;
      // Premier pass (glow)
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
      // Second pass (nettoyer pour rendre le texte net)
      ctx.shadowBlur = 0;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    } else if (effect === 'outline' || effect === 'double_outline') {
      // Contour : stroke noir epais puis fill
      const lines = getLines(ctx, o.text, maxWidth);
      if (effect === 'double_outline') {
        // Premiere couche de stroke (plus large, blanc)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6 * scale;
        ctx.lineJoin = 'round';
        for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      }
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3 * scale;
      ctx.lineJoin = 'round';
      for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      ctx.fillStyle = o.fill;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    } else {
      // none ou fallback — comportement original
      if (o.shadowColor && o.shadowBlur) {
        ctx.shadowColor = o.shadowColor;
        ctx.shadowBlur = o.shadowBlur * scale;
      }
      if (o.strokeWidth && o.stroke) {
        ctx.strokeStyle = o.stroke;
        ctx.lineWidth = o.strokeWidth * scale;
        const lines = getLines(ctx, o.text, maxWidth);
        for (let i = 0; i < lines.length; i++) ctx.strokeText(lines[i], px, py + i * lineH);
      }
      ctx.fillStyle = o.fill;
      wrapText(ctx, o.text, px, py, maxWidth, lineH, 'center');
    }
    ctx.restore();
  }
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

## Livrable 3 — Effet par defaut depuis le theme actif

**Fichier :** `lib/store/useEditorStore.ts`

Modifier `addOverlay` pour utiliser l'effet par defaut du theme actif :

```typescript
addOverlay: (text) => {
  const id = crypto.randomUUID();
  const { duration, activeThemeId } = get();
  const theme = getTheme(activeThemeId);
  set({
    overlays: [...get().overlays, {
      id, text: text || 'Texte', fontFamily: theme.fontTitle, fontSize: 32,
      fill: '#ffffff', x: 0.5, y: 0.5, startTime: 0, endTime: duration || 10,
      style: 'classic' as const, animation: 'none' as const,
      effect: theme.defaultTextEffect,
    }],
    selectedOverlayId: id,
  });
  markEditorTouched();
},
```

**Note :** Si P1.1 a deja modifie `addOverlay` pour utiliser `theme.fontTitle`, ajouter seulement le champ `effect`.

---

## Livrable 4 — Selecteur d'effet dans TextEditView

**Fichier :** `components/features/editor/panels/TextEditView.tsx`

Ajouter un selecteur d'effet apres le StyleSelector (ligne 50). Creer un composant
inline simple (pas un fichier separe) ou un composant `EffectSelector` :

```typescript
// Dans TextEditView, apres AnimationSelector
<div>
  <label className="text-xs text-gray-500">Effet</label>
  <div className="flex gap-1 mt-0.5">
    {(['none', 'outline', 'double_outline', 'glow', 'pill'] as const).map(eff => (
      <button
        key={eff}
        onClick={() => update({ effect: eff })}
        className={`px-2 py-1 rounded text-[10px] font-medium transition ${
          overlay.effect === eff ? 'bg-sage/20 ring-1 ring-sage text-white' : 'bg-gray-800 text-gray-400'
        }`}
      >
        {eff === 'none' ? 'Aucun' : eff === 'outline' ? 'Contour' : eff === 'double_outline' ? 'Double' : eff === 'glow' ? 'Glow' : 'Pill'}
      </button>
    ))}
  </div>
</div>
```

---

## Contraintes
- NE PAS modifier drawSubtitles.ts (c'est P1.2)
- NE PAS modifier exportWebCodecs.ts (il appelle deja drawTextOverlays sans changement)
- NE PAS modifier les Cloud Functions
- Le champ `effect` est optionnel dans le rendu (fallback 'none') pour retrocompat avec overlays existants
- `roundRect` est supporte par Safari 16+ et Chrome
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `TextOverlayItem` a un champ `effect` de type string union
- [ ] `outline` rend un contour 3px noir + fill
- [ ] `double_outline` rend un double contour (blanc 6px + noir 3px) + fill
- [ ] `glow` rend un effet lueur neon avec shadowBlur
- [ ] `pill` rend un fond arrondi semi-transparent derriere le texte
- [ ] `addOverlay` utilise l'effet par defaut du theme actif
- [ ] TextEditView a un selecteur d'effet
- [ ] Les overlays existants sans `effect` fonctionnent (fallback 'none')
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/data/designKnowledge.ts`
- `lib/types/editor.ts`
- `lib/utils/drawOverlays.ts`
- `lib/data/videoThemes.ts`
- `lib/store/useEditorStore.ts`
- `components/features/editor/panels/TextEditView.tsx`
