# FIX-4 — Captation camera, scrubber, filtres, transcription (revise)

## Contexte
Comparaison complete avec le hub faite. Differences critiques identifiees
dans la resolution camera, le rendu canvas, la generation de thumbnail,
et l'application des filtres.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/useMediaRecorder.ts` → camera resolution
- `subtitle-lab/components/CameraOverlay.tsx` → viewfinder layout
- `subtitle-lab/components/SubtitleCanvas.tsx` → canvas render, RAF loop, filtres, thumbnail
- `subtitle-lab/components/MiniScrubber.tsx` → scrubber drag
- `subtitle-lab/components/FilterPanel.tsx` → grille filtres
- `subtitle-lab/app/api/transcribe/route.ts` → AssemblyAI params
- `subtitle-lab/lib/store.ts` → thumbnailUrl, filterIntensity

**Fichiers de REFERENCE dans le hub (NE PAS modifier, juste lire) :**
- `lib/hooks/useMediaRecorder.ts` → resolution 1920x1080 paysage
- `components/features/editor/ImportModal.tsx` → viewfinder avec
  `aspectRatio: '9/16', height: '100%', maxHeight: '100dvh',
   maxWidth: 'calc(100dvh * 9 / 16)'` — c'est LE containment qui marche
- `components/features/editor/VideoPreview.tsx` → thumbnail generation
  a handleCanPlay avec delai 200ms, canvas avec devicePixelRatio

---

## Fix 1 — Camera : resolution + viewfinder containment (comme le hub)

**Fichier :** `subtitle-lab/lib/useMediaRecorder.ts`

Revenir a la resolution PAYSAGE du hub :
```typescript
video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
```

**Fichier :** `subtitle-lab/components/CameraOverlay.tsx`

Le viewfinder actuel est `absolute inset-0 w-full h-full object-cover`.
Le hub utilise un containment CSS specifique qui force le 9:16 :

```tsx
// Remplacer le conteneur du viewfinder par le pattern du hub :
<div className="flex-1 relative overflow-hidden">
  <div className="relative overflow-hidden mx-auto"
    style={{ aspectRatio: '9/16', height: '100%', maxHeight: '100dvh',
      maxWidth: 'calc(100dvh * 9 / 16)' }}>
    <video ref={viewfinderRef} autoPlay playsInline muted
      className="w-full h-full object-cover"
      style={{ transform: 'scaleX(-1)' }} />
    {/* Countdown overlay reste ici */}
  </div>
</div>
```

Le `maxWidth: calc(100dvh * 9/16)` empeche la video de depasser le ratio
9:16 meme sur des ecrans larges. Le `height: 100%` utilise toute la hauteur.

---

## Fix 2 — Thumbnail video pour les vignettes filtres

**Probleme :** Le store a un champ `thumbnailUrl` mais il n'est probablement
pas genere au bon moment. Le hub genere la thumbnail dans `handleCanPlay`
avec un delai de 200ms.

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Quand la video est prete (dans le useEffect loadedmetadata ou apres
initClipDuration), generer une thumbnail :
```typescript
// Apres que vid.readyState >= 2 (canplay) :
setTimeout(() => {
  try {
    const c = document.createElement('canvas');
    c.width = 90; c.height = 160;
    c.getContext('2d')!.drawImage(vid, 0, 0, 90, 160);
    const url = c.toDataURL('image/jpeg', 0.7);
    if (url !== 'data:,' && url.length > 100) {
      useSubtitleStore.getState().setThumbnailUrl(url);
    }
  } catch {}
}, 200); // delai comme le hub pour laisser la video se stabiliser
```

S'assurer que `setThumbnailUrl` existe dans le store et que `thumbnailUrl`
est bien lu par FilterPanel pour les vignettes.

---

## Fix 3 — Filtres : application via ctx.filter (pas CSS style)

**Probleme :** Le Lab applique les filtres via `style.filter` sur l'element
canvas CSS. Le hub applique les filtres via `ctx.filter` directement dans
le contexte 2D du canvas. L'approche `ctx.filter` est plus fiable car
elle s'applique AVANT le drawImage et les sous-titres ne sont pas filtres.

Avec `style.filter` sur le canvas, TOUT ce qui est dessine est filtre
(y compris les sous-titres). Avec `ctx.filter`, seul le drawImage de
la video est filtre, les sous-titres dessines apres sont normaux.

**Fix :** `subtitle-lab/components/SubtitleCanvas.tsx`

Appliquer le filtre via ctx.filter dans le RAF loop, pas via style.filter :
```typescript
// Dans le RAF loop, AVANT le drawImage :
const clipFId = ar?.clip.filterId ?? filterIdRef.current;
const f = FILTERS.find(x => x.id === clipFId);
const filterCss = f?.css !== 'none' ? f?.css : 'none';

// Appliquer l'intensite du filtre
if (filterCss !== 'none' && filterIntensityRef.current > 0) {
  ctx.filter = filterCss;
} else {
  ctx.filter = 'none';
}

// drawImage avec le filtre actif
ctx.drawImage(vid, c.sx, c.sy, c.sw, c.sh, 0, 0, CANVAS_W, CANVAS_H);

// RESET le filtre APRES le draw (les sous-titres ne doivent PAS etre filtres)
ctx.filter = 'none';
```

Retirer le `style={{ filter: cssFilter }}` du canvas element JSX.
Le filtre est maintenant applique dans le RAF loop via ctx.filter.

Ajouter `filterIntensityRef` aux refs synchronises :
```typescript
const filterIntensityRef = useRef(filterIntensity);
useEffect(() => { filterIntensityRef.current = filterIntensity; }, [filterIntensity]);
```

---

## Fix 4 — MiniScrubber drag plus fluide

**Fichier :** `subtitle-lab/components/MiniScrubber.tsx`

1. Zone de touch : `h-8` (32px) au lieu de `h-6` (24px)
2. Retirer `onPointerLeave` — le pointerCapture gere deja le drag
   quand le doigt sort
3. `setPointerCapture` sur `barRef.current` (pas e.currentTarget)
4. `e.preventDefault()` et `e.stopPropagation()` sur pointerDown et pointerMove

---

## Fix 5 — Filtres : taille des boutons + tap fiable

**Fichier :** `subtitle-lab/components/FilterPanel.tsx`

1. Augmenter les boutons : `w-14 h-20` (56x80px) au lieu de `w-12 h-16`
2. Le slider d'intensite doit utiliser `onInput` (pas `onChange`) pour
   une mise a jour continue pendant le drag
3. Le filtre actif doit avoir un feedback visuel plus fort
   (ring + scale legere)

---

## Fix 6 — Transcription : modele AssemblyAI `best`

**Fichier :** `subtitle-lab/app/api/transcribe/route.ts`

```typescript
body: JSON.stringify({
  audio_url: upload_url,
  language_code: 'fr',
  speech_model: 'best',   // Universal-2, plus precis pour le francais
  word_boost: ['acupuncture', 'meridien', 'qi', 'yin', 'yang', 'aiguille'],
  punctuate: true,
}),
```

---

## Contraintes
- La resolution camera DOIT etre 1920x1080 paysage (comme le hub)
- Les filtres sont appliques via ctx.filter (PAS via CSS style.filter)
- ctx.filter est reset a 'none' APRES drawImage (sous-titres non filtres)
- NE PAS modifier le renderer.ts
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] La camera demande 1920x1080 paysage (comme le hub)
- [ ] Le viewfinder utilise le containment 9:16 du hub (aspectRatio + maxWidth)
- [ ] La thumbnail video est generee et visible dans les vignettes des filtres
- [ ] Les filtres sont appliques via ctx.filter (pas CSS style.filter)
- [ ] Les sous-titres ne sont PAS affectes par les filtres
- [ ] Le slider d'intensite est fluide (onInput, pas onChange)
- [ ] Les boutons de filtre font 56x80px (plus faciles a taper)
- [ ] Le MiniScrubber drag est fluide (32px, pointerCapture sur barRef)
- [ ] La transcription utilise speech_model: 'best'
- [ ] `npm run build` passe
