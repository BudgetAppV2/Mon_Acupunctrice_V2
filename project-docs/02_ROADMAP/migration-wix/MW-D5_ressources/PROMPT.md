# MW-D5 — Pages ressources (/ressources et /ressources/[slug])

**One-shot prompt pour Claude Code.** Lis tout avant de commencer.

---

## Contexte

Milestone SEO le plus important restant. Les 5 ressources sont deja en Firestore (collection `ressources`, status `published`), importees en MW-D3. Chaque ressource fait ~2500 mots de contenu SEO-optimise avec 8 FAQ, etudes scientifiques citees, et approche hub-and-spoke.

Les pages services MW-C3a/b/c/d ont deja du cross-linking vers ces URLs :
- /ressources/acupuncture-fertilite-montreal
- /ressources/acupuncture-grossesse-montreal
- /ressources/acupuncture-pediatrique-enfants-bebes
- /ressources/acupuncture-sociale-montreal
- (5e : acupuncture-sante-mentale-anxiete, pas reference par pages services car pas de pilier "sante mentale" dans la nav — pilier `transversal`)

**Actuellement** : `/ressources/page.tsx` est un placeholder MW-B1. Aucune route dynamique `/ressources/[slug]/*`. Tous les cross-links services retournent 404.

**But** : activer les 5 pages ressources + 1 page index. Impact SEO : ~12 500 mots de contenu indexable publies d'un coup, + 5 FAQPage Schema.org.

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind, Server Components. ReactMarkdown + remark-gfm deja installes (MW-D2).

---

## Fichiers a lire AVANT

1. **`lib/types/ressource.ts`** → type `Ressource` complet (8 sections markdown, faqEntries, citations, relatedServices/Resources)
2. **`app/(public)/blog/[slug]/page.tsx`** → pattern SSG + generateStaticParams + generateMetadata + ISR `revalidate = 3600` a repliquer
3. **`lib/firestore/public-blog.ts`** → pattern helper Firestore a repliquer pour `public-ressources.ts`
4. **`app/(public)/_components/MarkdownRenderer.tsx`** → composant deja stylise (h1-h3, p, a, ul, blockquote, strong). On le reutilise tel quel pour chaque section.
5. **`app/(public)/_sections/`** MW-C3 → pattern visuel a respecter (kicker + heading, SectionNumber, PaperTexture variant="real" 1x)
6. **`firestore.rules`** → deja OK : `allow read: if resource.data.status == 'published'`

---

## Architecture

```
lib/firestore/public-ressources.ts                  (~60 lignes)
  - getAllPublishedRessources()
  - getRessourceBySlug(slug)
  - getRelatedRessources(currentSlug, pilier, limit)

app/(public)/ressources/page.tsx                    (~120 lignes — remplace le placeholder MW-B1)
  - Index liste des 5 ressources
  - Hero + filtre par pilier (4 tabs, "Toutes" par defaut — tabs statiques, pas d'interactivite client)
  - Grille de 5 cards

app/(public)/ressources/[slug]/page.tsx             (~180 lignes — nouvelle route dynamique)
  - SSG via generateStaticParams (5 slugs)
  - generateMetadata dynamique depuis metaTitle/metaDescription
  - revalidate = 3600 (ISR 1h)
  - 7 sections markdown rendues
  - FAQ accordeon natif <details> (Server Component)
  - Schema.org MedicalWebPage + FAQPage
  - Cross-linking vers services + autres ressources

app/(public)/_components/RessourceCard.tsx          (~50 lignes — carte dans l'index)
app/(public)/_components/RessourceFaq.tsx           (~40 lignes — accordeon FAQ Server Component)
app/(public)/_components/RessourceTableOfContents.tsx (~30 lignes — TOC sticky desktop, optional)
```

**Total** : 2 pages + 3 composants + 1 helper = 6 fichiers.

---

## Livrable 1 — `lib/firestore/public-ressources.ts`

```typescript
import { getAdminFirestore } from '@/lib/firebase-admin';
import type { Ressource } from '@/lib/types/ressource';

const COLLECTION = 'ressources';

export async function getAllPublishedRessources(): Promise<Ressource[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COLLECTION)
    .where('status', '==', 'published')
    .get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Ressource, 'id'>),
  }));
}

export async function getRessourceBySlug(slug: string): Promise<Ressource | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(COLLECTION).doc(slug).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  if (data.status !== 'published') return null;
  return { id: doc.id, ...(data as Omit<Ressource, 'id'>) };
}

export async function getRelatedRessources(
  currentSlug: string,
  pilier: string,
  limit = 3
): Promise<Ressource[]> {
  const db = getAdminFirestore();
  // priorite : meme pilier, puis transversal
  const snap = await db
    .collection(COLLECTION)
    .where('status', '==', 'published')
    .get();
  return snap.docs
    .filter((doc) => doc.id !== currentSlug)
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Ressource, 'id'>) }))
    .sort((a, b) => {
      // meme pilier d'abord
      if (a.pilier === pilier && b.pilier !== pilier) return -1;
      if (a.pilier !== pilier && b.pilier === pilier) return 1;
      return 0;
    })
    .slice(0, limit);
}
```

---

## Livrable 2 — `app/(public)/_components/RessourceCard.tsx`

Card reutilisable pour la page index et pour les "ressources associees" sur la page detail.

```tsx
import Link from 'next/link';
import type { Ressource } from '@/lib/types/ressource';

interface RessourceCardProps {
  ressource: Pick<Ressource, 'slug' | 'title' | 'metaDescription' | 'pilier' | 'shortAnswer'>;
}

const PILIER_LABELS: Record<string, string> = {
  fertilite: 'Fertilite',
  grossesse: 'Grossesse',
  pediatrie: 'Pediatrie',
  'acupuncture-sociale': 'Acupuncture sociale',
  transversal: 'Transversal',
};

export default function RessourceCard({ ressource }: RessourceCardProps) {
  return (
    <Link
      href={`/ressources/${ressource.slug}`}
      className="group flex flex-col h-full bg-white border border-public-border-subtle rounded-[14px] p-6 hover:-translate-y-1 hover:shadow-public-md hover:border-public-accent-taupe transition-all"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-3">
        {PILIER_LABELS[ressource.pilier] ?? ressource.pilier}
      </span>
      <h3 className="font-public-serif text-[22px] font-semibold leading-[1.3] text-public-text-dark mb-3 line-clamp-3 group-hover:text-public-accent-warm transition-colors">
        {ressource.title}
      </h3>
      <p className="text-[14px] text-public-text-medium leading-relaxed line-clamp-4 flex-1">
        {ressource.metaDescription}
      </p>
      <span className="mt-4 text-[13px] font-medium text-public-accent-warm">
        Lire le guide complet &rarr;
      </span>
    </Link>
  );
}
```

---

## Livrable 3 — `app/(public)/_components/RessourceFaq.tsx`

FAQ accordeon SSR (utilise `<details>` natif HTML, pas de JS). Genere aussi le JSON-LD FAQPage inline.

```tsx
import type { FaqEntry } from '@/lib/types/ressource';

interface RessourceFaqProps {
  entries: FaqEntry[];
}

export default function RessourceFaq({ entries }: RessourceFaqProps) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => (
        <details
          key={idx}
          className="group bg-white border border-public-border-subtle rounded-[12px] p-5 open:shadow-public-sm transition-shadow"
        >
          <summary className="font-public-serif text-[17px] font-semibold text-public-text-dark cursor-pointer list-none flex justify-between items-start gap-3">
            <span>{entry.question}</span>
            <span className="text-public-accent-warm shrink-0 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
          </summary>
          <div className="mt-4 text-[15px] leading-[1.7] text-public-text-medium whitespace-pre-wrap">
            {entry.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
```

**Important** : le `<details>` natif est 100% accessible, sans JS, et indexable par Google comme FAQ. On rajoute le Schema.org FAQPage dans `page.tsx` pour maximiser la chance d'avoir des rich snippets.

---

## Livrable 4 — `app/(public)/ressources/page.tsx` (INDEX — remplace placeholder MW-B1)

```tsx
import type { Metadata } from 'next';
import { getAllPublishedRessources } from '@/lib/firestore/public-ressources';
import SectionHeading from '../_components/SectionHeading';
import RessourceCard from '../_components/RessourceCard';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Ressources',
  description: 'Guides complets sur l\'acupuncture en fertilite, grossesse, pediatrie, acupuncture sociale et sante mentale. Etudes scientifiques recentes, protocoles documentes, FAQ.',
};

export default async function RessourcesIndexPage() {
  const ressources = await getAllPublishedRessources();

  // Tri par pilier puis par titre (ordre deterministe)
  const PILIER_ORDER = ['fertilite', 'grossesse', 'pediatrie', 'acupuncture-sociale', 'transversal'];
  const sorted = ressources.sort((a, b) => {
    const aIdx = PILIER_ORDER.indexOf(a.pilier);
    const bIdx = PILIER_ORDER.indexOf(b.pilier);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.title.localeCompare(b.title, 'fr');
  });

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[960px] mx-auto text-center">
          <SectionHeading
            kicker="LE GUIDE COMPLET"
            title="Ressources"
            subtitle="Des guides approfondis sur l'acupuncture en fertilite, grossesse, pediatrie, acupuncture sociale et sante mentale. Etudes scientifiques recentes, protocoles documentes, et les reponses aux questions qu'on me pose le plus souvent."
          />
        </div>
      </section>

      {/* Liste des ressources */}
      <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((r) => (
              <RessourceCard
                key={r.slug}
                ressource={{
                  slug: r.slug,
                  title: r.title,
                  metaDescription: r.metaDescription,
                  pilier: r.pilier,
                  shortAnswer: r.shortAnswer,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

---

## Livrable 5 — `app/(public)/ressources/[slug]/page.tsx` (TEMPLATE DYNAMIQUE)

C'est le gros morceau. Structure :

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRessourceBySlug, getAllPublishedRessources, getRelatedRessources } from '@/lib/firestore/public-ressources';
import MarkdownRenderer from '../../_components/MarkdownRenderer';
import RessourceCard from '../../_components/RessourceCard';
import RessourceFaq from '../../_components/RessourceFaq';
import CtaButton from '../../_components/CtaButton';
import SectionHeading from '../../_components/SectionHeading';

export const revalidate = 3600;

// SSG — pre-build les 5 ressources
export async function generateStaticParams() {
  const all = await getAllPublishedRessources();
  return all.map((r) => ({ slug: r.slug }));
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRessourceBySlug(slug);
  if (!r) return { title: 'Ressource non trouvee' };
  return {
    title: r.metaTitle,
    description: r.metaDescription,
    openGraph: {
      title: r.metaTitle,
      description: r.metaDescription,
      type: 'article',
    },
  };
}

const PILIER_LABELS: Record<string, string> = {
  fertilite: 'FERTILITE',
  grossesse: 'GROSSESSE',
  pediatrie: 'PEDIATRIE',
  'acupuncture-sociale': 'ACUPUNCTURE SOCIALE',
  transversal: 'SANTE MENTALE',
};

// Mapping pilier → URL page service correspondante pour le CTA cross-link
const PILIER_SERVICE_URL: Record<string, string | null> = {
  fertilite: '/services/fertilite',
  grossesse: '/services/grossesse',
  pediatrie: '/services/pediatrie',
  'acupuncture-sociale': '/services/acupuncture-sociale',
  transversal: null, // pas de page service directe
};

export default async function RessourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ressource = await getRessourceBySlug(slug);

  if (!ressource) notFound();

  const related = await getRelatedRessources(slug, ressource.pilier, 3);
  const servicePageUrl = PILIER_SERVICE_URL[ressource.pilier];

  // Schema.org : MedicalWebPage + FAQPage combines
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: ressource.metaTitle,
      description: ressource.metaDescription,
      medicalAudience: 'Patient',
      mainEntity: {
        '@type': 'MedicalTherapy',
        name: ressource.title,
        relevantSpecialty: 'Integrative Medicine',
      },
    },
    ressource.faqEntries && ressource.faqEntries.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: ressource.faqEntries.map((e) => ({
            '@type': 'Question',
            name: e.question,
            acceptedAnswer: { '@type': 'Answer', text: e.answer },
          })),
        }
      : null,
  ].filter(Boolean);

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <header className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4">
            {PILIER_LABELS[ressource.pilier] ?? ressource.pilier}
          </span>
          <h1 className="font-public-serif text-[36px] md:text-[52px] font-medium leading-[1.1] text-public-text-dark mb-6">
            {ressource.title}
          </h1>
          <p className="text-[18px] leading-[1.65] text-public-text-medium">
            {ressource.shortAnswer}
          </p>
        </div>
      </header>

      {/* Body sections — rendues en sequence via MarkdownRenderer */}
      <div className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[780px] mx-auto space-y-16">
          {ressource.introSection && (
            <section><MarkdownRenderer content={ressource.introSection} /></section>
          )}

          {ressource.scienceSection && (
            <section><MarkdownRenderer content={ressource.scienceSection} /></section>
          )}

          {ressource.mechanismSection && (
            <section><MarkdownRenderer content={ressource.mechanismSection} /></section>
          )}

          {ressource.judithApproach && (
            <section><MarkdownRenderer content={ressource.judithApproach} /></section>
          )}

          {ressource.whatToExpect && (
            <section><MarkdownRenderer content={ressource.whatToExpect} /></section>
          )}

          {ressource.protocolSection && (
            <section><MarkdownRenderer content={ressource.protocolSection} /></section>
          )}

          {ressource.testimonial && (
            <section className="my-12">
              <MarkdownRenderer content={ressource.testimonial} />
            </section>
          )}
        </div>
      </div>

      {/* FAQ section */}
      {ressource.faqEntries && ressource.faqEntries.length > 0 && (
        <section className="bg-public-beige-light py-[68px] md:py-[88px] px-5 md:px-8">
          <div className="max-w-[860px] mx-auto">
            <SectionHeading
              kicker="QUESTIONS FREQUENTES"
              title="Ce qu'on me demande le plus souvent"
              align="left"
            />
            <div className="mt-12">
              <RessourceFaq entries={ressource.faqEntries} />
            </div>
          </div>
        </section>
      )}

      {/* CTA cross-linking vers page service */}
      {servicePageUrl && (
        <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center">
          <div className="max-w-[620px] mx-auto">
            <h2 className="font-public-serif text-[28px] md:text-[40px] font-medium mb-4">
              Envie d'en parler ?
            </h2>
            <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
              Le guide vous donne le contexte. La premiere seance, on le vit ensemble.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <CtaButton variant="white" size="lg" href="https://www.gorendezvous.com/lasourceensoi?companyId=104074">
                Prendre rendez-vous
              </CtaButton>
              <CtaButton variant="secondary" href={servicePageUrl} className="text-white/80 hover:text-white">
                Voir la page service
              </CtaButton>
            </div>
          </div>
        </section>
      )}

      {/* Ressources associees */}
      {related.length > 0 && (
        <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8 border-t border-public-border-subtle">
          <div className="max-w-[1280px] mx-auto">
            <SectionHeading
              kicker="POUR ALLER PLUS LOIN"
              title="Autres ressources"
              align="left"
            />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <RessourceCard
                  key={r.slug}
                  ressource={{
                    slug: r.slug,
                    title: r.title,
                    metaDescription: r.metaDescription,
                    pilier: r.pilier,
                    shortAnswer: r.shortAnswer,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Retour */}
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 text-center">
        <Link
          href="/ressources"
          className="text-public-accent-taupe-dark underline underline-offset-4 text-sm"
        >
          Retour a toutes les ressources
        </Link>
      </div>
    </article>
  );
}
```

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`, `next.config.mjs`, `firestore.rules`
- **Ne pas modifier** les composants MW-B3 ni MW-D2 (MarkdownRenderer) — on ne fait que les reutiliser
- **Ne pas** creer un composant client avec `'use client'` (tout est Server Component, meme la FAQ via `<details>` natif)
- **Ne pas** ajouter de dependance npm — react-markdown + remark-gfm sont deja installes
- **Ne pas** pre-generer la 5e ressource (sante mentale) si `generateStaticParams` ne l'inclut pas ; elle sera accessible mais en dynamic render. En pratique : le helper retourne TOUTES les publishees donc tout sera SSG.
- **Ne pas** essayer de parser les citations separement — elles sont dans le texte markdown des sections, MarkdownRenderer les affiche correctement
- Pas d'emojis dans l'UI
- Mobile-first 375px — padding `px-5` minimum partout

---

## Definition of Done

- [ ] `npm run build` passe, logs montrent 5 routes `/ressources/[slug]` prerendered
- [ ] `/ressources` affiche une grille de 5 cards (fertilite, grossesse, pediatrie, sociale, sante mentale)
- [ ] Chaque card a le bon pilier en kicker + title + metaDescription
- [ ] Clic sur card → navigue vers `/ressources/{slug}`
- [ ] Chaque page ressource affiche : hero + 7 sections markdown + FAQ accordeon + CTA service + 3 ressources associees
- [ ] `/ressources/acupuncture-fertilite-montreal` affiche les 8 FAQ en accordeon `<details>`
- [ ] Schema.org MedicalWebPage present en JSON-LD sur chaque page detail
- [ ] Schema.org FAQPage present en JSON-LD sur chaque page detail (verifier que les 5 ressources ont au moins 1 faqEntry — la sociale en a 0, donc FAQPage omis pour celle-ci)
- [ ] Cross-linking : CTA "Voir la page service" pointe vers `/services/{pilier}` (sauf sante mentale qui n'en a pas)
- [ ] Ressources associees : 3 cards avec priorite meme pilier
- [ ] ISR `revalidate = 3600` sur index + detail
- [ ] generateStaticParams retourne bien 5 slugs
- [ ] `git diff` ne montre **aucune modification** dans `_components/` existants, `(app)/`, `(auth)/`, `tailwind.config.ts`, `next.config.mjs`, `firestore.rules`
- [ ] **Mobile 375px** : aucun scroll horizontal

---

## Commit final attendu

```
feat(public): MW-D5 pages ressources index + template dynamique [slug]
```

---

## References

- Collection Firestore : `ressources` (5 docs published)
- Type : `lib/types/ressource.ts`
- Pattern SSG + ISR : `app/(public)/blog/[slug]/page.tsx`
- Pattern Firestore helper : `lib/firestore/public-blog.ts`
- Markdown renderer : `app/(public)/_components/MarkdownRenderer.tsx`
- Cross-linking depuis services : MW-C3a/b/c/d (commits f007ea4, d0f28fb, fb2fd31, 9d53320)

---

*Prompt drafte le 16 avril 2026 par Claude Desktop (Opus).*
