# FIX-1 — Corrections post-Phase A (revise)

## Contexte
Phase A testee sur iPhone. Bugs critiques identifies : la video importee/filmee
ne s'affiche pas, le MiniScrubber est cache par les sheets, le switch entre
sheets demande 2 taps au lieu d'un.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/store.ts` → setVideo, addVideoClip, getClipAtTime, tracks[]
- `subtitle-lab/components/SubtitleCanvas.tsx` → RAF loop, loadedmetadata, setDuration
- `subtitle-lab/components/BottomSheet.tsx` → backdrop fixed inset-0 z-40
- `subtitle-lab/components/MiniScrubber.tsx` → dans le flow flex, pas fixed
- `subtitle-lab/app/page.tsx` → toggleSheet, layout, canvas container
- `subtitle-lab/lib/renderer.ts` → renderFrame, skipBackground, gradient
- `subtitle-lab/lib/testData.ts` → TEST_BLOCKS hardcodes
- `subtitle-lab/lib/useMediaRecorder.ts` → camera resolution

---

## Fix 1 — BUG CRITIQUE : La video ne s'affiche pas (clip.duration = 0)

**Probleme :** `setVideo(file)` cree un VideoClip avec `duration: 0`,
`trimStart: 0`, `trimEnd: 0`. Quand `getClipAtTime()` cherche un clip actif,
la duree effective est `trimEnd - trimStart = 0ms`, donc le clip n'est JAMAIS
trouve. Resultat : `findActiveClip()` retourne null, le RAF loop dessine un
fond noir (ou le gradient), et la video n'apparait pas.

**Cause racine :** Il manque une action `initClipDuration` dans le store.
Dans SubtitleCanvas, `loadedmetadata` appelle `setDuration(vid.duration * 1000)`
qui met a jour la duree GLOBALE, mais PAS le `trimEnd` du VideoClip.

**Fix — Ajouter `initClipDuration` au store :**

**Fichier :** `subtitle-lab/lib/store.ts`

```typescript
initClipDuration: (clipId: string, durationMs: number) => void;
```

Implementation :
```typescript
initClipDuration: (clipId, durationMs) => set((s) => {
  const tracks = s.tracks.map(t => {
    if (t.type !== 'video' || !t.clips) return t;
    const clips = t.clips.map(c =>
      c.id === clipId && c.duration === 0
        ? { ...c, duration: durationMs, trimEnd: durationMs }
        : c
    );
    return { ...t, clips: recalcTimelineStarts(clips) };
  });
  return { tracks, ...syncFlatFromTracks(tracks), duration: totalClipsDuration(tracks) };
}),
```

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Modifier le handler loadedmetadata pour aussi initialiser le clip :
```typescript
// AVANT (ligne ~62) :
const h = () => {
  if (vid.duration && isFinite(vid.duration))
    useSubtitleStore.getState().setDuration(vid.duration * 1000);
};

// APRES :
const h = () => {
  if (vid.duration && isFinite(vid.duration)) {
    const dMs = vid.duration * 1000;
    const store = useSubtitleStore.getState();
    store.setDuration(dMs);
    // Initialiser la duree du clip actif (fixe trimEnd=0 bug)
    const clipId = activeClipIdRef.current;
    if (clipId) store.initClipDuration(clipId, dMs);
  }
};
```

AUSSI : quand on charge la source video dans le RAF loop (changement de clip),
ecouter `loadedmetadata` sur le video element pour init la duree de CE clip :
```typescript
// Apres vid.src = ar.clip.blobUrl; dans le RAF loop :
if (ar.clip.duration === 0) {
  const onMeta = () => {
    if (vid.duration && isFinite(vid.duration)) {
      useSubtitleStore.getState().initClipDuration(ar.clip.id, vid.duration * 1000);
    }
    vid.removeEventListener('loadedmetadata', onMeta);
  };
  vid.addEventListener('loadedmetadata', onMeta);
}
```

IMPORTANT : la source video doit etre chargee DES l'import.
Verifier que setVideo fait bien `vid.src = blobUrl` quelque part.
Actuellement le RAF loop charge la source quand il detecte un nouveau clip,
mais si le clip a duration=0, findActiveClip retourne null et le RAF loop
ne le detecte JAMAIS. C'est un cercle vicieux.

**Solution au cercle vicieux :** Dans setVideo() ou dans un useEffect qui
reagit au changement de `videoUrl`, charger immediatement la source dans
videoRef et ecouter loadedmetadata :
```typescript
useEffect(() => {
  const vid = videoRef.current;
  if (!vid || !videoUrl) return;
  vid.src = videoUrl;
  activeClipIdRef.current = getVideoTrack(tracksRef.current)?.clips?.[0]?.id ?? null;
  const onMeta = () => {
    if (vid.duration && isFinite(vid.duration)) {
      const dMs = vid.duration * 1000;
      const cid = activeClipIdRef.current;
      if (cid) useSubtitleStore.getState().initClipDuration(cid, dMs);
      useSubtitleStore.getState().setDuration(dMs);
    }
  };
  vid.addEventListener('loadedmetadata', onMeta);
  return () => vid.removeEventListener('loadedmetadata', onMeta);
}, [videoUrl]);
```

---

## Fix 2 — MiniScrubber cache par les bottom sheets

**Probleme :** Le MiniScrubber est dans le flow flex normal. Les BottomSheet
sont en `fixed bottom-0 z-50`. Le MiniScrubber est recouvert.

**Fix :** Rendre le MiniScrubber fixed, positionne juste au-dessus du sheet.

**Fichier :** `subtitle-lab/app/page.tsx`

Sortir le MiniScrubber du flow flex. Le mettre en fixed :
```tsx
{/* MiniScrubber toujours visible, au-dessus des sheets */}
<div className="fixed left-0 right-0 z-[55] transition-all duration-300 lg:hidden"
     style={{ bottom: activeSheet ? '40dvh' : '0' }}>
  <MiniScrubber />
</div>
```

Le z-[55] est au-dessus du sheet (z-50).
Quand un sheet est ouvert, le scrubber monte a 40dvh (hauteur du sheet).
Quand ferme, il est tout en bas.
La transition `duration-300` anime le deplacement.

Ajouter du padding-bottom au conteneur du canvas pour compenser :
```tsx
<div className="flex-1 flex items-center justify-center px-0 lg:px-4 min-h-0"
     style={{ paddingBottom: '28px' }}> {/* hauteur du MiniScrubber */}
```

---

## Fix 3 — Bottom sheet switch en 1 tap (pas 2)

**Probleme :** Quand un sheet est ouvert (ex: Tracks), taper sur un autre
bouton (ex: Filtres) ferme le sheet au lieu de switcher. Il faut 2 taps.

**Cause :** Le backdrop du BottomSheet est `fixed inset-0 z-40`. Il couvre
toute la page, y compris la Toolbar. Quand on tape sur un bouton de la
toolbar, le tap touche le backdrop (z-40) AVANT le bouton, donc `onClose`
se declenche et ferme le sheet.

**Fix :** Le backdrop ne doit PAS couvrir la toolbar.

**Fichier :** `subtitle-lab/components/BottomSheet.tsx`

```tsx
// AVANT :
<div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />

// APRES — exclure le haut de l'ecran (toolbar + canvas) :
<div className="fixed left-0 right-0 bottom-0 bg-black/20 z-40 lg:hidden"
     style={{ top: 'auto', height: '40dvh' }}
     onClick={onClose} />
```

Ou encore plus simple : mettre la toolbar au-dessus du backdrop avec un z-index :
```tsx
// Dans page.tsx, la toolbar :
<div className="relative z-[45]"> {/* au-dessus du backdrop z-40 */}
  <Toolbar ... />
</div>
```

C'est la meilleure solution — la toolbar reste au-dessus du backdrop et
les taps sur les boutons fonctionnent normalement.

---

## Fix 4 — Retirer les sous-titres hardcodes

**Fichier :** `subtitle-lab/lib/store.ts`
- Track sous-titres : `blocks: []` (pas TEST_BLOCKS)
- Champ flat : `blocks: []`
- Duration : `duration: 0` (pas TOTAL_DURATION_MS)
- Retirer les imports de TEST_BLOCKS et TOTAL_DURATION_MS

---

## Fix 5 — Canvas plein ecran 9:16

**Fichier :** `subtitle-lab/app/page.tsx`
- Retirer `px-3` du conteneur canvas mobile (garder `lg:px-4`)

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`
- Retirer `rounded-xl shadow-2xl` du canvas
- Le canvas garde `w-full h-auto` avec `maxWidth: 100%`

---

## Fix 6 — Resolution camera portrait

**Fichier :** `subtitle-lab/lib/useMediaRecorder.ts`
- Camera : `width: { ideal: 1080 }, height: { ideal: 1920 }` (portrait 9:16)

---

## Contraintes
- Le canvas interne reste 540x960 (buffer de rendu)
- Le CSS fait le scaling pour remplir l'ecran
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Import video → la video s'affiche dans le preview (pas un fond noir/gradient)
- [ ] Le clip video apparait dans la track video du sheet Tracks
- [ ] Camera → enregistrement → la video filmee s'affiche dans le preview
- [ ] Le MiniScrubber est visible meme quand un bottom sheet est ouvert
- [ ] Le MiniScrubber monte au-dessus du sheet avec animation
- [ ] Taper Filtres quand Tracks est ouvert → switch direct en 1 tap
- [ ] Aucun sous-titre de test au demarrage
- [ ] Canvas plein ecran sans marges sur mobile
- [ ] `npm run build` passe
