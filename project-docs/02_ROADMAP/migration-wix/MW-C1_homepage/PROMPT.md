# MW-C1 — Homepage portee de homepage-v4.html → React/Next.js

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir executer sans poser de question.

---

## Contexte

La maquette `homepage-v4.html` est la source de verite visuelle du site public de Judith. MW-B3 a cree 13 composants design system (SiteHeader, SiteFooter, CtaButton, PilierCard, TestimonialCard, SectionHeading, SectionNumber, ClinicBadge, PaperTexture, GrainOverlay, BotanicalDeco, WatermarkText, MobileMenu). MW-A1b a optimise les photos (AVIF+WebP), SVG (svgo), et la texture papier (3 formats). Ce milestone porte la homepage v4 en React en utilisant ces composants et assets.

Apres ce milestone : `localhost:3000/` affiche la homepage complete fidele a la v4, avec hero photo, 3 piliers, section approche, temoignages, blog preview, section sociale, CTA final — tout responsive 375px et avec les tokens v4.

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind CSS, Server Components. Pas de nouvelle dependance npm.

---

## Fichiers a lire AVANT de commencer

1. **`~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`** → source de verite visuelle. Lis le markup HTML pour chaque section (hero, piliers, approche, temoignages, blog, social, CTA final). Les CSS sont deja extraits — concentre-toi sur la structure, le contenu textuel, et les photos.

2. **`app/(public)/_components/`** → 13 composants disponibles. Tous utilisent `export default`. Lis rapidement chacun pour connaitre les props exactes.

3. **`public/site/judith/manifest.json`** → 8 photos avec slug, dimensions (width/height), filenameAvif/filenameWebp. Mapping photos v4 :
   - **Hero** : portrait-01 (1600x2400, EricBates-1)
   - **Pilier 1 Fertilite** : portrait-07 (1600x2400, EricBates-9) — **ATTENTION max 500px rendu, lazy loading obligatoire**
   - **Pilier 2 Grossesse** : portrait-06 (1600x2400, EricBates-8)
   - **Pilier 3 Sociale** : portrait-02 (1600x2400, EricBates-3)
   - **Approche** : portrait-05 (1600x1067, EricBates-7)
   - **A propos** : portrait-08 (1600x1067, EricBates-12)
   - **Social card** : portrait-03 (1600x2400, EricBates-4)

4. **`public/site/svg/`** → 3 SVG + 1 WebP : `yoga3.svg` (29 KB), `plant.webp` (113 KB, raster fallback), `reproductive-flowers.svg` (60 KB), `hands-lotus.svg` (67 KB). **`plant.svg` a ete supprime** — utiliser `plant.webp` pour les decos botaniques.

5. **`project-docs/02_ROADMAP/migration-wix/MW-A1b_assets-v4/NOTES.md`** section "Note pour MW-C1" → strategies de consommation :
   - **Option A** (`<img>` natif) pour les photos decoratives et SVG — sert les fichiers pre-optimises
   - **Option B** (`<picture>` AVIF+WebP) pour le hero LCP
   - **PaperTexture** : `variant="real"` pour les sections qui veulent la vraie texture (max 2-3 fois)

6. **`app/(public)/layout.tsx`** → preload AVIF texture deja en place. SiteHeader + SiteFooter herites automatiquement.

7. **`docs/migration-wix/CLAUDE.md`** → invariants : La Source en Soi, vouvoiement, pas de framework UI.

---

## Architecture : decoupe en sous-composants

La homepage est decoupee en **7 composants de section** dans `app/(public)/_sections/` (nouveau dossier) pour rester sous la limite de 150 lignes. La page `page.tsx` les assemble.

```
app/(public)/page.tsx              (~50 lignes — metadata + assemblage)
app/(public)/_sections/
  HeroSection.tsx                  (~80 lignes)
  PiliersSection.tsx               (~70 lignes)
  ApprocheSection.tsx              (~80 lignes)
  TemoignagesSection.tsx           (~70 lignes)
  BlogPreviewSection.tsx           (~80 lignes)
  SocialSection.tsx                (~60 lignes)
  CtaFinalSection.tsx              (~50 lignes)
```

Tous Server Components, `export default`, pas de `'use client'`.

---

## Livrable 1 — HeroSection.tsx

**Structure** (fidele a la v4) :

```
<section> fond gradient beige-bg → beige-light, grain overlay, position relative
  <GrainOverlay>
    <div max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px]>

      <!-- Gauche : contenu -->
      <div>
        Kicker badge : "ACUPUNCTRICE · MEMBRE OAQ · ROSEMONT"
        H1 : "Venez comme vous etes." (74px serif, "etes" en italic + underline warm)
        Subtitle : "Acupunctrice a Rosemont, j'accompagne..."
        2 CTAs : <CtaButton variant="primary" size="lg">Prendre rendez-vous</CtaButton>
                 <CtaButton variant="secondary">Decouvrir mon parcours</CtaButton>
        Hero meta : 3 lignes (coeur + "Mere de 3 enfants", etc.)
      </div>

      <!-- Droite : photo hero -->
      <div>
        <picture> (Option B — LCP)
          <source srcSet="/site/judith/judith-portrait-01.avif" type="image/avif" />
          <source srcSet="/site/judith/judith-portrait-01.webp" type="image/webp" />
          <img src="/site/judith/judith-portrait-01.webp"
               alt="Judith Dufour-Savard, acupunctrice a Rosemont"
               width="1600" height="2400"
               fetchPriority="high"
               className="w-full aspect-[4/5] object-cover object-[center_15%] rounded-[20px] shadow-public-photo" />
        </picture>
      </div>
    </div>

    <!-- Decoratif : WatermarkText "Soin" en bas a droite -->
    <WatermarkText text="Soin" className="bottom-8 right-8" opacity={0.05} />
  </GrainOverlay>
</section>
```

**Photo hero** : `portrait-01` via `<picture>` avec `fetchPriority="high"` (Option B du NOTES MW-A1b). C'est le seul element avec fetchPriority="high" sur la page.

**Decoratifs** : `<WatermarkText>` "Soin" en bas a droite. Pas de SVG deco dans le hero pour le MVP (le SVG "femme enceinte" de la v4 n'a pas ete migre en MW-A1b — ce n'est pas un des 4 SVG selectionnes).

---

## Livrable 2 — PiliersSection.tsx

**Structure** :

```
<PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
  <div max-w-[1280px] mx-auto relative>
    <!-- SVG deco yoga (desktop only) -->
    <BotanicalDeco position="top-left" opacity={0.22} size={520}>
      <img src="/site/svg/yoga3.svg" alt="" aria-hidden="true" className="w-full h-full" />
    </BotanicalDeco>

    <SectionNumber number="01" />
    <SectionHeading
      kicker="TROIS DOMAINES, UN MEME SOIN"
      title="Ce pour quoi on me consulte le plus"
      subtitle="Chaque parcours est unique, mais il y a trois univers..."
    />

    <!-- 3 PilierCards en grille avec offsets asymetriques -->
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-[72px]">
      <div className="md:translate-y-6">
        <PilierCard title="Fertilite" description="..." href="/services/fertilite"
          image="/site/judith/judith-portrait-07.webp" />
      </div>
      <div>
        <PilierCard title="Grossesse & perinatalite" description="..." href="/services/grossesse"
          image="/site/judith/judith-portrait-06.webp" featured />
      </div>
      <div className="md:translate-y-12">
        <PilierCard title="Acupuncture sociale" description="..." href="/services/acupuncture-sociale"
          image="/site/judith/judith-portrait-02.webp" />
      </div>
    </div>
  </div>
</PaperTexture>
```

**Photos piliers** : via `<img>` natif (Option A). `portrait-07` (fertilite) est la plus lourde (307 KB AVIF) — PilierCard utilise `next/image` avec `fill` donc les images sont lazy-loaded par defaut. A 500px rendu max dans une card, c'est acceptable.

**Texture** : `<PaperTexture variant="real">` — 1ere utilisation de la vraie texture papier.

---

## Livrable 3 — ApprocheSection.tsx

```
<GrainOverlay className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
  <div max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 md:gap-[72px] relative>

    <BotanicalDeco position="top-right" opacity={0.14} size={500}>
      <img src="/site/svg/hands-lotus.svg" alt="" aria-hidden="true" className="w-full h-full" />
    </BotanicalDeco>

    <div>
      <SectionNumber number="02" align="left" />
      <SectionHeading kicker="MON APPROCHE" title="Un soin qui prend le temps." align="left" />
      <p>Je crois que chaque personne...</p>
      <p>Dans mon cabinet, chaque seance dure <strong>60 minutes</strong>...</p>
      <p>Pas de promesses, pas de recettes. Juste une pratique <strong>profondement humaine</strong>...</p>
    </div>

    <div>
      <img src="/site/judith/judith-portrait-05.webp"
           alt="Judith en consultation" width="1600" height="1067"
           loading="lazy" className="w-full rounded-[14px] shadow-public-photo aspect-[4/5] object-cover" />
    </div>
  </div>
</GrainOverlay>
```

**Photo approche** : `portrait-05` via `<img>` natif (Option A, lazy loading).

---

## Livrable 4 — TemoignagesSection.tsx

```
<PaperTexture variant="real" className="bg-public-beige-warm py-[68px] md:py-[104px] px-5 md:px-8">
  <div max-w-[1280px] mx-auto>
    <SectionNumber number="03" />
    <SectionHeading
      kicker="CE QU'ELLES EN DISENT"
      title="Des parcours reels"
      subtitle="Temoignages anonymises, partages avec leur accord."
    />

    <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] md:grid-rows-2 gap-6 mt-12">
      <TestimonialCard featured
        quote="Ce qui m'a le plus frappee, c'est son ecoute..."
        name="Sarah, 36 ans" detail="Parcours FIV · Rosemont" />
      <TestimonialCard
        quote="Des la deuxieme seance, j'ai senti une vraie difference..."
        name="Marie-Eve, 32 ans" detail="Grossesse · Rosemont" />
      <TestimonialCard
        quote="Je suis etudiante et je n'avais jamais les moyens..."
        name="Noemie, 24 ans" detail="Acupuncture sociale · Rosemont" />
    </div>
  </div>
</PaperTexture>
```

**Texture** : 2eme utilisation de `<PaperTexture variant="real">`.

**Temoignages** : hardcodes pour le MVP. Les prenoms/ages sont ceux de la v4.

---

## Livrable 5 — BlogPreviewSection.tsx + section A propos condensee

**2 sous-sections dans le meme fichier** (ou decouper si > 150 lignes) :

### Section 04 — A propos condense

```
<section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
  <div max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-12 relative>
    <div>
      <img src="/site/judith/judith-portrait-08.webp"
           alt="Judith Dufour-Savard" width="1600" height="1067"
           loading="lazy" className="w-full rounded-[14px] shadow-public-photo aspect-[3/4] object-cover object-[center_20%]" />
    </div>
    <div>
      <SectionNumber number="04" align="left" />
      <SectionHeading kicker="QUI JE SUIS" title="Je suis Judith." align="left" />
      <p>Avant de devenir acupunctrice, <strong>j'ai travaille en maison de naissance</strong>...</p>
      <p>Ma pratique, c'est un melange de ce que j'ai appris...</p>
      <div className="flex flex-wrap gap-3 my-7">
        {badges : Membre OAQ, La Source en Soi, Mere de 3 enfants}
      </div>
      <CtaButton variant="primary" size="lg" href="/a-propos">Lire mon parcours complet</CtaButton>
    </div>
  </div>
</section>
```

### Section 05 — Blog preview

Carrousel horizontal scrollable avec 6 cards blog (donnees hardcodees pour le MVP, la version dynamique viendra via `<RecentPosts />` en MW-F1).

```
<section className="bg-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
  <SectionNumber number="05" />
  <SectionHeading kicker="LE CARNET" title="Derniers articles" subtitle="..." />

  <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory mt-12 pb-4 -mx-5 px-5 md:-mx-8 md:px-8">
    {6 blog cards : titre, categorie, excerpt, image, date, temps de lecture}
  </div>

  <Link href="/blog" className="...">Voir tous les articles du carnet</Link>
</section>
```

**Si > 150 lignes** : extraire `AboutSection.tsx` dans un fichier separe.

---

## Livrable 6 — SocialSection.tsx

Section "Suivez Judith" avec card Instagram et liens sociaux.

```
<section className="bg-white border-y border-public-border-subtle py-[68px] md:py-[88px] px-5 md:px-8">
  <div max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[260px_1fr_auto] gap-10>
    <!-- Card Instagram avec photo portrait-03 -->
    <!-- Texte "Suivez mon quotidien" -->
    <!-- Pills Instagram + YouTube -->
  </div>
</section>
```

---

## Livrable 7 — CtaFinalSection.tsx

CTA plein largeur sur fond taupe gradient.

```
<section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[108px] px-5 md:px-8 border-t-[3px] border-public-accent-warm relative overflow-hidden">
  <!-- BotanicalDeco avec plant.webp gauche + droite mirroir (mode screen) -->
  <BotanicalDeco position="bottom-left" opacity={0.55} size={500}>
    <img src="/site/svg/plant.webp" alt="" aria-hidden="true" className="w-full h-full" />
  </BotanicalDeco>
  <BotanicalDeco position="bottom-right" opacity={0.55} size={500}>
    <img src="/site/svg/plant.webp" alt="" aria-hidden="true" className="w-full h-full scale-x-[-1]" />
  </BotanicalDeco>

  <div max-w-[720px] mx-auto text-center relative z-10>
    <span kicker>PRETE A COMMENCER</span>
    <h2 className="font-public-serif text-[36px] md:text-[54px] ...">Venez comme vous etes.</h2>
    <p italic serif>60 minutes d'ecoute, d'evaluation et de soin. A La Source en Soi, sur Beaubien Est, dans Rosemont.</p>
    <CtaButton variant="white" size="lg" href="https://www.gorendezvous.com/fr/lasourceensoi">
      Prendre rendez-vous en ligne
    </CtaButton>
    <!-- Coordonnees : adresse + telephone -->
  </div>
</section>
```

**BotanicalDeco** : utilise `plant.webp` (raster 113 KB) pas le SVG. Le `mixBlendMode` par defaut de BotanicalDeco est `multiply` — pour la section CTA la v4 utilise `screen`. Passer le style via className ou ajuster le style inline. **Question strategique QS1** ci-dessous.

---

## Livrable 8 — page.tsx (assemblage)

```typescript
import type { Metadata } from 'next';
import HeroSection from './_sections/HeroSection';
import PiliersSection from './_sections/PiliersSection';
import ApprocheSection from './_sections/ApprocheSection';
import TemoignagesSection from './_sections/TemoignagesSection';
import BlogPreviewSection from './_sections/BlogPreviewSection';
import SocialSection from './_sections/SocialSection';
import CtaFinalSection from './_sections/CtaFinalSection';

export const metadata: Metadata = {
  title: 'Accueil',
  description: 'Acupunctrice a Montreal, specialisee en fertilite, grossesse et acupuncture sociale. Clinique La Source en Soi a Rosemont. 4,9/5 sur Google.',
};

export default function PublicHomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }} />
      <HeroSection />
      <PiliersSection />
      <ApprocheSection />
      <TemoignagesSection />
      <BlogPreviewSection />
      <SocialSection />
      <CtaFinalSection />
    </>
  );
}

const SCHEMA_ORG = { ... Person + MedicalClinic ... };
```

**Schema.org** (JSON-LD) :
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Judith Dufour-Savard",
  "jobTitle": "Acupunctrice",
  "image": "/site/judith/judith-portrait-01.webp",
  "url": "https://acupuncturejudith.ca",
  "worksFor": {
    "@type": "MedicalClinic",
    "name": "La Source en Soi",
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
```

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`, `next.config.mjs`, `firestore.rules`
- **Ne pas modifier** les composants MW-B3 dans `_components/` sauf si un bug bloque (dans ce cas, documenter dans NOTES.md)
- **Ne pas** utiliser `next/image` pour les photos pre-optimisees (Option C a eviter — re-encodage). Utiliser `<picture>` pour le hero LCP (Option B) et `<img>` natif pour le reste (Option A)
- **Ne pas** utiliser `portrait-07` (fertilite) comme hero ou element LCP — max 500px rendu, lazy loading obligatoire
- **PaperTexture variant="real"** : max 2-3 utilisations (sinon le preload AVIF perd son ROI)
- Composants < 150 lignes — extraire des sous-fichiers si necessaire
- Mobile-first 375px
- Pas d'emojis dans l'UI
- `export default` pour tous les composants
- Pas de `'use client'` — tout est Server Component

---

## Mobile first (SEO critique)

- **Hero** : grille 1 colonne, photo sous le texte, H1 48px, decoratifs caches
- **Piliers** : 1 colonne, pas d'offset vertical sur les cards
- **Approche** : 1 colonne, photo au-dessus du texte (order swap)
- **Temoignages** : 1 colonne, toutes les cards meme taille
- **Blog** : cards 280px dans le scroll horizontal
- **Social** : 1 colonne, card Instagram centree 240px max
- **CTA final** : H2 36px, coordonnees en colonne
- **Aucun debordement horizontal** a 375px
- Padding horizontal `px-5` minimum partout

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] 7 fichiers dans `app/(public)/_sections/` + `page.tsx` modifie
- [ ] Chaque section < 150 lignes (ou sous-composant extrait)
- [ ] `localhost:3000/` affiche la homepage complete : hero + 3 piliers + approche + temoignages + blog preview + social + CTA final
- [ ] Photo hero en `<picture>` avec `fetchPriority="high"` (portrait-01 AVIF + WebP)
- [ ] Photos piliers/approche/about en `<img>` natif avec `loading="lazy"`
- [ ] SVG deco via `<BotanicalDeco>` avec `<img src="/site/svg/...">` en children
- [ ] `<PaperTexture variant="real">` utilise max 2-3 fois
- [ ] Schema.org `Person + MedicalClinic` en JSON-LD dans le HTML source
- [ ] **Mobile 375px** : aucun scroll horizontal, H1 rentre, photos responsive
- [ ] `localhost:3000/calendrier` fonctionne sans regression
- [ ] `git diff` ne montre **aucune modification** dans `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`, `next.config.mjs`, `_components/`
- [ ] `NOTES.md` cree avec resume et decisions visuelles prises

---

## Notes d'execution (conseils)

- **Ordre recommande** : creer le dossier `_sections/` → HeroSection (le plus critique, tester le LCP) → PiliersSection → ApprocheSection → TemoignagesSection → BlogPreviewSection + AboutSection → SocialSection → CtaFinalSection → page.tsx assemblage → build → tests
- **Le contenu textuel** vient de la v4 HTML — copier-coller le texte exact (adapter le vouvoiement si besoin, mais la v4 est deja en vouvoiement sauf le hero qui tutoie dans certains passages)
- **Blog preview** : les 6 cards sont hardcodees pour le MVP. Utiliser les titres/excerpts reels des articles dans `publicBlog` Firestore si tu veux, ou copier depuis la v4. Le composant dynamique `<RecentPosts />` (MW-F1) remplacera cette section.
- **Section separateur zen stones** : la v4 a un petit separateur entre piliers et approche. Optionnel — si ca fait gagner du temps, le skipper. Ce n'est pas un SVG migre en MW-A1b.
- **Les 3 temoignages** sont hardcodes avec les noms/ages de la v4 (Sarah 36 ans, Marie-Eve 32 ans, Noemie 24 ans). Ce sont des temoignages fictifs de la maquette — mais comme ils sont dans le HTML de la homepage (pas dans Firestore), ils ne sont pas filtres par le mecanisme `status: 'draft'`. A valider avec Benoit si ces noms peuvent rester en production.

---

## Commit final attendu

```
feat(public): MW-C1 homepage portee de v4 (hero, piliers, approche, temoignages, blog, CTA)
```

Message detaille :

```
- 7 sections extraites dans app/(public)/_sections/
- Hero avec <picture> AVIF+WebP fetchPriority high (LCP)
- 3 piliers avec PilierCard + PaperTexture real + BotanicalDeco yoga3.svg
- Approche + temoignages + blog preview + social + CTA final
- Schema.org Person + MedicalClinic JSON-LD
- Photos via <img>/<picture> (Options A/B MW-A1b), pas de next/image
- Mobile-first 375px, responsive md: breakpoints
- Zero modification Hub admin
- Ref: MW-C1, homepage-v4.html, MW-B3, MW-A1b
```

**Pas de merge dans `main`** — Benoit review.

---

## Questions strategiques pour review Desktop

### QS1 — BotanicalDeco mix-blend-mode pour la section CTA

**Contexte** : `BotanicalDeco.tsx` (MW-B3) applique `mixBlendMode: 'multiply'` en inline style. La section CTA de la v4 utilise `blend-mode: screen` pour les SVG botaniques (fond sombre). Deux options :

- **(a)** Ajouter un prop `blendMode?: 'multiply' | 'screen'` a `BotanicalDeco.tsx` — modification d'un composant MW-B3 (~2 lignes)
- **(b)** Ne pas utiliser `BotanicalDeco` pour le CTA — positionner le `<img>` manuellement avec un `<div>` absolu et `style={{ mixBlendMode: 'screen' }}`
- **(c)** Passer un `style` override via la prop `className` de BotanicalDeco — ne fonctionne pas car `mixBlendMode` est en style inline (priorite sur les classes)

**Reco** : option (a) — 2 lignes de modif, propre, reutilisable. Mais ca touche a `_components/` ce qui est interdit par les contraintes. Alternative : option (b) pour le MVP.

### QS2 — Blog preview : hardcode ou query Firestore ?

**Contexte** : la section blog peut soit hardcoder les 6 articles (comme la v4), soit querier `publicBlog` Firestore pour avoir les vrais titres/excerpts/images.

- **(a)** Hardcode 6 articles (fidele a la v4, zero dep Firestore dans la homepage)
- **(b)** Query Firestore (toujours a jour, mais ajoute une dep serveur a la page d'accueil)

**Reco** : option (b) — la homepage est deja SSG + ISR, querier Firestore ajoute juste 1 appel au build. Les donnees sont fraiches et les images sont deja dans Storage. MW-F1 (`RecentPosts`) fera la meme chose — autant commencer maintenant.

---

## References

- Maquette v4 : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`
- Composants MW-B3 : `app/(public)/_components/`
- Assets MW-A1b : `public/site/judith/manifest.json`, `public/site/svg/`, `public/site/textures/`
- MW-A1b NOTES : section "Note pour MW-C1"
- Invariants : `docs/migration-wix/CLAUDE.md`
- Plan strategique : §4.6, §8.1b, §9.1
- Skill : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt drafte le 14 avril 2026 par Claude Code (Opus). Execution apres review Desktop.*
