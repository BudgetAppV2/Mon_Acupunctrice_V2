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

## BUGS RESTANTS (20 mars soir)

### Image de couverture ne charge pas sur Safari iOS
Le CoverPicker charge la vidéo via proxy et capture une frame avec canvas.drawImage.
Safari iOS refuse de décoder les vidéos non visibles même avec opacity-0.
Approche possible : générer la miniature côté serveur (API route avec ffmpeg)
ou utiliser la thumbnailUrl du store (déjà capturée par VideoPreview).

### Aperçus vidéo absents dans le bottom sheet détail
Le `<video preload="metadata">` dans IdeaDetailSheet ne montre pas la première frame.
Possible régression. Vérifier que le champ videoUrl est bien passé.

## Bugs corrigés (20 mars)
- Preview webcam (iPhone + desktop)
- Timeline invisible
- Export WebCodecs Safari (duration, timestamp, bitrate)
- Safe area PWA (header, webcam, bottom sheet)
- Image de couverture sur desktop/Chrome
- Slider de frame (proxy Range requests)
- Login PWA
- COOP/COEP limité à l'éditeur
- Bouton Modifier charge la vidéo existante
- M09 OAuth Instagram
- M10 OAuth Facebook + publication
