# BACKLOG LATER
*Tout ce qui ne va pas dans V1 ou V2 — mis en réserve*

---

## Stats & Analytics (V2 — prioritaire)

### Résumé dans le Profil (cartes simples)
- Vues totales sur les Reels (Instagram Insights API)
- Trafic vers le site Wix depuis Instagram (UTM tracking)
- Constance : publications par semaine (sparkline 4 semaines)

### Page dédiée /stats
- Graphique vues par Reel (7 derniers Reels)
- Meilleure heure de publication (basé sur l'engagement réel)
- Trafic Wix depuis Instagram (UTM params dans les liens captions)
- Croissance followers (semaine/mois)

### Technique requis pour V2
- Token Meta long-lived (60 jours, renouvelable)
- GET /{media-id}/insights?metric=plays,reach,likes,comments
- GET /{ig-user-id}/insights?metric=follower_count,reach
- UTM params automatiques dans les liens Wix des captions générées

---

## Systèmes avancés (V3+)

Tout le travail du moteur de guidance V3/V4 est ici.
Brillant mais prématuré pour V1.

- Moteur d'assistance opérationnelle
- Mémoire comportementale (averagePublishGap, etc.)
- Attribution des actions (rappel → action)
- Profil de cadence adaptatif
- systemHealthState (OK/DEGRADED/UNRELIABLE)
- Escalade de rappels (J+3, J+7, J+14)
- no_action_needed state explicite
- preferredInteractionWindow

Référence : `SYSTEM_ASSISTANCE_ENGINE_V4.md` (dans l'ancien projet)

---

## Éditeur avancé

- Filtres WebGL (glfx-es6)
- Animations d'entrée/sortie des textes
- Stickers et emojis (Twemoji)
- Templates quick-start
- Export WebCodecs (10-50x plus rapide)
- Éditeur de sous-titres avancé
- Déplacement drag des sous-titres sur la preview

---

## Growth et analytics

- API Instagram Insights (vues, saves, reach)
- reuseScore (contenu à recycler)
- Tracking clics vers Wix
- Suggestions de CTA par objectif
- Classification des contenus par intention

---

## Multi-plateforme

- TikTok
- YouTube Shorts
- Facebook

---

## Features secondaires

- Export en format story (image statique)
- Génération de scripts ou plans de tournage
- Collaboration multi-utilisateurs
- Tendances et hashtags
- Onglet "Générer" musique IA (Mubert payant, chercher alternative gratuite)
