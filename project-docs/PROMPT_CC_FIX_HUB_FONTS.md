# Mission CC : Fix fuite Google Fonts du Hub vers site public

## Probleme

`app/(app)/layout.tsx` charge **11 Google Fonts** dans un `useEffect` (ligne ~55) :
- Archivo Black, Caveat, Cormorant Garamond, DM Sans, Kalam, Libre Baskerville,
  Manrope, Oswald, Playfair Display, Poppins, Space Grotesk

Le code injecte un `<link rel="stylesheet">` dans `document.head` mais **ne nettoie JAMAIS au unmount**. Quand un user navigue depuis le Hub (route group `(app)`) vers le site public (route group `(public)`) via une soft navigation Next.js, le `<link>` persiste dans `<head>` et **ralentit toutes les pages publiques**.

Ces 11 fonts sont en fait necessaires UNIQUEMENT pour :
- `/editeur-image` (Fabric.js avec presets Canva-derived)
- `/blogue` (BlogEditor avec presets cover/story)

Les autres pages du Hub (admin, dashboard, etc.) n'en ont pas besoin.

## Solution proposee

**Strategie** : retirer le chargement global dans le layout `(app)` et le scoper aux 2 pages qui en ont reellement besoin, avec cleanup au unmount.

### Etape 1 : Creer un hook reutilisable

Creer `lib/hooks/useHubFonts.ts` :

```tsx
'use client';

import { useEffect } from 'react';

const HUB_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Caveat:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;700&family=Kalam:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;600;700&family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;600;700;900&family=Space+Grotesk:wght@400;500;700&display=swap';

const ATTR = 'data-hub-fonts';

/**
 * Charge les 11 Google Fonts utilisees par les editeurs (image + blog).
 * Cleanup automatique au unmount pour eviter la fuite vers le site public
 * lors de soft navigations Next.js.
 *
 * Usage : appeler dans les composants editeur uniquement (editeur-image, blogue).
 */
export function useHubFonts() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Si deja charge par un autre composant, ne pas re-injecter (counting via attribut)
    const existing = document.querySelector(`link[${ATTR}]`);
    if (existing) {
      // Incrementer le compteur de refs
      const count = parseInt(existing.getAttribute('data-ref-count') || '0', 10);
      existing.setAttribute('data-ref-count', String(count + 1));
      return () => {
        const newCount = parseInt(existing.getAttribute('data-ref-count') || '1', 10) - 1;
        if (newCount <= 0) {
          existing.remove();
        } else {
          existing.setAttribute('data-ref-count', String(newCount));
        }
      };
    }

    // Premiere injection
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HUB_FONTS_URL;
    link.setAttribute(ATTR, '');
    link.setAttribute('data-ref-count', '1');
    document.head.appendChild(link);

    return () => {
      const el = document.querySelector(`link[${ATTR}]`);
      if (!el) return;
      const count = parseInt(el.getAttribute('data-ref-count') || '1', 10) - 1;
      if (count <= 0) {
        el.remove();
      } else {
        el.setAttribute('data-ref-count', String(count));
      }
    };
  }, []);
}
```

Le compteur de refs gere le cas ou les 2 pages (editeur-image et blogue) sont chargees en parallele dans des onglets differents — pas necessaire en pratique mais protege contre les bugs subtils.

### Etape 2 : Retirer le useEffect du layout (app)

Dans `app/(app)/layout.tsx`, supprimer le useEffect qui injecte les fonts (lignes ~52-66 environ — chercher le commentaire "Charge Google Fonts uniquement sur les pages Hub").

Remplacer le bloc commente + le useEffect par RIEN (suppression complete).

### Etape 3 : Appeler useHubFonts dans les 2 pages concernees

`app/(app)/editeur-image/page.tsx` :
- Ajouter `import { useHubFonts } from '@/lib/hooks/useHubFonts';`
- Convertir en client component si pas deja (`'use client'` en top)
- Appeler `useHubFonts()` dans le composant

Note : `editeur-image/page.tsx` a deja un `<style>{@import url('https://fonts.googleapis.com/css2?family=Antic+Slab&family=Mulish:wght@400;600;700;800&display=swap');}</style>`. Garder ce style tel quel (Antic Slab + Mulish sont des fonts SUPPLEMENTAIRES de l'editeur, pas dans la liste des 11). Mais verifier que ce `<style>` ne fuit pas non plus — etant inline dans le composant page, il devrait etre scoped a la page.

Apres reflexion : le `<style>{@import url(...)}</style>` est rendu dans le DOM quand le composant est mount. Quand on navigue ailleurs, le composant unmount, donc le `<style>` est retire automatiquement. Pas de fuite. OK.

`app/(app)/blogue/page.tsx` :
- Si la page utilise BlogEditor avec les memes presets que l'image editor, ajouter aussi `useHubFonts()`. Sinon, ne pas l'ajouter.
- Verifier d'abord avec une recherche dans le code de BlogEditor : utilise-t-il les fonts Archivo Black, Caveat, etc. ?

```bash
grep -rE "Archivo Black|Caveat|Manrope|Oswald|Poppins" components/features/blog/ 2>&1
```

Si oui : ajouter `useHubFonts()` dans `app/(app)/blogue/page.tsx`.
Si non : ne pas l'ajouter, BlogEditor utilise probablement seulement Antic Slab + Mulish (chargees inline dans son propre style).

## Tests apres fix

```bash
npm run build   # Doit reussir
npx tsc --noEmit
```

Test manuel :
1. Demarrer le serveur dev : `npm run dev`
2. Ouvrir Chrome DevTools, onglet Network, filtre "Font" ou "fonts.googleapis"
3. Naviguer sur `http://localhost:3000/` (site public)
4. Verifier qu'AUCUNE requete vers `fonts.googleapis.com` avec les 11 fonts du Hub n'apparait
5. Seules Cormorant Garamond et Inter (chargees via next/font/google) doivent apparaitre, et elles sont self-hosted par Next.js (donc en realite via `_next/static/media/...`)
6. Naviguer sur `http://localhost:3000/editeur-image` (apres auth)
7. Verifier que les 11 fonts SE CHARGENT bien
8. Re-naviguer vers le site public
9. **CRITIQUE** : verifier que les fonts du Hub ont disparu du `<head>` (chercher `data-hub-fonts` dans Elements)

Test Lighthouse :
```bash
rm -rf .next && npm run build
nohup npx next start -p 3001 > /tmp/next_prod.log 2>&1 &
sleep 6
npx lighthouse http://localhost:3001/ --output=json --output-path=/tmp/lh_after_fix.json --only-categories=performance --chrome-flags="--headless --no-sandbox" --quiet
node -e "const r = require('/tmp/lh_after_fix.json'); console.log('Perf:', Math.round(r.categories.performance.score*100), 'LCP:', r.audits['largest-contentful-paint'].displayValue);"
pkill -f "next start"
```

Avant fix : Performance 73, LCP 5.9s sur Accueil.
**Cible apres fix** : Performance >= 80, LCP <= 4.5s (gain attendu : -1s sur LCP grace au chargement reseau plus rapide).

## Commit

Un seul commit :

```
fix(hub): isole les Google Fonts de l'editeur d'image au scope correct

Probleme : app/(app)/layout.tsx chargeait 11 Google Fonts globalement via
useEffect et ne nettoyait jamais au unmount. Lors de soft navigations
Next.js depuis le Hub vers le site public, le <link rel="stylesheet">
persistait dans le <head> et ralentissait les pages publiques.

Fix :
- Nouveau hook lib/hooks/useHubFonts.ts avec ref counting et cleanup au unmount
- Retrait du useEffect global dans app/(app)/layout.tsx
- Appel de useHubFonts() uniquement dans les 2 pages qui en ont besoin :
  app/(app)/editeur-image/page.tsx (Fabric.js avec presets Canva)
  app/(app)/blogue/page.tsx (si BlogEditor utilise ces fonts)

Resultat :
- Site public charge plus que Cormorant + Inter (via next/font/google)
- Hub editor charge ses fonts uniquement quand necessaire
- Cleanup au unmount evite toute fuite future via soft navigation

Lighthouse Accueil avant/apres : Performance 73 -> 80+, LCP 5.9s -> 4.5s.
```

## Plan B si bug

Si BlogEditor utilise vraiment toutes les 11 fonts ET la page blogue est lourde :
- Garder useHubFonts dans les 2 pages
- Ou alternativement, creer un sous-layout `app/(app)/editeur/layout.tsx` qui appelle useHubFonts (si les editeurs sont regroupes sous ce path)

Si retrait du useEffect du layout (app) casse autre chose (composant de toolbar global qui utilise une de ces fonts) :
- Identifier le composant coupable
- Soit lui ajouter un useHubFonts local, soit garder un sous-ensemble minimal de fonts dans le layout

## Point de retour

Si quelque chose tourne mal :
```bash
git reset --hard 9ac6afa  # commit du merge final main
```
