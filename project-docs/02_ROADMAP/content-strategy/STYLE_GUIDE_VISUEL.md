# Style Guide Visuel — Site acupuncturejudith.ca

**Date** : 5 mai 2026
**Source** : Audit quantitatif des 11 covers de blog publiés sur le site Wix avant migration
**Objectif** : Définir une ligne directrice esthétique reproductible pour la génération automatique d'images (covers de blog, ressources, FAQ) et la création de stories Instagram.

---

## 1. Synthèse — La ligne directrice émergente

### Profil tonal global
- **Luminosité moyenne : 72/100** (médiane 80) → ambiance **claire et lumineuse**
- **Saturation moyenne : 36/100** (médiane 39) → palette **désaturée, douce, pastel**
- **Type dominant : mixed** (illustrations + éléments photographiques) → **éditorial illustré**, pas pure photo
- **Format dominant : intermédiaire (6/11) + paysage (4/11)** → **horizontal lisible** au-dessus de carré

### Famille tonale dominante
La distribution des 66 couleurs présentes dans les 11 covers est sans ambiguïté :

| Famille | Présence | % |
|---|---|---|
| **rouge-rose** (chaud, doux) | 18 | 27% |
| **neutre** (gris-beige) | 17 | 26% |
| **ocre-orange** (chaud, terreux) | 12 | 18% |
| très-clair / blanc cassé | 4 | 6% |
| très-foncé (anchor) | 4 | 6% |
| bleu-froid | 4 | 6% |
| vert-sage | 4 | 6% |
| jaune-beige | 3 | 5% |

**Verdict** : palette **chaude (rouge-rose + ocre-orange + neutre = 71%)** avec touches occasionnelles bleu-froid et vert-sage pour la respiration.

### Mots-clés ESQ (Esthétique-Style-Qualités)

```
Lumineux • Doux • Chaud • Désaturé • Pastel • Éditorial • Illustré • Bienveillant
```

---

## 2. Palette officielle Judith (extraite des consensus)

### Tons primaires (utilisés dans 4+ covers)
```
#856457   Brun chaud (terre, sang séché)        — 8x
#aca394   Beige doux (neutre chaud)             — 8x
#de585d   Rouge-rose vif (rouge corail)         — 4x
```

### Tons secondaires (3+ covers)
```
#a1a9c4   Bleu-gris (froid de respiration)      — 3x
#ecc0ab   Pêche pastel (chaleur sucrée)         — 3x
```

### Tons tertiaires (anchors et accents)
```
#dcdac7   Crème (fond clair)                    — 2x
#ded59b   Jaune-vert pâle (accent)              — 2x
#fbfbeb   Blanc cassé (fond ultra-clair)        — 2x
#22242a   Quasi-noir (anchor type/contrast)     — 2x
```

### Codification suggérée pour le code (Tailwind / Satori)

```css
/* judith-palette.css */
:root {
  /* Primaires */
  --judith-clay: #856457;       /* terre/argile */
  --judith-sand: #aca394;       /* sable */
  --judith-coral: #de585d;      /* corail accent */

  /* Secondaires */
  --judith-mist: #a1a9c4;       /* bleu de respiration */
  --judith-peach: #ecc0ab;      /* pêche */

  /* Anchors */
  --judith-cream: #dcdac7;      /* crème fond */
  --judith-cream-light: #fbfbeb;/* fond ultra-clair */
  --judith-ink: #22242a;        /* texte foncé */

  /* Accent rare */
  --judith-sage: #7da986;       /* vert (1-2 usages max) */
}
```

⚠️ **Attention** : ces tokens sont DIFFÉRENTS du système Tailwind actuel du site (`sage`, `sand`, `clay` du theme.config). Le site utilise une palette légèrement différente (plus verte). **Décision à prendre** : on aligne le style guide visuel SUR le site existant ? Ou on ajuste légèrement le site pour matcher l'identité des covers historiques ?

---

## 3. Variations par catégorie / pilier

L'analyse révèle des nuances par sujet — précieuses pour le prompt engineering futur :

### POST-PARTUM (luminosité 83 / saturation 38)
- **Plus clair que la moyenne**, doux, presque pastel
- Tonalités rose pâle + crème
- Recommandation prompt : "soft pastel pink, warm cream, gentle morning light"

### FERTILITÉ (luminosité 90 / saturation 39)
- **Le plus clair de toutes les catégories** — léger, aérien
- Rose corail accent + crème
- Recommandation prompt : "luminous airy composition, soft coral accent, ethereal light"

### PÉDIATRIE (luminosité 74 / saturation 43)
- Plus saturée, **plus colorée et joyeuse**
- Tons chauds variés
- Recommandation prompt : "warm playful colors, joyful tones, slightly more vibrant"

### GROSSESSE (luminosité 66 / saturation 10)
- **Plus désaturée, presque monochrome**
- Très posé, contemplatif
- Recommandation prompt : "muted earthy tones, contemplative mood, almost monochromatic warm beige"

### TRANSVERSAL (luminosité 42 / saturation 25)
- ⚠️ **Type photo** au lieu d'illustration
- Plus sombre, plus dramatique
- Outliers du corpus — à reconsidérer pour cohérence

---

## 4. Outliers identifiés (à NE PAS reproduire)

### `acupuncture-pediatrique` (cover.png)
- Luminosité 37 (vs médiane 80) — **trop sombre**
- Type photo (vs majorité illustration)
- Format carré (vs majorité paysage/intermédiaire)
- **À ne pas utiliser comme référence**

### `acupuncture-systeme-immunitaire` (cover.png)
- Luminosité 42 — **trop sombre**
- Type photo
- Tons jaunes-bruns dramatiques (gingembre, miel)
- **Réutiliser uniquement pour "remèdes/aliments"**, pas santé générale

### `l-acupuncture-sociale...` (cover.png)
- Luminosité 42, **saturation 8** — quasi noir & blanc
- Type photo journalistique
- **Style très spécifique**, à réserver pour acupuncture sociale uniquement

### `bébé-siège-acupuncture` (cover.jpg)
- Saturation 77 — **trop saturé** (orange vif + vert)
- À reconsidérer ou refaire

---

## 5. Consigne de génération d'image — Prompt template

### Template de prompt master pour ChatGPT Pro (gpt-image-2)

```
Generate an editorial illustration in soft pastel style for a French Quebec acupuncture blog.

VISUAL STYLE
- Aesthetic: soft, warm, editorial, hand-drawn illustration mixed with light photographic elements
- Mood: gentle, reassuring, professional, contemplative
- Color palette: warm desaturated tones — terracotta clay (#856457), warm sand beige (#aca394), 
  soft coral accent (#de585d), with optional touches of misty blue (#a1a9c4) or peach (#ecc0ab)
- Light: luminous, morning-like, soft diffused
- Saturation: medium-low (around 35-45%), pastel feel
- Luminosity: high (around 70-85%), bright but not glaring

COMPOSITION
- Format: 16:9 horizontal (1920x1080) for blog cover
- Empty space at top-left for title overlay (300px high band)
- Subject centered or slightly off-center
- Avoid clutter — minimum 30% negative space

CONSTRAINTS
- NO faces visible (or only soft silhouettes)
- NO acupuncture needles visible (anatomically risky)
- NO Asian exoticism clichés (no Chinese characters, no lanterns, no mandalas)
- NO medical equipment (no syringes, no clinical settings)
- Suitable for a healthcare professional context (OAQ-regulated)

SUBJECT FOR THIS ARTICLE
[INSERT TOPIC: e.g., "Pregnancy nausea and acupuncture relief — show a peaceful pregnant 
silhouette resting with hand on belly, warm interior light, plants in background"]

CULTURAL CONTEXT
- Quebec, Canada — winter to spring climate
- Modern progressive women's health perspective
- Bilingual French-English audience
```

### Variations par catégorie (à concaténer au master)

**Grossesse** :
```
SUBJECT FOCUS: Pregnancy and motherhood. Show natural elements (plants, soft fabrics, 
warm light), gentle curves suggesting belly without explicit body, contemplative atmosphere.
COLOR EMPHASIS: muted earthy tones, less saturation, almost monochromatic warm beige.
```

**Pédiatrie** :
```
SUBJECT FOCUS: Childhood and gentle care. Slightly more playful — soft toys, gentle 
patterns, but still elegant and not childish. Warm enveloping atmosphere.
COLOR EMPHASIS: slightly more saturation, warm peach and coral accents, joyful but soft.
```

**Fertilité** :
```
SUBJECT FOCUS: Hope and conception. Light, airy, ethereal — flower buds, morning light, 
empty space symbolizing potential. Avoid explicit reproductive imagery.
COLOR EMPHASIS: highest luminosity, soft coral accent, ethereal light atmosphere.
```

**Acupuncture sociale** :
```
SUBJECT FOCUS: Community and accessibility. Warmer documentary feel, suggesting hands 
helping or community space. Can be more photographic than illustrated.
COLOR EMPHASIS: slightly more saturated, hint of journalistic warmth.
```

---

## 6. Workflow de génération recommandé

### Approche A — Manuelle assistée (recommandée pour démarrer)

1. **Tu (Benoit) ouvres ChatGPT Pro** dans le navigateur
2. **Tu uploades 2-3 covers de référence** depuis `/tmp/judith_covers_audit/` :
   - `acupuncture-nausees-grossesse.png` (médiane parfaite)
   - `fatigue-post-natale-acupuncture.png` (post-partum)
   - `préparation-accouchement-induction-acupuncture.png` (vert-sage accent)
3. **Tu copies-colles le prompt master + variation catégorie** (section 5)
4. **Tu génères 3-4 variations**, tu choisis la meilleure
5. **Tu sauvegardes dans Hub** comme cover de l'article correspondant

### Approche B — Semi-automatisée (à coder en Phase 2)

1. Article publié dans Firestore (status: pending)
2. Bouton "Générer image cover" dans Hub `/contenu`
3. API route `/api/generate-cover-image` :
   - Extrait titre + résumé + pilier
   - Construit prompt master + variation catégorie
   - Appelle OpenAI gpt-image-2 API avec image de référence (cover existante du même pilier)
   - Retourne image générée avec preview
4. Judith approuve ou régénère
5. Image sauvegardée dans Firebase Storage + URL dans le doc Firestore

### Approche C — Hybride avec banque d'images (alternative low-cost)

1. Constituer une **banque de 30-50 images de référence** stockées dans Firebase Storage :
   - 5-10 images par pilier (grossesse / pédiatrie / fertilité / etc.)
   - Toutes alignées sur le style guide
   - Sources mixtes : Unsplash curated + ChatGPT Pro génération + photos Eric Bates de Judith
2. Algorithme matche un article au pilier → propose 3 images de la banque
3. Judith choisit
4. Satori applique l'overlay branding (titre, logo, CTA)

**Coût** : 0$ après constitution initiale. Cohérence garantie. Effort initial 4-6h pour banque.

---

## 7. Templates Satori pour overlay branding

Une fois l'image de fond choisie (peu importe la source), Satori applique :

### Template "Blog Cover" (1920×1080)
```
+------------------------------------------+
|                                          |
|  TITRE DE L'ARTICLE                      |
|  [Cormorant Garamond 72px italic]        |
|                                          |
|  Catégorie · Date                        |
|  [Inter 18px]                            |
|                                          |
|  [IMAGE DE FOND OU ILLUSTRATION]         |
|                                          |
|                  Logo J  acupuncturejudith.ca
+------------------------------------------+
```

### Template "Story Promo" (1080×1920)
```
+----------------+
| Logo J         |
|                |
| [IMAGE FOND]   |
|  60% hauteur   |
|                |
+----------------+
| TITRE          |
| Cormorant 64px |
|                |
| Lien dans bio  |
|                |
| acupuncture    |
| judith.ca      |
+----------------+
```

### Template "Story Rappel" (1080×1920) — variation
```
+----------------+
|                |
|  💬 Question  |
|                |
| [IMAGE FOND]   |
|                |
| FAQ extrait    |
| de l'article   |
|                |
| Lire l'article |
| complet →      |
|                |
+----------------+
```

---

## 8. Checklist conformité OAQ pour images

Pour TOUTE image générée (peu importe la source) :

- ☑ Aucune aiguille visible (risque représentation incorrecte)
- ☑ Aucun visage en gros plan (risque erreur anatomique IA)
- ☑ Aucun symbole médical détourné
- ☑ Pas de promesse visuelle (avant/après, "guérison miracle")
- ☑ Pas de stéréotypes ethniques (chinoiseries clichés)
- ☑ Respect de la diversité (couleurs de peau, âges, morphologies variées dans la banque)
- ☑ Pas de minor visible identifiable (si pédiatrie, silhouettes uniquement)

---

## 9. Tests à effectuer avant de coder

### Test 1 — ChatGPT Pro avec image de référence
1. Upload `/tmp/judith_covers_audit/acupuncture-nausees-grossesse.png` dans ChatGPT
2. Prompt master + variation grossesse + sujet "Préparation à l'accouchement"
3. Évaluer : 5-10 générations
4. Critère succès : 7/10 utilisables sans modifications

### Test 2 — Cohérence inter-générations
1. Générer 5 images successives pour 5 sujets différents
2. Vérifier qu'elles "semblent du même blog"
3. Critère succès : un visiteur dirait "même style"

### Test 3 — Vitesse + coût
1. Mesurer temps de génération (gpt-image-2 = ~10-30 sec)
2. Mesurer coût réel via API (medium quality $0.053/image)

### Décision après tests
- **Si tests réussis** → Approche B (semi-auto) en Phase 2
- **Si tests partiellement réussis** → Approche C (banque + Satori)
- **Si tests échouent** → Approche A (manuelle pure) avec ChatGPT Pro

---

## 10. Effort total estimé

| Phase | Description | Effort | Quand |
|---|---|---|---|
| 0 | Tests ChatGPT Pro (Approche A) | 1h | Maintenant |
| 1 | Constituer banque 30-50 images (Approche C fallback) | 4-6h | Cette semaine |
| 2 | Coder Satori overlay templates | 4-6h | Semaine prochaine |
| 3 | Coder pipeline auto generation (Approche B si tests OK) | 6-8h | Après validation |
| 4 | Intégration Hub `/contenu` (bouton "Générer cover") | 2-3h | Après Phase 3 |
| 5 | Documentation Judith | 1h | Final |

**Total : 18-25h** étalé sur 2-3 semaines.

---

## 6.bis Approche retenue — Banque Freepik + Satori overlay

**Décision (5 mai 2026)** : pour cette première itération, on adopte une approche **banque d'assets curatés Freepik** plutôt que la génération AI live. Raisons principales :

1. **Coût récurrent zéro** (abonnement Freepik Premium déjà payé)
2. **Cohérence visuelle garantie** par curation manuelle (vs dérive AI inter-générations)
3. **Conformité OAQ assurée** (pas de risque d'aiguille mal placée, visage déformé, etc.)
4. **Combinatoire suffisante** : 30 backgrounds × 30 line art × 6 piliers = 5 400 combinaisons possibles
5. **Vitesse** : composition Satori instantanée vs 10-30 sec API call AI

### Architecture choisie

```
Boho background (universel, palette pastel chaude)
        +
Line art noir/foncé (ciblé par pilier de l'article)
        +
Overlay Satori (titre Cormorant + branding)
        =
Cover blog/ressource/FAQ + Story IG + Post FB (3 formats simultanés)
```

### Workflow opérationnel

1. **Curation initiale** (one-shot, ~3-4h) : Benoit constitue 60-70 assets via Freepik Premium → voir `CURATION_GUIDE.md`
2. **Tagging et organisation** (~30 min) : script `content/visual-bank/scripts/tag-and-organize.py` interactif, génère metadata.json
3. **Production** (par article) : système de pige intelligente (anti-répétition) → 4 propositions à Judith dans Hub `/contenu` → elle choisit
4. **Composition Satori** : extraction dimensions + génération des 3 formats (16:9, 9:16, 1.91:1)

### Banque visuelle — Documentation associée

| Document | Contenu |
|---|---|
| `CURATION_GUIDE.md` | Termes de recherche Freepik par pilier, critères de sélection, workflow |
| `content/visual-bank/scripts/tag-and-organize.py` | Script Python interactif de tri |
| `content/visual-bank/{backgrounds,lineart}/metadata.json` | Index auto-généré des assets |

### Fallback si la banque est insuffisante

Si pour un article spécifique aucune combinaison ne fonctionne :
- **Plan B-1** : ChatGPT Pro (déjà payé) génère 1-2 alternatives avec prompt master
- **Plan B-2** : Photo Eric Bates de Judith (banque pré-existante)
- **Plan B-3** : Demander à Judith d'illustrer manuellement (fallback ultime)

---

## 11. Recommandations finales

### À faire maintenant (cette session)
1. **Test 1 ChatGPT Pro** — valider que l'approche IA + référence fonctionne
2. **Choisir entre Approche B et C** selon résultats du Test 1
3. **Commit ce style guide** dans le repo

### À ne pas faire
- ❌ Coder satori sans avoir testé la génération d'images d'abord
- ❌ Générer 100 images "au feeling" sans le prompt master
- ❌ Aligner le site sur les outliers (`l-acupuncture-sociale`, `pediatrique`)

### Question à clarifier avec Judith
- Est-ce qu'elle veut **garder** les 11 covers actuels pendant la migration, ou **les remplacer** progressivement par des nouveaux générés ?
- Si remplacement : par ordre de priorité (les outliers d'abord, ou les + populaires d'abord) ?
- Y a-t-il des **photos d'elle (Eric Bates)** qu'on peut intégrer comme alternative à la génération IA pour certains articles personnels ?

