# Milestone R3 — Éditeur texte narratif multi-blocs

## Objectif
Permettre à Judith de créer des vidéos "text story" (texte narratif séquentiel
sans parler). Elle doit pouvoir ajouter 5+ blocs de texte, les positionner dans
le temps, les voir dans la timeline, et les dupliquer rapidement avec le même style.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Zustand, Heroicons.

## Fichiers à lire AVANT de commencer
- `components/features/editor/panels/TextPanel.tsx` → panel texte actuel
- `components/features/editor/text/TextOverlay.tsx` → rendu des overlays + drag
- `components/features/editor/timeline/Timeline.tsx` → timeline actuelle
- `lib/store/useEditorStore.ts` → store Zustand (overlays, actions)
- `lib/types/index.ts` → TextOverlayItem type

## Problèmes actuels
1. Le bouton "Ajouter" disparaît quand un texte est sélectionné (vue liste vs vue édition)
2. Les blocs texte ne sont pas visibles dans la timeline
3. Le timing début/fin se fait uniquement avec des sliders (pas intuitif pour séquencer)
4. Pas de duplication rapide pour créer des séries de blocs avec le même style
5. Pas de moyen rapide de créer N blocs répartis sur la durée

## Livrables

### 1. Bouton "+" toujours visible en mode édition
- [ ] Modifier `components/features/editor/panels/TextPanel.tsx`
Dans la vue édition (quand `selected` est truthy), ajouter un bouton "+"
à côté du bouton "Retour" pour pouvoir ajouter un nouveau texte sans
revenir à la vue liste.

```tsx
// En haut du panel édition, à côté de Retour et Supprimer :
<div className="flex items-center justify-between">
  <button onClick={() => selectOverlay(null)} className="...">
    <ArrowLeftIcon /> Retour
  </button>
  <div className="flex items-center gap-2">
    <button onClick={() => addOverlay()} className="flex items-center gap-1 text-xs bg-sage text-white px-2 py-1 rounded-full">
      <PlusIcon className="w-3 h-3" /> Nouveau
    </button>
    <button onClick={() => removeOverlay(selected.id)} className="...">
      <TrashIcon /> Supprimer
    </button>
  </div>
</div>
```

### 2. Bouton "Dupliquer" dans le panel édition
- [ ] Ajouter action `duplicateOverlay` dans `lib/store/useEditorStore.ts` :
```typescript
duplicateOverlay: (id: string) => {
  const source = get().overlays.find(o => o.id === id);
  if (!source) return;
  const gap = 0.3; // 300ms de gap entre les blocs
  const duration = source.endTime - source.startTime;
  const newStart = source.endTime + gap;
  const newEnd = newStart + duration;
  const newOverlay: TextOverlayItem = {
    ...source,
    id: `txt_${Date.now()}`,
    text: '',  // texte vide — Judith tape le nouveau texte
    startTime: Math.min(newStart, get().duration),
    endTime: Math.min(newEnd, get().duration),
  };
  set(s => ({ overlays: [...s.overlays, newOverlay], selectedOverlayId: newOverlay.id }));
},
```

- [ ] Ajouter bouton "Dupliquer" dans `TextPanel.tsx` vue édition :
```tsx
// Icône : DocumentDuplicateIcon de @heroicons/react/24/outline
<button onClick={() => duplicateOverlay(selected.id)} className="flex items-center gap-1 text-xs text-sage">
  <DocumentDuplicateIcon className="w-3 h-3" /> Dupliquer
</button>
```
Placer entre le bouton "Nouveau" et "Supprimer".

### 3. Blocs texte dans la timeline
- [ ] Créer `components/features/editor/timeline/TextBlocks.tsx`
Affiche les blocs texte comme des barres colorées sous la barre de progression.

```tsx
interface Props {
  overlays: TextOverlayItem[];
  duration: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}
```

**Rendu :**
- Conteneur avec `position: relative`, hauteur 28px
- Chaque bloc = `position: absolute`, `left: (startTime/duration)*100%`,
  `width: ((endTime-startTime)/duration)*100%`
- Couleur : `bg-sage/60` par défaut, `bg-sage` si sélectionné
- Texte tronqué à l'intérieur (text-[10px], truncate)
- `min-width: 20px` pour les blocs très courts
- Tap (onClick) → sélectionne l'overlay et scroll vers le panel d'édition
- Pas de drag pour cette phase (trop complexe sur mobile)

- [ ] Intégrer `TextBlocks` dans `Timeline.tsx`
L'ajouter SOUS la barre de progression vidéo, avant les contrôles.
Seulement visible si `overlays.length > 0`.

```tsx
{overlays.length > 0 && (
  <TextBlocks
    overlays={overlays}
    duration={duration}
    selectedId={selectedOverlayId}
    onSelect={selectOverlay}
  />
)}
```

### 4. Template "Narration" (création rapide de N blocs)
- [ ] Ajouter dans `TextPanel.tsx` vue liste (quand aucun overlay sélectionné)
Un bouton "Narration" qui crée N blocs vides répartis sur la durée :

```tsx
<button onClick={handleNarration} className="flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
  <Bars3BottomLeftIcon className="w-3.5 h-3.5" /> Narration
</button>
```

**Logique `handleNarration` :**
1. Prompt simple : nombre de cartons (par défaut 5)
   → Pour simplifier, pas de prompt — créer directement 5 blocs
2. Durée par bloc = duration / 5 (arrondi à 0.1s)
3. Créer 5 overlays avec :
   - text: `Texte ${i+1}` (placeholder)
   - startTime: i * blockDuration
   - endTime: (i+1) * blockDuration
   - Style par défaut : classic, animation fade, fontSize 24
   - Position : x=0.5, y=0.5 (centre)
4. Sélectionner le premier overlay

### 5. Améliorer la vue liste des overlays
- [ ] Modifier la vue liste dans `TextPanel.tsx`
Au lieu de petits boutons inline, afficher une liste verticale compacte
avec le timing et un aperçu du texte :

```tsx
{overlays
  .sort((a, b) => a.startTime - b.startTime) // Tri chronologique
  .map(o => (
    <button key={o.id} onClick={() => selectOverlay(o.id)}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left
        ${o.id === selectedOverlayId ? 'bg-sage/20 border border-sage/40' : 'bg-gray-800'}`}>
      <span className="text-[10px] text-gray-500 w-10 shrink-0">
        {o.startTime.toFixed(1)}s
      </span>
      <span className="text-xs text-gray-300 truncate flex-1">
        {o.text || '(vide)'}
      </span>
    </button>
  ))}
```

## Contraintes
- Tout doit fonctionner sur iPhone Safari (touch)
- Les blocs dans la timeline : min 44px de hauteur pour être tappables
- Pas de librairie externe pour le drag
- L'export WebCodecs gère DÉJÀ les multi-blocs (pas de changement nécessaire)
- Import Heroicons : PlusIcon, TrashIcon, ArrowLeftIcon, DocumentDuplicateIcon, Bars3BottomLeftIcon
- 0 console.log en production
- Composants < 150 lignes
- Si TextPanel dépasse 150 lignes, extraire la vue édition dans
  `components/features/editor/panels/TextEditView.tsx`

## Definition of Done
- [ ] npm run build passe
- [ ] Bouton "+" accessible en mode édition (sans revenir à la liste)
- [ ] Bouton "Dupliquer" copie le style, positionne après, texte vide
- [ ] Blocs texte visibles dans la timeline (barres colorées)
- [ ] Tap sur un bloc dans la timeline → sélectionne pour édition
- [ ] Bouton "Narration" crée 5 blocs répartis sur la durée
- [ ] Vue liste triée chronologiquement avec timing
- [ ] Tout fonctionne sur Safari iOS (touch)
