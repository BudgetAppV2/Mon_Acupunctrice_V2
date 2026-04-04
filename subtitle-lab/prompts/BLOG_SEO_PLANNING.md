# Planification — Route Blogue + SEO Site Wix

## Vision
Créer un pont entre le Hub Mon Acupunctrice et le site Wix (acupuncturejudith.ca)
pour faciliter la publication du blogue, améliorer le SEO, et maximiser la conversion
vers la prise de rendez-vous GoRendezVous.

## Axes à explorer

### 1. Route Blogue dans le Hub
- Section "Blogue" — Judith colle/upload son texte d'article
- Publication directe sur Wix via Blog API (SDK @wix/blog, Ricos JSON)
- Déclenchement automatique de la séquence 4 publications (story_promo, reel_resume, reel_pratique, story_rappel)
- Génération d'images promo pour les stories (l'API ne publie pas les stories directement)

### 2. SEO du site Wix
- Audit SEO complet (meta tags, structure, mots-clés)
- Optimisation des articles de blogue existants
- Mots-clés cibles : acupuncture Montréal, Rosemont, fertilité, grossesse, etc.
- Schema markup pour les services de santé

### 3. Parcours visiteur → rendez-vous
- Lien GoRendezVous optimisé partout (site, blog, réseaux)
- CTA clairs sur chaque page du site
- Mesure du taux de conversion

### 4. Connexion contenu vidéo ↔ articles
- Chaque vidéo → article de blog (transcription comme base)
- Chaque article → séquence de 4 publications vidéo
- Cross-linking entre articles et vidéos

## Infrastructure existante
- CreateSequenceSheet (4 publications à partir d'un lien de blog)
- useBlogSequence hook
- API Wix Blog disponible (@wix/blog SDK, Ricos JSON format)
- Scraping OG pour extraire titre/image des articles

## À planifier en prochaine session
- Audit SEO du site actuel
- Prototype de la route Blogue
- Stratégie de contenu vidéo ↔ blog
- Génération d'images pour stories
