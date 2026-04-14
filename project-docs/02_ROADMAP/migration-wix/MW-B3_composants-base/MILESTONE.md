# Milestone MW-B3 : Composants partagés de base

**Type** : Infra
**Vague** : 1
**Priorité** : Critical
**Temps estimé Claude Code** : 4-6h
**Dépendances** : MW-B1
**Status** : 🔴 Not started

---

## Objectif

Porter les 6 composants nommés de la maquette `homepage-v4.html` en React/TypeScript et créer les composants utilitaires de base (`ClinicBadge`, `SectionNumber`, textures), pour fournir le design system complet nécessaire aux pages du site public.

---

## Contexte minimal

La maquette v4 définit un langage visuel complet : palette chaleureuse, typographie serif/sans, textures papier, décorations botaniques, asymétrie volontaire. MW-B1 a posé les tokens Tailwind et le layout public. Ce milestone porte les composants React qui implémentent ce langage visuel — ils seront réutilisés dans tous les milestones UI (C1-C6, D2, D4, D5).

---

## Livrables

- [ ] **`<SiteHeader />`** — header sticky avec logo serif "Judith Dufour-Savard", nav desktop (liens vers les pages principales), CTA "Réserver" accent, menu hamburger mobile à 800px
- [ ] **`<SiteFooter />`** — footer 4 colonnes (Services, Contenu, Contact, Réseaux sociaux) + mention "En partenariat avec La Source en Soi ★ 4,9/5" + liens footer discrets vers `/faq` et `/ressources` (amendement A1)
- [ ] **`<CtaButton />`** — bouton Réserver avec variantes `primary | secondary`, tailles `md | lg`, et version sticky mobile (fixed bottom)
- [ ] **`<PilierCard />`** — carte pilier avec image, titre serif, description, lien, état `featured` (décalage vertical asymétrique)
- [ ] **`<TestimonialCard />`** — carte témoignage avec citation serif italique, nom, avatar placeholder
- [ ] **`<SectionHeading />`** — kicker uppercase + titre serif + sous-titre optionnel, variantes `center | left`
- [ ] **`<ClinicBadge />`** — affichage "★ 4,9/5 · 1 200+ avis Google" avec lien vers Google Maps La Source en Soi
- [ ] **`<SectionNumber />`** — numéro manuscrit XL en watermark (serif italique 140px desktop / 80px mobile, opacity 0.18, terracotta)

---

## Approche technique

Tous les composants vivent dans `app/(public)/_components/`. Chaque composant est un Server Component par défaut, sauf `<SiteHeader />` (hamburger menu interactif → `'use client'`).

**`<SiteHeader />`** :
- Logo : texte "Judith Dufour-Savard" en Cormorant Garamond, weight 600
- Nav desktop : À propos, Services (dropdown 4 piliers), Blog, Tarifs, Contact
- CTA : `<CtaButton variant="primary" size="md" />` à droite
- Mobile (< 800px) : hamburger → slide-in overlay, CTA maintenu
- Sticky : `position: sticky; top: 0`, fond semi-transparent avec blur
- **Client Component** nécessaire pour le toggle du menu mobile

**`<SiteFooter />`** :
- 4 colonnes desktop, stack mobile
- Colonne 1 : Services (4 liens piliers)
- Colonne 2 : Contenu (Blog, FAQ, Ressources — FAQ et Ressources en petits liens discrets, amendement A1)
- Colonne 3 : Contact (adresse La Source en Soi, téléphone, email)
- Colonne 4 : Réseaux sociaux (Instagram, Facebook, YouTube — icônes)
- Barre bottom : "En partenariat avec Clinique La Source en Soi ★ 4,9/5" + copyright
- Server Component

**`<CtaButton />`** :
- Props : `variant: 'primary' | 'secondary'`, `size: 'md' | 'lg'`, `href?: string`, `sticky?: boolean`
- Primary : fond `accent-taupe`, texte blanc, hover `accent-taupe-dark`
- Secondary : bordure `accent-taupe`, texte `accent-taupe`, hover fond léger
- Sticky : `fixed bottom-4 left-4 right-4 z-50` sur mobile, caché sur desktop
- Lien vers `/reserver` par défaut
- Server Component (juste un `<a>` stylé)

**`<PilierCard />`** :
- Props : `title`, `description`, `image`, `href`, `featured?: boolean`
- Image carrée avec `next/image`, radius-lg
- Titre en Cormorant Garamond, description en Inter
- Featured : décalage vertical `translateY(24px)` ou `translateY(48px)` pour asymétrie
- Hover : lift subtle (shadow + translate)
- Server Component

**`<TestimonialCard />`** :
- Props : `quote`, `name`, `avatarUrl?`
- Citation en Cormorant Garamond italique, guillemets français
- Avatar circulaire (placeholder si pas d'image)
- Server Component

**`<SectionHeading />`** :
- Props : `kicker?`, `title`, `subtitle?`, `align: 'center' | 'left'`
- Kicker : 11px, letter-spacing 2.5px, uppercase, weight 600, text-light
- Title : Cormorant Garamond, 46px desktop / 34px mobile
- Subtitle : Inter, text-medium
- Server Component

**`<ClinicBadge />`** :
- Affiche "★ 4,9/5 · 1 200+ avis Google"
- Lien vers Google Maps La Source en Soi (ouverture nouvelle fenêtre)
- Variantes : `inline` (dans un paragraphe) et `card` (bloc avec fond léger)
- Server Component

**`<SectionNumber />`** :
- Props : `number: string`
- Serif italique Cormorant Garamond, 140px desktop / 80px mobile
- Color : accent-warm, opacity 0.18
- Absolute positioning (le parent doit être relative)
- Server Component

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/_components/SiteHeader.tsx
- app/(public)/_components/SiteFooter.tsx
- app/(public)/_components/CtaButton.tsx
- app/(public)/_components/PilierCard.tsx
- app/(public)/_components/TestimonialCard.tsx
- app/(public)/_components/SectionHeading.tsx
- app/(public)/_components/ClinicBadge.tsx
- app/(public)/_components/SectionNumber.tsx

✏️ MODIFY (fichiers existants) :
- app/(public)/layout.tsx (intégrer SiteHeader + SiteFooter)
- app/(public)/page.tsx (utiliser les composants pour valider le rendu)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Les 8 composants sont importables et rendus sans erreur
- [ ] La page placeholder affiche au moins 3 composants (SiteHeader, SiteFooter, SectionHeading) pour valider le design system
- [ ] Le header sticky fonctionne au scroll
- [ ] Le menu hamburger s'ouvre/ferme sur mobile (375px)
- [ ] Le CTA sticky s'affiche en bas d'écran sur mobile (375px)
- [ ] Les fonts Cormorant Garamond et Inter s'affichent correctement dans les composants
- [ ] Les tokens `public-*` de MW-B1 sont utilisés (pas de couleurs hardcoded)
- [ ] Le Hub admin fonctionne sans régression
- [ ] Chaque composant fait moins de 150 lignes
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual 375px** : header avec hamburger, footer en colonne, CTA sticky visible
- **Visual 768px** : transition entre les breakpoints
- **Visual 1024px** : header avec nav complète, footer en 4 colonnes, CTA sticky masqué
- **Interaction** : hamburger menu s'ouvre/ferme, liens nav fonctionnels
- **Régression** : Hub admin (`/calendrier`, `/idees`) fonctionne normalement

---

## Contraintes

- Ne pas modifier le code du Hub admin (`app/(app)/`, `app/(auth)/`)
- Ne pas utiliser de framework UI externe (Material, shadcn, Chakra) — Tailwind + tokens v4 uniquement
- Pas d'emojis dans l'UI — Heroicons pour les icônes (hamburger, close, chevrons)
- Composants React < 150 lignes chacun
- Server Components par défaut, `'use client'` uniquement pour `SiteHeader` (hamburger toggle)
- Les composants décoratifs (`PaperTexture`, `GrainOverlay`, `BotanicalDeco`, `WatermarkText`) ne sont PAS dans ce milestone — ils seront ajoutés dans les milestones UI qui en ont besoin (principalement MW-C1)
- Mobile-first 375px

---

## Références

- Plan stratégique §4.6.3 (composants à porter en React), §4.6.1 (philosophie visuelle), §4.6.2 (tokens)
- CLAUDE.md migration — section "Design system", "Composants à porter en React"
- Maquette v4 : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`
- Amendement A1 (FAQ/Ressources discrets dans footer)
- MW-B1 (tokens Tailwind et layout public — prérequis)

---

## Notes de planification

- Les composants décoratifs (`PaperTexture`, `GrainOverlay`, `BotanicalDeco`, `WatermarkText`) sont volontairement exclus de ce milestone pour garder le scope raisonnable (8 composants, 4-6h). Ils seront créés au besoin dans MW-C1 (homepage) qui est le milestone le plus visuellement riche.
- Le `<SiteHeader />` est le seul Client Component — le toggle du menu mobile nécessite `useState`. Garder ce composant le plus léger possible côté JS.
- La nav desktop contient potentiellement un mega-menu pour Services (4 piliers en dropdown). Au lancement, un simple dropdown suffit — le mega-menu peut venir en itération post-lancement.
- Le footer inclut les liens FAQ et Ressources de manière discrète (amendement A1) — pas de section dédiée, juste des petits liens dans la colonne "Contenu" au même niveau que Blog.
- Point à valider avec Benoit : la maquette v4 utilise un logo textuel "Judith Dufour-Savard" en serif. Est-ce qu'il y a un logo graphique (SVG/image) à utiliser à la place ou en complément ?


---

## Décisions 14 avril 2026 (post-reverse-planning)

**Q6 — Logo graphique ou nom en serif ?** → **Nom en serif uniquement**. Pas de SVG logo. Utiliser Cormorant Garamond weight 600 pour "Judith Dufour-Savard" avec un `<small>` Inter uppercase en dessous ("ACUPUNCTRICE"), comme dans `homepage-v4.html` ligne 179 (`.site-logo`). Le composant `<SiteHeader />` doit implémenter ce pattern. Un logo SVG pourra être ajouté plus tard en 30 min de swap si Judith le demande.

**Scope resserré pour ce milestone** : 8 composants critiques (voir livrables originaux). Les composants décoratifs (`<PaperTexture />`, `<GrainOverlay />`, `<BotanicalDeco />`, `<WatermarkText />`, `<SectionNumber />`) sont reportés à MW-C1 où ils sont naturellement utilisés, ou à un MW-B3b si nécessaire.

**Référence** : `docs/migration-wix/DECISIONS_Q1-Q16.md`
