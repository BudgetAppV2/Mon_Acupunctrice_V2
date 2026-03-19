# PRD V2 — Product Requirements Document
*Version 2.0 — Mars 2026*

---

## Utilisatrice principale

**Judith** — acupunctrice solo, Montréal
- Crée du contenu Instagram 3x/semaine
- Filme en batch (probablement le mercredi)
- Utilise son iPhone au quotidien
- N'est pas tech — l'app doit être intuitive
- Objectif : attirer des clients via Instagram → site Wix

---

## Problème à résoudre

Judith a des idées. Elle sait filmer. Mais entre l'idée et la publication,
il y a trop d'outils différents, trop d'étapes, trop de friction.
Elle utilise son téléphone, CapCut, Instagram, Notes — tout séparé.
Résultat : elle publie irrégulièrement ou s'épuise.

**La solution : un hub unique, mobile first, qui couvre tout
de l'idée à la publication avec un éditeur vraiment pro.**

---

## User Stories

### Epic 1 — Idéation

**US-01** En tant que Judith, je veux capturer une idée de contenu
en moins de 30 secondes depuis mon iPhone, pour ne pas perdre
l'inspiration quand elle vient.

**US-02** En tant que Judith, je veux voir toutes mes idées organisées
par statut (idée → planifié → filmé → monté → publié), pour savoir
exactement où j'en suis dans mon pipeline.

**US-03** En tant que Judith, je veux filtrer mes idées par catégorie
(fertilité, grossesse, bien-être, MTC), pour préparer mes sessions
thématiques.

**US-04** En tant que Judith, je veux voir les idées "prêtes à filmer"
d'un seul coup d'œil lors de ma session du mercredi, pour ne pas
perdre de temps à chercher quoi faire.

### Epic 2 — Production (Éditeur)

**US-05** En tant que Judith, je veux importer une vidéo depuis
mon iPhone ou filmer directement dans l'app, pour commencer
à monter immédiatement.

**US-06** En tant que Judith, je veux trimmer ma vidéo avec
un slider intuitif, pour garder seulement le meilleur moment.

**US-07** En tant que Judith, je veux voir une timeline multi-track
scrollable (vidéo, audio, texte, sous-titres), pouvoir faire défiler
horizontalement pour naviguer dans le temps, et déplacer les éléments
sur les tracks, pour comprendre et contrôler la structure de ma vidéo
visuellement — comme dans CapCut.

**US-07b** En tant que Judith, je veux un bouton ▶/⏸ toujours visible
dans l'éditeur, pour démarrer et arrêter la lecture à tout moment
sans chercher le contrôle.

**US-07c** En tant que Judith, je veux pouvoir importer une image
depuis mon iPhone et la placer comme overlay ou arrière-plan dans
ma vidéo, pour enrichir mon contenu avec des visuels (logo, photo,
capture d'écran).

**US-11b** En tant que Judith, je veux trimmer ma piste audio
indépendamment de la vidéo, et ajouter un fade-in et fade-out
sur la musique, pour des transitions sonores professionnelles
sans coupure abrupte.

**US-08** En tant que Judith, je veux appliquer un filtre vidéo
en 1 tap (Lumineux, Chaud, Vintage...), pour que mes vidéos
aient un style cohérent et professionnel.

**US-09** En tant que Judith, je veux ajouter du texte avec des
polices graphiques (Bebas Neue, Montserrat, Playfair...) et des
animations (slide-up, fade, bounce), pour que mes textes overlay
ressemblent à du vrai contenu de creator pro.

**US-10** En tant que Judith, je veux générer des sous-titres
automatiquement en français québécois, pour que mon contenu
soit accessible et boost l'engagement.

**US-11** En tant que Judith, je veux choisir une musique de fond
depuis une bibliothèque de musique libre de droits, pour ne jamais
avoir de problème de copyright sur Instagram.

**US-12** En tant que Judith, je veux exporter ma vidéo en MP4
vertical (9:16) rapidement, pour pouvoir la publier sur Instagram Reels.

**US-13** En tant que Judith, je veux que ma vidéo soit sauvegardée
automatiquement dans le hub après l'export, pour ne jamais perdre
mon travail.

### Epic 3 — Planification (Calendrier)

**US-14** En tant que Judith, je veux voir un calendrier mensuel
avec mes contenus planifiés et leur statut coloré, pour avoir
une vue d'ensemble de ma stratégie.

**US-15** En tant que Judith, je veux cliquer sur une date pour
assigner un contenu "prêt" à cette date de publication, pour
planifier ma semaine en quelques taps.

**US-16** En tant que Judith, je veux cliquer sur un item du calendrier
pour voir son détail (titre, statut, plateforme, caption, preview)
et accéder à l'éditeur pour modifier, pour tout gérer depuis
un seul endroit.

**US-17** En tant que Judith, je veux voir clairement les "trous"
dans mon calendrier (jours sans publication planifiée), pour
identifier où je dois prioriser.

### Epic 4 — Publication

**US-18** En tant que Judith, je veux publier sur Instagram en 1 tap
depuis l'éditeur ou le calendrier, pour ne pas avoir à changer d'app.

**US-19** En tant que Judith, je veux que la caption soit générée
automatiquement en français québécois et que je puisse la modifier
avant publication, pour gagner du temps sans perdre ma voix.

**US-20** En tant que Judith, je veux planifier une publication
à une heure précise et que l'app publie automatiquement sans
que je sois là, pour publier aux meilleures heures même si
je suis avec un patient.

**US-21** En tant que Judith, je veux choisir l'image de couverture
de mon Reel avant de publier (frame de la vidéo ou image custom),
pour que ma couverture soit attrayante et représente bien le contenu.

**US-22** En tant que Judith, je veux voir l'historique de mes
publications avec leur date et statut, pour tracker ma constance.

---

## Features détaillées par pilier

### Pilier 1 — Banque d'idées

**F1.1 — Création rapide**
- Champ titre (obligatoire)
- Catégorie (Fertilité / Grossesse / Bien-être / MTC / Autre)
- Notes optionnelles (texte libre)
- Date cible optionnelle
- Création en < 30 secondes

**F1.2 — Vue liste**
- Tri par statut, catégorie, date
- Filtres multi-sélection
- Badge de statut coloré sur chaque carte
- Aperçu thumbnail si vidéo associée
- Swipe to delete (iOS native feel)

**F1.3 — Vue Blitz (session de tournage)**
- Sélection des idées à filmer aujourd'hui
- Ordre de tournage drag-and-drop
- Checker chaque idée filmée (statut → "shot")
- Timer optionnel par vidéo

**F1.4 — Statuts**
```
💡 Idée        → Capturée, pas encore planifiée
📅 Planifiée   → Date assignée
🎬 Filmée      → Tournée, pas encore montée
✂️ En montage  → Dans l'éditeur
✅ Prête       → Montée, prête à publier
📤 Publiée     → Live sur Instagram
```

---

### Pilier 2 — Éditeur vidéo pro

**Architecture de l'éditeur :**
Vertical (9:16), preview en haut, contrôles en bas (comme CapCut mobile).
Onglets : Trim · Filtres · Texte · Sous-titres · Audio · Effets

**F2.1 — Import et capture**
- Import depuis Photos iOS
- Capture webcam directe
- Limite : 1 clip vidéo principal (V1), multi-clip (V2)

**F2.2 — Trim**
- Slider de trim début/fin sur timeline
- Preview en temps réel
- Affichage du timecode

**F2.3 — Timeline multi-track (CapCut-style)**

Architecture :
```
┌─────────────────────────────────────────────────┐
│  00:00    00:05    00:10    00:15    00:20        │  ← Règle temporelle
├─────────────────────────────────────────────────┤
│ 🎬 [══════════════ Vidéo ════════════]           │  ← Track vidéo
├─────────────────────────────────────────────────┤
│ 🎵 [══ Musique (trim + fade in/out) ══]          │  ← Track audio
├─────────────────────────────────────────────────┤
│ Aa [═══ Texte 1 ═══]  [═══ Texte 2 ═══]         │  ← Track textes
├─────────────────────────────────────────────────┤
│ 💬 [══ Sous-titres ══════════════════]           │  ← Track sous-titres
└─────────────────────────────────────────────────┘
         ▲ Playhead draggable
```

Interactions :
- **Scroll horizontal** sur la timeline pour naviguer dans le temps
- **Pinch-to-zoom** pour zoomer/dézoomer la timeline
- **Drag** d'un élément sur sa track pour le repositionner dans le temps
- **Drag** entre tracks pour déplacer un overlay texte vers une autre position
- **Poignées** de début/fin sur chaque élément pour le trimmer
- **Playhead** draggable pour seeker rapidement
- **Bouton ▶/⏸** pour play/pause (visible pendant la lecture)

**F2.4 — Contrôles de lecture**
- Bouton ▶ Play / ⏸ Pause — toujours visible dans l'éditeur
- Tap sur la preview vidéo = toggle play/pause
- Retour au début automatique à la fin du clip
- Timecode actuel affiché : `00:05 / 00:32`

**F2.5 — Transitions entre clips (V2 — multi-clip)**
Pour la V1 : 1 seul clip vidéo, transitions non nécessaires.
Préparer l'architecture pour la V2 :
- Types prévus : Fondu enchaîné · Coupe franche · Wipe · Zoom
- Durée ajustable (0.3s à 1.5s)
- Rendu via FFmpeg `-filter_complex` ou WebCodecs canvas blend

**F2.6 — Import d'images (overlay ou arrière-plan)**
- Import depuis la pellicule iPhone (`accept="image/*"`)
- Utilisation en overlay (par-dessus la vidéo, comme un sticker)
- Utilisation en arrière-plan (sous la vidéo, format plein écran)
- Redimensionnable et repositionnable sur la preview
- Timing sur la timeline (début/fin d'apparition)
- Canaux supportés : PNG (avec transparence), JPG, HEIC
- Import depuis Canva (futur — V3)

**F2.4 — Filtres vidéo (9 presets CSS)**
```
Normal · Lumineux · Chaud · Froid
Vintage · Noir & Blanc · Doux · Vif · Sombre
```
Aperçu instantané en 1 tap.
Intensité ajustable (slider 0-100%).

**F2.5 — Texte overlay graphique**
- 30+ polices Google Fonts curées par catégorie :
  - Bold/Impact : Bebas Neue, Anton, Black Han Sans, Montserrat Black
  - Élégant : Playfair Display, Cormorant Garamond, Josefin Sans
  - Moderne : DM Sans, Outfit, Plus Jakarta Sans
  - Fun : Pacifico, Permanent Marker, Bangers
  - Zen/Santé : Zen Kaku Gothic, Noto Serif
- Styles preset : Classic (blanc + contour noir), Neon, Gold,
  Shadow, Bubbly, Minimal, Dark Pill
- Animations d'entrée : Fade · Slide Up · Slide Left · Bounce · Zoom
- Position libre (drag sur la preview)
- Taille ajustable
- Timing sur la timeline (début/fin d'apparition)

**F2.6 — Sous-titres automatiques**
- Transcription Whisper (OpenAI)
- Langue : français canadien
- Groupes de 3 mots (style TikTok)
- 3 styles : Classique · TikTok (highlight word) · Karaoké
- Édition manuelle par segment
- Position et taille ajustables

**F2.7 — Bibliothèque musicale + Édition audio**
- Intégration Jamendo (600K+ tracks libres de droits)
- Recherche par mood : Relaxant · Zen · Acoustique · Énergique
- Preview avant import
- Import de fichier audio local (MP3, M4A, AAC)

**Édition audio sur la timeline :**
- Trim audio : poignées début/fin indépendantes de la vidéo
- Fade in : fondu d'entrée (0 → volume cible sur N secondes)
- Fade out : fondu de sortie (volume → 0 sur N secondes)
- Volume musique vs. voix original (sliders indépendants)
- La musique est tronquée automatiquement à la durée de la vidéo

**F2.8 — Export**
- Format : MP4 H.265, 9:16, 1080x1920
- Qualité : CRF 23 (haute qualité)
- Via FFmpeg.wasm (in-browser, pas de serveur)
- Headers COOP/COEP pour multithreading
- Fallback WebCodecs si disponible (plus rapide)
- Sauvegarde automatique dans Firebase Storage après export

---

### Pilier 3 — Calendrier éditorial

**F3.1 — Vue mensuelle**
- Grille mensuelle native (pas de lib externe lourde)
- Chaque jour : aperçu des contenus planifiés (thumbnail ou dot)
- Code couleur par statut
- Navigation mois précédent/suivant

**F3.2 — Assigner une date**
- Depuis une idée "prête" : tap → choisir date + heure
- Depuis le calendrier : tap sur une date → sélectionner une idée prête
- Heures suggérées : 8h, 12h, 18h, 20h (bonnes heures Instagram)

**F3.3 — Détail d'un item**
- Bottom sheet (slide-up iOS)
- Thumbnail preview
- Statut + plateforme
- Caption (prévisualisée)
- Boutons : Modifier dans l'éditeur · Publier maintenant · Dépublier
- Pas de drag-and-drop (trop complexe sur mobile, pas nécessaire)

**F3.4 — Dashboard rapide**
En haut du calendrier, 1 ligne :
```
📊  2 publiés · 1 planifié · 3 prêts · 8 idées
```

---

### Pilier 4 — Publication

**F4.1 — Publier maintenant**
- Depuis l'éditeur ou le calendrier
- Modal de publication en 3 étapes :
  1. **Image de couverture** — choisir parmi 3 options :
     - Frame automatique (début de vidéo, `thumb_offset=0`)
     - Scrubber — faire glisser pour choisir n'importe quelle frame
     - Image custom — uploader une image depuis la pellicule iPhone
  2. **Caption** — générée par IA, éditable
  3. **Confirmation** — bouton "Publier"
- Publication via Instagram Graph API
- Statut mis à jour automatiquement

**F4.2 — Planifier**
- Date + heure picker
- Confirmation
- Cloud Function publie automatiquement au bon moment
- Notification email si échec

**F4.3 — Génération de caption IA**
- Basée sur le titre et la catégorie de l'idée
- Ton : professionnel mais chaleureux, français québécois
- Inclut automatiquement un CTA vers le site Wix
- Hashtags pertinents (acupuncture, fertilité, etc.)
- Éditable avant publication

**F4.4 — Historique**
- Liste des publications avec date, statut, thumbnail
- Lien vers le post Instagram

---

## Contraintes techniques

- **Mobile first** — 375px iPhone SE minimum
- **PWA standalone** — plein écran, pas de barre navigateur
- **Session persistante** — 1 connexion Google, jamais de re-login
- **Offline partiel** — banque d'idées lisible sans connexion (V2)
- **Gratuit pour Judith** — Firebase free tier + Vercel free tier

---

## Non-objectifs (ne pas construire)

- Drag-and-drop dans le calendrier
- Multi-utilisateurs / collaboration
- TikTok / YouTube Shorts (pour l'instant)
- Génération automatique de scripts
- Analytics avancés Instagram
- Système de rappels adaptatif complexe
