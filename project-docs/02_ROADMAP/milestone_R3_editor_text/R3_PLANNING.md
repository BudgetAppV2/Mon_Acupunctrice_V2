# Milestone R3 — Éditeur texte narratif (multi-blocs)

## Contexte & cas d'usage
Judith veut créer des vidéos où elle ne parle pas — elle se filme en train de
faire quelque chose (ex: mettre ses boucles d'oreilles) pendant qu'un texte
narratif défile comme une série de cartons/blocs. C'est le format "text story"
très populaire sur Instagram Reels et TikTok en 2026.

### Limitations actuelles
1. Le bouton "Ajouter" disparaît quand un texte est sélectionné
2. Les blocs texte ne sont pas visibles dans la timeline
3. Le timing début/fin se fait avec des sliders séparés (pas intuitif)
4. Pas de moyen rapide de séquencer plusieurs blocs
5. Pas de template "narration séquentielle"

### Benchmarks (CapCut, InShot, Descript)
- CapCut : multi-track timeline, blocs draggables, keyframe animation, duplication
- InShot : interface simple, animation par bloc, ajustement timing par drag
- Descript : text overlay positionné visuellement, timeline multi-layer

## Améliorations proposées (5 features)

### Feature 1 — Bouton "+" toujours visible
**Priorité : HAUTE**
Le bouton "Ajouter un texte" doit rester visible même quand un texte est
sélectionné pour l'édition. Actuellement il est dans la "vue liste" qui
disparaît quand on édite.

**Fix :** Ajouter un bouton "+" compact dans la vue édition (à côté de "Retour")
pour que Judith puisse enchaîner: ajouter texte 1 → éditer → ajouter texte 2
→ éditer → etc. sans revenir à la liste.

### Feature 2 — Blocs texte dans la timeline
**Priorité : HAUTE**
Les blocs texte doivent apparaître comme des barres colorées dans la timeline
sous la vidéo. Chaque bloc est positionné horizontalement selon son
startTime/endTime.

**UX :**
- Rangée de blocs sous la barre de progression vidéo
- Chaque bloc = petite barre avec le début du texte tronqué
- Couleur : sage/vert pour les distinguer de la vidéo
- Tap sur un bloc = le sélectionne pour l'édition

**Interactions tactiles (stretch goal) :**
- Drag horizontal = déplacer le bloc dans le temps
- Drag les bords = resize début/fin
(Note: le drag est complexe sur mobile, à évaluer)

### Feature 3 — Duplication rapide d'un bloc
**Priorité : MOYENNE**
Bouton "Dupliquer" dans le panel d'édition. Duplique le bloc sélectionné
avec le même style, animation, taille — mais avec un texte vide et
positionné juste après dans le temps.

**Workflow Judith :**
1. Créer le premier bloc → style gold, animation slide_up, taille 24px
2. Dupliquer → même style, texte vide, start = endTime du bloc précédent
3. Taper le nouveau texte
4. Dupliquer encore → répéter
→ En 30 secondes elle a 5 blocs narratifs avec le même style

### Feature 4 — Template "Narration séquentielle"
**Priorité : MOYENNE**
Un bouton "Narration" dans le TextPanel qui crée automatiquement N blocs
de texte répartis uniformément sur la durée de la vidéo.

**Flow :**
1. Clic "Narration" → prompt "Combien de cartons?" → 5
2. Crée 5 blocs vides, chacun de durée = (vidéoDuration / 5)
3. Bloc 1: 0-3s, Bloc 2: 3-6s, Bloc 3: 6-9s, etc.
4. Même style par défaut, animation fade
5. Judith n'a plus qu'à remplir les textes

### Feature 5 — Gestion des animations améliorée
**Priorité : BASSE**
Quand un texte est sélectionné, preview l'animation en temps réel
(actuellement il faut play la vidéo pour voir). Ajouter un mini-preview
ou un feedback visuel dans le panel d'édition.

---

## Architecture technique

### Fichiers impactés
- `components/features/editor/panels/TextPanel.tsx` — Features 1, 3, 4
- `components/features/editor/timeline/Timeline.tsx` — Feature 2
- `lib/store/useEditorStore.ts` — action duplicateOverlay
- `components/features/editor/timeline/TextBlocks.tsx` — NOUVEAU, Feature 2

### Store changes
```typescript
// Nouvelle action dans useEditorStore
duplicateOverlay: (id: string) => void;
// Logique: copie l'overlay, nouveau id, texte vide,
// startTime = original.endTime, endTime = original.endTime + (original.endTime - original.startTime)
```

### Timeline TextBlocks component
```typescript
// Nouvelle rangée dans la Timeline
interface TextBlocksProps {
  overlays: TextOverlayItem[];
  duration: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}
// Affiche les blocs comme des barres horizontales proportionnelles au temps
// Chaque bloc est positionné: left = (startTime/duration)*100%, width = ((endTime-startTime)/duration)*100%
```

---

## Priorités pour le prompt Claude Code

### Phase 1 (essentiel — débloquer Judith)
- [x] Feature 1 — Bouton "+" toujours visible
- [x] Feature 3 — Duplication rapide
- [x] Feature 2 — Blocs texte dans la timeline (version simple, tap only)

### Phase 2 (nice to have)
- [ ] Feature 4 — Template "Narration séquentielle"
- [ ] Feature 2b — Drag des blocs dans la timeline
- [ ] Feature 5 — Preview animation en temps réel

---

## Contraintes
- Tout doit fonctionner sur iPhone Safari (touch)
- Les blocs dans la timeline doivent être assez grands pour être tappables (min 44px hauteur)
- Pas de librairie externe pour le drag (utiliser pointer events natifs)
- L'export WebCodecs doit continuer à fonctionner avec les multi-blocs (déjà le cas)
- Heroicons uniquement, 0 console.log, composants < 150 lignes

## Definition of Done
- [ ] npm run build passe
- [ ] Judith peut ajouter 5+ blocs texte séquentiels
- [ ] Les blocs sont visibles dans la timeline
- [ ] Le bouton "+" est accessible en mode édition
- [ ] La duplication copie le style et positionne après
- [ ] Les blocs exportent correctement (déjà fonctionnel)
