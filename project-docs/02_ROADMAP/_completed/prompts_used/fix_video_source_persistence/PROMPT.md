# Fix — Persistance de la vidéo source et état "filmée"

## Problème
Quand Judith enregistre ou importe une vidéo dans l'éditeur, puis revient au calendrier sans exporter :
1. La carte affiche "Créer le contenu" au lieu de "Modifier" (parce que `videoUrl` n'existe pas encore dans Firestore — il est mis seulement à l'export)
2. En cliquant, le modal ImportModal s'affiche (choix webcam/fichier) au lieu d'ouvrir l'éditeur avec la vidéo existante
3. Si elle filme une nouvelle vidéo, l'éditeur charge les presets d'édition de l'ancienne session (la persistance des editorData fonctionne, mais la vidéo source est perdue)

## Root cause
La vidéo source (le File brut importé/enregistré) n'est jamais uploadée dans Firebase Storage. Seule la vidéo EXPORTÉE (post-édition) est uploadée. Quand le store Zustand est reset (retour au calendrier), la vidéo source est perdue. Et `item.videoUrl` dans Firestore n'existe qu'après l'export.

## Stack
Next.js 15, TypeScript, Zustand, Firebase Storage, Firestore.

## Ce qui existe déjà

### ImportModal.tsx
- Appelle `loadVideo(file, blobUrl)` quand une vidéo est importée ou enregistrée
- Ne sauvegarde rien dans Firestore ou Storage

### EditorLayout.tsx
- `loadExisting` : charge la vidéo si `data.videoUrl` existe dans Firestore
- Si `!videoFile && !videoUrl` → affiche ImportModal (modal de choix)
- Restaure `editorData` si disponible

### useEditorStore.ts
- `loadVideo(file, url)` : met le file et l'URL blob dans le store
- `videoFile: File | null` (éphémère — perdu au reset)
- `videoUrl: string` (blob URL — perdu au reset)

### ItemDetailSheet.tsx
- Ligne 139 : `item.videoUrl ? 'Modifier' : 'Créer le contenu'`
- Le bouton navigue vers `/editeur/{id}` dans les deux cas

### useVideoExport.ts
- L'export upload la vidéo finale dans `videos/${userId}/${itemId}/export.mp4`
- Met `videoUrl` dans Firestore après l'export

### useEditorPersistence.ts (nouveau — vient d'être ajouté)
- Sauvegarde `editorData` dans Firestore avec debounce 2s
- NE sauvegarde PAS la vidéo source

## Livrables attendus

### 1. Uploader la vidéo source dans Storage après import/enregistrement

**Fichier :** `components/features/editor/ImportModal.tsx` ou nouveau hook `lib/hooks/useVideoSourceUpload.ts`

Quand `loadVideo(file, url)` est appelé dans l'ImportModal :
1. Uploader le fichier source vers Firebase Storage : `videos/${userId}/${itemId}/source.mp4`
2. Utiliser `uploadBytesResumable` (comme partout)
3. Sauvegarder l'URL dans Firestore : `sourceVideoUrl` (distinct de `videoUrl` qui est l'exportée)
4. Mettre `workflowState: 'shot'` dans Firestore (via useUpdateContentItem)
5. L'upload est NON-BLOQUANT — Judith peut commencer à éditer pendant que ça upload en arrière-plan

**Important :** Le champ Firestore est `sourceVideoUrl` (pas `videoUrl`) pour ne pas confondre avec la vidéo exportée.

### 2. Restaurer la vidéo source au chargement de l'éditeur

**Fichier :** `components/features/editor/EditorLayout.tsx`

Modifier le `loadExisting` pour gérer 3 cas :
```
1. videoFile dans le store → déjà chargée, rien à faire
2. data.sourceVideoUrl dans Firestore → télécharger et charger (vidéo source pré-export)
3. data.videoUrl dans Firestore → télécharger et charger (vidéo exportée — fallback)
4. Rien → afficher ImportModal
```

Prioriser `sourceVideoUrl` sur `videoUrl` pour l'édition — on veut éditer à partir de la source, pas du résultat exporté.

### 3. Modifier le bouton dans ItemDetailSheet

**Fichier :** `components/features/calendar/ItemDetailSheet.tsx`

Changer la condition du bouton :
```typescript
// Avant
{item.videoUrl ? 'Modifier' : 'Créer le contenu'}

// Après
{(item.videoUrl || item.sourceVideoUrl) ? 'Modifier' : 'Créer le contenu'}
```

Et aussi pour le thumbnail :
```typescript
// Afficher le thumbnail même si juste sourceVideoUrl existe
{(item.videoUrl || item.sourceVideoUrl) ? (
  <VideoThumbnail videoUrl={item.videoUrl || item.sourceVideoUrl} ... />
) : null}
```

### 4. Mettre à jour le type ContentItem

**Fichier :** `lib/types/index.ts`

Ajouter `sourceVideoUrl?: string` au type ContentItem.

### 5. Ajouter le `workflowState: 'shot'` au `deriveWorkflowState`

**Fichier :** `lib/utils/deriveWorkflowState.ts`

Vérifier que la règle pour `sourceVideoUrl` fonctionne. Ajouter si nécessaire :
```typescript
// 5. Video source uploadée mais pas exportée
if (item.sourceVideoUrl) return 'shot';
```

### 6. Ne pas re-uploader si la source existe déjà

Si l'utilisatrice revient dans l'éditeur et la `sourceVideoUrl` existe déjà dans Firestore, ne pas re-uploader la même vidéo. L'upload ne se fait que dans l'ImportModal, pas au rechargement.

### 7. Feedback d'upload dans l'éditeur

Pendant que la vidéo source s'uploade en arrière-plan, afficher un petit indicateur discret dans le header (à côté de l'indicateur de sauvegarde des editorData) :
- Upload en cours : icône cloud + barre de progression
- Upload terminé : disparaît après 2s

## Contraintes
- NE PAS modifier le pipeline d'export (il continue d'utiliser `videoUrl` pour la vidéo exportée)
- NE PAS modifier les Cloud Functions
- NE PAS modifier les tracks de la timeline
- `sourceVideoUrl` est un NOUVEAU champ — pas de conflit avec `videoUrl` existant
- L'upload est non-bloquant — Judith peut éditer pendant l'upload
- Rétrocompatible : les items sans `sourceVideoUrl` continuent de fonctionner via `videoUrl`
- Sur iPhone, utiliser `uploadBytesResumable` (pas `uploadBytes`)
- Nettoyer le blob URL précédent quand on en crée un nouveau

## Definition of Done
- [ ] Quand Judith importe/enregistre une vidéo, elle est uploadée en arrière-plan vers Storage
- [ ] Le `workflowState` passe à `shot` après l'import
- [ ] Le `sourceVideoUrl` est sauvegardé dans Firestore
- [ ] En revenant sur l'idée, le bouton affiche "Modifier" (pas "Créer le contenu")
- [ ] En cliquant "Modifier", l'éditeur charge la vidéo source (pas l'ImportModal)
- [ ] Les editorData (sous-titres, overlays, trim) sont restaurés en même temps
- [ ] L'upload source est non-bloquant (Judith peut éditer pendant l'upload)
- [ ] Un indicateur d'upload est visible dans le header
- [ ] Les items avec seulement `videoUrl` (anciens exports) fonctionnent toujours
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `components/features/editor/ImportModal.tsx` (import actuel)
- `components/features/editor/EditorLayout.tsx` (chargement existant + loadExisting)
- `components/features/calendar/ItemDetailSheet.tsx` (bouton Modifier/Créer)
- `lib/store/useEditorStore.ts` (store — loadVideo, videoFile, videoUrl)
- `lib/hooks/useEditorPersistence.ts` (persistance editorData)
- `lib/hooks/useVideoExport.ts` (upload export — pattern à suivre)
- `lib/utils/deriveWorkflowState.ts` (dérivation du workflowState)
- `lib/types/index.ts` (ContentItem type)
