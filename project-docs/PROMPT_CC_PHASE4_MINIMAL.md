# Mission CC : Phase 4 — Pages minimales (FAQ + Tarifs + Contact + Reserver)

## Contexte

Phases 1+2+3 terminees (commit `8822317`). Toutes les pages services, l'Accueil et les pages editoriales sont animees.

Cette derniere phase de propagation anime les pages minimales. Elles n'ont pas besoin d'effets visuels marques — juste un fade-in subtil au scroll pour rester coherentes avec le reste du site (qui a Lenis smooth scroll deja partout).

**4 pages a animer** :
- `/faq` (FAQ — Server Component avec firestore)
- `/tarifs` (Tarifs)
- `/contact` (Contact)
- `/reserver` (Reservation)

## ⚠️ AVERTISSEMENT — Piege firebase-admin (rappel)

`app/(public)/faq/page.tsx` est un **Server Component** qui utilise `getAllPublishedFaqs()` (via firebase-admin transitivement). **NE PAS** ajouter `'use client'` a ce fichier — meme bug que BlogPreview / Ressources / Blog index.

**Pattern correct** (deja utilise en Phase 3) :

```tsx
// app/(public)/faq/page.tsx — RESTE Server Component
import { getAllPublishedFaqs } from '@/lib/firestore/public-faq';
import Reveal from '../_components/animations/Reveal';        // CC importe dans SC, OK
import StaggerChildren from '../_components/animations/StaggerChildren';

export default async function FaqPage() {
  const faqs = await getAllPublishedFaqs();
  return (
    <main>
      <Reveal>
        <SectionHeading kicker="..." title="..." />
      </Reveal>
      <StaggerChildren stagger={0.06} className="space-y-4">
        {faqs.map(faq => (
          <details key={faq.slug}>...</details>
        ))}
      </StaggerChildren>
    </main>
  );
}
```

Les 3 autres pages (Tarifs, Contact, Reserver) n'ont pas de fetch firestore et peuvent etre converties en client components si necessaire (mais ce n'est meme pas requis — on peut juste importer les CC d'animation directement).

## Tarifs — ATTENTION Schema.org

`app/(public)/tarifs/page.tsx` contient un **JSON-LD Schema.org** (`MedicalBusiness` + `hasOfferCatalog` avec 3 Offers) qui a ete soigneusement audite par Judith hier. **NE PAS modifier ce JSON-LD**. C'est critique pour le SEO local.

## Mapping pattern par page

### FAQ (`app/(public)/faq/page.tsx`)
- RESTE Server Component (pas de `'use client'`)
- `Reveal` autour du heading principal
- `StaggerChildren stagger={0.06}` (rapide, car la liste peut etre longue) sur le grid/liste de questions
- **PAS de RevealWords** (Judith refuse)

### Tarifs (`app/(public)/tarifs/page.tsx`)
- Convertir en client OK si necessaire (pas de fetch server-side)
- `Reveal` sur le heading principal
- `StaggerChildren scale=0.92 y=28 stagger=0.12` + `HoverLift` sur les cards de tarifs
- **PAS de CountUp sur les prix** (Judith refuse — les chiffres affiches en statique : 100 $, 90 $, 35-60 $)
- **PAS de modification** du JSON-LD Schema.org

### Contact (`app/(public)/contact/page.tsx`)
- Convertir en client OK
- `Reveal` global sur le contenu principal
- Si le formulaire de contact est present, `Reveal delay={0.15}` autour pour le faire apparaitre apres le titre
- Si plusieurs blocs (formulaire + infos cliniques), `StaggerChildren` autour

### Reserver (`app/(public)/reserver/page.tsx`)
- Convertir en client OK
- `Reveal` global sur le bloc principal
- Si plusieurs sections (instructions + bouton/iframe), `StaggerChildren` ou `Reveal` en cascade

## Regles d'engagement (NE PAS DEVIER)

1. ⚠️ **JAMAIS** ajouter `'use client'` a `faq/page.tsx`. Reste Server Component.
2. ⚠️ **JAMAIS** modifier le JSON-LD Schema.org dans `tarifs/page.tsx`.
3. **JAMAIS** introduire CountUp, RevealWords, ScrollHighlightText, ligne horizontale.
4. **JAMAIS** introduire de `sectionRef` non attache.
5. **TOUJOURS** preserver le contenu textuel a 100%.
6. **TOUJOURS** utiliser les composants animation existants depuis `app/(public)/_components/animations/`.
7. Si tu detectes une page qui pourrait avoir un piege server-side (fetch async, import firestore) que tu n'avais pas prevu, **ARRETER** et signaler avant de convertir.

## Tests

```bash
npm run build   # CRITIQUE — doit reussir sans erreur "net"
npx tsc --noEmit
```

Test manuel :
- `localhost:3000/faq` : Reveal sur le titre + StaggerChildren sur les questions
- `localhost:3000/tarifs` : Reveal + StaggerChildren sur les cards (chiffres en statique)
- `localhost:3000/contact` : Reveal subtil sur le contenu
- `localhost:3000/reserver` : Reveal subtil sur le contenu
- Console DevTools : aucune erreur, aucun warning hydration
- prefers-reduced-motion : tout instantane

## Commit

Un seul commit a la fin :

```
feat(minimal): animations Phase 4 sur FAQ + Tarifs + Contact + Reserver

Pattern Reveal + StaggerChildren applique aux pages minimales du site :
- FAQ (Server Component preserve) : Reveal heading + StaggerChildren rapide sur liste
- Tarifs : Reveal heading + StaggerChildren + HoverLift sur cards
  (chiffres en statique, PAS de CountUp — Judith refuse)
- Contact : Reveal global sur le contenu
- Reserver : Reveal global

Decisions Judith respectees :
- Pas de CountUp sur les prix
- Pas de RevealWords
- Pas de ScrollHighlightText
- Pas de ligne horizontale qui se trace

Schema.org JSON-LD de Tarifs preserve a 100% (MedicalBusiness + 3 Offers).
FAQ reste Server Component (pas de regression firebase-admin).
Contenu textuel preserve a 100%.

Phase 4 terminee. Toutes les pages publiques sont desormais animees.
Reste Phase 5 (cleanup _lab/ + tests Lighthouse finaux).
```
