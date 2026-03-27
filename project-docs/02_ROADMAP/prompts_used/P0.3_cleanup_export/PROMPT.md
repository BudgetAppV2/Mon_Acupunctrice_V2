# P0.3 — Nettoyer le double pipeline export (retirer FFmpeg full export)

## Contexte
Mon Acupunctrice Hub V2 — editeur video mobile (Next.js 15 + Zustand + Tailwind).
L'export video a deux chemins dans `useVideoExport.ts` :
1. **WebCodecs** (< 100MB, pas d'audio custom) — fonctionne partout, seek-based, rapide
2. **FFmpeg complet** (gros fichiers OU audio custom) — NE FONCTIONNE PAS sur Safari iOS (FFmpeg.wasm ne charge pas)

Le chemin FFmpeg complet est du code mort en production (tous nos utilisateurs sont sur iOS).
Ce prompt le retire pour simplifier le code.

**IMPORTANT :** FFmpeg est ENCORE utilise pour l'extraction audio (MP3) dans le chemin WebCodecs.
Le hook `useFFmpeg.ts` doit etre CONSERVE. Seul le pipeline FFmpeg COMPLET (encode video) est retire.

**Prerequis :** P0.1 et P0.2 doivent etre completes avant.

## Stack
Next.js 15 App Router, TypeScript, Zustand, Firebase Firestore.

## Fichiers a lire AVANT de commencer
- `lib/hooks/useVideoExport.ts` → 161 lignes. Deux chemins d'export :
  - Ligne 41 : `const useWC = supportsWebCodecs && !s.audioUrl && fileSizeMB < 100;`
  - Ligne 46-93 : Chemin WebCodecs (GARDER) — inclut extraction audio FFmpeg + fallback Web Audio
  - Ligne 94-113 : Chemin FFmpeg complet (RETIRER) — encode video+audio via FFmpeg, utilise `buildExportCommand`
- `lib/utils/ffmpegCommands.ts` → 82 lignes. `buildExportCommand()` + `buildVideoFilters()`. Importe `FILTERS`. Utilise par le chemin FFmpeg complet uniquement.
- `lib/hooks/useFFmpeg.ts` → 43 lignes. Hook singleton pour charger FFmpeg.wasm. Utilise par les DEUX chemins (extraction audio + export complet). GARDER ce fichier.
- `lib/utils/exportWebCodecs.ts` → 128 lignes. Export WebCodecs pur. N'importe PAS ffmpegCommands. GARDER tel quel.

---

## Livrable 1 — Retirer le chemin FFmpeg complet de useVideoExport.ts

**Fichier :** `lib/hooks/useVideoExport.ts`

### Etape 1 : Retirer l'import de buildExportCommand et FILTERS

Ligne 9 : `import { buildExportCommand } from '@/lib/utils/ffmpegCommands';`
Ligne 10 : `import { FILTERS } from '@/lib/utils/filters';`

Retirer ces deux imports. Le filtre CSS est maintenant resolu dans le chemin WebCodecs directement.

Ajouter l'import FILTERS depuis filters.ts (re-export V2 apres P0.2) :
```typescript
import { FILTERS } from '@/lib/utils/filters';
```

(Note : FILTERS est encore utilise a la ligne 37 pour `filterCss`.)

### Etape 2 : Retirer le seuil intelligent et le chemin FFmpeg

Le code actuel (lignes 39-113) :
```typescript
const fileSizeMB = s.videoFile.size / (1024 * 1024);
const useWC = supportsWebCodecs && !s.audioUrl && fileSizeMB < 100;

let blob: Blob;
setState('exporting');

if (useWC) {
  // ... chemin WebCodecs (lignes 46-93)
} else {
  // ... chemin FFmpeg complet (lignes 94-113)
}
```

Remplacer par le chemin WebCodecs UNIQUEMENT. Plus de branchement conditionnel :

```typescript
setState('exporting');

// Verifier le support WebCodecs
if (!supportsWebCodecs) {
  throw new Error('Ton navigateur ne supporte pas l\'export video. Utilise Safari 17+ ou Chrome.');
}

// Extraire l'audio — FFmpeg d'abord, fallback Web Audio API (Safari iOS)
let audioBlob: Blob | null = null;
try {
  const ffmpeg = await loadFFmpeg();
  const buf = await s.videoFile.arrayBuffer();
  await ffmpeg.writeFile('input.mp4', new Uint8Array(buf));
  await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-ar', '48000', '-ac', '2', '-b:a', '128k', 'audio.mp3']);
  const audioData = await ffmpeg.readFile('audio.mp3') as Uint8Array;
  audioBlob = new Blob([audioData.buffer as ArrayBuffer], { type: 'audio/mpeg' });
  await ffmpeg.deleteFile('input.mp4').catch(() => {});
  await ffmpeg.deleteFile('audio.mp3').catch(() => {});
} catch (e) {
  // Fallback Web Audio API (fonctionne sur Safari iOS)
  try {
    const ac = new AudioContext({ sampleRate: 48000 });
    const arrayBuf = await s.videoFile.arrayBuffer();
    const decoded = await ac.decodeAudioData(arrayBuf);
    await ac.close();
    const nCh = Math.min(decoded.numberOfChannels, 2);
    const sr = decoded.sampleRate;
    const samples = decoded.getChannelData(0);
    const numSamples = samples.length;
    const wavBuf = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(wavBuf);
    const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    w(0,'RIFF'); view.setUint32(4, 36 + numSamples * 2, true); w(8,'WAVE');
    w(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
    view.setUint32(24,sr,true); view.setUint32(28,sr*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
    w(36,'data'); view.setUint32(40, numSamples * 2, true);
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    audioBlob = new Blob([wavBuf], { type: 'audio/wav' });
  } catch {
    // Pas d'audio — export sans son
  }
}

const filterCss = FILTERS.find(f => f.id === s.filter)?.css ?? 'none';
const blob = await exportWithWebCodecs(
  s.videoFile, s.trimStart, s.trimEnd, setProgress,
  filterCss, s.overlays, s.subtitles, s.subtitleStyle, audioBlob,
);
```

### Etape 3 : Retirer terminateFFmpeg

L'appel `terminateFFmpeg()` etait dans le chemin FFmpeg complet (ligne 112).
Le hook `useFFmpeg` reste importe pour `loadFFmpeg` (extraction audio).
Retirer `terminate: terminateFFmpeg` du destructuring si plus utilise nulle part.

Verifier : le `terminateFFmpeg` etait dans le `useCallback` deps array (ligne 158). Le retirer aussi.

### Etape 4 : Gestion de l'audio custom

Le chemin FFmpeg complet gerait l'audio custom (`s.audioUrl`) via un mix voix + musique.
Le chemin WebCodecs ne supporte PAS l'audio custom actuellement.

Pour l'instant, si `s.audioUrl` existe, on ignore l'audio custom et on exporte avec l'audio original de la video. C'est un compromis acceptable (l'audio custom sera reimplemente dans une future phase avec Web Audio API mixing).

Retirer la condition `!s.audioUrl` du seuil. Le WebCodecs prend tout.

---

## Livrable 2 — Retirer ffmpegCommands.ts

**Fichier :** `lib/utils/ffmpegCommands.ts`

Supprimer ce fichier entierement. Il n'est utilise QUE par le chemin FFmpeg complet.

Verification des imports :
```
lib/hooks/useVideoExport.ts:9  → import { buildExportCommand } from '@/lib/utils/ffmpegCommands';
```
C'est le seul import. Il sera deja retire au Livrable 1.

---

## Livrable 3 — Nettoyer useFFmpeg.ts (garder, mais simplifier)

**Fichier :** `lib/hooks/useFFmpeg.ts`

Ce fichier est CONSERVE car il sert pour l'extraction audio.

Verifier que `terminate()` est encore exporte et utilisable (pour cleanup memoire apres extraction audio). Si `terminateFFmpeg` n'est plus appele dans useVideoExport, ajouter un appel `terminate` apres l'extraction audio reussie pour liberer la memoire FFmpeg :

Dans useVideoExport.ts, apres l'extraction audio :
```typescript
terminateFFmpeg(); // Liberer la memoire FFmpeg apres extraction audio
```

En fait, garder `terminate` dans le hook et l'utiliser dans useVideoExport apres extraction.

---

## Livrable 4 — Retirer les console.log restants

**Fichier :** `lib/hooks/useVideoExport.ts`

Le code actuel a des console.log (lignes 58, 84) et console.warn (ligne 60), console.error (ligne 86) :
```typescript
console.log('[EXPORT] Audio extracted via FFmpeg:', ...);
console.warn('[EXPORT] FFmpeg audio failed, trying Web Audio API:', e);
console.error('[EXPORT] Both audio extraction methods failed:', e2);
console.log('[EXPORT] Audio extracted via Web Audio:', ...);
```

Retirer TOUS les console.log et console.warn. On peut garder console.error uniquement en development.

Remplacer par rien — le silence est la regle en production.

---

## Contraintes
- NE PAS modifier exportWebCodecs.ts
- NE PAS modifier drawSubtitles.ts ou drawOverlays.ts
- NE PAS modifier le store Zustand
- NE PAS modifier les composants UI
- NE PAS modifier les Cloud Functions
- GARDER useFFmpeg.ts (extraction audio en a besoin)
- GARDER le fallback Web Audio API pour Safari iOS
- L'audio custom (musique ajoutee) n'est plus supporte a l'export — c'est acceptable
- 0 console.log en production
- Composants < 150 lignes
- `tsc --noEmit` = 0 erreurs, `npm run build` = succes

## Definition of Done
- [ ] Le chemin FFmpeg complet est retire de useVideoExport.ts
- [ ] `ffmpegCommands.ts` est supprime
- [ ] `useFFmpeg.ts` est conserve (extraction audio)
- [ ] L'extraction audio fonctionne : FFmpeg d'abord, fallback Web Audio API
- [ ] L'export WebCodecs fonctionne pour tous les cas (plus de seuil 100MB)
- [ ] Erreur claire si WebCodecs n'est pas supporte par le navigateur
- [ ] 0 console.log/warn en production dans useVideoExport.ts
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succes

## Reference — fichiers a lire
- `CLAUDE.md`
- `lib/hooks/useVideoExport.ts`
- `lib/utils/ffmpegCommands.ts`
- `lib/hooks/useFFmpeg.ts`
- `lib/utils/exportWebCodecs.ts`
