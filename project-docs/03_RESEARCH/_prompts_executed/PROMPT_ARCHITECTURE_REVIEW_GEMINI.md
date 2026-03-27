# Review stratégique — Architecture éditeur pro

## Ta mission
Tu es un directeur technique senior et stratège produit. Tu as devant toi le plan
d'architecture d'un éditeur vidéo pro pour une PWA web (Safari iOS).

Ton rôle : challenger les décisions, identifier les pièges, proposer des alternatives,
et surtout t'assurer que l'architecture va VRAIMENT produire du contenu de qualité pro
pour une acupunctrice qui crée des Reels Instagram.

## Ce que tu dois lire

Lis ces fichiers dans cet ordre :
1. `CLAUDE.md` — contexte technique du projet
2. `project-docs/03_RESEARCH/EDITOR_PRO_RESEARCH.md` — recherche initiale (librairies, quick wins)
3. `project-docs/03_RESEARCH/EDITOR_PRO_DEEP_RESEARCH.md` — recherche approfondie (effets, fonts, Canvas)
4. `project-docs/03_RESEARCH/EDITOR_ARCHITECTURE_RESEARCH.md` — recherche architecture (pipelines, SDKs)
5. `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE.md` — document d'architecture à reviewer

Puis lis le code actuel :
6. `lib/utils/exportWebCodecs.ts` — pipeline d'export actuel
7. `lib/utils/drawOverlays.ts` — rendu texte Canvas actuel
8. `lib/utils/drawSubtitles.ts` — rendu sous-titres Canvas actuel
9. `lib/utils/filters.ts` — filtres actuels
10. `lib/store/useEditorStore.ts` — store Zustand
11. `components/features/editor/VideoPreview.tsx` — preview vidéo
12. `components/features/editor/EditorLayout.tsx` — layout éditeur
13. `components/features/editor/panels/TextPanel.tsx` — panel texte
14. `components/features/editor/panels/FilterPanel.tsx` — panel filtres

## Questions à répondre

### Architecture fondamentale
- Le pipeline "preview CSS/DOM + export Canvas 2D" est-il le bon choix?
  Ou devrait-on avoir un Canvas unifié pour preview ET export?
- L'effect stack chainable (filter → LUT → grain → vignette) est-il trop rigide?
  Faut-il un graphe de noeuds plus flexible?
- Le modèle de composition plat (store Zustand) va-t-il tenir à l'échelle
  avec 30 fonts × 8 effets × 11 animations × 10 styles sous-titres?
- Quel est le risque que les effets Canvas 2D (getImageData pixel par pixel)
  soient trop lents sur iPhone pour des vidéos de 60-90s?

### Priorisation
- Est-ce que les 28 prompts sur 4 phases sont dans le bon ordre?
- Qu'est-ce qui va avoir le plus d'impact VISUEL pour le contenu de Judith
  dès la Phase 1? Les fonts? Les effets texte? Les sous-titres?
- Y a-t-il des dépendances cachées entre les phases?
- Devrait-on fusionner certains prompts ou en séparer d'autres?

### Risques techniques
- Canvas 2D getImageData sur chaque frame d'export : performance sur iPhone?
  Calcule le temps pour une vidéo 1080×1920 de 60s à 30fps.
- La sauvegarde des 30 fonts Google — taille du bundle? Latence de chargement?
- Les LUTs .cube parsées pixel par pixel — viable pour 1080×1920?
- Lottie-web Canvas renderer + goToAndStop : est-ce que ça fonctionne
  réellement frame par frame pour un export seek-based?

### Ce qui manque
- Undo/redo : devrait-il être en Phase 1 plutôt que Phase 4?
- Presets "one-click" : une fonctionnalité où Judith applique un style
  complet (font + filtre + sous-titre + couleurs) en 1 tap — est-ce couvert?
- Export preview : Judith peut-elle voir à quoi ressemblera la vidéo finale
  AVANT d'attendre le long export?
- Responsive text sizing : les overlays texte sont-ils lisibles sur tous
  les ratios d'écran? Comment on gère le scaling?

### Approche alternative
- Plutôt que de builder 8 effets texte + 11 animations + 10 styles sous-titres
  séparément, devrait-on builder un système de "style presets" unifié qui
  combine tout? (font + effet + animation + sous-titre + filtre = 1 preset)
- Est-ce que ça simplifierait l'UX pour Judith?

### Comparaison avec la concurrence
- Qu'est-ce que CapCut/InShot font que notre architecture ne pourra PAS faire?
- Quels compromis sont acceptables pour une PWA vs une app native?
- Y a-t-il des features "wow" qui seraient faciles à implémenter mais
  qu'on n'a pas considérées?

## Format du rapport

Génère `project-docs/03_RESEARCH/EDITOR_PRO_ARCHITECTURE_REVIEW.md` avec :

1. **Ce qui est solide** dans l'architecture
2. **Problèmes critiques** à corriger avant de coder
3. **Risques techniques** avec estimations de performance
4. **Réordonnancement proposé** des phases/prompts
5. **Features manquantes** à ajouter
6. **Architecture révisée** si nécessaire
7. **Premier milestone concret** — exactement quoi coder en premier pour
   que Judith voie un changement radical dans son contenu

## Contraintes
- NE PAS modifier de code — c'est une review seulement
- Être spécifique et actionnable, pas générique
- Penser en tant qu'utilisatrice (Judith) pas en tant que développeur
- Le rapport doit être concis mais complet

## Référence
- `CLAUDE.md`
