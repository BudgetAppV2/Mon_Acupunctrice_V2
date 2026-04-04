# Plan Master — Route Blogue + SEO Site Wix

## État des lieux après investigation

### Ce qui existe dans la codebase

**Séquence blogue (4 publications) :**
- `CreateSequenceSheet.tsx` — UI qui prend une URL de blog, scrape les métadonnées OG
- `useBlogSequence.ts` — hook qui crée 4 slots dans le calendrier :
  - J+0 : Story promo (autoPublish=true, image générée par canvas)
  - J+1 : Reel résumé (autoPublish=false, Judith doit créer le reel)
  - J+3 : Reel conseil pratique (autoPublish=false)
  - J+7 : Story rappel (autoPublish=true, image générée par canvas)
- `storyImageGenerator.ts` — génère des images 1080x1920 (fond sage + titre blanc + CTA)
- `blogSequences` collection Firestore — stocke l'URL, le titre, les slotIds

**Publication stories :**
- `publishInstagramStory()` dans `publishHelpers.ts` — fonctionne via l'API IG
  Utilise `media_type: 'STORIES'` + `image_url` ou `video_url`
- Le cron `publish` auto-publie les stories des séquences (`autoPublish=true`)
- LIMITATION : l'API ne supporte PAS les stickers (lien, sondage, etc.)
  Le "lien dans la bio" est le seul CTA possible pour les stories via API

**Publication multi-plateforme :**
- `publish-instagram/route.ts` — publie un Reel IG
- `publish-facebook/route.ts` — publie un Reel Facebook
- `publish-youtube/route.ts` — publie un YouTube Short
- `publish-story/route.ts` — publie une Story IG
- `cron/publish` — auto-publie les items scheduled + les stories autoPublish

### API Wix Blog (disponible)
- REST API complète : `POST /blog/v3/draft-posts` + `POST .../publish`
- Authentification : API Key + Site ID dans les headers
- Contenu : format Ricos JSON (PARAGRAPH, HEADING, IMAGE, LIST, BLOCKQUOTE)
- Images : doivent être importées dans le Media Manager Wix d'abord
- Package npm : `@wix/blog`
- Rôles : Blog editor, Blog writer, Guest writer
- Limite : 100,000 posts max, 400KB par post

### API Instagram Stories (confirmé)
- `media_type: 'STORIES'` fonctionne avec `image_url` ou `video_url`
- LIMITATION MAJEURE : pas de stickers (link sticker, sondage, quiz, etc.)
- Les stories publiées via API sont des images/vidéos statiques
- Pour un lien cliquable, le seul moyen est le "Lien dans la bio"
- Les stories ont une durée de vie de 24h

### SEO — Constat actuel
- Site Wix `acupuncturejudith.ca` avec blog actif (articles réguliers)
- Aucune analyse SEO faite
- Potentiel fort : acupuncture Montréal / Rosemont / fertilité / grossesse
- Le lien GoRendezVous n'est pas optimisé dans le parcours visiteur

---

## Les 5 axes — Plan détaillé

### AXE 1 — Publication du blogue depuis le Hub
**Objectif** : Judith colle son texte dans le Hub → un bouton publie sur Wix

**Milestones :**
- B1.1 : Configurer l'API Wix (API Key, Site ID, stocker dans Firestore)
- B1.2 : Nouvelle page/section "Blogue" dans le Hub (textarea + preview)
- B1.3 : API route `/api/publish-blog` qui transforme le texte en Ricos JSON
         et appelle l'API Wix Blog pour créer et publier l'article
- B1.4 : Import d'images dans le Media Manager Wix (cover image)
- B1.5 : Liaison avec la séquence : après publication blog, déclencher
         automatiquement la création des 4 slots de la séquence

**Dépendances** : API Key Wix (à créer dans le dashboard Wix)

### AXE 2 — Amélioration de la séquence post-blogue (4 publications)
**Objectif** : Rendre la séquence plus efficace et automatisée

**Problèmes actuels :**
- Les images de stories sont basiques (canvas vert + texte blanc)
- Pas de branding La Source en Soi / logo
- Les stories n'ont pas de lien sticker (limitation API)
- Le texte CTA dans l'image ne mentionne pas GoRendezVous
- Les reels (J+1 et J+3) ne sont pas auto-publiés — Judith doit les créer manuellement

**Milestones :**
- B2.1 : Améliorer le design des images de stories (branding, logo, typo)
         → utiliser des templates d'images plus pro (Canva-like)
- B2.2 : Ajouter le lien GoRendezVous dans l'image de la story 
         (puisqu'on ne peut pas utiliser le link sticker via API)
         → texte "Prends rendez-vous : gorendezvous.com/lasourceensoi"
- B2.3 : Générer automatiquement les captions des reels de la séquence
         (reel_resume et reel_pratique) à partir du contenu du blog
- B2.4 : Ajouter les tags/branding "La Source en Soi" dans les stories

**Dépendance** : Axe 1 (le contenu du blog alimente les captions)

### AXE 3 — Optimisation visuelle du site et du blog Wix
**Objectif** : Moderniser le blog et ajouter un carrousel sur la page d'accueil

**Milestones :**
- B3.1 : Ajouter le widget "Posts récents" natif sur la page d'accueil Wix
         (3 cartes en ligne, avant le footer) — via l'éditeur Wix
- B3.2 : Changer le layout du blog de "Côte à côte" à "Carreaux" ou "Editorial"
- B3.3 : (Optionnel) Carrousel custom via Velo by Wix si le widget natif
         ne satisfait pas → code JS custom avec l'API wix-blog

**Dépendance** : Accès à l'éditeur Wix (Judith doit valider les changements)

### AXE 4 — SEO du site Wix
**Objectif** : Améliorer le référencement sur Google pour les mots-clés cibles

**Milestones :**
- B4.1 : Audit SEO complet du site (meta titles, descriptions, H1/H2, images alt,
         URLs, vitesse, mobile, schema markup)
- B4.2 : Optimiser les meta tags de chaque page (accueil, services, blog)
         Mots-clés : "acupuncture Montréal", "acupuncture Rosemont",
         "acupuncture fertilité", "acupuncture grossesse", etc.
- B4.3 : Ajouter le schema markup LocalBusiness + HealthAndBeautyBusiness
         pour les rich snippets Google
- B4.4 : Optimiser les articles de blog existants (titres, H2, liens internes)
- B4.5 : Intégrer le SEO dans le flow de publication du Hub — quand un article
         est publié, les meta tags sont automatiquement optimisés

**Dépendance** : Axe 3 (le site doit être visuellement correct avant l'optimisation SEO)

### AXE 5 — Parcours visiteur → GoRendezVous
**Objectif** : Maximiser la conversion vers la prise de rendez-vous

**Milestones :**
- B5.1 : Audit du parcours actuel (combien de clics entre la page d'accueil
         et la prise de rendez-vous?)
- B5.2 : CTA "Prendre rendez-vous" visible sur TOUTES les pages du site
         (header sticky ou bouton flottant)
- B5.3 : Optimiser le lien dans la bio Instagram pour pointer vers GoRendezVous
         (ou une landing page avec le lien)
- B5.4 : Tracker les conversions (UTM params dans les liens GoRendezVous
         pour savoir quelle source convertit le plus)

**Dépendance** : Axes 3 et 4

---

## Ordre d'exécution recommandé

```
Phase 1 (Hub — on contrôle le code)
├── B1.1 Config API Wix
├── B1.2 Section Blogue dans le Hub
├── B1.3 Route /api/publish-blog
├── B2.1 Améliorer images stories
├── B2.2 Ajouter GoRendezVous dans les images
└── B2.3 Captions auto pour les reels de séquence

Phase 2 (Site Wix — nécessite validation Judith)
├── B3.1 Widget Posts récents sur l'accueil
├── B3.2 Layout du blog
└── B4.1 Audit SEO

Phase 3 (SEO + Conversion — après validation design)
├── B4.2 Meta tags optimisés
├── B4.3 Schema markup
├── B4.4 Optimiser articles existants
├── B5.1 Audit parcours visiteur
├── B5.2 CTA rendez-vous partout
└── B5.3 Lien bio Instagram optimisé

Phase 4 (Automation + Mesure)
├── B1.4 Import images Wix Media Manager
├── B1.5 Séquence auto après publication blog
├── B4.5 SEO auto dans le flow
└── B5.4 Tracking conversions UTM
```

## Prochaines étapes
1. Créer l'API Key Wix dans le dashboard (Benoit)
2. Demander à Claude Code de planifier les milestones Phase 1
3. Faire valider le design blog avec Judith (Phase 2)
4. Lancer l'audit SEO avec Exa/Chrome (Phase 3)
