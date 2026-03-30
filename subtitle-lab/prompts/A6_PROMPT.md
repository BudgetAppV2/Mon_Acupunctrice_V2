# A6 — Transcription (AssemblyAI → SubtitleBlock[] reels)

## Contexte
Subtitle Lab a des SubtitleBlock[] de test (testData.ts). On ajoute la transcription reelle : extraire l'audio de la video, envoyer a AssemblyAI, convertir les mots en SubtitleBlock[] avec word-level timing.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, AssemblyAI API.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/store.ts` → Store avec tracks[]. La track sous-titres a `subtitles.blocks: SubtitleBlock[]`.
- `subtitle-lab/lib/types.ts` → SubtitleBlock (id, text, words: WordToken[], startMs, endMs). WordToken (text, startMs, endMs).
- `subtitle-lab/lib/testData.ts` → 42 lignes. Comment TEST_BLOCKS sont generes. Pattern de creation des blocs.
- `lib/hooks/useTranscription.ts` (editeur principal) → 163 lignes. Pipeline complet : extract audio WAV → AssemblyAI → groupWords → frenchPostProcess. Chunking pour les videos > 5 min. A COPIER et adapter.
- `lib/utils/subtitleGrouper.ts` (editeur principal) → 17 lignes. `groupWords(words, perGroup=4)` — groupe les mots en segments de 3-4 mots.
- `lib/utils/frenchPostProcess.ts` (editeur principal) → 45 lignes. `fixFrenchWord()`, `fixFrenchText()`, `capitalizeFirst()` — corrections apostrophes et vocabulaire acupuncture.
- `app/api/transcribe/route.ts` (editeur principal) → Reference pour la route API.

---

## Livrable 1 — Route API transcribe dans le Lab

**Nouveau fichier :** `subtitle-lab/app/api/transcribe/route.ts`

Route POST qui recoit un fichier audio (FormData avec 'audio' blob), l'envoie a AssemblyAI, et retourne les mots avec timestamps.

```typescript
// Recevoir le FormData avec le blob audio
// Envoyer a AssemblyAI :
//   1. POST audio a https://api.assemblyai.com/v2/upload
//   2. POST transcription a https://api.assemblyai.com/v2/transcript
//      body: { audio_url, language_code: 'fr', word_boost: ['acupuncture', 'meridien', ...] }
//   3. Poll GET /v2/transcript/{id} jusqu'a status 'completed'
//   4. Retourner les words[] avec timestamps
```

**Variable d'env :** `ASSEMBLYAI_API_KEY` dans `.env.local` du Lab.

---

## Livrable 2 — Copier les utils de l'editeur

**Nouveaux fichiers :**
- `subtitle-lab/lib/subtitleGrouper.ts` — copier `lib/utils/subtitleGrouper.ts`
- `subtitle-lab/lib/frenchPostProcess.ts` — copier `lib/utils/frenchPostProcess.ts`

Adapter les imports (pas de paths `@/lib/...`).

---

## Livrable 3 — Hook useTranscription pour le Lab

**Nouveau fichier :** `subtitle-lab/lib/useTranscription.ts`

Adapter `lib/hooks/useTranscription.ts` pour le Lab :
- Extraire l'audio du videoFile via `AudioContext.decodeAudioData` (necessaire iOS Safari)
- Encoder en WAV PCM 16-bit
- Envoyer a `/api/transcribe` (la route du Lab)
- Recevoir les mots, appliquer `fixFrenchWord()` et `capitalizeFirst()`
- Grouper en segments via `groupWords()`
- **Convertir** les segments en `SubtitleBlock[]` du Lab :

```typescript
// Conversion SubtitleSegment (editeur) → SubtitleBlock (Lab)
function segmentToBlock(seg: { id: string; text: string; startTime: number; endTime: number; words: { word: string; start: number; end: number }[] }): SubtitleBlock {
  return {
    id: seg.id,
    text: seg.text,
    startMs: seg.startTime * 1000, // secondes → ms
    endMs: seg.endTime * 1000,
    words: seg.words.map(w => ({
      text: w.word,
      startMs: w.start * 1000,
      endMs: w.end * 1000,
    })),
  };
}
```

Le hook retourne : `{ transcribe, loading, stage, error }`
Stages : `'idle' | 'extracting' | 'transcribing'`

---

## Livrable 4 — Bouton Transcrire dans le sheet Sous-titres

**Fichier :** `subtitle-lab/components/ControlPanel.tsx` (ou un nouveau composant)

Ajouter un bouton "Transcrire" en haut du ControlPanel (avant les controles de style) :
- Icone SparklesIcon + texte "Transcrire"
- Disabled si pas de video importee
- Loading states : "Extraction audio..." → "Transcription..."
- Au succes : remplacer les blocks de test par les blocks transcrits dans le store

```typescript
const handleTranscribe = async () => {
  const videoFile = /* premier clip video du store */;
  if (!videoFile) return;
  const blocks = await transcribe(videoFile);
  if (blocks.length > 0) {
    // Mettre a jour la track sous-titres
    store.setSubtitleBlocks(blocks);
  }
};
```

Ajouter `setSubtitleBlocks(blocks: SubtitleBlock[])` au store.

---

## Contraintes
- La variable ASSEMBLYAI_API_KEY doit etre dans `.env.local` (pas en dur)
- L'extraction audio passe par Web Audio API (necessaire iOS Safari)
- La transcription utilise le PREMIER clip video seulement (pas multi-clip)
  Si multi-clip, transcrire le premier clip de la premiere piste video
- NE PAS modifier le renderer.ts ou les animations
- NE PAS modifier SubtitleCanvas.tsx
- Les blocs transcrits REMPLACENT les blocs de test (pas de merge)
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] La route `/api/transcribe` dans le Lab fonctionne avec AssemblyAI
- [ ] Le hook `useTranscription` extrait l'audio, transcrit, et retourne des SubtitleBlock[]
- [ ] Les corrections francaises (apostrophes, vocabulaire) sont appliquees
- [ ] Le bouton Transcrire est visible dans le sheet Sous-titres
- [ ] Les blocs transcrits apparaissent sur le preview en sync avec la video
- [ ] Loading states affiches pendant la transcription
- [ ] `npm run build` passe dans `subtitle-lab/`
