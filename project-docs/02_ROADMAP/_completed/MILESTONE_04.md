# Milestone 04 — Éditeur : Fondation (Import, Timeline, Export)

## Objectif
Construire le squelette de l'éditeur vidéo, incluant l'import de média, la timeline multi-track, le trimming de base, et le pipeline d'exportation in-browser via FFmpeg.wasm.

## User stories couvertes
- **US-05** : Importer une vidéo ou filmer dans l'app.
- **US-06** : Trimmer la vidéo.
- **US-07** : Voir et interagir avec une timeline multi-track.
- **US-12** : Exporter la vidéo en MP4 vertical.
- **US-13** : Sauvegarder la vidéo après export.

## Dépendances
- **Milestone 01** : Fondation technique, notamment les headers COOP/COEP dans `next.config.mjs`.

## Livrables précis

- **Page & State :**
    - `/app/(app)/editeur/[id]/page.tsx` : Page principale de l'éditeur.
    - `/lib/store/useEditorStore.ts` : Store Zustand pour l'état de l'éditeur.

- **Composants :**
    - `/components/features/editor/EditorLayout.tsx` : Layout principal de l'éditeur (preview en haut, contrôles en bas).
    - `/components/features/editor/VideoPreview.tsx` : Affiche la vidéo, gère la lecture.
    - `/components/features/editor/EditorToolbar.tsx` : Barre d'onglets pour naviguer entre les outils (Trim, Filtres, etc.).
    - `/components/features/editor/timeline/Timeline.tsx` : Composant principal de la timeline, gérant le scroll, le zoom, et le playhead.
    - `/components/features/editor/timeline/Track.tsx` : Composant pour une seule piste (vidéo, audio, etc.).
    - `/components/features/editor/panels/TrimPanel.tsx` : Panneau de contrôle pour le trimming.
    - `/components/features/editor/ImportModal.tsx` : Modal pour importer une vidéo (depuis les fichiers ou la webcam).
    - `/components/features/editor/ExportButton.tsx` : Bouton qui lance le processus d'exportation et affiche la progression.

- **Hooks & Logique :**
    - `/lib/hooks/useFFmpeg.ts` : Hook pour charger et interagir avec FFmpeg.wasm.
    - `/lib/hooks/useVideoExport.ts` : Hook qui orchestre la logique d'export (utilisant `useFFmpeg` ou WebCodecs).
    - `/lib/hooks/useMediaRecorder.ts` : Hook pour l'enregistrement via la webcam.
    - `/lib/utils/ffmpegCommands.ts` : Fonctions pour générer les commandes FFmpeg.

- **API Routes :**
    - `/app/api/proxy-video/route.ts` : Proxy pour servir les vidéos depuis Firebase Storage avec les bons headers CORS/COEP.

## Spécifications techniques détaillées

- **Architecture de l'Éditeur :**
    - Layout vertical strict : preview 9:16 en haut (~40-45vh), onglets de contrôle, timeline (hauteur fixe ~120px), et bouton d'export.
    - Le `useEditorStore` (Zustand) sera la source de vérité unique pour l'état de l'éditeur : `videoFile`, `duration`, `currentTime`, `isPlaying`, `trimStart`, `trimEnd`, et les futurs états (overlays, sous-titres, etc.).

- **Import Vidéo :**
    - `ImportModal` proposera deux options :
        1.  **Fichier local** : Un `<input type="file" accept="video/*" />`.
        2.  **Webcam** : Utiliser le hook `useMediaRecorder` pour capturer un flux vidéo.
    - **Problème `webm`** : Les vidéos enregistrées via MediaRecorder (format webm) ont souvent une durée incorrecte. Utiliser une librairie comme `fix-webm-duration` pour corriger les métadonnées avant de les utiliser.

- **Timeline Multi-track :**
    - La timeline sera scrollable horizontalement.
    - Le `Playhead` (curseur de lecture) sera un élément draggable qui met à jour `currentTime` dans le store Zustand via la méthode `seekTo`.
    - Pour ce milestone, seule la track vidéo (`Track.tsx` en vert sage) sera implémentée, mais l'architecture doit prévoir l'ajout facile d'autres tracks (audio, texte...).
    - Les interactions (drag, zoom) seront gérées via les Pointer Events.

- **Export avec FFmpeg.wasm :**
    - Le hook `useFFmpeg` chargera le binaire FFmpeg.
    - `useVideoExport` construira la commande FFmpeg en utilisant les helpers de `ffmpegCommands.ts`.
    - **Commande de base** : `ffmpeg -i input.mp4 -ss [trimStart] -to [trimEnd] -c:v libx264 -preset ultrafast -crf 23 -vf "scale=1080:1920" output.mp4`.
    - Le hook doit écouter l'événement `progress` de FFmpeg pour mettre à jour l'UI.
    - Après l'export, le blob résultant sera uploadé sur Firebase Storage.
    - Les champs `videoUrl`, `thumbnailUrl`, et `workflowState` ('ready') du `ContentItem` seront mis à jour dans Firestore.

- **Headers COOP/COEP :**
    - Indispensables pour que `SharedArrayBuffer` (utilisé par FFmpeg.wasm pour le multithreading) fonctionne. La configuration doit déjà être en place dans `next.config.mjs` depuis le MS-01.

- **Proxy API Route :**
    - FFmpeg.wasm ne peut pas accéder directement aux URL Firebase Storage à cause des restrictions CORS.
    - `GET /api/proxy-video?url=...` récupérera la vidéo côté serveur Next.js et la streamera au client avec les headers `Cross-Origin-Resource-Policy: cross-origin`, permettant à FFmpeg de la lire.

## Contraintes
- L'éditeur doit être fonctionnel sur un iPhone récent (iOS 16.4+ pour WebCodecs, sinon fallback FFmpeg).
- La performance de FFmpeg sur mobile sera lente. L'UI doit clairement indiquer que l'export peut prendre plusieurs minutes.
- Pour ce milestone, on implémente uniquement le trimming. Les filtres, textes, etc., viendront après.

## Definition of Done
- [ ] Il est possible d'importer une vidéo depuis un fichier ou d'en enregistrer une nouvelle.
- [ ] La vidéo importée s'affiche dans la preview.
- [ ] La timeline s'affiche avec la piste vidéo et un playhead fonctionnel.
- [ ] Le trimming de la vidéo via le `TrimPanel` met à jour `trimStart` et `trimEnd` dans le store.
- [ ] Cliquer sur "Exporter" lance le processus FFmpeg avec les bonnes options de trim.
- [ ] Une barre de progression s'affiche pendant l'export.
- [ ] La vidéo exportée est correctement uploadée sur Firebase Storage.
- [ ] Le document `ContentItem` dans Firestore est mis à jour avec la `videoUrl`.

## Prompt one shot pour Claude Code

```
# Milestone 04 — Fondation de l'Éditeur Vidéo

## Contexte
Le projet a ses fondations (auth, CRUD, calendrier). Ce milestone est le plus important : construire le cœur de l'éditeur vidéo, avec l'import, une timeline de base, le trimming, et l'export in-browser avec FFmpeg.wasm.

## Stack
- Next.js 15, TypeScript, Tailwind, Zustand, FFmpeg.wasm (`@ffmpeg/ffmpeg`), `fix-webm-duration`.

## Objectif
Créer l'architecture de l'éditeur, permettre à l'utilisateur d'importer et trimmer une vidéo, et de l'exporter en format 9:16 via FFmpeg, le tout côté client.

## Livrables à créer

1.  **`lib/store/useEditorStore.ts`** :
    - Store Zustand contenant `videoFile: File | null`, `duration: number`, `currentTime: number`, `isPlaying: boolean`, `trimStart: number`, `trimEnd: number`.
    - Actions : `setVideoFile`, `play`, `pause`, `seekTo`, `setTrim`.

2.  **`app/(app)/editeur/[id]/page.tsx`** :
    - Récupère l'ID de l'item depuis l'URL.
    - Affiche le `EditorLayout`.

3.  **`components/features/editor/EditorLayout.tsx`** :
    - Structure verticale : `VideoPreview` en haut, `EditorToolbar` au milieu, `Timeline` en bas, et `ExportButton`.
    - Affiche un `ImportModal` si `videoFile` est `null`.

4.  **`components/features/editor/ImportModal.tsx`** :
    - Propose import via `input type="file"` ou enregistrement via `useMediaRecorder`.
    - Lors de l'import, crée une URL objet (`URL.createObjectURL`) et la stocke dans le store. Utilise `fix-webm-duration` si besoin.

5.  **`components/features/editor/timeline/Timeline.tsx`** :
    - Affiche une `Track` pour la vidéo.
    - Affiche un `Playhead` draggable qui appelle `seekTo` du store lors du déplacement.

6.  **`lib/hooks/useFFmpeg.ts`** :
    - Hook qui charge `@ffmpeg/ffmpeg` une seule fois.
    - Expose une fonction `run` qui prend les arguments de la commande.
    - Gère l'état de chargement de FFmpeg.

7.  **`lib/hooks/useVideoExport.ts`** :
    - Utilise `useFFmpeg`.
    - Prend en entrée l'état de `useEditorStore`.
    - Construit la commande FFmpeg pour trimmer (`-ss`, `-to`) et redimensionner (`-vf scale`).
    - Gère la progression de l'export et l'upload final vers Firebase Storage.

8.  **`components/features/editor/ExportButton.tsx`** :
    - Bouton qui appelle la fonction d'export de `useVideoExport`.
    - Affiche la progression de l'export.

9.  **`app/api/proxy-video/route.ts`** :
    - API Route qui prend une URL Firebase Storage en query param.
    - Fetche la vidéo côté serveur et la renvoie en streaming avec les headers `Cross-Origin-Resource-Policy: cross-origin`.

## Contraintes
- Les headers `COOP/COEP` doivent être actifs dans `next.config.mjs`.
- La gestion d'erreur (échec du chargement de FFmpeg, échec de l'export) doit être robuste.
- Le code doit être fortement commenté, car la logique de l'éditeur est complexe.

## Definition of Done
- L'import de vidéo (fichier/webcam) fonctionne.
- La vidéo est jouable dans la preview.
- La timeline affiche la durée de la vidéo et le playhead est synchronisé.
- L'export FFmpeg produit une vidéo 9:16 correctement trimmée.
- La vidéo exportée est enregistrée dans Firebase et liée au bon `ContentItem`.
```
