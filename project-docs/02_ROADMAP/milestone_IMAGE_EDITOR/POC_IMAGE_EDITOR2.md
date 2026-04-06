# POC — Éditeur de design "Canva-like" intégré au Hub

## Contexte du projet

Mon Acupunctrice Hub V2 est une app **Next.js 14+ (App Router)** avec :
- TypeScript, TailwindCSS, Firebase, Zustand
- Structure : `app/(app)/` pour les pages authentifiées
- Composants : `components/features/` organisés par feature
- La branche actuelle est `feature/image-editor`

Le hub est pour Judith, acupunctrice à La Source en Soi (Montréal).
Elle crée des articles de blog et des stories Instagram. Actuellement elle doit
aller dans Canva pour créer ses visuels. On veut un éditeur intégré directement
dans le hub.

## Librairie principale : LidoJS

Repo source : https://github.com/lidojs/canva-clone (302 stars, actif, MIT)
Le package npm `@lidojs/design-editor` a été **unpublished**. Il faut donc :
1. Cloner le repo dans un dossier local (ex: `lib/lidojs/`)
2. Adapter les imports pour Next.js
3. OU si trop complexe, utiliser Fabric.js directement comme fallback

**IMPORTANT** : LidoJS et Fabric.js sont client-only (DOM requis).
Toujours utiliser `dynamic import` avec `ssr: false`.

## Instructions pour Claude Code

**COMMENCE par écrire un plan de milestones** dans un fichier
`project-docs/02_ROADMAP/milestone_IMAGE_EDITOR/MILESTONES.md`
avant d'écrire du code. Le plan doit découper le travail en 4-5 milestones
indépendantes, chacune testable. Montre-moi le plan et attends ma validation
avant de coder.

Ensuite, exécute chaque milestone comme un prompt oneshot autonome.

---

## Milestone 1 — Setup et page isolée

### Objectif
Créer la page `/editeur-image` avec un canvas fonctionnel qui charge.

### Tâches
- Vérifier la structure du projet (App Router confirmé)
- Évaluer si LidoJS peut s'intégrer :
  - Cloner les packages core de `lidojs/canva-clone` dans `lib/lidojs/`
  - Adapter les imports pour Next.js
  - Si échec → fallback sur `npm install fabric` (Fabric.js v6)
- Créer `app/(app)/editeur-image/page.tsx` avec dynamic import SSR-disabled
- Créer `components/features/image-editor/ImageEditorLayout.tsx`
- Canvas initialisé en 1080x1920 (format Story Instagram)
- Charger les Google Fonts Antic Slab + Mulish dans le head

### Definition of Done
- [ ] La page /editeur-image charge sans erreur SSR
- [ ] Un canvas vide 1080x1920 est affiché à l'écran
- [ ] Les fonts Antic Slab et Mulish sont chargées

---

## Milestone 2 — Template La Source en Soi + Édition de base

### Objectif
Pré-charger un template brandé et permettre l'édition de base.

### Tâches
- Créer `lib/data/imageEditorTemplates.ts` avec le template JSON :
  - Fond : dégradé/formes turquoise (#7EBEC5) + menthe (#AAD1D2)
  - Zone haute : "Judith Dufour Savard" (Antic Slab) + "ACUPUNCTURE" (Mulish bold)
  - Zone centre : "TITRE DU BLOGUE" (Antic Slab, grande taille, éditable)
  - Zone basse : "GORENDEZVOUS.COM/LASOURCEENSOI" + "@LASOURCEENSOI"
  - Logo La Source en Soi en bas à droite (URL : https://lasourceensoi.com/wp-content/uploads/2022/08/logo-la-source-en-soi-1.png)
- Charger le template au lancement de l'éditeur
- Les éléments texte sont éditables (double-clic pour modifier)
- Les éléments sont draggables, redimensionnables, rotatables
- Palette de couleurs pré-chargée :
  turquoise: '#7EBEC5', menthe: '#AAD1D2', sage: '#5C7A5F',
  foret: '#3D5E40', charbon: '#212121', creme: '#F4F4F4'

### Definition of Done
- [ ] Le template La Source en Soi s'affiche au chargement
- [ ] Le texte "TITRE DU BLOGUE" est éditable (double-clic)
- [ ] Les objets sont draggables et redimensionnables
- [ ] La palette de couleurs est disponible

---

## Milestone 3 — UI : Sidebar avec onglets

### Objectif
Ajouter une sidebar avec des panneaux pour enrichir les designs.

### Layout
- Layout plein écran (100vh)
- Header : nom du design + bouton "Exporter"
- Sidebar gauche avec onglets : Templates, Photos, Éléments, Texte
- Centre : canvas avec zoom/scroll

### Onglet Templates
- Affiche 2-3 templates pré-faits (story, blog cover, post carré)
- Clic → charge le template dans le canvas

### Onglet Texte
- Ajouter un titre (Antic Slab, grand)
- Ajouter un sous-titre (Mulish, moyen)
- Ajouter du body text (Mulish, petit)
- Sélecteur de font avec toutes les Google Fonts disponibles

### Onglet Éléments SVG
- Créer `lib/data/imageEditorElements.ts` avec des SVG thématiques :
  - Catégorie "Zen" : feuille, goutte d'eau, lotus, bambou
  - Catégorie "Santé" : aiguille d'acupuncture, méridien, yin-yang
  - Catégorie "Formes" : cercle, rectangle, ligne, flèche
- Les SVG sont des URLs vers des ressources gratuites (svgrepo.com ou similaire)
- Clic ou drag → ajoute l'élément au canvas

### Onglet Photos (Unsplash)
- Composant de recherche avec debounce (300ms)
- Utilise l'API Unsplash via variable d'env NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
- Si la clé n'est pas configurée → afficher un message placeholder
- Grille de résultats avec thumbnails
- Clic → ajoute la photo au canvas
- Commentaire dans le code : limite de 50 req/heure (plan gratuit Unsplash)

### Definition of Done
- [ ] Sidebar avec 4 onglets fonctionnels
- [ ] Templates : clic charge un template
- [ ] Texte : 3 styles de texte ajoutables + sélecteur de font
- [ ] Éléments : SVG ajoutables au canvas par clic
- [ ] Photos : recherche Unsplash fonctionnelle (ou placeholder si pas de clé API)

---

## Milestone 4 — Export double format

### Objectif
Exporter le design en PNG dans les deux formats nécessaires.

### Tâches
- Bouton "Exporter" dans le header
- Export 1 : PNG 1080x1920 (Story Instagram) — téléchargement direct
- Export 2 : PNG 1200x675 (Blog cover 16:9) — crop automatique du centre
  - Utiliser HTML5 Canvas en post-traitement
  - Crop : bande centrale de 34% à 66% de la hauteur
- Les deux fichiers se téléchargent avec des noms descriptifs :
  - design-story-1080x1920.png
  - design-blog-1200x675.png

### Definition of Done
- [ ] Bouton "Exporter" télécharge 2 fichiers PNG
- [ ] Le format story (1080x1920) est correct
- [ ] Le format blog (1200x675) est un crop centré du story
- [ ] Les fichiers ont des noms descriptifs

---

## Milestone 5 (Bonus) — Intégration BlogEditor

### Objectif
Connecter l'éditeur d'images au BlogEditor existant.

### Tâches
- Ajouter un bouton "Créer l'image" dans le BlogEditor existant
  (components/features/blog/BlogEditor.tsx)
- Le bouton ouvre /editeur-image dans un nouvel onglet ou en modal
- Après export, l'image est passée au BlogEditor via localStorage ou state

### Note
Cette milestone est optionnelle pour le POC.

### Definition of Done
- [ ] Bouton dans BlogEditor pour ouvrir l'éditeur d'images
- [ ] Le flow BlogEditor → éditeur → export fonctionne

---

## Contraintes globales

- Ne PAS modifier les pages/composants existants (sauf M5 pour BlogEditor)
- Ne PAS modifier le store Zustand, le layout principal, ni la navigation
- La page /editeur-image est standalone, accessible par URL directe
- Utiliser dynamic import avec ssr: false
- Utiliser TailwindCSS pour le styling de l'UI
- Heroicons pour les icônes
- TypeScript strict
- 0 console.log en production

## Approche de fallback (IMPORTANT)

Si LidoJS (clonage du repo) ne fonctionne pas avec Next.js 14+ :
1. Installer Fabric.js : npm install fabric@6
2. Construire un éditeur custom avec Fabric.js + React
3. Toutes les milestones restent les mêmes, seule la librairie canvas change
4. L'API Fabric.js pour les fonctions clés :
   - new fabric.Canvas('id') — créer le canvas
   - new fabric.IText('texte') — texte éditable
   - fabric.Image.fromURL(url) — ajouter une image
   - canvas.toDataURL('image/png') — export PNG
   - canvas.loadFromJSON(json) — charger un template
