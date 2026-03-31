# FIX-1 — Corrections post-Phase A

## Contexte
Phase A complete, testee sur iPhone. 5 corrections necessaires.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/store.ts` → tracks[] init avec TEST_BLOCKS
- `subtitle-lab/lib/testData.ts` → donnees de test hardcodees
- `subtitle-lab/components/SubtitleCanvas.tsx` → canvas render + RAF loop
- `subtitle-lab/lib/renderer.ts` → renderFrame avec skipBackground et gradient
- `subtitle-lab/app/page.tsx` → layout mobile (flex, padding, bottom sheets)
- `subtitle-lab/components/BottomSheet.tsx` → fixed bottom-0 z-50
- `subtitle-lab/components/MiniScrubber.tsx` → scrubber persistant
- `subtitle-lab/lib/useMediaRecorder.ts` → enregistrement camera

---

## Fix 1 — Retirer les sous-titres hardcodes

**Probleme :** Le store initialise avec TEST_BLOCKS. Les sous-titres de
test apparaissent sur une video importee — confus.

**Fichier :** `subtitle-lab/lib/store.ts`

- Initialiser la track sous-titres avec `blocks: []` (pas TEST_BLOCKS)
- Initialiser le champ flat `blocks: []` (pas TEST_BLOCKS)
- Initialiser `duration: 0` (pas TOTAL_DURATION_MS)
- Retirer les imports de TEST_BLOCKS et TOTAL_DURATION_MS
- Le fichier testData.ts peut rester pour reference

---

## Fix 2 — Gradient par-dessus la video importee

**Probleme :** Quand on importe ou filme une video, le gradient bleu fonce
du renderer se dessine PAR-DESSUS l'image video, rendant l'image invisible.

**Cause :** Dans SubtitleCanvas.tsx, le RAF loop passe `skipBackground: !!ar`
au renderer. Mais quand la video n'est pas encore prete (`readyState < 2`),
le drawImage ne s'execute pas, et le renderer dessine le gradient.
Ensuite, quand la video est prete, le canvas montre l'image SOUS le gradient
parce que le renderer ne fait pas de `ctx.clearRect()`.

**Fix :** Dans `subtitle-lab/lib/renderer.ts`, la fonction renderFrame doit
NE PAS dessiner le gradient quand skipBackground est true. Actuellement
c'est deja le cas (le gradient est dans le `if (!skipBackground)`), mais
le probleme reel est dans SubtitleCanvas.tsx :

**Fix dans SubtitleCanvas.tsx :** Quand un clip est actif mais la video
n'est pas prete (readyState < 2), il faut quand meme passer
`skipBackground: true` au renderer pour eviter le gradient.
Le canvas devrait rester noir (pas gradient) en attendant la video.

```typescript
// Dans le RAF loop, section rendu :
// AVANT :
if (!ar) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
else if (vid && vid.readyState >= 2 && vid.videoWidth > 0) {
  const c = coverCrop(vid.videoWidth, vid.videoHeight, CANVAS_W, CANVAS_H);
  ctx.drawImage(vid, c.sx, c.sy, c.sw, c.sh, 0, 0, CANVAS_W, CANVAS_H);
}
renderFrame({ ..., skipBackground: !!ar });

// APRES :
if (!ar) {
  // Pas de clip = fond noir
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
} else if (vid && vid.readyState >= 2 && vid.videoWidth > 0) {
  // Clip pret = dessiner la video
  const c = coverCrop(vid.videoWidth, vid.videoHeight, CANVAS_W, CANVAS_H);
  ctx.drawImage(vid, c.sx, c.sy, c.sw, c.sh, 0, 0, CANVAS_W, CANVAS_H);
} else {
  // Clip existe mais video pas encore prete = fond noir (PAS de gradient)
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}
// TOUJOURS skip le background du renderer quand un clip existe
renderFrame({ ..., skipBackground: !!ar });
```

Aussi verifier que la source video est bien chargee dans le `<video>` element
quand un fichier est importe. Le setVideo() du store cree un blobUrl et un
VideoClip, mais est-ce que le RAF loop detecte bien le nouveau clip et charge
la source dans videoRef.current ? Verifier la chaine :
setVideo(file) → VideoClip avec blobUrl → findActiveClip trouve le clip →
vid.src = blobUrl → vid.readyState monte → drawImage fonctionne.

---

## Fix 3 — MiniScrubber cache derriere les bottom sheets

**Probleme :** Le MiniScrubber est dans le flow flex normal de la page.
Les bottom sheets sont en `fixed bottom-0 z-50`. Quand un sheet s'ouvre,
il recouvre le MiniScrubber. On avait decide que le MiniScrubber serait
TOUJOURS visible entre le canvas et les bottom sheets.

**Fix :** Le MiniScrubber doit etre en position fixe ou sticky, au-dessus
des bottom sheets. Deux approches possibles :

**Option A (recommandee) :** Mettre le MiniScrubber en `fixed` avec un z-index
plus haut que les sheets, positionne juste AU-DESSUS du bottom sheet.

```tsx
// Dans page.tsx, le MiniScrubber est fixed au-dessus du bottom sheet
<MiniScrubber className="fixed left-0 right-0 z-[55]"
  style={{ bottom: activeSheet ? '40dvh' : '0' }} />
```

Le MiniScrubber se deplace vers le haut quand un sheet s'ouvre (bottom = 40dvh)
et redescend quand tous les sheets sont fermes (bottom = 0).
La transition doit etre animee (`transition-all duration-300`).

**Option B :** Integrer le MiniScrubber DANS le BottomSheet, en haut,
comme un header toujours visible. Mais ca ne marche pas quand aucun sheet
n'est ouvert.

→ Utiliser l'option A.

**Fichier :** `subtitle-lab/components/MiniScrubber.tsx`
- Accepter un `className` et `style` props pour le positionnement
- Retirer du flow flex (le parent ne le contient plus)

**Fichier :** `subtitle-lab/app/page.tsx`
- Deplacer le MiniScrubber hors du flex et le mettre en fixed
- Passer le style bottom dynamique selon activeSheet
- Ajouter du padding-bottom au canvas container pour compenser
  la hauteur du MiniScrubber quand il est en fixed

---

## Fix 4 — Canvas plein ecran 9:16 sur mobile

**Fichier :** `subtitle-lab/app/page.tsx`
- Retirer `px-3` du conteneur canvas (pas de marges sur mobile)
- Ajouter `min-h-0 overflow-hidden` pour que le canvas ne pousse pas

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`
- Retirer `rounded-xl shadow-2xl` (c'est un editeur, pas une carte)
- Le canvas doit remplir la largeur : `className="w-full h-auto"`

---

## Fix 5 — Resolution camera 9:16

**Fichier :** `subtitle-lab/lib/useMediaRecorder.ts`

Demander la resolution portrait :
```typescript
video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } }
```

---

## Contraintes
- Le canvas interne reste 540x960 (buffer de rendu)
- Le CSS fait le scaling pour remplir l'ecran
- Le gradient du renderer est OK quand il n'y a PAS de video (mode demo)
- 0 console.log en production
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Aucun sous-titre de test visible au demarrage
- [ ] La video importee ou filmee est VISIBLE (pas cachee par un gradient)
- [ ] Le MiniScrubber est TOUJOURS visible, meme quand un bottom sheet est ouvert
- [ ] Le MiniScrubber flotte au-dessus du bottom sheet et se deplace avec animation
- [ ] Le canvas utilise toute la largeur sur mobile (pas de marges)
- [ ] La camera demande la resolution portrait
- [ ] `npm run build` passe
