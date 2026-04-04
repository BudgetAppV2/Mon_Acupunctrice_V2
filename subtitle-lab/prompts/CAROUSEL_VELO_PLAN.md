# W3b — Carrousel Blog Custom via Velo by Wix

## Contexte
Le widget "Posts récents" natif de Wix affiche 3 cartes statiques.
Judith veut un vrai carrousel horizontal défilant avec des flèches,
plus visuellement attrayant et interactif.

## Approche technique
Utiliser Velo by Wix (mode développeur) avec :
- Un Repeater horizontal (overflow-x: scroll, CSS custom)
- L'API wix-blog-backend pour charger les posts dynamiquement
- Des boutons flèches gauche/droite pour naviguer
- Auto-scroll optionnel

## Prérequis
1. Activer le mode développeur Velo dans le dashboard Wix
   (Dashboard → Dev Mode → Turn on Dev Mode)
2. Ajouter un Repeater sur la page d'accueil
3. Ajouter le code Velo dans la page

## Architecture du carrousel

### Structure dans l'éditeur Wix
```
Section "Articles récents" (avant le footer)
├── Titre "Nos derniers articles" (Text)
├── Container horizontal (Box, overflow hidden)
│   └── Repeater #blogCarousel
│       └── Item template :
│           ├── Image #postImage (couverture)
│           ├── Text #postTitle (titre)
│           ├── Text #postDate (date)
│           └── Text #postExcerpt (extrait)
├── Button #prevBtn (flèche gauche)
├── Button #nextBtn (flèche droite)
└── Button #viewAllBtn ("Voir tous les articles →")
```

### Code Velo (page Home)
```javascript
import { posts } from 'wix-blog-backend';

let allPosts = [];
let currentIndex = 0;
const VISIBLE_COUNT = 3; // cartes visibles à la fois

$w.onReady(async function () {
  // Charger les 10 derniers articles
  const result = await posts.listPosts({
    paging: { limit: 10 },
    sort: { fieldName: 'firstPublishedDate', order: 'DESC' }
  });
  allPosts = result.posts;

  // Initialiser le repeater
  updateCarousel();

  // Navigation
  $w('#prevBtn').onClick(() => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });

  $w('#nextBtn').onClick(() => {
    currentIndex = Math.min(allPosts.length - VISIBLE_COUNT, currentIndex + 1);
    updateCarousel();
  });

  // Voir tous les articles
  $w('#viewAllBtn').onClick(() => {
    wixLocation.to('/blog');
  });
});

function updateCarousel() {
  const visiblePosts = allPosts.slice(currentIndex, currentIndex + VISIBLE_COUNT);
  
  $w('#blogCarousel').data = visiblePosts.map(post => ({
    _id: post._id,
    title: post.title,
    image: post.coverMedia?.image?.url || '',
    date: formatDate(post.firstPublishedDate),
    excerpt: post.excerpt?.substring(0, 100) + '...',
    url: post.url?.path || '/blog'
  }));

  $w('#blogCarousel').onItemReady(($item, itemData) => {
    $item('#postTitle').text = itemData.title;
    $item('#postImage').src = itemData.image;
    $item('#postDate').text = itemData.date;
    $item('#postExcerpt').text = itemData.excerpt;
    $item('#postImage').onClick(() => {
      wixLocation.to(itemData.url);
    });
  });

  // Désactiver les flèches aux extrémités
  $w('#prevBtn').enabled = currentIndex > 0;
  $w('#nextBtn').enabled = currentIndex < allPosts.length - VISIBLE_COUNT;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}
```

### CSS Custom (dans le code Velo ou via l'éditeur)
```css
/* Le repeater doit être en layout horizontal */
#blogCarousel {
  display: flex;
  flex-direction: row;
  gap: 16px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

/* Chaque carte */
.blog-card {
  min-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.blog-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
```

## Étapes d'implémentation

### Étape 1 — Préparer l'éditeur Wix (Claude in Chrome)
1. Supprimer le widget "Posts récents" natif (ajouté en W3)
2. Activer le Dev Mode (Velo)
3. Ajouter un Repeater vide sur la page d'accueil
4. Configurer le layout du repeater en horizontal
5. Ajouter les éléments dans le template (image, titre, date, extrait)
6. Ajouter les boutons flèches et "Voir tous les articles"
7. Nommer les éléments avec les bons IDs (#blogCarousel, #prevBtn, etc.)

### Étape 2 — Ajouter le code Velo (Claude in Chrome)
1. Ouvrir le panneau de code de la page d'accueil
2. Coller le code JavaScript ci-dessus
3. Tester en Preview
4. Ajuster le CSS si nécessaire

### Étape 3 — Design et polish
1. Matcher le style du site (couleurs sage, typographie)
2. Ajouter un titre "Nos derniers articles" au-dessus
3. Responsive : 1 carte sur mobile, 3 sur desktop
4. CTA "Voir tous les articles" sous le carrousel

## Alternatives si Velo est trop complexe
- Option A : Garder le widget natif "Posts récents" (déjà ajouté)
- Option B : Utiliser un widget tiers Wix App Market (Elfsight, POWr)
- Option C : Embed HTML custom avec l'API Wix REST
  (même code que notre Hub, mais intégré via iframe)

## Recommandation
Commencer par l'étape 1 avec Claude in Chrome pour
préparer le layout dans l'éditeur. Ensuite ajouter le code Velo.
Si Velo est trop complexe à configurer, garder le widget natif
qui est déjà en place — c'est mieux que rien.
