# BUGS POST-DEPLOY — À corriger
*Rapportés le 19 mars 2026 après déploiement Vercel*

---

## Contexte
L'app est déployée sur `mon-acupunctrice-v2.vercel.app`.
Login, idées, calendrier, profil, Instagram OAuth fonctionnent.
Les bugs ci-dessous sont spécifiques à l'éditeur vidéo en production.

---

## Bug 1 — Preview vidéo basse résolution sur iPhone
**Où :** Éditeur vidéo, iPhone Safari
**Quoi :** Le preview de la vidéo est en basse résolution sur iPhone.
Sur desktop en simulation iPhone (DevTools), la résolution est correcte.
**Cause probable :** Le canvas/video element ne tient pas compte du devicePixelRatio
sur les écrans Retina. Ou le proxy vidéo compresse trop.

## Bug 2 — Preview vidéo invisible après enregistrement sur iPhone
**Où :** Éditeur vidéo, iPhone Safari, après avoir filmé avec la webcam
**Quoi :** Après avoir filmé et sauvegardé, le preview vidéo ne s'affiche pas sur iPhone.
Fonctionne sur desktop.
**Cause probable :** Format vidéo WebM (webcam) vs MP4, codec non supporté par Safari iOS,
ou problème avec le proxy vidéo et les headers CORP/COEP.

## Bug 3 — Timeline invisible
**Où :** Éditeur vidéo, iPhone ET desktop
**Quoi :** La timeline multi-track n'est pas visible.
**Cause probable :** La timeline a peut-être une hauteur calculée de 0 si aucune track
n'est active, ou un problème CSS en production.

## Bug 4 — Miniatures de filtres sans preview sur iPhone
**Où :** Éditeur vidéo, onglet Filtres, iPhone Safari
**Quoi :** Les miniatures de filtres ne montrent pas le preview de la vidéo avec le filtre appliqué.
Fonctionne sur desktop.
**Cause probable :** Les miniatures sont capturées depuis un canvas de la vidéo DOM.
Sur iPhone, le canvas `drawImage` depuis une `<video>` cross-origin peut être bloqué
par les headers COEP, ou la vidéo n'est pas encore chargée au moment de la capture.

---

## Priorité
Ces bugs sont tous dans l'éditeur. L'éditeur est le coeur du produit pour Judith.
À corriger avant de passer aux milestones M10+.

## Approche recommandée
1. Ouvrir l'éditeur en prod avec DevTools mobile (375px)
2. Identifier le problème exact (console errors, network, rendering)
3. Fixer un bug à la fois
4. Tester sur iPhone réel après chaque fix
