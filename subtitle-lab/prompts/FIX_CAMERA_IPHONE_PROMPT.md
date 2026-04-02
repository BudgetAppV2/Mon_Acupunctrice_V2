# FIX — Capture caméra iPhone avec feeling natif

## Problème
Le `getUserMedia` + `MediaRecorder` cause des saccades, cadre noir,
et format étiré sur iOS Safari. On veut le feeling exact de la caméra
native iPhone.

## Solution : `<input type="file" capture="user">`
Au lieu d'utiliser getUserMedia + MediaRecorder (plein de bugs iOS),
utiliser l'élément HTML natif `<input type="file" capture="user">`
qui ouvre la caméra native iOS. C'est exactement la même UX que
l'app Caméra de l'iPhone — pleine résolution, pas de saccades,
format natif.

## Implémentation

### CameraOverlay.tsx — réécriture
Remplacer le overlay fullscreen avec getUserMedia par deux options :

1. **Bouton principal "Enregistrer"** → `<input type="file" capture="user" accept="video/*">`
   - Ouvre la caméra native iOS
   - L'utilisateur enregistre, appuie "Use Video"
   - Le fichier revient comme un File objet
   - On l'ajoute via `addVideoClip(file)`
   - Aucun overlay pendant l'enregistrement (c'est la caméra native)

2. **Bouton secondaire "Caméra web"** (optionnel, pour desktop)
   - Garde le getUserMedia actuel comme fallback pour desktop
   - Caché sur mobile (détecté via touch support ou screen size)

### Détection de la plateforme
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
```

### Code simplifié pour la capture native
```tsx
export default function CameraOverlay({ onClose }: { onClose: () => void }) {
  const { addVideoClip } = useEditorV2Store();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addVideoClip(file);
      onClose();
    }
  };

  // Sur mobile: ouvrir directement le file input qui lance la caméra native
  useEffect(() => {
    if (isMobile) {
      fileRef.current?.click();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <input ref={fileRef} type="file" accept="video/*" capture="user"
        onChange={handleFile} className="hidden" />
      
      {/* Fallback UI si la caméra native ne s'ouvre pas */}
      <div className="text-center space-y-4">
        <button onClick={() => fileRef.current?.click()}
          className="px-6 py-3 bg-red-500 rounded-full text-white font-medium">
          Ouvrir la caméra
        </button>
        <button onClick={onClose}
          className="block mx-auto text-white/50 text-sm">
          Annuler
        </button>
      </div>
    </div>
  );
}
```

## Avantages de cette approche
- Pleine résolution native iPhone
- Pas de saccades
- Pas de cadre noir
- L'utilisateur retrouve l'UI de sa caméra
- Pas de bug de format/orientation
- Fonctionne sur tous les navigateurs iOS (Safari, Chrome, Edge)

## Fichiers à modifier
- `components/features/editor-v2/CameraOverlay.tsx` — réécriture
- `lib/editor-v2/useMediaRecorder.ts` — garder mais ne plus utiliser
  sur mobile

## Definition of Done
- [ ] Sur iPhone: la caméra native s'ouvre quand on appuie "Enregistrer"
- [ ] La vidéo enregistrée s'importe correctement (pas de saccades)
- [ ] Pas de cadre noir ni d'étirement
- [ ] Sur desktop: fallback getUserMedia fonctionne encore
- [ ] Le bouton annuler ferme le overlay
- [ ] npm run build passe
