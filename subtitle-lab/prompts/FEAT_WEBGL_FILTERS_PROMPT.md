# FEAT — WebGL Filters pour le rendu vidéo (Test sur Lab)

## Contexte
Safari iOS ne supporte PAS `ctx.filter` sur Canvas 2D (disabled by default
sur toutes les versions, y compris Safari 26.5). On doit utiliser WebGL
pour appliquer les filtres (brightness, contrast, saturation, sepia,
grayscale, hue-rotate) sur la vidéo. WebGL est GPU-accelerated et
fonctionne partout.

## Architecture cible
Deux canvas superposés :
1. **Canvas WebGL** — dessine la vidéo avec les filtres via fragment shader
2. **Canvas 2D** (transparent) par-dessus — dessine les sous-titres/overlays

```
<div style="aspect-ratio: 9/16">
  <canvas id="webgl-canvas" />  <!-- vidéo + filtres -->
  <canvas id="overlay-canvas" /> <!-- sous-titres, transparent -->
</div>
```

## Shaders GLSL

### Vertex Shader (simple passthrough)
```glsl
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
```

### Fragment Shader (tous les filtres)
```glsl
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_brightness;  // -1 to 1 (0 = no change)
uniform float u_contrast;    // -1 to 1 (0 = no change)
uniform float u_saturation;  // -1 to 1 (0 = no change)
uniform float u_sepia;       // 0 to 1
uniform float u_grayscale;   // 0 to 1
uniform float u_hueRotate;   // degrees (0 = no change)

void main() {
  vec4 texel = texture2D(u_image, v_texCoord);
  vec3 color = texel.rgb;

  // Brightness: add/subtract
  color += u_brightness;

  // Contrast: scale around 0.5
  color = 0.5 + (1.0 + u_contrast) * (color - 0.5);

  // Saturation: mix with grayscale
  const vec3 luminosity = vec3(0.2126, 0.7152, 0.0722);
  vec3 gray = vec3(dot(color, luminosity));
  color = mix(gray, color, 1.0 + u_saturation);

  // Grayscale: blend toward gray
  if (u_grayscale > 0.0) {
    vec3 g = vec3(dot(color, luminosity));
    color = mix(color, g, u_grayscale);
  }

  // Sepia: apply sepia matrix
  if (u_sepia > 0.0) {
    vec3 sepiaColor = vec3(
      dot(color, vec3(0.393, 0.769, 0.189)),
      dot(color, vec3(0.349, 0.686, 0.168)),
      dot(color, vec3(0.272, 0.534, 0.131))
    );
    color = mix(color, sepiaColor, u_sepia);
  }

  // Hue rotation (simplified RGB rotation)
  if (abs(u_hueRotate) > 0.1) {
    float angle = u_hueRotate * 3.14159265 / 180.0;
    float cosA = cos(angle);
    float sinA = sin(angle);
    mat3 hueMatrix = mat3(
      0.213 + cosA * 0.787 - sinA * 0.213,
      0.213 - cosA * 0.213 + sinA * 0.143,
      0.213 - cosA * 0.213 - sinA * 0.787,
      0.715 - cosA * 0.715 - sinA * 0.715,
      0.715 + cosA * 0.285 + sinA * 0.140,
      0.715 - cosA * 0.715 + sinA * 0.715,
      0.072 - cosA * 0.072 + sinA * 0.928,
      0.072 - cosA * 0.072 - sinA * 0.283,
      0.072 + cosA * 0.928 + sinA * 0.072
    );
    color = hueMatrix * color;
  }

  // Clamp to valid range
  color = clamp(color, 0.0, 1.0);
  gl_FragColor = vec4(color, texel.a);
}
```

## Conversion des filtres CSS en uniforms WebGL

Les filtres actuels dans `lib/editor-v2/filters.ts` utilisent des
strings CSS comme `brightness(1.05) contrast(1.1) saturate(1.2) sepia(0.1)`.

Il faut créer une fonction qui parse ces strings CSS et retourne
les uniforms WebGL correspondants :

```typescript
interface WebGLFilterUniforms {
  brightness: number;  // CSS 1.0 = no change → uniform 0.0
  contrast: number;    // CSS 1.0 = no change → uniform 0.0
  saturation: number;  // CSS 1.0 = no change → uniform 0.0
  sepia: number;       // CSS 0.0 = no change → uniform 0.0
  grayscale: number;   // CSS 0.0 = no change → uniform 0.0
  hueRotate: number;   // CSS 0deg = no change → uniform 0.0
}

function cssFilterToUniforms(css: string, intensity: number): WebGLFilterUniforms {
  // Parse "brightness(1.05) contrast(1.1) saturate(1.2) sepia(0.1)"
  // Apply intensity interpolation
  // Return uniforms
}
```

Mapping CSS → uniform :
- `brightness(1.05)` → `u_brightness = (1.05 - 1.0) * intensity = 0.05 * intensity`
- `contrast(1.1)` → `u_contrast = (1.1 - 1.0) * intensity = 0.1 * intensity`
- `saturate(1.2)` → `u_saturation = (1.2 - 1.0) * intensity = 0.2 * intensity`
- `sepia(0.1)` → `u_sepia = 0.1 * intensity`
- `grayscale(1)` → `u_grayscale = 1.0 * intensity`
- `hue-rotate(10deg)` → `u_hueRotate = 10.0 * intensity`

## Implémentation dans le Lab

### Nouveau fichier: `subtitle-lab/lib/webglRenderer.ts`
Ce module gère :
1. Initialiser le context WebGL
2. Compiler les shaders
3. Créer la texture vidéo
4. Fonction `renderVideoFrame(video, uniforms)` qui :
   - Upload la frame vidéo comme texture (`texImage2D`)
   - Set les uniforms
   - Draw le quad
5. Fonction `cssFilterToUniforms(css, intensity)` pour convertir

### Modifier: `subtitle-lab/components/SubtitleCanvas.tsx`
- Remplacer le canvas 2D unique par deux canvas superposés
- Canvas WebGL pour la vidéo + filtres (dessine avec le shader)
- Canvas 2D transparent pour les sous-titres (garde le renderer actuel)
- Le RAF loop :
  1. Upload la frame vidéo dans la texture WebGL
  2. Set les uniforms du filtre actif
  3. Draw le quad WebGL
  4. Clear le canvas 2D overlay
  5. Appeler renderFrame() sur le canvas overlay (skipBackground: true)

### CoverCrop dans le shader
Le coverCrop actuel calcule sx, sy, sw, sh pour le drawImage.
Avec WebGL, on fait ça dans les coordonnées de texture :
```typescript
// Au lieu de drawImage(vid, sx, sy, sw, sh, 0, 0, cw, ch)
// On calcule les UV coordinates qui correspondent au crop
const uLeft = sx / vid.videoWidth;
const uRight = (sx + sw) / vid.videoWidth;
const vTop = sy / vid.videoHeight;
const vBottom = (sy + sh) / vid.videoHeight;
// Passer ces UVs au buffer de texture coordinates
```

## Test dans le Lab
Le Lab est déployé sur https://subtitle-lab.vercel.app
Tester :
1. Capturer une vidéo ou en importer une
2. Aller dans l'onglet Filtres
3. Sélectionner un filtre (Chaud, Froid, Vintage, N&B, etc.)
4. Vérifier que le filtre s'applique VISUELLEMENT sur la vidéo
5. Tester le slider d'intensité
6. Vérifier sur Safari iOS (iPhone)

## Fichiers à créer/modifier dans le Lab
- `subtitle-lab/lib/webglRenderer.ts` — NOUVEAU : module WebGL
- `subtitle-lab/components/SubtitleCanvas.tsx` — modifier pour utiliser WebGL
- `subtitle-lab/lib/filters.ts` — ajouter `cssFilterToUniforms()`

## Definition of Done
- [ ] Le canvas WebGL dessine la vidéo
- [ ] Les filtres s'appliquent via le fragment shader
- [ ] Le slider d'intensité fonctionne
- [ ] Les sous-titres se dessinent sur le canvas 2D par-dessus
- [ ] Le coverCrop fonctionne (vidéo paysage recadrée en portrait)
- [ ] Pas de régression sur le scrubbing
- [ ] Fonctionne sur Safari iOS (iPhone)
- [ ] npm run build passe (dans subtitle-lab/)
