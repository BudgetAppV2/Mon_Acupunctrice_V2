# FIX-3 — Polissage UX et nouvelles features

## Contexte
FIX1 et FIX2 appliques. La video s'affiche, l'audio fonctionne, le scrubber
drag, les filtres ont un slider. Reste du polissage UX et de nouvelles features.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3, @heroicons/react.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/app/page.tsx` → layout, toolbar, SheetId, bottom sheets
- `subtitle-lab/components/FilterPanel.tsx` → grille filtres, thumbnails
- `subtitle-lab/components/SubtitleCanvas.tsx` → canvas, videoRef, thumbnailUrl
- `subtitle-lab/components/TracksPanel.tsx` → pistes, blocs
- `subtitle-lab/components/CameraOverlay.tsx` → camera plein ecran
- `subtitle-lab/lib/store.ts` → tracks[], addVideoClip, thumbnailUrl
- `subtitle-lab/lib/playback.ts` → CANVAS_W, CANVAS_H

---

## Fix 1 — Glassmorphism pill derriere les boutons de la toolbar

**Probleme :** Quand l'image video est claire, les boutons de la toolbar
sont difficiles a voir (icones blanches sur fond clair).

**Fix :** Ajouter un fond glassmorphic (flou + opacite) derriere le
groupe de boutons de droite dans la toolbar (les tabs).

**Fichier :** `subtitle-lab/app/page.tsx`

Wrapper les boutons de la toolbar dans un conteneur avec backdrop-blur :
```tsx
<div className="flex items-center gap-0.5 bg-black/30 backdrop-blur-md
  rounded-full px-1 py-0.5">
  <ToolButton ... /> {/* Tracks */}
  <ToolButton ... /> {/* Audio */}
  <ToolButton ... /> {/* Filtres */}
  <ToolButton ... /> {/* Sous-titres */}
</div>
```

Le pill `rounded-full` avec `bg-black/30 backdrop-blur-md` donne l'effet
glassmorphic sans etre opaque. Les icones restent lisibles sur fond clair.

---

## Fix 2 — Vignettes des filtres doivent utiliser l'image video

**Probleme :** Les vignettes des filtres montrent un fond generique au lieu
de l'image de la video importee. L'utilisateur ne peut pas visualiser
l'effet du filtre sur SA video.

**Fix :** Generer une thumbnail de la video a 2 secondes (ou au currentTime)
et l'utiliser comme base pour les vignettes des filtres.

**Fichier :** `subtitle-lab/lib/store.ts`

S'assurer que `thumbnailUrl` est genere quand une video est importee.
Ajouter dans `setVideo` ou `initClipDuration` (quand la video est prete) :
```typescript
// Generer thumbnail a 2 secondes
const genThumbnail = () => {
  try {
    const c = document.createElement('canvas');
    c.width = 90; c.height = 160;
    c.getContext('2d')!.drawImage(vid, 0, 0, 90, 160);
    const url = c.toDataURL('image/jpeg', 0.7);
    if (url.length > 100) set({ thumbnailUrl: url });
  } catch {}
};
```

Ce code existe deja peut-etre dans SubtitleCanvas.tsx — verifier et
s'assurer que `thumbnailUrl` est bien mis a jour dans le store.

**Fichier :** `subtitle-lab/components/FilterPanel.tsx`

Utiliser `thumbnailUrl` du store pour les vignettes des filtres.
Chaque vignette applique le CSS filter du preset sur l'image thumbnail :
```tsx
const { thumbnailUrl } = useSubtitleStore();
// ...
<div style={{ filter: f.css !== 'none' ? f.css : undefined }}>
  {thumbnailUrl ?
    <img src={thumbnailUrl} className="w-full h-full object-cover" /> :
    <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-800" />
  }
</div>
```

---

## Fix 3 — Bouton + pour ajouter une track video

**Probleme :** Il n'y a pas de moyen d'ajouter une 2e video une fois
qu'une video est deja importee. `addVideoClip()` dans le store est
branche mais pas accessible depuis l'UI.

**Fix :** Ajouter un bouton "+" dans le sheet Tracks, a cote de la
piste video.

**Fichier :** `subtitle-lab/components/TracksPanel.tsx`

Ajouter un bouton PlusIcon apres la derniere piste video :
```tsx
<button onClick={() => fileInputRef.current?.click()}
  className="flex items-center gap-1 px-2 py-1 text-[10px] text-white/40
    border border-dashed border-white/20 rounded-md mt-1 active:bg-white/10">
  <PlusIcon className="w-3 h-3" /> Ajouter video
</button>
<input ref={fileInputRef} type="file" accept="video/*" className="hidden"
  onChange={e => { const f = e.target.files?.[0]; if (f) addVideoClip(f); }} />
```

Quand on tape le bouton +, ca ouvre le file picker. Le fichier selectionne
appelle `addVideoClip(file)` qui cree automatiquement une piste V2.

---

## Fix 4 — Nouveaux bottom sheets : Texte et Cover Image

**Probleme :** Il manque les sheets "Texte" (overlays texte) et
"Cover" (image de couverture). Pour l'instant, ajouter juste les
boutons et les sheets vides avec un message "Bientot disponible".

**Fichier :** `subtitle-lab/app/page.tsx`

Ajouter `'text' | 'cover'` au type SheetId.

Ajouter 2 icones dans la toolbar (dans le pill glassmorphic) :
- Texte : `Bars3Icon` ou `ChatBubbleBottomCenterTextIcon`
- Cover : `PhotoIcon`

Ajouter 2 bottom sheets avec contenu placeholder :
```tsx
<BottomSheet isOpen={activeSheet === 'text'} onClose={...}>
  <div className="flex items-center justify-center h-32 text-white/30 text-sm">
    Overlays texte — bientot disponible
  </div>
</BottomSheet>
<BottomSheet isOpen={activeSheet === 'cover'} onClose={...}>
  <div className="flex items-center justify-center h-32 text-white/30 text-sm">
    Image de couverture — bientot disponible
  </div>
</BottomSheet>
```

---

## Fix 5 — Captation camera utilise tout l'ecran

**Probleme :** La captation depuis la camera du Lab devrait utiliser tout
l'ecran du iPhone en 9:16, comme quand on importe un fichier de la
phototheque qui prend tout l'espace.

**Fichier :** `subtitle-lab/components/CameraOverlay.tsx`

Verifier que le viewfinder (element `<video>` du stream camera) utilise
tout l'ecran disponible :
```tsx
<video ref={viewfinderRef} autoPlay playsInline muted
  className="absolute inset-0 w-full h-full object-cover"
  style={{ transform: 'scaleX(-1)' }} />
```

`object-cover` assure que la camera remplit tout l'ecran en croppant
si necessaire (meme comportement que la phototheque). Le `scaleX(-1)`
donne le mirror selfie.

---

## Contraintes
- NE PAS modifier le renderer.ts ou les animations
- NE PAS modifier useMediaRecorder.ts
- Les sheets Texte et Cover sont des placeholders (pas de fonctionnalite)
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Les boutons de la toolbar ont un fond glassmorphic (pill blur)
- [ ] Les vignettes des filtres montrent l'image de la video (pas un fond generique)
- [ ] Bouton + dans le sheet Tracks pour ajouter une video (cree piste V2)
- [ ] Sheets "Texte" et "Cover" accessibles depuis la toolbar (placeholders)
- [ ] La camera utilise tout l'ecran en 9:16 (object-cover)
- [ ] `npm run build` passe
