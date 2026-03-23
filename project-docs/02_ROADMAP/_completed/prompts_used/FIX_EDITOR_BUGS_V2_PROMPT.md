# Fix V2 — Bugs éditeur sur iPhone (diagnostic précis)

## Contexte
Les fixes précédents n'ont pas résolu les problèmes sur iPhone Safari.
Le diagnostic est maintenant précis. 4 bugs restants.

## Fichiers à lire AVANT de commencer
- `components/features/editor/ImportModal.tsx`
- `components/features/editor/VideoPreview.tsx`
- `components/features/editor/timeline/Timeline.tsx`
- `components/features/editor/panels/FilterPanel.tsx`
- `lib/hooks/useMediaRecorder.ts`
- `lib/store/useEditorStore.ts`

---

## Bug 1 — Preview webcam trop zoomé sur iPhone

**Problème exact :** La caméra frontale iPhone capture en résolution landscape
(ex: 1920x1080 ou 1280x720) même quand on demande width:1080, height:1920.
Le container CSS fait aspectRatio 9/16 avec object-cover, donc la vidéo
landscape est croppée et zoomée sur le visage.

**Fix dans `lib/hooks/useMediaRecorder.ts` :**
Sur mobile, la caméra frontale ne respecte pas les constraints width/height
en mode portrait. Il faut utiliser `facingMode: 'user'` avec des constraints
qui marchent sur iOS :

```typescript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const constraints = isMobile
  ? { video: { facingMode: 'user' }, audio: true }
  : { video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } }, audio: true };
```

**Fix dans `components/features/editor/ImportModal.tsx` :**
Le container preview ne doit PAS forcer un aspect ratio fixe.
Sur iPhone, la caméra donne ce qu'elle donne — il faut afficher le stream
tel quel et laisser `object-cover` sur le container plein écran.
L'enregistrement sera croppé en 9:16 à l'export, pas au preview.

Changer le container preview de :
```tsx
style={{ aspectRatio: '9/16', height: '100%', maxHeight: '100dvh', maxWidth: 'calc(100dvh * 9 / 16)' }}
```
à :
```tsx
style={{ width: '100%', height: '100%' }}
```

Et garder `object-cover` sur la vidéo pour remplir l'écran.
L'utilisateur voit ce que la caméra capture, sans crop artificiel pendant le preview.

---

## Bug 2 — Vidéo en landscape après enregistrement

**Problème exact :** Sur iPhone, MediaRecorder enregistre la vidéo avec les
metadata en landscape (la résolution est 1920x1080 par exemple) même si
visuellement l'utilisateur filmait en portrait. Le `<video>` element joue
la vidéo en landscape par défaut.

**Fix dans `components/features/editor/VideoPreview.tsx` :**
Après le chargement de la vidéo, vérifier si la vidéo est en portrait natif
ou si elle a besoin d'être tournée. Comparer videoWidth et videoHeight :

```typescript
const handleLoaded = () => {
  const video = videoRef.current;
  if (!video) return;
  setDuration(video.duration);
  
  // Détecter si la vidéo webcam est en landscape alors qu'elle devrait être portrait
  // Sur iPhone, la webcam enregistre en landscape — on doit tourner le CSS
  const isLandscape = video.videoWidth > video.videoHeight;
  setVideoOrientation(isLandscape ? 'landscape' : 'portrait');
  
  // Thumbnail capture...
};
```

Ajouter `videoOrientation` au store Zustand.
Si `videoOrientation === 'landscape'` ET que c'est une vidéo webcam (pas un import),
appliquer un CSS transform : `transform: rotate(90deg)` et ajuster le sizing.

ALTERNATIVE plus simple : Ne PAS corriger l'orientation au preview.
Corriger seulement à l'export FFmpeg avec `-vf "transpose=1"`.
Le preview restera en landscape mais l'export final sera en portrait 9:16.
Documenter ce comportement dans un commentaire.

---

## Bug 3 — Timeline ne s'affiche pas

**Problème exact :** `duration` reste à 0 dans le store. Le composant Timeline
rend le placeholder "Chargement de la timeline..." indéfiniment.

Le `onLoadedMetadata` de VideoPreview devrait setter la duration, mais sur
Safari iOS avec des blobs vidéo, `loadedmetadata` peut fire avec
`duration === Infinity` ou `duration === NaN`.

**Fix dans `components/features/editor/VideoPreview.tsx` :**
1. Écouter AUSSI `onCanPlay` (plus fiable que `onLoadedMetadata` sur Safari)
2. Écouter `onDurationChange` (déjà fait mais vérifier que la condition est bonne)
3. Ajouter un fallback : si duration est toujours 0 après 2 secondes, essayer
   de lire la durée via `video.seekable` :

```typescript
// Fallback pour Safari iOS — les blobs peuvent avoir duration=Infinity
useEffect(() => {
  const video = videoRef.current;
  if (!video || !videoUrl) return;
  
  const checkDuration = () => {
    if (video.duration && isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
      return true;
    }
    return false;
  };
  
  // Essayer immédiatement
  if (checkDuration()) return;
  
  // Retry toutes les 500ms pendant 5 secondes
  const interval = setInterval(() => {
    if (checkDuration()) clearInterval(interval);
  }, 500);
  
  const timeout = setTimeout(() => clearInterval(interval), 5000);
  return () => { clearInterval(interval); clearTimeout(timeout); };
}, [videoUrl, setDuration]);
```

---

## Bug 4 — Miniatures filtres noires

**Problème exact :** La capture de thumbnail dans `handleLoaded` (VideoPreview)
échoue sur Safari iOS parce que la vidéo n'est pas encore décodée au moment
de `loadedmetadata`. Le canvas `drawImage` produit une image noire ou tainted.

Le `FilterPanel.tsx` lit `thumbnailUrl` du store — mais il est null.
Le fallback gradient devrait toujours apparaître comme backup.

**Fix dans `components/features/editor/panels/FilterPanel.tsx` :**
Vérifier que le fallback gradient est bien en place quand `thumbnailUrl` est null.

**Fix dans `components/features/editor/VideoPreview.tsx` :**
Déplacer la capture de thumbnail APRÈS un délai ou après `onCanPlay` :

```typescript
const handleCanPlay = () => {
  const video = videoRef.current;
  if (!video || get().thumbnailUrl) return; // déjà capturé
  
  // Petit délai pour s'assurer que la frame est décodée
  setTimeout(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 90;
      canvas.height = 160;
      canvas.getContext('2d')!.drawImage(video, 0, 0, 90, 160);
      const url = canvas.toDataURL('image/jpeg', 0.8);
      if (url !== 'data:,' && url.length > 100) setThumbnail(url);
    } catch { /* fallback gradient dans FilterPanel */ }
  }, 200);
};
```

Ajouter `onCanPlay={handleCanPlay}` sur le `<video>`.

---

## Contraintes
- Heroicons uniquement, zéro emoji
- 0 console.log en production
- Composants < 150 lignes
- Tester avec `npm run build` avant de finir
- NE PAS toucher aux headers COOP/COEP
- NE PAS modifier la logique de publication

## Definition of Done
- [ ] npm run build passe
- [ ] Preview webcam utilise tout l'écran sans zoom excessif
- [ ] Timeline affiche les tracks quand une vidéo est chargée (vérifier duration > 0)
- [ ] FilterPanel affiche le gradient fallback si thumbnail pas disponible
- [ ] La vidéo se charge correctement après import fichier
