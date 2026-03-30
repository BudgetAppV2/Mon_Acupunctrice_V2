# A3 — Multi-clip playback (preview sequentielle N clips)

## Contexte
Subtitle Lab a un store tracks[] (A1) et un sheet Tracks (A2). Actuellement, un seul element `<video>` gere un seul fichier. On ajoute le playback sequentiel : N clips sur une piste video sont joues les uns apres les autres avec changement de source au bon moment.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3, Canvas 2D.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/components/SubtitleCanvas.tsx` → 151 lignes. RAF loop avec video.currentTime, drawImage, renderFrame. Un seul videoRef.
- `subtitle-lab/lib/store.ts` → Store avec tracks[], getActiveVideoClip(), recalcTimelineStarts().
- `subtitle-lab/lib/types.ts` → VideoClip avec timelineStart, trimStart, trimEnd, blobUrl.
- `project-docs/02_ROADMAP/prompts_used/multiclip_M2_timeline/PROMPT.md` → 203 lignes. Spec complete : getClipAtTime(), changement de source, playback sequentiel, gestion des trous.
- `lib/store/useEditorStore.ts` (editeur principal) → lignes 20-38, pattern recalcTimelineStarts.

---

## Livrable 1 — getClipAtTime() helper

**Fichier :** `subtitle-lab/lib/store.ts` (ou un nouveau `subtitle-lab/lib/playback.ts`)

```typescript
export function getClipAtTime(
  clips: VideoClip[],
  globalTimeMs: number,
): { clip: VideoClip; localTimeMs: number } | null {
  for (const c of clips) {
    const clipDur = c.trimEnd - c.trimStart;
    if (globalTimeMs >= c.timelineStart && globalTimeMs < c.timelineStart + clipDur) {
      return { clip: c, localTimeMs: c.trimStart + (globalTimeMs - c.timelineStart) };
    }
  }
  return null;
}
```

---

## Livrable 2 — Modifier la RAF loop pour le multi-clip

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Le RAF loop actuel (lignes 56-116) utilise un seul `videoRef` et `videoUrlRef`. Modifier pour :

1. Ajouter un ref `activeClipIdRef` pour tracker quel clip est actif
2. A chaque frame :
   - Lire les clips de la piste video depuis le store
   - Appeler `getClipAtTime(clips, currentTimeMs)`
   - Si le clip a change (different id) : changer `videoRef.current.src` et seek
   - Si aucun clip : dessiner un fond noir
   - Si clip actif : `ctx.drawImage(videoRef.current, ...)` comme avant

```typescript
// Dans la RAF loop, AVANT drawImage :
const clips = getVideoTrack(tracksRef.current)?.clips ?? [];
const result = getClipAtTime(clips, timeRef.current);

if (!result) {
  // Trou entre les clips → fond noir
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
} else if (result.clip.id !== activeClipIdRef.current) {
  // Changement de clip → charger la nouvelle source
  activeClipIdRef.current = result.clip.id;
  if (vid && result.clip.blobUrl) {
    vid.src = result.clip.blobUrl;
    vid.currentTime = result.localTimeMs / 1000;
  }
} else if (vid && vid.readyState >= 2) {
  // Meme clip → dessiner la frame
  ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, CANVAS_W, CANVAS_H);
}
```

3. Pendant le playback : quand `video.currentTime * 1000 >= clip.trimEnd`, c'est le signal de passer au clip suivant. Le RAF loop le detectera automatiquement car `getClipAtTime` retournera le clip suivant.

4. Pendant le scrub (pas en lecture) : `video.currentTime = localTimeMs / 1000` directement.

---

## Livrable 3 — Import 2e video → nouvelle piste V2

**Fichier :** `subtitle-lab/lib/store.ts`

Modifier `addVideoClip(file)` :
- Si la track V1 a deja des clips → creer une nouvelle Track V2 avec le clip
- Sinon → ajouter a la track V1 existante

Regle multi-cam : la piste la plus haute au temps courant est le preview principal. Si V1 et V2 ont un clip au meme temps, V1 gagne.

Modifier `getActiveVideoClip` pour respecter cette priorite (parcourir les tracks video dans l'ordre, retourner le premier clip trouve).

---

## Livrable 4 — Sync play/pause avec le bon clip

La logique play/pause existante (`vid.play()` / `vid.pause()`) reste, mais doit s'assurer que la bonne source est chargee avant de play. Si on appuie play a t=5000ms et que le clip a cet instant est le clip 2, il faut d'abord charger le clip 2 puis play.

---

## Contraintes
- DEUX elements `<video>` : un principal (lecture) et un preload (cache le clip suivant)
  Le preload charge `nextClip.blobUrl` en avance pour eviter le flash noir
  au changement de clip. Quand on switch, on echange les roles des deux elements.
  Si la memoire est un probleme sur iPhone, fallback a un seul element avec flash noir acceptable
- Le changement de source peut causer un flash noir — c'est acceptable pour V1
- NE PAS modifier le renderer.ts (les sous-titres se dessinent par-dessus)
- NE PAS modifier FilterPanel, ControlPanel, PresetGallery
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] `getClipAtTime()` retourne le bon clip + localTime
- [ ] Import 2e video → cree automatiquement une piste V2 (multi-cam)
- [ ] Les 2 pistes sont visibles dans le sheet Tracks
- [ ] Le preview montre le bon clip pendant le scrub
- [ ] Le playback sequentiel joue les clips les uns apres les autres
- [ ] Les trous entre clips affichent un fond noir
- [ ] Le scrub dans un clip different change la source video
- [ ] `npm run build` passe dans `subtitle-lab/`
