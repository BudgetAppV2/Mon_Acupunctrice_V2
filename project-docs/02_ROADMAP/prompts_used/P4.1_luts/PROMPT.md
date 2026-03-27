# P4.1 — LUTs cinematiques

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Les filtres actuels sont des filtres CSS (brightness, contrast, saturate, sepia via
`ctx.filter`). Ils modifient les parametres globaux mais ne permettent pas de color
grading cinematique precis. Ce prompt ajoute le support des LUTs .cube —
des tables de correspondance couleur 3D qui transforment chaque pixel pour un
look cinematique professionnel.

Apres Phase 3, l'export tourne dans un Web Worker (P2.1), l'UI reste reactive.
Le surcout des LUTs (~50ms/frame) est acceptable car l'export est en arriere-plan.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Canvas 2D, WebCodecs.

## Fichiers a lire AVANT de commencer
- `lib/utils/exportWebCodecs.ts` → ~220 lignes post-P3.4. Pipeline export seek-based multi-clip. Pour chaque frame : `ctx.drawImage(video)` → filtre CSS → `drawTextOverlays` → `drawSubtitles` → `drawStickers`. La LUT s'insere APRES le filtre CSS et AVANT les overlays (appliquee sur l'image video, pas sur les textes).
- `lib/data/designKnowledge.ts` → ~340 lignes. `FILTERS_V2` (ligne 263-274) : 10 filtres CSS. `FilterPreset` interface (ligne 257-261).
- `lib/data/videoThemes.ts` → ~172 lignes. `VideoTheme` interface (lignes 14-36) : `filterId` pour le filtre CSS. Pas de champ LUT. On va ajouter `lutId`.
- `lib/store/useEditorStore.ts` → ~320 lignes post-P3.3. `filter: string` pour le filtre CSS actuel. Pas de champ LUT.
- `lib/utils/filters.ts` → 3 lignes. Re-exporte `FILTERS_V2` depuis designKnowledge.
- `components/features/editor/panels/FilterPanel.tsx` → panel filtres avec miniatures. Candidat pour le selecteur de LUT.
- `components/features/editor/VideoPreview.tsx` → ~185 lignes. Preview DOM avec filtre CSS. La preview HQ (P1.6) utilise Canvas — on devra aussi appliquer la LUT sur la frame HQ.

---

## Livrable 1 — Parser de fichiers .cube

**Fichier a creer :** `lib/utils/lutParser.ts`

Parse un fichier .cube (format standard 3D LUT) et retourne une table de lookup.

```typescript
export interface LUT3D {
  size: number;            // Taille du cube (typiquement 33 ou 64)
  data: Float32Array;      // size^3 * 3 valeurs RGB (0.0-1.0)
}

/**
 * Parse un fichier .cube en une LUT 3D utilisable pour le color grading.
 *
 * Format .cube :
 * - Lignes commencant par # = commentaires
 * - LUT_3D_SIZE N = taille du cube
 * - N^3 lignes de "R G B" (valeurs 0.0-1.0)
 */
export function parseCubeFile(text: string): LUT3D {
  const lines = text.split('\n');
  let size = 0;
  const values: number[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('TITLE')) continue;

    if (trimmed.startsWith('LUT_3D_SIZE')) {
      size = parseInt(trimmed.split(/\s+/)[1], 10);
      continue;
    }

    // Ignorer les lignes DOMAIN_MIN, DOMAIN_MAX
    if (trimmed.startsWith('DOMAIN_MIN') || trimmed.startsWith('DOMAIN_MAX')) continue;

    // Parser les triplets RGB
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      values.push(
        parseFloat(parts[0]),
        parseFloat(parts[1]),
        parseFloat(parts[2]),
      );
    }
  }

  if (size === 0) throw new Error('LUT_3D_SIZE non trouvee dans le fichier .cube');
  const expected = size * size * size * 3;
  if (values.length < expected) {
    throw new Error(`LUT incomplete: ${values.length / 3} triplets, attendu ${size * size * size}`);
  }

  return { size, data: new Float32Array(values) };
}
```

---

## Livrable 2 — Application de la LUT avec interpolation trilineaire

**Fichier :** `lib/utils/lutParser.ts` (continuer dans le meme fichier)

```typescript
/**
 * Applique une LUT 3D sur les pixels d'un Canvas via getImageData/putImageData.
 *
 * @param ctx - Canvas context
 * @param lut - LUT 3D parsee
 * @param intensity - Intensite du blending (0 = original, 1 = full LUT)
 * @param w - Largeur du canvas
 * @param h - Hauteur du canvas
 */
export function applyLUT(
  ctx: CanvasRenderingContext2D,
  lut: LUT3D,
  intensity: number,
  w: number, h: number,
) {
  if (intensity <= 0) return;
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const { size, data } = lut;
  const sizeM1 = size - 1;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255;
    const g = d[i + 1] / 255;
    const b = d[i + 2] / 255;

    // Index dans le cube LUT
    const ri = r * sizeM1;
    const gi = g * sizeM1;
    const bi = b * sizeM1;

    // Coordonnees de la cellule
    const r0 = Math.floor(ri), r1 = Math.min(r0 + 1, sizeM1);
    const g0 = Math.floor(gi), g1 = Math.min(g0 + 1, sizeM1);
    const b0 = Math.floor(bi), b1 = Math.min(b0 + 1, sizeM1);

    // Fractions pour l'interpolation
    const rf = ri - r0;
    const gf = gi - g0;
    const bf = bi - b0;

    // Interpolation trilineaire
    // Lookup dans la table : index = (b * size * size + g * size + r) * 3
    const idx = (bv: number, gv: number, rv: number) => (bv * size * size + gv * size + rv) * 3;

    const c000 = idx(b0, g0, r0); const c100 = idx(b0, g0, r1);
    const c010 = idx(b0, g1, r0); const c110 = idx(b0, g1, r1);
    const c001 = idx(b1, g0, r0); const c101 = idx(b1, g0, r1);
    const c011 = idx(b1, g1, r0); const c111 = idx(b1, g1, r1);

    // Interpoler pour chaque canal (R, G, B)
    for (let ch = 0; ch < 3; ch++) {
      const v000 = data[c000 + ch], v100 = data[c100 + ch];
      const v010 = data[c010 + ch], v110 = data[c110 + ch];
      const v001 = data[c001 + ch], v101 = data[c101 + ch];
      const v011 = data[c011 + ch], v111 = data[c111 + ch];

      const v00 = v000 + (v100 - v000) * rf;
      const v01 = v001 + (v101 - v001) * rf;
      const v10 = v010 + (v110 - v010) * rf;
      const v11 = v011 + (v111 - v011) * rf;

      const v0 = v00 + (v10 - v00) * gf;
      const v1 = v01 + (v11 - v01) * gf;

      const lutValue = v0 + (v1 - v0) * bf;

      // Blending avec l'original selon l'intensite
      const original = d[i + ch] / 255;
      d[i + ch] = Math.round((original + (lutValue - original) * intensity) * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
```

---

## Livrable 3 — Catalogue de LUTs + fichiers .cube

**Fichier a creer :** `lib/data/lutCatalog.ts`

```typescript
export interface LutDef {
  id: string;
  name: string;
  description: string;
  /** Chemin vers le fichier .cube dans public/ */
  cubeUrl: string;
}

export const LUTS: LutDef[] = [
  {
    id: 'warm_glow',
    name: 'Warm Glow',
    description: 'Tons chauds dores — sante et bien-etre',
    cubeUrl: '/luts/warm_glow.cube',
  },
  {
    id: 'teal_orange',
    name: 'Teal & Orange',
    description: 'Cinematique Hollywood classique',
    cubeUrl: '/luts/teal_orange.cube',
  },
  {
    id: 'soft_pastel',
    name: 'Soft Pastel',
    description: 'Doux et aerien — Instagram mood',
    cubeUrl: '/luts/soft_pastel.cube',
  },
  {
    id: 'clean_bright',
    name: 'Clean Bright',
    description: 'Propre et lumineux — tutoriel',
    cubeUrl: '/luts/clean_bright.cube',
  },
  {
    id: 'vintage_film',
    name: 'Vintage Film',
    description: 'Couleurs desaturees retro — storytelling',
    cubeUrl: '/luts/vintage_film.cube',
  },
];
```

**Fichiers .cube a creer :** `public/luts/*.cube`

Generer 5 fichiers .cube 17x17x17 (taille reduite pour la performance — 17^3 = 4913
triplets, ~60KB par fichier au lieu de 33^3 = 35937 triplets pour un .cube standard).

Chaque LUT est une transformation de couleur :

**warm_glow.cube :** Augmenter le rouge et vert (chaud), baisser le bleu legerement.
Formule : `R' = R * 1.05 + 0.02`, `G' = G * 1.02`, `B' = B * 0.92`

**teal_orange.cube :** Pousser les ombres vers le teal (bleu-vert), les highlights
vers l'orange. Formule basee sur la luminance : shadows → hue shift +180°, highlights → hue shift +30°

**soft_pastel.cube :** Desaturer legerement + augmenter la luminosite + ton rose subtil.
Formule : saturation * 0.7, brightness + 0.05, R + 0.03

**clean_bright.cube :** Augmenter le contraste + luminosite + saturation legere.
Formule : contrast 1.15, brightness + 0.05, saturation * 1.1

**vintage_film.cube :** Desaturer fortement + sepia + baisser les noirs.
Formule : saturation * 0.5, sepia 20%, blacks lifted to 0.05

**IMPORTANT :** Generer les fichiers .cube programmatiquement via un script Node.js
(`scripts/generateLuts.ts`) plutot que de les ecrire a la main. Le script produit
les 5 fichiers dans `public/luts/`.

```typescript
// scripts/generateLuts.ts (a executer une fois avec ts-node ou tsx)
function generateCube(
  size: number,
  transform: (r: number, g: number, b: number) => [number, number, number],
): string {
  let output = `# Generated LUT\nLUT_3D_SIZE ${size}\n`;
  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const ri = r / (size - 1);
        const gi = g / (size - 1);
        const bi = b / (size - 1);
        const [ro, go, bo] = transform(ri, gi, bi);
        output += `${clamp(ro).toFixed(6)} ${clamp(go).toFixed(6)} ${clamp(bo).toFixed(6)}\n`;
      }
    }
  }
  return output;
}

function clamp(v: number): number { return Math.max(0, Math.min(1, v)); }
```

---

## Livrable 4 — Integrer les LUTs dans le store et l'export

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter les champs LUT :

```typescript
// Interface EditorState — ajouter :
lutId: string | null;          // ID de la LUT active (null = pas de LUT)
lutIntensity: number;           // Intensite 0-1 (defaut 0.7)

// Actions
setLut: (id: string | null) => void;
setLutIntensity: (intensity: number) => void;

// Etat initial
lutId: null,
lutIntensity: 0.7,

// Implementation (trackees par undo/redo)
setLut: (id) => {
  // pushSnapshot()
  set({ lutId: id });
},
setLutIntensity: (intensity) => {
  set({ lutIntensity: intensity });
},
```

Ajouter `lutId` et `lutIntensity` au reset() et aux champs undo (UNDOABLE_KEYS).

**Fichier :** `lib/data/videoThemes.ts`

Ajouter un champ optionnel `lutId` a `VideoTheme` :

```typescript
export interface VideoTheme {
  // ... champs existants ...
  /** LUT cinematique par defaut (optionnel) */
  lutId?: string;
}
```

Ajouter des LUTs par defaut aux themes qui en beneficient :
- `sage_zen` → `warm_glow`
- `terre_warm` → `warm_glow`
- `dark_clinic` → `teal_orange`
- `pantone_2026` → `soft_pastel`
- Les autres → pas de LUT par defaut

**Fichier :** `lib/utils/exportWebCodecs.ts`

Ajouter le parametre LUT a la signature et l'appliquer dans la boucle d'export.

```typescript
// Nouveau parametre
lutData?: LUT3D | null,
lutIntensity?: number,

// Dans la boucle de rendering, APRES ctx.drawImage + filtre CSS et AVANT overlays :
if (lutData && lutIntensity && lutIntensity > 0) {
  applyLUT(ctx, lutData, lutIntensity, W, H);
}
```

**Fichier :** `lib/hooks/useVideoExport.ts`

Charger et parser la LUT pendant la phase "preparing" :

```typescript
import { parseCubeFile, type LUT3D } from '@/lib/utils/lutParser';
import { LUTS } from '@/lib/data/lutCatalog';

// Dans exportVideo, pendant 'preparing' :
let lutData: LUT3D | null = null;
if (s.lutId) {
  const lutDef = LUTS.find(l => l.id === s.lutId);
  if (lutDef) {
    try {
      const resp = await fetch(lutDef.cubeUrl);
      const text = await resp.text();
      lutData = parseCubeFile(text);
    } catch { /* LUT non chargee — export sans LUT */ }
  }
}

// Passer a exportWithWebCodecs
const blob = await exportWithWebCodecs(
  ..., lutData, s.lutIntensity,
);
```

---

## Livrable 5 — UI : selecteur de LUT dans FilterPanel

**Fichier :** `components/features/editor/panels/FilterPanel.tsx`

Ajouter une section "Color Grading" apres la grille de filtres CSS.

```typescript
import { LUTS } from '@/lib/data/lutCatalog';

// Dans le JSX, apres la grille de filtres CSS :
<div className="mt-3 space-y-1.5">
  <span className="text-xs text-gray-500">Color Grading</span>
  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
    {/* Bouton "Aucun" */}
    <button
      onClick={() => setLut(null)}
      className={`shrink-0 w-16 rounded-lg overflow-hidden border-2 ${
        !lutId ? 'border-sage' : 'border-transparent'
      }`}
    >
      <div className="h-10 bg-gray-800 flex items-center justify-center">
        <span className="text-[9px] text-gray-500">Aucun</span>
      </div>
    </button>
    {LUTS.map(lut => (
      <button
        key={lut.id}
        onClick={() => setLut(lut.id)}
        className={`shrink-0 w-16 rounded-lg overflow-hidden border-2 ${
          lutId === lut.id ? 'border-sage' : 'border-transparent'
        }`}
      >
        {/* Miniature avec gradient representant le look de la LUT */}
        <div
          className="h-10"
          style={{ background: getLutPreviewGradient(lut.id) }}
        />
        <span className="text-[9px] text-gray-300 block text-center py-0.5 truncate px-0.5">
          {lut.name}
        </span>
      </button>
    ))}
  </div>
  {lutId && (
    <div>
      <label className="text-xs text-gray-500">
        Intensite : {Math.round(lutIntensity * 100)}%
      </label>
      <input
        type="range" min={0} max={1} step={0.05}
        value={lutIntensity}
        onChange={e => setLutIntensity(+e.target.value)}
        className="w-full accent-sage"
      />
    </div>
  )}
</div>
```

Fonction helper pour les gradients de preview :

```typescript
function getLutPreviewGradient(lutId: string): string {
  switch (lutId) {
    case 'warm_glow': return 'linear-gradient(135deg, #e8a87c, #d4a574)';
    case 'teal_orange': return 'linear-gradient(135deg, #1a6b6a, #e07b39)';
    case 'soft_pastel': return 'linear-gradient(135deg, #f5c6d0, #c8b6e2)';
    case 'clean_bright': return 'linear-gradient(135deg, #ffffff, #e8f0fe)';
    case 'vintage_film': return 'linear-gradient(135deg, #bea77a, #7a7a6a)';
    default: return 'linear-gradient(135deg, #333, #666)';
  }
}
```

---

## Contraintes
- NE PAS installer de dependance externe pour le parsing .cube (parser en pur TypeScript)
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, ou drawStickers.ts
- NE PAS modifier les Cloud Functions ou les routes API
- La LUT est appliquee APRES le filtre CSS et AVANT les overlays (sur l'image video uniquement)
- Les textes, sous-titres et stickers NE SONT PAS affectes par la LUT
- Utiliser des LUTs de taille 17 (17^3 = 4913 triplets) pour la performance
- L'interpolation trilineaire est OBLIGATOIRE (pas de nearest-neighbor)
- Le slider d'intensite permet un blending doux (0% = original, 100% = full LUT)
- Les fichiers .cube sont generes par un script, pas ecrits a la main
- Le preview HQ (P1.6) doit aussi montrer la LUT (appliquer sur la frame Canvas pausee)
- `setLut` et `setLutIntensity` sont trackes par l'undo/redo
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `lutParser.ts` parse les fichiers .cube et retourne une `LUT3D`
- [ ] `applyLUT` applique la LUT avec interpolation trilineaire et blending d'intensite
- [ ] `lutCatalog.ts` catalogue 5 LUTs avec nom, description, chemin
- [ ] 5 fichiers .cube dans `public/luts/` (generes par script)
- [ ] `scripts/generateLuts.ts` genere les 5 fichiers .cube programmatiquement
- [ ] `lutId` et `lutIntensity` dans le store avec actions trackees par undo/redo
- [ ] `VideoTheme` a un champ optionnel `lutId`
- [ ] Themes sage_zen, terre_warm, dark_clinic, pantone_2026 ont une LUT par defaut
- [ ] L'export applique la LUT sur chaque frame (apres filtre CSS, avant overlays)
- [ ] La LUT est chargee et parsee pendant la phase "preparing"
- [ ] Section "Color Grading" dans FilterPanel avec selecteur horizontal
- [ ] Slider d'intensite (0-100%) visible quand une LUT est selectionnee
- [ ] Preview HQ montre la LUT sur la frame pausee
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/exportWebCodecs.ts`
- `lib/data/designKnowledge.ts`
- `lib/data/videoThemes.ts`
- `lib/store/useEditorStore.ts`
- `lib/hooks/useVideoExport.ts`
- `components/features/editor/panels/FilterPanel.tsx`
- `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` (section B1 — LUTs)
