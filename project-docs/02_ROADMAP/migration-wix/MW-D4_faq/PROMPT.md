# MW-D4 — Page FAQ globale (/faq)

**One-shot prompt pour Claude Code.** Remplace le placeholder MW-B1.

---

## Contexte

6 FAQ standalone riches existent dans Firestore (collection `faqs`, status `published`). Chaque FAQ a une question + reponse longue en markdown (~200-400 mots). Les FAQ sont groupees par categorie : `seance` (1), `fertilite` (3), `grossesse` (2).

La page /tarifs (MW-C4) a deja 5 FAQ inline (via RessourceFaq) — ne pas dupliquer celles-ci sur /faq.
Les pages /ressources/[slug] ont leurs propres faqEntries embedees (MW-D5) — ne pas dupliquer non plus.

Cette page `/faq` est un **hub FAQ global** qui affiche les 6 FAQ standalone + Schema.org FAQPage pour maximiser les rich snippets Google.

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind, Server Components. Pas de nouvelle dependance.

---

## Fichiers a lire AVANT

1. **`lib/types/faq.ts`** → type `FAQ` complet (question, reponse markdown, category, order, relatedServices, status)
2. **`app/(public)/_components/RessourceFaq.tsx`** → accordeon `<details>` SSR a reutiliser **MAIS** il attend `FaqEntry` (question+answer) pas `FAQ` (question+reponse). Il faudra soit adapter le mapping, soit creer un composant similaire pour les FAQ riches.
3. **`app/(public)/_components/MarkdownRenderer.tsx`** → pour rendre les reponses en markdown
4. **`app/(public)/tarifs/page.tsx`** → exemple de FAQ inline avec RessourceFaq (ne pas dupliquer ces 5 questions)
5. **`lib/firestore/public-ressources.ts`** → pattern helper Firestore

---

## Architecture

```
lib/firestore/public-faq.ts                    (~30 lignes)
  - getAllPublishedFaqs() → FAQ[] trié par order

app/(public)/faq/page.tsx                      (~130 lignes — remplace placeholder)
  - Hero + sous-titre
  - FAQ groupées par catégorie (tabs ou sections)
  - Schema.org FAQPage
  - CTA final
```

**2 fichiers seulement.** Pas de composant dédié — on réutilise MarkdownRenderer pour les réponses et `<details>` inline pour l'accordéon.

---

## Livrable 1 — `lib/firestore/public-faq.ts`

```typescript
import { getAdminFirestore } from '@/lib/firebase-admin';
import type { FAQ } from '@/lib/types/faq';

export async function getAllPublishedFaqs(): Promise<FAQ[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('faqs')
    .where('status', '==', 'published')
    .orderBy('order')
    .get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<FAQ, 'id'>),
  }));
}
```

---

## Livrable 2 — `app/(public)/faq/page.tsx`

### Metadata SEO
```tsx
export const metadata: Metadata = {
  title: 'Questions frequentes — Acupuncture a Rosemont, Montreal',
  description: 'Reponses aux questions les plus courantes sur l\'acupuncture en fertilite, grossesse, anxiete. Membre OAQ, La Source en Soi, Rosemont.',
};
```

### Structure

```tsx
export const revalidate = 3600; // ISR 1h

export default async function FaqPage() {
  const faqs = await getAllPublishedFaqs();

  // Grouper par categorie
  const CATEGORY_LABELS: Record<string, string> = {
    seance: 'Questions generales',
    fertilite: 'Fertilite',
    grossesse: 'Grossesse & perinatalite',
    pediatrie: 'Pediatrie',
    'acupuncture-sociale': 'Acupuncture sociale',
  };

  const grouped = new Map<string, FAQ[]>();
  for (const faq of faqs) {
    const key = faq.category;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(faq);
  }

  // Schema.org FAQPage (toutes les FAQ dans un seul schema)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        // Pour le schema, on strip le markdown et on prend les 500 premiers chars
        text: f.reponse.replace(/[#*_\[\]()]/g, '').slice(0, 500),
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        faqSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://acupuncturejudith.ca/' },
            { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://acupuncturejudith.ca/faq' },
          ],
        },
      ]) }} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto text-center">
          <SectionHeading
            kicker="FAQ"
            title="Questions frequentes"
            subtitle="Les reponses aux questions que mes patientes me posent le plus souvent. Si votre question n'est pas ici, n'hesitez pas a me contacter."
          />
        </div>
      </section>

      {/* FAQ par categorie */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto space-y-16">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category}>
              <h2 className="font-public-serif text-[24px] md:text-[30px] font-medium text-public-text-dark mb-8">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="space-y-4">
                {items.map((faq) => (
                  <details
                    key={faq.id}
                    className="group bg-public-beige-light border border-public-border-subtle rounded-[12px] overflow-hidden"
                  >
                    <summary className="px-6 py-5 font-public-serif text-[17px] font-semibold text-public-text-dark cursor-pointer list-none flex justify-between items-start gap-3 hover:bg-public-beige-warm/30 transition-colors">
                      <span>{faq.question}</span>
                      <span className="text-public-accent-warm shrink-0 group-open:rotate-45 transition-transform text-xl" aria-hidden="true">+</span>
                    </summary>
                    <div className="px-6 pb-6">
                      <MarkdownRenderer content={faq.reponse} />

                      {/* Lien vers service lie si applicable */}
                      {faq.category !== 'seance' && (
                        <div className="mt-4 pt-4 border-t border-public-border-subtle">
                          <Link
                            href={`/services/${faq.category === 'grossesse' ? 'grossesse' : faq.category}`}
                            className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4"
                          >
                            Voir le service {CATEGORY_LABELS[faq.category]} &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center">
        <div className="max-w-[620px] mx-auto">
          <h2 className="font-public-serif text-[28px] md:text-[40px] font-medium mb-4">
            Votre question n'est pas ici ?
          </h2>
          <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
            Contactez-moi directement. Je reponds habituellement dans les 48 heures ouvrables.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <CtaButton variant="white" size="lg" href="https://www.gorendezvous.com/lasourceensoi?companyId=104074">
              Prendre rendez-vous
            </CtaButton>
            <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">
              Me contacter
            </CtaButton>
          </div>
        </div>
      </section>
    </>
  );
}
```

**Points cles** :
- Reponses rendues via `MarkdownRenderer` (200-400 mots markdown chacune, contrairement aux petites FAQ tarifs)
- `<details>` natif SSR (pas de `'use client'`), indexable par Google
- Groupement par categorie avec H2 pour chaque groupe (SEO : hierarchie de titres correcte)
- Cross-link vers service lie en bas de chaque FAQ
- Schema.org FAQPage avec les 6 questions (les reponses sont strippees du markdown pour le schema, limitees a 500 chars)
- BreadcrumbList

---

## Contraintes

- Ne pas modifier `_components/`, `(app)/`, `(auth)/`, configs
- Ne pas dupliquer les 5 FAQ tarifs de /tarifs (collection `faqs` est une source differente)
- Ne pas dupliquer les 8 faqEntries de /ressources/acupuncture-fertilite-montreal (elles sont embedees dans la ressource, pas dans la collection `faqs`)
- MarkdownRenderer reutilise tel quel (pas de modification)
- `export default`, pas `'use client'`
- Mobile-first 375px
- ISR `revalidate = 3600`
- Composants < 150 lignes (page.tsx peut atteindre ~130)

---

## Definition of Done

- [ ] `npm run build` passe, `/faq` prerendered static avec ISR 1h
- [ ] 6 FAQ affichees groupees par categorie (seance:1, fertilite:3, grossesse:2)
- [ ] Chaque FAQ a un accordeon `<details>` avec reponse en markdown (MarkdownRenderer)
- [ ] Schema.org FAQPage avec 6 questions en JSON-LD
- [ ] Schema.org BreadcrumbList
- [ ] Cross-link vers service lie sous chaque FAQ (sauf categorie `seance`)
- [ ] CTA final "Votre question n'est pas ici ?"
- [ ] `lib/firestore/public-faq.ts` cree
- [ ] Mobile 375px OK
- [ ] Zero modif Hub admin / _components/

---

## Commit attendu

```
feat(public): MW-D4 page /faq globale (6 FAQ groupees, Schema.org FAQPage, accordeon SSR)
```

---

## References

- Collection Firestore : `faqs` (6 docs published, ordonnees par `order`)
- Type : `lib/types/faq.ts`
- Markdown : `app/(public)/_components/MarkdownRenderer.tsx`
- Pattern : MW-D5 RessourceFaq (meme concept, version enrichie avec MarkdownRenderer)

*Prompt drafte 16 avril 2026 Claude Desktop.*
