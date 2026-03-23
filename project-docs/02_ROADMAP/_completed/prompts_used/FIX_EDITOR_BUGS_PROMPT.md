# Fix — Bugs éditeur post-deploy

## Contexte
Mon Acupunctrice Hub — PWA Next.js 15 déployée sur Vercel.
L'app fonctionne sauf l'éditeur vidéo qui a 4 bugs en production,
principalement sur iPhone Safari. Les bugs sont probablement liés
aux headers COOP/COEP et au comportement de Safari iOS avec les vidéos.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Zustand, FFmpeg.wasm.
Headers COOP/COEP actifs sur toutes les pages sauf /login.

## Fichiers à lire AVANT de commencer
- `components/features/editor/VideoPreview.tsx` → preview vidéo (bug 1, 2)
- `components/features/editor/EditorLayout.tsx` → layout éditeur
- `components/features/editor/timeline/Timeline.tsx` → timeline (bug 3)
- `components/features/editor/panels/FilterPanel.tsx` → miniatures filtres (bug 4)
- `components/features/editor/ImportModal.tsx` → import/webcam
- `lib/store/useEditorStore.ts` → store éditeur Zustand
- `app/api/proxy-video/route.ts` → proxy vidéo (headers COEP)
- `next.config.mjs` → headers COOP/COEP

---

## Bug 1 — Preview vidéo basse résolution sur iPhone

**Symptôme :** La vidéo preview est en basse résolution sur iPhone Safari.
Sur desktop en simulation iPhone (DevTools), la résolution est correcte.

**Cause probable :** iPhone a un devicePixelRatio de 2 ou 3. Le composant
`<video>` en `object-contain` ne pose pas de problème de résolution normalement,
mais si la vidéo est chargée via le proxy avec compression, ou si la vidéo source
est en basse résolution depuis la webcam, ça peut causer ça.

**Investigation :**
1. Vérifier les dimensions de la vidéo source (videoWidth, videoHeight) dans le store
2. Vérifier si le proxy-video compresse la vidéo
3. Vérifier les contraintes MediaRecorder pour la webcam (résolution de capture)

**Fix probable :**
- Dans `useMediaRecorder`, augmenter la résolution de capture :
  ```typescript
  const constraints = {
    video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
    audio: true
  };
  ```
- Vérifier que la vidéo via proxy n'est pas recompressée

---

## Bug 2 — Preview vidéo invisible après enregistrement sur iPhone

**Symptôme :** Après avoir filmé avec la webcam et sauvegardé,
le preview vidéo ne s'affiche pas sur iPhone. Fonctionne sur desktop.

**Cause probable :**
- Safari iOS ne supporte pas bien le format WebM (MediaRecorder sur Safari
  génère du MP4/H.264 ou parfois du WebM selon la version)
- Le `URL.createObjectURL(blob)` peut ne pas être persistant après
  que le stream est cleanup
- Le problème peut aussi être que Safari iOS nécessite `playsinline`
  ET `webkit-playsinline` pour les vidéos inline

**Fix probable :**
- Vérifier le MIME type du blob produit par MediaRecorder sur Safari
- Si WebM : le transcoder en MP4 via FFmpeg.wasm avant de le charger
- S'assurer que la vidéo a les attributs : `playsInline webkit-playsinline`
- Vérifier que le blob URL est créé AVANT le cleanup du stream

---

## Bug 3 — Timeline invisible (iPhone ET desktop)

**Symptôme :** La timeline multi-track n'est pas visible du tout.

**Cause probable :** En regardant le code de `Timeline.tsx` :
- Si `duration === 0`, la timeline rend un div vide (ligne de code :
  `if (duration === 0) { return <div ... /> }`)
- Le `duration` est set par `handleLoaded` dans `VideoPreview.tsx`
  via `onLoadedMetadata`
- Si la vidéo n'a pas encore chargé ses metadata, duration reste 0

**Investigation :**
1. Vérifier que `duration` dans le store n'est pas 0
2. Vérifier que `onLoadedMetadata` est bien appelé
3. Possible race condition : la timeline rend avant que les metadata soient chargées

**Fix probable :**
- Ajouter un fallback dans Timeline : si duration est 0 mais videoFile existe,
  afficher un placeholder "Chargement de la timeline..."
- S'assurer que loadVideo met aussi un duration si disponible
- Écouter aussi `onCanPlay` ou `onDurationChange` en plus de `onLoadedMetadata`

---

## Bug 4 — Miniatures de filtres sans preview sur iPhone

**Symptôme :** Les miniatures de filtres ne montrent pas le preview
de la vidéo avec le filtre appliqué. Fonctionne sur desktop.

**Cause probable :** Dans `FilterPanel.tsx` :
- La miniature est capturée via `canvas.getContext('2d').drawImage(video, ...)`
- Sur Safari iOS, `drawImage` depuis un `<video>` cross-origin est bloqué
  (même avec CORS headers) — c'est un taint du canvas
- La vidéo est peut-être servie via le proxy (`/api/proxy-video`) qui ajoute
  les headers CORS mais Safari iOS est plus strict que Chrome
- Le try/catch attrape l'erreur silencieusement et retente, mais échoue toujours

**Fix probable :**
- Ajouter `crossOrigin="anonymous"` sur l'élément `<video>` dans VideoPreview
- S'assurer que le proxy-video retourne les bons headers CORS :
  `Access-Control-Allow-Origin: *` ET `Cross-Origin-Resource-Policy: cross-origin`
- Si la vidéo est locale (blob URL), le cross-origin n'est pas le problème —
  vérifier que `video.readyState >= 2` et `video.videoWidth > 0` avant le drawImage
- Alternative : capturer la miniature une seule fois au moment de l'import
  et la stocker dans le store au lieu de la recapturer dans FilterPanel

---

## Contraintes
- Ne PAS modifier la logique de publication ou les API routes
- Ne PAS changer les headers COOP/COEP dans next.config.mjs
- Héroicons uniquement, zéro emoji
- 0 console.log en production (retirer tout debug logging après les fixes)
- Composants < 150 lignes
- Tester sur desktop avec DevTools mobile (375px) après chaque fix

## Definition of Done
- [ ] npm run build passe sans erreur
- [ ] Timeline visible quand une vidéo est chargée (desktop + mobile simulation)
- [ ] Preview vidéo visible après import depuis le fichier (desktop + mobile simulation)
- [ ] Miniatures de filtres affichent le preview (au moins le gradient fallback si cross-origin échoue)
- [ ] L'éditeur reste fonctionnel (trim, filtres, texte, export)
