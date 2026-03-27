# Plan de match — Éditeur Pro Mon Acupunctrice Hub

## Pour évaluation par Codex / reviewer externe

**Projet :** Mon Acupunctrice Hub V2 — PWA d'édition et publication vidéo pour Judith, acupunctrice à Montréal
**Stack :** Next.js 15 + Zustand + Tailwind + Firebase + WebCodecs (Safari iOS PWA)
**Repo :** github.com/BudgetAppV2/Mon_Acupunctrice_V2
**Branche :** `feature/editor-pro`
**Date :** 27 mars 2026

---

## 1. Où on en est

### App fonctionnelle en production
- Éditeur vidéo in-browser : import/enregistrement webcam, trim, filtres, texte, sous-titres Whisper, musique Jamendo
- Export WebCodecs seek-based (H.264 High Profile 8 Mbps, 1080×1920, 30fps)
- Publication multi-plateforme : Instagram Reels, Facebook Reels, YouTube Shorts
- Stories Instagram via Web Share API (share sheet iOS native)
- Captions IA multi-plateformes (3 captions IG/FB/YT générées depuis la transcription)
- Store Zustand multi-clip (M1 livré — clips[], syncLegacyFields, rétrocompatible)
- Persistance editorData + vidéo source dans Firestore/Storage
- Séquences blog automatiques (J+0 story → J+1 reel → J+3 reel → J+7 story)

### Multi-clip M2-M4 (déféré, prêt)
- Prompts + reviews prêts dans le backlog
- Judith n'en a pas besoin maintenant — reporté

### Contraintes Safari iOS
- FFmpeg.wasm ne charge pas → tout via Web Audio API + WebCodecs natif
- Canvas 2D pour le rendering (pas de WebGL nécessaire)
- OffscreenCanvas disponible depuis Safari iOS 16.5+

---

## 2. Objectif

Transformer l'éditeur de base en un outil de qualité professionnelle (CapCut-level)
pour que le contenu de Judith accroche davantage sur les réseaux sociaux.

---

## 3. Recherche effectuée (8 rapports)

| # | Rapport | Conclusion clé |
|---|---------|----------------|
| 1 | Librairies et quick wins | Canvas 2D natif suffit, 0 dépendances nécessaires |
| 2 | Effets visuels approfondis | 30 fonts, 22 animations, 7 effets texte Canvas, LUTs |
| 3 | Architecture éditeurs pro | CapCut = WebAssembly+WebCodecs, notre approche est alignée |
| 4 | Review Gemini CLI | Thèmes 1-clic > options individuelles, preview HQ nécessaire |
| 5 | Analyse terrain Reels performants | 10 règles design validées par données, pattern hooks viral |
| 6 | Tendances visuelles 2026 | "Imperfect by Design", serif revival, Pantone Cloud Dancer |
| 7 | Agent design graphique | Architecture 3 couches, anti "AI look", critique 8 dimensions |
| 8 | Architecture détaillée | Pipeline preview DOM + export Canvas 2D, effect stack chainable |

---

## 4. Décisions architecturales

| Décision | Choix | Raison |
|----------|-------|--------|
| Rendering | Canvas 2D natif | Suffisant pour 90% des effets, compatible Safari iOS |
| SDK externe | Aucun (sauf lottie-web Phase 3) | 1 utilisatrice, besoins spécifiques |
| UX | Thèmes 1-clic > options individuelles | Review Gemini : éviter fatigue cognitive |
| Preview | DOM/CSS temps réel + Canvas single-frame | Preview HQ sur pause sans export complet |
| LUTs | Reportées Phase 4 | getImageData ~50ms/frame, trop lent sans Worker |
| Server-side | Non nécessaire | Reels 30-90s, WebCodecs suffisant côté client |
| Presets | Agent DA spécialisé | Validation WCAG programmatique, anti AI-look |

---

## 5. Ce qui a été construit (branche feature/editor-pro)

### Knowledge base de design (`lib/data/designKnowledge.ts`)
- 15 Google Fonts en 5 catégories (Impact, Élégant, Moderne, Cursif, Fun)
- 7 palettes de couleurs validées WCAG (Sage Naturel, Terre & Chaleur, Océan Calme, Minimal Pro, Sunset Healing, Dark Clinic, Pantone 2026)
- Calcul de contraste WCAG programmatique
- Safe zones exactes Instagram 2026 (108px top, 320px bottom, 60px left, 120px right)
- Fonction `wrapText()` pour Canvas 2D (retour à la ligne auto)
- 10 règles de design validées par données terrain
- 6 font pairings validés (titre + corps)

### 8 thèmes vidéo prédéfinis (`lib/data/videoThemes.ts`)
Chaque thème contrôle : font titre + font sous-titres + style sous-titres + filtre + palette + animation + effet texte

| Thème | Style | Font titre | Font corps | Filtre |
|-------|-------|-----------|-----------|--------|
| Sage & Zen | Signature Judith | DM Serif Display | Poppins | warm |
| Minimal Chic | Épuré, enseigner | Montserrat | Inter | normal |
| Terre & Chaleur | Authentique, connecter | Playfair Display | Lora | warm |
| Bold Énergie | Impact, hooks | Bebas Neue | Inter | high_contrast |
| Océan Doux | Calme, aider/inspirer | Dancing Script | Nunito | soft |
| Pantone 2026 | Tendance 2026 | DM Serif Display | Inter | normal |
| Raw Authentique | Zéro filtre, brut | Anton | Inter | normal |
| Dark Clinic | Expertise médicale | Montserrat | Poppins | dramatic |

### Agent Directeur Artistique (`skills/directeur-artistique/`)
Skill Claude Code en 3 couches avec validation programmatique :

```
Couche 1 — SKILL.md
  Persona DA senior santé/bien-être
  10 règles non-négociables (stroke 2px, font 45px min, tons terreux, etc.)
  Workflow 5 étapes : charger context → générer → valider WCAG → critiquer 8 dim → preview

Couche 2 — References (chargées à la demande)
  design-rules.md, typography-guide.md, color-theory.md

Couche 3 — Scripts exécutables
  validate-contrast.ts  → Vérifie WCAG 4.5:1 programmatiquement
  critique-preset.ts    → Score 8 dimensions (seuil 3.5/5)
  generate-preview.ts   → HTML preview Reel simulé
```

Déjà utilisé : validation des 7 palettes → trouvé 2 palettes cassées (Minimal Pro, Pantone 2026), corrigées.

---

## 6. Plan d'implémentation — 4 phases, ~26 prompts

### Phase 1 — Thèmes, typographie et sous-titres pro (Mois 1, ~7 prompts)

| ID | Prompt | Scope | Dépendances |
|----|--------|-------|-------------|
| P1.1 | Fonts (15) + word-wrap Canvas | Chargement Google Fonts, sélecteur catégorisé TextPanel, `wrapText()` dans drawOverlays | — |
| P1.2 | Sous-titres pro | 3 nouveaux styles (bold_outline, pill, karaoke_pro), algorithme groupement amélioré | P1.1 |
| P1.3 | Système de Thèmes UI | ThemeSelector widget, `activeTheme` dans store, application 1-clic | P1.1, P1.2 |
| P1.4 | Effets texte | 3 effets (outline, glow, pill_background) dans drawOverlays Canvas | P1.1 |
| P1.5 | Filtres enrichis | 10 presets CSS (vs 5 actuels), chaque thème a un filtre par défaut | — |

**Impact attendu :** Les vidéos de Judith passent de "amateur" à "pro" immédiatement.

### Phase 2 — Qualité et animations (Mois 2, ~6 prompts)

| ID | Prompt | Scope |
|----|--------|-------|
| P2.1 | Export Worker OffscreenCanvas | Export en arrière-plan, UI réactive |
| P2.2 | Animations texte (5) | fade_in, typewriter, scale_pop, slide_up, bounce |
| P2.3 | Preview haute qualité | Frame courante avec tous effets via Canvas sur pause |
| P2.4 | Audio ducking | Auto-baisse musique quand voix détectée |

### Phase 3 — Templates et contenu riche (Mois 3, ~9 prompts)

| ID | Prompt | Scope |
|----|--------|-------|
| P3.1 | Templates V1 | Schema JSON, 4 templates (1/style), application template = thème + sections |
| P3.2 | Auto-silence removal | Scanner audio, couper silences > 0.8s, rythme pro |
| P3.3 | Stickers Lottie | lottie-web (250KB), bibliothèque santé, rendu frame-by-frame |
| P3.4 | Transitions | 6 transitions Canvas 2D entre clips (nécessite multi-clip M2) |

### Phase 4 — Polish et avancé (Mois 4-6, ~4 prompts)

| ID | Prompt | Scope |
|----|--------|-------|
| P4.1 | LUTs cinématiques | Parser .cube, 5 LUTs pré-packagées (après Worker P2.1) |
| P4.2 | Grain film + vignette | Canvas 2D overlay effects |
| P4.3 | Templates V2 | 12 templates complets, placeholders éditables |
| P4.4 | Undo/redo | Zustand temporal middleware |

---

## 7. Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| LUTs getImageData lent (~50ms/frame) | Export 2-3x plus long | Reporter après OffscreenCanvas Worker (Phase 4) |
| Lottie-web Canvas renderer compatibility | Stickers pas rendus dans l'export | Tester goToAndStop() sur Safari iOS avant Phase 3 |
| Font loading latence | Première frame sans la bonne font | Précharger les fonts du thème actif au chargement de l'éditeur |
| Trop de thèmes → choix paralysant | Judith n'utilise pas les thèmes | Commencer avec 4-5 thèmes, ajouter progressivement |
| Preview HQ vs export divergent | Judith déçue du résultat final | Le preview Canvas utilise les mêmes fonctions que l'export |

---

## 8. Questions ouvertes

1. L'ordre Phase 1 → Phase 2 est-il optimal ou devrait-on intercaler certains prompts?
2. Le concept de Thèmes 1-clic est-il suffisant ou faut-il un mode "guided creation" (wizard)?
3. Faut-il un undo/redo dès Phase 1 plutôt que Phase 4?
4. Les 8 thèmes actuels sont-ils trop nombreux pour commencer? Devrait-on en garder 4-5?
5. L'agent DA est-il over-engineered pour le besoin actuel (1 utilisatrice)?
6. L'auto-silence removal (Phase 3) devrait-il être priorisé plus tôt vu son impact?
7. Le pipeline preview DOM/CSS + export Canvas 2D est-il la bonne approche ou devrait-on unifier?
8. Faut-il une phase de test/validation avec Judith entre chaque phase?

---

## 9. Structure des fichiers clés

```
Branche feature/editor-pro:

lib/data/
  designKnowledge.ts          ← Knowledge base (fonts, palettes, WCAG, rules, wrapText)
  videoThemes.ts              ← 8 thèmes prédéfinis

skills/directeur-artistique/
  SKILL.md                    ← Persona DA + workflow + règles
  references/                 ← design-rules, typography, color-theory
  scripts/                    ← validate-contrast, critique-preset, generate-preview
  templates/                  ← theme-template.json, critique-template.md

project-docs/
  DIRECTION.md                ← Document de direction (source de vérité)
  03_RESEARCH/                ← 8 rapports de recherche
```

---

## 10. Métriques de succès

- Judith utilise au moins 1 thème régulièrement
- Le temps d'édition ne dépasse pas 10 minutes par Reel
- La qualité visuelle des Reels est comparable aux créateurs pro de sa niche
- L'export reste sous 2 minutes pour une vidéo de 60s
- Judith publie ≥ 3x/semaine avec l'outil
