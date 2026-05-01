# MW-C2 — Page /a-propos

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir executer sans poser de question.

---

## Contexte

La page /a-propos est la version complete du bloc "Qui je suis" (section 04) de la homepage. Le contenu textuel exact est dans `CONTENU_BROUILLON.md` dans ce meme dossier — c'est la source de verite pour tout le texte. La page reprend les composants MW-B3 existants et le pattern de sections etabli en MW-C1.

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind CSS, Server Components. Pas de nouvelle dependance npm.

---

## Fichiers a lire AVANT de commencer

1. **`project-docs/02_ROADMAP/migration-wix/MW-C2_a-propos/CONTENU_BROUILLON.md`** → texte exact de chaque section (7 sections). COPIER VERBATIM, ne pas reformuler.
2. **`app/(public)/_sections/`** → pattern de sections etabli en MW-C1. Reproduire le meme style.
3. **`app/(public)/_components/`** → composants disponibles : SectionHeading, SectionNumber, CtaButton, GrainOverlay, PaperTexture, PilierCard, ClinicBadge, WatermarkText.
4. **`public/site/judith/manifest.json`** → photo portrait-08 (seule photo utilisee sur cette page).
5. **`docs/migration-wix/CLAUDE.md`** → invariants migration.

---

## Architecture

```
app/(public)/a-propos/page.tsx    (~100 lignes — metadata + Schema.org + assemblage)
app/(public)/_sections/
  AboutHeroSection.tsx             (~60 lignes)
  AboutParcoursSection.tsx         (~70 lignes)
  AboutPratiqueSection.tsx         (~50 lignes)
  AboutCliniqueSection.tsx         (~70 lignes)
  AboutSpecialitesSection.tsx      (~40 lignes — reutilise PilierCard)
```

Toutes Server Components, `export default`, pas de `'use client'`.

La section Credentials (badges) et le CTA final sont assez courts pour etre inlines dans `page.tsx` sans depasser 100 lignes. Si ca depasse, extraire.

---

## Livrable 1 — AboutHeroSection.tsx

```
<GrainOverlay className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
  <div max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-12 md:gap-[72px] items-center>

    <!-- Photo gauche : portrait-08 -->
    <div>
      <img src="/site/judith/judith-portrait-08.webp"
           alt="Portrait de Judith Dufour Savard, acupunctrice"
           width="1600" height="1067"
           loading="eager"
           className="w-full rounded-[14px] shadow-public-photo aspect-[3/4] object-cover object-[center_20%]" />
    </div>

    <!-- Texte droite -->
    <div>
      <SectionHeading kicker="QUI JE SUIS" title="Je suis Judith." align="left" />
      <p>Acupunctrice a Rosemont, j'accompagne les femmes, les familles et les enfants
         dans les grands passages de la vie. Fertilite, grossesse, post-partum, pediatrie
         — et aussi, tout simplement, les maux du quotidien.</p>
      <p>Mon cabinet est a La Source en Soi, sur Beaubien Est. C'est un lieu chaleureux,
         familial, ou chaque personne est accueillie dans ce qu'elle vit, maintenant.</p>
    </div>
  </div>
</GrainOverlay>
```

Photo : portrait-08 via `<img>` natif (Option A). `loading="eager"` car c'est above the fold. **PAS fetchPriority="high"** — seul le hero homepage a ce privilege.

---

## Livrable 2 — AboutParcoursSection.tsx

```
<section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
  <div max-w-[780px] mx-auto>
    <SectionNumber number="01" align="left" />
    <SectionHeading kicker="MON PARCOURS" title="D'une scene a l'autre." align="left" />

    <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
      <p>Avant de devenir acupunctrice, j'ai eu une premiere vie dans le monde du spectacle
         vivant — en regie et en eclairage.</p>
      <p>Puis il y a eu mes enfants. Et avec eux, la decouverte d'un autre monde : celui de
         la naissance, de la perinatalite, du lien qui se tisse entre un parent et un bebe.</p>
      <p>J'ai voulu comprendre ce monde de l'interieur. J'ai complete mon DEP en acupuncture
         au College de Rosemont, et pendant mes etudes, j'ai travaille a la Maison de naissance
         Cote-des-Neiges ou j'ai accompagne de nombreuses familles dans les debuts de la vie.</p>
      <p>Cette experience — les naissances physiologiques, les premiers pas de parents, la
         fragilite et la force qui coexistent dans ces moments-la — m'a profondement marquee.
         C'est elle qui a oriente ma pratique vers ce qu'elle est aujourd'hui : un soin centre
         sur la femme, la famille, et les transitions de vie.</p>
    </div>
  </div>
</section>
```

Pas de photo, pas de SVG decoratif. Section purement textuelle, colonne etroite centree (780px).

---

## Livrable 3 — AboutPratiqueSection.tsx

```
<PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
  <div max-w-[780px] mx-auto>
    <SectionNumber number="02" align="left" />
    <SectionHeading kicker="CE QUE JE FAIS" title="Une approche profondement humaine." align="left" />

    <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
      <p>Dans mon cabinet, chaque seance dure <strong>60 minutes</strong>. ...</p>
      <p>La sante des femmes est au coeur de ma pratique. ...</p>
      <p>Je me forme continuellement ...</p>
    </div>
  </div>
</PaperTexture>
```

Texte exact dans CONTENU_BROUILLON.md section 3. `PaperTexture variant="real"` = 1 utilisation (seule sur cette page).

---

## Livrable 4 — AboutCliniqueSection.tsx

```
<GrainOverlay className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
  <div max-w-[1080px] mx-auto>
    <SectionNumber number="03" />
    <SectionHeading kicker="OU JE PRATIQUE" title="La Source en Soi." />

    <!-- Description -->
    <div max-w-[680px] mx-auto text-center mt-8 text-[17px]>
      <p>Je pratique a La Source en Soi, une clinique familiale sur Beaubien Est a Rosemont. ...</p>
      <p>Ce n'est pas une clinique corporative. ...</p>
    </div>

    <!-- Badge Google + coordonnees -->
    <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-12">
      <div className="flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-public-sm">
        <!-- Etoile SVG + "4,9/5 sur 1 215 avis Google" -->
      </div>

      <div className="text-center text-[14px] text-public-text-medium">
        <p>2554 rue Beaubien Est, Montreal, QC</p>
        <p>514 750-3735</p>
        <a href="https://lasourceensoi.com/" target="_blank" rel="noopener noreferrer"
           className="text-public-accent-warm underline">lasourceensoi.com</a>
      </div>
    </div>
  </div>
</GrainOverlay>
```

---

## Livrable 5 — AboutSpecialitesSection.tsx

```
<section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
  <div max-w-[1280px] mx-auto>
    <SectionHeading kicker="MES SPECIALITES" title="Ce pour quoi on me consulte." />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
      <PilierCard title="Fertilite" description="Soutien en fertilite naturelle, FIV, insemination. Accompagnement dans le temps long, avec douceur." href="/services/fertilite" image="/site/judith/judith-portrait-07.webp" />
      <PilierCard title="Grossesse & perinatalite" description="Du premier trimestre au post-partum. Nausees, douleurs, preparation a l'accouchement, moxibustion." href="/services/grossesse" image="/site/judith/judith-portrait-06.webp" />
      <PilierCard title="Pediatrie" description="Acupuncture adaptee aux enfants et aux bebes. Techniques douces, souvent sans aiguilles (aimants, laser)." href="/services/pediatrie" image="/site/judith/judith-portrait-02.webp" />
      <PilierCard title="Acupuncture sociale" description="Des soins accessibles a tous, a tarif reduit. Parce que la sante ne devrait pas etre un privilege." href="/services/acupuncture-sociale" image="/site/judith/judith-portrait-03.webp" />
    </div>
  </div>
</section>
```

4 piliers en grille 4 colonnes desktop, 2 tablette, 1 mobile. Reutilise `PilierCard` (qui a deja `unoptimized` grace au fix MW-C1).

---

## Livrable 6 — page.tsx

```typescript
import type { Metadata } from 'next';
import AboutHeroSection from '../_sections/AboutHeroSection';
import AboutParcoursSection from '../_sections/AboutParcoursSection';
import AboutPratiqueSection from '../_sections/AboutPratiqueSection';
import AboutCliniqueSection from '../_sections/AboutCliniqueSection';
import AboutSpecialitesSection from '../_sections/AboutSpecialitesSection';
import CtaButton from '../_components/CtaButton';

export const metadata: Metadata = {
  title: 'A propos',
  description: 'Judith Dufour-Savard, acupunctrice a Montreal. Parcours : regie et eclairage, maison de naissance, DEP en acupuncture au College de Rosemont. Membre OAQ. La Source en Soi, Rosemont.',
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }} />
      <AboutHeroSection />
      <AboutParcoursSection />
      <AboutPratiqueSection />
      <AboutCliniqueSection />
      <AboutSpecialitesSection />

      {/* Badges credentials */}
      <section className="bg-public-beige-light py-12 px-5 md:px-8">
        <div className="max-w-[780px] mx-auto flex flex-wrap justify-center gap-4">
          {['Membre OAQ', 'La Source en Soi', 'Mere de 3 enfants'].map((badge) => (
            <span key={badge} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-public-text-medium shadow-public-sm border border-public-border-subtle">
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center">
        <div className="max-w-[620px] mx-auto">
          <h2 className="font-public-serif text-[32px] md:text-[44px] font-medium leading-[1.15] mb-4">Envie d'en parler?</h2>
          <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">Prenez rendez-vous pour une premiere seance de 60 minutes. On prend le temps de se connaitre.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <CtaButton variant="white" size="lg" href="https://www.gorendezvous.com/fr/lasourceensoi">Prendre rendez-vous en ligne</CtaButton>
            <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">Ou ecrivez-moi</CtaButton>
          </div>
        </div>
      </section>
    </>
  );
}

const SCHEMA_ORG = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "mainEntity": {
    "@type": "Person",
    "name": "Judith Dufour-Savard",
    "jobTitle": "Acupunctrice",
    "image": "/site/judith/judith-portrait-08.webp",
    "url": "https://acupuncturejudith.ca/a-propos",
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "College de Rosemont"
    },
    "memberOf": {
      "@type": "Organization",
      "name": "Ordre des acupuncteurs du Quebec"
    },
    "worksFor": {
      "@type": "MedicalClinic",
      "name": "La Source en Soi",
      "url": "https://lasourceensoi.com/",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "2554 rue Beaubien Est",
        "addressLocality": "Montreal",
        "addressRegion": "QC",
        "addressCountry": "CA"
      },
      "telephone": "514-750-3735",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1215"
      }
    }
  }
};
```

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`, `next.config.mjs`, `firestore.rules`
- **Ne pas modifier** les composants MW-B3 dans `_components/`
- **Ne pas** utiliser `next/image` pour la photo (Option A : `<img>` natif)
- `PaperTexture variant="real"` : 1 seule utilisation (section pratique)
- Composants < 150 lignes
- Mobile-first 375px — padding `px-5` minimum partout
- Pas d'emojis dans l'UI
- `export default` pour tous les composants
- Pas de `'use client'`
- **Copier le texte VERBATIM** de CONTENU_BROUILLON.md — ne pas reformuler

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] 5 fichiers dans `app/(public)/_sections/About*.tsx` + `app/(public)/a-propos/page.tsx` modifie
- [ ] `localhost:3000/a-propos` affiche les 7 sections (hero + parcours + pratique + clinique + specialites + badges + CTA)
- [ ] Lien vers `lasourceensoi.com` present et fonctionnel
- [ ] Schema.org AboutPage + Person en JSON-LD
- [ ] Texte EXACT de CONTENU_BROUILLON.md (verifier mentions : regie et eclairage, DEP, College de Rosemont, MDN Cote-des-Neiges)
- [ ] **Mobile 375px** : aucun scroll horizontal
- [ ] `git diff` ne montre **aucune modification** dans `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`, `next.config.mjs`, `_components/`

---

## Commit final attendu

```
feat(public): MW-C2 page /a-propos (parcours, pratique, clinique, specialites)
```

**Pas de merge dans `main`** — Benoit review.

---

## References

- Contenu valide : `project-docs/02_ROADMAP/migration-wix/MW-C2_a-propos/CONTENU_BROUILLON.md`
- Pattern sections MW-C1 : `app/(public)/_sections/`
- Composants MW-B3 : `app/(public)/_components/`
- Assets MW-A1b : `public/site/judith/manifest.json`
- Invariants : `docs/migration-wix/CLAUDE.md`

---

*Prompt drafte le 15 avril 2026 par Claude Desktop (Opus). Execution apres review Desktop.*
