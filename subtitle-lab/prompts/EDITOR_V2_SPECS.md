# EDITOR V2 — Brief pour Claude Code

## Vision
L'éditeur V2 est le Subtitle Lab (subtitle-lab/) reconstruit comme page
du Hub Mon Acupunctrice V2. Le UI/UX du Lab est la cible — tout ce qui
est visible et interactif dans le Lab doit fonctionner pareil ou mieux
dans le V2. La différence c'est que le V2 est branché sur Firestore,
Firebase Auth, Firebase Storage, et le pipeline de publication du Hub.

## Règle d'or
Le Lab est le prototype. Le V2 est le produit. Si quelque chose marche
dans le Lab, le garder. Si quelque chose est cassé dans le Lab, le fixer.
Ne pas juste copier-coller — construire un éditeur qui fonctionne.

---

## Ce qui fonctionne dans le Lab (GARDER le UI/UX)
- Canvas 540×960 avec RAF loop pour le preview vidéo
- 8 presets de sous-titres avec 7 animations (renderer.ts + animations.ts)
- Import vidéo avec affichage immédiat de la première frame
- Transcription AssemblyAI (Universal-3 Pro, français québécois)
- 16 filtres CSS avec slider d'intensité
- Text overlays draggables sur le canvas (8 presets réutilisant le subtitle engine)
- Sous-titres draggables sur le canvas
- CoverPanel avec slider de frame pour la vignette
- AudioSheet avec import, volume, fade, ducking
- CameraOverlay avec countdown 3-2-1
- Toolbar mobile avec 7 onglets (Import, Tracks, Audio, Filtres, Subs, Texte, Cover)
- Bottom sheet system
- MiniScrubber persistant
- Viewport mobile-first (meta viewport no-zoom)

## Ce qui est cassé dans le Lab (FIXER dans le V2)

### Bug 1 — Timeline drag bounce-back
Les blocs dans la timeline (tracks panel) ne restent pas à leur position
après un drag. Le clip revient à sa position originale. Ça affecte les
clips vidéo, les blocs sous-titres et les text overlays.
Le Hub V1 a un pattern de drag qui fonctionne dans
`components/features/editor/timeline/TrimHandle.tsx` — à considérer.

### Bug 2 — Filtres ne s'affichent pas sur Safari
ctx.filter ne fonctionne PAS sur Safari iOS (WebKit bug #198416).
Le Lab utilise déjà style.filter CSS comme workaround — s'assurer que
ça fonctionne correctement dans le V2 aussi bien en preview qu'à l'export.

### Bug 3 — Scrubber pas toujours synchronisé
Le scrubber ne seek pas toujours la vidéo correctement. Les frames
ne s'affichent pas en temps réel pendant le scrub. Le scrubber doit
montrer la frame exacte correspondant à la position du playhead.

### Bug 4 — Thumbnails des filtres
Les vignettes des filtres n'utilisent pas toujours l'image de la vidéo.
Elles devraient montrer un frame de la vidéo avec le filtre appliqué.

### Bug 5 — Gradient visible après import
Parfois le gradient de démo reste visible après l'import d'une vidéo.
La vidéo devrait s'afficher immédiatement sans avoir à appuyer play.

---

## Ce qu'il faut AJOUTER (pas dans le Lab)

### Persistance Firestore
- L'état de l'éditeur doit survivre au refresh
- Auto-save vers Firestore (debounce, comme le V1)
- Pattern de référence : `lib/hooks/useEditorPersistence.ts`
- Champ `editorDataV2` sur la collection `contentItems` (pas toucher au V1)
- Les vidéos/audios importés doivent être uploadés vers Firebase Storage
  pour pouvoir être rechargés après un refresh

### Auth
- La route doit être protégée par l'auth Firebase du Hub
- Pattern : `lib/hooks/useAuth.ts`

### Export
- Exporter un MP4 avec les sous-titres gravés, les filtres appliqués,
  et les text overlays rendus
- Upload vers Firebase Storage
- Update du contentItem (videoUrl, workflowState)
- Pattern de référence : `lib/hooks/useVideoExport.ts`

### Route cachée
- Créer une route type `/editeur-v2/[id]` dans le hub
- Cachée de la navigation (pas de lien dans la nav)
- La nav existante se cache déjà quand pathname commence par `/editeur`
- Pattern : `app/(app)/editeur/[id]/page.tsx`

### Feature flag
- NEXT_PUBLIC_EDITOR_V2=true pour router vers le V2
- Quand le flag est activé, les boutons "Éditer" du calendrier et des
  idées pointent vers /editeur-v2/[id] au lieu de /editeur/[id]

---

## Structure du Hub (pour contexte)

### Fichiers de référence Hub V1 (à lire pour comprendre les patterns)
- `lib/hooks/useEditorPersistence.ts` — auto-save Firestore
- `lib/hooks/useVideoExport.ts` — export pipeline
- `lib/hooks/useAuth.ts` — auth pattern
- `lib/store/useEditorStore.ts` — store Zustand du V1
- `lib/firebase.ts` — Firebase init
- `components/features/editor/timeline/TrimHandle.tsx` — drag pattern
- `components/features/editor/timeline/Track.tsx` — timeline pattern
- `app/(app)/editeur/[id]/page.tsx` — route éditeur V1
- `app/(app)/layout.tsx` — nav hiding logic

### Le Lab (source du UI/UX)
- `subtitle-lab/` — tout le dossier est le prototype
- `subtitle-lab/lib/store.ts` — le store à adapter
- `subtitle-lab/components/SubtitleCanvas.tsx` — le coeur du renderer
- `subtitle-lab/lib/renderer.ts` — le moteur de rendu canvas
- `subtitle-lab/app/page.tsx` — le layout mobile

---

## Instructions pour Claude Code

### Étape 1 : PLAN
Analyse la codebase du Lab ET du Hub. Propose un plan de migration
en milestones. Chaque milestone doit être un oneshot prompt autonome
que tu pourras exécuter ensuite.

### Étape 2 : ÉCRIRE LES PROMPTS
Pour chaque milestone, écris un fichier prompt dans
`subtitle-lab/prompts/V2_M{N}_PROMPT.md` avec :
- Les fichiers à lire avant de coder
- Ce que le milestone doit accomplir
- Les bugs à résoudre dans ce milestone (si applicable)
- La Definition of Done
- NE PAS prescrire les solutions — juste les problèmes et les résultats attendus

### Ce qu'on attend
- Le V2 doit avoir EXACTEMENT le même look & feel que le Lab
- Les bugs listés doivent être résolus
- La persistance Firestore doit fonctionner
- L'export doit fonctionner
- L'auth doit fonctionner
- Le V1 ne doit PAS être cassé
- `npm run build` doit passer à chaque milestone
