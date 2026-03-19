# EDITOR_SPEC.md
# Spécification complète — Éditeur vidéo
*Feature core — CapCut-level, UI Instagram-style*
*Version 1.0 — Mars 2026*

---

## Vision

> Un éditeur aussi puissant que CapCut,
> aussi simple et beau qu'Instagram.
> Conçu pour une acupunctrice, pas un monteur pro.

---

## Layout général (mobile, 375px)

```
┌─────────────────────────────────┐
│  ← Retour    00:05 / 00:32  ⚙️  │  ← Header (44px)
├─────────────────────────────────┤
│                                 │
│                                 │
│         Preview 9:16            │  ← Preview vidéo (~45vh)
│         (fond noir)             │
│                                 │
│  ▶  ⏸  (overlay center)        │
│                                 │
├─────────────────────────────────┤
│  [Trim][Filtres][Texte][Subs]   │  ← Onglets outils (48px)
│  [Audio][Images][Effets]        │
├─────────────────────────────────┤
│                                 │
│  Timeline (scrollable, 120px)   │  ← Timeline multi-track
│                                 │
├─────────────────────────────────┤
│       [Exporter →]              │  ← CTA export (50px)
└─────────────────────────────────┘
```

---

## Contrôles de lecture

### Bouton Play/Pause
- Position : centré sur la preview (overlay semi-transparent)
- Taille : 56×56px, fond rgba(0,0,0,0.5), border-radius 50%
- Icône : Heroicons `play-solid` / `pause-solid` (28px, blanc)
- Tap sur la preview = toggle play/pause
- Disparaît 2 secondes après le démarrage de la lecture
- Réapparaît au tap ou à la pause
- Timecode toujours visible dans le header : `00:05 / 00:32`
- Retour automatique au début à la fin du clip

```typescript
// Store Zustand
interface EditorStore {
  isPlaying: boolean
  currentTime: number    // secondes
  duration: number       // secondes
  trimStart: number      // secondes
  trimEnd: number        // secondes
  play: () => void
  pause: () => void
  seekTo: (time: number) => void
}
```

---

## Timeline multi-track

### Structure des tracks

```
Track 0 — Règle temporelle (markeurs 0s, 5s, 10s...)
Track 1 — Vidéo        (vert sage  #5C7A5F)
Track 2 — Audio        (violet     #AF52DE)
Track 3 — Textes       (bleu       #007AFF)
Track 4 — Sous-titres  (jaune      #FF9500)
Track 5 — Images       (rose       #FF2D55)
```

### Interactions mobiles

**Scroll horizontal**
- Pinch-to-zoom sur la timeline pour ajuster le zoom temporel
- Scroll horizontal pour naviguer dans le temps
- La règle temporelle et tous les tracks scrollent ensemble

**Playhead**
- Ligne blanche verticale traversant tous les tracks
- Draggable via Pointer Events + setPointerCapture
- Drag → seekTo() dans le store

**Éléments sur les tracks**
- Chaque élément (clip, overlay, segment) est un bloc coloré
- Poignées gauche/droite pour trimmer l'élément
- Drag horizontal pour repositionner dans le temps
- Long press → menu contextuel (Supprimer, Dupliquer, Propriétés)

**Déplacement entre tracks**
- Un overlay texte peut être glissé vers un autre rang
  (ex: texte 1 passe en-dessous de texte 2)
- Drag vertical entre les lignes de tracks

### Zoom de la timeline

```typescript
// Zoom : pixels par seconde
const ZOOM_LEVELS = {
  min: 20,    // 20px par seconde (vue large)
  default: 60, // 60px par seconde
  max: 200,   // 200px par seconde (vue détaillée)
}

// Largeur d'un élément = duration * zoomLevel
const clipWidth = clipDuration * zoomLevel
```

### Snap magnétique
- Les éléments s'accrochent aux bords des autres éléments
- Snap au playhead
- Snap aux marqueurs 5s, 10s...
- Threshold : 8px

---

## Audio — Édition complète

### Trim audio indépendant

```
Timeline audio :
[← fade in ═══════════════════ fade out →]
  ↑ poignée                        ↑ poignée
  début audio                      fin audio
```

- Poignée gauche : trim début (coupe le début de l'audio)
- Poignée droite : trim fin (coupe la fin de l'audio)
- Indépendant du trim vidéo
- L'audio peut commencer avant ou après la vidéo

### Fade in / Fade out

```typescript
interface AudioTrack {
  url: string
  startTime: number     // offset dans la vidéo (secondes)
  trimStart: number     // début dans le fichier audio
  trimEnd: number       // fin dans le fichier audio
  volume: number        // 0-1
  fadeIn: number        // durée du fade in (secondes, 0 = pas de fade)
  fadeOut: number       // durée du fade out (secondes, 0 = pas de fade)
}
```

**UI de fade :**
- Dans le panneau Audio, après import d'une piste
- Slider "Fade in" : 0 → 3 secondes (par 0.5s)
- Slider "Fade out" : 0 → 3 secondes (par 0.5s)
- Visualisation sur la timeline : zone dégradée au début/fin du bloc audio

**Rendu FFmpeg :**
```
afade=t=in:st=0:d={fadeIn},afade=t=out:st={end-fadeOut}:d={fadeOut}
```

**Rendu WebCodecs :**
Via AudioWorklet ou manipulation de l'AudioBuffer avec
rampe de gain (AudioContext.createGain() + linearRampToValueAtTime)

### Volumes indépendants

```
Audio original (voix) : ████████░░ 80%
Musique de fond :       ███░░░░░░░ 30%
```

- Slider voix : 0-100% → appliqué sur la track vidéo
- Slider musique : 0-100% → appliqué sur la track audio
- Les deux sont indépendants et appliqués à l'export

---

## Images — Import et placement

### Sources
- Pellicule iPhone (`<input accept="image/*">`)
- Photos capturées dans l'app (screenshot de la preview)
- Futur V3 : import depuis Canva, Unsplash

### Modes d'utilisation

**Mode overlay**
- L'image flotte par-dessus la vidéo
- Repositionnable (drag sur la preview)
- Redimensionnable (pinch sur la preview)
- Rotation (rotate gesture)
- Timing sur la timeline (apparaît entre t=3s et t=8s par exemple)

**Mode arrière-plan**
- Remplace le fond noir du format 9:16
- Utile pour les vidéos portrait qui ont des bandes noires en haut/bas
- Full screen, pas repositionnable

### Interface
```typescript
interface ImageOverlay {
  id: string
  url: string           // blob URL de l'image
  mode: 'overlay' | 'background'
  x: number            // ratio 0-1
  y: number            // ratio 0-1
  scale: number        // 1 = taille originale
  rotation: number     // degrés
  opacity: number      // 0-1
  startTime: number    // secondes
  endTime: number      // secondes
}
```

### Rendu à l'export (FFmpeg)
```
# Image overlay
-i video.mp4 -i overlay.png
-filter_complex "[0:v][1:v]overlay=x=100:y=200:enable='between(t,3,8)'"

# Image arrière-plan
-i background.jpg -i video.mp4
-filter_complex "[0:v][1:v]overlay=..."
```

---

## Transitions (architecture préparée pour V2)

### V1 — Coupe franche uniquement
Un seul clip → pas de transition nécessaire.
L'architecture store doit prévoir un tableau de clips pour V2.

```typescript
// V1 : clip unique
interface VideoTrack {
  clips: [VideoClip]   // tableau de 1 élément en V1
}

// V2 : multi-clip avec transitions
interface VideoTrack {
  clips: VideoClip[]
  transitions: Transition[]  // entre chaque paire de clips
}

interface Transition {
  type: 'cut' | 'fade' | 'wipe' | 'zoom'
  duration: number   // secondes
}
```

### V2 — Types de transitions prévus
- **Fondu enchaîné** (crossfade) : fondu entre deux clips
- **Coupe franche** : cut direct (défaut)
- **Wipe gauche/droite** : balayage horizontal
- **Zoom in/out** : zoom sur le centre

---

## Onglets de l'éditeur

```
[✂️ Trim] [🎨 Filtres] [Aa Texte] [💬 Subs] [🎵 Audio] [🖼️ Images]
```

### ✂️ Trim
- Slider début et fin du clip vidéo
- Preview de la frame sélectionnée
- Durée résultante affichée

### 🎨 Filtres
- Grille 3×3 de presets avec preview miniature
- Slider intensité (0-100%)
- Tap pour appliquer immédiatement (preview en temps réel)

### Aa Texte
- Liste des textes ajoutés avec preview
- Bouton "+" pour ajouter un nouveau texte
- Tap sur un texte → édition (police, taille, style, animation, timing)

### 💬 Sous-titres
- Bouton "Auto-générer" (Whisper)
- Liste des segments éditables
- Sélecteur de style (Classique, TikTok, Karaoké)
- Sliders position et taille

### 🎵 Audio
- Onglets : [Bibliothèque Jamendo] [Fichier local]
- Piste importée : waveform + sliders volume + fade
- Sliders : Volume voix / Volume musique

### 🖼️ Images
- Bouton "Importer depuis Photos"
- Toggle mode : Overlay / Arrière-plan
- Liste des images ajoutées avec timing

---

## Bouton Export

```
┌─────────────────────────────────┐
│  [↑ Exporter la vidéo]          │  ← pleine largeur, couleur accent
└─────────────────────────────────┘
```

- Toujours visible en bas de l'éditeur
- Tap → vérifie que la vidéo est prête (durée > 1s)
- Lance le pipeline d'export (WebCodecs → FFmpeg fallback)
- Affiche la progression
- Après export : propose "Sauvegarder dans le hub" ou "Publier"
