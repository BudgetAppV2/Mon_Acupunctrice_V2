# GEMINI_TASK_UX_REFINEMENT.md
# Tâche de raffinement UX/UI
# Usage: donner à Gemini CLI ou Gemini Studio

---

Relis le fichier project-docs/01_PRODUCT/UX_UI_GUIDELINES.md
que tu as déjà créé, et remplace-le par une version complètement
réécrite selon les critères suivants.

## Direction design — Non-négociable

### Style
- **SaaS premium** — comme Linear, Notion, Vercel dashboard
- **Instagram/Meta** — navigation bottom tabs, gestures, cards
- **Apple iOS** — SF Pro, spacing généreux, blur effects, haptics
- **PWA full screen** — pas de barre de navigateur visible, standalone mode
- **Mobile first absolu** — toute décision de design part du 375px iPhone

### Ce que ça signifie concrètement
- Fond sombre ou blanc très propre — pas de gris ternes
- Typographie : SF Pro (system font iOS) comme police principale
- Coins arrondis généreux (12-16px standard, 20-24px pour les cards)
- Ombres subtiles (pas de box-shadow lourdes)
- Backdrop blur sur les overlays et headers (comme iOS)
- Bottom navigation bar (comme Instagram) — jamais de sidebar sur mobile
- Safe areas respectées (iPhone notch + home indicator)
- Animations fluides 60fps — transitions de pages naturelles

### Icônes — Règle stricte
**Bibliothèque unique : SF Symbols (via Heroicons qui en est inspiré)**

- Utiliser **Heroicons** (MIT, parfaitement aligné avec le style Apple/Meta)
- Style : `outline` pour la navigation inactive, `solid` pour l'état actif
- Jamais mélanger des icônes de sources différentes
- Jamais d'emojis comme icônes d'interface
- Taille standard : 24px (nav), 20px (inline), 28px (actions primaires)

### PWA
Documenter dans les guidelines :
```json
// manifest.json requis
{
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#000000",
  "theme_color": "#000000"
}
```
- `viewport-fit=cover` pour iPhone (notch)
- `apple-mobile-web-app-capable` meta tags
- Splash screen iOS

---

## Palette de couleurs — Raffinement

Garder sage/sand du proof of concept MAIS les adapter au style premium :

### Mode clair (défaut)
```
Background primary:   #FFFFFF
Background secondary: #F5F5F7  (gris Apple)
Surface:              #FFFFFF avec border #E5E5EA
Text primary:         #1D1D1F  (noir Apple)
Text secondary:       #6E6E73  (gris secondaire Apple)
Text tertiary:        #AEAEB2

Accent (sage):        #5C7A5F  (vert acupuncture)
Accent light:         #E8F0E9
Accent dark:          #3D5C40

Danger:               #FF3B30  (rouge iOS)
Warning:              #FF9500  (orange iOS)
Success:              #34C759  (vert iOS)
```

### Statuts de contenu
```
Idée:                 #007AFF  (bleu iOS)
Planifié:             #AF52DE  (violet iOS)
Filmé:                #FF9500  (orange iOS)
En montage:           #FF3B30  (rouge iOS)
Prêt:                 #34C759  (vert iOS)
Publié:               #5C7A5F  (sage — couleur brand)
```

---

## Typographie

```
Font principale:  -apple-system, BlinkMacSystemFont, 'SF Pro Display'
                  → system font iOS/macOS, pas besoin d'import

Tailles:
  Display:    34px / bold    → Titres de section majeure
  Title 1:    28px / bold    → Titre de page
  Title 2:    22px / semibold → Sous-titre
  Title 3:    20px / semibold → Card title
  Headline:   17px / semibold → Label important
  Body:       17px / regular  → Texte courant
  Callout:    16px / regular  → Description
  Subhead:    15px / regular  → Métadonnées
  Footnote:   13px / regular  → Caption, hints
  Caption:    12px / regular  → Très petit

Letter-spacing: -0.02em sur les gros titres (style Apple)
Line-height:    1.4 standard, 1.2 pour les titres
```

---

## Composants de base — Style iOS/Meta

### Navigation (Bottom Tab Bar)
```
Position: fixed bottom-0, full width
Height: 83px (49px bar + 34px safe area)
Background: rgba(255,255,255,0.85) backdrop-blur-xl
Border-top: 1px solid rgba(0,0,0,0.1)
Tabs: 4-5 maximum
Active: icône solid + couleur accent + label
Inactive: icône outline + gris tertiary
```

Onglets V1 :
- 💡 Idées (outline/solid lightbulb)
- 📅 Calendrier (outline/solid calendar)
- ⚡ Blitz (outline/solid bolt)
- 👤 Profil (outline/solid user)

### Cards
```
Background: #FFFFFF
Border-radius: 16px
Shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)
Padding: 16px
Border: 1px solid rgba(0,0,0,0.06)
```

### Boutons
```
Primary:
  Background: accent (#5C7A5F)
  Text: white, 17px semibold
  Height: 50px
  Border-radius: 14px
  Width: full-width sur mobile

Secondary:
  Background: #F5F5F7
  Text: text-primary, 17px semibold
  Height: 50px
  Border-radius: 14px

Destructive:
  Background: #FF3B30
  Text: white

Icon button:
  Size: 40x40px
  Background: #F5F5F7
  Border-radius: 12px
```

### Inputs
```
Height: 50px
Background: #F5F5F7
Border-radius: 12px
Border: none (focus: 2px solid accent)
Padding: 0 16px
Font: 17px body
Placeholder: text-tertiary
```

### Modal / Bottom Sheet
```
Présentation: slide-up depuis le bas (comme iOS)
Background: white
Border-radius: 20px 20px 0 0
Handle: 4px x 36px, gris, centré en haut
Backdrop: rgba(0,0,0,0.4) blur
```

---

## Animations et transitions

```
Page transitions:     slide horizontal (push/pop comme iOS)
Modal in:             slide-up + fade backdrop (300ms ease-out)
Modal out:            slide-down + fade (250ms ease-in)
Tab switch:           cross-fade (150ms)
Button press:         scale(0.97) (100ms) — haptic feedback
Card press:           scale(0.99) opacity(0.9) (100ms)
List item appear:     fade-in + translateY(8px) staggered

Durées standard:
  Micro:   100ms  (press states)
  Fast:    200ms  (tooltips, small transitions)
  Normal:  300ms  (pages, modals)
  Slow:    500ms  (loading states)

Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94) (iOS spring approx)
```

---

## Empty States

Ton : encourageant, jamais négatif, comme un coach bienveillant.

```
Banque d'idées vide:
  Icône: lightbulb (heroicon, 48px, sage color)
  Titre: "Ta première idée t'attend"
  Sous-titre: "Chaque grand contenu commence par une idée.
               Lance-toi!"
  CTA: "Ajouter une idée"

Calendrier vide:
  Icône: calendar (48px)
  Titre: "Aucun contenu planifié"
  Sous-titre: "Planifie ta semaine pour rester constante."
  CTA: "Planifier du contenu"

Blitz vide:
  Icône: bolt (48px)
  Titre: "Prête pour une session?"
  Sous-titre: "Sélectionne tes idées et filme tout d'un coup."
  CTA: "Démarrer une session"
```

---

## Messages d'erreur — Ton humain

```
Connexion échouée:    "Oops, la connexion n'a pas marché.
                       Réessaie dans un instant."

Publication échouée:  "Instagram n'a pas accepté la publication.
                       Vérifie ta connexion et réessaie."

Export échoué:        "L'export n'a pas fonctionné.
                       Ta vidéo est sauvegardée, pas de panique."

Champs manquants:     "On a besoin d'un titre pour continuer."
```

---

## PWA — Spécifications techniques

Documenter les meta tags requis dans `app/layout.tsx` :
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="viewport" content="width=device-width, initial-scale=1,
      viewport-fit=cover">
<link rel="apple-touch-icon" href="/icon-192.png">
```

`manifest.json` :
```json
{
  "name": "Mon Acupunctrice Hub",
  "short_name": "Acupunctrice",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFFFFF",
  "theme_color": "#5C7A5F",
  "start_url": "/calendrier",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Ce qu'on n'utilise PAS

- Pas d'emojis comme icônes d'interface (seulement Heroicons)
- Pas de Material Design icons (Google style)
- Pas de Font Awesome
- Pas de gradients lourds (subtils uniquement si nécessaire)
- Pas de box-shadows épaisses
- Pas de borders colorées sur les cards (juste rgba subtil)
- Pas de couleurs vives criardes
- Pas de Comic Sans ni de polices decoratives
- Pas de sidebar sur mobile
