# Direction — Éditeur Pro Mon Acupunctrice Hub

**Date :** 27 mars 2026
**Branche :** `feature/editor-pro`
**Objectif :** Transformer l'éditeur de base en un outil de qualité professionnelle

---

## État des lieux

### Ce qui est stable et déployé (branche main)
- App complète : idéation → édition → publication multi-plateforme
- Export WebCodecs seek-based (H.264 8 Mbps, Web Audio API)
- Publication : Instagram Reels, Facebook, YouTube, Stories (Web Share API)
- Store multi-clip M1 (clips[], syncLegacyFields, rétrocompatible)
- Persistance editorData + vidéo source dans Firestore/Storage
- Captions multi-plateformes depuis la transcription
- Timeline : trim handles, drag blocs texte/sous-titres, anti-swipe Safari

### Recherche complétée (8 rapports)
| Document | Contenu clé |
|----------|-------------|
| `EDITOR_PRO_RESEARCH.md` | Librairies, quick wins, 0 dépendances |
| `EDITOR_PRO_DEEP_RESEARCH.md` | 30 fonts, 22 animations, effets Canvas, LUTs |
| `EDITOR_ARCHITECTURE_RESEARCH.md` | Pipelines, SDKs, CapCut = WebAssembly+WebCodecs |
| `EDITOR_PRO_ARCHITECTURE.md` | Architecture finale révisée, plan 4 phases |
| `EDITOR_PRO_ARCHITECTURE_REVIEW.md` | Review Gemini : Thèmes > Options, preview HQ |
| `DESIGN_AGENT_RESEARCH.md` | Agent design 3 couches, anti AI-look |
| `VISUAL_ANALYSIS_RESEARCH.md` | Analyse terrain : Reels performants, CapCut presets |
| `VISUAL_TRENDS_2026_RESEARCH.md` | Tendances visuelles 2026, Pantone, serif revival |

### Ce qui a été construit (branche feature/editor-pro)
| Fichier | Rôle |
|---------|------|
| `lib/data/designKnowledge.ts` | Knowledge base : 15 fonts, 7 palettes WCAG, safe zones, word-wrap, règles design |
| `lib/data/videoThemes.ts` | 8 thèmes prédéfinis (Sage Zen, Minimal Chic, Terre & Chaleur, Bold Énergie, Océan Doux, Pantone 2026, Raw Authentique, Dark Clinic) |
| `skills/directeur-artistique/SKILL.md` | Persona DA + workflow 5 étapes + 10 règles + anti-patterns |
| `skills/directeur-artistique/references/` | design-rules.md, typography-guide.md, color-theory.md |
| `skills/directeur-artistique/templates/` | critique-template.md (8 dimensions), theme-template.json |
| `skills/directeur-artistique/scripts/` | validate-contrast.ts, critique-preset.ts, generate-preview.ts |

---

## L'Agent Directeur Artistique

### Qu'est-ce que c'est?

Un skill Claude Code spécialisé en design graphique pour vidéo sociale dans
la niche santé/bien-être. Ce n'est PAS un simple system prompt — c'est un
système en 3 couches avec validation programmatique.

### Les 3 couches

```
Couche 1 — SKILL.md (toujours chargé quand activé)
  Persona directeur artistique senior
  10 règles non-négociables
  Workflow en 5 étapes
  Anti-patterns (le "AI look", convergence distributionnelle)

Couche 2 — References (chargées à la demande)
  design-rules.md      → 10 règles validées par données terrain
  typography-guide.md   → Fonts, pairings, tailles, effets obligatoires
  color-theory.md       → Palettes, WCAG, psychologie couleurs niche

Couche 3 — Scripts exécutables (validation objective)
  validate-contrast.ts  → Vérifie WCAG 4.5:1 programmatiquement
  critique-preset.ts    → Score automatique sur 8 dimensions (seuil 3.5/5)
  generate-preview.ts   → HTML preview d'un Reel avec le thème appliqué
```

### Quand on l'utilise

L'agent est utilisé dans ces situations :

1. **Créer un nouveau thème** — On demande à Claude Code de créer un VideoTheme.
   Le skill charge les references, génère le thème, valide le contraste,
   auto-critique sur 8 dimensions, et produit un preview HTML.

2. **Critiquer un thème existant** — On soumet un thème à la grille de critique
   pour vérifier s'il respecte les standards (lisibilité, cohérence palette,
   authenticité niche, tendances 2026, etc.)

3. **Ajuster les palettes/fonts** — Toute décision esthétique passe par l'agent
   qui a le contexte de la niche santé/bien-être et les données terrain.

4. **Valider des changements visuels** — Avant de merger un changement visuel,
   l'agent vérifie le contraste WCAG et la cohérence.

### Comment on l'utilise concrètement

```bash
# Exemple 1 : Créer un nouveau thème
claude "En utilisant le skill directeur-artistique, crée un nouveau
thème vidéo pour le style 'connecter' de Judith. Valide le contraste
et produis un preview HTML."

# Exemple 2 : Critiquer les thèmes existants
claude "Utilise le skill directeur-artistique pour évaluer les 8 thèmes
dans lib/data/videoThemes.ts avec la grille de critique 8 dimensions."

# Exemple 3 : Ajuster une palette
claude "La palette Sunset Healing a un accent trop clair sur blanc.
Utilise le skill directeur-artistique pour proposer un accent qui
passe WCAG 3.0:1 tout en restant dans les tons pêche/doré."
```

### Ce que l'agent ne fait PAS

- Il ne code pas l'UI (c'est les prompts P1.1-P1.5)
- Il ne modifie pas le pipeline d'export
- Il ne touche pas au store Zustand
- Il ne remplace pas le jugement humain — il ASSISTE

---

## Décisions validées

1. **BUILD tout** — pas de SDK externe (sauf lottie-web Phase 3)
2. **Canvas 2D natif** — pas de WebGL, PixiJS, Fabric.js
3. **Thèmes > Options** — Judith clique 1 thème, tout s'applique
4. **Preview HQ** — frame courante avec tous les effets via Canvas
5. **LUTs reportées** — trop lent en Canvas 2D, attendre Worker
6. **Agent DA** — skill 3 couches pour la création/validation de thèmes
7. **Données terrain** — palettes et fonts validées par analyse de Reels performants
8. **Anti AI-look** — règles niche-spécifiques pour éviter la convergence

---

## Plan d'implémentation

### Phase 1 — Thèmes, typographie et sous-titres pro (Mois 1)

| ID | Prompt | Dépend de | Status |
|----|--------|-----------|--------|
| P1.1 | Fonts (15) + word-wrap Canvas | — | ⬜ À rédiger |
| P1.2 | Sous-titres pro (bold_outline, pill, karaoke_pro) | P1.1 | ⬜ À rédiger |
| P1.3 | Système de Thèmes UI (ThemeSelector) | P1.1, P1.2 | ⬜ À rédiger |
| P1.4 | Effets texte (outline, glow, pill) | P1.1 | ⬜ À rédiger |
| P1.5 | Filtres enrichis (10 presets CSS) | — | ⬜ À rédiger |

### Phase 2 — Qualité et animations (Mois 2)
P2.1 Export Worker, P2.2 Animations texte, P2.3 Preview HQ, P2.4 Audio ducking

### Phase 3 — Templates et contenu riche (Mois 3)
P3.1 Templates V1, P3.2 Auto-silence removal, P3.3 Stickers Lottie, P3.4 Transitions

### Phase 4 — Polish et avancé (Mois 4-6)
P4.1 LUTs, P4.2 Grain/vignette, P4.3 Animations avancées, P4.4 Templates V2, P4.5 Undo/redo

### Multi-clip (déféré, prêt à lancer)
M2 Timeline, M3 Interactions, M4 Export — prompts + reviews prêts dans le backlog.

---

## Structure des dossiers

```
project-docs/
  DIRECTION.md                  ← CE FICHIER (source de vérité)
  03_RESEARCH/                  ← 8 rapports de recherche
  02_ROADMAP/
    prompts_used/               ← Prompts ACTIFS (multi-clip M2-M4)
    _completed/                 ← Prompts terminés archivés

lib/data/
  designKnowledge.ts            ← Knowledge base design (fonts, palettes, WCAG, rules)
  videoThemes.ts                ← 8 thèmes vidéo prédéfinis

skills/directeur-artistique/
  SKILL.md                      ← Persona + workflow + règles
  references/                   ← Guides chargés à la demande
  scripts/                      ← Validation WCAG, critique, preview
  templates/                    ← Schema thème + grille critique
```
