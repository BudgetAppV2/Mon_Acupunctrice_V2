# P4.2 — Grain film + vignette + light leaks

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Apres P4.1, l'editeur supporte les LUTs cinematiques. Pour un look film complet,
il manque les effets de texture : grain (bruit pellicule), vignette (assombrissement
des bords), et light leaks (fuites de lumiere). Ces 3 effets sont rendus en Canvas 2D
pur, tres rapides (~7ms/frame au total), et s'ajoutent apres la LUT dans le pipeline.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `lib/utils/exportWebCodecs.ts` → ~240 lignes post-P4.1. Pipeline export : filtre CSS → LUT → overlays → sous-titres → stickers. Les effets grain/vignette s'inserent APRES la LUT et AVANT les overlays texte.
- `lib/store/useEditorStore.ts` → ~340 lignes post-P4.1. `lutId`, `lutIntensity`. Pas de champs grain/vignette.
- `lib/data/videoThemes.ts` → ~180 lignes post-P4.1. `VideoTheme` avec `lutId?`. Pas de champs grain/vignette par defaut.
- `components/features/editor/panels/FilterPanel.tsx` → panel filtres avec filtres CSS + LUTs. Candidat pour les toggles grain/vignette.
- `lib/utils/drawOverlays.ts` → ~100 lignes. Les overlays texte sont dessines APRES les effets cinematiques (pas affectes).
- `lib/data/designKnowledge.ts` → ~340 lignes. Knowledge base.

---

## Livrable 1 — Fonctions de rendu grain, vignette, light leaks

**Fichier a creer :** `lib/utils/cinematicEffects.ts`

```typescript
/**
 * Effets cinematiques Canvas 2D : grain film, vignette, light leaks.
 * Tous les effets sont appliques directement sur le canvas context.
 */

/**
 * Grain film — bruit aleatoire overlay.
 * ~5ms par frame sur 1080x1920.
 *
 * @param ctx - Canvas context
 * @param amount - Intensite du grain (0 = rien, 0.2 = fort). Recommande : 0.04-0.08
 * @param frameIndex - Index de frame pour varier le grain a chaque frame
 * @param w - Largeur
 * @param h - Hauteur
 */
export function drawGrain(
  ctx: CanvasRenderingContext2D,
  amount: number,
  frameIndex: number,
  w: number, h: number,
) {
  if (amount <= 0) return;

  // Grain en resolution reduite (1/4) pour la performance
  const scale = 4;
  const gw = Math.ceil(w / scale);
  const gh = Math.ceil(h / scale);

  const grainCanvas = new OffscreenCanvas(gw, gh);
  const gctx = grainCanvas.getContext('2d')!;
  const imageData = gctx.createImageData(gw, gh);
  const d = imageData.data;

  // Seed pseudo-aleatoire base sur le frameIndex pour reproductibilite
  let seed = frameIndex * 12345 + 67890;
  const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

  for (let i = 0; i < d.length; i += 4) {
    const v = (rng() - 0.5) * 255 * amount;
    d[i] = 128 + v;      // R
    d[i + 1] = 128 + v;  // G
    d[i + 2] = 128 + v;  // B
    d[i + 3] = 40;        // Alpha semi-transparent
  }
  gctx.putImageData(imageData, 0, 0);

  // Overlay sur le canvas principal
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCanvas, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/**
 * Vignette — assombrissement des bords.
 * ~2ms par frame.
 *
 * @param ctx - Canvas context
 * @param intensity - Force de l'assombrissement (0 = rien, 0.5 = fort). Recommande : 0.2-0.35
 * @param radius - Rayon du cercle clair (0.5 = petit, 1.0 = large). Recommande : 0.6-0.8
 * @param w - Largeur
 * @param h - Hauteur
 */
export function drawVignette(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  radius: number,
  w: number, h: number,
) {
  if (intensity <= 0) return;

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.max(cx, cy);
  const innerR = maxR * radius;

  const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, maxR);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Light leaks — fuites de lumiere semi-transparentes.
 * Effet subtil qui varie lentement avec le temps.
 * ~2ms par frame.
 *
 * @param ctx - Canvas context
 * @param intensity - Opacite (0 = rien, 0.3 = visible). Recommande : 0.08-0.15
 * @param time - Temps de la video (secondes) pour animer la position
 * @param w - Largeur
 * @param h - Hauteur
 */
export function drawLightLeak(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  time: number,
  w: number, h: number,
) {
  if (intensity <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Tache 1 : coin superieur droit, bouge lentement
  const x1 = w * (0.7 + Math.sin(time * 0.3) * 0.15);
  const y1 = h * (0.15 + Math.cos(time * 0.2) * 0.1);
  const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, w * 0.35);
  grad1.addColorStop(0, `rgba(255, 200, 120, ${intensity})`);
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, w, h);

  // Tache 2 : coin inferieur gauche, plus subtile
  const x2 = w * (0.2 + Math.cos(time * 0.25) * 0.1);
  const y2 = h * (0.8 + Math.sin(time * 0.35) * 0.08);
  const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, w * 0.25);
  grad2.addColorStop(0, `rgba(255, 160, 100, ${intensity * 0.6})`);
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
```

---

## Livrable 2 — Integrer dans le store

**Fichier :** `lib/store/useEditorStore.ts`

```typescript
// Interface EditorState — ajouter :
grainAmount: number;        // 0-0.2, defaut 0
vignetteIntensity: number;  // 0-0.5, defaut 0
vignetteRadius: number;     // 0.5-1.0, defaut 0.7
lightLeakIntensity: number; // 0-0.3, defaut 0

// Actions
setGrain: (amount: number) => void;
setVignette: (intensity: number, radius: number) => void;
setLightLeak: (intensity: number) => void;

// Etat initial
grainAmount: 0,
vignetteIntensity: 0,
vignetteRadius: 0.7,
lightLeakIntensity: 0,

// Implementation (trackees par undo/redo)
setGrain: (amount) => {
  // pushSnapshot()
  set({ grainAmount: amount });
},
setVignette: (intensity, radius) => {
  // pushSnapshot()
  set({ vignetteIntensity: intensity, vignetteRadius: radius });
},
setLightLeak: (intensity) => {
  // pushSnapshot()
  set({ lightLeakIntensity: intensity });
},
```

Ajouter `grainAmount`, `vignetteIntensity`, `vignetteRadius`, `lightLeakIntensity`
au reset() et aux champs undo (UNDOABLE_KEYS).

**Fichier :** `lib/data/videoThemes.ts`

Ajouter des champs optionnels aux themes :

```typescript
export interface VideoTheme {
  // ... champs existants ...
  /** Grain film par defaut (0 = desactive) */
  grainAmount?: number;
  /** Vignette par defaut (0 = desactive) */
  vignetteIntensity?: number;
}
```

Valeurs par defaut pour certains themes :
- `sage_zen` → grain 0.04, vignette 0.2
- `terre_warm` → grain 0.06, vignette 0.25
- `dark_clinic` → grain 0.03, vignette 0.3
- `raw_authentic` → grain 0.08 (look brut)
- Les autres → 0 (desactive)

---

## Livrable 3 — Integrer dans l'export

**Fichier :** `lib/utils/exportWebCodecs.ts`

Ajouter les parametres et appeler les fonctions dans la boucle de rendering.

```typescript
import { drawGrain, drawVignette, drawLightLeak } from './cinematicEffects';

// Nouveaux parametres dans la signature
grainAmount?: number,
vignetteIntensity?: number,
vignetteRadius?: number,
lightLeakIntensity?: number,

// Dans la boucle, APRES la LUT et AVANT les overlays :
// Ordre : video → filtre CSS → LUT → grain → vignette → light leak → overlays → subtitles → stickers
if (grainAmount && grainAmount > 0) {
  drawGrain(ctx, grainAmount, globalFrameIndex, W, H);
}
if (vignetteIntensity && vignetteIntensity > 0) {
  drawVignette(ctx, vignetteIntensity, vignetteRadius ?? 0.7, W, H);
}
if (lightLeakIntensity && lightLeakIntensity > 0) {
  drawLightLeak(ctx, lightLeakIntensity, exportTime, W, H);
}
```

**Fichier :** `lib/hooks/useVideoExport.ts`

Passer les valeurs du store a `exportWithWebCodecs` :

```typescript
const blob = await exportWithWebCodecs(
  ...,
  s.grainAmount, s.vignetteIntensity, s.vignetteRadius, s.lightLeakIntensity,
);
```

---

## Livrable 4 — UI : section "Effets cinematiques" dans FilterPanel

**Fichier :** `components/features/editor/panels/FilterPanel.tsx`

Ajouter une section apres "Color Grading" (LUTs) :

```tsx
<div className="mt-3 space-y-2">
  <span className="text-xs text-gray-500">Effets cinematiques</span>

  {/* Grain */}
  <div>
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-400">Grain film</label>
      <span className="text-[10px] text-gray-600">
        {grainAmount > 0 ? `${Math.round(grainAmount * 100)}%` : 'Off'}
      </span>
    </div>
    <input
      type="range" min={0} max={0.15} step={0.01}
      value={grainAmount}
      onChange={e => setGrain(+e.target.value)}
      className="w-full accent-sage"
    />
  </div>

  {/* Vignette */}
  <div>
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-400">Vignette</label>
      <span className="text-[10px] text-gray-600">
        {vignetteIntensity > 0 ? `${Math.round(vignetteIntensity * 100)}%` : 'Off'}
      </span>
    </div>
    <input
      type="range" min={0} max={0.5} step={0.05}
      value={vignetteIntensity}
      onChange={e => setVignette(+e.target.value, vignetteRadius)}
      className="w-full accent-sage"
    />
  </div>

  {/* Light leaks */}
  <div>
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-400">Light leaks</label>
      <span className="text-[10px] text-gray-600">
        {lightLeakIntensity > 0 ? `${Math.round(lightLeakIntensity * 100)}%` : 'Off'}
      </span>
    </div>
    <input
      type="range" min={0} max={0.2} step={0.01}
      value={lightLeakIntensity}
      onChange={e => setLightLeak(+e.target.value)}
      className="w-full accent-sage"
    />
  </div>
</div>
```

---

## Contraintes
- NE PAS installer de dependance externe (tout en Canvas 2D pur)
- NE PAS modifier drawOverlays.ts, drawSubtitles.ts, drawStickers.ts, ou drawTransition.ts
- NE PAS modifier les Cloud Functions ou les routes API
- Ordre dans le pipeline : video → filtre CSS → LUT → grain → vignette → light leaks → overlays → sous-titres → stickers
- Les textes et stickers ne sont PAS affectes par les effets cinematiques
- Le grain doit etre DIFFERENT a chaque frame (seed basee sur frameIndex)
- Le grain en resolution reduite (1/4) pour la performance (~5ms vs ~20ms en full res)
- La vignette est statique (pas d'animation)
- Les light leaks bougent lentement avec le temps (sin/cos)
- Le preview HQ (P1.6) doit aussi montrer les effets cinematiques
- `setGrain`, `setVignette`, `setLightLeak` sont trackes par l'undo/redo
- `setActiveTheme` doit appliquer les valeurs grain/vignette du theme
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `cinematicEffects.ts` avec `drawGrain`, `drawVignette`, `drawLightLeak`
- [ ] Le grain est genere en resolution reduite (1/4) et upscale
- [ ] Le grain est different a chaque frame (seed deterministe)
- [ ] La vignette utilise un radialGradient du centre vers les bords
- [ ] Les light leaks sont des taches semi-transparentes qui bougent lentement
- [ ] `grainAmount`, `vignetteIntensity`, `vignetteRadius`, `lightLeakIntensity` dans le store
- [ ] `VideoTheme` a des champs optionnels `grainAmount` et `vignetteIntensity`
- [ ] Certains themes (sage_zen, terre_warm, dark_clinic, raw_authentic) ont des valeurs par defaut
- [ ] Les effets sont appliques dans l'export (apres LUT, avant overlays)
- [ ] Section "Effets cinematiques" dans FilterPanel avec 3 sliders
- [ ] Les effets sont visibles dans la preview HQ (frame pausee)
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/exportWebCodecs.ts`
- `lib/store/useEditorStore.ts`
- `lib/data/videoThemes.ts`
- `components/features/editor/panels/FilterPanel.tsx`
- `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` (section B2 — Grain, vignette)
