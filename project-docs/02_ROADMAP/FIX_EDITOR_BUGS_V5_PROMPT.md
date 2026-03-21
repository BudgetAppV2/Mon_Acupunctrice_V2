# Fix V5 — CoverPicker : spinner + slider de frame

## Fichiers à lire
- `components/features/publish/CoverPicker.tsx`

---

## Bug 1 — Pas de spinner pendant le chargement de la couverture

**Problème :** L'image de couverture met du temps à charger (la vidéo passe par le proxy).
Pendant ce temps, on voit un placeholder vide sans indication de chargement.

**Fix :** Ajouter un état `loading` qui affiche un spinner animé pendant que
la vidéo charge via le proxy. Mettre `loading=true` au mount, `loading=false`
quand `onCanPlay` ou `onLoadedMetadata` fire sur le `<video>`.

Afficher le spinner dans le bloc preview à la place du placeholder PhotoIcon :
```tsx
{loading ? (
  <div className="w-32 h-56 bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
  </div>
) : framePreview ? (
  <img src={framePreview} ... />
) : (
  <div className="w-32 h-56 bg-gray-100 rounded-lg flex items-center justify-center">
    <PhotoIcon className="w-8 h-8 text-gray-300" />
  </div>
)}
```

---

## Bug 2 — Le slider de frame ne change pas l'image

**Problème :** Glisser le slider "Frame a X.Xs" ne change pas l'image de couverture.
C'est toujours la même frame qui s'affiche.

**Cause probable :** Le `useEffect` qui capture la frame écoute `value` mais
la condition `if (value.type !== 'frame') return` empêche peut-être la mise à jour.
Ou le `vid.onseeked` n'est pas déclenché parce que `currentTime` ne change pas
suffisamment (Safari arrondit les seeks).

**Fix :** Vérifier que :
1. Le `vid.currentTime = value.offset / 1000` est bien exécuté à chaque changement du slider
2. Le `onseeked` est bien attaché AVANT de changer `currentTime`
3. Ajouter un fallback `setTimeout` après le seek pour capturer la frame
   même si `onseeked` ne fire pas
4. Le useEffect a la bonne dépendance — il doit dépendre de `value.offset`
   pas seulement de `value`

Code corrigé :
```typescript
useEffect(() => {
  const vid = videoRef.current;
  if (!vid || value.type !== 'frame') return;

  const captureFrame = () => {
    try {
      if (vid.readyState < 2 || vid.videoWidth === 0) return;
      const c = document.createElement('canvas');
      c.width = 270; c.height = 480;
      // Crop center comme l'export
      const videoAspect = vid.videoWidth / vid.videoHeight;
      const canvasAspect = 270 / 480;
      let sx = 0, sy = 0, sw = vid.videoWidth, sh = vid.videoHeight;
      if (videoAspect > canvasAspect) {
        sw = vid.videoHeight * canvasAspect;
        sx = (vid.videoWidth - sw) / 2;
      } else {
        sh = vid.videoWidth / canvasAspect;
        sy = (vid.videoHeight - sh) / 2;
      }
      c.getContext('2d')!.drawImage(vid, sx, sy, sw, sh, 0, 0, 270, 480);
      const url = c.toDataURL('image/jpeg', 0.8);
      if (url !== 'data:,' && url.length > 100) setFramePreview(url);
    } catch { /* cross-origin */ }
  };

  vid.onseeked = captureFrame;
  vid.currentTime = value.offset / 1000;
  // Fallback si onseeked ne fire pas
  setTimeout(captureFrame, 300);
}, [value.type === 'frame' ? value.offset : null]);
```

Note : la dépendance doit être `value.offset` quand le type est 'frame',
sinon le useEffect ne se relance pas quand on glisse le slider.

---

## Contraintes
- Heroicons uniquement
- 0 console.log en production
- NE PAS modifier l'export WebCodecs ou le muxer
- Tester avec `npm run build`

## Definition of Done
- [ ] npm run build passe
- [ ] Un spinner s'affiche pendant le chargement de l'image de couverture
- [ ] Glisser le slider change la frame affichée dans l'image de couverture
