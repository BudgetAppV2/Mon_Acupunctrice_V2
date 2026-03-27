# P3.1 — Auto-silence removal

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
Judith filme des talking head de 30-90 secondes. Elle fait souvent des pauses naturelles
entre ses phrases qui allongent la video et cassent le rythme. Ce prompt ajoute une
feature "Couper les silences" qui detecte les segments silencieux > 0.8s dans l'audio
de la video source et ajuste automatiquement le trim pour les retirer.

Apres Phase 2, le store supporte deja multi-clip (`clips[]` avec `addClip`,
`removeClip`, `updateClipTrim`), le voice detector (`voiceDetector.ts`) detecte
les segments voix/silence par RMS, et l'undo/redo est en place.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Web Audio API.

## Fichiers a lire AVANT de commencer
- `lib/utils/voiceDetector.ts` → cree en P2.3. `detectVoiceSegments(audioBuffer, rmsThreshold, windowSize, minSilenceDuration, minVoiceDuration)` retourne `VoiceSegment[]` avec `{start, end, hasVoice}`. Detecte la voix par analyse RMS. On va REUTILISER cette fonction.
- `lib/store/useEditorStore.ts` → ~260 lignes post-P2.4. Multi-clip : `clips: VideoClip[]`, `addClip`, `removeClip`, `updateClipTrim`, `setTrim`. Undo/redo : `pushSnapshot` avant chaque action trackee. `trimStart`/`trimEnd` legacy synces via `syncLegacyFields`.
- `lib/types/editor.ts` → `VideoClip` : `{id, file, blobUrl, duration, trimStart, trimEnd, timelineStart, sourceVideoUrl?}`. `SubtitleSegment` : `{id, text, startTime, endTime, words}`.
- `lib/hooks/useVideoExport.ts` → ~150 lignes post-P2.3. Extrait l'audio (FFmpeg ou Web Audio fallback, lignes 43-80), puis appelle `exportWithWebCodecs`. L'extraction audio est deja codee — on va la reutiliser.
- `lib/utils/exportWebCodecs.ts` → ~150 lignes post-P2.3. Exporte uniquement le premier clip (`clips.length > 1` → erreur ligne 28). Pour que l'auto-silence fonctionne, l'export devra gerer les clips multiples crees par la coupe.
- `components/features/editor/panels/AudioPanel.tsx` → ~130 lignes post-P2.3. Panel audio avec volume, ducking toggle. Candidat pour le bouton "Couper les silences".
- `components/features/editor/timeline/Timeline.tsx` → timeline de l'editeur. Affiche la waveform et les blocs de trim. Candidat pour afficher les zones de silence.
- `lib/utils/subtitleGrouper.ts` → 17 lignes. `groupWords(words, perGroup)` groupe les mots Whisper en segments. Les sous-titres devront etre recales apres la coupe.

---

## Livrable 1 — Detecteur de silences (reutiliser voiceDetector)

**Fichier a creer :** `lib/utils/silenceDetector.ts`

Reutiliser `detectVoiceSegments` de `voiceDetector.ts` et transformer le resultat
en segments a garder (non-silencieux) et segments a couper (silencieux).

```typescript
import { detectVoiceSegments, type VoiceSegment } from './voiceDetector';

export interface SilenceResult {
  /** Segments a garder (contiennent de la voix ou silence court) */
  keepSegments: { start: number; end: number }[];
  /** Segments de silence coupes (> seuil) */
  removedSegments: { start: number; end: number }[];
  /** Duree totale apres coupe */
  newDuration: number;
  /** Duree retiree */
  removedDuration: number;
}

/**
 * Detecte les silences dans un AudioBuffer et retourne les segments a garder.
 *
 * @param audioBuffer - Audio decode de la video source
 * @param minSilenceDuration - Duree minimale de silence pour couper (defaut 0.8s)
 * @param rmsThreshold - Seuil RMS pour la detection de voix (defaut 0.02)
 * @param paddingBefore - Marge avant le debut de la voix (defaut 0.15s)
 * @param paddingAfter - Marge apres la fin de la voix (defaut 0.15s)
 */
export function detectSilences(
  audioBuffer: AudioBuffer,
  minSilenceDuration: number = 0.8,
  rmsThreshold: number = 0.02,
  paddingBefore: number = 0.15,
  paddingAfter: number = 0.15,
): SilenceResult {
  // Utiliser voiceDetector avec le seuil de silence specifie
  const segments = detectVoiceSegments(
    audioBuffer, rmsThreshold, 0.05, minSilenceDuration, 0.1,
  );

  const keepSegments: { start: number; end: number }[] = [];
  const removedSegments: { start: number; end: number }[] = [];

  for (const seg of segments) {
    if (seg.hasVoice) {
      // Ajouter du padding pour ne pas couper trop sec
      const start = Math.max(0, seg.start - paddingBefore);
      const end = Math.min(audioBuffer.duration, seg.end + paddingAfter);

      // Fusionner avec le segment precedent si overlap
      if (keepSegments.length > 0 && start <= keepSegments[keepSegments.length - 1].end) {
        keepSegments[keepSegments.length - 1].end = end;
      } else {
        keepSegments.push({ start, end });
      }
    } else {
      const silDuration = seg.end - seg.start;
      if (silDuration >= minSilenceDuration) {
        removedSegments.push({ start: seg.start, end: seg.end });
      } else {
        // Silence court — garder (fusionner avec segments adjacents)
        if (keepSegments.length > 0) {
          keepSegments[keepSegments.length - 1].end = seg.end;
        }
      }
    }
  }

  const newDuration = keepSegments.reduce((sum, s) => sum + (s.end - s.start), 0);
  const removedDuration = removedSegments.reduce((sum, s) => sum + (s.end - s.start), 0);

  return { keepSegments, removedSegments, newDuration, removedDuration };
}
```

---

## Livrable 2 — Appliquer la coupe au store (multi-clip)

**Fichier a creer :** `lib/utils/applySilenceRemoval.ts`

Applique le resultat de `detectSilences` au store en creant des clips multiples.

**Approche :** Plutot que de creer des clips multiples (qui necessite M2 pour
l'export concatene), on utilise une approche plus simple et compatible avec
l'export actuel : **ajuster le trim du clip existant pour chaque segment a garder,
et creer des clips virtuels pour chaque segment non-silencieux.**

**ATTENTION :** L'export actuel ne supporte qu'un seul clip (`clips.length > 1` → erreur,
ligne 28 de exportWebCodecs.ts). Il faut AUSSI modifier l'export pour concatener
les clips sequentiellement.

**Approche en 2 parties :**

### Partie A — Creer les clips dans le store

```typescript
import type { SilenceResult } from './silenceDetector';

/**
 * Cree des clips multiples a partir des segments a garder.
 * Chaque keepSegment devient un clip avec trimStart/trimEnd correspondants.
 */
export function createClipsFromSegments(
  originalFile: File,
  originalBlobUrl: string,
  originalDuration: number,
  keepSegments: { start: number; end: number }[],
): { trimStart: number; trimEnd: number }[] {
  return keepSegments.map(seg => ({
    trimStart: seg.start,
    trimEnd: seg.end,
  }));
}
```

### Partie B — Modifier l'export pour concatener les clips

**Fichier :** `lib/utils/exportWebCodecs.ts`

Remplacer l'erreur multi-clip (ligne 28 de useVideoExport.ts) par un export
concatene : pour chaque clip, faire la boucle seek-based sur le segment
[trimStart, trimEnd] et encoder les frames sequentiellement.

```typescript
// Au lieu de :
// if (s.clips.length > 1) { throw error }
//
// Faire :
// for (const clip of clips) {
//   for (let i = 0; i < framesInClip; i++) {
//     const t = clip.trimStart + i / FPS;
//     video.currentTime = t;
//     await seeked();
//     // draw + encode frame
//   }
// }
```

La video source est la meme pour tous les clips (meme fichier, meme blobUrl).
On seek simplement a des positions differentes.

**Gestion des timestamps :** Les timestamps d'export doivent etre continus
(pas de gaps entre les clips) :

```typescript
let globalFrameIndex = 0;
for (const clip of clips) {
  const clipFrames = Math.ceil((clip.trimEnd - clip.trimStart) * FPS);
  for (let i = 0; i < clipFrames; i++) {
    const videoTime = clip.trimStart + i / FPS; // position dans la video source
    video.currentTime = videoTime;
    await new Promise<void>(r => { video.onseeked = () => r(); });

    // Dessiner comme avant
    if (filterCss && filterCss !== 'none') ctx.filter = filterCss;
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
    ctx.filter = 'none';

    // Overlays et sous-titres : recalculer le temps relatif
    const exportTime = globalFrameIndex / FPS; // temps dans la video exportee
    if (overlays?.length) drawTextOverlays(ctx, overlays, exportTime, W, H);
    if (subtitles?.length) drawSubtitles(ctx, subtitles, subtitleStyle, exportTime, W, H);

    const ts = Math.round(globalFrameIndex * FRAME_DUR);
    const frame = new VideoFrame(canvas, { timestamp: ts });
    vEnc.encode(frame, { keyFrame: globalFrameIndex % 30 === 0 });
    frame.close();

    globalFrameIndex++;
    onProgress(Math.round(globalFrameIndex / totalFrames * 100));
    if (globalFrameIndex % 5 === 0) await new Promise(r => setTimeout(r, 0));
  }
}
```

**Audio concatene :** Meme logique — pour chaque clip, extraire la tranche audio
[trimStart*sr, trimEnd*sr] et encoder sequentiellement.

---

## Livrable 3 — Recalage des sous-titres

**Fichier a creer :** `lib/utils/recalcSubtitles.ts`

Quand les silences sont coupes, les sous-titres doivent etre recales pour
correspondre a la nouvelle timeline (sans les gaps de silence).

```typescript
import type { SubtitleSegment } from '@/lib/types';

/**
 * Recale les sous-titres apres la coupe des silences.
 * Chaque sous-titre est repositionne sur la timeline compactee.
 */
export function recalcSubtitlesAfterCut(
  subtitles: SubtitleSegment[],
  keepSegments: { start: number; end: number }[],
): SubtitleSegment[] {
  // Creer une table de mapping : temps original → temps apres coupe
  // Pour chaque keepSegment, calculer le decalage cumule
  let cumulativeOffset = 0;
  const mapping: { originalStart: number; originalEnd: number; newStart: number }[] = [];
  for (const seg of keepSegments) {
    mapping.push({
      originalStart: seg.start,
      originalEnd: seg.end,
      newStart: cumulativeOffset,
    });
    cumulativeOffset += seg.end - seg.start;
  }

  // Recaler chaque sous-titre
  return subtitles
    .map(sub => {
      const newStart = mapTime(sub.startTime, mapping);
      const newEnd = mapTime(sub.endTime, mapping);
      if (newStart === null || newEnd === null) return null; // sous-titre dans une zone coupee
      return {
        ...sub,
        startTime: newStart,
        endTime: newEnd,
        words: sub.words.map(w => {
          const ws = mapTime(w.start, mapping);
          const we = mapTime(w.end, mapping);
          return { ...w, start: ws ?? w.start, end: we ?? w.end };
        }),
      };
    })
    .filter((s): s is SubtitleSegment => s !== null);
}

function mapTime(
  t: number,
  mapping: { originalStart: number; originalEnd: number; newStart: number }[],
): number | null {
  for (const m of mapping) {
    if (t >= m.originalStart && t <= m.originalEnd) {
      return m.newStart + (t - m.originalStart);
    }
  }
  return null; // temps dans une zone de silence (coupee)
}
```

---

## Livrable 4 — UI : bouton "Couper les silences" + preview timeline

**Fichier a creer :** `components/features/editor/SilenceRemovalButton.tsx`

Un bouton dans le panel audio OU dans le header qui lance la detection et
montre un apercu avant d'appliquer.

```typescript
'use client';

import { useState } from 'react';
import { ScissorsIcon } from '@heroicons/react/24/outline';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { detectSilences, type SilenceResult } from '@/lib/utils/silenceDetector';

type Stage = 'idle' | 'analyzing' | 'preview' | 'applying';

export default function SilenceRemovalButton() {
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<SilenceResult | null>(null);
  const [threshold, setThreshold] = useState(0.8); // secondes

  const handleAnalyze = async () => {
    const { videoFile } = useEditorStore.getState();
    if (!videoFile) return;

    setStage('analyzing');
    try {
      const ac = new AudioContext();
      const arrayBuf = await videoFile.arrayBuffer();
      const audioBuf = await ac.decodeAudioData(arrayBuf);
      await ac.close();

      const silResult = detectSilences(audioBuf, threshold);
      setResult(silResult);
      setStage('preview');
    } catch {
      setStage('idle');
    }
  };

  const handleApply = () => {
    if (!result) return;
    setStage('applying');
    // Appliquer la coupe (voir integration store ci-dessous)
    applySilenceCut(result);
    setStage('idle');
    setResult(null);
  };

  // Vue idle : bouton
  if (stage === 'idle') {
    return (
      <button
        onClick={handleAnalyze}
        className="flex items-center gap-1.5 text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full"
      >
        <ScissorsIcon className="w-3.5 h-3.5" />
        Couper les silences
      </button>
    );
  }

  // Vue analyzing : spinner
  if (stage === 'analyzing') {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className="w-3 h-3 border border-gray-500 border-t-white rounded-full animate-spin" />
        Analyse audio...
      </div>
    );
  }

  // Vue preview : montrer le resultat avant d'appliquer
  if (stage === 'preview' && result) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">
            {result.removedSegments.length} silence(s) detecte(s)
          </span>
          <span className="text-xs text-sage">
            -{result.removedDuration.toFixed(1)}s
          </span>
        </div>
        {/* Slider seuil */}
        <div>
          <label className="text-xs text-gray-500">
            Seuil : {threshold.toFixed(1)}s
          </label>
          <input
            type="range" min={0.3} max={1.5} step={0.1}
            value={threshold}
            onChange={e => setThreshold(+e.target.value)}
            onMouseUp={handleAnalyze} // Re-analyser quand le slider change
            onTouchEnd={handleAnalyze}
            className="w-full accent-sage"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setStage('idle'); setResult(null); }}
            className="flex-1 text-xs text-gray-400 py-1.5 rounded bg-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleApply}
            className="flex-1 text-xs text-white py-1.5 rounded bg-sage"
          >
            Appliquer
          </button>
        </div>
      </div>
    );
  }

  return null;
}
```

**Integration dans AudioPanel.tsx :**

Ajouter `<SilenceRemovalButton />` au debut du panel audio, visible quand
une video est chargee (avant la section musique de fond).

---

## Livrable 5 — Integration store : appliquer la coupe

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter une action `applySilenceCut` qui :
1. Appelle `pushSnapshot()` pour l'undo/redo
2. Cree des clips multiples (un par segment a garder)
3. Recale les sous-titres
4. Recale les overlays texte (meme logique que les sous-titres)

```typescript
// Nouvelle action dans l'interface EditorState
applySilenceCut: (keepSegments: { start: number; end: number }[]) => void;

// Implementation
applySilenceCut: (keepSegments) => {
  // pushSnapshot pour undo
  const { videoFile, clips, subtitles, overlays } = get();
  if (!videoFile || clips.length === 0) return;

  const originalClip = clips[0];

  // Creer un clip par segment a garder
  const newClips: VideoClip[] = keepSegments.map((seg, i) => ({
    id: i === 0 ? originalClip.id : crypto.randomUUID(),
    file: originalClip.file,
    blobUrl: originalClip.blobUrl,
    duration: originalClip.duration,
    trimStart: seg.start,
    trimEnd: seg.end,
    timelineStart: 0, // recalcule par recalcTimelineStarts
  }));

  const recalced = recalcTimelineStarts(newClips);

  // Recaler les sous-titres et overlays
  const newSubtitles = recalcSubtitlesAfterCut(subtitles, keepSegments);
  const newOverlays = recalcOverlaysAfterCut(overlays, keepSegments);

  set({
    clips: recalced,
    ...syncLegacyFields(recalced),
    subtitles: newSubtitles,
    overlays: newOverlays,
  });
},
```

---

## Contraintes
- NE PAS installer de dependance externe pour la detection de silence
- NE PAS utiliser de ML (Silero VAD, TensorFlow)
- REUTILISER `voiceDetector.ts` de P2.3 (meme algo RMS)
- NE PAS modifier drawOverlays.ts ni drawSubtitles.ts
- NE PAS modifier les Cloud Functions ou les routes API
- NE PAS modifier VideoPreview.tsx
- Les clips crees partagent le MEME fichier et blobUrl (pas de duplication video)
- L'export doit concatener les clips sequentiellement (modifier exportWebCodecs)
- L'undo/redo (P2.4) doit pouvoir restaurer l'etat avant la coupe
- Le recalage des sous-titres doit gerer les mots qui tombent dans une zone coupee (les supprimer)
- Le seuil de silence est ajustable par l'utilisateur (defaut 0.8s)
- Le padding (0.15s avant/apres voix) evite les coupes trop abruptes
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `silenceDetector.ts` detecte les silences > seuil et retourne keepSegments/removedSegments
- [ ] `recalcSubtitles.ts` recale les sous-titres sur la timeline compactee
- [ ] L'action `applySilenceCut` cree des clips multiples dans le store
- [ ] L'export (`exportWebCodecs`) concatene les clips sequentiellement (plus d'erreur multi-clip)
- [ ] Les timestamps d'export sont continus (pas de gaps entre les clips)
- [ ] L'audio est aussi concatene (sans les segments de silence)
- [ ] Le bouton "Couper les silences" est visible dans AudioPanel
- [ ] L'utilisateur peut ajuster le seuil de silence (slider 0.3s-1.5s)
- [ ] Un apercu montre le nombre de silences detectes et la duree retiree
- [ ] Undo restaure l'etat avant la coupe (1 clip avec le trim original)
- [ ] Les sous-titres sont recales correctement apres la coupe
- [ ] Les overlays texte sont recales correctement apres la coupe
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/voiceDetector.ts`
- `lib/utils/silenceDetector.ts` (cree dans ce prompt)
- `lib/utils/exportWebCodecs.ts`
- `lib/hooks/useVideoExport.ts`
- `lib/store/useEditorStore.ts`
- `lib/types/editor.ts`
- `lib/utils/subtitleGrouper.ts`
- `components/features/editor/panels/AudioPanel.tsx`
- `components/features/editor/timeline/Timeline.tsx`
