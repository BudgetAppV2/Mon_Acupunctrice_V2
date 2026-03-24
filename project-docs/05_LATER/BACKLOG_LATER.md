# BACKLOG LATER
*Tout ce qui ne va pas dans V2 (M08-M13) — mis en réserve pour V3+*

---

## Systèmes avancés (V3+)

Tout le travail du moteur de guidance V3/V4 est ici.
Brillant mais prématuré pour l'instant.

- **Moteur d'assistance opérationnelle** : Rappels intelligents, relances basées sur la cadence.
- **Mémoire comportementale** : Analyse des habitudes de Judith (averagePublishGap, etc.).
- **Attribution des actions** : Lien direct entre rappel reçu et action effectuée.
- **Profil de cadence adaptatif** : Ajuste les objectifs selon l'énergie réelle de Judith.
- **System Health State** : Diagnostic automatique des connexions API (OK/DEGRADED/UNRELIABLE).
- **Escalade de rappels** : J+3, J+7, J+14 pour les idées "chaudes".
- **Interaction Window** : Propose de publier quand l'audience est la plus active.

---

## Éditeur & Médias (V3+)

- **Filtres WebGL (glfx-es6)** : Pour des effets plus complexes en temps réel.
- **Stickers et emojis (Twemoji)** : Ajouter des éléments graphiques sur la vidéo.
- **Templates quick-start** : Structures de Reels pré-faites.
- **Musique IA** : Génération de pistes libres de droits personnalisées (ex: Mubert).
- **Éditeur de sous-titres avancé** : Correction manuelle facilitée, styles complexes par mot.
- **Drag & Drop** : Déplacement libre des textes et sous-titres sur la preview.

---

## Distribution & Plateformes (V3+)

- **TikTok** : API plus complexe nécessitant une validation entreprise lourde.
- **LinkedIn** : Contenu éducatif pour réseau professionnel santé (médecins, physios, naturopathes qui réfèrent). API restrictive, format vidéo différent (carré/paysage vs 9:16). Pertinent pour développer un réseau de référencement pro.
- **Threads** : Pour une distribution textuelle complémentaire.
- **Réutilisation de contenu** : Suggestion automatique de recycler un ancien Reel performant (reuseScore).
- **Sélection de caméra** : Sélecteur de source vidéo (caméra frontale, arrière, webcam USB-C externe) via `enumerateDevices()`. Permettrait de filmer des démonstrations d'acupuncture avec une caméra externe.
- **Captation multi-caméra** : Enregistrement simultané depuis plusieurs sources vidéo (ex: face caméra + plan d'ensemble) pour montage multi-angle ensuite. Nécessite `getUserMedia` sur plusieurs devices + synchronisation audio.
- **Collaboration** : Permettre à un monteur externe d'accéder au compte de Judith.
- **Stories avec Link Sticker cliquable (instagrapi)** : La lib Python `instagrapi` utilise l'API privée Instagram et supporte les link stickers dans les Stories — permettrait de publier des Stories avec un vrai lien cliquable vers Go Rendez-Vous sans que Judith ouvre Instagram. Risques : API non-officielle (peut casser), login par username/password (pas OAuth), risque de ban si usage détecté. Nécessite un micro-service Python séparé. À prototyper en isolation avant mise en production. Pertinent surtout pour les stories auto des séquences blogue (S04) — Judith n'aurait jamais besoin d'ouvrir l'app.
- **Intégration Canva API** : Connecter Canva au Hub pour générer des visuels de Stories plus élaborés à partir de templates Canva de Judith. Canva Connect API nécessite OAuth Canva + gestion des templates. Post-Phase Stratégie.

---

## Technique & UX

- **Offline partiel** : Pouvoir noter des idées sans connexion internet.
- **Rappels Email / WhatsApp** : En plus des notifications PWA.
- **Export en format Story** : Générer une image statique promotionnelle pour chaque Reel.
- **Génération de scripts** : Plan de tournage détaillé généré par l'IA avant le tournage.
