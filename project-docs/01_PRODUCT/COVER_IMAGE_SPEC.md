# COVER_IMAGE_SPEC.md
# Spécification — Choix de l'image de couverture Instagram
*Feature US-21 — Version 1.0 — Mars 2026*

---

## Contexte

L'image de couverture d'un Reel est ce que les gens voient
dans la grille du profil Instagram et dans les previews.
C'est souvent ce qui décide si quelqu'un clique ou non.

Instagram Graph API supporte deux approches :
- `thumb_offset` : choisir une frame de la vidéo (en millisecondes)
- `cover_url` : uploader une image custom

---

## UX — Modal de publication (3 étapes)

### Étape 1 — Image de couverture

```
┌─────────────────────────────────┐
│  ╱ Publier                      │
├─────────────────────────────────┤
│                                 │
│  Image de couverture            │
│                                 │
│  ┌──────────┐ ┌──────────┐      │
│  │          │ │          │      │
│  │  [frame  │ │  [frame  │      │
│  │  auto]   │ │  choisie]│      │
│  │          │ │          │      │
│  │ Auto ✓   │ │ Choisir  │      │
│  └──────────┘ └──────────┘      │
│                                 │
│  ┌──────────────────────────┐   │
│  │     🖼️  Depuis Photos    │   │
│  └──────────────────────────┘   │
│                                 │
│  [Continuer →]                  │
└─────────────────────────────────┘
```

**Option A — Frame automatique (défaut)**
- Première frame de la vidéo après trim
- `thumb_offset = trimStart * 1000` (ms)
- Sélectionnée par défaut

**Option B — Choisir une frame**
- Scrubber horizontal sous la preview vidéo
- Judith fait glisser pour choisir le moment parfait
- La preview se met à jour en temps réel
- `thumb_offset = selectedTime * 1000` (ms)

**Option C — Image depuis Photos**
- Ouvre le sélecteur d'images iOS
- Accept : `image/*`
- L'image est uploadée dans Firebase Storage :
  `covers/{userId}/{itemId}.jpg`
- `cover_url` = URL publique de cette image
- Redimensionnée si nécessaire (1080×1920 max)

---

## Implémentation technique

### Composant CoverPicker

```typescript
// components/editor/CoverPicker.tsx

interface CoverPickerProps {
  videoUrl: string
  videoDuration: number
  trimStart: number
  onSelect: (cover: CoverSelection) => void
}

type CoverSelection =
  | { type: 'frame'; thumbOffset: number }
  | { type: 'custom'; coverUrl: string }
```

### Scrubber de frame

```typescript
// Générer une preview de la frame sélectionnée
// via HTMLVideoElement.currentTime + canvas.drawImage

function captureFrame(video: HTMLVideoElement, timeSeconds: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = 270   // Preview 9:16 miniature
  canvas.height = 480
  video.currentTime = timeSeconds
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0, 270, 480)
  return canvas.toDataURL('image/jpeg', 0.8)
}
```

### Upload image custom

```typescript
// Uploader vers Firebase Storage
// Rendre public pour que Instagram puisse y accéder

async function uploadCoverImage(
  file: File,
  userId: string,
  itemId: string
): Promise<string> {
  const coverRef = ref(storage, `covers/${userId}/${itemId}.jpg`)
  await uploadBytes(coverRef, file, {
    contentType: 'image/jpeg',
    customMetadata: { 'access': 'public' }
  })
  // URL publique (pas de token signé)
  return `https://storage.googleapis.com/${bucket}/covers/${userId}/${itemId}.jpg`
}
```

### Intégration dans publishToInstagram

```typescript
// Dans functions/src/instagram.ts
// Ajouter les paramètres à la création du container

const containerParams = new URLSearchParams({
  media_type: 'REELS',
  video_url: videoUrl,
  caption,
  access_token: accessToken,
})

// Ajouter la couverture
if (coverOption === 'frame' && thumbOffset !== undefined) {
  containerParams.set('thumb_offset', thumbOffset.toString())
} else if (coverOption === 'custom' && coverUrl) {
  containerParams.set('cover_url', coverUrl)
}
```

---

## Règles Firebase Storage pour les covers

```javascript
match /covers/{userId}/{filename} {
  // Lecture publique — Instagram a besoin d'accéder à l'URL
  allow read: if true;
  // Écriture seulement par l'utilisateur propriétaire
  allow write: if request.auth != null
    && request.auth.uid == userId;
}
```

---

## Stockage dans Firestore

```typescript
// Après sélection de la couverture, sauvegarder dans contentItems
await updateDoc(itemRef, {
  coverOption: cover.type,
  thumbOffset: cover.type === 'frame' ? cover.thumbOffset : null,
  coverImageUrl: cover.type === 'custom' ? cover.coverUrl : null,
})
```

---

## Etape 2 — Caption (inchangée)

Voir PRD_V1.md F4.3

---

## Étape 3 — Confirmation

```
┌─────────────────────────────────┐
│  Prête à publier?               │
├─────────────────────────────────┤
│  ┌──────┐                       │
│  │cover │  L'eczéma chez...     │
│  │image │  Planifié: Vend. 18h  │
│  └──────┘                       │
│                                 │
│  [📤 Publier maintenant]        │
│  [📅 Planifier]                 │
│  [← Modifier]                  │
└─────────────────────────────────┘
```

---

## Edge cases

| Cas | Comportement |
|-----|-------------|
| Aucune couverture sélectionnée | `thumb_offset=0` (première frame) par défaut |
| Image custom trop grande | Redimensionner côté client avant upload |
| Image custom non-9:16 | Crop centré + padding noir |
| Upload cover échoue | Fallback automatique vers `thumb_offset=0` |
| Instagram rejette la cover_url | Retry avec `thumb_offset=0` |
