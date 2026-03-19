# Milestone 06 — Éditeur : Sous-titres & Audio

## Objectif
Finaliser les fonctionnalités principales de l'éditeur en ajoutant la génération automatique de sous-titres et l'intégration d'une bibliothèque musicale avec contrôle du volume.

## User stories couvertes
- **US-10** : Générer des sous-titres automatiquement.
- **US-11** : Choisir une musique de fond depuis une bibliothèque.

## Dépendances
- **Milestone 04** : Fondation de l'éditeur.
- `legacy/functions/` : Le code des Cloud Functions pour la transcription et la recherche musicale sera réutilisé.

## Livrables précis

- **Cloud Functions (adaptation du legacy) :**
    - `functions/src/transcribe.ts` : Adaptation de la fonction existante pour le nouveau projet.
    - `functions/src/jamendo.ts` : Adaptation de la fonction de recherche Jamendo.

- **Composants :**
    - `/components/features/editor/panels/SubtitlePanel.tsx` : Panneau pour gérer la génération et le style des sous-titres.
    - `/components/features/editor/panels/AudioPanel.tsx` : Panneau pour rechercher et importer de la musique.
    - `/components/features/editor/subtitles/SubtitleSegment.tsx` : Affiche un segment de sous-titre éditable.
    - `/components/features/editor/subtitles/SubtitlePreview.tsx` : Affiche les sous-titres sur la preview vidéo.

- **State & Types :**
    - `/lib/store/useEditorStore.ts` : Étendre le store pour inclure `subtitles: Subtitle[]`, `audioTrack: AudioTrack | null`.
    - `/lib/types/index.ts` : Ajouter les types `Subtitle`, `AudioTrack`, `JamendoTrack`.

- **Hooks & API :**
    - `/lib/hooks/useTranscription.ts` : Hook pour appeler la Cloud Function `transcribeAudio`.
    - `/lib/hooks/useMusicSearch.ts` : Hook pour appeler la Cloud Function `searchJamendo`.
    - `/app/api/transcribe/route.ts` : API Route Next.js qui wrappe l'appel à la fonction `transcribeAudio`.
    - `/app/api/search-music/route.ts` : API Route qui wrappe `searchJamendo`.
    - `/app/api/proxy-audio/route.ts` : API Route pour proxyfier les streams audio de Jamendo avec les bons headers.

## Spécifications techniques détaillées

- **Sous-titres Automatiques (F2.6) :**
    - **Déclenchement** : Un bouton "Auto-générer" dans le `SubtitlePanel` appellera le hook `useTranscription`.
    - **Transcription** : Le hook enverra le chemin du fichier vidéo (sur Firebase Storage) à la Cloud Function `transcribeAudio`. La fonction utilisera l'API Whisper d'OpenAI avec `timestamp_granularities: ['word']` pour obtenir le timing de chaque mot.
    - **Groupement** : Le résultat de Whisper (une longue liste de mots) sera traité côté client pour créer des segments de 3-4 mots, en utilisant une logique similaire à `@remotion/captions` (`createTikTokStyleCaptions`).
    - **Affichage** : Les sous-titres seront affichés sur la `SubtitlePreview` (superposée à la vidéo) et leur durée sera visible sur une nouvelle "Subtitle Track" dans la timeline.
    - **Édition** : Le `SubtitlePanel` affichera une liste de `SubtitleSegment`, permettant à Judith de corriger le texte de chaque segment.
    - **Styles** : 3 styles seront disponibles : Classique (texte simple), TikTok (mot courant mis en évidence), et Karaoké (les mots se colorent au fur et à mesure).

- **Bibliothèque Musicale Jamendo (F2.7) :**
    - **Recherche** : L'`AudioPanel` contiendra un champ de recherche et des filtres de "mood" qui utiliseront le hook `useMusicSearch` pour interroger l'API Jamendo via la Cloud Function.
    - **Preview** : L'URL de stream de Jamendo sera passée à l'API Route `/api/proxy-audio` pour contourner les problèmes de CORS, puis jouée dans un élément `<audio>`.
    - **Import** : Importer une musique l'ajoutera à l'état `audioTrack` dans le store Zustand. Une "Audio Track" (en violet) apparaîtra dans la timeline.
    - **Contrôle du volume** : L'`AudioPanel` affichera deux sliders de volume : un pour la piste vidéo originale (la voix de Judith) et un pour la piste musicale. Ces volumes seront stockés dans le store.

- **Export avec Audio :**
    - Le hook `useVideoExport` sera mis à jour.
    - Si une `audioTrack` est présente, la commande FFmpeg inclura une deuxième entrée (`-i music.mp3`).
    - Le filtre `-filter_complex "[0:a]volume=[voiceVolume];[1:a]volume=[musicVolume];[0:a][1:a]amix=inputs=2:duration=first"` sera utilisé pour mixer les deux pistes audio avec les volumes corrects.

## Contraintes
- La transcription via Whisper peut prendre du temps (30-60s). L'UI doit afficher un état de chargement clair.
- L'API Jamendo a des limitations. Les appels doivent être mis en cache ou dépriorisés.
- La synchronisation audio/vidéo doit être précise.

## Definition of Done
- [ ] Le bouton "Auto-générer" dans l'onglet des sous-titres déclenche la transcription.
- [ ] Les sous-titres générés s'affichent sur la vidéo et sur la timeline.
- [ ] Il est possible d'éditer le texte de chaque segment de sous-titre.
- [ ] L'onglet audio permet de rechercher de la musique sur Jamendo.
- [ ] Il est possible de pré-écouter une musique et de l'importer dans le projet.
- [ ] La piste musicale apparaît sur la timeline.
- [ ] Les sliders de volume pour la voix et la musique fonctionnent.
- [ ] La vidéo exportée contient les sous-titres incrustés et le mixage audio correct.

## Prompt one shot pour Claude Code

```
# Milestone 06 — Éditeur : Sous-titres & Audio

## Contexte
L'éditeur a maintenant ses fondations, les filtres et les textes. Ce milestone ajoute les deux dernières grandes fonctionnalités audio : la transcription automatique pour les sous-titres et une bibliothèque musicale.

## Stack
- Next.js 15, TypeScript, Firebase (Cloud Functions, Storage), OpenAI API (Whisper), Jamendo API.

## Objectif
Intégrer la génération de sous-titres via Whisper et l'ajout de musique de fond depuis Jamendo, en incluant les contrôles de volume et l'export final.

## Livrables à créer

1.  **Cloud Functions (réutilisation de `legacy/functions/`)** :
    - `functions/src/transcribe.ts` : Assurez-vous qu'elle utilise l'API Whisper avec `timestamp_granularities: ['word']`.
    - `functions/src/jamendo.ts` : Assurez-vous qu'elle recherche et renvoie des pistes depuis l'API Jamendo.

2.  **API Routes (wrappers)** :
    - `/app/api/transcribe/route.ts` : Appelle la fonction `transcribeAudio`.
    - `/app/api/search-music/route.ts` : Appelle la fonction `searchJamendo`.
    - `/app/api/proxy-audio/route.ts` : Streame un fichier audio depuis une URL externe avec les bons headers.

3.  **`lib/store/useEditorStore.ts`** :
    - Ajouter `subtitles: Subtitle[]` et `audioTrack: AudioTrack | null` à l'état.
    - `Subtitle` doit inclure le texte et les `words` avec leur timing.
    - `AudioTrack` doit inclure l'URL, le volume, et les infos de la piste.

4.  **`components/features/editor/panels/SubtitlePanel.tsx`** :
    - Bouton pour lancer la transcription via `useTranscription`.
    - Affiche la liste des segments éditables.
    - Sélecteur pour les styles de sous-titres (Classic, TikTok, etc.).

5.  **`components/features/editor/subtitles/SubtitlePreview.tsx`** :
    - Affiche le sous-titre courant sur la vidéo, en stylisant le mot actuel si le style "TikTok" est actif.

6.  **`components/features/editor/panels/AudioPanel.tsx`** :
    - UI de recherche pour Jamendo.
    - Affiche les résultats et permet la pré-écoute et l'import.
    - Contient les sliders de volume pour la voix et la musique.

7.  **`lib/hooks/useVideoExport.ts`** :
    - Mettre à jour la logique de FFmpeg.
    - Pour les sous-titres : Utiliser `drawtext` pour chaque mot, en utilisant `enable='between(t,start,end)'` pour le timing précis du style Karaoké.
    - Pour l'audio : Utiliser `-filter_complex amix` pour mixer la voix et la musique avec les volumes définis.

8.  **`Timeline.tsx`** :
    - Ajouter une `Track` pour les sous-titres (jaune) et une pour l'audio (violet).

## Contraintes
- La logique de rendu des sous-titres (style TikTok/Karaoké) est complexe mais essentielle. Elle se base sur la comparaison entre `currentTime` et le `start`/`end` de chaque mot.
- Les Cloud Functions existantes dans `/legacy/` doivent être adaptées pour être appelées via des API Routes Next.js.

## Definition of Done
- La transcription via Whisper est fonctionnelle et les sous-titres s'affichent.
- La recherche et l'import de musique depuis Jamendo fonctionnent.
- La vidéo exportée contient bien les sous-titres et la musique de fond mixée au bon volume.
```
