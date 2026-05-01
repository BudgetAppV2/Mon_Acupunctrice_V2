# Mission CC : Propagation animations GSAP aux pages publiques

## Contexte

Le site Judith Dufour-Savard (acupunctrice Rosemont/Repentigny) lance le **3 mai 2026**. La page laboratoire `/lab/animations` a été validée visuellement par Judith. Cette mission propage les animations à toutes les pages publiques, **avant le launch**.

Branche actuelle : `feature/site-public-migration`. Commit point de retour : `c0f7988`.

**Ce qui a été fait précédemment** :
- 12 composants animation réutilisables dans `app/(public)/_components/animations/`
- Lenis smooth scroll + setup ScrollTrigger dans `app/(public)/lab/animations/LenisProvider.tsx`
- Versions labo des sections Fertilité dans `app/(public)/_sections/_lab/`
- Page lab `/lab/animations` qui orchestre tout

## Décisions stratégiques (NE PAS REMETTRE EN QUESTION)

### Stratégie hero par type de page
- **Pages services** (Fertilité, Grossesse, Pédiatrie, Sociale) : **clip-path rideau qui se lève** (effet wow, comme la page lab)
- **Accueil** : **blur-to-focus** (photo visible immédiatement, blur 8px → 0 + scale 1.06 → 1). Plus subtil mais préserve le LCP qui est CRITIQUE sur la page d'entrée principale du site (la plus indexée par Google)
- **À propos** : reveal simple sans transformation lourde sur la photo
- **Ressources, FAQ, Tarifs, Contact, Blog** : pas de hero photo dramatique

### Pattern LCP-friendly à respecter PARTOUT
Découverte critique : Chrome ignore `opacity: 0` pour le LCP, mais `opacity: 0.01` est traité comme "visible".

**Règle d'or** : **TOUS les éléments animés en fade-in démarrent à `opacity: 0.01`**, pas `0`. L'œil ne voit pas la différence, mais Lighthouse mesure correctement le LCP au first paint.

Les composants `<Reveal>` et `<RevealWords>` ont déjà été calibrés pour ce comportement — il suffit de les utiliser.

### Tier d'animation par page

| Tier | Pages | Effets appliqués |
|------|-------|------------------|
| **Signature** | Fertilité, Grossesse, Pédiatrie, Sociale | Hero clip-path + cards reveal mask + CountUp + MagneticButton + ScrollHighlight + témoignage timeline |
| **Vitrine** | Accueil | Hero blur-to-focus simplifié + Reveal sections + MagneticButton CTAs + CountUp métriques |
| **Éditorial** | À propos, Ressources `[slug]` | Reveal + RevealWords sur bio + ScrollHighlight sur paragraphes scientifiques |
| **Minimal** | FAQ, Tarifs, Contact, Blog, listings | Juste `<Reveal>` au scroll + arrow-link sur les liens "→" |

### Rules of engagement (techniques)

1. **NE PAS modifier les pages originales en place** sans avoir d'abord testé. À chaque phase, build + test Lighthouse avant de passer à la suivante.
2. **NE PAS toucher à la page `/lab/animations`** — elle reste comme référence et "musée" du résultat lab. Elle sera supprimée à la phase finale UNIQUEMENT après validation Benoit.
3. **NE PAS supprimer les sections `_lab/`** avant phase finale.
4. **NE PAS réinstaller de deps** — toutes les libs nécessaires sont déjà installées (gsap, @gsap/react, lenis).
5. **TOUJOURS** ajouter `'use client';` en top des sections qu'on transforme en client component (la plupart des sections sont actuellement server-rendered).
6. **TOUJOURS** vérifier `npm run build` + `npx tsc --noEmit` à la fin de chaque phase.
7. **TOUJOURS** committer à la fin de chaque phase (5 commits attendus).
8. **JAMAIS** supprimer ou modifier `lib/`, `app/(public)/_components/animations/` (déjà finalisé).

## Architecture

### Composants animation disponibles (à importer)

Tous dans `app/(public)/_components/animations/` :

```tsx
import Reveal from '@/app/(public)/_components/animations/Reveal';
import RevealFromLeft from '@/app/(public)/_components/animations/RevealFromLeft';
import RevealWords from '@/app/(public)/_components/animations/RevealWords';
import StaggerChildren from '@/app/(public)/_components/animations/StaggerChildren';
import HoverLift from '@/app/(public)/_components/animations/HoverLift';
import DrawUnderline from '@/app/(public)/_components/animations/DrawUnderline';
import FloatingDeco from '@/app/(public)/_components/animations/FloatingDeco';
import HeroEntrance from '@/app/(public)/_components/animations/HeroEntrance';
import CountUp from '@/app/(public)/_components/animations/CountUp';
import MagneticButton from '@/app/(public)/_components/animations/MagneticButton';
import ParallaxScroll from '@/app/(public)/_components/animations/ParallaxScroll';
import ScrollHighlightText from '@/app/(public)/_components/animations/ScrollHighlightText';
```

(Adapter les imports relatifs selon où on se trouve dans l'arbre.)

### Référence implémentation : page lab

Pour chaque section à animer, référer aux versions labo dans `app/(public)/_sections/_lab/` :
- `ServiceFertiliteHeroSectionLab.tsx` — pattern hero clip-path + timeline GSAP unifiée
- `ServiceFertiliteBioSectionLab.tsx` — pattern Reveal + RevealWords
- `ServiceFertiliteBenefitsSectionLab.tsx` — pattern cards reveal mask en stagger
- `ServiceFertiliteCollaborationSectionLab.tsx` — pattern ligne horizontale qui se trace
- `ServiceFertiliteHommeSectionLab.tsx` — pattern ScrollHighlightText
- `ServiceFertiliteTemoignageSectionLab.tsx` — pattern timeline témoignage (quote scale + signature glissée)
- `ServiceFertiliteInfosSectionLab.tsx` — pattern CountUp + StaggerChildren + HoverLift
- `ServiceFertiliteCtaSectionLab.tsx` — pattern CTA bottom (FloatingDeco + MagneticButton + shimmer)

**Réutiliser ces patterns tels quels** — c'est la version validée par Judith.

---

## PHASE 0 — Setup global Lenis

**Objectif** : Lenis smooth scroll actif sur TOUT le site public, pas juste lab.

### 0.1 Déplacer LenisProvider

Move `app/(public)/lab/animations/LenisProvider.tsx` → `app/(public)/_components/LenisProvider.tsx`.

Adjuste les imports dans `app/(public)/lab/animations/page.tsx` pour pointer vers le nouveau chemin.

### 0.2 Ajouter LenisProvider au layout public

Modifier `app/(public)/layout.tsx` pour inclure `<LenisProvider />` après `<SiteHeader />` (ou juste avant `{children}`). Lenis fonctionne au niveau document, donc il sera actif sur toutes les pages publiques.

**Important** : `LenisProvider` est `'use client'`. Il s'injecte sans casser le SSR de la page.

### 0.3 Tests phase 0

```bash
npm run build  # Doit réussir
npx tsc --noEmit  # Aucune erreur
```

Test manuel : naviguer sur `/` (accueil), `/services/fertilite`, `/a-propos`, `/faq` — le scroll doit être **fluide partout** (pas saccadé). Aucune autre animation ajoutée à ce stade.

### 0.4 Commit phase 0

```
feat(public): Lenis smooth scroll actif sur tout le site public

- Move LenisProvider de lab/animations vers _components/
- Inclure dans layout.tsx public
- Smooth scroll desktop + smoothWheel + lerp 0.1
- Sync ScrollTrigger via gsap.ticker
- Respecte prefers-reduced-motion
- Aucun autre changement visuel
```

---

## PHASE 1 — Pages services (le gros du travail)

**Objectif** : appliquer les animations Tier Signature aux 4 pages services.

### 1.1 Page Fertilité (référence — appliquer en premier)

Modifier directement les 8 sections originales `app/(public)/_sections/ServiceFertilite*.tsx` (sans suffixe `_Lab`) en s'inspirant **exactement** du pattern des versions `_Lab`.

**IMPORTANT** : NE PAS copier-coller mécaniquement le contenu des `_Lab` versions. Pourquoi ? Parce que les versions `_Lab` ont du contenu **simplifié** par rapport aux originales (textes raccourcis, certaines features manquantes).

**Approche correcte** : pour chaque section originale, garder son contenu actuel (textes, structures HTML), mais wrap les éléments avec les composants animation comme dans la version `_Lab` correspondante.

Exemple pour `ServiceFertiliteHeroSection.tsx` :
1. Lire l'original pour comprendre sa structure exacte
2. Lire `_Lab/ServiceFertiliteHeroSectionLab.tsx` pour comprendre le pattern animation
3. Réécrire l'original avec :
   - `'use client'` en top
   - Tous les `useRef` + `useGSAP` + timeline GSAP du Lab
   - **Mais avec le contenu textuel de l'original**
   - Photo Judith via `clip-path` (pattern Lab)
   - Tous les éléments de texte démarrent à `opacity: 0.01` (LCP-friendly)
   - `MagneticButton` autour des CTAs

Faire la même chose pour les 7 autres sections de Fertilité :
- `ServiceFertiliteBioSection.tsx` ← pattern de `BioSectionLab` (Reveal + RevealWords paragraphes)
- `ServiceFertiliteBenefitsSection.tsx` ← pattern de `BenefitsSectionLab` (cards reveal mask en stagger)
- `ServiceFertiliteHommeSection.tsx` ← pattern de `HommeSectionLab` (ScrollHighlightText sur 3 paragraphes)
- `ServiceFertiliteCollaborationSection.tsx` ← pattern de `CollaborationSectionLab` (ligne horizontale qui se trace)
- `ServiceFertiliteTemoignageSection.tsx` ← pattern de `TemoignageSectionLab` (timeline avec grand quote)
- `ServiceFertiliteInfosSection.tsx` ← pattern de `InfosSectionLab` (CountUp + StaggerChildren + HoverLift)
- `ServiceFertiliteCtaSection.tsx` ← pattern de `CtaSectionLab` (FloatingDeco + MagneticButton)

Pour `CtaSection`, utiliser le composant original `CtaBotanicalDeco` (PAS le `_Lab`). Wrapper son contenu via `<FloatingDeco>` directement, OU créer une nouvelle version dans `_components/` (pas `_lab/`) qui utilise FloatingDeco.

**Test 1.1** : `npm run dev`, naviguer sur `/services/fertilite`, vérifier visuellement :
- Hero clip-path qui se lève + cascade texte
- Bio : RevealWords mot par mot
- Benefits : cards reveal mask en cascade
- Homme : texte qui s'assombrit au scroll
- Collaboration : ligne horizontale qui se trace
- Témoignage : grand quote + signature glissée
- Infos : compteurs animés
- CTA : feuilles flottantes + magnetic button

### 1.2 Pages Grossesse, Pédiatrie, Sociale

**Approche** : transposer le pattern Fertilité aux 3 autres pages services. Ces pages ont des sections similaires mais pas identiques :

**Grossesse** (7 sections) :
- `ServiceGrossesseHeroSection.tsx` ← clip-path rideau (comme Fertilité)
- `ServiceGrossesseBioSection.tsx` ← RevealWords paragraphes
- `ServiceGrossesseBenefitsSection.tsx` ← cards reveal mask
- `ServiceGrossesseCollaborationSection.tsx` ← ligne horizontale
- `ServiceGrossesseTemoignageSection.tsx` ← timeline témoignage
- `ServiceGrossesseInfosSection.tsx` ← CountUp + cards
- `ServiceGrossesseCtaSection.tsx` ← FloatingDeco + MagneticButton

**Pédiatrie** (7 sections) :
- `ServicePediatrieHeroSection.tsx` ← clip-path rideau
- `ServicePediatrieBioSection.tsx` ← RevealWords
- `ServicePediatrieApprocheSection.tsx` ← Reveal sections + StaggerChildren si grid
- `ServicePediatrieConditionsSection.tsx` ← cards reveal mask en stagger (comme Benefits)
- `ServicePediatrieTemoignageSection.tsx` ← timeline témoignage
- `ServicePediatrieInfosSection.tsx` ← CountUp + cards
- `ServicePediatrieCtaSection.tsx` ← FloatingDeco + MagneticButton

**Sociale** (7 sections) :
- `ServiceSocialeHeroSection.tsx` ← clip-path rideau (mais photo peut-être différente)
- `ServiceSocialeConvictionSection.tsx` ← RevealWords ou Reveal
- `ServiceSocialeFormatSection.tsx` ← cards reveal mask
- `ServiceSocialeNadaSection.tsx` ← Reveal + StaggerChildren si listing
- `ServiceSocialePublicSection.tsx` ← Reveal + StaggerChildren
- `ServiceSocialeInfosSection.tsx` ← CountUp + cards
- `ServiceSocialeCtaSection.tsx` ← FloatingDeco + MagneticButton

### 1.3 Tests phase 1

```bash
npm run build  # Doit réussir
npx tsc --noEmit
```

Test manuel sur les 4 pages services :
- Toutes les animations se déclenchent **au scroll** (pas au mount, sauf hero)
- Pas de jank, pas d'éléments qui flashent
- Test mobile via DevTools (375px) : animations doivent fonctionner ou se simplifier
- `prefers-reduced-motion` activé : tout doit apparaître instantanément, pas de mouvement

Lighthouse sur `/services/fertilite` (en build prod sur :3001) :
- Performance ≥ 75 (target 80+)
- LCP ≤ 4s (acceptable car LCP impacté par clip-path mais opacity 0.01 trick aide)
- CLS = 0
- Accessibility ≥ 95
- SEO = 100

Si Performance < 70, **arrêter et investiguer** avant de continuer.

### 1.4 Commit phase 1

```
feat(services): animations GSAP sur les 4 pages services

Application du pattern de la page lab aux pages publiques services :
- Fertilité, Grossesse, Pédiatrie, Sociale
- Hero : clip-path rideau qui se lève + timeline GSAP unifiée
- Bio : RevealWords paragraphes
- Benefits/Conditions : cards reveal mask en stagger
- Témoignage : timeline orchestrée (quote + signature)
- Infos : CountUp + StaggerChildren + HoverLift
- CTA : FloatingDeco sur botanical SVG + MagneticButton + shimmer
- Tous les textes à opacity 0.01 (LCP-friendly)

Tests Lighthouse OK sur les 4 pages.
Pages publiques originales préservent leur contenu textuel,
seuls les wrappers d'animation ont été ajoutés.
```

---

## PHASE 2 — Page Accueil (Hero spécial blur-to-focus)

**Objectif** : appliquer les animations à l'accueil avec un hero **LCP-friendly différent** des pages services.

### 2.1 Pourquoi un hero différent sur Accueil

L'accueil est :
- La page la plus indexée par Google
- L'entrée principale du site
- Le LCP de cette page est le plus critique pour le SEO global

Le clip-path rideau masque l'image au mount, ce qui peut déclasser le LCP même avec opacity 0.01 trick. Sur l'accueil, on prend zéro risque.

### 2.2 Hero Accueil — Pattern blur-to-focus

Modifier `app/(public)/_sections/HeroSection.tsx` :

```tsx
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import MagneticButton from '../_components/animations/MagneticButton';

export default function HeroSection() {
  const photoRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLSpanElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (prefersReduced) {
      gsap.set([photoRef.current, kickerRef.current, h1Ref.current, paragraphRef.current, ctasRef.current],
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' });
      return;
    }

    // Photo : blur-to-focus (LCP-friendly, photo visible immédiatement)
    gsap.set(photoRef.current, { filter: 'blur(8px)', scale: 1.06, opacity: 1 });

    // Texte : opacity 0.01 (LCP-friendly)
    gsap.set([kickerRef.current, h1Ref.current, paragraphRef.current, ctasRef.current],
      { opacity: 0.01, y: 28 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to(photoRef.current, { filter: 'blur(0px)', scale: 1, duration: 1.4, ease: 'power2.out' }, 0);
    tl.to(kickerRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.3);
    tl.to(h1Ref.current, { opacity: 1, y: 0, duration: 0.8 }, 0.5);
    tl.to(paragraphRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.8);
    tl.to(ctasRef.current, { opacity: 1, y: 0, duration: 0.7 }, 1.0);
  }, { dependencies: [prefersReduced] });

  return (
    /* JSX original avec refs aux éléments + style opacity 0.01 inline + photo avec willChange + fetchPriority="high" */
  );
}
```

CTAs dans MagneticButton.

### 2.3 Sections Accueil

- `PiliersSection.tsx` ← StaggerChildren + HoverLift sur les cards piliers
- `ApprocheSection.tsx` ← Reveal + RevealWords si paragraphes éditoriaux
- `AboutSection.tsx` (mini-bio sur accueil) ← Reveal
- `SocialSection.tsx` ← Reveal
- `TemoignagesSection.tsx` ← StaggerChildren sur les témoignages
- `BlogPreviewSection.tsx` ← StaggerChildren + HoverLift sur les cards d'articles
- `CtaFinalSection.tsx` ← Reveal y=56 + FloatingDeco + MagneticButton + shimmer

### 2.4 Tests phase 2

Lighthouse sur `/` (accueil) en build prod :
- **Performance ≥ 85** (target absolue 90+)
- **LCP ≤ 2.5s** (CRITIQUE — c'est l'accueil)
- CLS = 0
- Accessibility ≥ 95
- SEO = 100

Si LCP > 3s sur accueil, **STOP** et investiguer. Causes possibles :
- Texte H1 démarré à `opacity: 0` au lieu de `0.01`
- Image hero sans `fetchPriority="high"`
- Lenis qui bloque le first paint (devrait pas, mais vérifier)

### 2.5 Commit phase 2

```
feat(accueil): animations GSAP avec hero blur-to-focus LCP-friendly

- Hero : blur 8px → 0 + scale 1.06 → 1 (LCP-safe vs clip-path)
- Photo Judith visible immédiatement, fetchPriority="high"
- Tous textes à opacity 0.01 (LCP-friendly trick)
- Piliers : StaggerChildren + HoverLift
- Témoignages : StaggerChildren
- BlogPreview : StaggerChildren + HoverLift
- CtaFinal : FloatingDeco + MagneticButton + shimmer

Lighthouse Accueil : Performance 85+, LCP < 2.5s
```

---

## PHASE 3 — Pages éditoriales (À propos, Ressources)

**Objectif** : appliquer Tier Éditorial aux pages riches en texte.

### 3.1 À propos

Modifier les 6 sections de `/a-propos` :
- `AboutHeroSection.tsx` ← reveal simple sur photo + texte (PAS de clip-path car photo est différente, pas le hero principal du site)
- `AboutSection.tsx` ← RevealWords sur la bio principale (effet éditorial calme)
- `AboutPratiqueSection.tsx` ← Reveal + StaggerChildren sur grids
- `AboutSpecialitesSection.tsx` ← StaggerChildren sur les cartes spécialités
- `AboutParcoursSection.tsx` ← RevealFromLeft sur la timeline parcours (chronologique = mouvement horizontal cohérent)
- `AboutCliniqueSection.tsx` ← Reveal + HoverLift

### 3.2 Ressources

Modifier le template `app/(public)/ressources/[slug]/page.tsx` (et les composants associés `RessourceCard`, `RessourceFaq`) :
- Hero ressource : Reveal simple
- Sections de contenu (intro, judithApproach, whatToExpect, protocolSection, scienceSection, mechanismSection, testimonial) : `Reveal` au scroll, avec **`<ScrollHighlightText>` sur les paragraphes scientifiques** (sections `scienceSection` et `mechanismSection`) — ça crée un effet "lecture qui se construit" parfait pour les contenus médicaux denses
- FAQ entries : StaggerChildren

### 3.3 Listings (Ressources index, Blog)

- `ressources/page.tsx` ← StaggerChildren sur les cards de ressources + HoverLift sur chaque card
- `blog/page.tsx` ← StaggerChildren sur les cards d'articles + HoverLift
- `blog/[slug]/page.tsx` ← Reveal sur sections du contenu

### 3.4 Tests phase 3

Lighthouse sur `/a-propos` et 1 ressource (ex: `/ressources/acupuncture-fertilite-montreal`) :
- Performance ≥ 80
- LCP ≤ 3s
- CLS = 0

### 3.5 Commit phase 3

```
feat(editorial): animations sur À propos + Ressources + Listings

- À propos : RevealWords sur bio, RevealFromLeft sur parcours
- Ressources : ScrollHighlightText sur paragraphes scientifiques
- Listings ressources/blog : StaggerChildren + HoverLift
- Tier éditorial : effet "lecture qui se construit"
```

---

## PHASE 4 — Pages minimales (FAQ, Tarifs, Contact)

**Objectif** : juste Reveal + arrow-link, pas de feux d'artifice.

### 4.1 FAQ

`app/(public)/faq/page.tsx` :
- Hero/header : Reveal
- Liste des questions : `StaggerChildren` avec stagger plutôt rapide (0.06s) car la liste peut être longue
- **PAS** de RevealWords ici — la FAQ est consultée rapidement, l'animation par mots ralentirait

### 4.2 Tarifs

- Hero : Reveal
- Cards tarif (100 $, 90 $, 35-60 $) : `StaggerChildren` + **`<CountUp>` sur les prix** (effet sympa, prix qui s'incrémentent)
- Schema.org JSON-LD : ne pas toucher

### 4.3 Contact, Reserver

- Pages courtes : juste un `<Reveal>` global au mount

### 4.4 Tests phase 4

Lighthouse sur `/faq`, `/tarifs`, `/contact` :
- Performance ≥ 85 (pages simples, doit être facile)
- LCP ≤ 2.5s
- SEO = 100

### 4.5 Commit phase 4

```
feat(minimal): animations sobres sur FAQ + Tarifs + Contact

- FAQ : Reveal + StaggerChildren rapide
- Tarifs : CountUp sur les prix (100, 90, 35-60)
- Contact, Reserver : Reveal simple
```

---

## PHASE 5 — Cleanup et tests finaux

### 5.1 Supprimer le dossier `_lab/`

UNIQUEMENT après que les phases 1-4 soient validées par Benoit :

```bash
rm -rf app/(public)/_sections/_lab/
rm -rf app/(public)/_components/_lab/
rm -rf app/(public)/lab/  # supprime aussi /lab/animations
```

### 5.2 Tests finaux

`npm run build` final, puis Lighthouse sur :
- `/` (accueil) — cible Performance 85+, LCP ≤ 2.5s
- `/services/fertilite` — cible Performance 75+, LCP ≤ 4s
- `/services/grossesse` — idem
- `/services/pediatrie` — idem
- `/services/acupuncture-sociale` — idem
- `/a-propos` — cible Performance 80+
- `/faq` — cible Performance 85+
- `/tarifs` — cible Performance 85+
- `/ressources/acupuncture-fertilite-montreal` — cible Performance 80+

Tous SEO = 100. Tous CLS = 0.

### 5.3 Test reduced-motion final

Activer `prefers-reduced-motion: reduce` dans le système ou DevTools.
Naviguer sur toutes les pages :
- Aucun translate, scale, blur animation
- Tout apparaît instantanément en `opacity: 1`
- Lenis désactivé, scroll natif
- MagneticButton désactivé
- ScrollHighlightText reste sombre (pas de transition gris→sombre)

### 5.4 Commit phase 5

```
chore(animations): cleanup post-propagation + tests Lighthouse

- Suppression du dossier _lab/ (sections + composants + page)
- Lighthouse OK sur toutes les pages publiques
- prefers-reduced-motion respecté partout
- Site pret pour le launch 3 mai 2026
```

---

## Critères d'acceptation finaux (avant de présenter à Benoit)

- [ ] Phase 0 commit pushé : Lenis sur tout le site
- [ ] Phase 1 commit pushé : 4 pages services animées
- [ ] Phase 2 commit pushé : Accueil avec hero blur-to-focus
- [ ] Phase 3 commit pushé : À propos + Ressources + Listings
- [ ] Phase 4 commit pushé : FAQ + Tarifs + Contact
- [ ] Phase 5 commit pushé : cleanup `_lab/` supprimé
- [ ] `npm run build` final OK
- [ ] `npx tsc --noEmit` final OK
- [ ] Lighthouse Accueil : Performance 85+, LCP < 2.5s ⚠️ CRITIQUE
- [ ] Lighthouse pages services : Performance 75+ chacune
- [ ] CLS = 0 partout
- [ ] SEO = 100 partout
- [ ] prefers-reduced-motion désactive correctement les animations partout
- [ ] Aucun warning hydration en console DevTools
- [ ] Test mobile (375px DevTools) : animations fonctionnent ou se simplifient gracieusement

---

## Plan B si tu rencontres un problème majeur

Si une phase casse complètement (build failed, page blanche en prod) :

1. **Ne pas paniquer**, ne pas commit
2. `git stash` pour mettre tes changements de côté
3. Identifier le fichier qui pose problème via le message d'erreur
4. Si vraiment bloqué, faire un rapport clair à Benoit avec :
   - Le message d'erreur exact
   - La phase concernée
   - La page concernée
   - Ce que tu as essayé

Le launch est dans 4 jours, donc :
- Si une phase prend plus que prévu, **stopper après la phase actuelle** et reporter le reste post-launch
- Mieux vaut 2 phases parfaites que 5 phases bancales

Le commit point de retour est `c0f7988`. En dernier recours, `git reset --hard c0f7988` rétablit l'état pré-propagation complètement.

