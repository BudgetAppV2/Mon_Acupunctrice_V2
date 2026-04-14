# MW-B3 — Notes d'execution

**Date** : 14 avril 2026
**Execute par** : Claude Code (Opus)
**Branche** : `feature/site-public-migration`

---

## Resume

13 composants crees dans `app/(public)/_components/` + `globals-public.css`. Design system complet : SiteHeader (sticky + hamburger mobile), SiteFooter (4 colonnes + La Source en Soi), CtaButton (primary/secondary/white/lg/sticky), PilierCard, TestimonialCard, SectionHeading, SectionNumber, ClinicBadge (compact/full), PaperTexture, GrainOverlay, BotanicalDeco, WatermarkText. Layout public integre header + footer. Homepage mise a jour en vitrine composants. Build passe, zero modification Hub admin.

---

## Points bloquants rencontres

Aucun.

---

## Line-count par composant

| Composant | Lignes | Client? |
|-----------|--------|---------|
| SiteFooter | 117 | Non |
| SiteHeader | 66 | Oui |
| CtaButton | 62 | Non |
| PilierCard | 61 | Non |
| MobileMenu | 56 | Non |
| TestimonialCard | 55 | Non |
| ClinicBadge | 41 | Non |
| SectionHeading | 37 | Non |
| BotanicalDeco | 37 | Non |
| PaperTexture | 30 | Non |
| WatermarkText | 24 | Non |
| SectionNumber | 23 | Non |
| GrainOverlay | 16 | Non |
| globals-public.css | 23 | — |

**Max : 117 lignes (SiteFooter)** — tous sous la limite de 150.
**Seul Client Component : SiteHeader** (le hamburger toggle necessite useState).
MobileMenu n'a pas besoin de `'use client'` — il recoit `isOpen` et `onClose` en props du parent SiteHeader qui gere l'etat. Le conditional rendering (`if (!isOpen) return null`) fonctionne sans etat propre.

---

## Decisions prises

- **QS1 (resolue)** : MobileMenu extrait proactivement dans un fichier separe. SiteHeader = 66 lignes, MobileMenu = 56 lignes.
- **QS2 (resolue)** : 2 PilierCards en vitrine avec fallback fond beige-dark (pas d'images, MW-A1 pas encore fait).
- **Export default** pour tous les composants — coherent avec le pattern Hub existant.
- **Decoratifs SVG inline** : PaperTexture et GrainOverlay utilisent des data URIs SVG, pas d'images externes. BotanicalDeco recoit les SVG en children. WatermarkText est du texte CSS pur.
- **Pas de dropdown Services** dans le header — liens simples, le mega-menu viendra en iteration post-lancement.

---

## Livrables crees/modifies

| # | Livrable | Fichier(s) |
|---|----------|------------|
| L1 | CSS pseudo-elements | `app/(public)/globals-public.css` |
| L2 | Decoratifs | `PaperTexture`, `GrainOverlay`, `BotanicalDeco`, `WatermarkText` |
| L3 | Structurels | `SiteHeader`, `MobileMenu`, `SiteFooter`, `CtaButton`, `PilierCard`, `TestimonialCard`, `SectionHeading`, `SectionNumber`, `ClinicBadge` |
| L4 | Integration | `layout.tsx` (modifie), `page.tsx` (remplace) |
