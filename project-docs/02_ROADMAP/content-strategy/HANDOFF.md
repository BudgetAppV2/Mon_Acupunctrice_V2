# HANDOFF — Pipeline Cover Generation (Banque Freepik + Satori)

**Date** : 5 mai 2026 (session intensive)
**Auteur** : Benoit + Claude
**Status** : POC validé, prêt pour pipeline production
**Prochaine session** : implémentation Phase 1-5 via Claude Code

---

## 🎯 Contexte stratégique

### Ce qu'on construit
Un système de **génération automatique de covers visuelles** pour ressources/FAQ/blog du site `acupuncturejudith.ca`. Inputs : un article publié dans Firestore. Outputs : 3 PNG (cover blog, story IG, post FB/OG) générés automatiquement, sauvés dans Firebase Storage, attachés à l'article.

### Pourquoi cette approche (vs alternatives évaluées)
- **AI génération (DALL-E/gpt-image-2)** : rejeté → coût récurrent ($25-100/mois), qualité variable, risques anatomiques (visages déformés), conformité OAQ incertaine
- **Banque Freepik + Satori overlay** : retenu → 0$ récurrent, cohérence garantie, conformité totale, 5400+ combinaisons possibles

### Composants déjà livrés (POC validé)
1. **82 assets Freepik** organisés et taggés (37 backgrounds boho + 45 line art par pilier)
2. **Pipeline POC fonctionnel** : `content/visual-bank/scripts/poc-compose.mjs` → génère cover 1920×1080 en ~5 sec
3. **Algorithme placement intelligent** : analyse 3×3 du background, détecte zone vide, place line art au centre/droite
4. **Suppression background blanc** : Sharp transforme JPG line art → PNG transparent + couleur ink uniforme
5. **Style guide** : `STYLE_GUIDE_VISUEL.md` documente palette, ESQ, prompts

---

## 📦 État actuel — Ce qui est en place

### Banque visuelle
```
content/visual-bank/
├── backgrounds/                    37 boho (JPG + EPS) + metadata.json
├── lineart/
│   ├── grossesse/                  5 assets
│   ├── pediatrie/                  8 assets
│   ├── fertilite/                  10 assets
│   ├── anxiete-sommeil/            8 assets
│   ├── menopause/                  7 assets
│   ├── acupuncture-sociale/        7 assets
│   └── transversal/                0 (à compléter plus tard)
├── _archive-ai/                    20 fichiers .ai (archive Adobe Illustrator)
├── _poc-output/                    PNGs de test (gitignore)
├── raw-downloads/                  vide (gitignore)
└── scripts/
    ├── tag-and-organize-v2.py      Script de tri Freepik (terminé)
    ├── poc-compose.mjs             POC Satori (validé)
    └── batch-test.sh               Génère 6 variations rapides
```

### Documentation stratégique
```
project-docs/02_ROADMAP/content-strategy/
├── CREATION_WORKFLOW.md            Pipeline content production (6 clusters)
├── STYLE_GUIDE_VISUEL.md           Audit 11 covers + ESQ + palette officielle
├── CURATION_GUIDE.md               Termes Freepik + workflow curation
└── (existants : VISION, ARCHITECTURE, KEYWORD_BACKLOG, etc.)
```

### Contenu produit
```
content/ressources/
└── acupuncture-grossesse-montreal.md    Cluster 1 hub (3000 mots, 6 PubMed citations)
                                          [pas encore injecté Firestore]
```

### Dépendances ajoutées
- `satori@^0.26.0` (rendering JSX → SVG)
- `@resvg/resvg-js@^2.6.2` (SVG → PNG)
- `sharp` déjà présent (transparent BG processing)

---

## ✅ Décisions architecturales prises

| Décision | Choix | Justification |
|---|---|---|
| Source images | Banque Freepik curatée | 0$, qualité garantie, cohérence |
| Composition | Satori (server-side) | Inclus Next 15, fonts cohérentes site |
| Format primaire | JPG (line art) + JPG (bg) | Premium Freepik, qualité suffisante |
| Format archive | EPS conservé | Récupération SVG vectoriel future |
| Couleur line art | `#2C2A26` (ink uniforme) | Cohérence inter-articles, lisibilité |
| Algo placement | Centre prioritaire (+0.30), droite OK (+0.10), gauche évité (-0.20) | Texte en bas-gauche, line art doit pas chevaucher |
| Texte cover | Cormorant Garamond italique 108px + Inter 32px | Cohérent typographie site |
| Voile background | Gradient 4%→32% beige | Lisibilité titre garantie |

---

## 🔧 État technique du POC

### Comment lancer (pour vérifier)
```bash
cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2

# Génération unique (pige aléatoire)
node content/visual-bank/scripts/poc-compose.mjs

# Avec args
node content/visual-bank/scripts/poc-compose.mjs grossesse "Acupuncture pendant la grossesse"

# Batch 6 variations (tous piliers)
bash content/visual-bank/scripts/batch-test.sh

# Voir les outputs
open content/visual-bank/_poc-output/
```

### Performance mesurée
- Temps total : **~5 secondes** par image
- Taille PNG : 250 KB - 2 MB selon complexité bg
- Fonts chargées via Google Fonts CDN (Cormorant + Inter)
- Sharp + Resvg : performance acceptable, pas de bottleneck

### Bugs / limitations connues
1. **Quelques line art ont éléments colorés** dans l'original (rose, jaune) → actuellement convertis en gris pâle. Si gênant, ajouter mode "preserve-color" qui ne touche que le blanc
2. **Algo placement** sur backgrounds très chargés peut quand même donner placement sub-optimal → solution future : exclure backgrounds avec score zone-vide < threshold
3. **Pas encore d'anti-répétition** : si on relance le POC 5 fois, peut piger 2 fois le même asset → géré dans pipeline final (champ `usedInArticles[]`)

---

## 🎯 Prochaines étapes — Pipeline production complet

### Phase 1 — API Route + 3 formats (4-5h)
**Goal** : `POST /api/cover/generate` qui prend `{contentId, type, titre, pilier}` et retourne 3 URLs Firebase Storage.

**Tasks** :
- B1.1 : Créer `lib/cover-generator/` module (extracter du POC)
- B1.2 : 3 templates Satori (cover 1920×1080, story 1080×1920, OG 1200×630)
- B1.3 : API route `/api/cover/generate` avec validation Zod
- B1.4 : Upload Firebase Storage avec naming `covers/{contentId}/{format}.png`
- B1.5 : Retour structuré + cache headers

### Phase 2 — Pige intelligente avec anti-répétition (1-2h)
**Goal** : éviter les répétitions inter-articles, augmenter la variété.

**Tasks** :
- B2.1 : Charger metadata.json en mémoire (cache 60s)
- B2.2 : Champ `usedInArticles[]` dans metadata par asset
- B2.3 : Pondération : -50% si utilisé dans 5 derniers articles, -25% si dans 10 derniers
- B2.4 : Fallback random pondéré avec seed
- B2.5 : Endpoint `/api/cover/regenerate` pour relancer avec exclusion des choix précédents

### Phase 3 — Modal Hub /contenu (3-4h)
**Goal** : UX simple pour Judith, choix entre 4 propositions.

**Tasks** :
- B3.1 : Composant `<CoverGeneratorModal>` dans `components/features/cms/`
- B3.2 : Bouton "Générer cover" sur chaque card pending
- B3.3 : Affiche 4 propositions générées en parallèle (4 appels API simultanés)
- B3.4 : Click sur une = "Approuver" → sauvegarde URL dans Firestore
- B3.5 : "Plus de variations" = nouvelle pige avec exclusion
- B3.6 : Loading states + error handling

### Phase 4 — Bridge ressource/blog → séquence sociale (2-3h)
**Goal** : à l'approbation, optionnellement créer 4 calendarSlots.

**Tasks** :
- B4.1 : Modal "Créer aussi la séquence sociale ?" après approbation cover
- B4.2 : Choix : 4 publications / 1 story seule / aucune
- B4.3 : Adapter `useBlogSequence.ts` pour URLs internes (post-launch Vercel)
- B4.4 : Génération auto stories aux dates J+0/J+1/J+3/J+7
- B4.5 : Le cron existant `/api/cron/publish` les publie automatiquement

### Phase 5 — Documentation Judith (1h)
- B5.1 : `JUDITH_PUBLICATION_GUIDE.md` workflow Hub
- B5.2 : Screenshots du modal cover generator
- B5.3 : Exemples de variations générées
- B5.4 : FAQ "que faire si je n'aime aucune des 4 propositions ?"

**Total Phase 1-5** : 11-15h dev, étalé sur 2-3 sessions Claude Code.

---

## 📋 Liste complète des fichiers à créer (Phase 1-5)

### Nouveaux fichiers
```
lib/cover-generator/
├── compose.ts                  # Composition Satori (extracté POC)
├── pige.ts                     # Algorithme pige intelligente
├── line-art-processor.ts       # Sharp transform JPG → PNG transparent
├── placement-analyzer.ts       # Algo 3x3 grid analysis
├── templates/
│   ├── cover-blog.ts           # 1920x1080
│   ├── story-instagram.ts      # 1080x1920
│   └── post-og.ts              # 1200x630
├── fonts.ts                    # Charge Cormorant + Inter
└── types.ts                    # Types TypeScript

app/api/cover/
├── generate/route.ts           # POST - generation principale
└── regenerate/route.ts         # POST - relance avec exclusion

components/features/cms/
├── CoverGeneratorModal.tsx     # Modal 4 propositions
├── CoverPreview.tsx            # Card individuelle preview
└── CoverApprovalActions.tsx    # Boutons approuver/relancer

content/visual-bank/
└── _MANIFEST.json              # Index global tous metadata.json (cache)

scripts/
└── build-visual-bank-manifest.mjs   # Génère le _MANIFEST.json

project-docs/02_ROADMAP/content-strategy/
└── JUDITH_PUBLICATION_GUIDE.md  # Doc finale pour Judith
```

### Fichiers à modifier
```
app/api/cms/approve/route.ts    # Trigger generation cover après approbation
app/(app)/contenu/page.tsx       # Bouton "Générer cover" sur cards
lib/types/ressource.ts          # Ajouter coverImageUrl + storyImageUrl + ogImageUrl
lib/types/faq.ts                # Idem
lib/types/public-blog.ts        # Idem (si pas déjà)
lib/hooks/useBlogSequence.ts    # Adapter URLs internes (Phase 4)
package.json                    # +zod si pas présent
```

---

## ⚠️ Points d'attention pour CC

### 1. Firebase Storage CORS
Vérifier que le bucket Firebase Storage a les bonnes règles CORS pour servir les images au site public. Tester avec une image pré-générée du POC.

### 2. Server-only fonts
Satori en environnement Node a besoin des fonts en buffer. Soit :
- Télécharger via Google Fonts API (POC actuel — fait au runtime, lent)
- **Embedded** : sauvegarder les .woff2 dans `public/fonts/` et les lire avec `readFile` (recommandé pour prod)

### 3. Edge Runtime ?
Satori est compatible Edge Runtime, MAIS Sharp non. Donc :
- API route en Node.js Runtime (pas Edge)
- Si on veut Edge plus tard, remplacer Sharp par autre lib (jsquash ou native canvas)

### 4. ISR + cache images
Les images générées sont cachées par Firebase Storage. Si on régénère un cover, l'URL doit changer (timestamp ou hash) pour invalider le cache CDN.

### 5. Tests visuels
Pour chaque template (cover/story/og), produire 5-10 variations dans `_poc-output/` et review humain avant déploiement. Pas de tests automatisés visuels nécessaires.

---

## 🗂️ Tableau des transcripts précédents

Cette session est documentée dans :
- `/mnt/transcripts/2026-05-05-22-39-09-2026-05-05-day3-content-pipeline.txt` (à confirmer)

Sessions précédentes pertinentes :
- `2026-05-04-day2-launch-content-pipeline.txt` : audit visuel 11 covers, début banque Freepik

---

## ✅ Checklist commit avant prochaine session

- [ ] `git add` ciblé : visual-bank/ + project-docs/02_ROADMAP/content-strategy/ + content/ressources/acupuncture-grossesse-montreal.md + package.json + package-lock.json
- [ ] `git commit -m "feat(visual-bank): banque Freepik 82 assets + POC Satori valide + style guide"`
- [ ] `.gitignore` update : `_poc-output/`, `raw-downloads/`, `_archive-ai/` (lourd, optionnel)
- [ ] Push origin main
- [ ] Crée `CC_PROMPT_PIPELINE.md` pour la prochaine session Claude Code

---

## 🎯 Démarrage prochaine session

Pour reprendre demain :
1. Ouvre Claude Code dans le repo
2. Charge `project-docs/02_ROADMAP/content-strategy/HANDOFF.md`
3. Charge `project-docs/02_ROADMAP/content-strategy/CC_PROMPT_PIPELINE.md`
4. Lance Claude Code avec : "Lis HANDOFF et CC_PROMPT_PIPELINE, puis attaque Phase 1"
5. Suivi via session Claude Desktop (toi + moi) pour les arbitrages

---

## 📊 Métriques fin de session

- **Temps total session** : ~9h (audit + curation + scripts + POC + 3 itérations placement)
- **Lignes de code écrites** : ~600 lignes (POC compose, tag-organize, batch-test)
- **Documents stratégiques** : 4 (HANDOFF, CC_PROMPT, STYLE_GUIDE, CURATION_GUIDE)
- **Assets curatés** : 82 (37 bg + 45 line art)
- **POC variations testées** : ~12-15
- **Itérations algo placement** : 3 (initial → centre+vertical → centre+droite+gauche-pénalisée)
