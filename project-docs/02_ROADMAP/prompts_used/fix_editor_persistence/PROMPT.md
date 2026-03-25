# Fix — Persistance des données éditables dans l'éditeur

## Problème
Quand Judith édite une vidéo (ajoute des sous-titres, du texte, un filtre, du trim, de l'audio), puis quitte l'éditeur et revient, TOUT est perdu. Les données éditables sont stockées uniquement dans le store Zustand (mémoire) et ne sont jamais sauvegardées dans Firestore.

## Données perdues actuellement
- `trimStart`, `trimEnd` — points de trim
- `overlays` — textes superposés (position, style, timing)
- `subtitles` — sous-titres (texte, timing)
- `subtitleStyle` — style des sous-titres (classic, bold, etc.)
- `filter` — filtre CSS appliqué
- `audioUrl`, `audioName` — musique ajoutée
- `voiceVolume`, `audioVolume` — volumes
- `audioFadeIn`, `audioFadeOut` — fondus audio
- `coverFrameOffset`, `coverDataUrl`, `coverCustomUrl` — cover sélectionnée

## Données déjà sauvegardées
- `videoUrl` — URL de la vidéo exportée ✅
- `caption` — caption ✅
- `thumbnailUrl` — thumbnail ✅

## Stack
Next.js 15, TypeScript, Zustand, Firestore.

## Objectif
Sauvegarder les données éditables dans Firestore pour que Judith puisse quitter l'éditeur et revenir avec tout son travail intact.

## Livrables attendus

### 1. Sauvegarder les données éditables dans Firestore

**Fichier :** `lib/hooks/useUpdateContentItem.ts` ou nouveau hook `lib/hooks/useEditorPersistence.ts`

Créer un mécanisme de sauvegarde automatique qui :
- Sauvegarde les données éditables dans le document `contentItems/{id}` sous un champ `editorData`
- Utilise un debounce de 2 secondes pour ne pas flood Firestore
- Se déclenche automatiquement quand le store Zustand change

**Structure du champ `editorData` dans Firestore :**
```typescript
editorData: {
  trimStart: number;
  trimEnd: number;
  overlays: TextOverlayItem[];
  subtitles: SubtitleSegment[];
  subtitleStyle: string;
  filter: string;
  audioUrl: string | null;
  audioName: string | null;
  voiceVolume: number;
  audioVolume: number;
  audioFadeIn: number;
  audioFadeOut: number;
  coverFrameOffset: number;
  coverCustomUrl: string | null;
  savedAt: Timestamp;
}
```

### 2. Restaurer les données au chargement de l'éditeur

**Fichier :** `components/features/editor/EditorLayout.tsx`

Dans le `useEffect` qui charge la vidéo existante (`loadExisting`), aussi charger le champ `editorData` et le restaurer dans le store :

```typescript
if (data.editorData) {
  const ed = data.editorData;
  const store = useEditorStore.getState();
  if (ed.trimStart !== undefined) store.setTrim(ed.trimStart, ed.trimEnd);
  if (ed.overlays?.length) store.setOverlays(ed.overlays);  // nouveau setter bulk
  if (ed.subtitles?.length) store.setSubtitles(ed.subtitles);
  if (ed.subtitleStyle) store.setSubtitleStyle(ed.subtitleStyle);
  if (ed.filter) store.setFilter(ed.filter);
  if (ed.audioUrl) store.setAudio(ed.audioUrl, ed.audioName);  // nouveau setter
  if (ed.voiceVolume !== undefined) store.setVoiceVolume(ed.voiceVolume);
  if (ed.audioVolume !== undefined) store.setAudioVolume(ed.audioVolume);
  // ... etc pour les autres champs
}
```

### 3. Ajouter les setters manquants dans le store

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter les setters nécessaires pour la restauration :
- `setOverlays(overlays: TextOverlayItem[])` — remplace tous les overlays (pour le load)
- `setAudio(url: string, name: string)` — set l'audio URL et nom
- `setVoiceVolume(vol: number)` — set le volume voix
- `setAudioVolume(vol: number)` — set le volume audio
- `setFilter(filter: string)` — probablement déjà existant

Vérifier que chaque setter existe avant de l'ajouter.

### 4. Hook de sauvegarde automatique

**Fichier :** `lib/hooks/useEditorPersistence.ts`

```typescript
export function useEditorPersistence(itemId: string | null) {
  // Subscribe aux changements du store Zustand
  // Debounce de 2 secondes
  // Sauvegarde editorData dans Firestore
  // Ne sauvegarde PAS si rien n'a changé (comparaison shallow)
}
```

Ce hook est appelé dans `EditorLayout.tsx` :
```typescript
useEditorPersistence(itemId);
```

### 5. Indicateur de sauvegarde dans l'UI

**Fichier :** `components/features/editor/EditorLayout.tsx` (header)

Ajouter un petit indicateur dans le header de l'éditeur :
- Pendant la sauvegarde : petit spinner ou icône de sauvegarde
- Après la sauvegarde : "Sauvegardé" pendant 2 secondes puis disparaît
- Pas bloquant — purement informatif

### 6. Ne pas écraser les données éditables à l'export

**Fichier :** `lib/hooks/useVideoExport.ts`

Actuellement l'export écrit dans Firestore avec `{ merge: true }`. S'assurer que l'export ne supprime PAS le champ `editorData` — il devrait le préserver.

## Contraintes
- NE PAS modifier le pipeline d'export (exportWebCodecs, ffmpegCommands)
- NE PAS modifier les composants de la timeline (Track, TextTrack, etc.)
- NE PAS modifier les panels (TrimPanel, TextPanel, etc.)
- Le debounce de 2s est important — Firestore a des limites de write (1 write/sec par doc)
- La sauvegarde doit être non-bloquante (pas d'await dans le rendu)
- Le champ `editorData` est un objet imbriqué dans le document — pas des champs au premier niveau (pour éviter les conflits avec les autres champs)
- La vidéo source (`videoUrl` dans Firestore) est la vidéo ORIGINALE (pré-edit), pas l'exportée
- Si `editorData` n'existe pas (ancien item), l'éditeur fonctionne normalement (nouveau montage)

## Definition of Done
- [ ] Les données éditables sont sauvegardées dans Firestore avec debounce 2s
- [ ] Quitter l'éditeur et revenir restaure tous les éléments de la timeline
- [ ] Les sous-titres sont restaurés avec leur texte et timing
- [ ] Les overlays texte sont restaurés avec position, style et timing
- [ ] Le trim (start/end) est restauré
- [ ] Le filtre est restauré
- [ ] L'audio ajouté est restauré (URL + nom)
- [ ] La cover sélectionnée est restaurée
- [ ] Un indicateur de sauvegarde est visible dans le header
- [ ] L'export ne supprime pas les données éditables
- [ ] Les items sans `editorData` (anciens) fonctionnent normalement
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `lib/store/useEditorStore.ts` (store Zustand complet)
- `components/features/editor/EditorLayout.tsx` (chargement existant)
- `lib/hooks/useUpdateContentItem.ts` (pattern de sauvegarde Firestore)
- `lib/types/index.ts` (types TextOverlayItem, SubtitleSegment)
