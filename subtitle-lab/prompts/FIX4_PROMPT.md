# FIX-4 — Bugs captation, scrubber, filtres, transcription

## Contexte
Testing iPhone continu. Bugs restants : resolution captation, scrubber
pas fluide, filtres difficiles a taper, transcription francais.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/useMediaRecorder.ts` → camera resolution
- `subtitle-lab/components/MiniScrubber.tsx` → scrubber drag
- `subtitle-lab/components/FilterPanel.tsx` → grille filtres, selection
- `subtitle-lab/app/api/transcribe/route.ts` → AssemblyAI params
- `lib/hooks/useMediaRecorder.ts` (hub) → reference resolution camera
- `subtitle-lab/components/SubtitleCanvas.tsx` → filter application

---

## Fix 1 — Resolution camera : utiliser paysage comme le hub

**Probleme :** Le Lab demande `width: 1080, height: 1920` (portrait) mais
iOS Safari ignore cette contrainte et donne une resolution moindre.
Le hub demande `width: 1920, height: 1080` (paysage) et ca marche —
iOS donne la resolution max, et le `object-cover` + `coverCrop` font le 9:16.

**Fichier :** `subtitle-lab/lib/useMediaRecorder.ts`

```typescript
// AVANT :
video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },

// APRES (comme le hub) :
video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
```

---

## Fix 2 — MiniScrubber drag pas fluide

**Probleme :** Le scrubber ne repond pas bien au drag continu. Il faut
taper precis sur la barre. Le drag est souvent interrompu.

**Causes :**
1. La zone de touch est trop petite (h-6 = 24px)
2. `onPointerLeave` interrompt le drag si le doigt sort de la barre
3. Le playhead est trop petit pour etre attrapé

**Fix :** `subtitle-lab/components/MiniScrubber.tsx`

1. Augmenter la zone de touch : `h-8` au lieu de `h-6` (32px)
2. Retirer `onPointerLeave={onPointerUp}` — le pointerCapture empeche
   deja les events de se perdre quand le doigt sort
3. Mettre le `setPointerCapture` correctement sur le barRef
   (pas e.currentTarget qui peut varier) :

```typescript
const onPointerDown = (e: React.PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  dragging.current = true;
  barRef.current?.setPointerCapture(e.pointerId);
  scrub(e.clientX);
};
const onPointerMove = (e: React.PointerEvent) => {
  if (!dragging.current) return;
  e.preventDefault();
  scrub(e.clientX);
};
const onPointerUp = (e: React.PointerEvent) => {
  dragging.current = false;
  barRef.current?.releasePointerCapture(e.pointerId);
};
```

4. Agrandir la zone active du playhead avec un padding invisible :
   Le playhead visible fait 2px mais sa zone de touch fait 20px :
```tsx
{/* Playhead with larger touch target */}
<div className="absolute top-0 h-full" style={{ left: `calc(${progress * 100}% - 10px)`, width: '20px' }}>
  <div className="absolute left-[9px] top-0 w-0.5 h-full bg-emerald-400" />
  <div className="absolute left-[7px] -top-1 w-2.5 h-2.5 bg-emerald-400 rotate-45" />
</div>
```

---

## Fix 3 — Filtres difficiles a taper / intensite pas fluide

**Probleme :** Les boutons de filtre sont petits et en scroll horizontal.
Le tap est souvent confondu avec un scroll. Il faut plusieurs taps pour
changer de filtre. L'intensite ne change pas de facon fluide.

**Fix :** `subtitle-lab/components/FilterPanel.tsx`

1. Augmenter la taille des boutons de filtre :
   `w-14 h-20` au lieu de `w-12 h-16` (56×80px au lieu de 48×64px)

2. Ajouter `touchAction: pan-y` sur le scroll container pour que
   les taps horizontaux soient reconnus comme taps et pas comme scroll :
   En fait le contraire — le container scroll horizontalement, donc
   le geste horizontal est un scroll. Le tap doit etre vertical.
   Utiliser un `onTouchEnd` ou `onClick` qui ne se declenche que si
   le doigt n'a pas bouge de plus de 5px (anti-scroll-tap).

   La solution la plus simple : ajouter `scroll-snap-type: x mandatory`
   et `scroll-snap-align: center` pour que les filtres se calent.
   Et utiliser un `onClick` normal — le browser devrait distinguer
   tap de scroll nativement.

3. Pour l'intensite fluide : le slider range devrait avoir un
   debounce ou utiliser `onInput` au lieu de `onChange` pour une
   mise a jour continue. Verifier que le store met a jour `filterIntensity`
   de facon reactive et que le CSS filter s'applique dans le RAF loop.

4. Verifier dans SubtitleCanvas que `filterIntensity` est bien lu du
   store et utilise pour le CSS filter. Si `filterIntensity < 1`, le
   filtre CSS devrait etre attenue. La technique la plus simple :
   quand intensite = 0 → filter: none.
   quand intensite = 1 → filter: [full filter CSS].
   Pour les valeurs intermediaires, on peut interpoler lineairement les
   parametres numeriques du filtre (ex: brightness(1 + (1.2-1)*intensity)).

   Pour V1, l'approche simple est ok : intensite > 0 = filtre applique,
   intensite = 0 = pas de filtre. Mais le slider doit reagir en temps reel.

---

## Fix 4 — Transcription : utiliser le meilleur modele AssemblyAI

**Probleme :** La transcription en francais utilise le modele par defaut.
AssemblyAI a un modele "best" (Universal-2) plus precis.

**Fichier :** `subtitle-lab/app/api/transcribe/route.ts`

Ajouter `speech_model: 'best'` aux parametres de transcription :
```typescript
body: JSON.stringify({
  audio_url: upload_url,
  language_code: 'fr',
  speech_model: 'best',   // ← AJOUTER : Universal-2, plus precis
  word_boost: ['acupuncture', 'meridien', 'qi', 'yin', 'yang', 'aiguille'],
  punctuate: true,
}),
```

---

## Contraintes
- La resolution camera doit etre IDENTIQUE au hub (1920x1080 paysage)
- NE PAS modifier le renderer.ts
- NE PAS modifier CameraOverlay (le viewfinder est correct)
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] La camera demande 1920x1080 (paysage, comme le hub)
- [ ] Le MiniScrubber drag est fluide (pas interrompu quand le doigt bouge)
- [ ] La zone de touch du scrubber fait 32px de haut
- [ ] Les filtres reagissent au premier tap (pas besoin de taper 2x)
- [ ] L'intensite des filtres change en temps reel avec le slider
- [ ] La transcription utilise `speech_model: 'best'`
- [ ] `npm run build` passe
