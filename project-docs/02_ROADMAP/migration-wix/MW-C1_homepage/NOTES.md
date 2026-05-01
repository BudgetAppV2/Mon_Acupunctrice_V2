# MW-C1 — Notes d'execution

**Date** : 15 avril 2026
**Execute par** : Claude Code (Opus)
**Branche** : `feature/site-public-migration`

---

## Resume

Homepage portee de homepage-v4.html en 8 composants de section React (HeroSection, PiliersSection, ApprocheSection, TemoignagesSection, AboutSection, BlogPreviewSection, SocialSection, CtaFinalSection) + page.tsx assemblage + helper `lib/firestore/public-blog.ts`. Fix PilierCard `unoptimized` (1 ligne, exception documentee). Schema.org Person + MedicalClinic. Build passe.

---

## Points bloquants rencontres

Aucun.

---

## Decisions visuelles prises

- **Hero photo** : portrait-01 via `<picture>` AVIF+WebP avec `fetchPriority="high"` (seul element LCP)
- **Photos piliers** : portrait-07 (fertilite, 307KB AVIF — lazy loaded en card 500px max), portrait-06 (grossesse, featured), portrait-02 (sociale)
- **Photo approche** : portrait-05 via `<img>` natif lazy
- **Photo a propos** : portrait-08 via `<img>` natif lazy
- **Photo social card** : portrait-03 via `<img>` natif lazy
- **SVG deco** : yoga3.svg (piliers section), hands-lotus.svg (approche section)
- **CTA botanical** : plant.webp inline (pas BotanicalDeco — blend-mode screen incompatible, QS1 option b)
- **PaperTexture variant="real"** : 2 fois exactement (piliers + temoignages)
- **Temoignages** : 3 vrais avis Google (Alexandra P., Ingrid M., Parent enfant 6 ans) — PAS les placeholders fictifs de la v4

---

## Fix PilierCard `unoptimized` (Livrable 1b)

Ajout de `unoptimized` au `<Image>` dans `app/(public)/_components/PilierCard.tsx` (1 ligne). Raison : les photos MW-A1b sont pre-optimisees, passer par le pipeline Next.js les re-encoderait (Option C anti-pattern). Ce fix beneficie aussi a MW-C3 (pages services) qui utilisera PilierCard.

---

## Helper lib/firestore/public-blog.ts (QS2 option c)

Nouveau fichier `lib/firestore/public-blog.ts` exportant `getRecentBlogPosts(limit)`. Utilise par `BlogPreviewSection` (homepage). MW-F1 (`RecentPosts`) reutilisera ce helper. `blog/page.tsx` (MW-D2) n'a PAS ete refactore — hors scope.

---

## Line counts

| Section | Lignes |
|---------|--------|
| HeroSection | 102 |
| BlogPreviewSection | 79 |
| CtaFinalSection | 78 |
| SocialSection | 76 |
| AboutSection | 74 |
| page.tsx | 62 |
| ApprocheSection | 58 |
| PiliersSection | 53 |
| TemoignagesSection | 40 |
| public-blog.ts | 24 |

Max : 102 (HeroSection) — toutes sous 150.

---

## Livrables crees/modifies

| # | Livrable | Fichier(s) |
|---|----------|------------|
| 1b | Fix PilierCard | `app/(public)/_components/PilierCard.tsx` (+1 ligne `unoptimized`) |
| 1 | HeroSection | `app/(public)/_sections/HeroSection.tsx` |
| 2 | PiliersSection | `app/(public)/_sections/PiliersSection.tsx` |
| 3 | ApprocheSection | `app/(public)/_sections/ApprocheSection.tsx` |
| 4 | TemoignagesSection | `app/(public)/_sections/TemoignagesSection.tsx` |
| 5a | AboutSection | `app/(public)/_sections/AboutSection.tsx` |
| 5b | BlogPreviewSection | `app/(public)/_sections/BlogPreviewSection.tsx` |
| QS2 | Helper Firestore | `lib/firestore/public-blog.ts` |
| 6 | SocialSection | `app/(public)/_sections/SocialSection.tsx` |
| 7 | CtaFinalSection | `app/(public)/_sections/CtaFinalSection.tsx` |
| 8 | Page assemblage | `app/(public)/page.tsx` (remplace) |
