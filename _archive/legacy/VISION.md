# Mon_Acupunctrice — Vision du projet

## Contexte
Judith est acupunctrice à Montréal. Elle publie du contenu vidéo sur l'acupuncture et observe une corrélation directe entre la régularité de ses publications et son achalandage clinique. L'objectif est de professionnaliser et automatiser sa présence sur les réseaux sociaux, tout en minimisant le temps de gestion au quotidien.

**Profil Instagram :** @Mon_acupunctrice  
**Site web :** Wix (blog actif, gestion SEO par une collaboratrice)

---

## Objectif principal
Construire une nouvelle audience et accroître la notoriété de Judith comme référence en acupuncture au Québec.

---

## Stratégie de contenu

### Le modèle "blitz mensuel"
Une fois par mois, Judith enregistre une banque de vidéos en une ou deux sessions. Ce contenu est ensuite distribué de façon planifiée sur plusieurs semaines.

### Format principal
- **Reels / vidéos courtes (30–60 sec)** — format principal pour la croissance
- **Stories** — recyclage du contenu Reels, engagement communauté existante
- **Carrousels** — contenu éducatif, très partageable
- **Articles de blog Wix** — version longue des mêmes sujets, SEO local

### Plateformes cibles (par ordre de priorité)
1. Instagram Reels *(actif)*
2. TikTok
3. YouTube Shorts
4. Facebook Reels *(republication automatique depuis Instagram)*
5. Pinterest *(trafic durable vers le blog)*

### Synergie contenu
```
Blitz d'enregistrement mensuel
        ↓
Reel Instagram  ←→  Article de blog Wix (même sujet, version longue)
        ↓                        ↓
Stories (teaser)            SEO local Google
        ↓                        ↓
         ↘                    ↙
          Nouveau patient potentiel
```

---

## Le "Mon_Acupunctrice Hub" — vision de la webapp

Un outil centralisé de gestion de contenu, développé sur mesure, qui remplace les outils génériques (Buffer, Later) par une plateforme adaptée aux besoins spécifiques de Judith.

### Fonctionnalités cibles

#### Phase 1 — MVP
- Calendrier éditorial visuel (vue mensuelle)
- Banque d'idées de sujets avec statut (Idée / À filmer / Filmé / Monté / Schedulé / Publié)
- Statut par plateforme pour chaque pièce de contenu

#### Phase 2 — IA intégrée
- Génération de captions Instagram (accroche + corps + CTA + hashtags)
- Suggestions de sujets basées sur la saison et les tendances santé/bien-être
- Titres et angles de blog associés à chaque Reel

#### Phase 3 — Distribution intégrée
- Upload vidéo unique → distribution multi-plateforme
- Meta Graph API (Instagram + Facebook)
- YouTube Data API v3
- TikTok Content Posting API
- Pinterest API
- Publication programmée avec système de queue

#### Phase 4 — Intelligence & Collaboration
- Scraping de tendances (TikTok Creative Center, Google Trends, hashtags Instagram)
- Onglet "Inspiration" avec contenu trending dans la niche acupuncture/bien-être
- Accès collaborateur (personne SEO/blog)
- Analytics basiques (sujets qui performent le mieux)
- Intégration Wix blog via leur API

---

## Stack technique envisagée
- **Frontend :** React (hébergé sur Render)
- **Backend :** Node.js / Express (Render)
- **Stockage vidéo :** Firebase Storage ou Cloudinary
- **Base de données :** Firebase Firestore
- **Publication programmée :** Cloud Functions (queue)
- **APIs externes :** Meta Graph, YouTube Data v3, TikTok, Pinterest

---

## Personnes impliquées
- **Judith** — créatrice de contenu, acupunctrice
- **Benoit** — développeur, gestionnaire du site Wix
- **Collaboratrice SEO/blog** — gestion du contenu écrit (à intégrer Phase 4)
