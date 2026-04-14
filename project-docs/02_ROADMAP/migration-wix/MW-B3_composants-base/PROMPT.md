# MW-B3 — Composants partagés de base du site public

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir exécuter sans poser de question.

---

## Contexte

MW-B1 a posé le route group `(public)/`, les tokens Tailwind `public-*`, et les fonts (Cormorant Garamond + Inter via `next/font`). MW-B2 a posé les types Firestore. Ce milestone crée les 12 composants React du design system public : 6 composants structurels (header, footer, bouton CTA, carte pilier, carte témoignage, heading) + 2 composants data (ClinicBadge, SectionNumber) + 4 composants décoratifs (PaperTexture, GrainOverlay, BotanicalDeco, WatermarkText). Puis il intègre SiteHeader + SiteFooter dans le layout public et met à jour la homepage placeholder pour valider visuellement le design system.

Après ce milestone : `localhost:3000/` affiche une page avec header sticky + footer + tokens v4 + fonts serif/sans, et toutes les pages placeholder héritent du header/footer via le layout. Le Hub admin fonctionne toujours sans régression.

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind CSS, `@heroicons/react/24/outline`. Server Components par défaut, Client Component uniquement pour SiteHeader (hamburger toggle).

---

## Fichiers à lire AVANT de commencer

Dans cet ordre exact. Ne commence à coder qu'après avoir lu les 7.

1. **`app/(public)/layout.tsx`** → layout public actuel (MW-B1). **Gotcha critique** : c'est un Server Component pur. Tu vas y ajouter `<SiteHeader />` et `<SiteFooter />`, mais `<SiteHeader />` est un Client Component (`'use client'`). C'est OK — un Server Component parent peut importer un Client Component enfant. Ne rajoute PAS `'use client'` au layout lui-même.

2. **`app/(public)/page.tsx`** → homepage placeholder (MW-B1). Tu vas la modifier pour afficher quelques composants en vitrine. Le contenu actuel (H1, kicker, badge inline) sera **remplacé** par des composants vrais.

3. **`tailwind.config.ts`** → tokens `public-*` (MW-B1). **Gotcha** : pas de `borderRadius` custom (utiliser les classes Tailwind natives : `rounded-md` ≈ 6px, `rounded-xl` ≈ 12px, `rounded-2xl` ≈ 16px). Pas de `transition` custom non plus — utiliser les classes `transition-all duration-200 ease-out` inline.

4. **`app/(app)/layout.tsx`** → layout Hub admin. **Anti-pattern à NE PAS reproduire** : `'use client'` au top level, `useAuth()`, `useEffect`, `BottomTabBar`. Le site public est l'opposé exact : Server Components, pas d'auth, pas de nav tab.

5. **`docs/migration-wix/CLAUDE.md`** → invariants (vouvoiement, La Source en Soi partout, design system v4, pas de framework UI externe). Section "Composants à porter en React" = la checklist de ce milestone.

6. **`docs/migration-wix/DECISIONS_Q1-Q16.md`** → Q6 : pas de logo graphique. Nom "Judith Dufour-Savard" en Cormorant Garamond weight 600 + `<small>` "ACUPUNCTRICE" en Inter uppercase (voir `.site-logo` dans la v4).

7. **`components/features/editor/ImportModal.tsx`** (ou tout fichier importable) → pattern d'import Heroicons du repo : `import { XMarkIcon } from '@heroicons/react/24/outline'`. Reproduire ce pattern pour hamburger (Bars3Icon), close (XMarkIcon), chevrons.

---

## Livrable 1 — `globals-public.css`

**Objectif** : fichier CSS avec les `@apply` et CSS custom properties nécessaires aux composants qui ne sont pas exprimables en classes Tailwind inline (grain SVG data URI, paper texture patterns).

**Fichier à créer** : `app/(public)/globals-public.css`

```css
/* Grain overlay — SVG noise filter inline (pas d'image externe) */
.public-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.05;
  pointer-events: none;
  z-index: 2;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 300px 300px;
}

/* Testimonial decorative opening quote */
.public-testimonial-quote::before {
  content: '\201C';
  font-family: var(--font-public-serif), Georgia, serif;
  font-size: 84px;
  color: #B8694A;
  line-height: 0;
  display: block;
  margin-bottom: 20px;
  opacity: 0.55;
}
```

**Points clés** :
- Seul ce qui est **impossible en inline Tailwind** va ici (pseudo-elements `::before`/`::after` avec `content`, data URIs SVG)
- Importé dans `app/(public)/layout.tsx` via `import './globals-public.css'`
- Pas de `@apply` sur des classes réutilisables — les composants utilisent directement les classes Tailwind

---

## Livrable 2 — 4 composants décoratifs

Tous dans `app/(public)/_components/`. Tous Server Components.

### `PaperTexture.tsx`

Wrapper qui applique une texture papier japonais via un overlay CSS semi-transparent.

```typescript
// Server Component — pas de 'use client'
interface PaperTextureProps {
  children: React.ReactNode;
  className?: string;
  /** Intensité de la texture (0.0 à 1.0). Défaut : 0.40 */
  opacity?: number;
}
```

**Implémentation** :
- `<div className="relative ...">` qui wrap les enfants
- Pseudo-element via un `<div>` overlay positionné `absolute inset-0 z-0 pointer-events-none` avec background SVG pattern inline (pas d'image externe — impact Lighthouse)
- Le SVG pattern à utiliser : un simple noise/grain plus fin que `GrainOverlay`, avec `mix-blend-mode: multiply` et l'opacité configurable
- Les enfants sont dans un `<div className="relative z-10">` pour passer au-dessus de l'overlay
- Le SVG doit être inline en data URI CSS, pas un fichier externe

### `GrainOverlay.tsx`

Composant qui applique la classe CSS `.public-grain` définie dans `globals-public.css`.

```typescript
interface GrainOverlayProps {
  className?: string;
}
```

**Implémentation** :
- `<div className="public-grain relative ...">` — le `::after` pseudo-element ajoute le noise
- À utiliser comme wrapper autour de sections qui veulent l'effet papier grain
- Le parent doit être `relative` (la classe `public-grain` utilise `::after` positionné `absolute`)

### `BotanicalDeco.tsx`

Positionne un SVG décoratif en arrière-plan avec `mix-blend-mode: multiply`.

```typescript
interface BotanicalDecoProps {
  /** SVG inline passé en children ou via une prop svgContent */
  children: React.ReactNode;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  /** Opacité du SVG. Défaut : 0.12 */
  opacity?: number;
  /** Taille en pixels. Défaut : 200 */
  size?: number;
}
```

**Implémentation** :
- `<div>` positionné `absolute` avec `pointer-events-none`, `mix-blend-mode: multiply`, `z-0`
- Les classes de position changent selon la prop (`top-0 left-0`, `top-0 right-0`, etc.)
- Caché sur mobile : `hidden md:block` (les décorations SVG sont cachées < 900px dans la v4)
- Les SVG sont passés en children (pas d'import d'image externe)
- Opacity via le style inline : `style={{ opacity }}`

### `WatermarkText.tsx`

Mot serif géant en filigrane, comme "acupuncture" ou "douceur" en arrière-plan.

```typescript
interface WatermarkTextProps {
  text: string;
  className?: string;
  /** Opacité (défaut 0.04, max recommandé 0.18) */
  opacity?: number;
}
```

**Implémentation** :
- `<span>` positionné `absolute` avec : `font-public-serif`, `font-light italic`, `text-public-accent-taupe`, style inline `opacity` et `fontSize: 200px` desktop (md breakpoint avec `md:text-[260px]`), `pointer-events-none`, `select-none`, `whitespace-nowrap`, `z-0`
- Le parent DOIT être `relative` (mentionner dans un commentaire JSDoc)
- Taille réduite sur mobile : `text-[120px] md:text-[200px] lg:text-[260px]`

---

## Livrable 3 — 6 composants structurels

Tous dans `app/(public)/_components/`. Tous Server Components **sauf SiteHeader**.

### `SectionHeading.tsx`

```typescript
interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}
```

**CSS v4 de référence** :
- Kicker : `text-[11px] font-semibold tracking-[2.5px] uppercase text-public-accent-taupe-dark mb-3.5`
- Title : `font-public-serif text-[34px] md:text-[46px] font-medium leading-[1.15] text-public-text-dark tracking-tight mb-5`
- Subtitle : `text-[17px] leading-relaxed text-public-text-medium max-w-[620px]` (centré si `align='center'` : `mx-auto`)
- `align` contrôle `text-center` vs `text-left` sur les 3 éléments

### `CtaButton.tsx`

```typescript
interface CtaButtonProps {
  variant?: 'primary' | 'secondary' | 'white';
  size?: 'md' | 'lg';
  href?: string;
  sticky?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

Server Component — c'est un `<a>` stylé (pas de `onClick`, pas de state).

**CSS v4 de référence (copier les valeurs exactes)** :

- **Primary md** : `bg-public-accent-taupe text-white px-[26px] py-3 rounded-md text-[13px] font-semibold tracking-[0.8px] uppercase inline-flex items-center gap-2 transition-all duration-200 hover:bg-public-accent-taupe-dark hover:-translate-y-px hover:shadow-public-md`
- **Primary lg** : mêmes styles + `px-11 py-[18px] text-sm tracking-[1px]`
- **Secondary** : `text-public-text-medium text-sm font-medium py-4 px-2 underline underline-offset-4 decoration-1 transition-colors duration-200 hover:text-public-accent-taupe-dark`
- **White** (pour CTA final fond sombre) : `bg-white text-public-accent-taupe-dark px-12 py-5 rounded-md text-sm font-semibold tracking-[1.2px] uppercase transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]`
- **Sticky mobile** : quand `sticky={true}`, wrapper le bouton dans un `<div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">` — visible uniquement sur mobile
- `href` par défaut : `/reserver`

### `ClinicBadge.tsx`

```typescript
interface ClinicBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}
```

- **`compact`** (footer, headers légers) : inline, texte seul "La Source en Soi · 4,9/5"
- **`full`** (hero, pages services) : pill arrondie avec bordure subtle, fond beige-light, shadow-sm — reproduire le badge de la homepage placeholder de MW-B1 mais en composant
- Lien vers Google Maps La Source en Soi : `href="https://maps.google.com/?q=La+Source+en+Soi+Rosemont+Montreal"`, `target="_blank"`, `rel="noopener noreferrer"`
- Server Component

### `PilierCard.tsx`

```typescript
interface PilierCardProps {
  title: string;
  description: string;
  image?: string;
  href: string;
  featured?: boolean;
}
```

- `<a>` (Server Component, lien vers la page service)
- Image via `next/image` si `image` fourni, sinon placeholder fond `bg-public-beige-dark`
- `featured` : `shadow-public-lg border-public-accent-warm/25` + gradient overlay border (CSS v4)
- Hover : `hover:-translate-y-1.5 hover:shadow-public-lg hover:border-public-accent-warm` + image scale `group-hover:scale-[1.04]` (transition `duration-[350ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]`)
- Link text "En savoir plus →" en accent-warm : `text-[13px] font-semibold text-public-accent-warm tracking-[0.3px]`
- Arrow → animée : `group-hover:translate-x-1 transition-transform`
- Titre : `font-public-serif text-[28px] font-semibold text-public-text-dark leading-tight`
- Description : `text-[15px] text-public-text-medium leading-relaxed`
- Border : `border border-public-border-subtle rounded-[14px] overflow-hidden`

### `TestimonialCard.tsx`

```typescript
interface TestimonialCardProps {
  quote: string;
  name: string;
  detail?: string;
  avatarUrl?: string;
  featured?: boolean;
}
```

- `bg-white rounded-[14px] p-10 border-l-4 border-public-accent-warm`
- Quote : `font-public-serif text-xl md:text-2xl italic leading-relaxed text-public-text-dark` + `public-testimonial-quote` class (pour le guillemet `::before` depuis globals-public.css)
- Featured : `featured` ajoute `p-12` et `text-2xl` de base
- Avatar : cercle `w-11 h-11 rounded-full bg-public-accent-taupe-light text-white` avec initiale si pas de `avatarUrl`
- Nom : `text-sm font-semibold text-public-text-dark`
- Détail (ex: "Rosemont") : `text-[13px] text-public-text-light`

### `SiteHeader.tsx`

**Client Component** (`'use client'`) — le seul du milestone.

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
```

**Structure** :
- Sticky header : `sticky top-0 z-[100] bg-white/[0.92] backdrop-blur-[12px] border-b border-public-border-subtle`
- Inner : `max-w-[1280px] mx-auto flex justify-between items-center gap-6 px-8 py-[18px] md:px-8` (mobile : `px-5 py-3.5`)
- Logo : `<Link href="/">` avec le nom en `font-public-serif text-[22px] font-semibold leading-[1.1] text-public-text-dark tracking-tight` + `<small className="block font-public-sans text-[10px] font-medium tracking-[1.5px] uppercase text-public-text-light mt-0.5">ACUPUNCTRICE</small>` (Q6)
- Nav desktop : `hidden md:flex gap-8 text-sm font-medium` — liens : À propos, Services, Blog, Tarifs, Contact. Couleur `text-public-text-medium hover:text-public-accent-taupe-dark transition-colors`
- CTA header : `<CtaButton variant="primary" size="md">Réserver</CtaButton>` — `hidden md:inline-flex`
- Hamburger mobile : `md:hidden` — `<Bars3Icon className="w-6 h-6 text-public-text-dark" />`
- Menu overlay mobile : panneau `fixed inset-0 z-[200] bg-white` avec liens en colonne, bouton close (XMarkIcon), animation slide-in
- État : `const [menuOpen, setMenuOpen] = useState(false)`
- **Ne pas** ajouter de dropdown Services (piliers) dans ce milestone — liens simples. Le dropdown viendra en itération post-lancement.
- Breakpoint nav : `md:` (768px) — correspond au seuil 800px de la v4, arrondi au breakpoint Tailwind le plus proche

**Contrainte 150 lignes — décision prise en review Desktop** : **extraire `MobileMenu.tsx` dès le départ**, pas conditionnellement. SiteHeader vise < 100 lignes, MobileMenu vise < 100 lignes. Pas de "si ça dépasse" — on décompose proactivement. Le SiteHeader importe `import MobileMenu from './MobileMenu'` et passe `isOpen` + `onClose` en props. MobileMenu est Client Component (il a sa propre logique d'animation/focus) ou simple Server Component qui reçoit ses props — à Claude Code de trancher selon si une animation Framer Motion est ajoutée (sinon pas besoin de 'use client').

### `SiteFooter.tsx`

Server Component.

```typescript
import Link from 'next/link';
```

**Structure** (fidèle à la v4) :
- Fond : `bg-public-text-dark text-public-beige-light`
- Inner : `max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 md:gap-12 pb-12 border-b border-white/10`
- Padding section : `px-8 pt-16 pb-8 md:px-8`
- Colonne 1 (Brand) : "Judith Dufour-Savard" en `font-public-serif text-2xl font-semibold` + tagline en `text-[13px] opacity-70 max-w-[320px] leading-relaxed`
- Colonnes 2-4 : header `text-[11px] font-semibold tracking-[1.5px] uppercase opacity-60 mb-4`, liens `text-[13px] opacity-85 hover:opacity-100 transition-opacity`
- Colonne Services : 4 liens piliers (`/services/fertilite`, etc.)
- Colonne Contenu : Blog, FAQ, Ressources — FAQ et Ressources en liens discrets (amendement A1, même taille/style que Blog, pas de mise en avant spéciale)
- Colonne Contact : adresse La Source en Soi + liens sociaux Instagram/Facebook/YouTube
- Barre bottom : `text-center text-xs opacity-60 mt-8` — "En partenariat avec Clinique La Source en Soi — 4,9/5 sur Google · © 2026 Judith Dufour-Savard"

### `SectionNumber.tsx`

```typescript
interface SectionNumberProps {
  number: string;
  align?: 'left' | 'center';
  className?: string;
}
```

- `font-public-serif text-[80px] md:text-[140px] font-light italic text-public-accent-warm opacity-[0.18] leading-none tracking-tight`
- `align` contrôle `text-left` vs `text-center`
- `mb-[-18px] md:mb-[-30px]` (negative margin pour le chevauchement)
- `relative z-0` (pas `absolute` — le section number est dans le flow, au-dessus du heading)

---

## Livrable 4 — Mise à jour du layout + homepage

### `app/(public)/layout.tsx`

Ajouter l'import du CSS et des composants, puis intégrer header + footer :

```typescript
import './globals-public.css';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';
```

Modifier le JSX du wrapper `<div>` :

```tsx
<div className={`${cormorant.variable} ${inter.variable} bg-public-beige-bg text-public-text-dark font-public-sans min-h-screen`}>
  <SiteHeader />
  <div className="flex-1">{children}</div>
  <SiteFooter />
</div>
```

Ajouter `flex flex-col` au wrapper pour que le footer soit poussé en bas :

```tsx
className={`... min-h-screen flex flex-col`}
```

### `app/(public)/page.tsx`

Remplacer le contenu placeholder par une vitrine des composants :

```tsx
import SectionHeading from './_components/SectionHeading';
import SectionNumber from './_components/SectionNumber';
import CtaButton from './_components/CtaButton';
import ClinicBadge from './_components/ClinicBadge';
import TestimonialCard from './_components/TestimonialCard';
import PilierCard from './_components/PilierCard';
```

Afficher dans le `<main>` :
1. Un `<SectionNumber number="01" />` + `<SectionHeading kicker="MW-B3 DESIGN SYSTEM" title="Composants en vitrine" subtitle="..." />`
2. Un `<CtaButton variant="primary" size="lg">Réserver une séance</CtaButton>`
3. Un `<CtaButton variant="secondary">En savoir plus</CtaButton>`
4. Un `<ClinicBadge variant="full" />`
5. Un `<ClinicBadge variant="compact" />`
6. Un `<TestimonialCard quote="Un accompagnement exceptionnel..." name="Marie" detail="Rosemont" />`

Le but est de **valider visuellement tous les composants d'un coup** — cette page sera de toute façon remplacée en MW-C1.

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`
- **Ne pas** utiliser de framework UI externe (shadcn, Material, Chakra, Radix, daisyUI) — Tailwind + tokens v4 uniquement
- **Ne pas** mettre `'use client'` dans le layout public ni dans les composants autres que `SiteHeader.tsx`
- **Ne pas** utiliser d'images externes pour les textures/grain/décorations — SVG inline en data URI uniquement (impact Lighthouse)
- **Ne pas** charger de fonts supplémentaires — Cormorant Garamond + Inter sont déjà dans le layout via `next/font`
- **Ne pas** créer de dropdown Services (mega-menu des 4 piliers) dans le header — liens simples pour ce milestone
- **Ne pas** utiliser `useEffect`, `useRef`, `useRouter` dans les composants Server Component
- **Ne pas** hardcoder de couleurs hex — utiliser les tokens `public-*` ou `text-white`, `bg-white`
- **Composants < 150 lignes** — si un composant dépasse, extraire un sous-composant (ex: `MobileMenu.tsx` pour le menu overlay du header). Voir Questions stratégiques.
- **Ne pas** installer de nouvelle dépendance npm — `@heroicons/react` est déjà installé
- **Pas de `console.log`** dans le code livré
- **Pas d'emojis** dans l'UI — Heroicons uniquement

---

## Mobile first (SEO critique)

Les mêmes règles que MW-B1 s'appliquent. Rappel :

- **Designer pour 375px en premier**, élargir avec `md:`, `lg:`
- **Aucun débordement horizontal** à 375px
- Header : hamburger menu fonctionnel, logo + CTA visibles, nav cachée
- Footer : colonnes en stack vertical
- CtaButton sticky : visible fixé en bas sur mobile, caché sur desktop
- Composants décoratifs (BotanicalDeco, WatermarkText) : `hidden md:block`
- PilierCard : colonne unique sur mobile, grille sur desktop
- Padding horizontal `px-5` minimum sur mobile (pas de texte qui touche les bords)

**Tests DoD** : DevTools responsive mode preset "iPhone SE" (375 × 667) sur `/` :
1. Header sticky avec hamburger visible, pas de nav desktop
2. Menu overlay s'ouvre/ferme au tap hamburger
3. Footer en stack vertical, liens lisibles
4. Composants vitrine lisibles sans scroll horizontal

---

## Definition of Done

Chaque item doit être vérifiable en < 30 secondes.

- [ ] `npm run build` passe sans erreur ni warning nouveau
- [ ] **13 fichiers créés** dans `app/(public)/_components/` (12 composants + MobileMenu extrait) + 1 `globals-public.css`
- [ ] Tous les composants utilisent **`export default`** (cohérent avec le Hub existant)
- [ ] `app/(public)/layout.tsx` importe SiteHeader + SiteFooter + globals-public.css
- [ ] `localhost:3000/` affiche : header sticky + vitrine composants (SectionNumber + SectionHeading + CtaButton ×2 + ClinicBadge ×2 + TestimonialCard + 2 PilierCards en grille) + footer fond sombre
- [ ] `localhost:3000/services/fertilite` affiche : header + placeholder + footer (hérité du layout)
- [ ] **Régression Hub** : `localhost:3000/calendrier` fonctionne sans erreur ET **n'affiche NI le SiteHeader NI le SiteFooter publics** (le Hub a sa propre nav via `(app)/layout.tsx`)
- [ ] Header : logo "Judith Dufour-Savard" + "ACUPUNCTRICE" visibles en serif/sans
- [ ] Header : liens nav visibles sur desktop (md:), cachés sur mobile
- [ ] Header : hamburger visible sur mobile (< md:), ouvre un overlay avec les liens
- [ ] Header : sticky au scroll avec blur semi-transparent
- [ ] Footer : 4 colonnes sur desktop, stack sur mobile
- [ ] Footer : mention "La Source en Soi — 4,9/5" dans la barre bottom
- [ ] CtaButton primary : fond taupe, texte blanc, hover sombre + lift
- [ ] CtaButton secondary : texte souligné, pas de fond
- [ ] ClinicBadge full : pill arrondie avec bordure, fond beige-light
- [ ] ClinicBadge compact : texte inline simple
- [ ] TestimonialCard : guillemet décoratif `"` en terracotta, citation en serif italique
- [ ] SectionNumber : chiffre géant terracotta, opacity 0.18
- [ ] **Mobile 375px** : aucun scroll horizontal sur `/`
- [ ] **Mobile 375px** : hamburger → overlay → close fonctionne
- [ ] `localhost:3000/calendrier` fonctionne sans régression (Hub admin)
- [ ] Aucun composant ne dépasse **150 lignes** (SiteHeader < 100, MobileMenu < 100, les autres < 80 en général)
- [ ] `git diff` ne montre **aucune ligne modifiée** dans `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`
- [ ] `NOTES.md` créé avec : date, résumé, points bloquants, line-count de chaque composant

---

## Notes d'exécution (conseils)

- **Ordre recommandé** : L1 (globals-public.css) → L2 (4 décoratifs) → L3 (6 structurels, commencer par SectionHeading et CtaButton qui sont les plus simples) → L4 (layout + homepage) → build → dev → tests DoD
- **SiteHeader est le composant le plus complexe** — il a du state (hamburger), du responsive, un overlay, des liens. L'écrire en dernier après avoir calibré son style avec les autres composants.
- **Pour les composants décoratifs** : PaperTexture et GrainOverlay ne seront utilisés que dans MW-C1 (homepage) mais on les crée maintenant pour avoir le design system complet. La page vitrine (L4) n'a pas besoin de tous les afficher — juste header/footer/heading/cta/badge/testimonial.
- **Export default obligatoire** : utiliser `export default function SiteHeader() { ... }` pour **tous** les composants du milestone. C'est le pattern du Hub existant (`components/features/calendar/*.tsx`, `components/features/publish/*.tsx`) — vérifié par Claude Desktop en review. Les imports dans le layout sont donc `import SiteHeader from './_components/SiteHeader'` (pas d'accolades).
- **Si le SiteHeader dépasse 150 lignes** : extraire `MobileMenu.tsx` comme Client Component séparé dans le même dossier. Le SiteHeader importe `<MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />`. Flag dans NOTES.md.

---

## Commit final attendu

Un seul commit à la fin, sur la branche `feature/site-public-migration` :

```
feat(public): MW-B3 composants design system (header, footer, CTA, cards, décoratifs)
```

Message de commit détaillé :

```
- 12 composants dans app/(public)/_components/
- SiteHeader sticky + hamburger mobile (seul Client Component)
- SiteFooter 4 colonnes + mention La Source en Soi 4,9/5
- CtaButton primary/secondary/white/lg/sticky-mobile
- PilierCard, TestimonialCard, SectionHeading, ClinicBadge, SectionNumber
- PaperTexture, GrainOverlay, BotanicalDeco, WatermarkText (SVG inline)
- globals-public.css pour pseudo-elements CSS
- Layout public intègre header + footer
- Homepage placeholder mise à jour en vitrine composants
- Zéro modification du Hub admin existant
- Ref: MW-B3, docs/migration-wix/CLAUDE.md
```

**Pas de merge dans `main`** — Benoit review sur la branche avant de décider.

---

## Questions stratégiques — review Desktop (toutes résolues ✅)

### QS1 — SiteHeader et la limite 150 lignes (✅ RÉSOLUE en review Desktop)

**Décision finale** : `MobileMenu.tsx` est **extrait dès le départ** comme composant séparé dans `app/(public)/_components/MobileMenu.tsx`. SiteHeader vise < 100 lignes, MobileMenu vise < 100 lignes. Pas de "si conditionnel" — la décomposition est proactive, c'est la meilleure pratique pour un header responsive avec overlay.

**Structure résultante** :
- `SiteHeader.tsx` — Client Component, gère `const [menuOpen, setMenuOpen] = useState(false)`, rend le logo + nav desktop + CTA + hamburger + `<MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />`
- `MobileMenu.tsx` — rend le panneau overlay avec les liens en colonne + bouton close. Peut rester Server Component si aucune animation stateful n'est nécessaire (le parent gère l'ouverture/fermeture via conditional rendering ou classe CSS).

**Count total header** : 12 + 1 = **13 composants** dans `_components/` au lieu de 12. À refléter dans la DoD.

### QS2 — PilierCard : images placeholder ou pas ? (✅ RÉSOLUE en review Desktop)

**Décision finale** : afficher **2 PilierCards en grille 2 colonnes** dans la vitrine homepage L4, avec le fallback `bg-public-beige-dark` (pas d'image, prop `image` non passée). Les 2 cartes : "Fertilité" et "Grossesse" (les 2 piliers les plus stratégiques SEO). Ça valide visuellement :
1. Le composant PilierCard standalone
2. Le responsive grid (1 colonne < md, 2 colonnes md+)
3. Le fallback visuel quand pas d'image
4. Le hover effect (lift + border color)

**Props à utiliser pour la vitrine** :
```tsx
<PilierCard
  title="Fertilité"
  description="Accompagnement doux pour la conception, soutien pendant les traitements de fertilité."
  href="/services/fertilite"
  featured
/>
<PilierCard
  title="Grossesse & périnatalité"
  description="Accompagnement pendant la grossesse et après la naissance."
  href="/services/grossesse"
/>
```

MW-A1 ajoutera les images Eric Bates plus tard, MW-C1 refera la homepage complète — cette vitrine est temporaire.

---

## Références

- Milestone : `project-docs/02_ROADMAP/migration-wix/MW-B3_composants-base/MILESTONE.md`
- Invariants migration : `docs/migration-wix/CLAUDE.md`
- Décisions : `docs/migration-wix/DECISIONS_Q1-Q16.md` (Q6 logo)
- Plan stratégique : `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md` §4.6
- Source design : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`
- MW-B1 PROMPT.md : modèle qualité pour le format
- Skill : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt drafté le 14 avril 2026 par Claude Code (Opus). Exécution sur branche `feature/site-public-migration` après review Benoit/Desktop.*
