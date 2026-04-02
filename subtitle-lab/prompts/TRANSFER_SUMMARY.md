# État actuel Editor V2 — Résumé de transfert (2026-04-02 fin de session)

## CE QUI FONCTIONNE ✅
- WebGL shader filters (brightness, contrast, saturation, sepia, grayscale, hue-rotate) — validé Lab + Hub V2 sur Safari iOS
- Scrubbing fluide (toutes les frames sont là quand on scrub)
- Camera plein écran, pas d'étirement (fix aspect ratio h-full + 9/16)
- Hit-testing drag sous-titres vs text overlays
- Trim handles sur vidéo, sous-titres, text overlays
- Fade handles triangle sur waveform audio
- Waveform audio aligné à la durée timeline
- Jamendo music search + TemPolor AI generation
- Canvas interactif avec bottom sheet ouverte
- Build marker log pour confirmer les déploiements

## BUG ACTIF 🔴 — Playback multi-track cassé

### Symptômes
1. **Vidéo figée après trim** — quand on trim un bloc vidéo, il devient une image fixe au playback
2. **Audio musique inaudible quand vidéo joue** — la musique Jamendo/TemPolor n'est audible que quand il n'y a pas de bloc vidéo actif. Les deux devraient jouer ensemble avec volumes contrôlés par les sliders Voix/Musique dans le panneau Audio
3. **Le playback est saccadé sur Safari iOS** — lié au seek pendant le play

### Cause racine identifiée
Le fix des saccades Safari iOS a supprimé les `vid.currentTime = expected` pendant le play. Sur Safari iOS, chaque seek interrompt le pipeline de décodage vidéo pendant 300-400ms (prouvé par les logs RVFC_TICK: gaps de 315ms, 366ms, 401ms avec `seeking: true`).

MAIS supprimer TOUS les seeks casse la gestion des clips :
- Un clip trimmé ne se repositionne plus
- La vidéo continue de jouer depuis sa position initiale

### Ce qui a été tenté
- `playingClips` changé de `Set` à `Map<clipId, { trimStart, trimEnd }>` pour détecter les trims et re-seek seulement quand nécessaire — **n'a pas résolu le problème**
- `vid.muted = false` toujours + `vid.volume = voiceVolume` — la vidéo reste trop forte par rapport à la musique

### Approche suggérée
Le Lab (subtitle-lab/) n'a PAS ces problèmes car il utilise un seul RAF loop simple avec un seul `<video>`. Le multi-track video pool du Hub V2 ajoute trop de complexité. Options :
1. Simplifier le SubtitleCanvas du Hub V2 en s'inspirant du Lab (un seul RAF loop, un seul video element)
2. OU investiguer pourquoi le fix Map ne fonctionne pas — le build marker confirme que le code est déployé mais le comportement n'a pas changé

### Logs disponibles
- `[EDITOR_V2] build:...` — confirme la version déployée
- Les logs de debug audio (AUDIO_INIT, AUDIO_STATE, AUDIO_OK) ont été nettoyés par Claude Code malgré qu'on les voulait

## Fichiers clés
- `components/features/editor-v2/SubtitleCanvas.tsx` — le composant principal (~320 lignes)
- `lib/editor-v2/webglRenderer.ts` — module WebGL (shaders GLSL)
- `lib/editor-v2/playback.ts` — findActiveClipsAllTracks(), coverCrop()
- `subtitle-lab/components/SubtitleCanvas.tsx` — version Lab qui FONCTIONNE (224 lignes, fluide sur iOS)
- `subtitle-lab/prompts/FIX_MULTITRACK_PLAYBACK_PROMPT.md` — le dernier prompt (non résolu)

## Commandes utiles
- Deploy Hub: `cd ~/Desktop/Mon_Acupunctrice_V2 && export PATH="$HOME/.npm-global/bin:$PATH" && vercel --prod --yes`
- Deploy Lab: `cd ~/Desktop/Mon_Acupunctrice_V2/subtitle-lab && export PATH="$HOME/.npm-global/bin:$PATH" && vercel --prod --yes`
- Git: branche `feature/subtitle-lab`
