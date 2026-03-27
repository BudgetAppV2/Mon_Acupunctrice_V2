# P1.2 — Sous-titres pro (3 nouveaux styles Canvas)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Apres P0.1, le type `SubtitleStyle` a 6 valeurs mais `drawSubtitles.ts` n'implemente
que les 3 styles originaux (classic, tiktok, karaoke). Les 3 nouvelles valeurs
(bold_outline, pill, karaoke_pro) fallback sur 'classic'. Ce prompt les implemente.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `lib/utils/drawSubtitles.ts` → 61 lignes. Rendu Canvas des sous-titres. 3 styles : tiktok (mot courant jaune, ligne 27), karaoke (fond vert, ligne 42), classic (blanc + stroke noir, ligne 50).
- `lib/data/designKnowledge.ts` → 339 lignes. `SUBTITLE_STYLES` (ligne 213-220, 6 valeurs), `PALETTES` (ligne 126-183, 7 palettes avec text/accent/background/stroke).
- `lib/data/videoThemes.ts` → 173 lignes. Chaque theme a `subtitleStyle`, `paletteId`, `subtitleFontSize`. Helper `getThemePalette(theme)` retourne la `ColorPalette`.
- `lib/store/useEditorStore.ts` → 242 lignes. `subtitleStyle: SubtitleStyle` (ligne 57), `activeThemeId` (ligne 50).
- `lib/types/editor.ts` → 64 lignes. `SubtitleStyle` = 6 valeurs (ligne 39). `SubtitleSegment` avec `words: SubtitleWord[]` (lignes 31-37).
- `components/features/editor/panels/SubtitlePanel.tsx` → 72 lignes. Selecteur de style avec seulement 3 options (lignes 8-12). `STYLES` array hardcode.
- `lib/utils/exportWebCodecs.ts` → 128 lignes. Appelle `drawSubtitles()` ligne 85.

---

## Livrable 1 — Implementer bold_outline dans drawSubtitles

**Fichier :** `lib/utils/drawSubtitles.ts`

Ajouter le style `bold_outline` : contour epais 6px noir, remplissage blanc, font bold.
C'est le style #1 confirme par la recherche terrain (VISUAL_ANALYSIS_RESEARCH.md).

Le rendu utilise les couleurs de la palette du theme actif. Pour cela, passer la palette
en parametre optionnel de `drawSubtitles`.

Nouvelle signature :
```typescript
import type { SubtitleSegment, SubtitleStyle } from '@/lib/types';
import type { ColorPalette } from '@/lib/data/designKnowledge';

export function drawSubtitles(
  ctx: CanvasRenderingContext2D,
  subtitles: SubtitleSegment[],
  style: SubtitleStyle,
  time: number,
  w: number,
  h: number,
  palette?: ColorPalette | null,
)
```

Implementation `bold_outline` :
```typescript
} else if (style === 'bold_outline') {
  const textColor = palette?.text ?? '#ffffff';
  const strokeColor = palette?.stroke ?? '#000000';
  ctx.font = `bold ${Math.round(fontSize * 1.2)}px "Inter", sans-serif`;
  ctx.fillStyle = textColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 6 * scale;
  ctx.lineJoin = 'round';
  ctx.strokeText(seg.text, w / 2, y);
  ctx.fillText(seg.text, w / 2, y);
}
```

---

## Livrable 2 — Implementer pill dans drawSubtitles

Style `pill` : fond colore arrondi derriere chaque ligne, texte centre.

```typescript
} else if (style === 'pill') {
  const bgColor = palette?.background ?? 'rgba(0, 0, 0, 0.6)';
  const textColor = palette?.text ?? '#ffffff';
  const pad = 10 * scale;
  const tw = ctx.measureText(seg.text).width;
  // Dessiner le pill (rectangle arrondi)
  const rx = (w - tw) / 2 - pad;
  const ry = y - fontSize / 2 - pad / 2;
  const rw = tw + pad * 2;
  const rh = fontSize + pad;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, fontSize / 3);
  ctx.fillStyle = bgColor;
  ctx.fill();
  // Texte
  ctx.fillStyle = textColor;
  ctx.fillText(seg.text, w / 2, y);
}
```

---

## Livrable 3 — Implementer karaoke_pro dans drawSubtitles

Style `karaoke_pro` : comme karaoke mais le mot actif utilise l'accent color du theme
et est affiche en scale 1.1x. Les mots non-actifs sont en blanc avec stroke.

```typescript
} else if (style === 'karaoke_pro' && seg.words.length > 0) {
  const accentColor = palette?.accent ?? '#5C7A5F';
  const textColor = palette?.text ?? '#ffffff';
  const fullText = seg.words.map(ww => ww.word).join(' ');
  const totalW = ctx.measureText(fullText).width;
  let x = (w - totalW) / 2;
  ctx.textAlign = 'left';
  for (const ww of seg.words) {
    const isCurrent = time >= ww.start && time <= ww.end;
    ctx.save();
    if (isCurrent) {
      // Mot actif : scale 1.1 + accent color
      const wordW = ctx.measureText(ww.word).width;
      const cx = x + wordW / 2;
      ctx.translate(cx, y);
      ctx.scale(1.1, 1.1);
      ctx.translate(-cx, -y);
      ctx.fillStyle = accentColor;
    } else {
      ctx.fillStyle = textColor;
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.strokeText(ww.word, x, y);
    ctx.fillText(ww.word, x, y);
    ctx.restore();
    x += ctx.measureText(ww.word + ' ').width;
  }
}
```

---

## Livrable 4 — Passer la palette depuis l'export et la preview

**Fichier :** `lib/utils/exportWebCodecs.ts`

L'appel a `drawSubtitles` (ligne 85) doit passer la palette du theme actif.

Ajouter un parametre `paletteColors` a `exportWithWebCodecs` :
```typescript
export async function exportWithWebCodecs(
  file: File, trimStart: number, trimEnd: number,
  onProgress: (p: number) => void,
  filterCss?: string, overlays?: TextOverlayItem[],
  subtitles?: SubtitleSegment[], subtitleStyle?: string,
  audioBlob?: Blob | null, paletteColors?: ColorPalette | null,
): Promise<Blob>
```

Et a la ligne 85 :
```typescript
if (subtitles?.length) drawSubtitles(ctx, subtitles, (subtitleStyle || 'classic') as SubtitleStyle, t, W, H, paletteColors);
```

**Fichier :** `lib/hooks/useVideoExport.ts`

Passer la palette lors de l'appel a `exportWithWebCodecs` :
```typescript
import { getTheme, getThemePalette } from '@/lib/data/videoThemes';
// ...
const theme = getTheme(s.activeThemeId);
const palette = getThemePalette(theme);
const blob = await exportWithWebCodecs(
  s.videoFile, s.trimStart, s.trimEnd, setProgress,
  filterCss, s.overlays, s.subtitles, s.subtitleStyle, audioBlob, palette,
);
```

---

## Livrable 5 — Mettre a jour le selecteur de style dans SubtitlePanel

**Fichier :** `components/features/editor/panels/SubtitlePanel.tsx`

Le tableau `STYLES` (lignes 8-12) a seulement 3 entrees. Ajouter les 3 nouveaux :

```typescript
const STYLES: { id: SubtitleStyle; label: string }[] = [
  { id: 'classic', label: 'Classique' },
  { id: 'bold_outline', label: 'Bold' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'pill', label: 'Pill' },
  { id: 'karaoke', label: 'Karaoke' },
  { id: 'karaoke_pro', label: 'Karaoke Pro' },
];
```

---

## Contraintes
- NE PAS modifier le store Zustand (les types sont deja corrects depuis P0.1)
- NE PAS modifier drawOverlays.ts
- NE PAS modifier les composants UI autres que SubtitlePanel
- NE PAS modifier les Cloud Functions
- Le `palette` param est optionnel — les styles existants (classic, tiktok, karaoke) ne changent PAS de comportement si palette est null
- `roundRect` est supporte par tous les navigateurs cibles (Safari 16+, Chrome)
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `bold_outline` rend un texte blanc avec contour 6px noir dans l'export Canvas
- [ ] `pill` rend un fond arrondi colore derriere le texte
- [ ] `karaoke_pro` rend le mot actif en accent color + scale 1.1
- [ ] Les 3 nouveaux styles utilisent les couleurs de la palette du theme actif
- [ ] `SubtitlePanel` affiche les 6 styles dans le selecteur
- [ ] `exportWithWebCodecs` passe la palette a `drawSubtitles`
- [ ] Les styles existants (classic, tiktok, karaoke) ne sont pas affectes
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/drawSubtitles.ts`
- `lib/data/designKnowledge.ts`
- `lib/data/videoThemes.ts`
- `lib/utils/exportWebCodecs.ts`
- `lib/hooks/useVideoExport.ts`
- `components/features/editor/panels/SubtitlePanel.tsx`
- `lib/types/editor.ts`
