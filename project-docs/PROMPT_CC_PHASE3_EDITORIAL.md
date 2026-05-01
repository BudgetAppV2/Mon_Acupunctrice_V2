# Mission CC : Phase 3 — A propos + Ressources + Listings

## Contexte

Phases 1+2 terminees (commit `24017aa`). Pages services + Accueil totalement animes.

Cette mission anime les pages editoriales :
- `/a-propos` (5 sections)
- `/ressources/[slug]` (template ressource + composants associes)
- `/ressources` (listing index)
- `/blog` (listing index)
- `/blog/[slug]` (template article — optionnel pour cette mission)

## ⚠️ AVERTISSEMENT CRITIQUE — Piege firebase-admin

**3 fichiers font du server-side data fetching** avec `firebase-admin` (importe transitivement via `@/lib/firestore/public-ressources` ou `@/lib/firebase-admin`). Ces fichiers **NE PEUVENT PAS** etre convertis en client component, sinon erreur build :

```
Module not found: Can't resolve 'net'
```

**3 fichiers concernes** :
- `app/(public)/ressources/[slug]/page.tsx` — utilise `getRessourceBySlug`, `getAllPublishedRessources`, `getRelatedRessources`
- `app/(public)/ressources/page.tsx` — utilise `getAllPublishedRessources`
- `app/(public)/blog/page.tsx` — utilise `getAdminFirestore()`

**REGLE D'OR** : ces 3 fichiers DOIVENT rester Server Components. Pas de `'use client'`. Pas de `async` qui devient client.

**STRATEGIE** : Next.js 15 permet d'importer des Client Components (Reveal, StaggerChildren, HoverLift) DANS un Server Component. C'est le pattern recommande. Donc :

```tsx
// app/(public)/ressources/page.tsx — Server Component (pas de 'use client')
import { getAllPublishedRessources } from '@/lib/firestore/public-ressources';
import Reveal from '../_components/animations/Reveal';        // CC OK ici
import StaggerChildren from '../_components/animations/StaggerChildren';  // CC OK
import HoverLift from '../_components/animations/HoverLift';   // CC OK

export default async function RessourcesIndexPage() {
  const ressources = await getAllPublishedRessources();  // server-side fetch OK

  return (
    <section>
      <Reveal>
        <SectionHeading kicker="..." title="..." />
      </Reveal>
      <StaggerChildren className="grid ...">
        {ressources.map(r => (
          <HoverLift key={r.slug}>
            <RessourceCard {...r} />
          </HoverLift>
        ))}
      </StaggerChildren>
    </section>
  );
}
```

Cela compile parfaitement : le SC fait le fetch, importe les CC qui sont rendus cote client. Aucune lib server-only ne fuit cote client.

**Ne JAMAIS** ajouter `'use client'` aux 3 fichiers ci-dessus.
**Ne JAMAIS** convertir leur signature `async` en non-async pour eviter le `'use client'`.
**Ne JAMAIS** importer firebase-admin/firestore dans un fichier marque `'use client'`.

## A propos (5 sections)

Sections concernees (pas de fetch firestore, conversions safe) :

```
app/(public)/_sections/AboutHeroSection.tsx
app/(public)/_sections/AboutParcoursSection.tsx
app/(public)/_sections/AboutPratiqueSection.tsx
app/(public)/_sections/AboutSpecialitesSection.tsx
app/(public)/_sections/AboutCliniqueSection.tsx
```

(Note : il y a aussi `AboutSection.tsx` mais c'est la mini-bio sur l'Accueil, deja animee Phase 2 — ne pas toucher.)

Mapping pattern (sources de verite : sections Fertilite/Pediatrie corrigees) :

| Section | Pattern |
|---------|---------|
| AboutHeroSection | Reveal sur photo + Reveal cascade sur texte (PAS clip-path rideau — page secondaire, pas critique LCP, mais reveal simple suffit) |
| AboutParcoursSection | Reveal scaleFrom sur SectionNumber + Reveal heading + StaggerChildren si grid de parcours/timeline |
| AboutPratiqueSection | Reveal scaleFrom + heading + paragraphes (pattern Bio) |
| AboutSpecialitesSection | StaggerChildren + HoverLift sur les cards specialites |
| AboutCliniqueSection | Reveal sur les paragraphes + StaggerChildren si grid de cliniques |

**Decisions Judith strictes** :
- ❌ PAS de RevealWords sur la bio A propos (Judith refuse)
- ❌ PAS de ScrollHighlightText
- ❌ PAS de ligne horizontale qui se trace
- ❌ PAS de CountUp

## Ressources [slug] — template ressource

Fichier : `app/(public)/ressources/[slug]/page.tsx` (RESTE Server Component).

Strategie : importer `Reveal`, `StaggerChildren`, `HoverLift` directement dans le Server Component. Animer les sections internes (intro, judithApproach, whatToExpect, protocolSection, scienceSection, mechanismSection, testimonial, faqEntries).

```tsx
// Pas de 'use client' — RESTE Server Component
import Reveal from '../../_components/animations/Reveal';
import StaggerChildren from '../../_components/animations/StaggerChildren';
// ... reste des imports server-side

export default async function RessourcePage({ params }) {
  const ressource = await getRessourceBySlug(params.slug);
  // ...

  return (
    <article>
      {/* Hero ressource */}
      <Reveal>
        <header>...</header>
      </Reveal>

      {/* Sections de contenu, chacune wrappee */}
      {ressource.introSection && (
        <Reveal>
          <section>
            <MarkdownRenderer content={ressource.introSection} />
          </section>
        </Reveal>
      )}

      {/* Pareil pour judithApproach, whatToExpect, etc. */}

      {/* FAQ entries en stagger */}
      <StaggerChildren>
        {ressource.faqEntries?.map(faq => (
          <div key={faq.question}>...</div>
        ))}
      </StaggerChildren>
    </article>
  );
}
```

**Decisions Judith strictes** sur Ressources :
- ❌ PAS de ScrollHighlightText sur les sections scientifiques (Judith refuse)
- Juste Reveal simple — texte apparait au scroll en fade subtil, c'est suffisant pour les contenus medicaux denses

## Listings (Ressources index, Blog index)

### `app/(public)/ressources/page.tsx` (RESTE Server Component)

```tsx
// Pas de 'use client'
import { getAllPublishedRessources } from '@/lib/firestore/public-ressources';
import Reveal from '../_components/animations/Reveal';
import StaggerChildren from '../_components/animations/StaggerChildren';
import HoverLift from '../_components/animations/HoverLift';

export default async function RessourcesIndexPage() {
  const ressources = await getAllPublishedRessources();

  return (
    <section>
      <Reveal>
        <SectionHeading ... />
      </Reveal>
      <StaggerChildren scale={0.92} y={28} stagger={0.12} className="grid ...">
        {ressources.map(r => (
          <HoverLift key={r.slug}>
            <RessourceCard {...r} />
          </HoverLift>
        ))}
      </StaggerChildren>
    </section>
  );
}
```

### `app/(public)/blog/page.tsx` (RESTE Server Component)

Meme pattern :
```tsx
// Pas de 'use client'
import { getAdminFirestore } from '@/lib/firebase-admin';
import Reveal from '../_components/animations/Reveal';
import StaggerChildren from '../_components/animations/StaggerChildren';
import HoverLift from '../_components/animations/HoverLift';

// ... fetch articles

return (
  <section>
    <Reveal>
      <SectionHeading ... />
    </Reveal>
    <StaggerChildren className="grid ...">
      {articles.map(a => (
        <HoverLift key={a.slug}>
          <BlogCard {...a} />
        </HoverLift>
      ))}
    </StaggerChildren>
  </section>
);
```

### `app/(public)/blog/[slug]/page.tsx` — optionnel

Si le temps le permet, animer les sections du contenu d'article avec Reveal. Sinon, sauter pour cette mission.

## Regles d'engagement (NE PAS DEVIER)

1. ⚠️ **JAMAIS** ajouter `'use client'` a `ressources/[slug]/page.tsx`, `ressources/page.tsx`, `blog/page.tsx`. Ils restent Server Components.
2. ⚠️ **JAMAIS** importer firebase-admin/firestore dans un fichier `'use client'`.
3. **JAMAIS** introduire CountUp, RevealWords, ScrollHighlightText, ligne horizontale.
4. **JAMAIS** introduire de `sectionRef` non attache au JSX.
5. **TOUJOURS** preserver le contenu textuel a 100%. Les contenus Ressources sont fetches depuis Firestore, ne pas modifier la structure des donnees.
6. **TOUJOURS** utiliser les composants animation existants depuis `app/(public)/_components/animations/`.
7. Si une section de Ressources contient du contenu absent (champ vide), le `<Reveal>` doit gerer le cas null/undefined gracieusement.

## Tests

```bash
npm run build   # CRITIQUE — doit reussir sans erreur "net"
npx tsc --noEmit
```

Test manuel :
- `localhost:3000/a-propos` : sections animees au scroll
- `localhost:3000/ressources` : grid de cards en stagger + hover lift
- `localhost:3000/ressources/acupuncture-fertilite-montreal` (ou autre ressource publiee) : sections de contenu en Reveal
- `localhost:3000/blog` : grid d'articles en stagger + hover lift
- Console DevTools : aucune erreur, aucun warning hydration
- prefers-reduced-motion : tout instantane

**Si `npm run build` echoue avec erreur `net` ou `firebase-admin`** : c'est qu'un fichier server-side a ete converti en client. ARRETER, identifier le fichier coupable, retirer `'use client'`.

## Commit

Un seul commit a la fin :

```
feat(editorial): animations Phase 3 sur A propos + Ressources + Listings

Pattern Reveal/StaggerChildren/HoverLift applique aux pages editoriales.

Strategie : les 3 pages avec server-side data fetching (ressources/[slug],
ressources index, blog index) restent Server Components. Les composants
d animation client sont importes directement dans les SC — pattern Next.js 15.

Sections animees :
- A propos : Hero, Parcours, Pratique, Specialites, Clinique
- Ressources [slug] : intro, judithApproach, whatToExpect, protocolSection,
  scienceSection, mechanismSection, testimonial, faqEntries
- Ressources index : grid de cards en stagger + hover lift
- Blog index : grid d articles en stagger + hover lift

Decisions Judith respectees :
- Pas de RevealWords sur les bios
- Pas de ScrollHighlightText sur les paragraphes scientifiques
- Pas de CountUp
- Pas de ligne horizontale qui se trace

Aucune page server-side n a ete convertie en client — pas de regression
firebase-admin (Module not found: net).

Contenu textuel preserve a 100%.
```
