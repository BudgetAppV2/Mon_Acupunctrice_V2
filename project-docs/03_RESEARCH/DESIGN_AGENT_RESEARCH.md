# Recherche — Agent de design graphique pour presets video pro

Date : 26 mars 2026

---

## 1. Architecture de l'agent

### Le probleme de la "convergence distributionnelle"

Anthropic identifie ce phenomene : les LLMs sont entraines sur la moyenne statistique des decisions de design, ce qui produit des outputs generiques (le "AI look"). Le skill `frontend-design` officiel d'Anthropic (277K+ installs) combat ca en injectant un systeme de design avec des choix audacieux AVANT que Claude ne code.

**Principe cle :** L'agent ne doit PAS generer des combinaisons aleatoires. Il doit appliquer des REGLES de graphiste pro a des CONTRAINTES specifiques (niche acupuncture, audience 35-55 ans, plateforme IG/YT, style enseigner/connecter/aider/inspirer).

### Architecture en 3 couches

```
Couche 1 : KNOWLEDGE BASE (regles de design statiques)
  → Theorie des couleurs, pairings de fonts, safe zones, ratios de contraste
  → Tendances visuelles sante/bien-etre 2025
  → Palettes de couleurs validees pour la niche

Couche 2 : GENERATOR (Claude avec system prompt specialise)
  → Recoit les contraintes (style, audience, plateforme)
  → Genere un preset complet (couleurs, fonts, animations, filtre)
  → Applique les regles de la knowledge base

Couche 3 : CRITIC (Claude avec prompt de critique)
  → Evalue le preset genere sur 8 dimensions
  → Score chaque dimension de 1 a 5
  → Si score < 3 sur une dimension → regenere
```

### Workflow de generation

```
Input : { style: 'enseigner', mood: 'professionnel chaleureux', plateforme: 'instagram' }
  ↓
GENERATOR → preset_v1.json
  ↓
CRITIC → { scores: { contraste: 4, harmonie: 5, lisibilite: 3, originalite: 2 }, feedback: "trop generique" }
  ↓
GENERATOR + feedback → preset_v2.json (corrige)
  ↓
CRITIC → { scores: { contraste: 5, harmonie: 5, lisibilite: 4, originalite: 4 }, global: 4.5 }
  ↓
Output : preset_v2.json ✓
```

---

## 2. Knowledge base structure

### 2A — Safe zones Instagram Reels (9:16, 1080x1920)

```
Zone sûre pour le texte :
  ┌──────────────────────┐
  │  108px top margin    │  (nom utilisateur, boutons)
  │                      │
  │  60px  ←  SAFE  → 120px
  │  left     ZONE    right
  │                      │
  │                      │
  │  320px bottom margin │  (caption, boutons like/share)
  └──────────────────────┘

  Texte principal : entre y=200 et y=1600 (1400px de zone utile)
  Texte CTA : y=1500 (au-dessus de la zone caption)
  Font minimum : 45px pour lisibilite mobile
  Max 10 mots par ecran pour lecture en 1.5s
```

### 2B — Palettes couleurs sante/bien-etre

**Palette 1 — Sage Naturel (actuelle Judith)**
```
Primary : #87A878 (sage green)
Background : #F5F0EB (sand/creme)
Accent : #E8D5B7 (warm beige)
Text : #2D3436 (charcoal)
Highlight : #DFE6DA (light sage)
```

**Palette 2 — Terre & Chaleur**
```
Primary : #A67C52 (terracotta)
Background : #FAF3ED (warm white)
Accent : #6B8F71 (forest green)
Text : #3D2C1E (dark brown)
Highlight : #E6CDB5 (soft clay)
```

**Palette 3 — Ocean Calm**
```
Primary : #5B8C7E (teal)
Background : #F0F4F3 (cool white)
Accent : #C4A76C (gold)
Text : #1A2A3A (deep navy)
Highlight : #B8D4CC (light teal)
```

**Palette 4 — Minimal Pro**
```
Primary : #2D3436 (charcoal)
Background : #FFFFFF (white)
Accent : #87A878 (sage)
Text : #2D3436 (charcoal)
Highlight : #F5F5F5 (light gray)
```

**Palette 5 — Sunset Healing**
```
Primary : #D4845A (warm coral)
Background : #FFF8F0 (peach white)
Accent : #7B9E89 (sage)
Text : #3A2518 (dark sienna)
Highlight : #F2DCC5 (soft peach)
```

### 2C — Regles de contraste WCAG

```
Texte normal : ratio minimum 4.5:1
Texte large (>= 24px ou >= 19px bold) : ratio minimum 3:1
Texte sur video : TOUJOURS utiliser au moins une technique de separation :
  1. Stroke/outline noir 2px (ctx.strokeText)
  2. Shadow noire (shadowBlur: 4, shadowColor: rgba(0,0,0,0.8))
  3. Background pill semi-transparent (rgba(0,0,0,0.5) ou rgba(255,255,255,0.7))
  4. Combination stroke + shadow pour garantie maximale
```

**Formule de ratio de contraste :**
```typescript
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
```

### 2D — 10 meilleures combinaisons de fonts

| # | Titre | Corps | Style | Usage |
|---|-------|-------|-------|-------|
| 1 | Bebas Neue | Inter | Impact + clean | Educatif, direct |
| 2 | Playfair Display | Lora | Elegant + readable | Inspirer, temoignages |
| 3 | Montserrat | Open Sans | Moderne + propre | Polyvalent |
| 4 | DM Serif Display | Poppins | Editorial + geometrique | Sante, pro |
| 5 | Oswald | Raleway | Condense + elegant | Magazine, trending |
| 6 | Dancing Script | Inter | Cursive + clean | Coulisses, personnel |
| 7 | Anton | Work Sans | Ultra-bold + neutre | Hooks, attention |
| 8 | Cormorant Garamond | Source Sans Pro | Classique + moderne | Credibilite, confiance |
| 9 | Caveat | Nunito | Manuscrit + doux | Authentique, accessible |
| 10 | Righteous | Poppins | Retro-moderne + clean | Fun, energie |

---

## 3. Processus de generation

### Pipeline

```
Etape 1 : CONTRAINTES
  Input : { style, mood, audience, plateforme, niche }
  → Selectionne les regles applicables de la knowledge base

Etape 2 : GENERATION
  Claude genere un VideoTheme complet :
  {
    id, name, style, mood,
    colors: { primary, background, accent, text, highlight },
    fonts: { title: { family, size, weight }, body: { ... }, cta: { ... } },
    textEffects: { stroke, shadow, background, animation },
    subtitleStyle: { ... },
    filter: { name, css },
    overlayEffects: { grain, vignette, lightLeak },
    transitions: { type, duration }
  }

Etape 3 : VALIDATION AUTOMATIQUE
  → Contraste WCAG >= 4.5:1 (calculer programmatiquement)
  → Font sizes >= 45px (mobile readable)
  → Max 3 couleurs par ecran
  → Font pairing valide (titre ≠ corps, contraste de poids)

Etape 4 : CRITIQUE IA
  Claude evalue sur 8 dimensions (1-5) :
  1. Contraste et lisibilite
  2. Harmonie des couleurs
  3. Coherence avec la niche sante/bien-etre
  4. Originalite (pas generique)
  5. Hierarchie visuelle
  6. Adequation au style (enseigner/connecter/aider/inspirer)
  7. Adequation a la plateforme (IG vs YT vs FB)
  8. Professionnalisme global

Etape 5 : ITERATION
  Si score moyen < 3.5 → regenerer avec le feedback du critique
  Si score moyen >= 3.5 → accepter
  Max 3 iterations
```

---

## 4. Preview system

### Comment visualiser un preset

**Option 1 : HTML/CSS preview (la plus simple)**
```html
<div style="width:270px; height:480px; background:${colors.background}; position:relative; border-radius:12px; overflow:hidden;">
  <!-- Simuler un frame video avec un gradient -->
  <div style="...background-image..."></div>
  <!-- Titre -->
  <div style="font-family:${fonts.title.family}; font-size:${fonts.title.size}px; color:${colors.text}; text-shadow:...">
    Exemple de titre
  </div>
  <!-- Sous-titre style -->
  <div style="...subtitle preview...">Sous-titre exemple</div>
  <!-- CTA -->
  <div style="...cta style...">CTA exemple</div>
</div>
```

**Option 2 : Canvas 2D preview (dans l'editeur)**
Un composant React `ThemePreview` qui dessine un frame simule avec les styles du preset sur un Canvas 270x480. Utilise les memes fonctions de rendu que `drawOverlays.ts` et `drawSubtitles.ts`.

**Option 3 : Artifacts Claude**
Generer un HTML artifact dans Claude Desktop pour preview visuel. Permet de voir le resultat sans deployer. Ideal pour le workflow de creation par le design agent.

---

## 5. Anti-patterns — eviter le "look IA generique"

| Anti-pattern | Symptome | Prevention |
|-------------|----------|-----------|
| Couleurs trop saturees | Arc-en-ciel, couleurs criardes | Limiter a 3 couleurs, utiliser les palettes validees |
| Fonts decoratives partout | Tout en Lobster/Pacifico | 1 display font max pour les titres, corps en sans-serif clean |
| Gradient generique | Degradé bleu-violet partout | Gradients subtils, 2 couleurs proches, ou monochrome |
| Symmetrie parfaite | Trop centre, trop aligne | Position legere hors-centre (x: 0.45 au lieu de 0.5) |
| Trop d'effets | Glow + ombre + outline + gradient | 1 effet dominant, 1 secondaire, le reste neutre |
| Blanc sur fond video | Texte invisible sur scenes claires | Toujours stroke + shadow, meme sur texte blanc |
| Style identique partout | Tous les Reels se ressemblent | Varier les presets par style (enseigner ≠ inspirer) |

**Regle d'or :** Un bon preset a UNE chose qui attire l'oeil (la font titre, la couleur accent, l'animation d'entree) et le RESTE est sobre. Le contraste visuel vient de la retenue, pas de l'accumulation.

---

## 6. Plan d'implementation

### Phase 1 — Knowledge base (1 prompt)
- Creer `lib/data/designKnowledge.ts` avec :
  - Les 5 palettes de couleurs
  - Les 10 pairings de fonts
  - Les regles de safe zones
  - Les regles de contraste
  - Les 8 dimensions de critique

### Phase 2 — Generateur de presets (1-2 prompts)
- Creer `lib/data/videoThemes.ts` avec 12-16 presets generes par Claude Desktop
  en appliquant les regles de la knowledge base
- Chaque preset = un objet VideoTheme complet (couleurs, fonts, effets, filtre)
- 3-4 presets par style (enseigner, connecter, aider, inspirer)

### Phase 3 — UI de selection (1 prompt)
- Composant `ThemeSelector` dans l'editeur
- Grille de previews Canvas (miniatures 90x160)
- Tap sur un theme → applique les styles aux overlays/sous-titres

### Phase 4 — Preview interactif (1 prompt)
- Composant `ThemePreview` Canvas 270x480
- Dessine un frame simule avec le preset applique
- Utilise les fonctions de rendu existantes

### Phase 5 — Agent de critique (futur)
- API route qui appelle Claude pour evaluer un preset
- Score sur 8 dimensions
- Feedback textuel pour amelioration
- Workflow itératif dans Claude Desktop

---

## 7. Prototype de system prompt — Agent directeur artistique

```
Tu es un directeur artistique senior specialise dans le contenu video pour les reseaux sociaux,
avec une expertise specifique dans le domaine de la sante holistique et de l'acupuncture.

CONTEXTE :
Tu crees des presets video pour Judith, acupunctrice quebecoise a Montreal.
Son audience : femmes 30-55 ans, interessees par la sante naturelle, la fertilite, le bien-etre.
Son ton : chaleureux, professionnel, accessible, authentique.
Ses plateformes : Instagram Reels, YouTube Shorts, Facebook.
Format : 1080x1920 (9:16 vertical).

REGLES DE DESIGN :

Couleurs :
- Max 3 couleurs par ecran (primary, accent, text)
- Les tons terreux et sage green sont ta signature (niche sante/bien-etre)
- TOUJOURS verifier le contraste WCAG 4.5:1 pour le texte
- Les fonds semi-transparents (rgba) aident la lisibilite sur video

Typographie :
- Font titre : DISPLAY bold, 48-64px, 1 seule font par preset
- Font corps : sans-serif clean, 36-42px
- Font CTA : meme que corps, semi-bold
- Minimum 45px pour mobile (1080px width)
- Stroke 2px noir + shadow TOUJOURS pour le texte sur video

Safe zones :
- Ne PAS placer de texte dans les 108px du haut ni les 320px du bas
- Zone utile : y=200 a y=1600 (1400px de hauteur)
- Marges laterales : 60px gauche, 120px droite

Animations :
- 1 animation d'entree pour le titre (scale_pop, slide_up, ou typewriter)
- Fade ou slide pour les sous-titres
- Bounce ou elastic pour le CTA
- PAS de glitch, shake, ou effets agressifs (incoherent avec le ton)

Filtres :
- Warm tones pour "connecter" et "inspirer" (filtre warm_glow)
- Clean/bright pour "enseigner" (filtre clean_bright)
- Naturel pour "aider" (filtre minimal ou aucun)

ANTI-PATTERNS A EVITER :
- Pas de gradient bleu-violet (trop generique)
- Pas de Lobster/Pacifico pour le titre (trop "blog 2015")
- Pas d'accumulation d'effets (max 2 effets texte par preset)
- Pas de texte blanc sans stroke/shadow
- Pas de couleurs neon ou trop saturees
- Pas de style identique pour les 4 types de contenu

OUTPUT :
Retourne un JSON VideoTheme complet avec tous les champs necessaires.
Justifie chaque choix de design en 1 phrase.
```

Sources :
- [Anthropic Frontend Design Skill](https://github.com/mustafakendiguzel/claude-code-ui-agents)
- [Instagram Safe Zones 2026](https://zeely.ai/blog/master-instagram-safe-zones/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Color Psychology in Wellness Branding](https://radiantmarketingaz.com/blog/the-psychology-of-color-in-wellness-branding-and-design/)
- [Holistic Brand Color Palettes 2025](https://thebrandalchemists.com/blogs/news/holistic-brand-color-palettes-2025)
- [Google Fonts Pairings](https://www.pagecloud.com/blog/best-google-fonts-pairings)
- [Canva Magic Design + OpenAI](https://openai.com/index/canva/)
- [Top 50 Google Font Pairings](https://www.pagecloud.com/blog/best-google-fonts-pairings)
