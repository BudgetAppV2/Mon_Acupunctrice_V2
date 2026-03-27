# P2.1 — Export Worker OffscreenCanvas

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Apres Phase 0 et Phase 1, l'export video fonctionne via WebCodecs seek-based dans
`exportWebCodecs.ts` sur le main thread. L'UI freeze pendant l'export (30-90s).
Ce prompt deplace le rendering d'export dans un Web Worker avec OffscreenCanvas
pour garder l'UI reactive pendant l'export.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, WebCodecs, mp4-muxer.

## Fichiers a lire AVANT de commencer
- `lib/utils/exportWebCodecs.ts` → 127 lignes. Pipeline export seek-based complet : VideoEncoder + AudioEncoder + mp4-muxer. Utilise `drawTextOverlays` (ligne 84) et `drawSubtitles` (ligne 85). Canvas 1080x1920, 30fps, H.264 8Mbps.
- `lib/hooks/useVideoExport.ts` → 134 lignes. Orchestrateur export : prepare audio (FFmpeg ou Web Audio fallback), appelle `exportWithWebCodecs`, upload Firebase Storage. Etats : idle/preparing/exporting/uploading/done/error.
- `lib/utils/drawOverlays.ts` → 63 lignes. `drawTextOverlays(ctx, overlays, time, w, h)` — dessine les overlays texte avec wrapText.
- `lib/utils/drawSubtitles.ts` → 60 lignes. `drawSubtitles(ctx, subtitles, style, time, w, h)` — dessine les sous-titres (classic, tiktok, karaoke, bold_outline, pill, karaoke_pro).
- `lib/utils/fontLoader.ts` → 34 lignes. `loadFont(family)` charge une Google Font via `document.fonts.load()`. ATTENTION : `document.fonts` n'existe PAS dans un Worker.
- `lib/store/useEditorStore.ts` → 241 lignes. Store Zustand avec tous les champs editeur : filter, overlays, subtitles, subtitleStyle, trimStart/trimEnd, audioUrl, etc.
- `lib/types/editor.ts` → 63 lignes. `TextOverlayItem`, `SubtitleSegment`, `SubtitleStyle`, `VideoClip`.

---

## Livrable 1 — Creer le Web Worker d'export

**Fichier a creer :** `lib/workers/exportWorker.ts`

Le Worker recoit un message avec toutes les donnees necessaires et execute
l'export complet. Il renvoie la progression et le Blob final.

```typescript
// Types des messages Worker
interface ExportWorkerInput {
  type: 'start';
  videoData: ArrayBuffer;        // file.arrayBuffer() transfere
  trimStart: number;
  trimEnd: number;
  filterCss: string;
  overlays: TextOverlayItem[];   // serialisable (pas de functions)
  subtitles: SubtitleSegment[];
  subtitleStyle: string;
  audioData: ArrayBuffer | null; // audioBlob.arrayBuffer() transfere
}

interface ExportWorkerProgress {
  type: 'progress';
  percent: number;
}

interface ExportWorkerDone {
  type: 'done';
  blob: ArrayBuffer;             // Blob.arrayBuffer() transfere
}

interface ExportWorkerError {
  type: 'error';
  message: string;
}
```

**Logique du Worker :**
1. Recevoir le message `start` avec les ArrayBuffers transferes
2. Creer un `OffscreenCanvas(1080, 1920)` directement dans le Worker
3. Charger la video depuis l'ArrayBuffer : creer un Blob → URL.createObjectURL → video element
   ATTENTION : `document.createElement('video')` n'existe PAS dans un Worker.
   Utiliser plutot `VideoDecoder` pour decoder les frames dans le Worker.
4. Executer la boucle de rendering (meme logique que `exportWithWebCodecs` lignes 70-95)
5. Encoder video + audio avec VideoEncoder/AudioEncoder + mp4-muxer
6. Poster `progress` a chaque frame
7. Poster `done` avec le buffer final (transferable)

**IMPORTANT — Approche alternative plus simple :**
Puisque `VideoDecoder` est complexe (demuxer necessaire), utiliser une approche hybride :
- Le main thread garde la logique de seek video (`video.currentTime = t` + `onseeked`)
- Le main thread capture chaque frame en `VideoFrame` et la transfere au Worker
- Le Worker recoit les frames, dessine sur OffscreenCanvas (overlays + sous-titres), encode
- Ca evite de demuxer la video dans le Worker

Mais cette approche est plus complexe que necessaire. **L'approche la plus pragmatique :**
garder `exportWithWebCodecs` sur le main thread MAIS deplacer les calculs lourds
(drawing overlays, encoding) dans un Worker via transferable VideoFrames.

**APPROCHE RECOMMANDEE — OffscreenCanvas simple :**
1. Le main thread cree un Canvas, appelle `canvas.transferControlToOffscreen()`
2. Transfere le `OffscreenCanvas` au Worker
3. Le main thread fait le seek video et envoie chaque frame raw au Worker
4. Le Worker dessine sur OffscreenCanvas, applique overlays/subtitles, encode

Cependant, pour maximiser la simplicite et la fiabilite :

**APPROCHE FINALE — Worker complet avec video seek sur main thread :**

Le main thread :
1. Prepare la video (seek-based comme avant)
2. Pour chaque frame : capture `createImageBitmap(video)` → transfere au Worker
3. Le Worker dessine l'ImageBitmap sur OffscreenCanvas, applique overlays/subtitles, encode

```typescript
// exportWorker.ts — Web Worker d'export video
/// <reference lib="webworker" />

import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { drawTextOverlays } from '../utils/drawOverlays';
import { drawSubtitles } from '../utils/drawSubtitles';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '../types/editor';

const W = 1080, H = 1920;
const FPS = 30;
const FRAME_DUR = Math.round(1e6 / FPS);

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;

self.onmessage = async (e: MessageEvent) => {
  const msg = e.data;

  if (msg.type === 'init') {
    // Recevoir l'OffscreenCanvas ou en creer un
    canvas = msg.canvas ?? new OffscreenCanvas(W, H);
    ctx = canvas.getContext('2d')!;
    self.postMessage({ type: 'ready' });
    return;
  }

  if (msg.type === 'frame') {
    // Recevoir un ImageBitmap, dessiner + overlays + subtitles
    const { bitmap, time, trimStart, filterCss, overlays, subtitles, subtitleStyle, frameIndex, totalFrames } = msg;

    if (filterCss && filterCss !== 'none') ctx.filter = filterCss;
    ctx.drawImage(bitmap, 0, 0, W, H);
    ctx.filter = 'none';
    bitmap.close();

    if (overlays?.length) drawTextOverlays(ctx, overlays, time, W, H);
    if (subtitles?.length) drawSubtitles(ctx, subtitles, subtitleStyle as SubtitleStyle, time, W, H);

    // Encoder la frame
    const ts = Math.round((time - trimStart) * 1e6);
    const frame = new VideoFrame(canvas, { timestamp: ts });
    encoder.encode(frame, { keyFrame: frameIndex % 30 === 0 });
    frame.close();

    self.postMessage({ type: 'progress', percent: Math.round(frameIndex / totalFrames * 100) });
    return;
  }

  // ... setup encoder, finalize, etc.
};
```

**MAIS** — les imports de modules (`drawOverlays`, `drawSubtitles`, `mp4-muxer`) dans un Worker
necessitent un bundler qui supporte les Workers avec imports. Next.js ne supporte pas
nativement les Workers ES modules.

**APPROCHE FINALE SIMPLIFIEE :**

Creer une version du pipeline export qui utilise un Worker pour l'encoding uniquement,
en gardant le rendering sur le main thread mais avec des `yield` plus agressifs
pour ne pas bloquer l'UI.

Apres reflexion, **l'approche la plus pragmatique et testee** pour Next.js :

---

### Approche implementee : Worker inline avec encoding deporte

**Fichier a creer :** `lib/workers/createExportWorker.ts`

```typescript
/**
 * Cree un Worker inline pour l'export video.
 * Utilise un Blob URL car Next.js ne supporte pas bien les Worker modules.
 */
export function createExportWorker(): Worker | null {
  if (typeof OffscreenCanvas === 'undefined') return null;

  const workerCode = `
    // Worker inline — encoding video
    let muxer, vEnc, aEnc;
    let frameCount = 0;
    const FRAME_DUR = ${Math.round(1e6 / 30)};

    self.onmessage = async (e) => {
      const msg = e.data;

      if (msg.type === 'init') {
        // Importer mp4-muxer depuis CDN (le Worker n'a pas acces au bundle)
        importScripts('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.min.js');
        const { Muxer, ArrayBufferTarget } = self.Mp4Muxer;

        const opts = {
          target: new ArrayBufferTarget(),
          video: { codec: 'avc', width: 1080, height: 1920 },
          fastStart: 'in-memory',
          firstTimestampBehavior: 'offset',
        };
        if (msg.hasAudio) {
          opts.audio = { codec: 'aac', sampleRate: msg.sampleRate, numberOfChannels: msg.channels };
        }
        muxer = new Muxer(opts);

        vEnc = new VideoEncoder({
          output: (chunk, meta) => {
            const data = new Uint8Array(chunk.byteLength);
            chunk.copyTo(data);
            const d = (chunk.duration != null && isFinite(chunk.duration) && chunk.duration > 0)
              ? chunk.duration : FRAME_DUR;
            muxer.addVideoChunkRaw(data, chunk.type, chunk.timestamp, d, meta);
          },
          error: (err) => self.postMessage({ type: 'error', message: err.message }),
        });
        vEnc.configure({
          codec: 'avc1.640028', width: 1080, height: 1920, bitrate: 8000000, framerate: 30,
          bitrateMode: 'variable', hardwareAcceleration: 'prefer-hardware', latencyMode: 'quality',
        });

        if (msg.hasAudio) {
          aEnc = new AudioEncoder({
            output: (c, m) => muxer.addAudioChunk(c, m),
            error: () => {},
          });
          aEnc.configure({
            codec: 'mp4a.40.2', sampleRate: msg.sampleRate,
            numberOfChannels: msg.channels, bitrate: 128000,
          });
        }

        self.postMessage({ type: 'ready' });
        return;
      }

      if (msg.type === 'frame') {
        const frame = new VideoFrame(msg.bitmap, { timestamp: msg.timestamp });
        vEnc.encode(frame, { keyFrame: msg.keyFrame });
        frame.close();
        msg.bitmap.close();
        frameCount++;
        self.postMessage({ type: 'progress', percent: Math.round(frameCount / msg.totalFrames * 100) });
        return;
      }

      if (msg.type === 'audio') {
        if (!aEnc) return;
        const ad = new AudioData({
          format: 'f32-planar', sampleRate: msg.sampleRate,
          numberOfFrames: msg.numberOfFrames, numberOfChannels: msg.channels,
          timestamp: msg.timestamp, data: msg.data,
        });
        aEnc.encode(ad);
        ad.close();
        return;
      }

      if (msg.type === 'finalize') {
        await vEnc.flush();
        vEnc.close();
        if (aEnc) { await aEnc.flush(); aEnc.close(); }
        muxer.finalize();
        const buffer = muxer.target.buffer;
        self.postMessage({ type: 'done', buffer }, [buffer]);
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}
```

---

## Livrable 2 — Modifier exportWithWebCodecs pour utiliser le Worker

**Fichier :** `lib/utils/exportWebCodecs.ts`

Refactorer la fonction pour :
1. Tenter de creer un Worker via `createExportWorker()`
2. Si Worker disponible : le main thread fait le seek + draw overlays/subtitles sur un Canvas local, puis transfere chaque frame en `ImageBitmap` au Worker pour l'encoding
3. Si Worker indisponible (OffscreenCanvas non supporte) : fallback sur le code actuel (main thread)

```typescript
import { createExportWorker } from '../workers/createExportWorker';
import { drawTextOverlays } from './drawOverlays';
import { drawSubtitles } from './drawSubtitles';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '@/lib/types';

const W = 1080, H = 1920;
const FPS = 30;

export async function exportWithWebCodecs(
  file: File, trimStart: number, trimEnd: number,
  onProgress: (p: number) => void,
  filterCss?: string, overlays?: TextOverlayItem[],
  subtitles?: SubtitleSegment[], subtitleStyle?: string,
  audioBlob?: Blob | null,
): Promise<Blob> {
  const worker = createExportWorker();
  if (worker) {
    return exportWithWorker(worker, file, trimStart, trimEnd, onProgress, filterCss, overlays, subtitles, subtitleStyle, audioBlob);
  }
  return exportMainThread(file, trimStart, trimEnd, onProgress, filterCss, overlays, subtitles, subtitleStyle, audioBlob);
}
```

**`exportWithWorker` :**
1. Decoder l'audio (meme logique que avant, lignes 22-29 actuelles)
2. Envoyer `init` au Worker avec les infos audio
3. Attendre `ready`
4. Boucle seek-based sur le main thread :
   - `video.currentTime = t` + `onseeked`
   - Dessiner la video + filtre + overlays + sous-titres sur un Canvas local
   - `createImageBitmap(canvas)` → transferer au Worker via `postMessage(msg, [bitmap])`
   - Le Worker encode la frame
   - Yield au main thread tous les 3 frames (`await new Promise(r => setTimeout(r, 0))`)
5. Envoyer les chunks audio au Worker
6. Envoyer `finalize`, attendre `done`
7. Retourner le Blob

**`exportMainThread` :** le code actuel (lignes 14-127) sans changement.

Le point cle : le main thread fait toujours le rendering (draw overlays, subtitles)
mais l'encoding (VideoEncoder + muxer) est deporte dans le Worker. Ca libere ~40-60%
du CPU du main thread, suffisant pour garder l'UI reactive.

De plus, les `yield` sont plus agressifs (tous les 3 frames au lieu de 5) pour que
les animations de progression soient fluides.

---

## Livrable 3 — Mettre a jour useVideoExport pour la progression Worker

**Fichier :** `lib/hooks/useVideoExport.ts`

Aucun changement structurel necessaire — le hook appelle deja `exportWithWebCodecs`
et passe `setProgress` comme callback. Le Worker communique la progression via
le meme mecanisme (`onProgress`).

La seule modification : precharger les fonts AVANT de demarrer l'export (obligatoire
car le Worker n'a pas acces a `document.fonts`).

Ligne 39 actuelle : `for (const o of s.overlays) await loadFont(o.fontFamily);`

C'est deja fait. Ajouter aussi le prechargement des fonts de sous-titres si un theme
est actif :

```typescript
// Precharger les fonts (document.fonts n'est PAS disponible dans un Worker)
for (const o of s.overlays) await loadFont(o.fontFamily);
// Precharger la font des sous-titres du theme actif
const theme = getTheme(s.activeThemeId);
await loadFont(theme.fontSubtitle);
await loadFont(theme.fontTitle);
```

---

## Contraintes
- NE PAS modifier drawOverlays.ts ni drawSubtitles.ts
- NE PAS modifier le store useEditorStore.ts
- NE PAS utiliser de CDN pour mp4-muxer — utiliser un Worker inline qui importe depuis le meme bundle OU dupliquer la logique d'encoding dans le Worker inline
- NE PAS utiliser `document.createElement('video')` dans le Worker
- NE PAS modifier les Cloud Functions ou les routes API
- Le fallback main thread DOIT fonctionner identiquement au code actuel
- L'export Worker ne doit PAS changer le resultat final (meme qualite, meme format)
- Safari iOS 16.5+ : verifier que OffscreenCanvas est supporte avant d'utiliser le Worker
- Les fonts doivent etre prechargees sur le main thread AVANT tout rendering
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `createExportWorker()` cree un Worker inline qui encode les VideoFrames
- [ ] `exportWithWebCodecs` tente le Worker, fallback sur main thread si non supporte
- [ ] L'export produit le meme fichier MP4 qu'avant (meme codec, meme bitrate, meme FPS)
- [ ] La progression est communiquee en temps reel pendant l'export Worker
- [ ] L'UI reste reactive pendant l'export (pas de freeze)
- [ ] Les fonts sont prechargees avant l'export (overlays + theme)
- [ ] Le fallback main thread fonctionne sur les navigateurs sans OffscreenCanvas
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/exportWebCodecs.ts`
- `lib/hooks/useVideoExport.ts`
- `lib/utils/drawOverlays.ts`
- `lib/utils/drawSubtitles.ts`
- `lib/utils/fontLoader.ts`
- `lib/store/useEditorStore.ts`
- `lib/types/editor.ts`
- `lib/data/videoThemes.ts`
