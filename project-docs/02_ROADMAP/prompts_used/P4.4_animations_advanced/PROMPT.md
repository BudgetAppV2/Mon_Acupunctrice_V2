# P4.4 — Animations texte avancees (wave, glitch, rotate_in)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Apres P2.2, l'editeur a 5 animations texte de base (fade_in, typewriter, scale_pop,
slide_up, bounce). Ce prompt ajoute 3 animations avancees qui necessitent un rendering
lettre-par-lettre sur le Canvas : wave (ondulation), glitch (distortion numerique),
et rotate_in (rotation + fade).

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `lib/utils/drawOverlays.ts` → ~120 lignes post-P2.2. `drawTextOverlays` avec `applyAnimation` qui gere les 5 animations de base + `drawOverlayText` pour le stroke + fill. L'animation est calculee via `progress = Math.min(elapsed / animDuration, 1)` puis appliquee par type (fade_in, typewriter, scale_pop, slide_up, bounce).
- `lib/utils/easings.ts` → cree en P2.2. `easeOutCubic`, `easeOutBounce`, `easeOutElastic`, `linear`. On va ajouter des easings si necessaire.
- `lib/data/designKnowledge.ts` → ~340 lignes. `TEXT_ANIMATIONS` (ligne 242-249) : `['none', 'fade_in', 'typewriter', 'scale_pop', 'slide_up', 'bounce']`. On va ajouter 'wave', 'glitch', 'rotate_in'.
- `lib/types/editor.ts` → ~80 lignes post-P3.3. `TextAnimation = 'none' | 'fade_in' | 'typewriter' | 'scale_pop' | 'slide_up' | 'bounce'`. On va etendre.
- `lib/data/videoThemes.ts` → ~185 lignes post-P4.2. `VideoTheme.defaultAnimation: TextAnimationType`. Aucun theme n'utilise wave/glitch/rotate_in par defaut (glitch est dans la liste noire pour la niche sante).
- `components/features/editor/panels/TextEditView.tsx` → panneau d'edition d'un overlay texte. Selecteur d'animation avec boutons compacts.

---

## Livrable 1 — Etendre les types d'animation

**Fichier :** `lib/data/designKnowledge.ts`

Modifier `TEXT_ANIMATIONS` (ligne ~242) pour ajouter les 3 nouvelles animations :

```typescript
export const TEXT_ANIMATIONS = [
  'none',
  'fade_in',
  'typewriter',
  'scale_pop',
  'slide_up',
  'bounce',
  // Avancees (Phase 4)
  'wave',
  'glitch',
  'rotate_in',
] as const;

export type TextAnimationType = typeof TEXT_ANIMATIONS[number];
```

**Fichier :** `lib/types/editor.ts`

Aligner `TextAnimation` :

```typescript
export type TextAnimation =
  | 'none' | 'fade_in' | 'typewriter' | 'scale_pop' | 'slide_up' | 'bounce'
  | 'wave' | 'glitch' | 'rotate_in';
```

---

## Livrable 2 — Ajouter les easings necessaires

**Fichier :** `lib/utils/easings.ts`

Ajouter une fonction d'easing pour le rotate_in :

```typescript
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
```

---

## Livrable 3 — Implementer les 3 animations dans drawOverlays

**Fichier :** `lib/utils/drawOverlays.ts`

Ajouter les 3 cas dans la fonction `applyAnimation` (switch existant).

### wave — ondulation lettre par lettre

Chaque lettre ondule verticalement avec un decalage temporel progressif.
L'animation BOUCLE pendant toute la duree de l'overlay (pas seulement l'entree).

```typescript
case 'wave': {
  // L'ondulation est continue (pas juste l'entree)
  // progress sert seulement pour le fade-in initial
  const fadeIn = Math.min(progress * 4, 1); // Fade rapide 0.25x animDuration
  ctx.globalAlpha = fadeIn;

  const text = o.text;
  const fontSize = Math.round(o.fontSize * scale);
  ctx.font = `bold ${fontSize}px "${o.fontFamily}", sans-serif`;

  // Calculer la largeur totale pour centrer
  const totalWidth = ctx.measureText(text).width;
  let charX = px - totalWidth / 2;
  const baseY = py;

  // Temps absolu pour l'animation continue
  const elapsed = time - o.startTime;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charWidth = ctx.measureText(char).width;

    // Ondulation : sin(temps + index * phase)
    const waveOffset = Math.sin(elapsed * 4 + i * 0.5) * 8 * scale;

    // Dessiner chaque lettre avec son offset vertical
    if (o.strokeWidth && o.stroke) {
      ctx.strokeStyle = o.stroke;
      ctx.lineWidth = o.strokeWidth * scale;
      ctx.strokeText(char, charX + charWidth / 2, baseY + waveOffset);
    }
    ctx.fillStyle = o.fill;
    ctx.fillText(char, charX + charWidth / 2, baseY + waveOffset);

    charX += charWidth;
  }

  ctx.globalAlpha = 1;
  break;
}
```

### glitch — distortion numerique

Effet court (200-500ms) avec decalages horizontaux aleatoires, bandes de couleur,
et artifacts rectangulaires. Subtil pour la niche sante.

```typescript
case 'glitch': {
  if (progress >= 1) {
    // Animation terminee — afficher normalement
    drawOverlayText(ctx, o, px, py, maxWidth, lineH, scale);
    break;
  }

  // Seed deterministe pour le glitch (meme frame = meme glitch)
  const seed = Math.floor((time - o.startTime) * 30); // par frame
  const rng = (s: number) => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s / 0x7fffffff) - 0.5;
  };

  // Intensite decroissante (fort au debut, nul a la fin)
  const intensity = 1 - easeOutCubic(progress);

  // Layer 1 : texte principal legerement decale
  const offsetX = rng(seed) * 6 * scale * intensity;
  const offsetY = rng(seed + 1) * 3 * scale * intensity;
  drawOverlayText(ctx, o, px + offsetX, py + offsetY, maxWidth, lineH, scale);

  // Layer 2 : canal rouge decale
  ctx.globalAlpha = 0.3 * intensity;
  ctx.fillStyle = '#ff0000';
  const fontSize = Math.round(o.fontSize * scale);
  ctx.font = `bold ${fontSize}px "${o.fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  wrapText(ctx, o.text, px + rng(seed + 2) * 4 * scale, py, maxWidth, lineH, 'center');

  // Layer 3 : canal cyan decale dans l'autre direction
  ctx.fillStyle = '#00ffff';
  wrapText(ctx, o.text, px - rng(seed + 3) * 4 * scale, py, maxWidth, lineH, 'center');

  ctx.globalAlpha = 1;
  ctx.fillStyle = o.fill; // Restaurer

  // Artifact : petite bande horizontale aleatoire (50% de chance par frame)
  if (rng(seed + 4) > 0 && intensity > 0.3) {
    const bandY = py + rng(seed + 5) * 30 * scale;
    const bandH = (3 + Math.abs(rng(seed + 6)) * 5) * scale;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * intensity})`;
    ctx.fillRect(0, bandY, w, bandH);
  }

  break;
}
```

### rotate_in — rotation + fade

Le texte tourne de -90° a 0° avec un fade-in simultane.

```typescript
case 'rotate_in': {
  const rotation = (-90 + 90 * easeOutBack(progress)) * Math.PI / 180;
  ctx.globalAlpha = easeOutCubic(progress);

  // Calculer le centre du texte pour pivoter autour
  const textH = measureWrappedText(ctx, o.text, maxWidth, lineH);
  const centerX = px;
  const centerY = py + textH / 2;

  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.translate(-centerX, -centerY);

  drawOverlayText(ctx, o, px, py, maxWidth, lineH, scale);
  ctx.globalAlpha = 1;
  break;
}
```

**IMPORTANT :** Pour `wave` et `glitch`, le rendering est lettre-par-lettre.
Il faut configurer `ctx.textAlign = 'center'` au niveau de chaque lettre
(centree sur sa position) au lieu du wrapText global.

Pour `wave`, le texte ne supporte PAS le multi-ligne (wrapText). Si le texte
est long, seule la premiere ligne est animee en wave, les autres en fade_in.
Alternative : ne pas supporter le multi-ligne pour wave (texte court uniquement).

---

## Livrable 4 — Mettre a jour le selecteur d'animation

**Fichier :** `components/features/editor/panels/TextEditView.tsx`

Ajouter les 3 nouvelles animations au selecteur avec une separation visuelle :

```typescript
const ANIMATION_LABELS: Record<string, string> = {
  none: 'Aucune',
  fade_in: 'Fondu',
  typewriter: 'Machine',
  scale_pop: 'Pop',
  slide_up: 'Glisser',
  bounce: 'Rebond',
  // Avancees
  wave: 'Vague',
  glitch: 'Glitch',
  rotate_in: 'Rotation',
};

// Separer en 2 groupes dans l'UI
const BASIC_ANIMATIONS = ['none', 'fade_in', 'typewriter', 'scale_pop', 'slide_up', 'bounce'];
const ADVANCED_ANIMATIONS = ['wave', 'glitch', 'rotate_in'];
```

```tsx
{/* Animation — basiques */}
<div className="space-y-1">
  <label className="text-xs text-gray-500">Animation</label>
  <div className="flex gap-1 flex-wrap">
    {BASIC_ANIMATIONS.map(a => (
      <button
        key={a}
        onClick={() => updateOverlay(overlay.id, { animation: a as TextAnimation })}
        className={`px-2 py-1 rounded-full text-[10px] whitespace-nowrap ${
          overlay.animation === a ? 'bg-sage text-white' : 'bg-gray-800 text-gray-400'
        }`}
      >
        {ANIMATION_LABELS[a]}
      </button>
    ))}
  </div>
  {/* Avancees */}
  <div className="flex gap-1">
    <span className="text-[9px] text-gray-600 self-center mr-1">Pro</span>
    {ADVANCED_ANIMATIONS.map(a => (
      <button
        key={a}
        onClick={() => updateOverlay(overlay.id, { animation: a as TextAnimation })}
        className={`px-2 py-1 rounded-full text-[10px] whitespace-nowrap ${
          overlay.animation === a ? 'bg-sage text-white' : 'bg-gray-800 text-gray-400'
        }`}
      >
        {ANIMATION_LABELS[a]}
      </button>
    ))}
  </div>
  {overlay.animation !== 'none' && (
    <div>
      <label className="text-xs text-gray-500">
        Duree : {(overlay.animationDuration ?? 0.5).toFixed(1)}s
      </label>
      <input
        type="range" min={0.2} max={2.0} step={0.1}
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
- NE PAS installer de dependance externe (animations en pur Canvas 2D)
- NE PAS modifier exportWebCodecs.ts (les animations sont rendues dans drawOverlays qui est deja appele)
- NE PAS modifier drawSubtitles.ts, drawStickers.ts, drawTransition.ts
- NE PAS modifier les Cloud Functions ou les routes API
- NE PAS ajouter wave, glitch, ou rotate_in comme defaultAnimation dans aucun theme
  (wave est doux mais les themes existants sont deja configures; glitch est dans la
  liste noire pour la niche sante)
- Le glitch doit etre SUBTIL et COURT (duree recommandee 0.3-0.5s, intensity decroissante)
- Le wave est une animation CONTINUE (boucle pendant toute la duree de l'overlay,
  contrairement aux autres qui ne jouent que l'entree)
- Le rendering lettre-par-lettre du wave ne supporte que le texte sur 1 ligne
  (si multi-ligne, fallback sur fade_in)
- Le rotate_in utilise easeOutBack pour un leger overshoot naturel
- Le glitch utilise une seed deterministe (meme frame = meme rendu, pas de flickering aleatoire)
- Les animations avancees sont visibles dans la preview HQ (P1.6) et l'export
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `TextAnimation` type etendu avec 'wave', 'glitch', 'rotate_in'
- [ ] `TEXT_ANIMATIONS` dans designKnowledge etendu avec les 3 nouvelles animations
- [ ] `easeOutBack` ajoute dans easings.ts
- [ ] `wave` : chaque lettre ondule verticalement (sin(time + index * phase)), animation continue
- [ ] `glitch` : decalages horizontaux + bandes couleur RGB + artifacts, intensite decroissante
- [ ] `rotate_in` : rotation -90° → 0° + fade in avec easeOutBack
- [ ] Le glitch est subtil (pas de flash intense, pas de couleurs vives)
- [ ] Le wave gere le texte sur 1 ligne uniquement
- [ ] Selecteur d'animation dans TextEditView separe en "basiques" et "Pro"
- [ ] Les animations sont visibles dans la preview HQ et l'export
- [ ] Aucun theme n'utilise les animations avancees par defaut
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/drawOverlays.ts`
- `lib/utils/easings.ts`
- `lib/data/designKnowledge.ts`
- `lib/types/editor.ts`
- `lib/data/videoThemes.ts`
- `components/features/editor/panels/TextEditView.tsx`
- `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` (section A3 — Animations)
