# Feature — Sélection de la cover AVANT l'export

## Problème
Actuellement la cover picture est sélectionnée APRÈS l'export, dans le PublishSheet (step 1 sur 3). Le problème :
- Le CoverPicker recharge la vidéo (même avec le blob URL fix, c'est une étape supplémentaire post-export)
- Sur une vidéo de 90s, le seek du slider peut être lent
- L'utilisatrice doit attendre l'export PUIS sélectionner la cover — double attente
- Si elle n'aime pas la cover, elle ne peut pas revenir en arrière facilement

## Solution
Déplacer la sélection de cover DANS l'éditeur, comme un onglet du toolbar (à côté de Trim, Filtres, Texte, etc.). La cover est sélectionnée pendant le montage, avant l'export. La vidéo est déjà en mémoire — le seek est instantané.

## Stack
Next.js 15, TypeScript, Tailwind CSS, Zustand.

## Ce qui existe déjà

### EditorToolbar.tsx
Tabs : Trim, Filtres, Texte, Sous-titres, Audio, Images (disabled).
Le tab actif est un state dans EditorLayout (`activeTab`).

### CoverPicker.tsx (~120 lignes)
- Slider pour sélectionner la frame (range input avec step adaptatif et debounce)
- Capture de frame via canvas (`createImageBitmap` ou `drawImage`)
- Upload d'image custom depuis Photos
- Preview de la cover (128px wide, 9:16)
- Utilise déjà le blob URL du store pour le seek rapide

### useEditorStore.ts
Propriétés pertinentes : `videoFile`, `videoUrl` (blob), `thumbnailUrl` (data URL du thumbnail), `duration`, `trimStart`, `trimEnd`.
Pas de propriété pour la cover sélectionnée actuellement — elle est dans le state local du PublishSheet.

### PublishSheet.tsx (3 steps)
- Step 1 : CoverPicker (sélection cover)
- Step 2 : CaptionEditor (caption)
- Step 3 : Confirmer (publier/planifier)

### EditorLayout.tsx
- Panels affichés selon `activeTab` dans un `flex-1 min-h-0 overflow-y-auto`
- Chaque panel est un composant séparé dans `components/features/editor/panels/`

## Livrables attendus

### 1. Ajouter la cover au store Zustand

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter :
```typescript
coverFrameOffset: number;       // offset en ms de la frame sélectionnée (défaut: 0)
coverDataUrl: string | null;    // data URL de la frame capturée
coverCustomUrl: string | null;  // URL Firebase si image custom uploadée
setCoverFrame: (offset: number, dataUrl: string) => void;
setCoverCustom: (url: string) => void;
clearCover: () => void;
```
Reset dans `reset()` et `loadVideo()`.

### 2. Créer le panel CoverPanel.tsx

**Fichier :** `components/features/editor/panels/CoverPanel.tsx`

Réutiliser la logique du CoverPicker existant mais adapté au format panel de l'éditeur :
- Utilise directement le `<video>` element du VideoPreview via le blob URL du store (pas de deuxième `<video>`)
- Slider horizontal pour scrubber la position (même pattern que le TrimPanel)
- Preview de la frame sélectionnée (petite vignette 9:16)
- Bouton "Depuis Photos" pour uploader une image custom
- Quand le slider bouge : seek la vidéo preview + capture la frame → store
- La vidéo preview montre la frame en temps réel pendant le scrub

**UX du panel :**
```
[Preview vignette 9:16]  |  Frame à 2.5s
[========|==============] (slider)
[Depuis Photos]
```

Le panel est compact (même hauteur que les autres panels).

### 3. Ajouter l'onglet "Cover" au toolbar

**Fichier :** `components/features/editor/EditorToolbar.tsx`

Ajouter un tab "Cover" dans la liste TABS, positionné APRÈS Audio :
```typescript
{ id: 'cover', label: 'Cover' },
```
Remplacer le tab "Images" (disabled) par "Cover" (actif).

### 4. Intégrer le CoverPanel dans EditorLayout

**Fichier :** `components/features/editor/EditorLayout.tsx`

Ajouter dans le switch des panels :
```typescript
{activeTab === 'cover' && <CoverPanel />}
```

### 5. Modifier le PublishSheet — supprimer le step CoverPicker

**Fichier :** `components/features/publish/PublishSheet.tsx`

- Supprimer le step 1 (CoverPicker) — la cover est déjà dans le store
- Le PublishSheet passe de 3 steps à 2 steps :
  - Step 1 : CaptionEditor (caption)
  - Step 2 : Confirmer (publier/planifier avec toggles plateformes)
- Utiliser `coverDataUrl` et `coverCustomUrl` du store pour l'upload de la cover pendant la publication
- Si aucune cover n'a été sélectionnée dans l'éditeur, utiliser la première frame (offset 0) comme défaut

### 6. Prompt avant export si pas de cover

**Fichier :** `components/features/editor/ExportButton.tsx`

Avant de lancer l'export, si `coverDataUrl` est null et `coverCustomUrl` est null :
- Afficher un petit warning inline : "Pas de cover sélectionnée — la première frame sera utilisée"
- Avec un bouton "Choisir une cover" qui switch vers le tab cover (`onTabChange?.('cover')`)
- Le warning n'est PAS bloquant — Judith peut exporter sans cover
- Ajouter une prop `onSwitchTab?: (tab: string) => void` à ExportButton

### 7. Nettoyage — supprimer ou simplifier CoverPicker.tsx

**Fichier :** `components/features/publish/CoverPicker.tsx`

Ce composant n'est plus utilisé dans le PublishSheet. Deux options :
- Le supprimer complètement si plus référencé nulle part
- Ou le garder comme fallback pour les cas où on ouvre le PublishSheet sans passer par l'éditeur (ex: depuis ItemDetailSheet direct)

Vérifier les usages avant de supprimer.

## Contraintes
- NE PAS modifier les tracks de la timeline
- NE PAS modifier ResizeDivider, TrimHandle
- NE PAS modifier la logique d'export (exportWebCodecs, useVideoExport) — seul le PublishSheet change
- NE PAS modifier les Cloud Functions
- Le panel Cover doit avoir la même hauteur que les autres panels
- Le slider de cover doit être debounced (200ms) comme dans le CoverPicker actuel
- La capture de frame doit utiliser le même pattern createImageBitmap que CoverPicker
- Mobile first 375px

## Definition of Done
- [ ] L'onglet "Cover" apparaît dans le toolbar de l'éditeur
- [ ] Le panel Cover montre un slider + preview de la frame
- [ ] Bouger le slider met à jour la preview vidéo en temps réel
- [ ] La frame sélectionnée est stockée dans le Zustand store
- [ ] Le PublishSheet n'a plus de step CoverPicker (passe de 3 à 2 steps)
- [ ] Un warning non-bloquant s'affiche avant l'export si pas de cover
- [ ] Le bouton "Choisir une cover" dans le warning switch vers le tab Cover
- [ ] Upload d'image custom depuis Photos fonctionne dans le CoverPanel
- [ ] Exporter sans cover sélectionnée utilise la première frame comme défaut
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `components/features/editor/EditorToolbar.tsx` (toolbar actuel)
- `components/features/editor/EditorLayout.tsx` (layout panels)
- `components/features/publish/CoverPicker.tsx` (logique de capture à réutiliser)
- `components/features/publish/PublishSheet.tsx` (flow 3 steps à simplifier)
- `components/features/editor/ExportButton.tsx` (warning pre-export)
- `lib/store/useEditorStore.ts` (store à enrichir)
