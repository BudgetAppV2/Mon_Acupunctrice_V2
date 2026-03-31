# FIX-5 — Sheets Texte et Cover (fonctionnels)

## Contexte
Les sheets Texte et Cover sont des placeholders. On les rend fonctionnels
avec une version simplifiee adaptee au Lab (pas de Firebase, pas de fonts
custom, pas d'animations complexes).

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3, @heroicons/react.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/app/page.tsx` → sheets 'text' et 'cover' (placeholders)
- `subtitle-lab/lib/store.ts` → tracks[], types, actions existantes
- `subtitle-lab/lib/types.ts` → types existants (SubtitleBlock, etc.)
- `subtitle-lab/components/SubtitleCanvas.tsx` → RAF loop, renderFrame
- `subtitle-lab/lib/renderer.ts` → renderFrame, renderBlock

**Reference hub (lire pour comprendre, pas copier tel quel) :**
- `components/features/editor/panels/TextPanel.tsx` → liste overlays + ajout
- `components/features/editor/panels/TextEditView.tsx` → edition overlay
- `components/features/editor/panels/CoverPanel.tsx` → slider frame + upload
- `lib/types/editor.ts` → TextOverlayItem interface

---

## Livrable 1 — Type TextOverlay et store

**Fichier :** `subtitle-lab/lib/types.ts`

```typescript
export interface TextOverlay {
  id: string;
  text: string;
  x: number;           // 0-1, position relative (centre)
  y: number;           // 0-1, position relative (centre)
  fontSize: number;    // px (sur le canvas 540x960)
  color: string;       // hex
  startMs: number;     // quand afficher
  endMs: number;       // quand masquer
}
```

**Fichier :** `subtitle-lab/lib/store.ts`

Ajouter au store :
```typescript
textOverlays: TextOverlay[];
addTextOverlay: () => void;
updateTextOverlay: (id: string, changes: Partial<TextOverlay>) => void;
removeTextOverlay: (id: string) => void;
selectedOverlayId: string | null;
selectOverlay: (id: string | null) => void;
```

`addTextOverlay` cree un overlay avec des valeurs par defaut :
```typescript
{ id: crypto.randomUUID(), text: 'Texte', x: 0.5, y: 0.5,
  fontSize: 36, color: '#ffffff',
  startMs: currentTime, endMs: Math.min(currentTime + 3000, duration) }
```

---

## Livrable 2 — TextPanel.tsx (sheet Texte)

**Nouveau fichier :** `subtitle-lab/components/TextPanel.tsx`

Deux vues :

**Vue liste** (quand aucun overlay selectionne) :
- Bouton "+ Ajouter texte" en haut
- Liste des overlays existants, tries par startMs
- Chaque item montre le texte tronque + le timing
- Tap → selectionne l'overlay

**Vue edition** (quand un overlay est selectionne) :
- Bouton retour (ArrowLeftIcon)
- Input texte (le texte de l'overlay)
- Slider taille (12-72px)
- Couleur : grille de 8 pastilles (blanc, noir, rouge, bleu, vert,
  jaune, orange, rose)
- Sliders debut/fin (0 a duration, step 100ms)
- Bouton supprimer (TrashIcon)

---

## Livrable 3 — Rendu des overlays texte dans le canvas

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Dans le RAF loop, APRES renderFrame (sous-titres) et APRES ctx.filter = 'none',
dessiner les text overlays :
```typescript
// Dessiner les text overlays
const overlays = textOverlaysRef.current;
for (const o of overlays) {
  if (timeRef.current < o.startMs || timeRef.current > o.endMs) continue;
  ctx.save();
  ctx.font = `bold ${o.fontSize}px sans-serif`;
  ctx.fillStyle = o.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Ombre pour lisibilite
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillText(o.text, o.x * CANVAS_W, o.y * CANVAS_H);
  ctx.restore();
}
```

Ajouter les refs necessaires :
```typescript
const textOverlaysRef = useRef(textOverlays);
useEffect(() => { textOverlaysRef.current = textOverlays; }, [textOverlays]);
```

Les text overlays apparaissent aussi dans le sheet Tracks comme des blocs
sur une piste "Texte" (ou sur la piste sous-titres si on ne veut pas
ajouter une 4e piste). Pour V1 : les afficher sur la piste sous-titres
en couleur differente (violet/rose au lieu de bleu).

---

## Livrable 4 — CoverPanel.tsx (sheet Cover)

**Nouveau fichier :** `subtitle-lab/components/CoverPanel.tsx`

Le cover est la vignette qui represente la video (sur Instagram par exemple).
C'est une frame de la video a un moment choisi.

**UI :**
- Vignette preview (64px de large, ratio 9:16)
- Slider de frame : 0 a duration (ms), step 100ms
- Quand le slider change : seek la video a cette position,
  capturer la frame dans un canvas 270x480 en JPEG
- Stocker le dataURL dans le store

**Pas de Firebase dans le Lab** — le cover est en memoire seulement.
En Phase B, on ajoutera l'upload vers Firebase Storage.

**Fichier :** `subtitle-lab/lib/store.ts`

Ajouter :
```typescript
coverFrameMs: number;        // position de la frame choisie
coverDataUrl: string | null; // dataURL de la vignette
setCoverFrame: (ms: number, dataUrl: string) => void;
```

**Le CoverPanel cree un element video CACHE** pour la capture de frame
(comme le hub). Il ne touche PAS le videoRef du canvas principal.

```typescript
const coverVidRef = useRef<HTMLVideoElement>(null);
useEffect(() => {
  const vid = coverVidRef.current;
  if (vid && videoUrl) vid.src = videoUrl;
}, [videoUrl]);

const captureFrame = () => {
  const vid = coverVidRef.current;
  if (!vid || vid.readyState < 2) return;
  const c = document.createElement('canvas');
  c.width = 270; c.height = 480;
  const ctx = c.getContext('2d')!;
  // Cover crop (meme logique que coverCrop dans playback.ts)
  const { sx, sy, sw, sh } = coverCrop(vid.videoWidth, vid.videoHeight, 270, 480);
  ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, 270, 480);
  const url = c.toDataURL('image/jpeg', 0.8);
  if (url.length > 100) setCoverFrame(Math.round(vid.currentTime * 1000), url);
};

// Quand le slider change, seek la video cachee et capturer
const handleSlider = (ms: number) => {
  const vid = coverVidRef.current;
  if (!vid) return;
  vid.currentTime = ms / 1000;
  vid.addEventListener('seeked', () => setTimeout(captureFrame, 100), { once: true });
};
```

---

## Livrable 5 — Remplacer les placeholders dans page.tsx

**Fichier :** `subtitle-lab/app/page.tsx`

Remplacer les bottom sheets placeholder par les vrais composants :
```tsx
// AVANT :
<BottomSheet isOpen={activeSheet === 'text'} ...>
  <div>...bientot disponible...</div>
</BottomSheet>

// APRES :
<BottomSheet isOpen={activeSheet === 'text'} ...>
  <TextPanel />
</BottomSheet>
```

Meme chose pour Cover.

---

## Contraintes
- NE PAS modifier le renderer.ts (les text overlays sont dessines
  dans SubtitleCanvas, pas dans renderer)
- NE PAS ajouter de fonts custom (juste sans-serif pour V1)
- NE PAS implementer Firebase pour le cover (dataURL local seulement)
- Le cover video element est CACHE et SEPARE du preview principal
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Ajouter un texte overlay fonctionne (input + bouton +)
- [ ] Le texte apparait sur le canvas au bon moment (startMs/endMs)
- [ ] Slider taille, couleur (8 pastilles), timing fonctionnent
- [ ] Supprimer un overlay fonctionne
- [ ] Le slider de frame cover capture une vignette
- [ ] La vignette cover est visible dans le sheet Cover
- [ ] Les composants TextPanel et CoverPanel remplacent les placeholders
- [ ] `npm run build` passe
