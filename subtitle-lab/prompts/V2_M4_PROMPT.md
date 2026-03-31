# V2_M4 — Transcription

## Objectif
Verifier et connecter la transcription AssemblyAI du Lab avec la route Hub existante `/api/transcribe`.

## Fichiers a lire avant de coder

### Hub
- `app/api/transcribe/route.ts` — route AssemblyAI existante (POST, FormData avec champ `audio`, retourne `{ subtitles: [{ text, startTime, endTime }] }`)

### Editor V2 (cree en M1)
- `lib/editor-v2/useTranscription.ts` — hook copie du Lab
- `lib/editor-v2/subtitleGrouper.ts` — groupeur de mots en SubtitleBlocks
- `lib/editor-v2/frenchPostProcess.ts` — corrections francais quebecois

### Editor V2 (cree en M2)
- `components/features/editor-v2/TranscribeButton.tsx` — bouton qui declenche la transcription

## Ce que ce milestone doit accomplir

### 1. Verifier la compatibilite du hook avec la route Hub

Le hook `useTranscription.ts` copie en M1 fait :
1. Extraire l'audio via AudioContext (encode en WAV PCM 16-bit)
2. Envoyer en FormData avec champ `audio` vers `/api/transcribe`
3. Recevoir `{ subtitles: [{ text, startTime, endTime }] }` (startTime/endTime en secondes)
4. Post-process : `fixFrenchWord`, `groupWords`, `capitalizeFirst`, `fixFrenchText`
5. Convertir en `SubtitleBlock[]` (startMs/endMs en millisecondes)

La route `/api/transcribe` du Hub :
1. Recoit le FormData avec champ `audio`
2. Upload vers AssemblyAI
3. Lance la transcription en francais
4. Retourne `{ subtitles: [{ text, startTime, endTime }] }` (en secondes, converti depuis ms AssemblyAI)

Verifier que le format de reponse correspond au type `RawWord` dans le hook :
```typescript
type RawWord = { text: string; startTime: number; endTime: number };
```

### 2. Verifier le wiring dans TranscribeButton

`TranscribeButton.tsx` doit :
- Utiliser `useEditorV2Store` (pas `useSubtitleStore`)
- Appeler `transcribe(videoFile)` avec le fichier video du store
- Stocker les blocs retournes via `setSubtitleBlocks(blocks)`
- Afficher le stage de progression (`extracting` → `transcribing`)

### 3. Tester le flow complet

Flow attendu :
1. Importer une video avec de la parole en francais
2. Ouvrir le sheet "Subs"
3. Cliquer sur le bouton "Transcrire"
4. L'extraction audio se fait localement (stage: extracting)
5. L'envoi vers `/api/transcribe` se fait (stage: transcribing)
6. Les sous-titres apparaissent sur le canvas avec le preset actif
7. Les mots sont synchronises avec la video (word-level timing)

## Ce que ce milestone ne fait PAS
- Pas de modification de la route `/api/transcribe` (elle est deja compatible)
- Pas de nouvelle route API
- Pas de changement au groupeur ou au post-processeur

## Definition of Done
1. `npm run build` passe sans erreur
2. La transcription fonctionne dans le V2 : import video → transcrire → sous-titres affiches sur le canvas
3. Les sous-titres sont correctement synchronises avec la video (word-level timing)
4. Le post-processing francais fonctionne (elisions, vocabulaire acupuncture)
5. Le bouton affiche la progression (extracting, transcribing)
6. Les erreurs sont affichees a l'utilisateur
7. Le V1 n'est pas affecte
8. Aucun console.log en production
