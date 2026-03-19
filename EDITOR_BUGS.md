# EDITOR_BUGS.md
# Bugs identifiés post-M04 — à corriger

## Bug 1 — Timeline trop large
**Symptôme :** La timeline dépasse la largeur de l'écran, le drag fait défiler au lieu de déplacer le playhead
**Fix voulu :** Timeline 100% visible dans l'écran par défaut, pas de scroll horizontal
**Fichier :** components/features/editor/timeline/Timeline.tsx
**Solution :** Calculer la largeur des tracks en fonction de la durée pour tenir dans la largeur disponible (100vw). Pas de scroll pour l'instant.

## Bug 2 — Pas de countdown ni preview pendant l'enregistrement webcam
**Symptôme :** Quand on clique "Filmer", pas de préview de la caméra ni de countdown avant l'enregistrement
**Fix voulu :** 
- Afficher le flux webcam en preview dès que la caméra est activée
- Countdown 3-2-1 avant de démarrer l'enregistrement
- Bouton Stop visible pendant l'enregistrement
**Fichier :** components/features/editor/ImportModal.tsx + lib/hooks/useMediaRecorder.ts
