# Fix rapide — Caméra sur track spécifique dans l'éditeur v2

## Contexte

Dans le TracksPanel, quand on ajoute un nouveau track vidéo et qu'on clique
le bouton "Ajouter clip" sur ce track, seul le file picker s'ouvre.
Il n'y a pas d'option pour utiliser la caméra sur ce track spécifique.
De plus, CameraOverlay appelle `addVideoClip(result.file)` sans trackId,
donc le clip va toujours sur le premier track vidéo.

## Fichiers à modifier

- `components/features/editor-v2/TracksPanel.tsx` → ajouter un sélecteur import/caméra per-track
- `components/features/editor-v2/CameraOverlay.tsx` → accepter un `targetTrackId` prop
- `components/features/editor-v2/EditorV2Layout.tsx` → passer le targetTrackId au CameraOverlay

## Livrable 1 — CameraOverlay accepte targetTrackId

Dans `CameraOverlay.tsx`, ajouter une prop `targetTrackId?: string`.
Quand l'enregistrement est terminé, passer ce trackId à addVideoClip :

```typescript
// AVANT
addVideoClip(result.file);

// APRÈS
addVideoClip(result.file, targetTrackId);
```

Interface Props modifiée :
```typescript
interface Props {
  onClose: () => void;
  targetTrackId?: string;  // NOUVEAU
}
```

## Livrable 2 — Sélecteur import/caméra per-track dans TracksPanel

Quand on clique le bouton "Ajouter clip" sur un track vide (lignes ~99-105),
au lieu d'ouvrir directement le file picker, afficher un petit menu avec
deux options : "Importer" et "Caméra".

Utiliser un state local `addMenuTrackId: string | null` pour tracker quel
track a le menu ouvert.

```
┌─────────────────────────────┐
│  Importer    │  Caméra      │
│  (FilmIcon)  │  (Camera)    │
└─────────────────────────────┘
```

- "Importer" → `addFileRefs.current.get(trackId)?.click()` (comportement actuel)
- "Caméra" → ouvrir le CameraOverlay avec `targetTrackId={trackId}`

Style : deux boutons côte à côte dans un container `flex gap-2`,
style identique aux boutons existants `text-[9px] text-white/40`.

Aussi appliquer la même logique au bouton "+ Clip" en bas du panel (ligne ~115).

## Livrable 3 — EditorV2Layout passe targetTrackId

Dans EditorV2Layout, le state `showCamera` doit devenir `cameraTargetTrack: string | null`
(null = pas de caméra, string = trackId cible).

Le CameraOverlay reçoit `targetTrackId={cameraTargetTrack}`.

## Contraintes

- Ne PAS modifier le store useEditorV2Store (addVideoClip accepte déjà trackId)
- Ne PAS modifier d'autres panels (Filter, Cover, Control, etc.)
- Composants < 150 lignes
- Heroicons uniquement — utiliser `VideoCameraIcon` pour le bouton caméra
- 0 console.log en production
- Mobile first 375px

## Definition of Done

- [ ] CameraOverlay accepte `targetTrackId` et le passe à `addVideoClip`
- [ ] Le bouton "Ajouter clip" sur un track vide montre un choix Import/Caméra
- [ ] Choisir "Caméra" ouvre le CameraOverlay avec le bon trackId
- [ ] Le clip enregistré atterrit sur le track sélectionné (pas toujours sur V1)
- [ ] Le bouton "+ Clip" en bas offre aussi le choix Import/Caméra
