# Vision globale — Mon Acupunctrice Hub : Route Blogue + Site Wix

## La finalité unique

Tout ce qu'on fait converge vers UN objectif :
**Maximiser le nombre de rendez-vous pris via GoRendezVous pour Judith.**

Chaque axe (blogue, vidéo, stories, SEO, site) est un canal qui amène
des visiteurs vers `https://gorendezvous.com/lasourceensoi`.

## Le flow idéal (cible)

```
Judith écrit un article de blog dans le Hub
        │
        ▼
Le Hub publie l'article sur Wix (avec SEO optimisé)
        │
        ▼
Le Hub crée automatiquement 4 publications :
├── J+0 : Story Instagram promo (image branded + "Lien dans ma bio")
├── J+1 : Reel résumé (caption auto générée du contenu du blog)
├── J+3 : Reel conseil pratique (caption auto générée)
└── J+7 : Story Instagram rappel (image branded)
        │
        ▼
Chaque publication redirige vers GoRendezVous :
├── Instagram : "Lien dans ma bio" → GoRendezVous
├── Facebook : lien cliquable dans la caption → GoRendezVous
├── YouTube : lien dans la description → GoRendezVous
└── Blog Wix : CTA dans l'article → GoRendezVous
        │
        ▼
Le visiteur prend rendez-vous
```

## Comment chaque axe sert la finalité

### AXE 1 — Publication du blogue depuis le Hub
POURQUOI : Le blog est le contenu pilier. C'est l'article long qui 
démontre l'expertise de Judith et qui convertit via le SEO Google.
Un article bien écrit attire des visiteurs organiques pendant des mois.
CONVERSION : CTA GoRendezVous dans chaque article.

### AXE 2 — Séquence post-blogue (4 publications)
POURQUOI : Chaque article génère 4 publications qui redistribuent le
contenu sur IG, FB, YT. C'est le multiplicateur — un effort d'écriture
génère 5 points de contact (1 article + 4 publications).
CONVERSION : 
- Stories : image branded avec "Prends rendez-vous" + lien bio
- Reels IG : caption avec "Lien dans ma bio"
- Reels FB : lien GoRendezVous cliquable dans la caption
- Shorts YT : lien GoRendezVous dans la description

### AXE 3 — Optimisation visuelle du site Wix
POURQUOI : Quand un visiteur arrive sur le site (via Google, via un lien
dans une publication), il doit immédiatement voir le blog et le bouton
rendez-vous. Le carrousel blog sur la page d'accueil garde les visiteurs
engagés. Un site visuellement pro inspire confiance.
CONVERSION : CTA "Prendre rendez-vous" visible partout sur le site.

### AXE 4 — SEO du site Wix
POURQUOI : Le SEO amène du trafic organique gratuit. Une personne qui
cherche "acupuncture fertilité Montréal" sur Google doit tomber sur
le site de Judith. Les articles de blog sont le moteur du SEO.
CONVERSION : Chaque page optimisée guide vers GoRendezVous.

### AXE 5 — Parcours visiteur → GoRendezVous
POURQUOI : Ça ne sert à rien d'avoir du trafic si le visiteur ne trouve
pas comment prendre rendez-vous. Le parcours doit être fluide et minimal :
max 2 clics entre n'importe quelle page et la prise de rendez-vous.
CONVERSION : C'est littéralement l'axe de conversion.

## Interdépendances entre les axes

```
AXE 1 (Blog Hub) ──────► AXE 2 (Séquence 4 pubs)
      │                        │
      │                        ▼
      │               Captions auto générées
      │               Images stories brandées
      │               Publication automatique
      │
      ▼
AXE 4 (SEO) ◄──────── AXE 3 (Site Wix visuel)
      │                        │
      │                        ▼
      │               Carrousel blog accueil
      │               Layout blog modernisé
      │               CTA rendez-vous partout
      │
      ▼
AXE 5 (Conversion GoRendezVous) ◄── TOUS LES AXES
```

## Infrastructure existante (à réutiliser)

### Hub — Code existant
- `useBlogSequence.ts` — crée 4 slots de séquence (story_promo, reel_resume, reel_pratique, story_rappel)
- `storyImageGenerator.ts` — génère des images 1080x1920 (canvas, fond sage)
- `CreateSequenceSheet.tsx` — UI pour créer une séquence à partir d'une URL de blog
- `publishHelpers.ts` — publie sur IG (reels + stories), FB, YT
- `cron/publish` — auto-publie les items scheduled + stories autoPublish
- `generate-captions/route.ts` — génère 3 captions (IG/FB/YT) avec transcription
- Les captions utilisent déjà le lien GoRendezVous (mis à jour hier)

### API Wix — Confirmé fonctionnel
- API Key : dans `WIX_API_KEY` (.env.local)
- Site ID : `c230cb14-508f-481b-bef7-cb5c69e67b3d` dans `WIX_SITE_ID`
- 11 articles existants, 6 catégories
- Member ID : `7c47c5bd-95ae-4b31-a47a-11e1c94268e5`
- Endpoints : POST /blog/v3/draft-posts + POST .../publish
- Contenu en format Ricos JSON

### API Instagram Stories — Limitations confirmées
- Fonctionne avec image_url ou video_url + media_type=STORIES
- PAS de stickers (link sticker impossible via API)
- Le CTA doit être DANS l'image elle-même
- La seule façon de mettre un lien cliquable = "Lien dans la bio"

### Site Wix — État actuel (rapport Claude in Chrome)
- Page blog : layout "Côte à côte", 6 layouts natifs disponibles
- Page accueil : AUCUNE section blog
- Widget "Posts récents" natif disponible (3 cartes en ligne)
- Mode développeur Velo disponible pour du code custom

## Phases d'exécution (voir BLOG_SEO_MASTER_PLAN.md pour le détail)

Phase 1 : Hub — Publication blog + amélioration séquence
Phase 2 : Site Wix — Visuel + carrousel (validation Judith requise)
Phase 3 : SEO + Conversion (après validation design)
Phase 4 : Automation + Mesure (tracking UTM, SEO auto)

## Instructions pour Claude Code

CE DOCUMENT EST LA RÉFÉRENCE. Avant de planifier ou coder quoi que ce soit
lié au blog, au site Wix, aux stories, ou au SEO :
1. Lis ce document pour comprendre LA FINALITÉ (maximiser les rendez-vous)
2. Lis BLOG_SEO_MASTER_PLAN.md pour le détail des milestones
3. Chaque prompt oneshot doit inclure un rappel de la finalité
4. Chaque livrable doit être évalué : "est-ce que ça rapproche Judith
   d'un rendez-vous supplémentaire?"
5. Le lien GoRendezVous (https://gorendezvous.com/lasourceensoi) doit
   être présent ou accessible en max 2 clics dans TOUT ce qu'on produit.
