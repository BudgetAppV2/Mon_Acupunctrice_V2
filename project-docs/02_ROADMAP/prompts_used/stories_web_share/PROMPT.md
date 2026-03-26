# Feature — Stories Instagram via Web Share API

## Problème
La publication de Stories via l'API Graph Instagram ne supporte PAS les stickers
de mention/tag. Judith veut tagger "@lasourceensoi" sur ses Stories. L'API ne le
permet pas — les mentions sont disponibles uniquement dans l'app native Instagram.

## Solution
Remplacer la publication API des Stories par le Web Share API (`navigator.share`).
Le Hub partage la vidéo vers la feuille de partage iOS, Judith choisit
"Instagram Stories", Instagram s'ouvre dans le compositeur de Story avec la vidéo
pré-chargée, et Judith ajoute le tag manuellement (2 taps).

## Recherche validée
- Web Share API Level 2 (file sharing) fonctionne sur Safari iOS 15+
- `navigator.share({ files: [videoFile] })` ouvre la share sheet native
- Instagram Stories est une target valide dans la share sheet iOS
- **CRITIQUE sur iOS Safari :** partager les fichiers SEULS (sans title/text/url)
  sinon ça échoue silencieusement
- Le Hub est sur Vercel (HTTPS) — requis pour Web Share API
- Fonctionne en mode PWA standalone
- Les vidéos > 60s : Instagram les découpe automatiquement quand uploadées via l'app

## Stack
Next.js 15, TypeScript, Tailwind, Zustand.

## Ce qui existe

### PlatformToggles.tsx
- Toggle "Publier aussi en Story Instagram" — appelle l'API Graph
- À MODIFIER : retirer le toggle Story

### useMultiPlatformPublish.ts
- `alsoStory` toggle → appelle `/api/publish-story` → API Graph
- À MODIFIER : retirer tout le flow Story (alsoStory, storyError, publishToApi story)

### PublishSheet.tsx (écran "done")
- Affiche "Publié!" + erreurs + bouton calendrier
- C'est ICI qu'on ajoute le bouton "Partager en Story"

### /api/publish-story/route.ts
- Route API actuelle — NE PAS supprimer (garder comme fichier inactif)

## Changements UI/UX

### Nouveau flow de publication

```
Step 1: Caption (3 tabs IG/FB/YT)  — pas de changement

Step 2: Confirmer
  → Toggles: Facebook ☐ | YouTube ☐    ← Story RETIRÉ des toggles
  → [Publier maintenant] [Planifier]    — pas de changement

Step 3: Écran de succès (done === true)
  ┌─────────────────────────────────────┐
  │         ✅ (CheckCircleIcon)        │
  │      Publié sur Instagram!          │
  │                                     │
  │  ┌─────────────────────────────┐    │
  │  │ 📤 Partager en Story        │    │  ← NOUVEAU bouton principal
  │  │    (ShareIcon)               │    │
  │  └─────────────────────────────┘    │
  │                                     │
  │  Ajoute le tag @lasourceensoi       │  ← petit texte aide-mémoire
  │  dans le compositeur Instagram      │
  │                                     │
  │  (erreurs FB/YT si applicable)      │
  │                                     │
  │  [Voir le calendrier]               │
  └─────────────────────────────────────┘
```

### Détails du bouton "Partager en Story"

**Style :** Bouton secondaire, pas le CTA principal (le calendrier reste le CTA)
- Classe : `border border-sage rounded-xl py-3 text-sage font-medium`
- Icône : `ShareIcon` de Heroicons (ou `ArrowUpOnSquareIcon`)
- Texte : "Partager en Story"

**Comportement :**
1. Vérifier `navigator.canShare({ files: [videoFile] })`
2. Si supporté : créer un `File` object depuis la vidéo exportée et appeler `navigator.share`
3. Si pas supporté : afficher un message "Télécharge la vidéo et partage-la manuellement"

**Code du partage :**
```typescript
const handleShareStory = async () => {
  try {
    // Récupérer le blob de la vidéo exportée depuis l'URL Firebase
    const response = await fetch(item.videoUrl);
    const blob = await response.blob();
    const file = new File([blob], 'story.mp4', { type: 'video/mp4' });

    // CRITIQUE iOS : partager SEULEMENT le fichier, pas de title/text/url
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
    } else {
      // Fallback : télécharger la vidéo
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'story.mp4';
      a.click();
      URL.revokeObjectURL(a.href);
    }
  } catch (err) {
    // L'utilisateur a annulé le share sheet — pas grave
    if ((err as Error).name !== 'AbortError') {
      console.error('[STORY] Share failed:', err);
    }
  }
};
```

### Bouton visible seulement si :
1. La publication Instagram est réussie (done === true)
2. `item.videoUrl` existe (il y a une vidéo exportée)
3. L'appareil supporte potentiellement le share (on vérifie à l'exécution, pas au rendu)

### Texte aide-mémoire sous le bouton
```
<p className="text-xs text-gray-400 text-center mt-1">
  Ajoute le tag @lasourceensoi dans Instagram
</p>
```

## Livrables attendus

### 1. Retirer le toggle Story des PlatformToggles

**Fichier :** `components/features/publish/PlatformToggles.tsx`
- Supprimer la section `alsoStory` / `onToggleStory`
- Supprimer les props `alsoStory`, `onToggleStory`
- Garder les toggles Facebook et YouTube

### 2. Retirer le flow Story de useMultiPlatformPublish

**Fichier :** `lib/hooks/useMultiPlatformPublish.ts`
- Supprimer `alsoStory`, `setAlsoStory`, `storyError`, `setStoryError`
- Supprimer l'appel à `/api/publish-story` dans `handlePublish`
- Garder `fbError` et `ytError`

### 3. Ajouter le bouton "Partager en Story" dans l'écran done

**Fichier :** `components/features/publish/PublishSheet.tsx`

Dans le bloc `if (done)`, ajouter :
- Un bouton "Partager en Story" avec `handleShareStory`
- Le texte aide-mémoire "@lasourceensoi"
- Un state `sharing` pour feedback pendant le téléchargement du blob

### 4. Nettoyer les props dans PublishSheet

**Fichier :** `components/features/publish/PublishSheet.tsx`
- Retirer `alsoStory`, `setAlsoStory`, `storyError` des destructured de `useMultiPlatformPublish`
- Retirer `storyError` de l'affichage des erreurs dans l'écran done

### 5. NE PAS supprimer /api/publish-story/route.ts
Garder le fichier comme backup inactif. Il n'est plus appelé mais pourrait servir si l'API Graph ajoute le support des mentions dans le futur.

## Contraintes
- Sur iOS Safari, `navigator.share` DOIT être appelé avec `{ files: [file] }` SEULEMENT
  PAS de title, text, ou url — sinon ça échoue silencieusement sur iOS
- Le bouton doit fonctionner même si le share sheet est annulé (try/catch AbortError)
- Le téléchargement du blob vidéo peut être lent — afficher un spinner
- Le `fetch(item.videoUrl)` télécharge la vidéo depuis Firebase Storage — s'assurer que le CORS est OK
- Si `navigator.canShare` n'est pas supporté → fallback téléchargement
- NE PAS modifier les Cloud Functions
- NE PAS modifier l'export vidéo
- Mobile first 375px

## Definition of Done
- [ ] Le toggle "Story" est retiré des PlatformToggles
- [ ] Le bouton "Partager en Story" apparaît après une publication réussie
- [ ] Un tap ouvre la feuille de partage iOS avec la vidéo
- [ ] Judith peut choisir "Instagram Stories" dans la share sheet
- [ ] Le texte "@lasourceensoi" rappelle de tagger la clinique
- [ ] Fallback téléchargement si Web Share non supporté
- [ ] Pas de crash si l'utilisateur annule le share sheet
- [ ] Les erreurs Facebook/YouTube s'affichent toujours correctement
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `components/features/publish/PublishSheet.tsx`
- `components/features/publish/PlatformToggles.tsx`
- `lib/hooks/useMultiPlatformPublish.ts`
- `app/api/publish-story/route.ts` (ne pas supprimer)
