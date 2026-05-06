# Prompt Claude Code — Pipeline Cover Generation Phase 1

**Contexte** : Site Next.js 15 d'acupuncteure (acupuncturejudith.ca). On vient de valider un POC de génération de covers via Satori + banque Freepik. Tu dois maintenant industrialiser ce POC en un module réutilisable + une API route + 2 templates de format (cover blog + story Instagram). Le 3e format OG est différé.

**Avant de commencer** :
1. Lis `project-docs/02_ROADMAP/content-strategy/HANDOFF.md` (contexte complet)
2. Lis `content/visual-bank/scripts/poc-compose.mjs` (POC cover blog 1920×1080 — VALIDÉ)
3. Lis `content/visual-bank/scripts/poc-compose-story.mjs` (POC story 1080×1920 — VALIDÉ)
4. Lis `project-docs/02_ROADMAP/content-strategy/STYLE_GUIDE_VISUEL.md` (paramètres visuels)
5. Lis `tailwind.config.ts` (palette du site, à respecter)
6. Lis `app/(public)/layout.tsx` (config fonts existante)
7. Lis `lib/utils/publishHelpers.ts` (fonction `publishStoryViaInstagrapi` — IMPORTANT pour stickers cliquables)
8. Lis `functions-python/main.py` (Cloud Function instagrapi avec coords stickers)

⚠️ **RÈGLE STRICTE — TEMPLATES NON-MODIFIABLES** :
Les 2 POCs ci-dessus contiennent des templates **validés visuellement par Benoit après plusieurs itérations**. Ton travail sur les 2 templates `cover-blog.ts` et `story-instagram.ts` doit être une **conversion JS→TypeScript stricte**, sans aucun changement de :
- Layout, dimensions, ratios
- Couleurs, palettes, gradients
- Tailles de texte, fonts, weights, letterSpacing
- Positions, paddings, marges
- Voile gradient, opacités
- Box-shadows, border-radius
- Algorithme placement intelligent (3x3 ou 3x4 grid, biais positionnels)
- Threshold du chroma key (220 pour line art transparent)
- Offset +7% du yPercent pour story

Si quelque chose te semble "à améliorer" ou "incohérent", **NE PAS LE MODIFIER** — créer un commentaire `// TODO discuss with Benoit:` et continuer. Les choix esthétiques sont validés.

---

## 🎯 Goal Phase 1

Construire un module réutilisable `lib/cover-generator/` + une API route `POST /api/cover/generate` qui :
- Prend `{ contentId: string, type: 'ressource'|'faq'|'blog', titre: string, pilier: string, ctaMode?: 'ressource'|'reservation' }` en input
- Génère **2 PNGs simultanément** : cover (1920×1080) + story (1080×1920)
- Upload les 2 vers Firebase Storage
- Retourne `{ cover16x9: url, story9x16: url, assets: { backgroundFile, lineartFile } }`

**Performance cible** : <6 secondes total pour les 2 formats (parallélisation).

⚠️ **Format OG 1200×630 DIFFÉRÉ** — Pas Phase 1. Sera ajouté ultérieurement quand le besoin apparaîtra (partages Facebook/LinkedIn). Ne PAS créer `templates/post-og.ts` ni `og191` dans la réponse API.

### Modes CTA pour story (NOUVEAU)
Le paramètre `ctaMode` (optionnel, défaut `'ressource'`) contrôle le bouton CTA dans la story :
- `'ressource'` → Bouton sage `#6F8566` avec gradient → label `"Lire la suite"` → lien vers la ressource
- `'reservation'` → Bouton clay `#B8694A` avec gradient → label `"Réserver une séance"` → lien `/reserver`

Cf. `lib/utils/publishHelpers.ts` `publishStoryViaInstagrapi()` qui pose les stickers cliquables invisibles par-dessus le bouton visuel à coordonnées y=0.75.

---

## 📁 Structure de fichiers à créer

```
lib/cover-generator/
├── compose.ts                    # Composition principale (depuis POC)
├── pige.ts                       # Pige aléatoire intelligente
├── line-art-processor.ts         # Sharp transform (du POC)
├── placement-analyzer.ts         # Algo 3x3 grid (du POC)
├── fonts.ts                      # Charge Cormorant + Inter (cache)
├── upload.ts                     # Upload Firebase Storage
├── types.ts                      # Types TypeScript
└── templates/
    ├── cover-blog.ts             # Template 1920x1080 (port direct depuis poc-compose.mjs)
    └── story-instagram.ts        # Template 1080x1920 (port direct depuis poc-compose-story.mjs)
    # NOTE: post-og.ts (1200x630) DIFFÉRÉ - pas Phase 1

app/api/cover/
└── generate/
    └── route.ts                  # POST endpoint

public/fonts/
├── CormorantGaramond-Italic-500.woff2    # Embarqué pour perf
└── Inter-500.woff2                       # Embarqué pour perf
```

---

## 🔧 Spec détaillée par fichier

### `lib/cover-generator/types.ts`

```typescript
export type Pilier = 'grossesse' | 'pediatrie' | 'fertilite' | 'anxiete-sommeil' | 'menopause' | 'acupuncture-sociale' | 'transversal';

export type ContentType = 'ressource' | 'faq' | 'blog';

export type CoverFormat = 'cover16x9' | 'story9x16';

export interface CoverAsset {
  file: string;
  type: 'background' | 'lineart';
  pilier?: Pilier;
  palette?: string[];
  dominantColor?: string;
  dimensions?: { width: number; height: number };
  format?: 'horizontal' | 'vertical' | 'square' | 'mixed';
  usedInArticles?: string[]; // Phase 2
}

export interface GenerateCoverInput {
  contentId: string;
  type: ContentType;
  titre: string;
  pilier: Pilier;
  ctaMode?: 'ressource' | 'reservation'; // Pour story uniquement, défaut 'ressource'
  excludeAssets?: { backgrounds?: string[]; lineart?: string[] }; // Phase 2 regenerate
}

export interface GenerateCoverOutput {
  cover16x9: string;       // Firebase Storage URL
  story9x16: string;
  assets: {
    backgroundFile: string;
    lineartFile: string;
  };
  metadata: {
    placementZone: { row: number; col: number; score: number };
    generatedAt: string;
  };
}
```

### `lib/cover-generator/pige.ts`

**Responsabilités** :
- Lire les `metadata.json` de chaque dossier de la banque
- Filtrer par pilier (line art) + format (background)
- Pige weighted random (priorité aux assets jamais utilisés)
- Support exclusion explicite (pour regenerate)

**Signature** :
```typescript
export async function pickAssets(
  pilier: Pilier,
  exclude?: { backgrounds?: string[]; lineart?: string[] }
): Promise<{ backgroundPath: string; lineartPath: string }>
```

**Algorithme** :
1. Charger `content/visual-bank/backgrounds/metadata.json`
2. Charger `content/visual-bank/lineart/{pilier}/metadata.json`
3. Si pilier-specific lineart < 3 assets, fallback sur `transversal`
4. Filter assets non-exclus
5. Pondération anti-répétition : Phase 2 (pour Phase 1, just random)
6. Retourner les chemins absolus

### `lib/cover-generator/line-art-processor.ts`

**Reprend exactement la logique du POC** (`lineArtToTransparentPng`) :
- Input : path JPG line art
- Output : Buffer PNG transparent (RGBA, fond blanc → alpha 0, lignes → couleur ink #2C2A26)
- Threshold paramétrable (défaut 235)

### `lib/cover-generator/placement-analyzer.ts`

**Reprend exactement la logique du POC** (`findBestPlacementZone`) :
- Input : path background JPG
- Output : `{ row, col, xPercent, yPercent, score }`
- Logique scoring : luminance×0.6 + uniformity×0.4 + biais (centre +0.30, droite +0.10, gauche -0.20, milieu +0.10, exclude bottom)

### `lib/cover-generator/fonts.ts`

**Important** : pas de téléchargement runtime. On embed les fonts.

```typescript
import { readFile } from 'node:fs/promises';
import path from 'node:path';

let cachedFonts: { cormorant: Buffer; inter: Buffer } | null = null;

export async function loadFonts() {
  if (cachedFonts) return cachedFonts;
  
  const [cormorant, inter] = await Promise.all([
    readFile(path.join(process.cwd(), 'public/fonts/CormorantGaramond-Italic-500.woff2')),
    readFile(path.join(process.cwd(), 'public/fonts/Inter-500.woff2')),
  ]);
  
  cachedFonts = { cormorant, inter };
  return cachedFonts;
}
```

**Action requise** :
1. Télécharge les 2 fichiers .woff2 depuis Google Fonts (manuellement, une seule fois)
2. Place-les dans `public/fonts/`
3. Vérifier les licences (Cormorant Garamond + Inter sont libres)

### `lib/cover-generator/templates/cover-blog.ts`

⚠️ **PORT DIRECT depuis `content/visual-bank/scripts/poc-compose.mjs`** — VALIDÉ visuellement.

**Specs validees** (NE PAS MODIFIER) :
- Dimensions : 1920x1080 (16:9 horizontal)
- Background : pleine surface, `backgroundSize: 'cover'`
- Voile gradient : `linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(245,240,232,0.32) 100%)`
- Algo placement intelligent : grid 3x3, biais col=1 +0.30, col=2 +0.10, col=0 -0.20, row=1 +0.10, exclude row=2
- Line art : 70% width x 80% height au point de placement, opacity 0.92, couleur ink #2C2A26
- Surtitre `RESSOURCE` (ou type) : Inter 500, 32px, letterSpacing 0.2em, uppercase, color #6F8566 (sage-dark)
- Titre principal : Cormorant Garamond italic 500, 108px, lineHeight 1.05, letterSpacing -0.01em, color #2C2A26
- Position bloc titre : left 6%, bottom 8%, maxWidth 78%, gap 18 entre surtitre et titre
- Branding `acupuncturejudith.ca` : Inter 500, 26px, color #5C5852, position right 4% bottom 4%

**Signature TypeScript** :
```typescript
export interface CoverBlogTemplateProps {
  bgDataUrl: string;          // data:image/jpeg;base64,...
  laDataUrl: string;          // data:image/png;base64,... (line art transparent)
  surtitre: string;           // ex: "Ressource"
  titre: string;              // ex: "Acupuncture pendant la grossesse"
  width: number;              // 1920
  height: number;             // 1080
  placementX: number;         // % du centre line art (depuis placement-analyzer)
  placementY: number;         // % du centre line art
}
export function buildCoverBlogTemplate(props: CoverBlogTemplateProps): SatoriElement;
```

### `lib/cover-generator/templates/story-instagram.ts`

⚠️ **PORT DIRECT depuis `content/visual-bank/scripts/poc-compose-story.mjs`** — VALIDÉ visuellement sur 4 piliers (grossesse, fertilité, anxiété-sommeil, pédiatrie).

**Specs validees** (NE PAS MODIFIER) :
- Dimensions : 1080x1920 (9:16 portrait)
- Background : pleine surface, `backgroundSize: 'cover'`
- Voile gradient : `linear-gradient(180deg, rgba(245,240,232,0.65) 0%, rgba(245,240,232,0.10) 28%, rgba(245,240,232,0.05) 55%, rgba(245,240,232,0.30) 70%, rgba(245,240,232,0.75) 100%)` — plus prononce qu'en cover, lisibilite haut+bas critique
- Algo placement intelligent : grid 3x4 (vertical), biais col=1 +0.30, col=2 +0.05, col=0 -0.10, row=1 +0.20, row=2 +0.05, exclude row=0 et row=3
- **Offset crucial** : `yPercent = (best.row + 0.5) * 25 + 7` (offset +7% pour libérer espace titre)
- Line art : 130% width x 80% height au point de placement (overflow OK car objectFit:contain), opacity 1.0, couleur ink #2C2A26
- Surtitre : Inter 600, 44px, letterSpacing 0.25em, uppercase, color #6F8566
- Titre : Cormorant Garamond italic 500, **140px**, lineHeight 1.05, letterSpacing -0.01em, color #2C2A26
- Bloc titre : left 8%, top 8%, width 84%, gap 18
- **Bouton CTA** (zone tappable matchée avec linkSticker IG y=0.75) :
  - Position : left 15%, top 70%, width 70%, height 8%
  - Background : `linear-gradient(180deg, ...)` — couleurs selon ctaMode (cf. ci-dessous)
  - borderRadius : 999 (pill)
  - boxShadow : `'0 12px 32px rgba(44,42,38,0.32), 0 4px 12px rgba(44,42,38,0.18), inset 0 1px 0 rgba(255,255,255,0.25)'` (multi-couches pour effet flottant)
  - Texte : Inter 600, 50px, color #FFFFFF, letterSpacing 0.02em, gap 16, textShadow `'0 2px 4px rgba(0,0,0,0.20)'`
- Indication `Tape pour ouvrir` : Inter 500, 28px, color #5C5852, letterSpacing 0.08em, position top 80%, centré
- Branding `acupuncturejudith.ca` : Inter 600, 36px, color #2C2A26, position top 90%, centré

**Modes CTA — gradients du bouton** :
```typescript
const ctaGradients = {
  ressource: 'linear-gradient(180deg, #7E9374 0%, #6F8566 50%, #5C7156 100%)', // sage taupe
  reservation: 'linear-gradient(180deg, #C47A58 0%, #B8694A 50%, #A05B3D 100%)', // clay accent-warm
};
const ctaLabels = {
  ressource: 'Lire la suite',
  reservation: 'Réserver une séance',
};
```

**Signature TypeScript** :
```typescript
export interface StoryInstagramTemplateProps {
  bgDataUrl: string;
  laDataUrl: string;
  surtitre: string;
  titre: string;
  width: number;              // 1080
  height: number;             // 1920
  placementX: number;
  placementY: number;
  ctaMode: 'ressource' | 'reservation';
  ctaLabel: string;           // "Lire la suite" ou "Réserver une séance"
}
export function buildStoryInstagramTemplate(props: StoryInstagramTemplateProps): SatoriElement;
```

**Note pour Phase 4 (séquence sociale)** :
Le `ctaMode` sera typiquement contrôlé depuis `useBlogSequence.ts` :
- Slot J+0 (story découverte) → `ctaMode: 'ressource'`
- Slot J+3 (reel application) → `ctaMode: 'reservation'`
- Slot J+7 (story témoignage) → `ctaMode: 'reservation'`

### `lib/cover-generator/templates/post-og.ts` — DIFFÉRÉ

⚠️ **NE PAS CRÉER EN PHASE 1.**

Format Open Graph 1200×630 (FB/LinkedIn share preview) sera ajouté ultérieurement quand le besoin apparaîtra. Pour Phase 1 :
- NE PAS créer ce fichier
- NE PAS référencer `og191` dans `compose.ts`, l'API route, ni les types

### `lib/cover-generator/upload.ts`

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Init Firebase admin (seulement si pas déjà fait)

export async function uploadCoverPng(
  pngBuffer: Buffer,
  contentId: string,
  format: 'cover16x9' | 'story9x16'
): Promise<string> {
  const bucket = getStorage().bucket();
  const filename = `covers/${contentId}/${format}-${Date.now()}.png`;
  const file = bucket.file(filename);
  
  await file.save(pngBuffer, {
    contentType: 'image/png',
    metadata: {
      cacheControl: 'public, max-age=31536000', // 1 an
    },
  });
  
  // Generate signed URL or make public depending on bucket policy
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}
```

**Vérifie** :
- Que le bucket Firebase Storage est configuré
- Les credentials Firebase Admin disponibles via `process.env.FIREBASE_*` ou service account JSON
- Pas de leak de credentials dans les logs

### `lib/cover-generator/compose.ts`

Orchestre tout :
```typescript
export async function generateCovers(input: GenerateCoverInput): Promise<GenerateCoverOutput> {
  // 1. Pige assets
  const { backgroundPath, lineartPath } = await pickAssets(input.pilier, input.excludeAssets);
  
  // 2. Process en parallèle :
  //    a. Line art transparent
  //    b. Placement analysis
  //    c. Fonts
  const [lineArtPng, placement, fonts] = await Promise.all([
    processLineArt(lineartPath),
    analyzePlacement(backgroundPath),
    loadFonts(),
  ]);
  
  // 3. Génère 2 templates en parallèle (OG différé)
  const [cover16x9Buf, story9x16Buf] = await Promise.all([
    renderCoverBlog({ background: backgroundPath, lineart: lineArtPng, placement, ...input, fonts }),
    renderStoryInstagram({ background: backgroundPath, lineart: lineArtPng, placement, ...input, fonts, ctaMode: input.ctaMode || 'ressource' }),
  ]);
  
  // 4. Upload en parallèle
  const [cover16x9Url, story9x16Url] = await Promise.all([
    uploadCoverPng(cover16x9Buf, input.contentId, 'cover16x9'),
    uploadCoverPng(story9x16Buf, input.contentId, 'story9x16'),
  ]);
  
  return {
    cover16x9: cover16x9Url,
    story9x16: story9x16Url,
    assets: {
      backgroundFile: path.basename(backgroundPath),
      lineartFile: path.basename(lineartPath),
    },
    metadata: {
      placementZone: placement,
      generatedAt: new Date().toISOString(),
    },
  };
}
```

### `app/api/cover/generate/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCovers } from '@/lib/cover-generator/compose';

export const runtime = 'nodejs'; // Important: Sharp incompatible Edge

const InputSchema = z.object({
  contentId: z.string().min(1),
  type: z.enum(['ressource', 'faq', 'blog']),
  titre: z.string().min(1).max(200),
  pilier: z.enum(['grossesse', 'pediatrie', 'fertilite', 'anxiete-sommeil', 'menopause', 'acupuncture-sociale', 'transversal']),
  excludeAssets: z.object({
    backgrounds: z.array(z.string()).optional(),
    lineart: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = InputSchema.parse(body);
    
    const result = await generateCovers(input);
    
    return NextResponse.json(result);
  } catch (err) {
    console.error('[cover/generate] Error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Cover generation failed' }, { status: 500 });
  }
}
```

---

## 🧪 Tests à effectuer après implémentation

1. **Test fonctionnel** : appeler l'API avec curl
   ```bash
   curl -X POST http://localhost:3000/api/cover/generate \
     -H "Content-Type: application/json" \
     -d '{
       "contentId": "test-001",
       "type": "ressource",
       "titre": "Test Acupuncture grossesse",
       "pilier": "grossesse"
     }'
   ```

2. **Test 6 piliers** : générer 1 cover par pilier, vérifier que tous fonctionnent
3. **Test régénération** : appeler 2x avec le même contentId, vérifier que les URLs sont différentes (pas de cache)
4. **Test exclusion** : appeler avec excludeAssets, vérifier qu'on évite les assets listés
5. **Test fonts** : vérifier que Cormorant + Inter rendent correctement (pas de fallback Times/Arial)

---

## ⚠️ Pièges à éviter (post-mortem POC)

1. **Edge Runtime** : ne JAMAIS mettre `runtime = 'edge'` dans la route → Sharp ne supporte pas
2. **next/font** : ne pas utiliser `next/font` pour Satori (incompatible) → embed manuel via readFile
3. **Background blanc dans line art** : toujours passer par `lineArtToTransparentPng`, jamais utiliser le JPG direct
4. **Coordonnées bottom** : ne jamais placer le line art en row=2 (chevauche texte)
5. **Cache Firebase** : timestamp dans le filename pour invalider le CDN entre régénérations
6. **Memory leak** : Sharp doit être destroy après usage si grosse charge → utiliser `sharp().destroy()` ou pipeline streamable

---

## 📋 Definition of Done Phase 1

- [ ] `lib/cover-generator/` créé avec tous les fichiers spécifiés
- [ ] Fonts embarquées dans `public/fonts/`
- [ ] API route fonctionnelle, testée avec curl sur les 6 piliers
- [ ] 2 formats générés correctement (cover 1920×1080 + story 1080×1920, vérification visuelle dans Firebase Storage)
- [ ] Performance < 6 sec total pour les 2 formats
- [ ] TypeScript strict, 0 erreur, 0 `any`
- [ ] Tous les commits suivent le format `feat(cover-generator): ...`
- [ ] Push sur branche `feature/cover-generator-phase1`
- [ ] PR créée avec description + screenshots des 2 formats générés (cover + story sur 4 piliers minimum)

---

## 🎯 Quand Phase 1 est terminée

Reviens vers Benoit (via Claude Desktop) avec :
1. Lien vers la PR
2. 3-5 captures d'écran des covers générés
3. Tout problème rencontré
4. Estimation effort restant Phase 2 (anti-répétition)

Ne pas commencer Phase 2 avant validation visuelle de Phase 1 par Benoit.
