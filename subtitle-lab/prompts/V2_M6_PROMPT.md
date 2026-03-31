# V2_M6 — Export Pipeline

## Objectif
Creer le pipeline d'export video pour le V2 : rendu canvas offscreen avec le renderer du Lab, encodage WebCodecs, upload Firebase Storage, mise a jour du contentItem, et bouton d'export avec barre de progression. Wire la publication via PublishSheet.

## Fichiers a lire avant de coder

### Hub (patterns de reference)
- `lib/hooks/useVideoExport.ts` — pipeline export V1 complet (WebCodecs, upload resumable, thumbnail, mise a jour Firestore)
- `lib/utils/exportWebCodecs.ts` — `exportWithWebCodecs()` (si ce fichier existe — logique d'encodage)
- `lib/editor/buildExportScene.ts` — construction de la scene d'export V1 (si ce fichier existe)
- `components/features/editor/ExportButton.tsx` — bouton export V1 avec progression
- `components/features/publish/PublishSheet.tsx` — sheet de publication multi-plateforme
- `lib/firebase.ts` — `getFirebaseStorage()`, `getFirebaseAuth()`, `getFirebaseFirestore()`

### Editor V2 (cree en M1-M5)
- `lib/editor-v2/renderer.ts` — `renderFrame()` du Lab (canvas 2D, sous-titres, overlays)
- `lib/editor-v2/playback.ts` — `CANVAS_W`, `CANVAS_H`, `findActiveClip`, `coverCrop`
- `lib/editor-v2/filters.ts` — CSS filters
- `lib/editor-v2/types.ts` — tous les types
- `lib/store/useEditorV2Store.ts` — store V2
- `components/features/editor-v2/EditorV2Layout.tsx` — layout ou wire l'export

## Ce que ce milestone doit accomplir

### 1. Creer `lib/hooks/useVideoExportV2.ts`

Pipeline d'export adapte au V2.

States : `'idle' | 'preparing' | 'exporting' | 'uploading' | 'done' | 'error'`

Flow :
1. **Preparing** : verifier que WebCodecs est supporte. Charger les fonts utilisees. Preparer la scene.
2. **Exporting** : pour chaque frame de la timeline :
   - Dessiner le frame video sur un canvas offscreen (540x960 ou 1080x1920 selon la source)
   - Appliquer le CSS filter du clip actif (via un canvas intermediaire si necessaire — `ctx.filter` ne fonctionne pas sur Safari)
   - Appeler `renderFrame()` du Lab pour dessiner les sous-titres et text overlays
   - Encoder via WebCodecs (VideoEncoder + AudioEncoder + mp4-muxer)
   - Reporter la progression
3. **Uploading** : upload resumable vers `videos/{userId}/{itemId}/export.mp4`
4. **Done** : mettre a jour le contentItem dans Firestore :
   - `videoUrl` = URL de l'export
   - `workflowState` = 'ready'
   - `exportedAt` = serverTimestamp()
   - Upload et sauvegarder la `thumbnailUrl` (cover frame)

Le renderer du Lab (`renderFrame`) est concu pour le canvas 2D et accepte les memes options en preview et en export. L'export doit l'utiliser directement.

Pour le filtre CSS en export : `ctx.filter` fonctionne sur Chrome mais PAS sur Safari. Alternatives a considerer :
- Utiliser `ctx.filter` quand supporte (Chrome), sinon appliquer le filtre via un canvas CSS intermediaire
- Ou utiliser les LUT WebGL du Lab (`luts/lutRenderer.ts`) pour l'export uniquement

### 2. Creer `components/features/editor-v2/ExportButtonV2.tsx`

Bouton d'export avec :
- Detection WebCodecs au mount (cacher le bouton si pas supporte)
- Affichage de la progression pendant l'export et l'upload
- Messages d'erreur user-friendly
- Apres export termine, proposer la publication (ouvrir PublishSheet)

Voir `ExportButton.tsx` du V1 comme reference pour le UI.

### 3. Wire PublishSheet

Apres un export reussi :
- Charger le contentItem depuis Firestore
- Ouvrir `PublishSheet` avec l'item mis a jour (videoUrl, workflowState: 'ready')
- Le PublishSheet existant (`components/features/publish/PublishSheet.tsx`) est reutilise tel quel

### 4. Wire dans EditorV2Layout

- Ajouter ExportButtonV2 dans le header (position droite, comme le V1)
- Ajouter le state pour PublishSheet (showPublish, publishItem)
- Flow : export done → charger contentItem → setPublishItem → setShowPublish(true)

## Ce que ce milestone ne fait PAS
- Pas de multi-clip export (comme le V1, limiter a 1 clip pour l'instant — afficher un message si plusieurs clips)
- Pas de modification du PublishSheet
- Pas de templates video (le V2 n'a pas le systeme de themes du V1)

## Definition of Done
1. `npm run build` passe sans erreur
2. Le bouton export est visible dans le header quand WebCodecs est supporte
3. L'export produit un MP4 avec les sous-titres graves, les filtres, et les text overlays
4. La barre de progression fonctionne pendant l'export et l'upload
5. Le MP4 est uploade vers Firebase Storage
6. Le contentItem est mis a jour dans Firestore (videoUrl, workflowState, exportedAt)
7. La thumbnail est uploadee
8. Apres export, le PublishSheet s'ouvre pour publier
9. Les erreurs sont affichees clairement (navigateur non supporte, video trop longue, erreur reseau)
10. Le V1 n'est pas affecte
11. Aucun console.log en production
12. Fonctionne sur mobile 375px
