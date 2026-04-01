# FIX-10 — Refonte drag timeline avec pattern Remotion

## Problème
Le drag des blocs dans la timeline ne fonctionne pas correctement.
Le bloc revient à sa position originale après le drag (bounce-back).

## Cause racine identifiée
Le TrackBlock actuel utilise un pattern cassé :
- onPointerMove sur le composant React avec translateX visuel
- onDrag callback appelé seulement au pointerUp
- Le delta est calculé entre pointerDown et pointerUp
- React re-render et stale closures causent des problèmes

## Solution : Pattern Remotion (prouvé, utilisé en production)
Référence : https://www.remotion.dev/docs/player/drag-and-drop

Le pattern correct pour un drag dans React :

```typescript
const startDragging = useCallback((e: PointerEvent | React.MouseEvent) => {
  const initialX = e.clientX;

  // Ajouter les listeners au WINDOW (pas au composant React)
  const onPointerMove = (moveEvent: PointerEvent) => {
    const offsetX = (moveEvent.clientX - initialX) / pxPerMs;
    // Mettre à jour le store EN CONTINU pendant le drag
    changeItem(itemId, (item) => ({
      ...item,
      timelineStart: Math.max(0, originalTimelineStart + offsetX),
    }));
  };

  const onPointerUp = () => {
    window.removeEventListener('pointermove', onPointerMove);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { once: true });
}, []);
```

### Points clés du pattern Remotion :
1. Les listeners sont sur `window`, PAS sur le composant React
2. Le state est mis à jour EN CONTINU pendant le drag (pas au pointerUp)
3. `{ once: true }` sur pointerUp = auto-cleanup
4. `{ passive: true }` sur pointermove = performance
5. PAS de translateX — le composant re-render avec les nouvelles positions
6. PAS de setPointerCapture
7. PAS de dragPx state — pas de feedback visuel temporaire
8. Le calcul utilise `initialX` capturé au pointerDown (closure stable)

## Fichiers à modifier
- `components/features/editor-v2/TrackBlock.tsx` — réécrire le drag
- `components/features/editor-v2/TracksPanel.tsx` — adapter les callbacks

## Fichiers à lire AVANT de coder
- https://www.remotion.dev/docs/player/drag-and-drop (pattern de référence)
- `components/features/editor-v2/TrackBlock.tsx` (code actuel)
- `components/features/editor-v2/TracksPanel.tsx` (callbacks actuels)
- `lib/store/useEditorV2Store.ts` (moveVideoClip)

## Ce que le drag doit faire

Scénario utilisateur :
1. Vidéo de 15 secondes importée
2. Trim du début à 5 secondes → le bloc vert commence à 5s sur la timeline
3. L'utilisateur drag le bloc de 5s vers 3s (vers la gauche de 2s)
4. Le bloc RESTE à 3s après le drag
5. La timeline montre : 0-3s noir, 3s-13s vidéo (qui joue la source de 5s à 15s)

Le timelineStart du clip passe de 0 à... attendons. La position du bloc
sur la timeline est `timelineStart + trimStart`. Si trimStart=5000 et
timelineStart=0, le bloc est à 5000ms. Si on drag vers la gauche de 2000ms,
le bloc doit aller à 3000ms. Donc `timelineStart + trimStart = 3000`,
ce qui veut dire `timelineStart = 3000 - 5000 = -2000`. MAIS timelineStart
ne peut pas être négatif !

### Option A : Permettre timelineStart négatif
Pas logique — le clip ne peut pas commencer avant le début de la timeline.

### Option B : Changer la sémantique
Le `startMs` du TrackBlock = position absolue sur la timeline.
Le drag modifie `startMs` directement.
`timelineStart` est calculé comme `startMs - trimStart`.
Si `startMs = 3000` et `trimStart = 5000`, alors `timelineStart = -2000`.

### Option C : Le bloc représente la SOURCE ENTIÈRE
Le bloc vert montre toute la durée source (0 à 15s) positionnée à `timelineStart`.
Le trim ne déplace PAS le bloc — il montre la zone active à l'intérieur.
Le drag déplace `timelineStart` (la position de la source entière).
Le trim change quelles parties de la source sont jouées.

Avec cette option :
- Le bloc source occupe 0 à 15000ms (timelineStart=0, duration=15000)
- Le trim active zone = trimStart(5000) à trimEnd(15000)
- Le bloc vert affiché = 5000 à 15000 (la zone active)
- La zone grise = 0 à 5000 (la zone trimmée)
- Drag du bloc entier = changer timelineStart
- Si on drag de -2000, timelineStart = -2000 → le bloc source va de -2000 à 13000
- La zone active = -2000+5000=3000 à -2000+15000=13000
- La zone grise = -2000 à 3000

C'est l'option C qui est correcte ! On DOIT permettre timelineStart négatif
pour pouvoir dragger un clip trimmé vers la gauche. Le clamp à 0 est le bug.

## Changements requis

1. `moveVideoClip` dans le store : RETIRER le `Math.max(0, ...)` clamp
   Le timelineStart PEUT être négatif si le clip est trimmé.
   Le clamp doit être sur la position VISIBLE (timelineStart + trimStart >= 0).

2. TrackBlock : réécrire avec le pattern Remotion (window listeners)

3. TracksPanel : adapter le callback onDrag pour passer les bonnes valeurs

## Contraintes
- Le drag doit être fluide (update continu pendant le move)
- Le bloc doit rester exactement où on le dépose
- Le trim doit continuer de fonctionner
- `npm run build` = succès
- Retirer TOUS les console.log de debug

## Definition of Done
- [ ] Dragger un clip vidéo vers la droite → le clip reste
- [ ] Dragger un clip trimmé vers la gauche → le clip reste
- [ ] Le trim fonctionne
- [ ] Le drag est fluide (pas de saccade)
- [ ] `npm run build` passe
- [ ] Pas de console.log
