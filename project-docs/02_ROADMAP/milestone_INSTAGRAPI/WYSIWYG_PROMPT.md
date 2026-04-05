# Milestone WYSIWYG — Éditeur rich text blog + preview visuel

## Contexte

Le BlogEditor actuel utilise un `<textarea>` brut avec des conventions markdown
(`#` pour titres, `-` pour listes). Judith ne connaît pas le markdown — elle doit
pouvoir éditer visuellement comme dans Wix ou Canva. Le bouton "Aperçu" actuel
montre un rendu basique mais pas une vraie preview du blog avec son image.

Ce milestone remplace le textarea par un éditeur WYSIWYG tiptap et améliore
le mode Aperçu pour montrer le blog tel qu'il apparaîtra sur le site Wix,
incluant l'image de couverture uploadée.

## Stack

Next.js 15 App Router, TypeScript, Tailwind, tiptap (open source).

Packages à installer :
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-underline
```

## Fichiers à lire AVANT de commencer

- `CLAUDE.md` → Règles du projet
- `components/features/blog/BlogEditor.tsx` → L'éditeur actuel (textarea + preview)
- `lib/utils/ricosConverter.ts` → Convertit le texte markdown en Ricos JSON pour Wix
- `app/api/blog/publish/route.ts` → Appelle `textToRicos()` puis publie sur Wix
- `lib/hooks/useBlogArticles.ts` → Hook `usePublishBlog` qui poste vers `/api/blog/publish`

## Livrable 1 — Composant TiptapEditor

Créer `components/features/blog/TiptapEditor.tsx` — un composant WYSIWYG réutilisable.

### Extensions à inclure

```typescript
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
```

StarterKit inclut déjà : paragraphe, heading (H1-H6), bold, italic, bulletList,
orderedList, blockquote, horizontalRule, codeBlock, history (undo/redo).

### Toolbar — Barre d'outils minimaliste

La toolbar doit être simple et mobile-first (Judith n'est pas designer).
Seulement les boutons essentiels pour un blog d'acupuncture :

```
┌──────────────────────────────────────────────────────┐
│  [B] [I] [U] │ [H2] [H3] │ [• liste] │ [Undo] [Redo]│
└──────────────────────────────────────────────────────┘
```

- **B** (bold), **I** (italic), **U** (underline)
- **H2** (titre section), **H3** (sous-titre)
- **Liste à puces**
- **Undo / Redo**

Utiliser des icônes Heroicons :
- Bold : `<span class="font-bold text-sm">B</span>` (pas d'icône heroicon pour bold)
- Italic : `<span class="italic text-sm">I</span>`
- Underline : `<span class="underline text-sm">U</span>`
- H2 : `<span class="text-sm font-bold">H2</span>`
- H3 : `<span class="text-sm font-bold">H3</span>`
- Liste : utiliser un simple `<span>` avec "•≡" ou similaire
- Undo : `ArrowUturnLeftIcon` de Heroicons
- Redo : `ArrowUturnRightIcon` de Heroicons

Chaque bouton toggle le style actif. Le bouton actif a un fond `bg-sage/20`.
Style boutons : `p-1.5 rounded` avec hover `hover:bg-gray-100`.
La toolbar est sticky en haut de l'éditeur.

### Props

```typescript
interface TiptapEditorProps {
  content: string;              // Contenu initial en HTML
  onChange: (html: string) => void;  // Callback quand le contenu change
  placeholder?: string;
}
```

### Style de l'éditeur

L'éditeur doit ressembler au textarea actuel : fond blanc, bord gris arrondi,
padding interne. Le contenu doit utiliser des styles prose (via @tailwindcss/typography
ou styles manuels) pour que les titres, listes, etc. soient visibles pendant l'édition.

Styles prose manuels (ne pas installer @tailwindcss/typography) :

```css
/* Appliquer dans le composant via className sur EditorContent */
.tiptap-content h2 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.tiptap-content h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
.tiptap-content p { margin-bottom: 0.75rem; }
.tiptap-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.tiptap-content li { margin-bottom: 0.25rem; }
.tiptap-content strong { font-weight: 700; }
.tiptap-content em { font-style: italic; }
.tiptap-content u { text-decoration: underline; }
```

## Livrable 2 — Remplacer le textarea dans BlogEditor.tsx

### Modifications

1. Remplacer le `<textarea>` par `<TiptapEditor>`
2. Le state `content` devient du HTML au lieu de texte brut
3. Le bouton "Aperçu" affiche maintenant une vraie preview du blog (voir Livrable 3)

### Conversion HTML → texte pour l'API

L'API `/api/blog/publish` attend du texte avec des conventions markdown (`#`, `-`).
Le `ricosConverter.ts` parse ce texte en Ricos JSON.

Ajouter une fonction `htmlToMarkdownText(html: string): string` dans
`lib/utils/ricosConverter.ts` qui convertit le HTML de tiptap en texte markdown :

```typescript
export function htmlToMarkdownText(html: string): string {
  // Utiliser un DOMParser (côté client) ou une regex simple
  // <h2>Titre</h2> → "# Titre"
  // <h3>Sous-titre</h3> → "## Sous-titre"
  // <ul><li>item</li></ul> → "- item"
  // <p>texte</p> → "texte"
  // <strong>bold</strong> → le texte brut (Wix ne supporte pas le bold inline via texte)
  // <em>italic</em> → le texte brut
  // Retourner le texte markdown que textToRicos() peut parser
}
```

Ainsi l'API existante n'a pas besoin de changer — on convertit HTML → markdown text
avant d'envoyer au backend. Le `textToRicos()` continue de fonctionner tel quel.

### Passage de coverImageUrl

Le BlogEditor a maintenant un champ `coverImageUrl` (ajouté dans le milestone CANVA_IMAGE).
S'assurer que ce champ est bien passé dans `onPublish()`.

## Livrable 3 — Preview visuel du blog

Le mode "Aperçu" actuel affiche le contenu en texte brut dans un `<div>`.
Le remplacer par une vraie preview qui ressemble au site Wix de Judith :

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Image de couverture 16:9 — pleine largeur]    │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Categorie                                      │
│                                                 │
│  Titre de l'article                             │
│  (gros, gras, 1.25rem)                          │
│                                                 │
│  Judith Dufour-Savard · 4 avr. 2026             │
│                                                 │
│  ─────────────────────────────                  │
│                                                 │
│  Contenu rendu en HTML (output de tiptap)        │
│  avec titres H2, H3, listes, bold, italic       │
│                                                 │
│  ─────────────────────────────                  │
│                                                 │
│  Questions fréquentes                           │
│  Q: ...                                         │
│  R: ...                                         │
│                                                 │
│  ─────────────────────────────                  │
│                                                 │
│  Prendre rendez-vous :                          │
│  gorendezvous.com/lasourceensoi                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Détails de la preview

- **Image de couverture** : si `coverImageUrl` existe, afficher en pleine largeur
  avec `aspect-ratio: 16/9`, `object-cover`, `rounded-xl`. Sinon ne rien afficher.
- **Catégorie** : petit badge sage `text-[10px] bg-sage/10 text-sage px-2 py-0.5 rounded-full`
- **Titre** : `text-lg font-bold text-gray-900`
- **Auteur + date** : `text-xs text-gray-400`, date formatée en français
- **Contenu** : rendu directement depuis le HTML de tiptap avec `dangerouslySetInnerHTML`
  et les styles prose appliqués (même classes CSS que dans l'éditeur)
- **FAQ** : si des FAQs sont générées, les afficher sous le contenu
- **CTA** : le lien GoRendezVous en bas

### Transition Éditer ↔ Aperçu

Le bouton toggle en haut à droite alterne entre les deux modes.
Le contenu tiptap est préservé quand on passe en aperçu et vice-versa.
L'aperçu est dans un container `bg-white rounded-xl p-4` qui simule une page web.

## Contraintes

- Ne PAS modifier `/api/blog/publish/route.ts` — la conversion se fait côté client
- Ne PAS modifier `ricosConverter.ts` (le textToRicos existant) — ajouter seulement htmlToMarkdownText
- Ne PAS installer @tailwindcss/typography — utiliser des styles manuels
- Ne PAS modifier le cron ou les composants de publication
- Le composant TiptapEditor doit être < 150 lignes
- Le BlogEditor modifié doit rester < 150 lignes (extraire la preview si nécessaire)
- Mobile first 375px
- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production
- `'use client'` sur tous les composants qui utilisent tiptap

## Definition of Done

- [ ] `npm install` des packages tiptap réussit sans erreur
- [ ] `TiptapEditor.tsx` existe avec toolbar (B, I, U, H2, H3, liste, undo, redo)
- [ ] Le textarea dans BlogEditor est remplacé par TiptapEditor
- [ ] Taper du texte dans l'éditeur montre les titres, listes et bold en temps réel
- [ ] `htmlToMarkdownText()` existe dans `ricosConverter.ts`
- [ ] Le bouton "Publier sur Wix" envoie du texte markdown (pas du HTML) au backend
- [ ] Le mode "Aperçu" montre l'image de couverture si elle existe
- [ ] Le mode "Aperçu" montre le contenu formaté (titres, listes, bold)
- [ ] Le mode "Aperçu" montre les FAQ si générées
- [ ] Alterner Éditer ↔ Aperçu préserve le contenu
- [ ] L'éditeur fonctionne correctement sur mobile 375px
- [ ] La toolbar ne déborde pas sur mobile
