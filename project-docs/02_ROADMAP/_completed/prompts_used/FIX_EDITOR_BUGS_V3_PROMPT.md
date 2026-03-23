# Fix V3 — Bugs restants post-deploy

## Contexte
Mon Acupunctrice Hub — PWA Next.js 15 déployée sur Vercel.
Export vidéo fonctionne maintenant. 3 bugs restants.

## Fichiers à lire AVANT de commencer
- `components/features/editor/EditorLayout.tsx`
- `components/features/editor/ImportModal.tsx`
- `components/features/editor/VideoPreview.tsx`
- `components/features/publish/CoverPicker.tsx`
- `components/features/ideas/IdeaDetailSheet.tsx`
- `lib/store/useEditorStore.ts`
- `next.config.mjs` (config PWA runtimeCaching)

---

## Bug 1 — Image de couverture ne charge pas dans PublishSheet

**Problème :** Après un export réussi, le sheet "Image de couverture" montre
un placeholder vide au lieu d'une frame de la vidéo exportée.

**Cause :** Le service worker PWA intercepte la requête vers
`firebasestorage.googleapis.com` et échoue avec `FetchEvent.respondWith no-response`.
Le runtimeCaching `NetworkOnly` dans next.config.mjs n'est pas appliqué en mode dev
parce que la PWA lib dit : "Building in development mode, caching and precaching are disabled".
Mais le VIEUX service worker installé avant le fix continue de tourner.

**Fix :** Le CoverPicker charge la vidéo avec `crossOrigin="anonymous"` depuis Firebase Storage.
Le problème est que le canvas `drawImage` depuis une vidéo cross-origin produit un canvas tainted.
Même avec `Access-Control-Allow-Origin: *` de Firebase, Safari peut tainter le canvas.

**Solution :** Revenir au proxy vidéo pour le CoverPicker. Le proxy sert la vidéo
depuis le même domaine (localhost / vercel.app), ce qui évite le taint cross-origin.
Dans `CoverPicker.tsx`, remettre le proxy :
```typescript
const videoSrc = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;
```
ET retirer `crossOrigin="anonymous"` du `<video>` (pas nécessaire avec le proxy same-origin).

**Important :** Aussi ajouter un fallback `onCanPlay` pour la capture de frame,
comme on a fait dans VideoPreview et FilterPanel. Le `onseeked` peut ne pas fire
si la vidéo n'est pas encore chargée au moment du seek.

---

## Bug 2 — Pas de preview vidéo dans les détails d'une idée

**Problème :** Dans la page Idées, quand on clique sur une idée qui a une vidéo,
le detail sheet montre un placeholder VideoCameraIcon au lieu de la vraie vidéo.

**Cause :** Dans `IdeaDetailSheet.tsx`, la condition est :
```typescript
{item.videoUrl && (
  item.thumbnailUrl ? (
    <img src={item.thumbnailUrl} ... />
  ) : (
    <div>placeholder</div>
  )
)}
```
Le champ `thumbnailUrl` n'est jamais set dans Firestore — on stocke seulement `videoUrl`.
Donc le placeholder apparaît toujours.

**Fix :** Remplacer le placeholder par un élément `<video>` qui affiche la première frame :
```typescript
{item.videoUrl && (
  item.thumbnailUrl ? (
    <img src={item.thumbnailUrl} alt="" className="rounded-lg w-full max-h-36 object-cover" />
  ) : (
    <video
      src={item.videoUrl}
      className="rounded-lg w-full max-h-36 object-cover"
      playsInline
      muted
      preload="metadata"
    />
  )
)}
```
Le `preload="metadata"` suffit pour afficher la première frame sans télécharger toute la vidéo.
Ne PAS ajouter `autoPlay` ou `controls`.

---

## Bug 3 — "Modifier" une idée prête ouvre le popup webcam

**Problème :** Quand on clique "Continuer le montage" ou "Ouvrir l'éditeur" dans
IdeaActions, on est redirigé vers `/editeur/{id}`. Le EditorLayout vérifie
`if (!videoFile) return <ImportModal />`. Comme `videoFile` est null (c'est un File
local, pas une URL), l'ImportModal s'affiche au lieu de l'éditeur.

**Cause :** Le store a `videoFile` (objet File local) et `videoUrl` (blob URL).
Quand on revient sur un item déjà exporté, la vidéo est sur Firebase Storage (pas locale).
Le store n'a ni `videoFile` ni `videoUrl` → ImportModal apparaît.

**Fix dans `EditorLayout.tsx` :**
1. Au mount, lire le document Firestore pour l'item
2. Si l'item a un `videoUrl` (Firebase Storage), charger la vidéo dans le store
3. Utiliser `videoUrl` du store OU une URL Firebase comme condition d'affichage

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  setItemId(itemId);
  
  // Charger la vidéo existante depuis Firestore si elle existe
  const loadExisting = async () => {
    const db = getFirebaseFirestore();
    const snap = await getDoc(doc(db, 'contentItems', itemId));
    if (snap.exists()) {
      const data = snap.data();
      if (data.videoUrl && !videoFile) {
        // Télécharger la vidéo comme File pour le store
        try {
          const res = await fetch(data.videoUrl);
          const blob = await res.blob();
          const file = new File([blob], 'existing.mp4', { type: 'video/mp4' });
          loadVideo(file, URL.createObjectURL(file));
        } catch {
          // Fallback: utiliser l'URL directement dans le store
          // Ajouter un setVideoUrl dans le store si nécessaire
        }
      }
    }
    setLoading(false);
  };
  
  loadExisting();
  return () => { reset(); };
}, [itemId]);
```

**Alternative plus simple :** Ajouter `videoUrl` comme condition alternative :
```typescript
const { videoFile, videoUrl, ... } = useEditorStore();
// ...
if (!videoFile && !videoUrl) {
  if (loading) return <LoadingSpinner />;
  return <ImportModal />;
}
```
Et dans le useEffect, setter directement `videoUrl` dans le store depuis Firestore.
Ajouter `setVideoUrl` au store :
```typescript
setVideoUrl: (url: string) => set({ videoUrl: url }),
```

Le deuxième approche est plus simple mais la vidéo ne sera pas éditable (pas de File local).
Le premier approche télécharge la vidéo et permet l'édition complète.

**Recommandation :** Utiliser la première approche (télécharger comme File).
Ajouter un état `loading` pour montrer un spinner pendant le téléchargement.

---

## Contraintes
- Heroicons uniquement, zéro emoji
- 0 console.log en production
- Composants < 150 lignes
- NE PAS modifier l'export WebCodecs ou les headers COOP/COEP
- Tester avec `npm run build`

## Bug 4 — Bouton rouge (supprimer) caché par la nav bar dans le detail sheet

**Problème :** Dans le bottom sheet des détails d'une idée planifiée,
le dernier bouton rouge (Supprimer) est caché derrière la bottom navigation bar.

**Cause :** Le BottomSheet a un `paddingBottom: calc(16px + env(safe-area-inset-bottom))`
mais cela ne suffit pas quand la nav bar est visible (49px + safe-area).
Le contenu scrollable du bottom sheet est coupé par la nav bar fixed.

**Fix dans `components/ui/BottomSheet.tsx` :**
Le BottomSheet est `z-50` et la nav est aussi en position fixed. Le BottomSheet overlay
couvre tout l'écran (`fixed inset-0 z-50`) mais le contenu en bas peut être caché
par le home indicator + la nav bar.

Augmenter le paddingBottom pour tenir compte de la nav bar (49px) + safe-area :
```typescript
style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}
```
Le 60px = 49px (nav) + 11px de marge.

---

## Definition of Done
- [ ] npm run build passe
- [ ] Image de couverture affiche une frame de la vidéo exportée
- [ ] Les idées avec vidéo montrent un aperçu vidéo dans le detail sheet
- [ ] Cliquer "Modifier" sur une idée avec vidéo ouvre l'éditeur avec la vidéo chargée
- [ ] Le bouton Supprimer est visible en bas du detail sheet d'une idée planifiée
