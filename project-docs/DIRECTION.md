# Direction — Éditeur Pro Mon Acupunctrice Hub

**Date :** 26 mars 2026
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

### Recherche complétée (6 rapports)
| Document | Contenu clé |
|----------|-------------|
| `EDITOR_PRO_RESEARCH.md` | Librairies, quick wins, 0 dépendances |
| `EDITOR_PRO_DEEP_RESEARCH.md` | 30 fonts, 22 animations, effets Canvas, LUTs |
| `EDITOR_ARCHITECTURE_RESEARCH.md` | Pipelines, SDKs, CapCut = WebAssembly+WebCodecs |
| `EDITOR_PRO_ARCHITECTURE.md` | Architecture finale révisée, plan 4 phases |
| `EDITOR_PRO_ARCHITECTURE_REVIEW.md` | Review Gemini : Thèmes > Options, preview HQ |
| `DESIGN_AGENT_RESEARCH.md` | Agent design 3 couches, anti AI-look, knowledge base |

### Décisions validées
1. **BUILD tout** — pas de SDK externe (sauf lottie-web Phase 3)
2. **Canvas 2D natif** — pas de WebGL, PixiJS, Fabric.js
3. **Thèmes > Options** — Judith clique 1 thème, tout s'applique
4. **Preview HQ** — frame courante avec tous les effets via Canvas
5. **LUTs reportées** — trop lent en Canvas 2D, attendre OffscreenCanvas Worker

---

## Direction

### Le concept central : VideoTheme

Un thème contrôle l'esthétique complète d'une vidéo en 1 tap :
- Police titre + police corps
- Style de sous-titres (karaoke_pro, pill, bold_outline)
- Filtre CSS
- Palette de couleurs (texte, accent, fond)
- Animation de texte par défaut
- Effets texte par défaut

Judith ne choisit pas 15 options individuelles — elle choisit "Minimal Chic" et tout est configuré.
Le mode "Avancé" reste accessible pour les personnalisations.

### Pipeline de création des thèmes (3 temps)

1. **Knowledge base** (`lib/data/designKnowledge.ts`) — règles de design,
   palettes validées, font pairings, safe zones, contrastes WCAG
2. **Agent directeur artistique** (skill Claude Code) — system prompt spécialisé
   santé/bien-être avec critique automatique sur 8 dimensions
3. **Thèmes générés et validés** — previews HTML/SVG pour validation visuelle

---

## Backlog actif

### Éditeur Pro — Phase 1 (en cours)
| ID | Prompt | Status |
|----|--------|--------|
| P1.1 | Fonts (15) + word-wrap Canvas | ⬜ À rédiger |
| P1.2 | Sous-titres pro (bold_outline, pill, karaoke_pro) | ⬜ À rédiger |
| P1.3 | Système de Thèmes (VideoTheme) | ⬜ À rédiger |
| P1.4 | Effets texte (outline, glow, pill_background) | ⬜ À rédiger |
| P1.5 | Filtres enrichis (10 presets CSS) | ⬜ À rédiger |

### Multi-clip (déféré, prompts + reviews prêts)
| ID | Prompt | Status |
|----|--------|--------|
| M2 | Timeline multi-clip + preview | 📋 Prêt + reviewé |
| M3 | Interactions (reorder, split, duplicate) | 📋 Prêt + reviewé |
| M4 | Export multi-clip | 📋 Prêt + reviewé |

### Éditeur Pro — Phases 2-4 (futur)
Voir `EDITOR_PRO_ARCHITECTURE.md` section 9.

---

## Structure des dossiers (nettoyée)

```
project-docs/
  02_ROADMAP/
    MULTICLIP_PLAN.md           ← Plan multi-clip M1-M4
    prompts_used/               ← Prompts ACTIFS seulement
      multiclip_M2_timeline/    ← Backlog prêt
      multiclip_M3_interactions/
      multiclip_M4_export/
    analysis/                   ← Reviews actives
    _completed/                 ← Archive des prompts terminés
  03_RESEARCH/
    EDITOR_PRO_ARCHITECTURE.md  ← Architecture finale (source de vérité)
    EDITOR_PRO_ARCHITECTURE_REVIEW.md ← Review Gemini
    DESIGN_AGENT_RESEARCH.md    ← Agent design graphique
    EDITOR_PRO_RESEARCH.md      ← Recherche initiale
    EDITOR_PRO_DEEP_RESEARCH.md ← Recherche approfondie
    EDITOR_ARCHITECTURE_RESEARCH.md ← Recherche architecture
    _prompts_executed/          ← Prompts de recherche archivés
  04_DEV_SYSTEM/
    analysis/                   ← Reviews multi-clip
  _archive/                     ← Handoffs obsolètes
```
