# P2.3 — Audio ducking

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
L'editeur supporte une musique de fond (Jamendo ou fichier local) avec volume reglable.
Quand Judith parle dans sa video et qu'une musique de fond joue, les deux sources
se melangent sans ajustement. Ce prompt ajoute l'auto-ducking : detecter les segments
de voix dans la video source et baisser automatiquement le volume de la musique
pendant ces segments.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS, Web Audio API, WebCodecs.

## Fichiers a lire AVANT de commencer
- `lib/utils/exportWebCodecs.ts` → 127 lignes. L'encoding audio se fait lignes 98-114 : decode le `audioBlob` en `AudioBuffer`, encode en AAC par chunks de 1024 samples. L'audio encode est UNIQUEMENT la voix de la video source. La musique de fond n'est PAS mixee dans l'export actuellement.
- `lib/hooks/useVideoExport.ts` → 134 lignes. Prepare l'audio (lignes 43-80) : FFmpeg ou Web Audio fallback. Le `audioBlob` passe a `exportWithWebCodecs` est l'audio extrait de la video (voix).
- `lib/store/useEditorStore.ts` → 241 lignes. Champs audio : `audioUrl` (string | null), `audioName`, `audioVolume` (0-1, defaut 0.3), `voiceVolume` (0-1, defaut 1), `audioFadeIn`, `audioFadeOut`.
- `components/features/editor/panels/AudioPanel.tsx` → 122 lignes. UI controles audio : volume voix, volume musique, fade in/out. Pas de toggle ducking.
- `lib/types/editor.ts` → 63 lignes. Pas de type pour les segments de voix ni le ducking.
- `components/features/editor/VideoPreview.tsx` → 180 lignes. Sync musique de fond avec video (lignes 42-48) : `bgAudioRef.current.volume = audioVolume`.

---

## Livrable 1 — Detecteur de voix par amplitude (RMS)

**Fichier a creer :** `lib/utils/voiceDetector.ts`

Analyse l'audio de la video source pour detecter les segments ou Judith parle.
Pas de ML (Silero VAD) — juste detection par amplitude RMS, simple et rapide.

```typescript
export interface VoiceSegment {
  start: number;   // secondes
  end: number;     // secondes
  hasVoice: boolean;
}

/**
 * Detecte les segments de voix dans un AudioBuffer par analyse RMS.
 * Retourne un tableau de segments avec hasVoice = true/false.
 *
 * Parametres :
 * - windowSize : taille de la fenetre d'analyse en secondes (0.05 = 50ms)
 * - rmsThreshold : seuil RMS au-dessus duquel on considere qu'il y a de la voix
 * - minSilenceDuration : duree minimum de silence pour creer un segment sans voix (0.3s)
 * - minVoiceDuration : duree minimum de voix pour creer un segment avec voix (0.1s)
 */
export function detectVoiceSegments(
  audioBuffer: AudioBuffer,
  rmsThreshold: number = 0.02,
  windowSize: number = 0.05,
  minSilenceDuration: number = 0.3,
  minVoiceDuration: number = 0.1,
): VoiceSegment[] {
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.getChannelData(0); // mono suffisant pour la detection
  const windowSamples = Math.floor(windowSize * sampleRate);
  const totalWindows = Math.floor(samples.length / windowSamples);

  // Etape 1 : calculer le RMS de chaque fenetre
  const rmsValues: { time: number; rms: number }[] = [];
  for (let i = 0; i < totalWindows; i++) {
    const start = i * windowSamples;
    let sum = 0;
    for (let j = start; j < start + windowSamples; j++) {
      sum += samples[j] * samples[j];
    }
    const rms = Math.sqrt(sum / windowSamples);
    rmsValues.push({ time: i * windowSize, rms });
  }

  // Etape 2 : transformer en segments bruts (voix/silence)
  const rawSegments: { start: number; end: number; hasVoice: boolean }[] = [];
  let currentVoice = rmsValues[0]?.rms > rmsThreshold;
  let segStart = 0;

  for (let i = 1; i < rmsValues.length; i++) {
    const isVoice = rmsValues[i].rms > rmsThreshold;
    if (isVoice !== currentVoice) {
      rawSegments.push({ start: segStart, end: rmsValues[i].time, hasVoice: currentVoice });
      segStart = rmsValues[i].time;
      currentVoice = isVoice;
    }
  }
  // Dernier segment
  rawSegments.push({
    start: segStart,
    end: rmsValues[rmsValues.length - 1]?.time ?? 0 + windowSize,
    hasVoice: currentVoice,
  });

  // Etape 3 : fusionner les segments trop courts
  const merged: VoiceSegment[] = [];
  for (const seg of rawSegments) {
    const duration = seg.end - seg.start;
    if (!seg.hasVoice && duration < minSilenceDuration && merged.length > 0) {
      // Silence trop court — fusionner avec le segment precedent (voix)
      merged[merged.length - 1].end = seg.end;
    } else if (seg.hasVoice && duration < minVoiceDuration && merged.length > 0) {
      // Voix trop courte — fusionner avec le segment precedent (silence)
      merged[merged.length - 1].end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}
```

---

## Livrable 2 — Mixer l'audio avec ducking dans l'export

**Fichier :** `lib/utils/exportWebCodecs.ts`

Actuellement, l'export encode uniquement l'audio de la video source (voix).
La musique de fond n'est PAS dans l'export. Ce livrable ajoute le mixage audio :
voix + musique de fond avec ducking automatique.

**Modifier la signature de `exportWithWebCodecs` :**

```typescript
export async function exportWithWebCodecs(
  file: File, trimStart: number, trimEnd: number,
  onProgress: (p: number) => void,
  filterCss?: string, overlays?: TextOverlayItem[],
  subtitles?: SubtitleSegment[], subtitleStyle?: string,
  audioBlob?: Blob | null,
  // Nouveaux parametres
  musicBlob?: Blob | null,
  musicVolume?: number,        // 0-1, volume de la musique
  voiceVolume?: number,        // 0-1, volume de la voix
  duckingEnabled?: boolean,    // activer le ducking
  voiceSegments?: VoiceSegment[] | null,  // segments detectes
): Promise<Blob> { ... }
```

**Logique de mixage audio (apres l'encoding video, lignes 98-114) :**

1. Decoder la musique de fond (`musicBlob`) en `AudioBuffer`
2. Decoder la voix (`audioBlob`) en `AudioBuffer`
3. Creer un buffer de sortie avec les deux sources mixees :
   - Pour chaque sample :
     - `voiceSample = voiceBuffer[i] * voiceVolume`
     - Si ducking et dans un segment hasVoice :
       `musicSample = musicBuffer[i % musicLength] * musicVolume * 0.3` (30% pendant voix)
     - Sinon :
       `musicSample = musicBuffer[i % musicLength] * musicVolume`
     - Appliquer fade de transition (200ms) entre les niveaux de ducking
     - `outputSample = clamp(voiceSample + musicSample, -1, 1)`
4. Encoder le buffer mixe en AAC

**Fade de transition ducking (200ms) :**

```typescript
const DUCK_FADE_SAMPLES = Math.floor(0.2 * sampleRate); // 200ms
const DUCK_LEVEL = 0.3; // 30% pendant voix

function getDuckMultiplier(
  sampleIndex: number, sampleRate: number, trimStart: number,
  segments: VoiceSegment[],
): number {
  const time = trimStart + sampleIndex / sampleRate;
  const seg = segments.find(s => time >= s.start && time < s.end);
  if (!seg) return 1;

  if (seg.hasVoice) {
    // Fade in vers le ducking (debut du segment voix)
    const fadeIn = (time - seg.start) * sampleRate;
    if (fadeIn < DUCK_FADE_SAMPLES) {
      const t = fadeIn / DUCK_FADE_SAMPLES;
      return 1 - t * (1 - DUCK_LEVEL);
    }
    // Fade out du ducking (fin du segment voix)
    const fadeOut = (seg.end - time) * sampleRate;
    if (fadeOut < DUCK_FADE_SAMPLES) {
      const t = fadeOut / DUCK_FADE_SAMPLES;
      return 1 - t * (1 - DUCK_LEVEL);
    }
    return DUCK_LEVEL;
  }
  return 1;
}
```

---

## Livrable 3 — Ajouter le ducking au store et a l'UI

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter les champs dans l'interface et l'etat initial :

```typescript
// Dans EditorState interface
audioDucking: boolean;

// Dans create initial state
audioDucking: false,

// Ajouter l'action
setAudioDucking: (enabled: boolean) => void;

// Implementation
setAudioDucking: (enabled) => set({ audioDucking: enabled }),
```

Ajouter `audioDucking` au `reset()` (ligne ~231) : `audioDucking: false,`

**Fichier :** `components/features/editor/panels/AudioPanel.tsx`

Ajouter un toggle "Auto-ducking" dans la vue controles (quand un audio est importe).
Le placer apres les sliders de volume (ligne ~62) :

```tsx
// Importer depuis le store
const { audioDucking, setAudioDucking } = useEditorStore();

// Apres les sliders de volume, avant les fades
<div className="flex items-center justify-between">
  <div>
    <span className="text-xs text-gray-300">Auto-ducking</span>
    <p className="text-[10px] text-gray-500">Baisse la musique quand tu parles</p>
  </div>
  <button
    onClick={() => setAudioDucking(!audioDucking)}
    className={`w-10 h-5 rounded-full transition-colors ${
      audioDucking ? 'bg-sage' : 'bg-gray-700'
    }`}
  >
    <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${
      audioDucking ? 'translate-x-5' : 'translate-x-0'
    }`} />
  </button>
</div>
```

---

## Livrable 4 — Integrer le ducking dans useVideoExport

**Fichier :** `lib/hooks/useVideoExport.ts`

Le ducking est calcule AVANT l'export (pendant la phase "preparing").

Apres l'extraction audio (lignes 43-80), ajouter :

```typescript
import { detectVoiceSegments, VoiceSegment } from '@/lib/utils/voiceDetector';

// Apres avoir obtenu audioBlob (voix extraite)...
// Detecter les segments de voix pour le ducking
let voiceSegments: VoiceSegment[] | null = null;
if (s.audioDucking && s.audioUrl && audioBlob) {
  try {
    const ac = new AudioContext();
    const voiceBuffer = await ac.decodeAudioData(await audioBlob.arrayBuffer());
    voiceSegments = detectVoiceSegments(voiceBuffer);
    await ac.close();
  } catch { /* Detection echouee — pas de ducking */ }
}

// Charger la musique de fond comme Blob
let musicBlob: Blob | null = null;
if (s.audioUrl) {
  try {
    const resp = await fetch(s.audioUrl);
    musicBlob = await resp.blob();
  } catch { /* Musique non disponible */ }
}

// Passer au pipeline export
const blob = await exportWithWebCodecs(
  s.videoFile, s.trimStart, s.trimEnd, setProgress,
  filterCss, s.overlays, s.subtitles, s.subtitleStyle, audioBlob,
  musicBlob, s.audioVolume, s.voiceVolume,
  s.audioDucking, voiceSegments,
);
```

---

## Contraintes
- NE PAS utiliser de ML pour la detection de voix (pas de Silero VAD, pas de TensorFlow)
- NE PAS modifier drawOverlays.ts ni drawSubtitles.ts
- NE PAS modifier les Cloud Functions ou les routes API
- NE PAS modifier VideoPreview.tsx (le ducking est seulement pour l'export)
- La detection par amplitude est suffisante pour les videos talking-head de Judith
- Le seuil RMS par defaut (0.02) doit fonctionner pour la majorite des enregistrements
- Le ducking baisse la musique a 30% (pas a 0%) pour garder l'ambiance
- Les transitions de ducking doivent etre douces (fade 200ms)
- La musique de fond boucle si elle est plus courte que la video
- Si pas de musique de fond, le ducking n'a aucun effet
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] `voiceDetector.ts` detecte les segments voix/silence par analyse RMS
- [ ] L'export mixe voix + musique de fond dans le fichier MP4 final
- [ ] Quand ducking actif : musique a 30% pendant les segments de voix
- [ ] Transitions douces (fade 200ms) entre les niveaux de ducking
- [ ] Toggle "Auto-ducking" dans AudioPanel avec description
- [ ] Le toggle n'apparait que quand une musique de fond est importee
- [ ] Le ducking est calcule pendant la phase "preparing" (pas pendant l'export)
- [ ] Sans musique de fond, l'export fonctionne comme avant (voix seule)
- [ ] La musique de fond boucle si plus courte que la video
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/utils/exportWebCodecs.ts`
- `lib/hooks/useVideoExport.ts`
- `lib/store/useEditorStore.ts`
- `components/features/editor/panels/AudioPanel.tsx`
- `components/features/editor/VideoPreview.tsx`
- `lib/types/editor.ts`
