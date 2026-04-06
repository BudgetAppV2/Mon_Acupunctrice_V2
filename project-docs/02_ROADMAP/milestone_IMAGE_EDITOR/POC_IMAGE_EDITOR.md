# POC — Éditeur d'images intégré avec react-design-editor

## Contexte

Le Hub Mon Acupunctrice V2 est une app Next.js (App Router) pour Judith,
acupunctrice à La Source en Soi (Montréal). Judith crée des articles de blog
et des stories Instagram. Actuellement, elle doit aller dans Canva pour créer
les images de couverture de ses articles (format story 1080x1920 et blog 16:9).

On veut intégrer un éditeur de design directement dans le hub pour que Judith
puisse créer ses visuels sans quitter l'application.

## Objectif du POC

Intégrer `react-design-editor` (https://github.com/salgum1114/react-design-editor)
dans une nouvelle page du hub comme éditeur d'images. L'éditeur doit charger un
template pré-configuré aux couleurs de La Source en Soi.

## Librairie

```bash
npm install react-design-editor
```

Si l'installation échoue ou que la librairie n'est pas compatible Next.js 14+,
utiliser l'approche alternative : cloner les composants essentiels du repo
(https://github.com/salgum1114/react-design-editor) et les adapter.
La librairie utilise Fabric.js, Ant Design, et anime.js.

**IMPORTANT** : react-design-editor est une librairie client-only (Fabric.js
utilise le DOM). Il FAUT utiliser `dynamic import` avec `ssr: false` dans Next.js.

## Livrable 1 — Page /editeur-image

Créer `app/(app)/editeur-image/page.tsx` :

```tsx
'use client';
import dynamic from 'next/dynamic';

const ImageEditor = dynamic(
  () => import('@/components/features/image-editor/ImageEditorLayout'),
  { ssr: false }
);

export default function EditeurImagePage() {
  return <ImageEditor />;
}
```

## Livrable 2 — Composant ImageEditorLayout

Créer `components/features/image-editor/ImageEditorLayout.tsx` :

Le composant doit :
1. Initialiser react-design-editor (ou Fabric.js canvas directement si le package npm ne fonctionne pas)
2. Créer un canvas de 1080x1920 (format Story Instagram)
3. Pré-charger un template avec :
   - Fond turquoise (#7EBEC5) avec formes organiques
   - Texte "Judith Dufour Savard" en haut (font: Antic Slab via Google Fonts)
   - Texte "ACUPUNCTURE" sous le nom (font: Mulish, bold, caps)
   - Zone de texte éditable "TITRE DU BLOGUE" au centre (font: Antic Slab, grande taille)
   - Texte "GORENDEZVOUS.COM/LASOURCEENSOI" en bas
   - Texte "@LASOURCEENSOI" en bas
   - Logo La Source en Soi (image en bas à droite)
4. Toolbar avec les fonctions de base : texte, forme, image, couleur
5. Bouton "Exporter PNG" qui télécharge l'image en 1080x1920

## Livrable 3 — Chargement des Google Fonts

Charger Antic Slab et Mulish depuis Google Fonts pour qu'elles soient
disponibles dans l'éditeur :

```html
<link href="https://fonts.googleapis.com/css2?family=Antic+Slab&family=Mulish:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
```

Ajouter dans le `<head>` via `next/head` ou dans le layout de la page.

## Livrable 4 — Bouton d'export

Le bouton "Exporter PNG" doit :
1. Exporter le canvas en PNG 1080x1920
2. Optionnellement, générer aussi une version croppée 16:9 (1200x675) pour le blog
3. Retourner les deux blobs/URLs pour utilisation dans le BlogEditor

## Palette de couleurs La Source en Soi

```typescript
const PALETTE = {
  turquoise: '#7EBEC5',   // Couleur signature clinique
  menthe: '#AAD1D2',       // Fond clair
  sage: '#5C7A5F',         // Couleur Judith
  foret: '#3D5E40',        // Vert foncé
  charbon: '#212121',      // Texte foncé
  creme: '#F4F4F4',        // Fond clair
  blanc: '#FFFFFF',
};
```

## Contraintes

- Ne PAS modifier les pages/composants existants
- Ne PAS modifier le store, le layout principal, ni la navigation
- La page /editeur-image est une page standalone accessible par URL directe
- Utiliser dynamic import avec ssr: false (Fabric.js ne fonctionne pas côté serveur)
- Si react-design-editor npm ne fonctionne pas avec Next.js 14+, utiliser
  Fabric.js directement (`npm install fabric`) et construire un éditeur minimal
- Tester que la page charge sans erreur SSR
- Le canvas doit être responsive (s'adapter à la taille de l'écran) tout en
  gardant le ratio 9:16 pour le design

## Approche de fallback

Si `react-design-editor` ne s'installe pas ou a des conflits de dépendances :

1. Installer Fabric.js directement : `npm install fabric`
2. Créer un éditeur custom minimal avec :
   - Canvas Fabric.js 1080x1920
   - Toolbar custom : ajouter texte, ajouter image, changer couleur de fond
   - Objets draggables et redimensionnables
   - Export PNG via `canvas.toDataURL('image/png')`
3. Pré-charger le même template La Source en Soi

## Definition of Done

- [ ] La page /editeur-image charge sans erreur
- [ ] Le canvas affiche le template La Source en Soi (1080x1920)
- [ ] Les fonts Antic Slab et Mulish sont chargées et utilisées
- [ ] Le texte "TITRE DU BLOGUE" est éditable (double-clic pour modifier)
- [ ] L'utilisateur peut ajouter du texte, des formes et des images
- [ ] Le bouton "Exporter PNG" télécharge l'image en 1080x1920
- [ ] Pas d'erreur SSR (le composant est chargé côté client uniquement)
