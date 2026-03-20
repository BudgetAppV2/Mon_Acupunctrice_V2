# Mon_Acupunctrice — Roadmap de développement

## Vision du pipeline complet

```
PLANIFICATION (Hub)
  Banque d'idées → "Planifier" → assigné au blitz du mois
        ↓
BLITZ MENSUEL (Hub - vue Blitz)
  Liste de tournage → Judith coche au fur et à mesure
  Statut: idée → à-filmer → filmé
        ↓
MONTAGE (hors Hub — CapCut sur téléphone)
  Statut: filmé → monté
        ↓
UPLOAD + CAPTION (Hub - Phase 2)
  Upload vidéo montée dans le Hub (Firebase Storage)
  Génération de caption IA (Claude API)
  Statut: monté → prêt à publier
        ↓
DISTRIBUTION PROGRAMMÉE (Hub - Phase 3)
  Choisir date + plateformes
  Publication automatique via APIs
  Statut: prêt → publié ✓
```

---

## Vue d'ensemble des phases

| Phase | Nom | Statut | Description |
|-------|-----|--------|-------------|
| 1a | MVP Calendrier + Banque d'idées | ✅ Complété | Calendrier, banque, flux Planifier→Calendrier |
| 1b | Vue Blitz mensuel | 🔜 En cours | Liste de tournage, checklist, ordre suggéré |
| 1c | Déploiement Render | 🔜 Suivant | Judith accède sur son téléphone |
| 2 | Upload vidéo + Captions IA | ⏳ Planifié | Firebase Storage + Claude API |
| 3 | Distribution multi-plateforme | ⏳ Planifié | Meta, YouTube, TikTok, Pinterest APIs |
| 4 | Tendances + Analytics + Collab | ⏳ Planifié | Scraping, analytics, accès collaborateur |

---

## Phase 1b — Vue Blitz mensuel

**Objectif :** Donner à Judith un outil concret pour gérer sa session de tournage mensuelle.

### Fonctionnalités
- Vue dédiée "Blitz — [mois en cours]"
- Liste de tous les items avec statut "à-filmer" du mois courant
- Groupés par catégorie (pour optimiser décor/tenue entre les prises)
- Checklist interactive : tap sur un item → passe à "filmé"
- Compteur de progression : "5/9 tournés"
- Bouton pour ajouter un item de dernière minute directement depuis cette vue
- Accès rapide depuis le header principal

### UX mobile-first
- Design pensé pour être utilisé sur téléphone pendant le tournage
- Grandes zones de tap, interface simple
- Persistance en temps réel via Firestore (si Judith et Benoit regardent en même temps)

### Livrables
- [ ] Composant `BlitzPage.jsx`
- [ ] Onglet "Blitz" dans le header
- [ ] Groupement par catégorie
- [ ] Tap-to-check (à-filmer → filmé)
- [ ] Compteur de progression

---

## Phase 1c — Déploiement Render

**Objectif :** Judith peut accéder au Hub sur son téléphone, sans passer par le laptop de Benoit.

### Livrables
- [ ] `render.yaml` ou configuration via interface Render
- [ ] Variables d'environnement Firebase sur Render
- [ ] URL publique (ex: `mon-acupunctrice-hub.onrender.com`)
- [ ] Test sur mobile (iOS Safari)

---

## Phase 2 — Upload vidéo + Captions IA

**Objectif :** Judith uploade sa vidéo montée une seule fois, et le Hub génère sa caption.

### Fonctionnalités
- Upload vidéo depuis le Hub (Firebase Storage)
  - Formats acceptés : MP4, MOV
  - Taille max : 500MB
  - Preview vidéo dans l'interface
- Générateur de captions (Claude API `claude-sonnet-4-20250514`)
  - Input : titre + catégorie + plateforme + notes
  - Output : 2-3 options de caption avec hashtags
  - Ton : éducatif, professionnel, québécois
  - Contraintes OAQ intégrées dans le prompt (pas de témoignages, info factuelle)
- Champ caption éditable sur chaque item
- Statut : monté → prêt à publier

### Livrables
- [ ] Composant `VideoUpload.jsx`
- [ ] Intégration Firebase Storage
- [ ] Cloud Function ou appel direct Claude API pour captions
- [ ] Prompt système intégrant les contraintes OAQ
- [ ] Composant `CaptionGenerator.jsx`

---

## Phase 3 — Distribution multi-plateforme

**Objectif :** Upload une seule fois, publier partout automatiquement.

### APIs à intégrer
| Plateforme | API | Difficulté | Notes |
|------------|-----|-----------|-------|
| Instagram | Meta Graph API | ⭐⭐ | Upload Reels + scheduling supporté |
| Facebook | Meta Graph API | ⭐ | Même API qu'Instagram |
| YouTube | YouTube Data API v3 | ⭐⭐ | Très bien documenté |
| TikTok | Content Posting API | ⭐⭐⭐ | Accès développeur à demander |
| Pinterest | Pinterest API v5 | ⭐⭐ | Upload vidéo supporté |

### Fonctionnalités
- Sélection des plateformes cibles par item (checkboxes)
- Date/heure de publication par plateforme
- Système de queue Cloud Functions
- Statut de publication en temps réel
- Notifications en cas d'erreur

### Livrables
- [ ] Intégration Meta Graph API (Instagram + Facebook)
- [ ] Intégration YouTube Data API
- [ ] Intégration TikTok Content Posting API
- [ ] Intégration Pinterest API
- [ ] Cloud Functions — queue de publication programmée
- [ ] Dashboard statut publications

---

## Phase 4 — Intelligence & Collaboration

**Objectif :** Le Hub devient proactif et collaboratif.

### Session d'analyse de tendances (session dédiée)
- Scraping TikTok Creative Center (tendances par niche)
- Google Trends (santé/bien-être, Québec)
- Apify / Bright Data pour hashtags Instagram
- Claude analyse ce qui performe dans la niche grossesse/fertilité/pédiatrie
- Génération d'une grosse banque d'idées fraîches → seed dans Firestore

### Analytics
- Quel sujet performe le mieux (via APIs plateformes)
- Meilleur jour/heure pour publier
- Tableau de bord visuel

### Collaboration
- Accès collaboratrice SEO/blog
- Annotations et commentaires sur les items
- Intégration Wix blog API (lier article de blog à un Reel)

---

## Modèle de données Firestore — complet

### Collection `content_items`
```json
{
  "id": "auto",
  "title": "Titre du sujet",
  "category": "grossesse | fertilité | post-partum | enfant | acupuncture-pour-tous | santé-générale",
  "status": "idée | à-filmer | filmé | monté | prêt | publié",
  "platforms": ["instagram", "tiktok", "youtube", "facebook", "pinterest"],
  "scheduledDate": "Timestamp | null",
  "blitzMonth": "2026-04 | null",
  "videoUrl": "Firebase Storage URL | null",
  "caption": "texte généré | null",
  "blogPostUrl": "URL article de blog associé | null",
  "notes": "notes libres",
  "publishedDates": { "instagram": "Timestamp", "youtube": "Timestamp" },
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

## Stack technique
- **Frontend :** React + Tailwind CSS (Vite)
- **Base de données :** Firebase Firestore (`northamerica-northeast1`)
- **Stockage vidéo :** Firebase Storage
- **IA :** Claude API `claude-sonnet-4-20250514` (captions)
- **Publications programmées :** Cloud Functions (queue)
- **Hébergement :** Render (`mon-acupunctrice-hub.onrender.com`)
- **Repo :** github.com/BudgetAppV2/Mon_Acupunctrice

---

## Personnes impliquées
- **Judith** — créatrice de contenu, acupunctrice
- **Benoit** — développeur, gestionnaire du site Wix
- **Collaboratrice SEO/blog** — gestion du contenu écrit (intégration Phase 4)
