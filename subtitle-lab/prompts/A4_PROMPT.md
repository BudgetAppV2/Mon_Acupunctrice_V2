# A4 — Audio complet (import, volume, fade, waveform)

## Contexte
Subtitle Lab a le multi-clip (A1-A3). On ajoute l'import audio (fichier local), le mix voix/musique, fade in/out, ducking, et un waveform sur la piste audio du sheet Tracks.

## Stack
Next.js 16, React 19, Zustand 5, TypeScript, Tailwind 3.

## Fichiers a lire AVANT de commencer
- `subtitle-lab/lib/store.ts` → Store avec tracks[]. La track audio a `audioClips: AudioClip[]`.
- `subtitle-lab/lib/types.ts` → AudioClip interface.
- `subtitle-lab/app/page.tsx` → SheetId system. Ajouter 'audio'.
- `subtitle-lab/components/TracksPanel.tsx` → Piste audio doit montrer le waveform.
- `subtitle-lab/components/SubtitleCanvas.tsx` → Le `<video>` element pour le playback video.
- `components/features/editor/panels/AudioPanel.tsx` (editeur principal) → 123 lignes. Reference UI.

---

## Livrable 1 — Store audio enrichi

**Fichier :** `subtitle-lab/lib/store.ts`

Ajouter au store :
```typescript
voiceVolume: number;   // 0-1, defaut 1.0 — volume de la VIDEO (voix)
audioVolume: number;   // 0-1, defaut 0.3 — volume de la MUSIQUE
audioDucking: boolean; // defaut false — UI seulement (le vrai ducking est a l'export)
```

Actions :
```typescript
addAudioClip: (file: File, name: string) => void;
removeAudioClip: (id: string) => void;
setVoiceVolume: (v: number) => void;
setAudioVolume: (v: number) => void;
setAudioDucking: (on: boolean) => void;
setAudioFade: (clipId: string, fadeIn: number, fadeOut: number) => void;
```

---

## Livrable 2 — Sheet Audio (AudioSheet.tsx)

**Nouveau fichier :** `subtitle-lab/components/AudioSheet.tsx`

Bottom sheet mobile-first avec :
1. **Import** : bouton "Fichier local" (`<input type="file" accept="audio/*">`)
2. **Controles** (si audio charge) :
   - Nom + bouton Retirer (XMarkIcon)
   - Slider "Voix" : 0-100% → controle `voiceVolume` (= video.volume)
   - Slider "Musique" : 0-100% → controle `audioVolume` (= audioElement.volume)
   - Sliders "Fade in" / "Fade out" : 0-3s, pas de 0.5s
   - Toggle "Auto-ducking" : on/off (UI seulement pour le Lab,
     le vrai ducking via Web Audio API GainNodes sera a l'export)

---

## Livrable 3 — Playback audio : architecture CRITIQUE

**IMPORTANT — Comment l'audio fonctionne (lecons apprises dans editor-pro) :**

Il y a DEUX sources audio independantes :
1. **La voix** = l'audio de la video. Elle joue via l'element `<video>`.
   Le volume voix est controle par `videoElement.volume = voiceVolume`.
2. **La musique** = un fichier audio importe separement. Elle joue via
   un element `<audio>` SEPARE (pas le meme que la video).
   Le volume musique est controle par `audioElement.volume = audioVolume`.

**Fichier :** `subtitle-lab/components/SubtitleCanvas.tsx`

Ajouter un `audioRef = useRef<HTMLAudioElement>(null)` pour la musique :
- Quand un AudioClip est ajoute au store → creer l'element audio, set src
- Quand `isPlaying` → `audioRef.current.play()` en sync avec la video
- Quand pause → `audioRef.current.pause()`
- `audioRef.current.volume = audioVolume` (reactif)
- `videoRef.current.volume = voiceVolume` (reactif)
- Synchro : lors du scrub, `audioRef.current.currentTime = videoRef.current.currentTime`

**Le ducking reel** necessite Web Audio API avec GainNodes pour baisser
la musique quand la voix parle. C'est complexe et sera fait a l'export
en Phase B. Pour le Lab, le toggle ducking est UI-only (on sauvegarde
la preference, on l'applique a l'export).

---

## Livrable 4 — Waveform mini sur la piste audio

**Fichier :** `subtitle-lab/components/TracksPanel.tsx` (ou nouveau `AudioWaveform.tsx`)

Quand un AudioClip est present, generer un waveform simplifie :
1. Decoder l'audio via `AudioContext.decodeAudioData(file.arrayBuffer())`
2. Sampler les amplitudes (reduire a ~100 barres)
3. Dessiner des barres verticales dans un canvas mini (largeur du bloc, 48px)
4. **Cacher** le waveform data (ne pas recalculer a chaque render)

---

## Livrable 5 — Integrer le sheet Audio dans page.tsx

Ajouter `'audio'` au SheetId. Icone MusicalNoteIcon dans la Toolbar.

---

## Contraintes
- NE PAS implementer la recherche Jamendo (pas d'API route dans le Lab standalone)
- NE PAS implementer le ducking reel (Web Audio GainNodes = Phase B export)
- La voix = video.volume, la musique = audio.volume (DEUX elements separes)
- Le waveform est genere une seule fois (cache)
- 0 console.log en production
- Composants < 150 lignes
- `npm run build` dans `subtitle-lab/` = succes

## Definition of Done
- [ ] Import audio local fonctionne (fichier .mp3/.wav/.m4a)
- [ ] Slider voix controle video.volume en temps reel
- [ ] Slider musique controle audioElement.volume en temps reel
- [ ] La musique joue en sync avec la video (play/pause/scrub)
- [ ] Fade in/out sliders dans le sheet Audio (valeurs sauvees dans AudioClip)
- [ ] Toggle ducking present (UI seulement, pas de GainNode)
- [ ] Le waveform apparait sur la piste audio dans le sheet Tracks
- [ ] `npm run build` passe dans `subtitle-lab/`
