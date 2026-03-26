# Feature — Captions multi-plateformes générées à partir de la transcription

## Problème
Actuellement le système génère UNE caption pour une plateforme au choix (IG/FB/YT), et cette même caption est envoyée à TOUTES les plateformes activées. Résultat :
- Instagram reçoit des captions avec des liens (inutiles — non cliquables sur IG)
- Facebook reçoit des captions avec des hashtags (moins efficace sur FB)
- YouTube reçoit des captions Instagram courtes (devrait être SEO-first avec description longue)
- La caption est basée sur le titre/notes de l'idée — pas sur le CONTENU RÉEL de la vidéo

## Solution
Générer les captions à partir de la **transcription audio** (sous-titres) — c'est le meilleur point de départ puisqu'on a le texte exact de ce que Judith dit dans la vidéo. Claude produit 3 captions optimisées en un seul appel, une par plateforme.

## Stack
Next.js 15, TypeScript, Zustand, Anthropic API (Claude Sonnet).

## Ce qui existe déjà

### Transcription/sous-titres
Les sous-titres sont déjà générés via Whisper et stockés dans le store Zustand :
```typescript
interface SubtitleSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  words: SubtitleWord[];
}
```
Le texte complet de la transcription peut être reconstitué en joignant tous les `segment.text`.

### CaptionEditor.tsx (actuel)
- 3 boutons IG/FB/YT pour choisir la plateforme
- Bouton "Générer avec l'IA" qui appelle `/api/generate-caption-v2`
- UN textarea pour UNE caption
- La même caption est utilisée partout

### generate-caption-v2 (API route actuelle)
- Appelle Claude Sonnet avec un system prompt adapté par plateforme
- Basé sur titre + catégorie + notes (PAS la transcription)
- Retourne une seule caption

### Publication
- Instagram : CF `publishToInstagram` lit `item.caption` de Firestore
- Facebook : route lit `item.caption`
- YouTube : route lit `item.caption` et ajoute des hashtags et le lien RDV

### platformOptimization.ts
- `STYLE_CTAS` : CTA par style de contenu × plateforme
- `PLATFORM_RECOMMENDATIONS` : durée idéale, max chars, nombre de hashtags

## Livrables attendus

### 1. Nouvelle API route `/api/generate-captions` (pluriel)

**Fichier :** `app/api/generate-captions/route.ts`

Un seul appel à Claude qui retourne les 3 captions. Le prompt reçoit :
- `transcript` : le texte complet de la transcription (tous les segments joints)
- `title` : titre de l'idée
- `category` : catégorie (acupuncture, bien-être, etc.)
- `contentStyle` : style de contenu (enseigner, connecter, aider, inspirer)
- `notes` : notes optionnelles

**System prompt pour Claude :**
```
Tu es un assistant pour Judith, acupunctrice québécoise à Montréal.
Tu rédiges des captions pour ses publications vidéo sur les réseaux sociaux.
Tu as accès à la TRANSCRIPTION de ce que Judith dit dans la vidéo.
Utilise ses propres mots et son ton naturel. Écris en français québécois.

IMPORTANT : Retourne un JSON avec exactement 3 clés : instagram, facebook, youtube.

Règles Instagram :
- Hook percutant en première ligne (max 125 caractères, c'est ce qui s'affiche avant "...plus")
- Corps concis qui résume le message clé de la vidéo
- CTA : "[CTA selon le style]"
- 3 à 5 hashtags pertinents à la fin
- Pas de lien (non cliquable sur Instagram)
- "Lien dans la bio" si pertinent
- Longueur idéale : 100-200 caractères (hors hashtags)

Règles Facebook :
- Ton plus conversationnel et personnel
- Peut être plus long qu'Instagram
- Inclure le lien de rendez-vous : https://mon-acupunctrice.ca
- Pas de hashtags
- CTA communautaire (partager, commenter)

Règles YouTube :
- Première ligne = titre SEO avec mots-clés (ce qui apparaît dans la recherche)
- Description qui résume la vidéo avec mots-clés naturels
- Inclure le lien : https://mon-acupunctrice.ca
- Ajouter "Prendre rendez-vous" avec le lien
- Format Shorts-friendly

Retourne UNIQUEMENT du JSON valide, pas de texte avant ou après :
{"instagram": "...", "facebook": "...", "youtube": "..."}
```

**Le prompt utilisateur :** 
```
Transcription de la vidéo :
"[transcription complète]"

Titre : [titre]
Catégorie : [catégorie]
Style : [contentStyle]
Notes : [notes si présentes]
```

### 2. Modifier le store pour stocker 3 captions

**Fichier :** `lib/store/useEditorStore.ts`

Ajouter :
```typescript
captions: {
  instagram: string;
  facebook: string;
  youtube: string;
} | null;
setCaptions: (captions: { instagram: string; facebook: string; youtube: string }) => void;
updateCaption: (platform: 'instagram' | 'facebook' | 'youtube', text: string) => void;
```

Reset dans `reset()`.

### 3. Refondre CaptionEditor.tsx

**Fichier :** `components/features/publish/CaptionEditor.tsx`

Nouveau design :
- Bouton "Générer avec l'IA" en haut (UN seul clic = génère les 3)
- Si la transcription existe (sous-titres dans le store), l'utiliser comme source
- Si pas de transcription, fallback sur titre/notes (comme avant)
- 3 tabs IG/FB/YT qui montrent chacune leur caption
- Chaque tab a son propre textarea éditable
- Compteur de caractères adapté par plateforme (IG: 2200 max, FB: 5000, YT: 5000)
- Badge "Transcription" si généré à partir de la transcription

**Props mises à jour :**
```typescript
interface Props {
  captions: { instagram: string; facebook: string; youtube: string } | null;
  onCaptionsChange: (captions: { instagram: string; facebook: string; youtube: string }) => void;
  title: string;
  category: string;
  notes?: string;
  contentStyle?: ContentStyle;
  transcript?: string;  // texte de la transcription depuis les sous-titres
}
```

### 4. Modifier PublishSheet.tsx pour utiliser les captions par plateforme

**Fichier :** `components/features/publish/PublishSheet.tsx`

- Passer les `captions` du store au CaptionEditor
- Sauvegarder les 3 captions dans Firestore sous `item.captions` (objet avec 3 clés)
- Garder aussi `item.caption` = la caption Instagram (rétrocompatibilité avec la CF)

### 5. Modifier les routes de publication pour utiliser leur caption

**Fichier :** `lib/hooks/usePublish.ts`
- Avant d'appeler la CF Instagram, sauvegarder `caption` = `captions.instagram` dans Firestore

**Fichier :** `app/api/publish-facebook/route.ts`
- Lire `item.captions?.facebook || item.caption` au lieu de `item.caption`

**Fichier :** `app/api/publish-youtube/route.ts`
- Lire `item.captions?.youtube || item.caption` pour le titre/description
- Ne plus ajouter de hashtags hardcodés (c'est dans la caption YouTube générée)

### 6. Construire le transcript depuis les sous-titres

**Fichier :** `components/features/publish/PublishSheet.tsx` ou nouveau util

Ajouter une fonction utilitaire :
```typescript
function buildTranscript(subtitles: SubtitleSegment[]): string {
  return subtitles.map(s => s.text).join(' ');
}
```
Passer le transcript au CaptionEditor et à l'API.

## Contraintes
- NE PAS modifier les Cloud Functions
- NE PAS modifier les routes de transcription ou d'export
- NE PAS supprimer l'ancienne API `/api/generate-caption-v2` (garder comme fallback)
- Rétrocompatible : si `item.captions` n'existe pas, utiliser `item.caption` comme avant
- Le JSON retourné par Claude DOIT être parsé proprement (strip markdown backticks si présents)
- La génération ne doit pas bloquer le flow — si elle échoue, Judith peut écrire manuellement
- Les captions générées doivent utiliser les propres mots de Judith (tirés de la transcription)
- Le lien de rendez-vous est https://mon-acupunctrice.ca (variable `NEXT_PUBLIC_WIX_URL`)
- Mobile first 375px

## Definition of Done
- [ ] Un seul bouton "Générer" produit 3 captions (IG + FB + YT)
- [ ] Les captions sont basées sur la transcription si disponible
- [ ] Si pas de transcription, fallback sur titre/notes
- [ ] 3 tabs dans le CaptionEditor pour voir/éditer chaque caption
- [ ] Compteur de caractères adapté par plateforme
- [ ] Instagram reçoit sa caption (hashtags, pas de lien)
- [ ] Facebook reçoit sa caption (lien cliquable, pas de hashtags)
- [ ] YouTube reçoit sa caption (titre SEO, description, lien)
- [ ] Les captions sont sauvegardées dans Firestore sous `item.captions`
- [ ] Rétrocompatibilité : `item.caption` est toujours la version Instagram
- [ ] `tsc --noEmit` = 0 erreurs
- [ ] `npm run build` = succès

## Référence — fichiers à lire
- `CLAUDE.md`
- `components/features/publish/CaptionEditor.tsx` (composant actuel)
- `components/features/publish/PublishSheet.tsx` (flow publication)
- `app/api/generate-caption-v2/route.ts` (API actuelle)
- `lib/utils/platformOptimization.ts` (STYLE_CTAS, PLATFORM_RECOMMENDATIONS)
- `lib/hooks/usePublish.ts` (hook publication)
- `lib/hooks/useMultiPlatformPublish.ts` (orchestration multi-plateforme)
- `app/api/publish-facebook/route.ts` (lecture caption FB)
- `app/api/publish-youtube/route.ts` (lecture caption YT)
- `lib/store/useEditorStore.ts` (store — sous-titres disponibles)
- `lib/types/editor.ts` (SubtitleSegment, SubtitleWord)
