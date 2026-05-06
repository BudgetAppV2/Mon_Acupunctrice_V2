# HANDOFF — Pipeline Cover Generation (état post-Phase 1 + SVG)

**Date** : 6 mai 2026 (session intensive Day 4)
**Auteur** : Benoit + Claude (Desktop) + Claude Code
**Status** : ✅ Phase 1 LIVE et fonctionnelle, validée end-to-end
**Prochaine session** : voir "Décisions ouvertes" en bas du document

---

## 🎯 Vue d'ensemble — Où on en est aujourd'hui

```
┌──────────────────────────────────────────────────────────────────┐
│  POST /api/cover/generate                                        │
│  { contentId, type, titre, pilier, ctaMode? }                    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼ ~2-7 secondes
┌──────────────────────────────────────────────────────────────────┐
│  1. Pige aléatoire (60s cache metadata)                          │
│  2. Auto-détection SVG ou JPG (preferSvgIfExists)                │
│     ├─ SVG (7 fichiers) → lecture directe → data:image/svg+xml  │
│     └─ JPG (38 fichiers) → chroma key → PNG transparent         │
│  3. Analyse placement intelligent                                │
│     ├─ Cover : grid 3x3, biais col+0.30 row+0.10                │
│     └─ Story : grid 3x4, biais col+0.30 row+0.20, offset +7%    │
│  4. Génération SVG Satori en parallèle (cover + story)           │
│  5. Rendu PNG via Resvg                                          │
│  6. Upload Firebase Storage (URLs publiques)                     │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
   { cover16x9, story9x16, assets, metadata }
```

**Le pipeline est en production sur `main`. Validé sur 4 piliers (grossesse, fertilite, anxiete-sommeil, pediatrie). Performance 2-7s pour 2 PNG.**

---

## ✅ Ce qui est livré (commits sur main)

```
542ee21 feat(visual-bank): support SVG vectoriel (hybride SVG+JPG)
b782fa9 fix(cover-generator): production fixes (storageBucket + serverExternalPackages)
5130968 feat(cover-generator): Phase 1 — module lib/cover-generator + API route + 2 templates
e416344 feat(visual-bank): POC story Satori 1080x1920 valide + CC_PROMPT_PIPELINE update
```

### Module `lib/cover-generator/` (Phase 1)

| Fichier | Role |
|---|---|
| `types.ts` | Pilier, CoverFormat, GenerateCoverInput/Output, SatoriElement |
| `pige.ts` | Pige aleatoire bg + line art par pilier (cache 60s, preferSvgIfExists) |
| `line-art-processor.ts` | Conversion JPG -> PNG transparent OU lecture SVG direct |
| `placement-analyzer.ts` | Grille 3x3 (cover) + 3x4 (story avec offset +7%) |
| `fonts.ts` | Cormorant Italic 500 + Inter 500/600 embarques (cache) |
| `templates/cover-blog.ts` | Template Satori 1920x1080 (port strict POC) |
| `templates/story-instagram.ts` | Template Satori 1080x1920 avec ctaMode (port strict POC) |
| `upload.ts` | Upload Firebase Storage avec storageBucket explicite |
| `compose.ts` | Orchestrateur parallelise (pige + process + 2 SVG + 2 PNG + upload) |

### API route

`app/api/cover/generate/route.ts` — POST endpoint runtime nodejs avec validation Zod.

### Banque visuelle

| Type | Total | Format |
|---|---|---|
| Backgrounds | 78 | JPG boho watercolor |
| Line art "trait fin" | **7** | **SVG vectoriel** ⭐ (qualite parfaite) |
| Line art "silhouette" | **38** | JPG monochrome (chroma key) |
| **Total** | **123** | Hybride |

### Fonts embarquees

`public/fonts/` :
- `CormorantGaramond-Italic-500.woff2` (93 KB)
- `Inter-500.woff2` (143 KB)
- `Inter-600.woff2` (143 KB)

---

## 🎨 Specs visuelles validees (NE PAS MODIFIER sans accord)

### Cover blog 1920x1080

| Element | Valeur |
|---|---|
| Voile gradient | `linear-gradient(180deg, rgba(245,240,232,0.04) 0%, rgba(245,240,232,0.32) 100%)` |
| Algo placement | grid 3x3, biais col=1 +0.30, col=2 +0.10, col=0 -0.20, row=1 +0.10, exclude row=2 |
| Line art | 70% width x 80% height, opacity 0.92, ink #2C2A26 |
| Surtitre | Inter 500, 32px, letterSpacing 0.2em, uppercase, color #6F8566 |
| Titre | Cormorant italic 500, 108px, lineHeight 1.05, color #2C2A26 |
| Bloc titre | left 6%, bottom 8%, maxWidth 78%, gap 18 |
| Branding | Inter 500, 26px, color #5C5852, position right 4% bottom 4% |

### Story Instagram 1080x1920

| Element | Valeur |
|---|---|
| Voile gradient | 5-stop : 0.65/0.10/0.05/0.30/0.75 (haut+bas plus opaque pour lisibilite) |
| Algo placement | grid 3x4, biais col=1 +0.30, col=2 +0.05, col=0 -0.10, row=1 +0.20, row=2 +0.05 |
| **Offset crucial** | `yPercent = (best.row + 0.5) * 25 + 7` (+7% pour libérer espace titre) |
| Line art | 130% width x 80% height (overflow geré par objectFit:contain), opacity 1.0 |
| Surtitre | Inter 600, 44px, letterSpacing 0.25em |
| Titre | Cormorant italic 500, **140px**, lineHeight 1.05 |
| **Bouton CTA** | left 15%, top 70%, width 70%, height 8%, borderRadius 999 |
| Bouton gradient | 3-stop selon ctaMode (sage ou clay) |
| Bouton ombre | `0 12px 32px rgba(44,42,38,0.32), 0 4px 12px rgba(44,42,38,0.18), inset 0 1px 0 rgba(255,255,255,0.25)` |
| Bouton texte | Inter 600, 50px, color #FFFFFF, textShadow `0 2px 4px rgba(0,0,0,0.20)` |
| Branding | Inter 600, 36px, color #2C2A26, top 90%, centré |

### Modes CTA (story uniquement)

| ctaMode | Gradient bouton | Label | Lien attendu |
|---|---|---|---|
| `ressource` (default) | sage `#7E9374 → #6F8566 → #5C7156` | "Lire la suite" | `/ressources/{slug}` |
| `reservation` | clay `#C47A58 → #B8694A → #A05B3D` | "Réserver une séance" | `/reserver` |

**Note importante** : le bouton visuel est aligné avec le **linkSticker invisible d'instagrapi** (DEFAULT_LINK_COORDS y=0.75 dans `functions-python/main.py`). Cf. `lib/utils/publishHelpers.ts:publishStoryViaInstagrapi`.

---

## 🔄 Migration SVG (Day 4 — innovation)

### Pourquoi
Les line art rasterises (JPG) etaient pixelises quand etires a 130%x80% sur la story 1080x1920.

### Solution implementee
Script `content/visual-bank/scripts/convert-eps-to-svg.py` qui :
1. Convertit EPS Freepik -> PDF (Ghostscript) -> SVG (Inkscape CLI)
2. **Audit automatique** des paths : stroke-based (trait fin) vs fill-based (blob plein)
3. **Filtrage** : ne garde que les SVG qui sont de vrais traits fins (stroked >= filled)
4. Recolore les strokes/fills restants en `#2C2A26` (ink uniforme)

### Pourquoi le filtrage
4/5 des EPS Freepik "abstract organic shapes" sont des silhouettes pleines (blob). Garder ces SVG produit des taches noires opaques. Les rejeter -> le pipeline tombe sur le JPG (chroma key) qui rend mieux ces images-la.

### Resultat (45 EPS -> 7 SVG conserves)

| Pilier | EPS total | SVG kept | JPG fallback |
|---|---|---|---|
| acupuncture-sociale | 7 | 2 | 5 |
| anxiete-sommeil | 8 | 1 | 7 |
| fertilite | 10 | 3 | 7 |
| grossesse | 5 | 1 | 4 |
| menopause | 7 | 0 | 7 |
| pediatrie | 8 | 0 | 8 |

### Detection auto au runtime
`pige.ts` -> `preferSvgIfExists(dir, jpgFile)` substitue le SVG si un fichier `.svg` avec le meme basename existe dans le dossier. Aucune modif `metadata.json` requise.

### Pour ajouter de nouveaux SVG plus tard
1. Deposer le `.eps` dans `content/visual-bank/lineart/{pilier}/`
2. Lancer `python3 content/visual-bank/scripts/convert-eps-to-svg.py {pilier}`
3. Le script auto-decide : KEPT (cree le SVG) ou REJECTED (laisse le JPG)
4. Aucune modif code requise — la pige le detectera automatiquement

---

## 🔧 Comment tester en local

### Pre-requis
- `.env.local` avec `FIREBASE_SERVICE_ACCOUNT` (json string) + `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mon-acupunctrice-hub.firebasestorage.app`
- `next.config.mjs` avec `serverExternalPackages: ['@resvg/resvg-js', 'sharp', 'satori']` (CRITIQUE)

### Lancer dev server
```bash
cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
nohup npm run dev > /tmp/judith-dev.log 2>&1 &
sleep 10 && tail -5 /tmp/judith-dev.log  # verifier "Ready in X.Xs"
```

### Tester l'API
```bash
# Test pilier grossesse mode ressource
curl -X POST http://localhost:3000/api/cover/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "test-001",
    "type": "ressource",
    "titre": "Acupuncture pendant la grossesse",
    "pilier": "grossesse"
  }' -s -w "\nHTTP %{http_code} | %{time_total}s\n"

# Test mode reservation (bouton clay)
curl -X POST http://localhost:3000/api/cover/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "test-002",
    "type": "ressource",
    "titre": "FIV à Montréal",
    "pilier": "fertilite",
    "ctaMode": "reservation"
  }'
```

### Stopper le dev server
```bash
lsof -i :3000 -sTCP:LISTEN -t | xargs kill
```

---

## 📐 Decisions architecturales prises

| # | Decision | Justification |
|---|---|---|
| D1 | Satori + Resvg (vs Canva API) | Local, pas de quota, controle total |
| D2 | 2 formats Phase 1 (cover + story) | OG 1200x630 differe — pas critique pour Judith court terme |
| D3 | Templates "non-modifiables" par CC | Eviter qu'il "ameliore" les choix esthetiques valides |
| D4 | ctaMode controle hors template | Logic dans `useBlogSequence.ts` Phase 4, pas dans le template |
| D5 | SVG hybride (filtrage auto) | Best of both : trait fin = SVG, blob = JPG chroma key |
| D6 | Threshold chroma key 235 | Conserve la finesse du trait JPG, pas trop agressif |
| D7 | placement intelligent (no random) | Evite les chevauchements titre/sujet |
| D8 | Pige metadata.json (cache 60s) | Performance + future Phase 2 anti-repetition |
| D9 | storageBucket explicite | getStorage().bucket() sans param echoue avec firebase-admin |
| D10 | serverExternalPackages | Webpack ne sait pas parser les binaires .node natifs |

---

## 🚀 Phases restantes

### Phase 2 — Anti-repetition (1-2h)
- Champ `usedInArticles[]` dans `metadata.json` par asset
- Ponderation pige : -50% si utilise dans 5 derniers articles, -25% si dans 10 derniers
- Endpoint `/api/cover/regenerate` avec exclusion des choix precedents
- **Quand** : avant de publier en serie regulier

### Phase 3 — Modal Hub `/contenu` (3-4h)
- Composant `<CoverGeneratorModal>` dans `components/features/cms/`
- Bouton "Generer cover" sur chaque card pending
- Affiche 4 propositions generees en parallele
- Click sur une = "Approuver" → sauvegarde URL dans Firestore
- "Plus de variations" = nouvelle pige avec exclusion
- **Quand** : pour mettre l'outil dans les mains de Judith

### Phase 4 — Bridge ressource/blog → sequence sociale (2-3h)
- Modal "Creer aussi la sequence sociale ?" apres approbation cover
- Choix : 4 publications / 1 story seule / aucune
- Adapter `useBlogSequence.ts` pour URLs internes
- Generation auto stories aux dates J+0/J+1/J+3/J+7
- **Logic ctaMode dans la sequence** :
  - J+0 (decouverte) → `ctaMode: 'ressource'`
  - J+1 (approfondissement) → `ctaMode: 'ressource'`
  - J+3 (application) → `ctaMode: 'reservation'` ← BASCULE
  - J+7 (temoignage) → `ctaMode: 'reservation'`
- Le cron existant `/api/cron/publish` les publie automatiquement
- **Quand** : quand on lance les premieres sequences IG

### Phase 5 — Documentation Judith (1h)
- `JUDITH_PUBLICATION_GUIDE.md` workflow Hub
- Screenshots du modal cover generator
- Exemples de variations generees
- FAQ "que faire si je n'aime aucune des 4 propositions ?"
- **Quand** : avant remise utilisateur

---

## 🤔 Decisions ouvertes pour prochaine session

### Choix #1 — Direction immediate
- **(a)** Phase 2 (anti-repetition) — meilleur usage du pipeline pour publier en serie
- **(b)** Direction B (Chantier 1 NAP + ENTITY_SOURCE_OF_TRUTH) — strategie autorite Judith
- **(c)** Acquisition de plus de line art "trait fin" Freepik pour augmenter ratio SVG/JPG

### Choix #2 — Format OG 1200x630
- A reactiver quand on aura besoin du partage Facebook/LinkedIn
- ~1h CC pour ajouter le 3e template + ajuster compose.ts + API route
- Pas critique pour Judith court terme (audience IG dominante)

### Choix #3 — Banque visuelle
- **38/45 line art sont des silhouettes pleines** (mauvais ratio pour SVG)
- A considerer : aller chercher sur Freepik/Vecteezy des **vrais line art trait fin** pour doubler le ratio
- Recherche : "minimalist line art woman illustration", "single line drawing", "outline illustration"

---

## 📂 Fichiers cles a connaitre

### Pipeline production
- `lib/cover-generator/` — module complet
- `app/api/cover/generate/route.ts` — endpoint
- `next.config.mjs` — `serverExternalPackages` critique
- `lib/utils/publishHelpers.ts:publishStoryViaInstagrapi` — integration stickers IG
- `functions-python/main.py` — Cloud Function instagrapi

### Banque visuelle
- `content/visual-bank/backgrounds/` (78 JPG)
- `content/visual-bank/lineart/{pilier}/` (45 EPS + 45 JPG + 7 SVG)
- `content/visual-bank/lineart/{pilier}/metadata.json` — index des assets
- `content/visual-bank/scripts/convert-eps-to-svg.py` — conversion EPS→SVG
- `content/visual-bank/scripts/poc-compose.mjs` — POC reference cover (legacy)
- `content/visual-bank/scripts/poc-compose-story.mjs` — POC reference story (legacy)

### Documentation
- `project-docs/02_ROADMAP/content-strategy/HANDOFF.md` (ce fichier)
- `project-docs/02_ROADMAP/content-strategy/CC_PROMPT_PIPELINE.md` — brief CC pour Phase 2-5
- `project-docs/02_ROADMAP/content-strategy/INDEX.md` — carte navigation
- `project-docs/02_ROADMAP/content-strategy/PROOF_GRAPH_OPERATIONAL_PLAN.md` — Direction B (90j)

---

## 🎯 Demarrage prochaine session

### Pour reprendre le pipeline cover (Phase 2-5)
1. Lire ce HANDOFF.md (5 min)
2. Lire `CC_PROMPT_PIPELINE.md` pour les specs strictes (10 min)
3. Test rapide : lancer dev server + curl pour confirmer pipeline OK (2 min)
4. Choisir phase a attaquer (cf. Decisions ouvertes Choix #1)
5. Brief Claude Code avec specs detaillees

### Pour reprendre Direction B (NAP + autorite)
1. Lire `PROOF_GRAPH_OPERATIONAL_PLAN.md` Chantier 1
2. Creer `ENTITY_SOURCE_OF_TRUTH.md` (~45 min)
3. Corriger NAP sur Lumino, HealthDoc, GoRendezVous, OAQ, GBP, LinkedIn
4. Aucun lien avec le pipeline cover — peut etre fait en parallele

---

## 📊 Metriques fin de session Day 4

- **6 commits** pousses sur main
- **Pipeline live** valide en 6 tests successifs (HTTP 200)
- **Performance** : 1.96s a 6.57s (cible <8s, large marge)
- **2 fixes critiques** identifies et corriges (storageBucket + webpack natifs)
- **7 SVG** convertis avec succes (auto-filtres parmi 45 EPS)
- **Zero regression** : tous les piliers fonctionnent (SVG ou JPG fallback)
- **Bouton CTA aligne** avec linkSticker invisible instagrapi (y=0.75)

**Le pipeline est PRET pour la production.**
