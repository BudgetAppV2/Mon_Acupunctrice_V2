# Passation — Éditeur Vidéo Pro : Collaboration ChatGPT (DA) + Claude Code (Dev)

## Contexte pour la prochaine instance

Mon Acupunctrice Hub V2 est une PWA (Next.js 15, Firebase, Vercel) pour Judith,
acupunctrice à Montréal. Le Hub permet de créer des Reels vidéo et les publier
automatiquement sur Instagram, Facebook et YouTube.

Le pipeline technique est TERMINÉ et fonctionne :
- Export vidéo : Mediabunny CanvasSource (vidéo) + AudioBufferSource + polyfill AAC WASM (audio)
- Fonctionne sur Safari iOS (iPhone 12 de Judith)
- Publication automatique via cron Vercel sur 3 plateformes
- Résolution adaptative, Display P3, 12 Mbps

## Le problème à résoudre

L'éditeur produit des vidéos techniquement correctes mais **visuellement plates**.
Quand on compare avec un Reel publié directement depuis Instagram, le résultat du Hub
manque de polish : effets texte basiques, pas de templates, pas d'animations fluides,
couleurs sans personnalité. Claude Code est excellent pour coder mais n'a pas l'œil
d'un graphiste.

## Ce qui existe déjà (branche feature/editor-pro)

### À GARDER — L'agent Directeur Artistique
Un skill Claude Code (`skills/directeur-artistique/`) avec :
- Persona DA senior spécialisé vidéo santé/bien-être
- 10 règles non-négociables (stroke 2px, font min 45px, WCAG 4.5:1, tons terreux, etc.)
- Scripts de validation : contraste WCAG, critique 8 dimensions, preview HTML
- Knowledge base : 15 fonts Google validées, 7 palettes WCAG, safe zones 9:16
- 8 thèmes prédéfinis (Sage Zen, Minimal Chic, Terre & Chaleur, Bold Énergie, etc.)

### À JETER — Le rendering Canvas 2D fait maison
Les implémentations d'effets texte, filtres, animations via Canvas 2D natif sont
trop limitées pour un look professionnel. Il faut des librairies spécialisées.

### Les 8 rapports de recherche (`project-docs/03_RESEARCH/`)
Analyses de CapCut, tendances 2026, librairies JS, architecture pipeline.
Utiles comme contexte mais les conclusions sont à revoir.

## Le workflow proposé : ChatGPT (studio créatif) + Claude Code (assemblage)

### Rôles
- **ChatGPT** = Directeur artistique / Studio créatif
  - Génère des moodboards, templates visuels, variations de style
  - Propose des compositions, palettes, typographies avec un œil de graphiste
  - Produit des assets (textures, overlays, backgrounds) via DALL-E
  - Évalue visuellement les résultats et propose des ajustements

- **Claude Code** = Développeur / Studio d'assemblage
  - Implémente les templates en code (Canvas, librairies graphiques)
  - Intègre les assets dans la PWA
  - Gère le pipeline d'export Mediabunny
  - Valide techniquement (WCAG, performance, compatibilité Safari iOS)

### Contrat de transfert entre les deux
Chaque asset ou directive visuelle de ChatGPT doit inclure :
- `asset_name` — identifiant unique
- `screen` — où ça va dans l'app (editor, template_selector, preview)
- `purpose` — rôle visuel (titre hook, sous-titre, background, overlay)
- `style` — description du style (ex: "serif bold blanc sur fond semi-transparent sage")
- `palette` — couleurs hex exactes
- `format` — PNG transparent, SVG, CSS values, ou description Canvas
- `notes_for_claude` — instructions d'intégration technique

### Pipeline en 5 étapes
1. **Brief créatif** — Benoit définit le besoin (ex: "template Reel pour contenu Fertilité")
2. **Production ChatGPT** — génère les visuels, compositions, assets
3. **Pack d'intégration** — assets organisés avec le contrat de transfert
4. **Intégration Claude Code** — implémente dans le code (composants, thèmes, export)
5. **Boucle de révision** — Claude rend un preview, ChatGPT ajuste si nécessaire

## Pistes de librairies à explorer

### Pour le rendering vidéo (remplacer Canvas 2D natif)
- **Remotion** — framework React pour la vidéo, templates composables
- **Motion Canvas** — animations programmatiques avec preview visuel
- **Konva.js** — canvas structuré avec layers, groupes, animations
- **PixiJS** — rendering WebGL 2D haute performance
- **Fabric.js** — canvas avec objets manipulables

### Pour les animations texte
- **GSAP** — animations JS professionnelles, timeline
- **Lottie/Rive** — animations vectorielles pré-créées
- **Anime.js** — animations légères et fluides

### Pour les templates/presets
- **Canva API** — templates professionnels comme base d'inspiration
- **CapCut patterns** — analyser les presets populaires et les reproduire

### Contrainte critique
Tout doit fonctionner dans le navigateur (Safari iOS + Chrome desktop).
Pas de dépendance serveur pour le rendering. L'export passe par Mediabunny
CanvasSource — donc le résultat final doit être dessinable sur un Canvas.

## Architecture technique actuelle

```
Fichier source (iPhone) 
  → Mediabunny Input (demux, metadata)
  → Canvas 2D (drawImage + overlays + subtitles + filtres)
  → Mediabunny CanvasSource (encode H.264)
  → Mediabunny AudioBufferSource + AAC polyfill WASM (encode audio)
  → Mediabunny Output (mux MP4)
  → Firebase Storage (upload)
  → Cron Vercel → Instagram + Facebook + YouTube
```

## Fichiers clés
- `lib/utils/exportWebCodecs.ts` — pipeline d'export complet
- `lib/data/designKnowledge.ts` — knowledge base design (fonts, palettes, règles)
- `lib/data/videoThemes.ts` — 8 thèmes prédéfinis
- `skills/directeur-artistique/SKILL.md` — agent DA avec règles et validation
- `project-docs/DIRECTION.md` — vision et plan (branche feature/editor-pro)
- `project-docs/03_RESEARCH/` — 8 rapports de recherche

## Question ouverte pour la prochaine session
Comment structurer la collaboration ChatGPT + Claude Code pour produire des
templates vidéo visuellement professionnels, tout en gardant le pipeline
Mediabunny CanvasSource comme moteur d'export? Quelle librairie graphique
adopter pour remplacer le Canvas 2D natif?
