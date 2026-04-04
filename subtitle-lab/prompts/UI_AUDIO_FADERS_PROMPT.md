# UI — Faders audio verticaux style console de mixage

## Contexte
Le `AudioSheet.tsx` a actuellement des sliders horizontaux pour Voix et Musique.
On veut les remplacer par des faders verticaux inspirés des consoles de mixage audio,
plus intuitifs (haut = fort) et plus touchables sur mobile.

## Design cible

### Layout quand audio est chargé
```
┌─────────────────────────────────┐
│  Audio                          │
│  🎵 nom-du-fichier.mp3     [x] │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │    100%   │  │    100%  │    │
│  │    ┃┃     │  │    ┃┃    │    │
│  │    ┃┃     │  │    ┃┃    │    │
│  │    ┃█     │  │    ┃█    │    │
│  │    ┃┃     │  │    ┃┃    │    │
│  │    ┃┃     │  │    ┃┃    │    │
│  │    0%     │  │    0%    │    │
│  │   Voix    │  │  Musique │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  Fade in [====]  Fade out [===] │
│  Auto-ducking  [toggle]         │
└─────────────────────────────────┘
```

### Composant VerticalFader
Créer un composant réutilisable `VerticalFader` dans `AudioSheet.tsx` (ou fichier séparé).

#### Specs techniques
- Hauteur : `h-32` (128px) — assez grand pour être précis au toucher
- Largeur : `w-12` (48px) — zone tactile confortable
- Track : barre verticale fine (2-3px), `bg-white/10`, centrée
- Track remplie : du bas au thumb, en couleur `bg-emerald-400` (pour Voix) ou `bg-amber-400` (pour Musique)
- Thumb : rectangle horizontal style fader (`w-10 h-3`), `bg-white/90`, `rounded-sm`
  avec une fine ligne centrale `bg-white/40` (comme les vrais faders)
- Le thumb doit avoir `box-shadow` pour un effet 3D subtil

#### Interaction
- Utiliser un `<input type="range">` avec CSS pour le rendre vertical via
  `writing-mode: vertical-lr` + `direction: rtl` (pour que haut = max)
  OU utiliser `transform: rotate(-90deg)` dans un container fixe
- **Alternative recommandée** : custom touch/pointer handler (comme les trim handles)
  pour un contrôle total du style et du comportement tactile :
  ```tsx
  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 0) return;
    updateFromPointer(e);
  };
  const updateFromPointer = (e: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const y = 1 - (e.clientY - rect.top) / rect.height; // haut = 1, bas = 0
    onChange(Math.max(0, Math.min(1, y)));
  };
  ```
  Ceci donne un contrôle total sur le rendu et évite les inconsistances
  des `<input type="range">` verticaux entre navigateurs.

#### Style du thumb (fader knob)
```tsx
{/* Thumb — rectangle style console de mixage */}
<div className="absolute w-10 h-3 left-1/2 -translate-x-1/2 rounded-sm
  bg-gradient-to-b from-white/95 to-white/80
  shadow-[0_1px_3px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]"
  style={{ bottom: `${value * 100}%`, transform: 'translate(-50%, 50%)' }}>
  {/* Ligne centrale du fader */}
  <div className="absolute top-1/2 left-2 right-2 h-px bg-white/30" />
</div>
```

#### Labels et valeur
- Label en bas du fader : "Voix" ou "Musique" en `text-[10px] text-white/40`
- Pourcentage en haut : `text-[10px] text-white/30`
- Couleur de la track remplie : emerald pour Voix, amber pour Musique
  (cohérent avec les couleurs des tracks dans TracksPanel)

### Changements dans AudioSheet.tsx

1. **Remplacer `SliderRow` pour Voix et Musique** par 2 `VerticalFader` côte à côte
   dans un `flex gap-4 justify-center` container
2. **Garder les `FadeSlider` horizontaux** pour fadeIn/fadeOut (ils sont bien en horizontal)
3. **Garder le toggle auto-ducking** tel quel

### Props du VerticalFader
```tsx
interface VerticalFaderProps {
  label: string;           // "Voix" ou "Musique"
  value: number;           // 0-1
  onChange: (v: number) => void;
  color?: string;          // 'emerald' | 'amber'
}
```

## Fichiers à modifier
- `components/features/editor-v2/AudioSheet.tsx` — remplacer SliderRow par VerticalFader

## Tests
- [ ] Les 2 faders verticaux sont visibles côte à côte
- [ ] On peut drag le thumb verticalement au toucher sur iPhone
- [ ] Haut = 100%, Bas = 0%
- [ ] Le pourcentage s'affiche en haut du fader
- [ ] La track remplie change de couleur (emerald/amber)
- [ ] Les valeurs sont connectées à voiceVolume/audioVolume dans le store
