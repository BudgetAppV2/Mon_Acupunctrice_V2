# Multi-clip M4 — Export multi-clip

## Contexte
M1-M3 ont mis en place le store multi-clip, la timeline, la preview séquentielle,
et les interactions (réordonnement, split, suppression). M4 ferme la boucle :
l'export produit une vidéo finale en concaténant tous les clips en séquence.

## Stack
Next.js 15, TypeScript, Zustand, WebCodecs API, mp4-muxer, Web Audio API.

## Ce qui existe (post-M3)

### Store
- `clips: VideoClip[]` ordonnés, chacun avec file, trimStart, trimEnd, timelineStart
- Guard dans `useVideoExport.ts` : si `clips.length > 1` → message d'erreur

### exportWebCodecs.ts (single-clip)
- Seek-based loop sur UN seul fichier
- Extraction audio via Web Audio API (fallback FFmpeg)
- H.264 High Profile, 3.5 Mbps, 30 fps, keyframe chaque 1s

### useVideoExport.ts
- Extraction audio via FFmpeg ou Web Audio API
- Upload résumable vers Storage

## Livrables attendus

### 1. Retirer le guard multi-clip

**Fichier :** `lib/hooks/useVideoExport.ts`

Retirer le bloc qui bloque l'export si `clips.length > 1`.

### 2. Modifier exportWithWebCodecs pour multi-clip

**Fichier :** `lib/utils/exportWebCodecs.ts`

Changer la signature pour accepter un tableau de clips :
```typescript
export async function exportWithWebCodecs(
  clips: { file: File; trimStart: number; trimEnd: number; blobUrl: string }[],
  onProgress: (p: number) => void,
  filterCss?: string,
  overlays?: TextOverlayItem[],
  subtitles?: SubtitleSegment[],
  subtitleStyle?: string,
  audioBlobs?: (Blob | null)[],   // un audio blob par clip
): Promise<Blob>
```

**Logique du seek loop multi-clip :**
```
totalFrames = somme des frames de tous les clips
frameCounter = 0

pour chaque clip:
  créer un <video> element avec clip.file
  attendre canplaythrough
  
  clipFrames = Math.ceil((clip.trimEnd - clip.trimStart) * FPS)
  pour chaque frame du clip:
    video.currentTime = clip.trimStart + (frameIndex / FPS)
    attendre seeked
    dessiner sur le canvas
    dessiner overlays/sous-titres au temps GLOBAL (frameCounter / FPS)
    encoder le frame avec timestamp GLOBAL
    frameCounter++
    onProgress(Math.round(frameCounter / totalFrames * 100))
  
  cleanup video element
```

**Points importants :**
- Les timestamps des VideoFrame sont en temps GLOBAL (continu, pas remis à 0 entre les clips)
- Les overlays/sous-titres utilisent le temps global pour le positionnement
- Un seul VideoEncoder et Muxer pour toute la vidéo (pas un par clip)
- Chaque clip crée un `<video>` temporaire (pas besoin de réutiliser)
- Le canvas est réutilisé entre les clips

### 3. Audio multi-clip

**Fichier :** `lib/hooks/useVideoExport.ts`

Extraire l'audio de CHAQUE clip séparément :
```
pour chaque clip:
  extraire l'audio via Web Audio API (ou FFmpeg)
  → audioBlobs[i]
```

**Fichier :** `lib/utils/exportWebCodecs.ts`

Encoder l'audio clip par clip :
```
pour chaque clip:
  décoder audioBlobs[i]
  encoder les échantillons avec des timestamps GLOBAUX continus
```

**Alternative plus simple :** Concaténer tous les audioBlobs en un seul buffer
avant l'encodage. Décoder chaque blob, copier les samples dans un grand
Float32Array, puis encoder en une seule passe.

### 4. Modifier useVideoExport pour multi-clip

**Fichier :** `lib/hooks/useVideoExport.ts`

Au lieu de passer `s.videoFile` et `s.trimStart/End`, passer `s.clips` :
```typescript
const clips = s.clips.filter(c => c.file); // seulement les clips avec un fichier

// Extraire l'audio de chaque clip
const audioBlobs = await Promise.all(clips.map(async (clip) => {
  try {
    const ac = new AudioContext({ sampleRate: 48000 });
    const buf = await clip.file!.arrayBuffer();
    const decoded = await ac.decodeAudioData(buf);
    await ac.close();
    // Encoder en WAV
    // ... (réutiliser le pattern existant)
    return wavBlob;
  } catch { return null; }
}));

const blob = await exportWithWebCodecs(clips, setProgress, filterCss, ...);
```

### 5. Seuil WebCodecs vs FFmpeg pour multi-clip

Le seuil actuel est `fileSizeMB < 100`. Pour multi-clip, calculer la taille
totale de tous les clips :
```typescript
const totalSizeMB = s.clips.reduce((sum, c) => sum + (c.file?.size ?? 0), 0) / (1024 * 1024);
const useWC = supportsWebCodecs && !s.audioUrl && totalSizeMB < 100;
```

Si le total dépasse 100MB, utiliser FFmpeg (pipeline complet avec concat).

### 6. Nettoyage mémoire renforcé

Après l'export de chaque clip, libérer les ressources :
- `video.removeAttribute('src'); video.load();`
- `URL.revokeObjectURL(blobUrl)` pour les `<video>` temporaires
- Ne PAS révoquer les blobUrl des clips du store (ils sont encore utilisés)

À la fin de l'export total :
- `canvas.width = 0; canvas.height = 0;`
- Tous les audioBlobs → null

## Contraintes
- NE PAS modifier le store (M1)
- NE PAS modifier la timeline ou les interactions (M2/M3)
- Le format de sortie reste MP4 H.264 3.5 Mbps
- Les overlays et sous-titres utilisent le temps GLOBAL
- Rétrocompatible : un seul clip exporte identiquement à avant
- L'export single-clip ne doit pas régresser en performance
- Nettoyage mémoire critique pour iPhone (plusieurs vidéos en mémoire)
- Si un clip n'a pas de `file` (restauré depuis Firestore sans download), skip ou erreur claire

## Definition of Done
- [ ] L'export concatène N clips en une seule vidéo MP4
- [ ] Le guard multi-clip est retiré
- [ ] Les timestamps sont continus (pas de saut entre les clips)
- [ ] L'audio de chaque clip est inclus dans l'export
- [ ] Les overlays/sous-titres sont positionnés correctement en temps global
- [ ] Un seul clip exporte identiquement à avant (pas de régression)
- [ ] La mémoire est nettoyée entre chaque clip
- [ ] Le seuil WebCodecs/FFmpeg prend en compte la taille totale
- [ ] Erreur claire si un clip n'a pas de fichier source
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence
- `CLAUDE.md`
- `project-docs/02_ROADMAP/MULTICLIP_PLAN.md`
- `lib/utils/exportWebCodecs.ts` (export actuel single-clip)
- `lib/hooks/useVideoExport.ts` (orchestrateur)
- `lib/store/useEditorStore.ts` (store multi-clip)
- `lib/types/editor.ts` (VideoClip)
