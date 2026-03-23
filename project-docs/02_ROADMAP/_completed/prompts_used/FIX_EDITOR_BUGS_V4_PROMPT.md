# Fix V4 — Format vidéo, bandes noires, bouton Modifier

## Contexte
Mon Acupunctrice Hub — PWA Next.js 15 déployée sur Vercel.
Export vidéo et image de couverture fonctionnent mais il reste 3 bugs.

## Fichiers à lire AVANT de commencer
- `lib/utils/exportWebCodecs.ts` — export WebCodecs (bandes noires)
- `components/features/editor/ImportModal.tsx` — preview webcam (bandes noires)
- `components/features/editor/EditorLayout.tsx` — chargement vidéo existante
- `components/features/editor/VideoPreview.tsx` — preview vidéo
- `components/features/publish/CoverPicker.tsx` — image de couverture
- `lib/store/useEditorStore.ts` — store Zustand
- `components/features/ideas/IdeaActions.tsx` — bouton Modifier

---

## Bug 1 — Bandes noires dans l'export et le preview

**Problème :** La vidéo exportée et l'image de couverture ont des bandes noires
en haut et en bas. La vidéo webcam est en landscape (ex: 1920x1080) mais
l'export fait 1080x1920 (portrait). Le canvas dessine avec object-contain,
ce qui laisse des bandes noires.

**Cause dans `exportWebCodecs.ts` :**
```typescript
const va = vw / vh, ca = W / H;
const [dw, dh] = va > ca ? [W, W / va] : [H * va, H];
ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
```
Ce code centre la vidéo et ajoute des bandes noires (letterboxing).
Pour un Reel Instagram 9:16, on veut un **crop center** (object-cover)
pas un **fit** (object-contain).

**Fix dans `exportWebCodecs.ts` :**
Remplacer le calcul de drawImage par un crop center :
```typescript
// object-cover : crop center, pas de bandes noires
const { videoWidth: vw, videoHeight: vh } = video;
const videoAspect = vw / vh;
const canvasAspect = W / H;
let sx = 0, sy = 0, sw = vw, sh = vh;
if (videoAspect > canvasAspect) {
  // Vidéo plus large que le canvas → crop horizontal
  sw = vh * canvasAspect;
  sx = (vw - sw) / 2;
} else {
  // Vidéo plus haute que le canvas → crop vertical
  sh = vw / canvasAspect;
  sy = (vh - sh) / 2;
}
ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
```

**Fix dans `CoverPicker.tsx` :**
Même logique de crop center pour la capture de frame de couverture.
Remplacer :
```typescript
c.getContext('2d')!.drawImage(vid, 0, 0, 270, 480);
```
Par le même calcul de crop center adapté à 270x480.

**Fix dans `ImportModal.tsx` — preview webcam sur desktop :**
Sur desktop, le preview webcam avait un container `aspectRatio: 9/16` qui a été
enlevé pour iPhone. Il faut remettre un container qui contraint la preview
en 9:16 SUR DESKTOP mais pas sur mobile. Utiliser object-cover pour que
la webcam remplisse le container sans bandes noires.

Remettre le container avec aspect ratio 9:16 :
```tsx
<div
  className="relative overflow-hidden"
  style={{ aspectRatio: '9/16', height: '100%', maxHeight: '100dvh', maxWidth: 'calc(100dvh * 9 / 16)' }}
>
  <video ... className="w-full h-full object-cover" />
```
Ceci fonctionne sur les deux plateformes : le container force le 9:16,
et `object-cover` crop la webcam pour remplir sans bandes noires.
L'ancien problème était `object-contain` qui créait les bandes.
Vérifier que la classe CSS est bien `object-cover` (pas object-contain).

---

## Bug 2 — Bouton "Modifier" ouvre encore l'ImportModal

**Problème :** Cliquer "Continuer le montage" ou "Ouvrir l'éditeur" dans
les détails d'une idée qui a déjà une vidéo ouvre le popup ImportModal
au lieu de charger la vidéo dans l'éditeur.

**Cause :** Le fix V3 a ajouté du code pour charger la vidéo existante
depuis Firestore dans EditorLayout. Mais le code ne fonctionne pas
correctement — soit il ne se déclenche pas, soit le timing fait que
`!videoFile && !videoUrl` est true avant que le fetch Firestore soit terminé.

**Investigation :**
1. Lire `EditorLayout.tsx` et vérifier le useEffect qui charge la vidéo
2. Vérifier que `loadVideo` est bien appelé avec le File téléchargé
3. Vérifier l'état `loading` — le spinner devrait s'afficher pendant le fetch
4. Ajouter un console.log temporaire pour debugger le flow

**Fix probable :**
Le problème est probablement que le `useEffect` cleanup (`return () => { reset(); }`)
s'exécute et reset le store avant que le fetch soit terminé (race condition avec React StrictMode).
Ou le `reset()` dans le cleanup annule le `loadVideo` qui vient d'être appelé.

Solution : utiliser un `abortController` ou un flag `isMounted` :
```typescript
useEffect(() => {
  let cancelled = false;
  setItemId(itemId);
  
  const loadExisting = async () => {
    setLoading(true);
    const db = getFirebaseFirestore();
    const snap = await getDoc(doc(db, 'contentItems', itemId));
    if (snap.exists() && !cancelled) {
      const data = snap.data();
      if (data.videoUrl && !useEditorStore.getState().videoFile) {
        const res = await fetch(`/api/proxy-video?url=${encodeURIComponent(data.videoUrl)}`);
        const blob = await res.blob();
        if (!cancelled) {
          const file = new File([blob], 'existing.mp4', { type: 'video/mp4' });
          loadVideo(file, URL.createObjectURL(file));
        }
      }
    }
    if (!cancelled) setLoading(false);
  };
  
  loadExisting();
  return () => { cancelled = true; reset(); };
}, [itemId]);
```

Note : utiliser le proxy-video (`/api/proxy-video?url=...`) pour télécharger la vidéo
depuis Firebase Storage, pas un fetch direct (le service worker peut bloquer).

---

## Contraintes
- Heroicons uniquement, zéro emoji
- 0 console.log en production (retirer les logs de debug existants)
- Composants < 150 lignes
- NE PAS modifier l'audio encoder ou la logique mp4-muxer (ça fonctionne maintenant)
- Tester avec `npm run build`

## Bug 3 — Preview vidéo absente dans le bottom sheet détail d'une idée

**Problème :** Dans IdeaDetailSheet, quand l'item a une vidéo, le preview
montre juste un placeholder ou rien.

**Fix dans `IdeaDetailSheet.tsx` :**
Si l'item a un `videoUrl`, afficher une miniature.
L'idéal serait d'utiliser l'image de couverture (`thumbnailUrl` ou `coverUrl`)
si elle existe. Sinon, afficher un `<video>` avec `preload="metadata"`
pour montrer la première frame.

Priorité d'affichage :
1. `item.coverUrl` (image de couverture custom) → `<img>`
2. `item.thumbnailUrl` (miniature) → `<img>`
3. `item.videoUrl` (vidéo brute) → `<video preload="metadata" playsInline muted>`
4. Placeholder VideoCameraIcon (pas de vidéo)

Ne PAS utiliser le proxy-video ici — c'est une page normale (pas l'éditeur),
pas de COEP. Le `<video>` ou `<img>` peut charger directement depuis Firebase Storage.

---

## Definition of Done
- [ ] npm run build passe
- [ ] L'export produit une vidéo sans bandes noires (crop center)
- [ ] L'image de couverture est en crop center (pas de bandes noires)
- [ ] Le preview webcam est en 9:16 sans bandes noires sur desktop ET mobile
- [ ] Cliquer "Modifier" sur une idée avec vidéo charge la vidéo dans l'éditeur
- [ ] Le bottom sheet détail d'une idée montre un preview vidéo (couverture ou première frame)
