# Milestone CANVA_IMAGE — Image de couverture blog + workflow Canva

## Contexte

Le `BlogEditor.tsx` actuel n'a aucun champ pour l'image de couverture.
Judith fait ses visuels dans Canva puis n'a aucun moyen de les importer dans le hub.
Le `storyImageGenerator.ts` génère un gradient vert basique (hex #3D5E40 → #5C7A5F)
qui ne reflète pas la marque de Judith — ses designs Canva sont bien plus pros
(photos avec overlay texte stylisé, typographie soignée).

Ce milestone ajoute un champ image au BlogEditor et améliore le générateur
de stories pour utiliser l'image Canva de Judith comme fond au lieu du gradient.

## Stack
Next.js 15 App Router, TypeScript, Tailwind, Firebase Storage, Canvas API.

## Fichiers à lire AVANT de commencer
- `CLAUDE.md` → Règles du projet
- `components/features/blog/BlogEditor.tsx` → L'éditeur de blog actuel (pas de champ image)
- `lib/utils/storyImageGenerator.ts` → Génère les images story 1080x1920 (gradient vert)
- `lib/hooks/useBlogSequence.ts` → Appelle `generateStoryImage()` et upload vers Storage
- `lib/hooks/useBlogArticles.ts` → Hook pour publier les articles sur Wix
- `lib/firebase.ts` → Config Firebase client (getFirebaseStorage)

## Livrable 1 — Champ image dans BlogEditor.tsx

Après le champ "Categorie" et avant le champ "Contenu", ajouter une section image :

```
┌─────────────────────────────────────────────┐
│  Image de couverture                        │
│                                             │
│  [preview 16:9 de l'image si uploadée]      │
│                                             │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Importer      │  │ Créer dans Canva     │ │
│  │ (PhotoIcon)   │  │ (ArrowTopRight...)   │ │
│  └──────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Bouton "Importer"** :
- `<input type="file" accept="image/*">` caché, déclenché par le bouton
- Upload vers Firebase Storage dans `blog-covers/{userId}/{timestamp}.jpg`
- Redimensionner côté client via Canvas API (max 1200px largeur) avant upload
- Afficher un preview 16:9 arrondi dans le formulaire
- Stocker l'URL dans un nouveau champ `coverImageUrl` de `BlogArticle`
- Icône: `PhotoIcon` de Heroicons
- Style: bouton secondaire `border border-gray-200 rounded-xl`

**Bouton "Créer dans Canva"** :
- Ouvre `https://www.canva.com/create/instagram-stories` dans un nouvel onglet
- C'est un simple `window.open()` — pas d'intégration API
- Icône: `ArrowTopRightOnSquareIcon` de Heroicons
- Style: bouton secondaire identique au bouton Importer
- Texte aide-mémoire en xs sous les boutons : "Crée ton design dans Canva, télécharge-le, puis importe-le ici"

**Si image déjà uploadée** :
- Afficher le preview avec un bouton X pour supprimer
- Le bouton X remet `coverImageUrl` à undefined

**Modifier l'interface BlogArticle** :
```typescript
export interface BlogArticle {
  title: string;
  content: string;
  category: string;
  ctaUrl: string;
  faqs?: FaqItem[];
  coverImageUrl?: string;  // NOUVEAU — URL Firebase Storage
}
```

**Passer coverImageUrl au onPublish** :
Dans le bouton "Publier sur Wix", inclure `coverImageUrl` dans l'objet article.

## Livrable 2 — storyImageGenerator avec image de fond

Modifier `lib/utils/storyImageGenerator.ts` pour accepter une image de fond optionnelle.

Nouvelle signature :
```typescript
export async function generateStoryImage(
  title: string,
  type: 'promo' | 'rappel',
  backgroundImageUrl?: string,  // NOUVEAU — URL de l'image Canva
): Promise<Blob>
```

**Logique** :
1. Si `backgroundImageUrl` est fourni :
   - Charger l'image via `fetch()` puis `createImageBitmap()`
   - Dessiner l'image en fond du canvas en mode cover (remplir 1080x1920, centré, croppé)
   - Appliquer un overlay sombre : `ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0,0,W,H);`
   - Garder les overlays haut/bas existants (drawBackground -> seulement les overlays, pas le gradient)
   - Dessiner le branding + titre + CTA par-dessus (drawBranding, drawCTA inchangés)
2. Si `backgroundImageUrl` n'est PAS fourni :
   - Comportement identique à l'actuel (gradient vert, fallback)

**Fonction helper pour le cover fit** :
```typescript
function drawCoverImage(ctx: CanvasRenderingContext2D, img: ImageBitmap) {
  const scale = Math.max(W / img.width, H / img.height);
  const sw = W / scale;
  const sh = H / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
}
```

## Livrable 3 — Passer l'image du blog aux stories

Modifier `lib/hooks/useBlogSequence.ts` dans `createSequence()` :

```typescript
// Le 4e paramètre blogImageUrl existe déjà mais n'est pas utilisé pour les stories
const [promoBlob, rappelBlob] = await Promise.all([
  generateStoryImage(blogTitle, 'promo', blogImageUrl),   // MODIFIÉ — passer l'image
  generateStoryImage(blogTitle, 'rappel', blogImageUrl),  // MODIFIÉ — passer l'image
]);
```

Le paramètre `blogImageUrl` est déjà passé à `createSequence()` depuis
`CreateSequenceSheet.tsx` (via `ogData.imageUrl`). Il faut juste le transmettre
à `generateStoryImage()`.

## Contraintes

- Ne PAS modifier le flow de publication Instagram/Facebook/YouTube
- Ne PAS modifier le cron
- Ne PAS intégrer l'API Canva (juste un window.open)
- Ne PAS modifier les composants de l'éditeur vidéo
- Garder le gradient vert comme fallback si pas d'image
- Mobile first 375px
- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes

## Definition of Done

- [ ] BlogEditor affiche un champ "Image de couverture" avec preview 16:9
- [ ] Bouton "Importer" ouvre un file picker, upload vers Firebase Storage, affiche le preview
- [ ] Bouton "Créer dans Canva" ouvre canva.com/create/instagram-stories dans un nouvel onglet
- [ ] L'image uploadée peut être supprimée via un bouton X
- [ ] `BlogArticle` interface inclut `coverImageUrl?: string`
- [ ] `coverImageUrl` est passé dans `onPublish()` quand l'article est publié
- [ ] `generateStoryImage()` accepte un 3e paramètre `backgroundImageUrl` optionnel
- [ ] Si `backgroundImageUrl` fourni, l'image est utilisée comme fond de la story (cover fit + overlay)
- [ ] Si pas d'image, le gradient vert actuel est utilisé (fallback inchangé)
- [ ] `useBlogSequence.createSequence()` passe `blogImageUrl` à `generateStoryImage()`
- [ ] L'image s'affiche correctement sur mobile 375px
