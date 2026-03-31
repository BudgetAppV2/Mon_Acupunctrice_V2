# FIX-2 — Corrections UX post-testing iPhone

## Contexte
Le Lab fonctionne (video s'affiche, camera ok, filtres ok). Mais plusieurs
bugs UX identifies lors du testing sur iPhone.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/app/page.tsx` → layout, toolbar, import menu, bottom sheets
- `subtitle-lab/components/SubtitleCanvas.tsx` → canvas, audio sync, RAF loop
- `subtitle-lab/components/MiniScrubber.tsx` → scrubber persistant
- `subtitle-lab/components/TracksPanel.tsx` → pistes, blocs, playhead
- `subtitle-lab/components/TrackBlock.tsx` → blocs, trim handles
- `subtitle-lab/components/FilterPanel.tsx` → filtres, pas de slider d'intensite
- `subtitle-lab/lib/store.ts` → updateClipTrim, recalcTimelineStarts, tracks[]
- `subtitle-lab/lib/playback.ts` → CANVAS_W, CANVAS_H, coverCrop

---

## Fix 1 — Canvas trop grand : restaurer le layout editeur

**Probleme :** Apres le fix "canvas plein ecran", l'image video deborde.
Le canvas prend toute la hauteur et pousse la toolbar et le scrubber.
On voulait que le canvas utilise toute la LARGEUR, pas toute la hauteur.

**Fix :** Le canvas doit rester dans son conteneur flex avec une hauteur
contrainte. L'image 9:16 prend la largeur max disponible mais est
limitee en hauteur par l'espace entre la toolbar et le MiniScrubber.

**Fichier :** `subtitle-lab/app/page.tsx`

Le conteneur du canvas doit contraindre la hauteur :
```tsx
<div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden px-0 lg:px-4">
  <SubtitleCanvas />
</div>
```
Le `min-h-0` est CRITIQUE — sans ca, flex-1 ne contraindra pas la hauteur.
`overflow-hidden` empeche le debordement.

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Le canvas doit avoir `max-height: 100%` pour ne pas deborder du conteneur :
```tsx
<canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
  className="w-full h-auto max-h-full"
  style={{ objectFit: 'contain', cursor: ..., touchAction: 'none', filter: ... }}
```
`w-full h-auto max-h-full` = prend la largeur disponible, hauteur auto
proportionnelle, mais jamais plus grand que le conteneur.

---

## Fix 2 — Pas d'audio (on n'entend rien)

**Probleme :** L'audio de la video est muet. L'element `<video>` est cree
avec `muted = true` dans `createVideoElement()` (playback.ts ligne 35).
C'est necessaire pour l'autoplay mais il faut le demuter apres le premier play.

**Fichier :** `subtitle-lab/lib/playback.ts`

```typescript
// GARDER muted: true dans createVideoElement (necessaire autoplay)
```

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Quand l'utilisateur appuie play, demuter la video :
```typescript
// Dans le useEffect qui gere isPlaying :
useEffect(() => {
  if (videoRef.current) {
    if (isPlaying) {
      videoRef.current.muted = false; // Demuter quand l'utilisateur appuie play
      videoRef.current.volume = voiceVolume;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }
}, [isPlaying, voiceVolume]);
```

IMPORTANT : Le premier play() demande une interaction utilisateur (tap sur Play).
Apres cette interaction, `play()` avec `muted = false` fonctionne sur iOS Safari.

---

## Fix 3 — MiniScrubber ne repond pas au drag (seulement tap)

**Probleme :** Le MiniScrubber reagit aux taps mais pas au drag continu.
Le scrub devrait etre fluide quand on glisse le doigt.

**Fichier :** `subtitle-lab/components/MiniScrubber.tsx`

Verifier que le scrubber utilise `onPointerDown` + `onPointerMove` +
`setPointerCapture` (pas des click events) :
```typescript
const handlePointerDown = (e: React.PointerEvent) => {
  e.preventDefault();
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  updateFromPointer(e);
};
const handlePointerMove = (e: React.PointerEvent) => {
  if (e.buttons === 0) return; // pas de bouton enfonce = pas de drag
  updateFromPointer(e);
};
const updateFromPointer = (e: React.PointerEvent) => {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  setCurrentTime(ratio * duration);
};
```

S'assurer que `touchAction: none` est sur le conteneur pour empecher
le scroll pendant le drag.

---

## Fix 4 — Menu import reste ouvert quand on change de tab

**Probleme :** Le popover Import (Fichier/Camera) reste ouvert quand on
tape sur un autre bouton de la toolbar (Tracks, Filtres, etc.).

**Fichier :** `subtitle-lab/app/page.tsx`

Fermer le menu import quand on change de sheet :
```typescript
const toggleSheet = (id: SheetId) => {
  setShowImportMenu(false); // Fermer le menu import
  setActiveSheet(prev => prev === id ? null : id);
};
```

Et aussi fermer quand on tape ailleurs (clic sur le backdrop du popover).

---

## Fix 5 — Pas de slider d'intensite pour les filtres

**Probleme :** Les filtres s'appliquent a 100% sans possibilite de doser.

**Fix :** Ajouter un slider d'intensite sous la grille de filtres dans FilterPanel.

**Fichier :** `subtitle-lab/lib/store.ts`

Ajouter au store :
```typescript
filterIntensity: number; // 0-1, defaut 1.0
setFilterIntensity: (v: number) => void;
```

**Fichier :** `subtitle-lab/components/FilterPanel.tsx`

Ajouter un slider sous la grille de filtres :
```tsx
<div className="px-3 py-2">
  <label className="text-[10px] text-white/40">
    Intensite : {Math.round(filterIntensity * 100)}%
  </label>
  <input type="range" min={0} max={1} step={0.05}
    value={filterIntensity}
    onChange={e => setFilterIntensity(+e.target.value)}
    className="w-full accent-emerald-400" />
</div>
```

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Appliquer l'intensite au CSS filter. La technique : mixer le filtre avec 'none'
en utilisant le ratio d'intensite. La facon la plus simple est de wrapper
dans un opacity sur le filtre CSS. Mais CSS filter n'a pas d'intensite native.

La meilleure approche : interpoler les valeurs du filtre vers la baseline.
Ex: si le filtre est `brightness(1.2) saturate(1.5)` et intensite = 0.5,
alors `brightness(1.1) saturate(1.25)` (midpoint vers 1.0).

Pour simplifier : utiliser `filter: opacity(intensity)` n'est PAS correct
car ca rend tout transparent.

**Approche pragmatique :** Utiliser mix-blend-mode ou simplement appliquer
le filtre complet et ne PAS interpoler (l'intensite 0 = pas de filtre,
intensite > 0 = filtre complet). C'est une V1.

---

## Fix 6 — Trim du clip video fait zoomer la track

**Probleme :** Quand on trim un clip video avec les handles, la track
ajuste sa largeur a la duree trimmee. On perd la vue de ce qu'on a
coupe a droite. La track ne devrait PAS zoomer lors d'un trim.

**Cause :** Les blocs sont positionnes proportionnellement a la duree
totale. Quand on trim, la duree totale diminue, et le bloc restant
remplit toute la largeur.

**Fix :** La largeur de reference de la timeline doit etre la duree
ORIGINALE (non-trimmee) du clip, pas la duree effective.

**Fichier :** `subtitle-lab/components/TracksPanel.tsx`

La duree de reference pour le positionnement des blocs doit etre
le MAX entre la duree totale effective et la duree source du clip
le plus long. Calculer :
```typescript
// Duree de reference = max duree source de tous les clips video
const refDuration = Math.max(
  ...tracks.filter(t => t.type === 'video').flatMap(t => t.clips ?? [])
    .map(c => c.duration), // duree SOURCE, pas trimEnd-trimStart
  totalDuration, // ne jamais etre plus petit que la duree effective
);
```

Utiliser `refDuration` (pas `totalDuration`) pour le calcul des
positions des blocs : `left = (clip.timelineStart / refDuration) * 100%`,
`width = ((clip.trimEnd - clip.trimStart) / refDuration) * 100%`.

Aussi montrer la zone trimmee en grise (le clip entier visible,
la zone active en couleur, la zone trimmee en couleur tres faible) :
```
[░░trimStart░░|████visible████|░░trimEnd░░]
   gris 20%        couleur       gris 20%
```

---

## Fix 7 — AssemblyAI "cle non configuree"

**Probleme :** Le bouton Transcrire retourne "ASSEMBLYAI_API_KEY non configuree".
C'est normal — le Lab standalone n'a pas de .env.local sur Vercel.

**Fix :** PAS un bug de code. L'utilisateur doit :
1. Ajouter `ASSEMBLYAI_API_KEY=xxx` dans les Environment Variables de Vercel
   (Settings → Environment Variables du projet subtitle-lab)
2. Ou ajouter dans `subtitle-lab/.env.local` pour le dev local

Pour le prompt : NE PAS modifier le code. Documenter dans le DoD que
la transcription ne fonctionne que si la cle est configuree.

---

## Contraintes
- Le canvas interne reste 540x960
- NE PAS modifier le renderer.ts
- NE PAS modifier CameraOverlay ou useMediaRecorder
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Le canvas video est visible sans deborder (toolbar et scrubber visibles)
- [ ] L'audio de la video est audible quand on appuie play
- [ ] Le MiniScrubber repond au drag continu (pas seulement tap)
- [ ] Le menu Import se ferme quand on tape un autre bouton
- [ ] Un slider d'intensite est visible sous les filtres
- [ ] Le trim d'un clip ne fait PAS zoomer la track
- [ ] La zone trimmee est visible en gris sur la track
- [ ] `npm run build` passe
