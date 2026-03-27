# P0.2 — Unifier les sources de verite (filtres, fonts, wrapText)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Le systeme de design V2 a ete cree dans `lib/data/designKnowledge.ts` (FILTERS_V2,
FONTS, PALETTES, wrapText) mais le code actuel utilise encore les sources V1 :
- `lib/utils/filters.ts` — 9 filtres V1 avec `ffmpeg` field inutile
- `lib/utils/fontLoader.ts` — 30 fonts en 6 categories (different de designKnowledge)

Ce prompt unifie tout vers la source de verite V2 dans `designKnowledge.ts`.

**Prerequis :** P0.1 (convergence store + types) doit etre complete avant.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Firebase Firestore.

## Fichiers a lire AVANT de commencer
- `lib/data/designKnowledge.ts` → 339 lignes, source de verite V2. Contient `FILTERS_V2` (10 filtres, `{id,label,css}` sans ffmpeg), `FONTS` (15 fonts, 5 categories), `FONT_CATEGORIES`, `wrapText()`, `measureWrappedText()`.
- `lib/utils/filters.ts` → 18 lignes, `FILTERS` V1 (9 filtres, `{id,label,css,ffmpeg}`). IDs V1 : normal, lumineux, chaud, froid, vintage, noir_blanc, doux, vif, sombre.
- `lib/utils/fontLoader.ts` → 30 lignes, `FONT_CATEGORIES` V1 (30 fonts, 6 categories : bold, elegant, modern, handwritten, display, minimal), `CATEGORY_LABELS`, `ALL_FONTS`, `loadFont()`.
- `lib/utils/drawOverlays.ts` → 35 lignes, dessine les overlays texte. Pas de wrapText — utilise `fillText` et `strokeText` une seule ligne.
- `components/features/editor/panels/FilterPanel.tsx` → 51 lignes, importe `FILTERS` depuis `lib/utils/filters`.
- `components/features/editor/VideoPreview.tsx` → importe `FILTERS` depuis `lib/utils/filters` (ligne 6).
- `lib/hooks/useVideoExport.ts` → 161 lignes, importe `FILTERS` depuis `lib/utils/filters` (ligne 10), importe `loadFont` depuis `lib/utils/fontLoader` (ligne 11).
- `lib/utils/ffmpegCommands.ts` → 82 lignes, importe `FILTERS` depuis `./filters` (ligne 1). Utilise `filterDef.ffmpeg` (ligne 22).
- `components/features/editor/text/FontSelector.tsx` → 32 lignes, importe `loadFont`, `FONT_CATEGORIES`, `CATEGORY_LABELS` depuis `lib/utils/fontLoader`.
- `lib/data/videoThemes.ts` → 173 lignes, importe depuis `designKnowledge.ts` (PALETTES, FILTERS_V2). Deja V2.

---

## Livrable 1 — Migrer filters.ts vers FILTERS_V2

**Fichier :** `lib/utils/filters.ts`

Remplacer tout le contenu par un re-export depuis designKnowledge :
```typescript
// Re-export V2 — source de verite unique dans designKnowledge.ts
export { FILTERS_V2 as FILTERS } from '@/lib/data/designKnowledge';
export type { FilterPreset as FilterDef } from '@/lib/data/designKnowledge';
```

Ceci maintient la retrocompatibilite : tous les imports `import { FILTERS } from '@/lib/utils/filters'` continuent de fonctionner sans modification.

**Impact sur les IDs de filtres :**
- IDs V1 (`lumineux`, `chaud`, `froid`, `noir_blanc`, `doux`, `vif`, `sombre`) n'existent plus en V2.
- IDs V2 (`warm`, `cool`, `high_contrast`, `soft`, `dramatic`, `pastel`, `bw`, `bw_warm`) les remplacent.
- Le store `filter: string` peut contenir un ancien ID V1 (items Firestore existants). Si le filtre n'est pas trouve dans FILTERS_V2, fallback sur `'normal'`.

**Fichier :** `components/features/editor/VideoPreview.tsx` (ligne ~37 dans le rendu, la ou `FILTERS.find` est utilise)

Ajouter un fallback :
```typescript
const filterCss = FILTERS.find(f => f.id === filter)?.css ?? 'none';
```
(Verifier que c'est deja le cas — sinon l'ajouter.)

**Fichier :** `lib/hooks/useVideoExport.ts` (ligne 37)

Le code actuel est :
```typescript
const filterCss = FILTERS.find(f => f.id === s.filter)?.css;
```

Ajouter le fallback `?? 'none'` :
```typescript
const filterCss = FILTERS.find(f => f.id === s.filter)?.css ?? 'none';
```

**Fichier :** `lib/utils/ffmpegCommands.ts` (ligne 21-22)

Le champ `ffmpeg` n'existe plus dans FilterPreset V2. Cette ligne :
```typescript
if (filterDef?.ffmpeg) vf.push(filterDef.ffmpeg);
```
doit etre supprimee ou rendue no-op. Comme P0.3 va retirer le pipeline FFmpeg complet, la correction minimale ici est :
```typescript
// ffmpeg field supprime en V2 — le filtre est applique cote Canvas
```

Remplacer la ligne 21-22 par :
```typescript
const filterDef = FILTERS.find(f => f.id === opts.filter);
// V2 filters n'ont plus de champ ffmpeg — appliquer via CSS sur Canvas uniquement
```

---

## Livrable 2 — Unifier fontLoader.ts vers designKnowledge

**Fichier :** `lib/utils/fontLoader.ts`

Remplacer le catalogue statique par les fonts de designKnowledge, tout en gardant la fonction `loadFont()` :

```typescript
import { FONTS, FONT_CATEGORIES as DK_CATEGORIES } from '@/lib/data/designKnowledge';

const loaded = new Set<string>();

/** Catalogue de fonts organise par categorie (depuis designKnowledge.ts) */
export const FONT_CATEGORIES: Record<string, readonly string[]> = Object.fromEntries(
  DK_CATEGORIES.map(cat => [
    cat.id,
    FONTS.filter(f => f.category === cat.id).map(f => f.family),
  ]),
);

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  DK_CATEGORIES.map(cat => [cat.id, cat.label]),
);

export const ALL_FONTS = FONTS.map(f => f.family);

/** Charge une Google Font a la demande via un <link> + FontFace API */
export async function loadFont(family: string): Promise<void> {
  if (loaded.has(family)) return;
  loaded.add(family);

  // Chercher le googleUrl dans designKnowledge, sinon fallback
  const fontDef = FONTS.find(f => f.family === family);
  const urlParam = fontDef?.googleUrl ?? `${encodeURIComponent(family)}:wght@400;700`;

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${urlParam}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const weight = fontDef?.weight ?? 700;
  await document.fonts.load(`${weight} 24px "${family}"`);
}
```

Ceci signifie que FontSelector.tsx et useVideoExport.ts gardent le meme import — aucun changement dans ces fichiers pour les fonts.

**Note :** Le catalogue passe de 30 fonts (6 categories) a 15 fonts (5 categories). Les categories V1 (`bold`, `handwritten`, `display`, `minimal`) sont renommees (`impact`, `cursive`, `fun`, `modern`). C'est voulu — designKnowledge.ts est la source de verite curatee.

---

## Livrable 3 — Integrer wrapText dans drawOverlays.ts

**Fichier :** `lib/utils/drawOverlays.ts`

Le code actuel dessine chaque overlay avec `fillText` sans retour a la ligne.
Integrer `wrapText` de designKnowledge pour que les textes longs s'affichent correctement :

```typescript
import type { TextOverlayItem } from '@/lib/types';
import { wrapText } from '@/lib/data/designKnowledge';

/**
 * Dessine les overlays texte sur un canvas pour l'export video.
 * Coordonnees en ratio 0-1, converties en pixels.
 * Echelle la taille de police par rapport a la largeur de preview (375px).
 */
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
    ctx.fillStyle = o.fill;
    if (o.shadowColor && o.shadowBlur) {
      ctx.shadowColor = o.shadowColor;
      ctx.shadowBlur = o.shadowBlur * scale;
    }
    const px = o.x * w;
    const py = o.y * h;
    const maxWidth = w - 120 * scale; // safe zone droite 120px a l'echelle

    if (o.strokeWidth && o.stroke) {
      ctx.strokeStyle = o.stroke;
      ctx.lineWidth = o.strokeWidth * scale;
      // Stroke pass — wrapText dessine avec fillText, on doit aussi stroke
      const lines = getLines(ctx, o.text, maxWidth);
      const lineH = fontSize * 1.2;
      for (let i = 0; i < lines.length; i++) {
        ctx.strokeText(lines[i], px, py + i * lineH);
      }
    }
    // Fill pass avec wrapText
    wrapText(ctx, o.text, px, py, maxWidth, fontSize * 1.2, 'center');
    ctx.restore();
  }
}

/** Utilitaire interne pour calculer les lignes (meme algo que wrapText) */
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

## Livrable 4 — Verifier la coherence FilterPanel

**Fichier :** `components/features/editor/panels/FilterPanel.tsx`

L'import actuel `import { FILTERS } from '@/lib/utils/filters'` fonctionnera automatiquement grace au re-export du Livrable 1.

Verifier que le composant fonctionne avec les nouveaux IDs (10 filtres V2 au lieu de 9 V1). Aucune modification de code n'est attendue — le `.map()` sur FILTERS itere deja sur le tableau dynamiquement.

---

## Contraintes
- NE PAS modifier les composants UI (sauf FilterPanel si necessaire pour la migration)
- NE PAS modifier drawSubtitles.ts (c'est P1.2)
- NE PAS modifier exportWebCodecs.ts
- NE PAS modifier les Cloud Functions
- NE PAS retirer le pipeline FFmpeg (c'est P0.3)
- NE PAS modifier le store Zustand (deja fait en P0.1)
- Retrocompatible : les items Firestore avec d'anciens IDs de filtre V1 fallback sur 'normal'
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `lib/utils/filters.ts` re-exporte `FILTERS_V2` depuis designKnowledge
- [ ] Tous les imports de `FILTERS` fonctionnent sans changement (re-export)
- [ ] Fallback `'normal'` si un ID filtre V1 n'est pas trouve dans V2
- [ ] `fontLoader.ts` utilise le catalogue de `designKnowledge.ts` (15 fonts, 5 categories)
- [ ] `loadFont()` utilise `googleUrl` de `FontDef` pour charger les fonts
- [ ] `drawOverlays.ts` utilise `wrapText` pour les textes longs
- [ ] `FilterPanel.tsx` affiche les 10 filtres V2
- [ ] `FontSelector.tsx` affiche les 5 categories V2 (impact, elegant, modern, cursive, fun)
- [ ] Les items anciens avec filtres V1 fonctionnent (fallback normal)
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/data/designKnowledge.ts`
- `lib/utils/filters.ts`
- `lib/utils/fontLoader.ts`
- `lib/utils/drawOverlays.ts`
- `lib/hooks/useVideoExport.ts`
- `lib/utils/ffmpegCommands.ts`
- `components/features/editor/panels/FilterPanel.tsx`
- `components/features/editor/VideoPreview.tsx`
- `components/features/editor/text/FontSelector.tsx`
