# FIX — Intégrer Jamendo dans AudioSheet V2

## Objectif
Ajouter une recherche de musique libre de droits via l'API Jamendo
dans l'onglet Audio de l'éditeur V2. L'utilisateur peut chercher
une musique, écouter un preview, et l'ajouter à sa timeline.

## API Jamendo v3.0
- Base URL: `https://api.jamendo.com/v3`
- Endpoint: `/tracks/?client_id={CLIENT_ID}&format=json&search={query}&limit=10`
- Pas d'auth OAuth requise pour la recherche — juste un client_id
- Variable env: `NEXT_PUBLIC_JAMENDO_CLIENT_ID`
- Champs utiles dans la réponse:
  - `results[].id` — ID du track
  - `results[].name` — titre
  - `results[].artist_name` — artiste
  - `results[].duration` — durée en secondes
  - `results[].audio` — URL streaming MP3 (96kbps, usage gratuit avec attribution)
  - `results[].audiodownload` — URL download MP3 (nécessite client_id)
  - `results[].image` — pochette album (petite)

## Route API proxy (optionnel mais recommandé)
Créer une route API `/api/jamendo/search` pour éviter d'exposer le
client_id côté client et éviter les problèmes CORS :
```
app/api/jamendo/search/route.ts
GET /api/jamendo/search?q=relaxing+piano&limit=10
→ proxy vers api.jamendo.com/v3/tracks avec le client_id serveur
→ retourne les résultats filtrés
```

## Modifications AudioSheet.tsx

L'AudioSheet actuel a seulement un bouton "Fichier local".
Ajouter au-dessus :

1. **Barre de recherche** — input text avec placeholder "Rechercher musique libre..."
2. **Résultats Jamendo** — liste scrollable de tracks avec :
   - Pochette (image 40x40)
   - Titre + artiste
   - Durée
   - Bouton play/pause pour preview
   - Bouton "+" pour ajouter à la timeline
3. **Preview audio** — un `<audio>` caché pour écouter un preview
4. **Ajouter** — quand l'utilisateur clique "+", télécharger l'audio
   et l'ajouter comme AudioClip via `addAudioClip`
5. **Attribution** — afficher "Musique par Jamendo" en petit en bas

## Layout de l'AudioSheet V2

```
┌──────────────────────────────────────┐
│ AUDIO                                │
│                                      │
│ [🔍 Rechercher musique libre...    ] │
│                                      │
│ ┌─ Résultats ──────────────────────┐ │
│ │ 🖼 Calm Piano - Artist    2:34 [+]│ │
│ │ 🖼 Soft Guitar - Artist   3:12 [+]│ │
│ │ 🖼 Ambient Pad - Artist   4:05 [+]│ │
│ └──────────────────────────────────┘ │
│                                      │
│ ── ou ──                             │
│                                      │
│ [🎵 Fichier local]                   │
│                                      │
│ ── Piste active ──                   │
│ 🎵 track-name.mp3            [✕]    │
│ Voix: ═══════════● 100%             │
│ Musique: ═══════════● 30%           │
│ Fade in: ══● 0s   Fade out: ══● 0s │
│ Auto-ducking: ○                      │
│                                      │
│ 🎵 Musique par Jamendo              │
└──────────────────────────────────────┘
```

## Fichiers à créer/modifier
- `app/api/jamendo/search/route.ts` — route proxy API
- `components/features/editor-v2/AudioSheet.tsx` — ajouter la recherche

## Variables d'environnement
- `JAMENDO_CLIENT_ID` — clé API Jamendo (côté serveur)

## Definition of Done
- [ ] Barre de recherche visible dans l'onglet Audio
- [ ] Recherche retourne des résultats de Jamendo
- [ ] Preview audio jouable (play/pause)
- [ ] Bouton "+" ajoute le track comme AudioClip
- [ ] Le fichier local continue de fonctionner
- [ ] Attribution Jamendo visible
- [ ] npm run build passe
