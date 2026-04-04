# FIX — AudioContext reste "suspended" sur Safari iOS

## Symptôme observé
Le playback vidéo fonctionne, le trim fonctionne, mais l'audio du clip vidéo
joue environ 1 seconde puis disparaît. La musique fonctionne quand ajoutée.

## Logs Safari iOS (console)
```
[AUDIO_ENGINE] Created AudioContext, state: – "suspended"
[AUDIO_ENGINE] Connected – "v1" – "→ GainNode → destination"
[CLIP_PLAY] – "v1" – "6df27fda" – "new"
```

**Pas de log `[AUDIO_ENGINE] Resumed`** → l'AudioContext ne passe jamais à "running".

## Cause racine
Sur Safari iOS, `audioCtx.resume()` ne fonctionne QUE si appelé **directement dans
le call stack synchrone d'un geste utilisateur** (touchend, click).

Le code actuel appelle `resumeAudio()` dans un `useEffect` qui réagit au changement
de `isPlaying`. React exécute les effects de manière asynchrone — Safari considère
que ce n'est plus dans le call stack du geste utilisateur et REFUSE le resume.

Séquence actuelle (cassée sur Safari iOS) :
1. User touche Play → `onClick` → `store.setIsPlaying(true)` → React re-render
2. `useEffect([isPlaying])` → `resumeAudio().then(...)` ← TROP TARD, plus dans le geste

## Solution

### Approche : Résumer l'AudioContext dans le handler du bouton Play

Il faut que le composant qui contient le bouton Play appelle `audioCtx.resume()`
DIRECTEMENT dans son onClick, pas via un effect. Mais le bouton Play est dans
`ControlPanel.tsx` ou `MiniScrubber.tsx`, pas dans `SubtitleCanvas.tsx`.

### Option retenue : exposer une ref/callback depuis SubtitleCanvas

1. Dans `useAudioEngine()`, exposer une fonction `ensureRunning()` qui crée
   l'AudioContext s'il n'existe pas ET le resume — synchrone dans le geste.

2. Dans `SubtitleCanvas`, le play/pause effect garde le `resumeAudio()` comme
   fallback, mais on ajoute un `onPointerDown` / `onTouchStart` sur le canvas
   overlay qui résume l'AudioContext. Le canvas couvre toute la zone — tout tap
   passera par là.

3. Alternative plus simple : dans le play/pause effect, au lieu de `resumeAudio().then()`
   qui est async, on peut essayer un pattern où l'AudioContext est créé lazy au
   premier play — mais ça ne résout pas le problème du call stack.

### Fix le plus simple et fiable

Ajouter un listener `touchstart` / `click` sur le document qui resume l'AudioContext
dès le premier geste utilisateur, AVANT même que Play soit pressé :

```ts
// Dans useAudioEngine, ajouter :
useEffect(() => {
  const handleGesture = () => {
    const engine = engineRef.current;
    if (engine && engine.ctx.state === 'suspended') {
      engine.ctx.resume().then(() => {
        console.log('[AUDIO_ENGINE] Resumed via user gesture, state:', engine.ctx.state);
      });
    }
  };
  document.addEventListener('touchstart', handleGesture, { once: false });
  document.addEventListener('click', handleGesture, { once: false });
  return () => {
    document.removeEventListener('touchstart', handleGesture);
    document.removeEventListener('click', handleGesture);
  };
}, []);
```

Ce pattern est utilisé par tous les frameworks audio web (Tone.js, Howler.js, etc.)
Sur le PREMIER toucher de l'utilisateur sur la page (n'importe quel toucher),
l'AudioContext sera resumed. Quand il appuiera sur Play, le ctx sera déjà "running".

### Aussi : ne PAS créer l'AudioContext au montage

Actuellement `connectElement()` appelle `getOrCreateEngine()` qui crée l'AudioContext
dès l'init du premier clip. C'est trop tôt. L'AudioContext devrait être créé
lazy, idéalement aussi dans un geste utilisateur.

Modifier `getOrCreateEngine` pour qu'il crée le ctx mais ajoute immédiatement
un listener pour le résumer au premier geste.

## Changements concrets dans SubtitleCanvas.tsx

### 1. useAudioEngine — ajouter le gesture listener
Ajouter un `useEffect` avec `touchstart` + `click` listeners sur `document`
qui appellent `engine.ctx.resume()`. Pas de `{ once: true }` — on veut que
chaque toucher re-résume (au cas où iOS le suspend en background).

### 2. Ajouter un log dans le play/pause effect
Après `resumeAudio()`, log l'état :
```ts
console.log('[AUDIO_ENGINE] Play pressed, ctx state:', engineRef.current?.ctx.state);
```
Ça nous aidera à debugger si le problème persiste.

### 3. Garder le resumeAudio() dans le play/pause comme fallback
Le gesture listener devrait résoudre 99% des cas, mais garder le resume dans
le play effect comme filet de sécurité.

## Tests de validation
- [ ] Ouvrir l'éditeur V2 sur iPhone
- [ ] Toucher n'importe où sur l'écran (le canvas par ex)
- [ ] Vérifier dans les logs : `[AUDIO_ENGINE] Resumed via user gesture`
- [ ] Appuyer Play → l'audio du clip est audible
- [ ] Pause → Play → l'audio reprend
- [ ] Ajouter musique → les deux jouent ensemble
