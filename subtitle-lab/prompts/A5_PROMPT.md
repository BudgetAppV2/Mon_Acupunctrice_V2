# A5 — Import camera + countdown anime

## Contexte
Subtitle Lab importe des videos depuis le fichier. On ajoute l'import camera (webcam frontale) avec un countdown 3-2-1 anime sur le canvas avant l'enregistrement.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3, MediaRecorder API.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/components/SubtitleCanvas.tsx` → Canvas 540x960. Le canvas est le preview principal. Le countdown doit s'afficher PAR-DESSUS le canvas.
- `subtitle-lab/app/page.tsx` → Toolbar avec bouton Import (FilmIcon). Actuellement declenche `<input type="file">`. Transformer en menu Fichier/Camera.
- `subtitle-lab/lib/store.ts` → `addVideoClip(file)` pour ajouter l'enregistrement.
- `lib/hooks/useMediaRecorder.ts` (editeur principal) → 109 lignes. Hook complet : startWebcam, countdown 3-2-1, MediaRecorder, MIME detection (MP4>WebM), fix-webm-duration. A COPIER et adapter.
- `components/features/editor/ImportModal.tsx` (editeur principal) → 172 lignes. Mode webcam avec preview plein ecran, bouton record, countdown overlay. Reference pour le design.

---

## Livrable 1 — Copier useMediaRecorder dans le Lab

**Nouveau fichier :** `subtitle-lab/lib/useMediaRecorder.ts`

Copier `lib/hooks/useMediaRecorder.ts` depuis l'editeur principal. Adapter :
- Retirer les imports specifiques au hub (pas de paths `@/lib/...`)
- Garder : startWebcam, startRecording (avec countdown 3-2-1), stopRecording, cleanup
- Garder : detection MIME (MP4 > WebM), fix-webm-duration
- La resolution demandee : `{ facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } }`
- IMPORTANT : le viewfinder doit etre en **mirror horizontal** (CSS `transform: scaleX(-1)`)
  car c'est un selfie — l'utilisateur s'attend a se voir en miroir.
  Par contre, l'enregistrement reel n'est PAS miroire (le MediaRecorder capture le stream natif)
- Retirer startScreenCapture (pas necessaire dans le Lab)

---

## Livrable 2 — Menu Import (Fichier ou Camera)

**Fichier :** `subtitle-lab/app/page.tsx`

Transformer le bouton Import actuel en un menu a 2 options. Au tap sur l'icone Import :
- Afficher un petit popover ou bottom sheet avec 2 boutons :
  - "Fichier" (FolderOpenIcon) → `<input type="file">`
  - "Camera" (VideoCameraIcon) → lance le flow camera

Alternative plus simple : au tap, ouvrir une modale plein ecran si camera, sinon file input.

---

## Livrable 3 — Mode Camera plein ecran

Quand l'utilisateur choisit Camera :
1. Appeler `startWebcam()` du hook
2. Afficher le stream dans le canvas (remplacer le rendu normal par `ctx.drawImage(videoEl, ...)`  ou le stream dans un element video par-dessus le canvas)
3. Bouton "Annuler" en haut a gauche
4. Gros bouton rouge rond en bas pour demarrer l'enregistrement
5. Pendant l'enregistrement : indicateur REC rouge en haut a droite

Design camera :
```
┌─────────────────────┐
│ [Annuler]      [REC]│
│                     │
│    (viewfinder      │
│     camera feed)    │
│                     │
│      [ ⏺ ]         │  ← bouton record
└─────────────────────┘
```

---

## Livrable 4 — Countdown anime 3-2-1

Pendant le countdown (entre le tap record et le debut de l'enregistrement) :
- Afficher un gros chiffre (3, 2, 1) au centre du canvas
- Animation : scale 1.5 → 1.0 avec fade out, easing ease-out
- Duree : 1 seconde par chiffre
- Apres le countdown : le hook demarre le MediaRecorder

Le countdown est gere par le hook (`countdown` state, 3 → 2 → 1 → 0).

---

## Livrable 5 — Fin d'enregistrement → import automatique

Quand `stopRecording()` est appele :
- Le hook retourne `{ file, url }` via la Promise
- Appeler `addVideoClip(file)` du store
- Revenir au mode normal (canvas preview video)
- Le cleanup du hook arrete les tracks du stream

---

## Contraintes
- Installer `fix-webm-duration` si pas deja present (`npm install fix-webm-duration`)
- Un seul element `<video>` pour le viewfinder (reutiliser videoRef du canvas ou en creer un temporaire)
- NE PAS modifier le renderer.ts
- NE PAS modifier TracksPanel ou TrackBlock
- Le countdown est un overlay, pas un remplacement du canvas
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Le bouton Import offre Fichier ou Camera
- [ ] La camera s'ouvre en plein ecran avec viewfinder
- [ ] Le countdown 3-2-1 est anime (scale + fade)
- [ ] L'enregistrement demarre apres le countdown avec indicateur REC
- [ ] Tap stop → la video enregistree charge dans le preview
- [ ] Le clip apparait dans la track video du sheet Tracks
- [ ] `npm run build` passe dans `subtitle-lab/`
