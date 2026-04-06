# Fixes UX — Cadre de sélection + Panneau de calques

## Rôle
Tu travailles sur la branche feature/image-editor du Hub Mon Acupunctrice V2.
L'éditeur d'images utilise Fabric.js v6 avec un canvas 1080x1920.

## FIX 1 — Cadre de sélection plus visible et professionnel

Le cadre autour des objets sélectionnés est trop discret. Rendre la sélection
plus visible style Canva :

### Style global (appliquer sur tous les objets du canvas) :
```typescript
// Dans ImageEditorCanvas.tsx, après création du canvas :
fabric.Object.prototype.set({
  borderColor: '#7EBEC5',          // Turquoise La Source en Soi
  borderScaleFactor: 2.5,          // Bordure plus épaisse
  cornerColor: '#7EBEC5',          // Coins turquoise
  cornerStrokeColor: '#FFFFFF',    // Contour blanc sur les coins
  cornerSize: 14,                  // Coins plus gros
  cornerStyle: 'circle',          // Coins ronds
  transparentCorners: false,       // Coins pleins (pas transparents)
  padding: 8,                      // Espace entre l'objet et le cadre
  rotatingPointOffset: 30,         // Bouton de rotation plus proche
  selectionBackgroundColor: 'rgba(126, 190, 197, 0.05)', // Fond léger
});

// Style du cadre de sélection multiple :
canvas.selectionColor = 'rgba(126, 190, 197, 0.1)';
canvas.selectionBorderColor = '#7EBEC5';
canvas.selectionLineWidth = 2;
```

### Bouton de rotation customisé :
- Remplacer le point de rotation par défaut par une icône de rotation visible
- Utiliser canvas.controls pour customiser le rendu du control de rotation
- Afficher un petit cercle avec une flèche de rotation au-dessus de l'objet

## FIX 2 — Panneau de calques (Layers Panel)

Ajouter un 7ème onglet "Calques" dans la sidebar (icône Squares2X2Icon ou 
ListBulletIcon de Heroicons).

### UI du panneau :
- Liste verticale de tous les objets du canvas, du plus haut au plus bas
- Chaque calque affiche :
  * Miniature de l'objet (petit aperçu ~40x40px)
  * Nom/type de l'objet (ex: "Texte: TITRE DU BLOGUE", "Image", "Rect", "SVG")
  * Icône œil pour masquer/afficher (obj.visible = true/false)
  * Icône cadenas pour verrouiller (obj.selectable = false, obj.evented = false)
- Le calque actif est surligné en turquoise
- Clic sur un calque → sélectionne l'objet sur le canvas

### Réorganisation (drag-and-drop) :
- Les calques sont réordonnables par drag-and-drop
- Utiliser le HTML5 Drag and Drop API (pas besoin de librairie externe)
- Quand un calque est déplacé, utiliser canvas.moveTo(obj, newIndex) 
  pour changer le z-index dans Fabric.js
- onDragStart, onDragOver (preventDefault), onDrop pour la logique

### Actions sur les calques :
- Boutons en bas du panneau :
  * ↑ Monter : canvas.bringForward(obj)
  * ↓ Descendre : canvas.sendBackwards(obj) 
  * ⬆ Tout devant : canvas.bringToFront(obj)
  * ⬇ Tout derrière : canvas.sendToBack(obj)
  * 🔒 Verrouiller/Déverrouiller le calque
  * 👁 Masquer/Afficher le calque
  * 🗑 Supprimer le calque

### Synchronisation avec le canvas :
- Écouter les événements Fabric.js pour maintenir la liste à jour :
  * canvas.on('object:added', updateLayers)
  * canvas.on('object:removed', updateLayers)
  * canvas.on('object:modified', updateLayers)
  * canvas.on('selection:created', highlightLayer)
  * canvas.on('selection:updated', highlightLayer)
  * canvas.on('selection:cleared', clearHighlight)

### Nommage automatique des calques :
```typescript
function getLayerName(obj: FabricObject): string {
  if (obj.type === 'textbox' || obj.type === 'i-text') {
    const text = (obj as Textbox).text || '';
    return `Texte: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`;
  }
  if (obj.type === 'image') return 'Image';
  if (obj.type === 'rect') return 'Rectangle';
  if (obj.type === 'circle') return 'Cercle';
  if (obj.type === 'path') return 'Forme';
  if (obj.type === 'group') return 'Groupe';
  return obj.type || 'Objet';
}
```

## Fichiers à créer/modifier :
- components/features/image-editor/panels/LayersPanel.tsx (NOUVEAU)
- components/features/image-editor/ImageEditorCanvas.tsx (styles de sélection)
- components/features/image-editor/Sidebar.tsx (ajouter onglet Calques)
- components/features/image-editor/MobileBar.tsx (ajouter onglet Calques mobile)

## Contraintes :
- Ne PAS modifier les fichiers existants en dehors de l'éditeur d'images
- TailwindCSS pour le style
- TypeScript strict
- Tester que le build passe
- Les calques du template background (fond, formes décoratives) doivent être
  verrouillés par défaut (selectable: false) mais visibles et déverrouillables
  dans le panneau de calques
