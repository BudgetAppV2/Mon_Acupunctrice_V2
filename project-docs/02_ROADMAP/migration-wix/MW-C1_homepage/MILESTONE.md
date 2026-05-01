# Milestone MW-C1 : Homepage portée de homepage-v4.html → React/Next.js

**Type** : UI
**Vague** : 3
**Priorité** : Critical
**Temps estimé Claude Code** : 3-5h
**Dépendances** : MW-B1, MW-B3
**Status** : 🔴 Not started

---

## Objectif

Porter fidèlement la maquette `homepage-v4.html` en page React/Next.js statique, incluant les sections hero, piliers, approche, témoignages, blog/Instagram, et les composants décoratifs (textures papier, watermarks serif, SVG botaniques).

---

## Contexte minimal

La maquette v4 est la source de vérité visuelle du site. MW-B1 a posé les tokens Tailwind et le layout public, MW-B3 a porté les composants de base. Ce milestone construit la homepage elle-même — la vitrine visible en premier par les prospects — en exploitant les composants de MW-B3 et en créant les composants décoratifs spécifiques à la homepage.

---

## Livrables

- [ ] **Page `app/(public)/page.tsx`** — homepage complète en Server Component avec toutes les sections de la v4
- [ ] **Composants décoratifs** créés pour cette page (réutilisables ensuite) :
  - `<PaperTexture />` — wrapper overlay texture papier japonais
  - `<GrainOverlay />` — SVG noise filter pour effet papier
  - `<BotanicalDeco />` — positionnement des SVG Freepik avec `mix-blend-mode: multiply`
  - `<WatermarkText />` — mot serif géant en filigrane (opacity 0.04-0.18)
- [ ] **Metadata SEO** via `generateMetadata` — title, description, OG tags optimisés
- [ ] **Schema.org JSON-LD** — `Person` (Judith) + `MedicalClinic` (La Source en Soi) avec relation `worksFor`

---

## Approche technique

**Sections de la homepage** (dans l'ordre de la v4) :

1. **Hero** — photo Eric Bates plein écran, H1 serif "Judith Dufour-Savard, Acupunctrice", sous-titre, CTA "Réserver une séance", `<ClinicBadge />`, watermark texte en filigrane
2. **Section Piliers** — 4 `<PilierCard />` avec décalage asymétrique, kicker + titre via `<SectionHeading />`, `<SectionNumber />`
3. **Section Approche** — texte + photo de Judith, fond beige avec texture papier, deco SVG botanique
4. **Section Témoignages** — 2-3 `<TestimonialCard />` en grid irrégulier, fond `beige-warm`
5. **Section Blog/Social** — carrousel ou grille des derniers articles/posts (placeholder statique pour l'instant — le composant dynamique `<RecentPosts />` viendra en MW-F1)
6. **Section CTA final** — appel à l'action plein largeur avec CTA "Réserver"

**Composants décoratifs** (`app/(public)/_components/`) :

- `<PaperTexture />` : `<div>` avec image de fond en overlay, `mix-blend-mode: multiply`, `opacity: 0.40`
- `<GrainOverlay />` : filtre SVG `feTurbulence` inline, overlay sur les sections qui en ont besoin
- `<BotanicalDeco />` : positionne un SVG passé en prop avec `absolute`, `mix-blend-mode: multiply`, responsive hide sur mobile
- `<WatermarkText />` : texte Cormorant Garamond, `font-size: 200-260px`, `opacity: 0.04-0.18`, `position: absolute`, `pointer-events: none`

**Images** :
- Photos Eric Bates depuis `public/site/judith/` (rapatriées en MW-A1)
- SVG décoratifs depuis `public/site/decorations/`
- Textures depuis `public/site/textures/`
- Toutes les images via `next/image` avec `sizes` appropriés

**Schema.org** (JSON-LD injecté via `<script type="application/ld+json">` dans la page ou le layout) :

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Judith Dufour-Savard",
  "jobTitle": "Acupunctrice",
  "image": "/site/judith/portrait-hero.jpg",
  "url": "https://acupuncturejudith.ca",
  "worksFor": {
    "@type": "MedicalClinic",
    "name": "La Source en Soi",
    "address": { ... },
    "telephone": "...",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1215"
    }
  }
}
```

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/_components/PaperTexture.tsx
- app/(public)/_components/GrainOverlay.tsx
- app/(public)/_components/BotanicalDeco.tsx
- app/(public)/_components/WatermarkText.tsx

✏️ MODIFY (fichiers existants) :
- app/(public)/page.tsx (remplacer placeholder par homepage complète)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] La homepage affiche toutes les sections de la v4 dans le bon ordre
- [ ] Les photos Eric Bates s'affichent via `next/image` avec optimisation automatique
- [ ] Les textures papier et décorations SVG sont visibles sur desktop, cachées sur mobile
- [ ] Les watermarks serif sont visibles en filigrane avec la bonne opacité
- [ ] Le `<ClinicBadge />` affiche "★ 4,9/5 · 1 200+ avis Google" dans le hero
- [ ] Lighthouse 95+ en Performance, Accessibility, Best Practices, SEO
- [ ] Schema.org validé via validator.schema.org (Person + MedicalClinic)
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual 375px** : hero lisible, piliers en colonne, décos cachées, CTA visible
- **Visual 768px** : transition fluide
- **Visual 1024px** : rendu fidèle à la v4, décos visibles, grid asymétrique
- **SEO** : meta tags complets (title, description, OG image), schema.org valide
- **Performance** : images lazy-loaded sauf hero (priority), LCP < 2.5s
- **Accessibilité** : contraste WCAG AA, alt text sur toutes les images, navigation clavier, focus visible

---

## Contraintes

- Fidélité maximale à la maquette v4 — toute divergence doit être justifiée
- Ne pas modifier le code du Hub admin
- Ne pas utiliser de framework UI externe
- Les photos Eric Bates via `next/image` avec format AVIF/WebP automatique
- Décorations SVG et textures avec `loading="lazy"` et `priority={false}`
- `prefers-reduced-motion` respecté pour les hover effects (transitions désactivées)
- Composants React < 150 lignes — la homepage elle-même est composée de sections extraites en composants si trop longue
- Mobile-first 375px
- Pas d'emojis dans l'UI

---

## Références

- Maquette v4 : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html` (source de vérité)
- Plan stratégique §4.6 (UI guidelines complètes)
- Plan stratégique §8.1b (affichage stratégique des avis — placement sur la homepage)
- Plan stratégique §9.1 (CTAs homepage)
- MW-B1 (tokens Tailwind), MW-B3 (composants de base)

---

## Notes de planification

- La section Blog/Social de la v4 contient un carrousel Instagram statique. Pour le MVP, mettre un placeholder statique avec 3 cartes — le composant dynamique `<RecentPosts />` (MW-F1) le remplacera plus tard.
- La homepage peut facilement dépasser 150 lignes. Extraire chaque section dans un composant séparé : `HeroSection.tsx`, `PiliersSection.tsx`, `ApprocheSection.tsx`, `TemoignagesSection.tsx`, `BlogSection.tsx`, `CtaSection.tsx`.
- Les données des témoignages sont hardcodées pour l'instant (3 témoignages sélectionnés — source : avis Google analysés en MW-A4). Pas de CMS pour les témoignages au lancement.
- Point à valider avec Benoit : la v4 utilise une photo spécifique dans le hero. Vérifier quelle photo Eric Bates est la plus adaptée parmi les 8 disponibles.
- Gotcha : les textures papier japonais en overlay avec `multiply` peuvent rendre le texte moins lisible sur certains fonds. Tester le contraste et ajuster l'opacité si nécessaire.
