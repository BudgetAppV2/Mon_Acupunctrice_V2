# MW-D6 — Fixes maillage interne

**One-shot prompt pour Claude Code.** 4 micro-fixes en une execution.

---

## Contexte

Audit maillage Desktop a identifie 4 problemes a corriger immediatement :
1. `/services/page.tsx` est un placeholder MW-B1 visible dans le header
2. `/faq` n'a aucun lien interne (sauf footer)
3. `/ressources/acupuncture-sante-mentale-anxiete` n'a aucun lien direct depuis les services
4. 2 URLs Go Rendez-Vous inconsistantes (manque companyId)

---

## Fix 1 — Transformer /services/page.tsx en page index

Remplacer le placeholder par une grille 4 cards vers les 4 services.

```tsx
import type { Metadata } from 'next';
import SectionHeading from '../_components/SectionHeading';
import PilierCard from '../_components/PilierCard';

export const metadata: Metadata = {
  title: 'Services — Acupuncture a Rosemont, Montreal',
  description: 'Mes services d\'acupuncture a Rosemont : fertilite, grossesse et perinatalite, pediatrie, acupuncture sociale. La Source en Soi, Beaubien Est.',
};

export default function ServicesPage() {
  return (
    <main>
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[960px] mx-auto text-center">
          <SectionHeading
            kicker="SERVICES"
            title="Ce pour quoi on me consulte."
            subtitle="Chaque parcours est unique. Decouvrez mes specialites et trouvez l'accompagnement qui vous convient."
          />
        </div>
      </section>

      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PilierCard
            title="Fertilite"
            description="Soutien en fertilite naturelle, FIV, insemination. Accompagnement dans le temps long."
            href="/services/fertilite"
            image="/site/judith/judith-portrait-07.webp"
          />
          <PilierCard
            title="Grossesse & perinatalite"
            description="Du premier trimestre au post-partum. Nausees, douleurs, preparation a l'accouchement."
            href="/services/grossesse"
            image="/site/judith/judith-portrait-06.webp"
          />
          <PilierCard
            title="Pediatrie"
            description="Acupuncture adaptee aux enfants et aux bebes. Techniques douces, souvent sans aiguilles."
            href="/services/pediatrie"
            image="/site/judith/judith-portrait-02.webp"
          />
          <PilierCard
            title="Acupuncture sociale"
            description="Des soins accessibles a tous, a tarif reduit. La sante ne devrait pas etre un privilege."
            href="/services/acupuncture-sociale"
            image="/site/judith/judith-portrait-03.webp"
          />
        </div>
      </section>
    </main>
  );
}
```

Schema.org BreadcrumbList : Home → Services.

---

## Fix 2 — Ajouter liens vers /faq dans les pages services

Dans les 4 fichiers ServiceXxxCtaSection.tsx, ajouter un lien secondaire sous le CTA principal :

```tsx
<div className="mt-6 text-center">
  <Link href="/faq" className="text-[14px] text-white/70 underline underline-offset-4 hover:text-white transition-colors">
    Consulter les questions frequentes
  </Link>
</div>
```

Fichiers a modifier :
- `app/(public)/_sections/ServiceFertiliteCtaSection.tsx`
- `app/(public)/_sections/ServiceGrossesseCtaSection.tsx`
- `app/(public)/_sections/ServicePediatrieCtaSection.tsx`
- `app/(public)/_sections/ServiceSocialeCtaSection.tsx`

**Important** : ajouter `import Link from 'next/link';` en haut de chaque fichier si pas deja present.

---

## Fix 3 — Lier la ressource sante mentale

Dans `app/(public)/_sections/ServiceSocialeNadaSection.tsx`, dans la section "Le NADA est particulierement utilise pour", ajouter en bas un lien vers la ressource sante mentale :

```tsx
<div className="mt-8">
  <Link href="/ressources/acupuncture-sante-mentale-anxiete"
        className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4">
    Etudes sur l'acupuncture et l'anxiete &rarr;
  </Link>
</div>
```

Et aussi dans `app/(public)/a-propos/page.tsx`, dans la section specialites ou en bas de page "Pour aller plus loin", ajouter un lien :

```tsx
<li>
  <Link href="/ressources/acupuncture-sante-mentale-anxiete"
        className="text-public-accent-warm underline">
    Acupuncture et sante mentale : les etudes recentes &rarr;
  </Link>
</li>
```

---

## Fix 4 — Uniformiser URLs Go Rendez-Vous

Remplacer les 2 occurrences de `https://www.gorendezvous.com/fr/lasourceensoi` par `https://www.gorendezvous.com/lasourceensoi?companyId=104074`.

Fichiers a modifier :
- `app/(public)/_sections/CtaFinalSection.tsx` (1 occurrence)
- `app/(public)/a-propos/page.tsx` (1 occurrence)

Commande de verification : `grep -rn "gorendezvous.com/fr/" app/(public)/` doit retourner vide apres le fix.

---

## Contraintes

- Ne pas modifier `(app)/`, `(auth)/`, configs, Firestore rules
- Ne pas creer de nouveaux composants (tout reutilise PilierCard, Link, SectionHeading existants)
- Les modifications dans _sections/ (Fix 2+3) sont mineures (ajout 3-5 lignes max par fichier)
- Mobile-first 375px

---

## Definition of Done

- [ ] `npm run build` passe
- [ ] `/services` affiche une grille 4 cards (plus de placeholder)
- [ ] `grep -rn "Placeholder" app/(public)/services/page.tsx` retourne vide
- [ ] 4 fichiers ServiceXxxCtaSection.tsx ont un lien vers /faq
- [ ] ServiceSocialeNadaSection.tsx a un lien vers /ressources/acupuncture-sante-mentale-anxiete
- [ ] `grep -rn "gorendezvous.com/fr/" app/(public)/` retourne vide
- [ ] `/services` page a Schema.org BreadcrumbList

---

## Commit attendu

```
fix(public): MW-D6 corrections maillage interne (page services index, liens FAQ/ressource, URLs GRV)
```

---

*Prompt drafte 16 avril 2026 Claude Desktop.*
