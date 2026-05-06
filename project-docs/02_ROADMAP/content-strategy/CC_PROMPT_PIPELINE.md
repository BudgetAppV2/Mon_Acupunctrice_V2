# Prompt Claude Code — Pipeline Cover Generation Phase 1

**Contexte** : Site Next.js 15 d'acupuncteure (acupuncturejudith.ca). On vient de valider un POC de génération de covers via Satori + banque Freepik. Tu dois maintenant industrialiser ce POC en un module réutilisable + une API route + 3 templates de format.

**Avant de commencer** :
1. Lis `project-docs/02_ROADMAP/content-strategy/HANDOFF.md` (contexte complet)
2. Lis `content/visual-bank/scripts/poc-compose.mjs` (le POC validé qui marche)
3. Lis `project-docs/02_ROADMAP/content-strategy/STYLE_GUIDE_VISUEL.md` (paramètres visuels)
4. Lis `tailwind.config.ts` (palette du site, à respecter)
5. Lis `app/(public)/layout.tsx` (config fonts existante)

---

## 🎯 Goal Phase 1

Construire un module réutilisable `lib/cover-generator/` + une API route `POST /api/cover/generate` qui :
- Prend `{ contentId: string, type: 'ressource'|'faq'|'blog', titre: string, pilier: string }` en input
- Génère **3 PNGs simultanément** : cover (1920×1080), story (1080×1920), OG (1200×630)
- Upload les 3 vers Firebase Storage
- Retourne `{ cover16x9: url, story9x16: url, og191: url, assets: { backgroundFile, lineartFile } }`

**Performance cible** : <8 secondes total pour les 3 formats (parallélisation).

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
    ├── cover-blog.ts             # Template 1920x1080 (depuis POC)
    ├── story-instagram.ts        # Template 1080x1920 (NOUVEAU)
    └── post-og.ts                # Template 1200x630 (NOUVEAU)

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

export type CoverFormat = 'cover16x9' | 'story9x16' | 'og191';

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
  excludeAssets?: { backgrounds?: string[]; lineart?: string[] }; // Phase 2 regenerate
}

export interface GenerateCoverOutput {
  cover16x9: string;       // Firebase Storage URL
  story9x16: string;
  og191: string;
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

Reprend le `buildTemplate` du POC, paramétrise dimensions, retourne tree JSX-like.

### `lib/cover-generator/templates/story-instagram.ts` (NOUVEAU)

**Format 1080×1920 portrait** (Instagram Story).

**Layout suggéré** :
```
+------------------+
| [Logo J]    9:16 |
|                  |
| [BG boho]        |
|                  |
| [LINE ART]       |
|  ~600x800        |
|  centré H        |
|                  |
|                  |
| RESSOURCE        |
| Acupuncture      |
| pendant la       |
| grossesse        |
|                  |
| → Lien dans bio  |
| acupuncturejudith|
+------------------+
```

**Ajustements vs cover horizontal** :
- Line art : 70% largeur × 50% hauteur (centré horizontal, ~25% du top)
- Titre : Cormorant 84px (ajusté pour vertical)
- Surtitre : 26px
- Logo en haut + URL en bas
- Padding plus généreux (8% partout)

### `lib/cover-generator/templates/post-og.ts` (NOUVEAU)

**Format 1200×630** (Open Graph standard, FB, LinkedIn).

**Stratégie** : essentiellement un crop horizontal du cover blog, ratio 1.91:1 au lieu de 16:9.

**Layout** :
```
+--------------------+
| [BG]     [LA]      |
|         right      |
| RESSOURCE          |
| Titre Cormorant    |
+--------------------+
```

- Mêmes éléments que cover-blog, ajustés pour le ratio plus carré
- Line art décalé à droite + un peu plus petit (60% × 75%)
- Titre Cormorant 72px

### `lib/cover-generator/upload.ts`

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Init Firebase admin (seulement si pas déjà fait)

export async function uploadCoverPng(
  pngBuffer: Buffer,
  contentId: string,
  format: 'cover16x9' | 'story9x16' | 'og191'
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
  
  // 3. Génère 3 templates en parallèle
  const [cover16x9Buf, story9x16Buf, og191Buf] = await Promise.all([
    renderCoverBlog({ background: backgroundPath, lineart: lineArtPng, placement, ...input, fonts }),
    renderStoryInstagram({ background: backgroundPath, lineart: lineArtPng, placement, ...input, fonts }),
    renderPostOg({ background: backgroundPath, lineart: lineArtPng, placement, ...input, fonts }),
  ]);
  
  // 4. Upload en parallèle
  const [cover16x9Url, story9x16Url, og191Url] = await Promise.all([
    uploadCoverPng(cover16x9Buf, input.contentId, 'cover16x9'),
    uploadCoverPng(story9x16Buf, input.contentId, 'story9x16'),
    uploadCoverPng(og191Buf, input.contentId, 'og191'),
  ]);
  
  return {
    cover16x9: cover16x9Url,
    story9x16: story9x16Url,
    og191: og191Url,
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
- [ ] 3 formats générés correctement (vérification visuelle dans Firebase Storage)
- [ ] Performance < 8 sec total pour les 3 formats
- [ ] TypeScript strict, 0 erreur, 0 `any`
- [ ] Tous les commits suivent le format `feat(cover-generator): ...`
- [ ] Push sur branche `feature/cover-generator-phase1`
- [ ] PR créée avec description + screenshots des 3 formats générés

---

## 🎯 Quand Phase 1 est terminée

Reviens vers Benoit (via Claude Desktop) avec :
1. Lien vers la PR
2. 3-5 captures d'écran des covers générés
3. Tout problème rencontré
4. Estimation effort restant Phase 2 (anti-répétition)

Ne pas commencer Phase 2 avant validation visuelle de Phase 1 par Benoit.
