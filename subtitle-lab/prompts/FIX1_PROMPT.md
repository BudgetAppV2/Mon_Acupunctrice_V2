# FIX-1 — Corrections post-Phase A

## Contexte
Phase A complete, testee sur iPhone. 3 corrections necessaires avant Phase B.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/store.ts` → tracks[] init avec TEST_BLOCKS
- `subtitle-lab/lib/testData.ts` → donnees de test hardcodees
- `subtitle-lab/lib/playback.ts` → CANVAS_W=540, CANVAS_H=960
- `subtitle-lab/components/SubtitleCanvas.tsx` → canvas render + layout
- `subtitle-lab/app/page.tsx` → layout mobile (flex, padding)
- `subtitle-lab/lib/useMediaRecorder.ts` → enregistrement camera

---

## Fix 1 — Retirer les sous-titres hardcodes

**Probleme :** Le store initialise la track sous-titres avec TEST_BLOCKS.
Quand l'utilisateur importe une video, les sous-titres de test apparaissent
sur le preview — c'est confus car ils ne correspondent pas a la video.

**Fichier :** `subtitle-lab/lib/store.ts`

Changer l'initialisation de la track sous-titres :
```typescript
// AVANT :
{ id: 'sub', type: 'subtitle', label: 'Sous-titres', muted: false,
  subtitles: { blocks: TEST_BLOCKS, globalPreset: { ... } } },

// APRES :
{ id: 'sub', type: 'subtitle', label: 'Sous-titres', muted: false,
  subtitles: { blocks: [], globalPreset: { ...DEFAULT_PRESET, position: { x: 0.5, y: 0.25 } } } },
```

Aussi changer le champ flat `blocks` initial :
```typescript
// AVANT :
blocks: TEST_BLOCKS,
// APRES :
blocks: [],
```

Et la duration initiale :
```typescript
// AVANT :
duration: TOTAL_DURATION_MS,
// APRES :
duration: 0,
```

Retirer l'import de TEST_BLOCKS et TOTAL_DURATION_MS du store.
Le fichier `testData.ts` peut rester pour reference mais n'est plus importe.

---

## Fix 2 — Canvas plein ecran 9:16 sur mobile

**Probleme :** Le canvas preview est dans un conteneur avec `px-3` (padding)
et `items-center justify-center`. Sur iPhone, le canvas ne prend pas toute
la largeur — il y a des marges sur les cotes. Pour un editeur video,
le preview doit utiliser le maximum de surface disponible en 9:16.

**Fichier :** `subtitle-lab/app/page.tsx`

Modifier le conteneur du canvas :
```tsx
// AVANT :
<div className="flex-1 flex items-center justify-center px-3 lg:px-4">
  <SubtitleCanvas />
</div>

// APRES :
<div className="flex-1 flex items-center justify-center px-0 lg:px-4">
  <SubtitleCanvas />
</div>
```

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Le canvas doit remplir la largeur et maintenir le ratio 9:16 :
```tsx
// AVANT :
<canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
  className="rounded-xl shadow-2xl w-full h-auto"
  style={{ maxWidth: '100%', ... }}

// APRES :
<canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
  className="w-full h-auto"
  style={{ maxWidth: '100%', aspectRatio: '9/16', objectFit: 'contain', ... }}
```

Retirer `rounded-xl shadow-2xl` — c'est un editeur, pas une carte.
Le canvas doit etre le plus grand possible sans depasser la zone disponible.

Le conteneur parent doit aussi contraindre la hauteur pour que le canvas
ne pousse pas le MiniScrubber et la toolbar hors ecran :
```tsx
<div className="flex-1 flex items-center justify-center px-0 lg:px-4 min-h-0 overflow-hidden">
  <SubtitleCanvas />
</div>
```

---

## Fix 3 — Resolution camera 9:16

**Probleme :** Quand on enregistre avec la camera, la video resultante
doit etre en 9:16 (portrait). Si le iPhone capture en 16:9 (paysage),
le canvas fait un crop, mais on perd de la resolution verticale.

**Fichier :** `subtitle-lab/lib/useMediaRecorder.ts`

S'assurer que la camera est demandee en portrait :
```typescript
const s = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'user',
    width: { ideal: 1080 },   // 9
    height: { ideal: 1920 },  // 16 → portrait
  },
  audio: true,
});
```

Note : iOS Safari ne respecte pas toujours width/height pour la camera
frontale. Le crop cover-fit dans le canvas s'en occupe, mais on demande
quand meme la bonne resolution.

---

## Contraintes
- NE PAS modifier le renderer.ts ou les animations de sous-titres
- NE PAS modifier TracksPanel, TrackBlock, AudioSheet, CameraOverlay
- Le canvas interne reste 540x960 (c'est le buffer de rendu)
- Le CSS fait le scaling pour remplir l'ecran
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Aucun sous-titre de test visible quand on importe une video
- [ ] Le canvas utilise toute la largeur sur mobile (pas de marges laterales)
- [ ] Le ratio 9:16 est maintenu (pas de distortion)
- [ ] La camera demande la resolution portrait (1080x1920)
- [ ] Le MiniScrubber et la toolbar restent visibles (le canvas ne les pousse pas)
- [ ] `npm run build` passe
