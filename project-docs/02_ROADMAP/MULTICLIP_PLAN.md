# Multi-clip — Plan de migration en 4 milestones

## Vue d'ensemble
Migrer l'éditeur d'un système single-clip vers un multi-clip complet (CapCut-level).
Chaque milestone est autonome et l'app reste fonctionnelle après chaque étape.

## M1 — Store multi-clip (fondation)
**But :** Migrer le store Zustand de `videoFile: File` vers `clips: VideoClip[]`
**Scope :** Store seulement — pas de changement UI visible
**Rétrocompat :** `videoFile` et `trimStart/End` deviennent des getters vers le clip actif
**Fichiers :** useEditorStore.ts, types

## M2 — Timeline multi-clip + preview
**But :** La timeline affiche N clips sur la piste vidéo, la preview joue les clips en séquence
**Scope :** Track.tsx → ClipTrack.tsx, VideoPreview.tsx adapté pour multi-clip
**Fichiers :** Track.tsx, VideoPreview.tsx, Timeline.tsx, ImportModal (bouton "Ajouter un clip")

## M3 — Interactions timeline (drag, réordonner, trim, split)
**But :** Drag pour réordonner les clips, trim handles sur chaque clip, bouton split
**Scope :** Interactions sur la nouvelle ClipTrack
**Fichiers :** ClipTrack.tsx, TrimHandle réutilisé, nouveau SplitButton

## M4 — Export multi-clip
**But :** L'export concat les clips en séquence (seek loop par clip)
**Scope :** exportWebCodecs.ts, useVideoExport.ts
**Fichiers :** export pipeline, audio extraction adaptée

## Dépendances
M1 → M2 → M3 (séquentiels, chaque milestone dépend du précédent)
M4 peut commencer après M2 (parallélisable avec M3)
