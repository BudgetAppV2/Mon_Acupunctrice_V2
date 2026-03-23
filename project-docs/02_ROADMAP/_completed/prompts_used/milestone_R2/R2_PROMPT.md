# Milestone R2 — Transcription vocale d'idées

## Objectif
Permettre à Judith de dicter une idée de contenu vocalement. L'audio est
transcrit par Whisper, puis Claude structure le texte en titre + notes
sans réécrire les mots de Judith.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Storage,
Cloud Function transcribeAudio (Whisper), API Anthropic (Claude).

## Fichiers à lire AVANT de commencer
- `components/features/ideas/CreateIdeaSheet.tsx` → formulaire actuel (ajouter le micro)
- `app/api/transcribe/route.ts` → proxy vers Cloud Function existante
- `app/api/generate-caption/route.ts` → pattern API route avec Claude
- `lib/firebase.ts` → config Firebase client (Storage)

## Flow complet

```
Judith clique micro → enregistrement audio (MediaRecorder, max 60s)
→ stop → upload audio vers Firebase Storage (temp/)
→ appel API /api/voice-idea avec le storagePath
→ API route appelle Cloud Function transcribeAudio → texte brut
→ API route envoie le texte à Claude pour structurer
→ retourne { title, notes, category? }
→ remplit automatiquement le formulaire CreateIdeaSheet
```

## Livrables

### 1. Composant VoiceRecordButton
- [ ] `components/features/ideas/VoiceRecordButton.tsx`
Bouton micro compact qui s'intègre à côté du champ titre dans CreateIdeaSheet.

**3 états :**
- **Idle** : bouton micro (MicrophoneIcon outline, gris)
- **Recording** : bouton pulsant rouge + compteur secondes + bouton stop
- **Processing** : spinner + "Transcription..."

**Comportement :**
- Clic → demande permission micro → commence l'enregistrement (MediaRecorder)
- Max 60 secondes d'enregistrement (auto-stop)
- L'audio est enregistré en webm/opus (ou mp4 sur Safari)
- Quand l'enregistrement stop :
  1. Upload le blob audio vers Firebase Storage `temp/{userId}/{timestamp}.webm`
  2. Appelle POST /api/voice-idea avec { storagePath }
  3. Reçoit { title, notes, category? }
  4. Appelle les callbacks pour remplir le formulaire

**Props :**
```typescript
interface Props {
  onResult: (result: { title: string; notes: string; category?: string }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}
```

### 2. API Route — Voice Idea
- [ ] `app/api/voice-idea/route.ts`
```
POST /api/voice-idea
body: { storagePath: string }

1. Valider storagePath
2. Appeler la Cloud Function transcribeAudio :
   POST {FIREBASE_FUNCTIONS_URL}/transcribeAudio
   body: { data: { storagePath, cleanup: true } }
   → retourne { subtitles: [{ text, startTime, endTime }] }
3. Reconstruire le texte brut depuis les subtitles :
   const rawText = subtitles.map(s => s.text).join(' ')
4. Appeler Claude pour structurer :
   - Modèle : claude-sonnet-4-20250514
   - System prompt : structurer une idée de contenu
   - User prompt : le texte brut de Judith
5. Retourner { title, notes, category? }
```

**Prompt Claude pour structurer l'idée :**
```
Tu es un assistant pour Judith, acupunctrice québécoise à Montréal.
Elle vient de dicter une idée de vidéo pour ses réseaux sociaux.

Ton rôle est de STRUCTURER son idée, pas de la réécrire.
Garde son vocabulaire et ses expressions.

À partir du texte dicté, extrais :
1. Un titre court (max 60 caractères) qui résume le sujet
2. Des notes de tournage (points clés, idées visuelles, ce qu'elle veut montrer)
3. Optionnel : une catégorie si elle mentionne un domaine (fertilite, grossesse, bien_etre, mtc, douleur, stress, autre)

Réponds UNIQUEMENT en JSON valide, sans backticks :
{"title": "...", "notes": "...", "category": "..."}

Texte dicté par Judith :
```

**Utiliser l'API Anthropic directement** dans la route (pas la Cloud Function generateCaption)
car le prompt est différent et plus simple.
Utiliser la variable `ANTHROPIC_API_KEY` ou `NEXT_PUBLIC_FIREBASE_API_KEY`...
Attends — on n'a pas de clé Anthropic dans les env vars Next.js.
On doit soit :
a. Ajouter ANTHROPIC_API_KEY dans .env.local et Vercel
b. Passer par la Cloud Function generateCaption avec un nouveau mode "structurer"
c. Utiliser l'API Anthropic intégrée dans l'artifact (voir anthropic_api_in_artifacts)

**Option recommandée : (a)** Ajouter ANTHROPIC_API_KEY dans .env.local.
C'est le plus simple et le plus flexible.

### 3. Intégrer dans CreateIdeaSheet
- [ ] Modifier `components/features/ideas/CreateIdeaSheet.tsx`
- Ajouter VoiceRecordButton à côté du champ titre
- Quand onResult est appelé :
  - setTitle(result.title)
  - setNotes(result.notes)
  - Si result.category → setCategory(result.category)
- Le formulaire est pré-rempli, Judith peut modifier avant de soumettre
- Layout : le micro est à droite du label "Titre *"

### 4. Variable d'environnement
- [ ] Ajouter `ANTHROPIC_API_KEY` dans `.env.local`
- [ ] Ajouter dans Vercel → Settings → Environment Variables
- [ ] Mettre à jour DEPLOY.md

## Design UX

Le bouton micro est discret — une icône gris à côté du titre.
Quand actif, il prend tout l'espace du formulaire avec :
- Un indicateur visuel d'enregistrement (cercle pulsant rouge)
- Un compteur "0:05 / 1:00"
- Un bouton stop (carré blanc dans cercle rouge)

Après l'enregistrement, le formulaire se remplit avec une animation douce.
Judith peut modifier le titre et les notes avant de soumettre.

Si la transcription échoue, afficher un message simple :
"Transcription impossible. Essaie à nouveau ou écris ton idée."

## Contraintes
- MediaRecorder : préférer MP4 sur Safari, WebM sur Chrome
- Max 60 secondes d'enregistrement
- L'audio est supprimé de Storage après transcription (cleanup: true)
- Heroicons uniquement (MicrophoneIcon)
- 0 console.log en production
- Composants < 150 lignes
- Le formulaire reste utilisable sans le micro (pas de régression)

## Definition of Done
- [ ] npm run build passe
- [ ] Bouton micro visible dans CreateIdeaSheet à côté du titre
- [ ] Enregistrement audio fonctionne (permission micro demandée)
- [ ] Transcription → structuration → formulaire pré-rempli
- [ ] Judith peut modifier le résultat avant de soumettre
- [ ] Erreur gracieuse si micro non disponible ou transcription échoue
- [ ] Audio temporaire nettoyé de Firebase Storage après transcription
