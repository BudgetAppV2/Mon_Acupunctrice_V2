# MW-C3a — Page /services/fertilite

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir executer sans poser de question.

---

## Contexte

Cette page est la premiere des 4 pages services (fertilite, grossesse, pediatrie, acupuncture-sociale). Elle est **courte** (~700 mots, orientee conversion) et complementaire a la page ressource `/ressources/acupuncture-fertilite-montreal` (2500 mots, orientee SEO scientifique).

**Architecture hub-and-spoke** :
- Page SERVICE (cette page) = emotion + bio + benefices resumes + pratique + CTA
- Page RESSOURCE (MW-D5) = etudes scientifiques completes, protocoles, 8 FAQ, mecanismes
- Les 2 se cross-linkent. Mots-cles distincts pour eviter la cannibalisation SEO.

MW-C3a sert aussi de **prototype** pour les 3 autres pages services (grossesse, pediatrie, sociale) \u2014 le pattern etabli ici sera replique.

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind CSS, Server Components. Pas de nouvelle dependance npm.

---

## Fichiers a lire AVANT de commencer

1. **`project-docs/02_ROADMAP/migration-wix/MW-C3_services/fertilite/CONTENU_BROUILLON.md`** \u2192 texte exact. COPIER VERBATIM. Contient 7 sections + cross-linking.
2. **`app/(public)/_sections/`** \u2192 pattern sections etabli en MW-C1 et MW-C2.
3. **`app/(public)/_components/`** \u2192 composants disponibles : SectionHeading, SectionNumber, CtaButton, GrainOverlay, PaperTexture, TestimonialCard, ClinicBadge, WatermarkText, BotanicalDeco.
4. **`public/site/judith/manifest.json`** \u2192 portrait-07 (pierre zen + aiguilles, card fertilite MW-A1b).
5. **`public/site/svg/reproductive-flowers.svg`** \u2192 SVG decoratif pour cette page (61 KB, optimise en MW-A1b, pas encore utilise).
6. **`docs/migration-wix/CLAUDE.md`** \u2192 invariants migration.

---

## Architecture

```
app/(public)/services/fertilite/page.tsx      (~100 lignes \u2014 metadata + Schema.org + assemblage)
app/(public)/_sections/
  ServiceFertiliteHeroSection.tsx              (~80 lignes)
  ServiceFertiliteBioSection.tsx               (~60 lignes)
  ServiceFertiliteBenefitsSection.tsx          (~70 lignes)
  ServiceFertiliteCollaborationSection.tsx     (~50 lignes)
  ServiceFertiliteTemoignageSection.tsx        (~40 lignes)
  ServiceFertiliteInfosSection.tsx             (~60 lignes)
  ServiceFertiliteCtaSection.tsx               (~40 lignes)
```

**Notation importante** : prefixer les sections par `ServiceFertilite*` plutot que `Fertilite*` parce que MW-C3b (grossesse), MW-C3c (pediatrie), MW-C3d (sociale) auront leurs propres sections paralleles. Convention de nommage claire \u00e0 poser des maintenant.

Toutes Server Components, `export default`, pas de `'use client'`.

---

## Livrable 1 \u2014 ServiceFertiliteHeroSection.tsx

```
<GrainOverlay className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">

  {/* SVG decoratif reproductive-flowers en filigrane a droite */}
  <div absolute right:-120 top:-40 w:480 h:520 hidden md:block rotate:-8deg opacity:0.12 multiply>
    <img src="/site/svg/reproductive-flowers.svg" alt="" aria-hidden="true" />
  </div>

  <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center relative z-10">

    {/* Contenu gauche */}
    <div>
      <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4">
        FERTILITE
      </span>
      <h1 className="font-public-serif text-[40px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-public-text-dark mb-6">
        Votre parcours fertilite,{' '}
        <em className="italic underline decoration-public-accent-warm decoration-2 underline-offset-8">
          accompagne
        </em>
        .
      </h1>
      <p className="text-[18px] leading-relaxed text-public-text-medium mb-8">
        Que ca fasse six mois, deux ans, ou que vous soyez en protocole de FIV \u2014
        le parcours de fertilite demande beaucoup plus d'energie emotionnelle qu'on
        ne l'imagine. Je suis l\u00e0 pour vous accompagner avec douceur, rigueur,
        et une vraie ecoute.
      </p>
      <div className="flex flex-wrap gap-4">
        <CtaButton variant="primary" size="lg" href="https://www.gorendezvous.com/lasourceensoi?companyId=104074">
          Prendre rendez-vous
        </CtaButton>
        <CtaButton variant="secondary" href="/ressources/acupuncture-fertilite-montreal">
          Lire le guide complet
        </CtaButton>
      </div>
    </div>

    {/* Photo hero : portrait-07 \u2014 ATTENTION lazy loading obligatoire (307 KB AVIF) */}
    <div className="max-w-[420px] mx-auto md:max-w-none">
      <picture>
        <source srcSet="/site/judith/judith-portrait-07.avif" type="image/avif" />
        <source srcSet="/site/judith/judith-portrait-07.webp" type="image/webp" />
        <img src="/site/judith/judith-portrait-07.webp"
             alt="Pierre zen avec aiguilles d'acupuncture, evoquant l'equilibre du parcours de fertilite"
             width={1600} height={2400}
             loading="lazy"
             className="w-full aspect-[4/5] object-cover rounded-[20px] shadow-public-photo" />
      </picture>
    </div>
  </div>
</GrainOverlay>
```

**Photo** : portrait-07 via `<picture>` avec `loading="lazy"` (warning MW-A1b explicite : photo la plus lourde, jamais en hero/LCP d'une page critique. Ici c'est un hero de page service \u2014 acceptable parce que c'est une sous-page qui porte moins de trafic que la homepage, mais pas `fetchPriority="high"`).

**SVG reproductive-flowers** : premiere utilisation dans le site. Opacity 0.12, mix-blend-mode multiply, rotation -8deg (pattern etabli sur les autres SVG MW-C1 round 2).

---

## Livrable 2 \u2014 ServiceFertiliteBioSection.tsx

```
<section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
  <div className="max-w-[780px] mx-auto">
    <SectionNumber number="01" align="left" />
    <SectionHeading kicker="QUI VOUS ACCOMPAGNE" title="Une approche nee du terrain." align="left" />

    <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
      <p>Je suis Judith Dufour-Savard, acupunctrice \u00e0 La Source en Soi, sur Beaubien Est \u00e0 Rosemont. J'ai travaille \u00e0 la Maison de naissance Cote-des-Neiges avant ma pratique, et je suis m\u00e8re de trois enfants. Quand je vous ecoute me parler de votre parcours de fertilite, je ne le fais pas juste comme professionnelle \u2014 je le fais aussi comme femme qui comprend l'attente, l'espoir, et la fatigue emotionnelle qui viennent avec.</p>
      <p>Ma pratique combine la rigueur de la medecine traditionnelle chinoise, les etudes scientifiques recentes (une <a href="/ressources/acupuncture-fertilite-montreal" className="text-public-accent-warm underline">meta-analyse de septembre 2025</a> montre des resultats encourageants sur 3 561 femmes), et une bonne dose d'humanite.</p>
    </div>

    <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-public-beige-light px-5 py-2.5 text-[13px] font-medium text-public-text-medium border border-public-border-subtle">
      <ShieldCheckIcon /> Membre de l'Ordre des acupuncteurs du Quebec (OAQ)
    </div>
  </div>
</section>
```

---

## Livrable 3 \u2014 ServiceFertiliteBenefitsSection.tsx

```
<PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
  <div className="max-w-[960px] mx-auto">
    <SectionNumber number="02" align="left" />
    <SectionHeading kicker="CE QUE L'ACUPUNCTURE FAIT" title="Un soutien concret, pas des promesses." align="left" />

    <p className="mt-6 mb-10 text-[17px] leading-relaxed text-public-text-medium max-w-[720px]">
      L'acupuncture ne guerit pas l'infertilite. Mais elle peut offrir plusieurs benefices
      mesurables dans votre parcours \u2014 physiologiques et emotionnels.
    </p>

    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
      {[
        "Regulariser un cycle menstruel irregulier ou une ovulation absente",
        "Ameliorer la circulation sanguine vers l'uterus et les ovaires",
        "Soutenir la qualite de l'endometre et la receptivite embryonnaire",
        "Attenuer le stress et l'anxiete qui affectent votre axe hormonal",
        "Mieux tolerer les effets secondaires des traitements hormonaux (FIV, IIU)",
        "Accompagner les conditions comme le SOPK ou l'endometriose",
      ].map((benefit) => (
        <li key={benefit} className="flex items-start gap-3 text-[15px] text-public-text-medium">
          <CheckIcon className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5" />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>

    <p className="mt-10 text-[16px] leading-relaxed text-public-text-medium max-w-[720px]">
      Chaque seance dure 60 minutes et s'adapte \u00e0 votre realite : conception naturelle,
      insemination, FIV. Votre partenaire est aussi le bienvenu \u2014 la fertilite masculine
      beneficie egalement de l'acupuncture.
    </p>

    <div className="mt-8">
      <Link href="/ressources/acupuncture-fertilite-montreal"
            className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4">
        Explorez les etudes scientifiques recentes &rarr;
      </Link>
    </div>
  </div>
</PaperTexture>
```

**PaperTexture variant="real"** : 1 seule utilisation sur cette page (section benefits). C'est le spot "heavy content" qui beneficie le plus de la texture.

---

## Livrable 4 \u2014 ServiceFertiliteCollaborationSection.tsx

```
<section className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
  <div className="max-w-[780px] mx-auto">
    <SectionNumber number="03" align="left" />
    <SectionHeading kicker="COMPLEMENT, JAMAIS OPPOSITION" title="J'accompagne votre suivi medical." align="left" />

    <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
      <p>J'accompagne regulierement des femmes suivies dans les cliniques de fertilite de Montreal. Mon role est complementaire \u00e0 votre suivi medical, jamais en opposition. Je vous encourage \u00e0 tenir votre equipe medicale informee de votre demarche.</p>
      <p>Si vous avez des resultats d'examens (bilan hormonal, hysterosalpingographie, bilan de fertilite), apportez-les. On pourra en discuter ensemble.</p>
    </div>
  </div>
</section>
```

**IMPORTANT** : pas de noms de cliniques specifiques (OVO, McGill, PROCREA, etc.). Rester general.

---

## Livrable 5 \u2014 ServiceFertiliteTemoignageSection.tsx

```
<section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
  <div className="max-w-[780px] mx-auto">
    <TestimonialCard
      quote="Juste un petit mot pour te dire que j'ai eu un beau 'positif'. Je suis enceinte. Le dernier traitement que tu m'as fait m'a beaucoup aidee, car le stress n'est pas revenu apres."
      name="Cliente, 41 ans"
      detail="Temoignage partage avec son accord"
    />
  </div>
</section>
```

Reutilise `TestimonialCard` (MW-B3). 1 card centree en pleine largeur, sans featured prop.

---

## Livrable 6 \u2014 ServiceFertiliteInfosSection.tsx

```
<section className="bg-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
  <div className="max-w-[960px] mx-auto">
    <SectionNumber number="04" />
    <SectionHeading kicker="PRATIQUE" title="Ce qu'il faut savoir." />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

      <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
        <ClockIcon className="w-8 h-8 text-public-accent-warm mx-auto mb-4" />
        <h3 className="font-public-serif text-[20px] font-semibold mb-2">Duree</h3>
        <p className="text-[14px] text-public-text-medium">Chaque seance dure 60 minutes</p>
      </div>

      <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
        <DollarIcon className="w-8 h-8 text-public-accent-warm mx-auto mb-4" />
        <h3 className="font-public-serif text-[20px] font-semibold mb-2">Tarifs</h3>
        <p className="text-[14px] text-public-text-medium">90 $ la seance d'une heure</p>
      </div>

      <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
        <ReceiptIcon className="w-8 h-8 text-public-accent-warm mx-auto mb-4" />
        <h3 className="font-public-serif text-[20px] font-semibold mb-2">Assurances</h3>
        <p className="text-[14px] text-public-text-medium">La plupart des assurances privees couvrent l'acupuncture. Recu officiel emis.</p>
      </div>
    </div>

    <p className="mt-12 text-center text-[15px] text-public-text-medium max-w-[720px] mx-auto">
      Pour les personnes avec des contraintes financieres, j'offre aussi des seances en
      <Link href="/services/acupuncture-sociale" className="text-public-accent-warm underline ml-1">
        acupuncture sociale \u00e0 tarif reduit
      </Link>.
    </p>
  </div>
</section>
```

3 cards centrees. Inline des icones SVG simples (ClockIcon, DollarIcon, ReceiptIcon) en fin de fichier comme pour les autres sections.

---

## Livrable 7 \u2014 ServiceFertiliteCtaSection.tsx

```
<section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
  <div className="max-w-[620px] mx-auto relative z-10">
    <h2 className="font-public-serif text-[32px] md:text-[44px] font-medium leading-[1.15] mb-4">
      Prete a commencer ?
    </h2>
    <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
      La premiere seance est un vrai echange. On prend le temps de comprendre votre histoire,
      votre cycle, votre parcours medical \u2014 et on batit ensemble un plan adapte.
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <CtaButton variant="white" size="lg" href="https://www.gorendezvous.com/lasourceensoi?companyId=104074">
        Prendre rendez-vous en ligne
      </CtaButton>
      <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">
        Ou ecrivez-moi
      </CtaButton>
    </div>
  </div>
</section>
```

---

## Livrable 8 \u2014 page.tsx

```typescript
import type { Metadata } from 'next';
import ServiceFertiliteHeroSection from '@/app/(public)/_sections/ServiceFertiliteHeroSection';
import ServiceFertiliteBioSection from '@/app/(public)/_sections/ServiceFertiliteBioSection';
import ServiceFertiliteBenefitsSection from '@/app/(public)/_sections/ServiceFertiliteBenefitsSection';
import ServiceFertiliteCollaborationSection from '@/app/(public)/_sections/ServiceFertiliteCollaborationSection';
import ServiceFertiliteTemoignageSection from '@/app/(public)/_sections/ServiceFertiliteTemoignageSection';
import ServiceFertiliteInfosSection from '@/app/(public)/_sections/ServiceFertiliteInfosSection';
import ServiceFertiliteCtaSection from '@/app/(public)/_sections/ServiceFertiliteCtaSection';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Acupuncture fertilite',
  description: 'Acupunctrice a Rosemont specialisee en fertilite : conception naturelle, FIV, insemination, SOPK, endometriose. Approche douce, 60 min par seance, 90 $, assurances. La Source en Soi.',
};

export default function ServiceFertilitePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }} />
      <ServiceFertiliteHeroSection />
      <ServiceFertiliteBioSection />
      <ServiceFertiliteBenefitsSection />
      <ServiceFertiliteCollaborationSection />
      <ServiceFertiliteTemoignageSection />
      <ServiceFertiliteInfosSection />
      <ServiceFertiliteCtaSection />

      {/* Pour aller plus loin \u2014 cross-linking SEO */}
      <section className="bg-public-beige-warm py-12 px-5 md:px-8 border-t border-public-border-subtle">
        <div className="max-w-[780px] mx-auto">
          <h3 className="font-public-serif text-[18px] font-semibold mb-4 text-public-text-dark">Pour aller plus loin</h3>
          <ul className="space-y-2 text-[14px]">
            <li><Link href="/ressources/acupuncture-fertilite-montreal" className="text-public-accent-warm underline">Ce que dit la science en 2025 sur l'acupuncture et la fertilite &rarr;</Link></li>
            <li><Link href="/services/acupuncture-sociale" className="text-public-accent-warm underline">L'acupuncture sociale : soins accessibles a tarif reduit &rarr;</Link></li>
            <li><Link href="/blog?category=fertilite" className="text-public-accent-warm underline">Le carnet : articles sur la fertilite &rarr;</Link></li>
          </ul>
        </div>
      </section>
    </>
  );
}

const SCHEMA_ORG = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "Acupuncture fertilite a Montreal",
  "description": "Acupuncture pour soutenir le parcours de fertilite a Rosemont. Conception naturelle, FIV, IIU.",
  "medicalAudience": "Patient",
  "about": {
    "@type": "MedicalCondition",
    "name": "Infertility"
  },
  "mainEntity": {
    "@type": "MedicalTherapy",
    "name": "Acupuncture pour la fertilite",
    "relevantSpecialty": "Reproductive Medicine"
  }
};
```

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`, `next.config.mjs`, `firestore.rules`
- **Ne pas modifier** les composants MW-B3 dans `_components/`
- **Ne pas** utiliser `next/image` pour les photos (Option A/B : `<img>` natif / `<picture>`)
- **Ne pas** nommer de cliniques de fertilite specifiques (OVO, McGill, PROCREA, etc.) \u2014 rester general
- **Ne pas** reprendre le contenu verbatim de `source-resources/01-acupuncture-fertilite-montreal.md` \u2014 ca c'est pour la page RESSOURCE (MW-D5). Cette page service est COURTE, elle resume et cross-linke.
- `PaperTexture variant="real"` : 1 seule utilisation (section benefits)
- Photo-07 portrait-07 : `loading="lazy"`, PAS `fetchPriority="high"`
- Composants < 150 lignes
- Mobile-first 375px \u2014 padding `px-5` minimum partout
- Pas d'emojis dans l'UI
- `export default` pour tous les composants
- Pas de `'use client'`
- **Copier le texte VERBATIM** de CONTENU_BROUILLON.md \u2014 ne pas reformuler

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] 7 fichiers dans `app/(public)/_sections/ServiceFertilite*.tsx` + `app/(public)/services/fertilite/page.tsx`
- [ ] `localhost:3000/services/fertilite` affiche la page complete (7 sections + cross-linking)
- [ ] H1 : "Votre parcours fertilite, accompagne." (avec "accompagne" en italic + underline warm)
- [ ] Photo portrait-07 via `<picture>` AVIF+WebP, `loading="lazy"`
- [ ] SVG reproductive-flowers.svg utilise en decoration du hero (rotation, opacity, multiply)
- [ ] PaperTexture variant="real" exactement 1 fois (section benefits) \u2014 `grep -c 'variant="real"' app/(public)/_sections/ServiceFertilite*.tsx` doit retourner 1
- [ ] Aucun nom de clinique de fertilite (OVO, McGill, PROCREA, Centre de reproduction) \u2014 `grep -l 'OVO\|McGill\|PROCREA' app/(public)/_sections/ServiceFertilite*.tsx` doit retourner vide
- [ ] Tarif 90 $ mentionne dans la section infos
- [ ] Temoignage "Cliente, 41 ans" present (TestimonialCard)
- [ ] Cross-linking vers `/ressources/acupuncture-fertilite-montreal` present (min 2 liens dans la page)
- [ ] Schema.org MedicalWebPage + MedicalTherapy en JSON-LD
- [ ] **Mobile 375px** : aucun scroll horizontal
- [ ] `git diff` ne montre **aucune modification** dans `_components/`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`, `next.config.mjs`

---

## Commit final attendu

```
feat(public): MW-C3a page /services/fertilite (premier prototype des 4 pages services)
```

**Pas de merge dans `main`** \u2014 Benoit review.

---

## References

- Contenu valide : `project-docs/02_ROADMAP/migration-wix/MW-C3_services/fertilite/CONTENU_BROUILLON.md`
- Source SEO : `scripts/seo-geo/source-resources/01-acupuncture-fertilite-montreal.md` (page ressource, PAS cette page)
- Pattern sections : MW-C1 et MW-C2 dans `app/(public)/_sections/`
- Invariants : `docs/migration-wix/CLAUDE.md`

---

*Prompt drafte le 16 avril 2026 par Claude Desktop (Opus). Execution apres review Desktop.*
