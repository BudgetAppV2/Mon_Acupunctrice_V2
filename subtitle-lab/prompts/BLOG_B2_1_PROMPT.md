# B2.1 — Amelioration des images stories + lien GoRendezVous

## Finalite
Les stories Instagram sont vues par les abonnes existants de Judith.
Une image de story bien designee avec un CTA clair vers GoRendezVous
est un rappel direct qui genere des rendez-vous. Chaque story est une
opportunite de conversion.

## Contexte
Les images de stories actuelles sont basiques : fond sage vert uni + titre
blanc + CTA generique. L'image n'a pas de branding "La Source en Soi",
pas de logo, et le CTA ne mentionne pas GoRendezVous. L'API Instagram
ne supporte PAS les stickers (link sticker), donc le lien doit etre
DANS l'image elle-meme.

## Stack
Canvas API (client-side), TypeScript, Firebase Storage.

## Fichiers a lire AVANT de commencer
- `lib/utils/storyImageGenerator.ts` → generateur actuel (canvas 1080x1920)
- `lib/hooks/useBlogSequence.ts` → appelle generateStoryImage() pour chaque story
- `components/features/calendar/CreateSequenceSheet.tsx` → UI qui declenche la creation

## Livrable 1 — Redesign de generateStoryImage

Reecrire `lib/utils/storyImageGenerator.ts` :

Le design cible :
```
┌────────────────────────┐
│     (gradient fonce)    │
│                         │
│     LA SOURCE EN SOI    │  ← nom de la pratique
│     Judith Dufour-Savard     │  ← nom de l'acupunctrice
│     Acupunctrice        │  ← titre professionnel
│                         │
│  ┌──────────────────┐   │
│  │                  │   │
│  │  TITRE DE        │   │  ← titre du blog, gros, blanc
│  │  L'ARTICLE       │   │
│  │                  │   │
│  └──────────────────┘   │
│                         │
│  Prends rendez-vous     │  ← CTA
│  gorendezvous.com/      │  ← URL visible
│  lasourceensoi          │
│                         │
│  Lien dans ma bio       │  ← instruction Instagram
│                         │
│     (gradient fonce)    │
└────────────────────────┘
```

Details techniques :
- Canvas 1080x1920
- Background : gradient vertical du sage fonce (#3D5E40) vers un sage moyen (#5C7A5F)
- Overlay : gradient noir semi-transparent en haut et en bas pour la lisibilite
- Nom "LA SOURCE EN SOI" en haut, police bold, taille 36px, blanc avec ombre
- "Judith Dufour-Savard • Acupunctrice" en dessous, taille 24px, blanc 80%
- Titre de l'article au centre, police bold, taille 56px, blanc, word-wrap
- CTA "Prends rendez-vous" en bas, taille 32px, blanc
- URL "gorendezvous.com/lasourceensoi" en dessous, taille 24px, blanc 90%
- "Lien dans ma bio" tout en bas, taille 20px, blanc 60%

Pour le type `rappel` :
- Meme design mais avec un titre different : "Tu as manque cet article?"
- Sous-titre : le titre du blog en plus petit
- Le CTA et l'URL GoRendezVous restent identiques

La fonction garde la meme signature :
```typescript
export async function generateStoryImage(
  title: string,
  type: 'promo' | 'rappel',
): Promise<Blob>
```

## Livrable 2 — Verifier l'integration

Verifier que `useBlogSequence.ts` appelle toujours `generateStoryImage` correctement.
Les paramètres ne changent pas — seul le rendu visuel change.

## Contraintes
- Canvas API uniquement (pas de dependance externe)
- L'image DOIT contenir l'URL GoRendezVous en texte lisible
- L'image DOIT contenir "Lien dans ma bio" (seul CTA possible via API Stories)
- Pas de logo image (on n'a pas de fichier logo) — le texte "LA SOURCE EN SOI" sert de branding
- La fonction est client-side (utilisee dans useBlogSequence)
- 0 console.log

## Definition of Done
- [ ] L'image story "promo" affiche : branding, titre, CTA, URL GoRendezVous, "Lien dans ma bio"
- [ ] L'image story "rappel" affiche le meme design avec "Tu as manque cet article?"
- [ ] Le texte est lisible sur un fond colore (ombres, contrastes)
- [ ] L'URL GoRendezVous est en texte dans l'image (pas un lien sticker)
- [ ] La signature de la fonction est identique (pas de breaking change)
- [ ] npm run build passe
