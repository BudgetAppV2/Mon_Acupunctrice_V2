# Analyse — Export video et generation de sous-titres sur fichiers > 60 secondes

Date : 25 mars 2026
Contexte : Tests avec Judith — echec sur video > 60s, fonctionne sur videos courtes (7-15s)

---

## 1. Diagnostic

### Pipeline de sous-titres

**Flow :** SubtitlePanel → useTranscription → upload fichier vers Storage → /api/transcribe → Cloud Function transcribeAudio (Whisper)

**Fichiers analyses :**
- `SubtitlePanel.tsx` (72 lignes) — UI clean, pas de probleme
- `useTranscription.ts` (52 lignes) — Upload + appel API
- `app/api/transcribe/route.ts` (33 lignes) — Proxy vers Cloud Function
- `subtitleGrouper.ts` (17 lignes) — Groupage mots, pas de probleme

**Problemes identifies :**

| # | Probleme | Fichier | Ligne | Severite |
|---|----------|---------|-------|----------|
| S1 | Upload du fichier VIDEO ENTIER vers Storage | `useTranscription.ts:24` | `uploadBytes(ref(storage, storagePath), videoFile)` | HAUTE |
| S2 | Pas d'extraction audio avant upload | `useTranscription.ts` | absent | HAUTE |
| S3 | Whisper a une limite de 25MB pour le fichier audio | Cloud Function | externe | HAUTE |
| S4 | Timeout Vercel API route = 60s (Hobby) | `transcribe/route.ts` | implicite | MOYENNE |
| S5 | Pas de feedback de progression pour l'upload | `useTranscription.ts` | absent | MOYENNE |
| S6 | Message d'erreur generique "Transcription echouee" | `useTranscription.ts:44` | catch block | BASSE |

**Detail S1+S2 (cause racine la plus probable) :**
`useTranscription` upload le fichier VIDEO complet (`videoFile: File`) vers Firebase Storage. Pour une video de 60s a 1080p, ca fait ~50-200MB. Ce fichier est ensuite envoye a Whisper via la Cloud Function. Mais **Whisper accepte max 25MB** de fichier audio. La Cloud Function doit extraire l'audio elle-meme, mais si elle recoit un fichier video de 200MB, elle peut timeout (Cloud Function timeout = 60s par defaut, 540s en Gen 2).

De plus, `uploadBytes` charge tout en memoire en une seule requete — pas de reprise en cas d'echec reseau. Sur iPhone Safari avec une video de 200MB, c'est un OOM probable.

### Pipeline d'export

**Flow :** ExportButton → useVideoExport → exportWithWebCodecs (ou FFmpeg fallback) → upload vers Storage

**Fichiers analyses :**
- `ExportButton.tsx` (69 lignes) — UI clean
- `useVideoExport.ts` (106 lignes) — Orchestrateur
- `useFFmpeg.ts` (43 lignes) — Singleton FFmpeg.wasm
- `exportWebCodecs.ts` (126 lignes) — Export WebCodecs
- `ffmpegCommands.ts` (82 lignes) — Commandes FFmpeg

**Problemes identifies :**

| # | Probleme | Fichier | Ligne | Severite |
|---|----------|---------|-------|----------|
| E1 | `file.arrayBuffer()` charge le fichier entier en memoire | `exportWebCodecs.ts:21` | `await file.arrayBuffer()` | HAUTE |
| E2 | Pas de gestion de la memoire pour les frames accumulees | `exportWebCodecs.ts:41-46` | muxer accumule tout | HAUTE |
| E3 | FFmpeg fallback : `fetchFile(videoFile)` charge tout en WASM memory | `useVideoExport.ts:54` | | HAUTE |
| E4 | Upload du blob exporte via `uploadBytes` (pas resumable) | `useVideoExport.ts:74` | | MOYENNE |
| E5 | `catch {}` vide sur le decode audio | `exportWebCodecs.ts:21` | `try { ... } catch {}` | MOYENNE |
| E6 | `catch {}` vide sur le thumbnail upload | `useVideoExport.ts:86` | | BASSE |
| E7 | `console.log` en production (ligne 40) | `useVideoExport.ts:40` | | BASSE |

**Detail E1+E2 (cause racine la plus probable pour l'export) :**
La ligne 21 de `exportWebCodecs.ts` fait :
```typescript
audioBuf = await ac.decodeAudioData(await file.arrayBuffer());
```
Pour un fichier de 150MB, cela alloue ~150MB pour l'ArrayBuffer + ~150MB pour l'AudioBuffer decode (PCM non compresse). Sur un iPhone avec ~3GB de RAM total et ~1.5GB disponible, ca depasse facilement la limite et crash le tab Safari silencieusement.

En plus, le muxer `mp4-muxer` (ArrayBufferTarget) accumule tous les chunks video encodes en memoire avant `finalize()`. Pour 1800 frames (60s @ 30fps) a ~8Mbps, ca fait ~60MB de chunks video en memoire en plus de tout le reste.

### Impact des changements E01-A / E01-C

**E01-A (ResizeDivider)** — Modifie : EditorLayout.tsx, Timeline.tsx, useEditorStore.ts
- EditorLayout : changement de layout (flex heights au lieu de fixes) — **n'affecte PAS le pipeline d'export ni de transcription**
- Timeline : `flex-1 min-h-[60px]` au lieu de hauteur fixe — **n'affecte PAS le pipeline**
- Store : ajout `editorSplitRatio` — **aucun impact sur export/transcription**

**E01-C (TrimHandle)** — Modifie : Track, TextTrack, SubtitleTrack, useEditorStore
- Ajout de trim handles draggables — **n'affecte PAS le pipeline d'export**
- Store : ajout `selectedSubtitleId`, `updateSubtitleTiming` — **aucun impact**

**Verdict : E01-A et E01-C n'ont PAS casse l'export ni la transcription.** Le probleme est pre-existant et ne se manifestait pas sur les videos courtes car les fichiers sont petits (~5-15MB).

---

## 2. Root causes classees par probabilite

### HAUTE probabilite

1. **Transcription — fichier trop gros pour Whisper (25MB limit)**
   Le fichier video complet est uploade vers Storage puis passe a Whisper. Une video de 60s+ depasse facilement 25MB meme en audio seul (format MP3/AAC). Si la Cloud Function ne fait pas de compression/decoupe, Whisper rejette silencieusement.

2. **Export — OOM sur `file.arrayBuffer()` + `decodeAudioData`**
   Double allocation memoire (~300MB pour un fichier de 150MB) sur un appareil mobile avec memoire limitee. Safari iOS tue le tab sans erreur visible.

3. **Export — Accumulation memoire dans mp4-muxer**
   Tous les chunks encodes sont gardes en memoire (ArrayBufferTarget) jusqu'a `finalize()`. Pour 60s de video, ca ajoute ~60MB en plus du reste.

### MOYENNE probabilite

4. **Transcription — timeout Cloud Function (60s)**
   La Cloud Function Gen 1 a un timeout de 60s. Whisper sur un fichier long peut prendre 30-120s. Si Gen 2, le timeout est 540s — suffisant.

5. **Upload timeout** — `uploadBytes` sur un fichier de 200MB peut prendre plusieurs minutes sur une connexion mobile lente. Pas de retry.

### BASSE probabilite

6. **Vercel API route timeout (60s Hobby)** — Le proxy `/api/transcribe` attend la reponse de la Cloud Function. Si la CF prend > 60s, Vercel coupe la connexion.

7. **`catch {}` vide avale l'erreur audio** — Si `decodeAudioData` echoue (format non supporte), le catch vide continue sans audio. L'export peut sembler reussir mais produire une video sans son.

---

## 3. Suggestions de fix

### Fix S1+S2 — Extraire l'audio AVANT l'upload (transcription)

**Fichiers :** `useTranscription.ts`
**Changement :** Au lieu d'uploader la video entiere, utiliser FFmpeg.wasm pour extraire l'audio en MP3 compresse (mono, 16kHz, ~1MB/min) avant l'upload. Ca reduit le fichier de ~200MB a ~2MB pour 60s.
**Impact videos courtes :** Ajoute une etape FFmpeg (~2-3s) mais reduit drastiquement le temps d'upload.
**Implementation :**
1. Charger FFmpeg.wasm (deja un singleton via useFFmpeg)
2. `ffmpeg.exec(['-i', 'input.mp4', '-vn', '-ar', '16000', '-ac', '1', '-b:a', '32k', 'audio.mp3'])`
3. Lire le fichier audio resultat
4. Uploader seulement l'audio (~1-2MB au lieu de 200MB)

### Fix E1 — Ne pas charger le fichier entier pour le decode audio

**Fichier :** `exportWebCodecs.ts`
**Changement :** Utiliser `file.slice()` pour ne decoder que la portion audio dans le range trim. Ou mieux, decoder l'audio via un `<audio>` element avec MediaStream au lieu de `decodeAudioData(file.arrayBuffer())`.
**Impact videos courtes :** Aucun — meme comportement, moins de memoire.
**Alternative :** Si l'audio n'est pas modifie (pas de musique ajoutee), copier le stream audio directement sans decoder/re-encoder.

### Fix E2 — Limiter l'accumulation memoire du muxer

**Fichier :** `exportWebCodecs.ts`
**Changement :** Remplacer `ArrayBufferTarget` par `StreamTarget` de mp4-muxer. StreamTarget ecrit les chunks au fur et a mesure au lieu de tout garder en memoire.
**Impact videos courtes :** Aucun impact negatif.

### Fix E4 — Upload resumable pour les gros blobs

**Fichiers :** `useVideoExport.ts`, `useTranscription.ts`
**Changement :** Remplacer `uploadBytes` par `uploadBytesResumable` de Firebase Storage. Ca supporte la reprise apres echec et donne un feedback de progression.
**Impact videos courtes :** Negligeable — comportement identique pour les petits fichiers.

### Fix E5+E6 — Supprimer les catch vides

**Fichiers :** `exportWebCodecs.ts:21`, `useVideoExport.ts:86`
**Changement :** Logger l'erreur dans le state ou au minimum dans un message pour l'utilisateur.
**Impact :** Meilleure debuggabilite.

### Fix E7 — Supprimer le console.log en production

**Fichier :** `useVideoExport.ts:40`
**Changement :** Supprimer la ligne `console.log('[EXPORT] start', ...)`.
**Impact :** Conformite avec la regle "0 console.log en production".

---

## 4. Ameliorations UX pour fichiers longs (> 60s)

### Barre de progression detaillee
Actuellement l'export affiche juste un pourcentage. Pour les fichiers longs, ajouter des etapes visibles :
- "Preparation..." (chargement FFmpeg, decode audio)
- "Encodage video... 45%" (frame par frame)
- "Encodage audio..." (rapide)
- "Sauvegarde... 80%" (upload vers Storage)

### Estimation du temps restant
Calculer le FPS reel pendant l'export et estimer le temps restant :
`tempsRestant = (totalFrames - frameCount) / fpsReel`
Afficher : "~30 sec restantes"

### Avertissement sur les gros fichiers
Avant l'export, si `duration > 60`, afficher un avertissement :
"Cette video fait [X] secondes. L'export peut prendre 1-2 minutes."
Pas bloquant — juste informatif.

### Gestion gracieuse des timeouts
Si l'export prend > 120s sans progression, afficher :
"L'export prend plus de temps que prevu. Tu peux attendre ou reessayer avec une video plus courte."

### Messages d'erreur clairs
Remplacer les messages generiques par des messages specifiques :
- OOM : "La video est trop volumineuse pour etre exportee sur cet appareil. Essaie de trimmer la video a moins de 60 secondes."
- Timeout transcription : "La transcription a pris trop de temps. Essaie avec une video plus courte."
- Upload echoue : "La sauvegarde a echoue. Verifie ta connexion et reessaie."

---

## 5. Recommandations d'architecture

### Court terme (fixes immediats)
1. **Extraire l'audio via FFmpeg avant l'upload transcription** — Fix le plus impactant
2. **Remplacer `uploadBytes` par `uploadBytesResumable`** — Fiabilise les uploads
3. **Supprimer les catch vides + console.log** — Hygiene

### Moyen terme
4. **Utiliser StreamTarget dans mp4-muxer** — Reduit la memoire pour l'export
5. **Decoder l'audio en chunks** au lieu de `file.arrayBuffer()` complet
6. **Ajouter les etapes de progression detaillees**

### Long terme (si les videos > 2min deviennent courantes)
7. **Export cote serveur** — Deplacer l'export vers une Cloud Function Gen 2 (540s timeout, 8GB RAM) au lieu du navigateur. Le navigateur envoie le fichier brut + les parametres, le serveur fait l'export et retourne l'URL.
8. **Streaming transcription** — Decouper l'audio en segments de 30s et transcrire en parallele, puis fusionner les resultats.
9. **WebCodecs avec ReadableStream** — Utiliser les Streams API pour ne jamais garder toute la video en memoire.

### Verdict
Le probleme fondamental est que **tout est fait en memoire cote client (navigateur)**. Ca fonctionne pour des fichiers < 30MB (videos de 7-15s) mais echoue pour des fichiers > 100MB (videos de 60s+). Les fixes court terme (extraction audio, upload resumable) devraient suffire pour le cas d'usage de Judith (Reels de 30-90 secondes). L'export cote serveur serait necessaire seulement si les videos depassent regulierement 2-3 minutes.
