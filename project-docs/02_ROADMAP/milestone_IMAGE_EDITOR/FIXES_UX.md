# Fixes UX éditeur d'images — Post Phase 2

## FIX 1 — Bottom sheet trop envahissant sur mobile
- Réduire la hauteur par défaut du bottom sheet (40dvh au lieu de 60dvh)
- Ajouter un bouton zoom/slider pour zoomer le canvas quand le bottom sheet est ouvert
- Les onglets en bottom bar doivent être des icônes SEULEMENT (pas de labels)
- Le bottom sheet ne s'ouvre que quand nécessaire (clic sur un onglet)
- Pouvoir scroller dans le bottom sheet
- Option de replier le bottom sheet en mode mini (juste le header visible)

## FIX 2 — Cadre de sélection plus visible
- Cadre de couleur contrastée (turquoise #7EBEC5 ou bleu vif) autour des objets sélectionnés
- Épaisseur du cadre plus grande (2-3px au lieu de 1px)
- Bouton de rotation visible sous l'objet (pas juste le curseur)
- Handles de redimensionnement plus gros et colorés
- Configurer via Fabric.js : canvas.selectionColor, canvas.selectionBorderColor, 
  obj.borderColor, obj.cornerColor, obj.cornerSize, obj.rotatingPointOffset

## FIX 3 — Formes organiques et bibliothèques riches
- Pas juste des icônes linéaires — besoin de formes organiques, blobs, vagues, feuilles
- Explorer les bibliothèques :
  - Blobmaker / blob SVG generators
  - Haikei.app shapes (waves, blobs, stacked waves)
  - SVG repo collections (nature, organic)
  - Shapes.so (formes géométriques modernes)
- Ajouter une catégorie "Formes organiques" dans le panel éléments
- SVGs inline pré-faits : blob turquoise, vague, feuille stylisée, goutte d'eau, cercle organique
