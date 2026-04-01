# FEAT — Intégrer TemPolor AI Music dans AudioSheet V2

## Objectif
Ajouter un onglet "Générer" dans l'AudioSheet V2 qui permet de générer
de la musique instrumentale IA via l'API TemPolor. L'utilisateur entre
un prompt texte (ex: "musique zen et douce pour vidéo d'acupuncture")
et reçoit un track généré qu'il peut ajouter à sa timeline.

## API TemPolor — Endpoints

### Base URL: `https://api.tempolor.com`

### 1. Générer instrumental
```
POST /open-apis/v1/instrumental/generate
Headers:
  Authorization: Tempo-XXXXX (la clé API)
  Content-Type: application/json; charset=utf-8
Body:
{
  "prompt": "Genre: Ambient, Meditation Style: Instrumental, Soft Mood: Calm, Peaceful",
  "model": "TemPolor i3.5",
  "callback_url": "https://mon-acupunctrice-v2.vercel.app/api/tempolor/callback"
}
Response 200:
{
  "status": 200000,
  "message": "success",
  "data": { "item_ids": ["abc123"] }
}
```

### 2. Query task status (polling)
```
POST /open-apis/v1/instrumental/query
Headers: (mêmes)
Body: { "item_ids": ["abc123"] }
Response 200:
{
  "data": {
    "instrumentals": [{
      "item_id": "abc123",
      "status": "succeeded",  // running | main_succeeded | succeeded | failed
      "title": "Peaceful Ambient",
      "prompt": "...",
      "duration": 120,
      "audio_url": "https://...mp3",   // valide 3 jours
      "audio_hi_url": "https://...wav", // valide 3 jours
      "style": "Ambient"
    }]
  }
}
```

### Modèles disponibles
- `TemPolor i3` : 3 crédits/track, max 2 min, rapide
- `TemPolor i3.5` : 4 crédits/track, max 4.5 min, meilleure qualité

### Flow asynchrone
1. POST generate → reçoit item_ids
2. Poll avec POST query toutes les 3 secondes
3. Quand status = "succeeded" → audio_url est disponible
4. Download le MP3 via proxy et ajouter comme AudioClip

## Routes API à créer

### `app/api/tempolor/generate/route.ts`
- POST — proxy vers TemPolor generate
- Ajoute le header Authorization avec `TEMPOLAR_API_KEY` du serveur
- Pas de callback_url pour l'instant — on fait du polling

### `app/api/tempolor/status/route.ts`
- POST — proxy vers TemPolor query
- Body: { item_ids: ["..."] }
- Retourne le status + audio_url

## Variable d'environnement
- `TEMPOLAR_API_KEY` — déjà dans .env.local

## Modifications AudioSheet.tsx

L'AudioSheet a actuellement Jamendo (recherche) + fichier local.
Ajouter un toggle/onglet entre "Bibliothèque" (Jamendo) et "Générer" (TemPolor).

### Onglet "Générer" (TemPolor)
```
┌──────────────────────────────────────┐
│ [Bibliothèque] [Générer ✨]          │
│                                      │
│ Décrivez la musique souhaitée:       │
│ ┌──────────────────────────────────┐ │
│ │ Musique zen et douce pour vidéo  │ │
│ │ d'acupuncture, piano doux avec   │ │
│ │ sons de nature                   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Modèle: [i3 (2min)] [i3.5 (4.5min)] │
│                                      │
│ [✨ Générer]                         │
│                                      │
│ ⏳ Génération en cours... 12s        │
│ ████████░░░░░░░░                     │
│                                      │
│ ✅ Track généré — 2:34               │
│ [▶ Preview]  [+ Ajouter]            │
└──────────────────────────────────────┘
```

### Presets de prompts (boutons rapides)
- "Zen & méditation" → "Genre: Ambient, Meditation Style: Instrumental, Soft Mood: Calm, Peaceful, piano and nature sounds"
- "Bien-être" → "Genre: New Age, Wellness Style: Instrumental, Warm Mood: Soothing, Healing, soft strings"
- "Énergique" → "Genre: Pop, Upbeat Style: Instrumental, Dynamic Mood: Energetic, Positive, modern beat"
- "Cinématique" → "Genre: Cinematic, Orchestral Style: Instrumental, Epic Mood: Dramatic, Emotional"

## Fichiers à créer/modifier
- `app/api/tempolor/generate/route.ts` — route proxy génération
- `app/api/tempolor/status/route.ts` — route proxy polling status
- `components/features/editor-v2/AudioSheet.tsx` — ajouter onglet Générer

## Definition of Done
- [ ] Toggle Bibliothèque/Générer dans l'AudioSheet
- [ ] Textarea pour le prompt texte
- [ ] Sélection du modèle (i3 ou i3.5)
- [ ] Boutons presets de prompts
- [ ] Bouton Générer qui lance la génération
- [ ] Indicateur de progression (polling toutes les 3s)
- [ ] Preview audio du track généré
- [ ] Bouton "Ajouter" qui ajoute le track à la timeline
- [ ] Routes API proxy (generate + status)
- [ ] npm run build passe
