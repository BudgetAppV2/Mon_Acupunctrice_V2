# Fix V6 — Bugs cosmétiques + drag texte

## Fichiers à lire AVANT de commencer
- `components/features/publish/CoverPicker.tsx`
- `components/features/ideas/IdeaDetailSheet.tsx`
- `app/(app)/idees/page.tsx`
- `components/features/editor/text/TextOverlay.tsx`
- `components/ui/BottomSheet.tsx`
- `lib/types/index.ts` — vérifier les champs ContentItem

---

## Bug 1 — Image de couverture ne charge pas sur Safari iOS

**Problème :** Le CoverPicker charge une vidéo cachée via le proxy et capture
une frame avec canvas.drawImage. Sur Safari iOS, la vidéo ne se décode pas
même avec opacity-0/w-px/h-px.

**Nouvelle approche :** Au lieu de charger une 2e vidéo dans le CoverPicker,
utiliser la vidéo DÉJÀ CHARGÉE dans l'éditeur (VideoPreview). Le store Zustand
a déjà `thumbnailUrl` (capturé dans VideoPreview via handleCanPlay).

Si `thumbnailUrl` existe dans le store, l'utiliser comme image initiale
de couverture au lieu de re-capturer une frame.

Pour le slider de frame, garder le proxy vidéo MAIS ajouter un fallback :
si la capture de frame échoue après 5 secondes, afficher `thumbnailUrl` du store
comme image par défaut avec un message "Apercu indisponible sur cet appareil.
Utilisez Depuis Photos pour choisir une image personnalisée."

**Fix dans `CoverPicker.tsx` :**
1. Accepter une nouvelle prop `fallbackThumbnail?: string` (thumbnailUrl du store)
2. Si `loading` est true après 5 secondes ET pas de framePreview → utiliser fallbackThumbnail
3. Afficher un texte sous la preview "Glissez le curseur pour choisir la frame"
   OU "Utilisez Depuis Photos sur cet appareil" si le fallback est actif

**Fix dans `PublishSheet.tsx` :**
Passer `thumbnailUrl` du store comme `fallbackThumbnail` au CoverPicker.

---

## Bug 2 — Aperçus vidéo absents dans le bottom sheet détail

**Problème :** Dans IdeaDetailSheet, le `<video preload="metadata">` avec
une URL Firebase Storage ne montre pas la première frame sur Safari iOS.
Le tag video ne fonctionne pas bien avec les URLs cross-origin et preload="metadata".

**Fix dans `IdeaDetailSheet.tsx` :**
Remplacer le `<video>` par une image poster. Utiliser la même approche :
si `coverImageUrl` ou `thumbnailUrl` existent → `<img>`.
Si seulement `videoUrl` existe → afficher une icône vidéo avec le texte "Vidéo prête"
au lieu d'un `<video>` invisible qui ne charge pas sur Safari.

```tsx
{item.videoUrl && (
  (item.coverImageUrl || item.thumbnailUrl) ? (
    <img src={(item.coverImageUrl || item.thumbnailUrl)!} alt="" 
      className="rounded-lg w-full max-h-36 object-cover" />
  ) : (
    <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center gap-2">
      <VideoCameraIcon className="w-6 h-6 text-sage" />
      <span className="text-sm text-gray-500">Video prete</span>
    </div>
  )
)}
```

---

## Bug 3 — Bouton + ajout d'idée caché en PWA iOS

**Problème :** Le bouton flottant "+" pour créer une idée est en position
`fixed bottom-6 right-6` dans `app/(app)/idees/page.tsx`. Sur iPhone PWA,
le home indicator et la bottom nav bar cachent le bouton.

**Fix dans `app/(app)/idees/page.tsx` :**
Remonter le bouton au-dessus de la nav bar. La nav bar fait 49px + safe-area.
Changer la position :
```tsx
className="fixed right-5 w-14 h-14 bg-sage text-white rounded-full shadow-lg 
  flex items-center justify-center z-40"
style={{ bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}
```

---

## Bug 4 — Drag du texte dans l'éditeur pas fluide

**Problème :** Le drag du texte dans l'éditeur ne suit pas bien le doigt.
Le mouvement est saccadé et décalé.

**Cause dans `TextOverlay.tsx` :**
Le `onPointerMove` est sur l'élément texte lui-même, ce qui perd le pointer
quand le doigt se déplace plus vite que l'élément. Le `setPointerCapture`
est fait sur `e.target` au lieu de `e.currentTarget`.

**Fix :**
1. Utiliser `e.currentTarget` pour `setPointerCapture` (pas `e.target`)
2. Ajouter `touch-action: none` sur l'élément draggable pour empêcher
   le scroll du navigateur pendant le drag
3. Utiliser `requestAnimationFrame` pour throttler les updates de position
4. Ajouter `e.preventDefault()` dans onPointerMove pour empêcher le scroll

```tsx
const onPointerDown = (e: React.PointerEvent) => {
  if (!interactive) return;
  e.stopPropagation();
  e.preventDefault();
  onSelect();
  setDragging(true);
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  ref.current = { sx: e.clientX, sy: e.clientY, ox: o.x, oy: o.y };
};
const onPointerMove = (e: React.PointerEvent) => {
  if (!dragging) return;
  e.preventDefault();
  const nx = ref.current.ox + (e.clientX - ref.current.sx) / parentW;
  const ny = ref.current.oy + (e.clientY - ref.current.sy) / parentH;
  onMove(nx, ny);
};
```

Et ajouter `touch-none` dans la className de l'élément draggable quand interactive:
```tsx
className={`absolute select-none whitespace-nowrap 
  ${interactive ? 'cursor-move touch-none' : ''}`}
```

---

## Contraintes
- Heroicons uniquement
- 0 console.log en production
- Composants < 150 lignes
- NE PAS modifier l'export WebCodecs ou le muxer
- Tester avec `npm run build`

## Definition of Done
- [ ] npm run build passe
- [ ] Image de couverture affiche un fallback si la capture échoue (Safari iOS)
- [ ] Bottom sheet détail montre "Vidéo prête" au lieu d'un video tag invisible
- [ ] Bouton + visible au-dessus de la nav bar en PWA iOS
- [ ] Drag du texte suit le doigt sans saccades
