# Amélioration qualité vidéo export — image floue + couleurs délavées

## Contexte
Les vidéos exportées par le Hub sont de qualité inférieure à ce qu'Instagram produit nativement.
Judith filme en portrait sur iPhone 12, mais la source arrive en 640x480 (mode selfie/FaceTime).
L'export upscale en 1080x1920 = 6.7x plus de pixels → image floue et pixelisée.
Les couleurs sont aussi délavées par rapport à la source.

## Specs actuelles

### Source iPhone (selfie mode)
- H.264 Constrained Baseline, 640x480, 47fps
- pix_fmt: yuvj420p (full range YUV)
- color_space/transfer/primaries: unknown (non taggué)
- Bitrate: 8.3 Mbps
- Audio: AAC LC, 48kHz, mono

### Export actuel
- H.264 High, 1080x1920, 30fps
- pix_fmt: yuvj420p
- color_space: bt709, transfer: iec61966-2-1 (sRGB)
- Bitrate: 5.6 Mbps (configuré à 8 Mbps mais variable)
- Upscaling 640x480 → 1080x1920 via canvas drawImage

## Problèmes identifiés

### 1. Résolution source trop basse
La caméra selfie iPhone 12 en mode FaceTime/WebRTC capture à 640x480.
Quand Judith filme directement dans Instagram, l'app utilise la caméra à 1080x1920.
Le Hub devrait capturer à la résolution native de la caméra.

**Investigation nécessaire :**
- Comment la vidéo est-elle capturée dans le Hub? Via `<input type="file" capture="user">`?
- Si oui, est-ce qu'on peut forcer une résolution plus haute?
- Ou est-ce que Judith filme d'abord avec l'app Caméra puis importe dans le Hub?
- Chercher dans le code comment `videoFile` arrive dans l'éditeur

### 2. Canvas drawImage détruit les couleurs
Le canvas 2D HTML utilise le profil sRGB par défaut. Les vidéos iPhone utilisent
souvent un gamut plus large (Display P3). Le passage par le canvas "clamp" les couleurs.

**Fix possible :**
- Utiliser `canvas.getContext('2d', { colorSpace: 'display-p3' })` si supporté
- Ou au minimum, s'assurer que le canvas préserve le full range YUV (yuvj420p)

### 3. Bitrate trop bas
- Source: 8.3 Mbps pour 640x480
- Export: 5.6 Mbps pour 1080x1920 (4x plus de pixels, moins de bitrate!)
- Augmenter le bitrate à au moins 12-15 Mbps pour 1080p

### 4. FPS réduit
- Source: 47fps → Export: 30fps
- Instagram supporte jusqu'à 60fps
- On pourrait garder le framerate source ou au moins 30fps (acceptable)

## Fichiers à lire
- Chercher comment la vidéo est importée/capturée : composants d'import, input file, etc.
- `lib/utils/exportWebCodecs.ts` — le pipeline d'export
- `lib/hooks/useVideoExport.ts` — le hook d'export

## Améliorations à implémenter

### Priorité 1 — Couleurs (fix rapide)
Dans `exportWebCodecs.ts`, quand on crée le canvas :
```typescript
// AVANT
const ctx = canvas.getContext('2d')!;

// APRÈS — préserver les couleurs P3 si disponible
const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) || canvas.getContext('2d')!;
```

### Priorité 2 — Bitrate (fix rapide)
Augmenter le bitrate vidéo de 8 Mbps à 12 Mbps :
```typescript
// AVANT
bitrate: 8_000_000

// APRÈS
bitrate: 12_000_000
```

### Priorité 3 — Ne pas upscaler si la source est plus petite
Si la source fait 640x480, l'export à 1080x1920 upscale et crée du flou.
Option A : Garder la résolution source (Instagram fera le scaling)
Option B : Downscaler à 720x1280 au lieu de 1080x1920 (moins de flou)
Option C : Adapter la résolution d'export à la source

Recommandation : adapter dynamiquement. Si source >= 1080 large, exporter en 1080x1920.
Si source < 1080, exporter à la résolution source la plus proche en 9:16.
```typescript
// Adapter W et H à la source au lieu de forcer 1080x1920
const sourceW = video.videoWidth;
const sourceH = video.videoHeight;
// Si portrait natif (ex: 1080x1920), utiliser tel quel
// Si paysage (ex: 640x480), calculer le meilleur crop 9:16
// Ne jamais upscaler au-delà de 2x
```

### Priorité 4 — Investiguer la capture vidéo
Si Judith utilise `<input type="file" capture="user">`, la résolution dépend du navigateur.
Safari iOS peut limiter la résolution en mode capture.
Alternative : utiliser `navigator.mediaDevices.getUserMedia()` avec des contraintes
de résolution (`{ video: { width: 1080, height: 1920 } }`) pour capturer en full HD.

## Contraintes
- npm run build doit passer
- L'export doit fonctionner sur Safari iOS ET Chrome desktop
- Instagram accepte des vidéos de 540x960 minimum (pas besoin de forcer 1080x1920)
- La vidéo exportée ne doit pas dépasser ~100 MB (limite upload Firebase Storage)
