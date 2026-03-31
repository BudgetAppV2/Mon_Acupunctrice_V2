# V2_M1 — Route + Lib + Store

## Objectif
Poser les fondations de l'Editor V2 dans le Hub : copier les fichiers lib du Lab, creer le store V2, creer la route, configurer les headers COOP/COEP.

## Fichiers a lire avant de coder

### Lab (source)
- `subtitle-lab/lib/store.ts` — store Zustand complet du Lab (source de verite)
- `subtitle-lab/lib/types.ts` — tous les types (VideoClip, AudioClip, Track, SubtitleBlock, TextOverlay, StylePreset, etc.)
- `subtitle-lab/lib/renderer.ts` — moteur de rendu canvas 2D
- `subtitle-lab/lib/animations.ts` — 8 animations de sous-titres
- `subtitle-lab/lib/playback.ts` — helpers playback (findActiveClip, createVideoElement, coverCrop, CANVAS_W/H)
- `subtitle-lab/lib/filters.ts` — 16 filtres CSS
- `subtitle-lab/lib/presets.ts` — presets de styles
- `subtitle-lab/lib/controlOptions.ts` — options de controle UI
- `subtitle-lab/lib/subtitleGrouper.ts` — groupeur de mots en blocs
- `subtitle-lab/lib/frenchPostProcess.ts` — corrections francais quebecois
- `subtitle-lab/lib/useTranscription.ts` — hook transcription AssemblyAI
- `subtitle-lab/lib/useSubtitleDrag.ts` — hook drag sous-titres/overlays sur canvas
- `subtitle-lab/lib/useMediaRecorder.ts` — hook camera + enregistrement
- `subtitle-lab/lib/testData.ts` — donnees de test
- `subtitle-lab/lib/luts/lutParser.ts` — parseur LUT
- `subtitle-lab/lib/luts/lutRenderer.ts` — renderer WebGL LUT
- `subtitle-lab/lib/luts/presets.ts` — presets LUT

### Hub (patterns de reference)
- `lib/store/useEditorStore.ts` — store V1 (voir `recalcTimelineStarts`, `syncLegacyFields`, `VideoClip` avec `sourceVideoUrl`)
- `lib/types/index.ts` — types Hub (ContentItem, VideoClip Hub avec `sourceVideoUrl`)
- `app/(app)/editeur/[id]/page.tsx` — pattern route V1 (use(params))
- `app/(app)/layout.tsx` l.58 — `pathname.startsWith('/editeur')` cache la nav
- `next.config.mjs` l.22-34 — headers COOP/COEP sur `/editeur/:path*`

## Ce que ce milestone doit accomplir

### 1. Copier les fichiers lib du Lab dans `lib/editor-v2/`

Copier les 17 fichiers de `subtitle-lab/lib/` vers `lib/editor-v2/` :
- `types.ts`, `store.ts`, `renderer.ts`, `animations.ts`, `playback.ts`
- `filters.ts`, `presets.ts`, `controlOptions.ts`
- `subtitleGrouper.ts`, `frenchPostProcess.ts`
- `useTranscription.ts`, `useSubtitleDrag.ts`, `useMediaRecorder.ts`
- `testData.ts`
- `luts/lutParser.ts`, `luts/lutRenderer.ts`, `luts/presets.ts`

Corriger tous les imports internes pour pointer vers `@/lib/editor-v2/` au lieu de chemins relatifs du Lab. Par exemple, `import { ... } from './types'` dans `store.ts` doit devenir `import { ... } from './types'` (relatif au meme dossier — ca ne change pas) mais les imports depuis les composants devront utiliser `@/lib/editor-v2/store`.

### 2. Creer le store V2

Creer `lib/store/useEditorV2Store.ts` en adaptant `subtitle-lab/lib/store.ts`.

Ajouts par rapport au Lab store :
- Champ `itemId: string | null` + action `setItemId(id: string)`
- Action `loadFromFirestore(data: Record<string, unknown>)` qui restaure l'etat depuis un document Firestore (sera implementee en M3, signature seulement pour l'instant)
- Action `reset()` qui remet le store a son etat initial (cleanup quand on quitte)
- Champ `sourceVideoUrl: string | null` sur le type `VideoClip` (pour reload apres refresh — pattern du V1 `lib/types/index.ts`)

Le store doit :
- Rester compatible avec le Lab (memes actions, memes types)
- Utiliser les types de `lib/editor-v2/types.ts` (pas les types Hub)
- Exporter `useEditorV2Store` (pas `useSubtitleStore`)
- Garder exactement la meme interface pour que les composants copies en M2 fonctionnent

### 3. Creer la route

Creer `app/(app)/editeur-v2/[id]/page.tsx` :
- Pattern identique a `app/(app)/editeur/[id]/page.tsx`
- `use(params)` pour extraire l'id (Next.js 15 async params)
- Importer un placeholder `EditorV2Layout` (composant vide cree ici, sera rempli en M2)
- Passer `itemId={id}` en prop

Creer `components/features/editor-v2/EditorV2Layout.tsx` en placeholder :
- Client component (`'use client'`)
- Affiche un ecran noir avec le texte "Editor V2 — Loading..." centre
- Accepte `{ itemId: string }` en props

### 4. Configurer les headers COOP/COEP

Dans `next.config.mjs`, ajouter une entree headers pour `/editeur-v2/:path*` avec les memes headers COOP/COEP que `/editeur/:path*` (Cross-Origin-Opener-Policy: same-origin, Cross-Origin-Embedder-Policy: credentialless).

### 5. Verifier la navigation

Dans `app/(app)/layout.tsx`, la condition `pathname.startsWith('/editeur')` cache deja la bottom nav pour `/editeur-v2/...` aussi. Verifier que c'est bien le cas. Si le code utilise une comparaison exacte (`pathname === '/editeur'`), le corriger.

## Ce que ce milestone ne fait PAS
- Pas de composants UI (M2)
- Pas de persistance Firestore (M3)
- Pas d'export video (M6)
- Pas de feature flag (M7)
- `loadFromFirestore()` est une signature vide (stub) — l'implementation vient en M3

## Definition of Done
1. `npm run build` passe sans erreur
2. Les 17 fichiers lib sont copies dans `lib/editor-v2/` avec imports corrects
3. `lib/store/useEditorV2Store.ts` existe avec `itemId`, `setItemId`, `reset`, `loadFromFirestore` (stub), et `sourceVideoUrl` sur VideoClip
4. La route `/editeur-v2/[id]` affiche le placeholder
5. La bottom nav est cachee sur `/editeur-v2/...`
6. Les headers COOP/COEP s'appliquent sur `/editeur-v2/:path*`
7. Le V1 (`/editeur/[id]`) fonctionne toujours identiquement
8. Aucun console.log en production
