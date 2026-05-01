# Mission CC : Finitions Phase 2 — 5 sections Accueil restantes

## Contexte

Phase 2 (commit `4d1c1aa` puis fix `7968518`) a anime le Hero et le CtaFinal de l'Accueil. Mais 5 sections au milieu sont marquees `'use client'` avec imports d'animation, **mais sans wrapping JSX actif**.

Resultat : Hero spectaculaire (cascade orchestree) → 5 sections plates au milieu → CtaFinal spectaculaire (FloatingDeco + Magnetic). Le creux visuel est trop marque, comme on a corrige sur Pediatrie/Sociale.

Cette mission applique des animations sobres aux 5 sections concernees pour combler le trou.

**5 fichiers a modifier** :

- `app/(public)/_sections/PiliersSection.tsx` (4 cards des piliers)
- `app/(public)/_sections/ApprocheSection.tsx` (texte editorial)
- `app/(public)/_sections/AboutSection.tsx` (mini-bio Judith)
- `app/(public)/_sections/SocialSection.tsx` (mention acupuncture sociale)
- `app/(public)/_sections/TemoignagesSection.tsx` (grid de temoignages)

Tous ont deja `'use client'` + imports `Reveal` / `StaggerChildren` / `HoverLift` / etc. mais **aucun wrapping actif dans le JSX**.

Ne PAS toucher : HeroSection, BlogPreviewSection (server component, fixe), CtaFinalSection.

## Source de verite : patterns Fertilite/Pediatrie deja corriges

Reference les patterns deja deployes :

| Type de section | Fichier reference | Pattern |
|-----------------|-------------------|---------|
| Cards grid (Piliers) | `ServiceFertiliteInfosSection.tsx` ou `ServicePediatrieInfosSection.tsx` | `StaggerChildren scale=0.92 y=28 stagger=0.12` + `HoverLift` autour de chaque card |
| Texte editorial (Approche) | `ServiceFertiliteBioSection.tsx` | `Reveal scaleFrom={0.7}` sur SectionNumber + `Reveal` sur heading + `Reveal delay={0.15}` sur bloc paragraphes |
| Mini-bio (About) | `ServiceFertiliteBioSection.tsx` | Meme pattern Bio. **PAS de RevealWords** |
| Mention texte (Social) | `ServiceFertiliteCollaborationSection.tsx` | `Reveal` sur heading + `Reveal delay` sur paragraphes (PAS de ligne horizontale) |
| Grid temoignages | `ServiceFertiliteInfosSection.tsx` (pattern cards) | `StaggerChildren` + `HoverLift` sur chaque card temoignage |

## Mapping section -> pattern

### PiliersSection (4 cards des piliers)
- `Reveal` autour du SectionNumber et du heading
- `StaggerChildren scale=0.92 y=28 stagger=0.12` autour du grid des 4 cards (fertilite, grossesse, pediatrie, sociale)
- `HoverLift` autour de chaque card (effet lift + ombre au hover)

### ApprocheSection
- `Reveal scaleFrom={0.7}` sur SectionNumber
- `Reveal` sur SectionHeading
- `Reveal delay={0.15}` sur le bloc de paragraphes
- Si la section a un grid d'elements/illustrations, `StaggerChildren` autour

### AboutSection (mini-bio Judith sur Accueil)
- `Reveal scaleFrom={0.7}` sur SectionNumber
- `Reveal` sur SectionHeading
- `Reveal delay={0.15}` sur le bloc de paragraphes (texte de la bio)
- `Reveal delay={0.4}` sur le badge OAQ ou autre element final si present
- **PAS de RevealWords** — Judith a refuse cet effet sur les bio

### SocialSection (mention acupuncture sociale)
- `Reveal` sur le heading
- `Reveal delay={0.15}` sur les paragraphes
- Si CTA present, le wrapper avec `MagneticButton` pour la coherence

### TemoignagesSection
- `Reveal` autour du SectionNumber et du heading
- `StaggerChildren scale=0.92 y=28 stagger=0.12` autour du grid de temoignages
- `HoverLift` autour de chaque card de temoignage

## Regles d'engagement (NE PAS DEVIER)

1. **JAMAIS** introduire CountUp, RevealWords, ScrollHighlightText, ligne horizontale qui se trace.
2. **JAMAIS** introduire de `sectionRef` non attache au JSX.
3. **TOUJOURS** preserver le contenu textuel original a 100%. Les textes ont ete rediges avec soin par Judith.
4. **TOUJOURS** mettre `opacity: 0.01` sur les inline styles initiaux (LCP-friendly trick) **uniquement si l'element fait partie du LCP candidate** (donc surtout sur les heading H2 grands). Pour les sections du milieu de page, c'est moins critique mais ca ne fait pas de mal.
5. **NE PAS** toucher aux 3 fichiers deja animes (Hero, BlogPreview, CtaFinal).
6. Utiliser les composants animation existants depuis `app/(public)/_components/animations/`, ne pas en inventer.

## Verifications speciales

- **AboutSection (mini-bio Accueil)** : la bio Judith sur l'Accueil est plus courte que celle de la page A propos. Preserver telle quelle, ne pas rallonger ou raccourcir.
- **PiliersSection** : 4 cards correspondant aux 4 services. Garder l'ordre actuel et les liens vers les pages services correctement.
- **TemoignagesSection** : si les temoignages sont hardcodes, ne pas modifier les textes. Si ils viennent d'une lib, ne pas convertir en async.

## Tests

```bash
npm run build
npx tsc --noEmit
```

Test manuel sur `localhost:3000/` :
- Scroller du haut au bas
- Plus de "trou plat" entre Hero et CtaFinal
- Cards Piliers en stagger + hover lift
- Sections texte (Approche, About, Social) avec Reveal subtil
- Temoignages en stagger + hover lift
- prefers-reduced-motion : tout apparait instantanement

Console DevTools : aucune erreur, aucun warning hydration.

**Build error a EVITER** : si une section utilise firestore/firebase-admin, ne PAS la convertir en client. Vu que les 5 sections ne le font pas (verifie), il n'y a pas de risque, mais reste vigilant : si tu vois `import { ... } from '@/lib/firestore/...'` ou `firebase-admin`, **ARRETER et signaler**.

## Commit

Un seul commit a la fin :

```
feat(accueil): finitions Phase 2 sur 5 sections du milieu

Application des patterns Reveal/StaggerChildren/HoverLift sur les sections
de l'accueil qui etaient marquees client mais sans wrapping actif :
- PiliersSection : StaggerChildren + HoverLift sur les 4 cards
- ApprocheSection : Reveal sur SectionNumber + heading + paragraphes
- AboutSection : Reveal simple (PAS de RevealWords)
- SocialSection : Reveal heading + paragraphes
- TemoignagesSection : StaggerChildren + HoverLift sur grid

Phase 2 totalement complete sur l'Accueil.
Plus de "trou plat" entre Hero anime et CtaFinal anime.

Decisions Judith respectees :
- Pas de CountUp
- Pas de RevealWords
- Pas de ScrollHighlightText
- Pas de ligne horizontale qui se trace

Contenu textuel preserve a 100%.
Aucune section convertie en async (BlogPreview reste server-side).
```
