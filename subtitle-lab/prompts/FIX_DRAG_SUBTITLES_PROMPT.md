# FIX — Drag des sous-titres et textes sur le canvas

## Problème 1 : Conflit drag sous-titres vs text overlays
Quand un text overlay est sélectionné, les sous-titres ne sont plus
draggables et vice-versa. Le `useSubtitleDrag` dans SubtitleCanvas
est instancié UNE seule fois avec soit l'overlay sélectionné, soit
la position globale des sous-titres.

### Cause
Ligne dans SubtitleCanvas.tsx:
```tsx
const { isDragging, onDown, onMove, onUp } = useSubtitleDrag(dragPos, selectedOverlayId);
```
Quand `selectedOverlayId` existe → tout le drag va au text overlay.
Quand il est null → tout va aux sous-titres.
Il n'y a PAS de hit-testing pour savoir QUEL élément on touche.

### Fix attendu
Implémenter un hit-testing basique dans le `onDown` :
1. Au touch/click, calculer la position relative sur le canvas
2. Chercher quel élément (text overlay ou sous-titre) est sous le doigt
3. Dragger CET élément spécifiquement
4. Si rien n'est touché, ne pas dragger

Le hit-testing doit vérifier :
- Les text overlays visibles au `currentTime` (entre startMs et endMs)
- Les sous-titres visibles au `currentTime` (entre startMs et endMs)
- Utiliser la position (x, y) de chaque élément et une zone de tolerance
  (par exemple un rectangle de ~30% de la largeur du canvas, centré sur
  la position de l'élément)

## Problème 2 : Drag impossible avec bottom sheet ouvert
Quand un panel (Tracks, Audio, Filtres, etc.) est ouvert en bas,
le canvas est partiellement caché et le drag ne fonctionne pas
sur la portion visible.

### Fix attendu
Le canvas doit rester interactif même quand la bottom sheet est
ouverte. La bottom sheet ne doit PAS bloquer les pointer events
sur le canvas au-dessus d'elle.

Vérifier dans `EditorV2Layout.tsx` et `BottomSheet.tsx` :
- Le z-index du canvas vs la bottom sheet
- Les pointer-events sur le canvas
- Que la bottom sheet ne couvre pas tout l'écran

## Fichiers à modifier
- `lib/editor-v2/useSubtitleDrag.ts` — hit-testing pour déterminer
  quel élément dragger
- `components/features/editor-v2/SubtitleCanvas.tsx` — passer les
  données nécessaires au hit-testing (liste des overlays + sous-titres
  visibles avec leurs positions)
- `components/features/editor-v2/BottomSheet.tsx` — vérifier que le
  canvas reste interactif

## Definition of Done
- [ ] Drag un sous-titre quand un text overlay existe → fonctionne
- [ ] Drag un text overlay quand des sous-titres existent → fonctionne
- [ ] Drag un text overlay quand un autre text overlay est sélectionné
      → le bon overlay bouge
- [ ] Drag avec bottom sheet ouverte → fonctionne sur le canvas visible
- [ ] Tap sur un text overlay → le sélectionne
- [ ] npm run build passe
