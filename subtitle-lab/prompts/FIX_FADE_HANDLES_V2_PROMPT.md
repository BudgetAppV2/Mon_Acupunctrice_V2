# FIX — Fade handles audio : même modèle que les trim handles vidéo

## Problème
Les fade handles dans `AudioWaveform.tsx` ne réagissent plus au toucher sur mobile.
Les handles sont des barres de 3px de large dans une zone de 8px — trop petites pour iOS.
Les trim handles des clips vidéo dans `TrackBlock.tsx` fonctionnent bien car elles font
28px de large (`w-7`) avec un fond visible.

## Solution
Remplacer les fade handles dans `AudioWaveform.tsx` par le même pattern que les trim
handles de `TrackBlock.tsx` :

### Modèle à suivre (TrackBlock.tsx — trim handles)
```tsx
{selected && onTrimChange && (<>
  <div className="absolute left-0 top-0 bottom-0 w-7 cursor-col-resize
    flex items-center justify-center bg-emerald-400/40 rounded-l"
    style={{ touchAction: 'none' }}
    onPointerDown={e => onTrimDown('left', e)}
    onPointerMove={onTrimMove}
    onPointerUp={onTrimUp}>
    <div className="w-0.5 h-3 bg-emerald-300 rounded-full" />
  </div>
  <div className="absolute right-0 top-0 bottom-0 w-7 cursor-col-resize
    flex items-center justify-center bg-emerald-400/40 rounded-r"
    style={{ touchAction: 'none' }}
    onPointerDown={e => onTrimDown('right', e)}
    onPointerMove={onTrimMove}
    onPointerUp={onTrimUp}>
    <div className="w-0.5 h-3 bg-emerald-300 rounded-full" />
  </div>
</>)}
```

### Changements dans AudioWaveform.tsx

1. **Remplacer les handles actuelles** (barres amber de 3px dans une zone de 8px) par des
   zones de 28px (`w-7`) avec fond `bg-amber-400/40` (amber au lieu de emerald pour
   différencier de la vidéo)

2. **Les handles utilisent des events pointer** identiques au TrackBlock :
   - `onPointerDown` sur chaque handle (pas sur le container)
   - `onPointerMove` sur chaque handle (pas sur le container parent)
   - `onPointerUp` sur chaque handle
   - `touchAction: 'none'` sur chaque handle
   - `setPointerCapture` dans le onPointerDown

3. **Positionnement** : les handles sont positionnées à `left: fadeInPx` (handle gauche)
   et `right: fadeOutPx` (handle droite), exactement comme maintenant mais avec la
   taille et le style du TrackBlock

4. **Toujours visibles** quand `onFadeChange` est fourni (pas besoin de "selected" car
   le waveform est déjà dans un clip sélectionné)

### Code des nouvelles handles
```tsx
{duration > 0 && onFadeChange && (<>
  <div className="absolute top-0 bottom-0 w-7 cursor-col-resize z-10
    flex items-center justify-center bg-amber-400/30 rounded-l"
    style={{ left: Math.max(0, fadeInPx - 14), touchAction: 'none' }}
    onPointerDown={e => onHandleDown('in', e)}
    onPointerMove={onHandleMove}
    onPointerUp={onHandleUp}>
    <div className="w-0.5 h-3 bg-amber-300 rounded-full" />
  </div>
  <div className="absolute top-0 bottom-0 w-7 cursor-col-resize z-10
    flex items-center justify-center bg-amber-400/30 rounded-r"
    style={{ right: Math.max(0, fadeOutPx - 14), touchAction: 'none' }}
    onPointerDown={e => onHandleDown('out', e)}
    onPointerMove={onHandleMove}
    onPointerUp={onHandleUp}>
    <div className="w-0.5 h-3 bg-amber-300 rounded-full" />
  </div>
</>)}
```

5. **Le drag logic** (`onHandleDown`, `onHandleMove`, `onHandleUp`) reste identique —
   c'est la même logique de calcul delta. Juste s'assurer que `setPointerCapture` est
   appelé et que chaque handle a son propre `onPointerMove` + `onPointerUp`.

## Tests
- [ ] Sur iPhone, les fade handles sont visibles (fond amber semi-transparent)
- [ ] On peut drag les handles au toucher (28px de zone tactile)
- [ ] Le waveform se redessine en temps réel pendant le drag
- [ ] Le fade audio s'applique pendant le playback
