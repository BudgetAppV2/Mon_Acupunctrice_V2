# MW-B1 — Notes d'exécution

**Date** : 14 avril 2026
**Exécuté par** : Claude Code (Opus)
**Branche** : `feature/site-public-migration`

---

## Résumé

Route group `(public)/` créé avec layout dédié (Server Component, Cormorant Garamond + Inter via `next/font/google`), tokens `public-*` dans `tailwind.config.ts` (14 couleurs, 2 fontFamily, 4 boxShadow), homepage placeholder avec 10 tokens v4 visibles, et 12 pages placeholder couvrant toute l'arborescence cible. Zéro modification du Hub admin — `git diff` vide sur `app/layout.tsx`, `app/(app)/`, `app/(auth)/`. Build passe sans erreur.

---

## Points bloquants rencontrés

Aucun.

---

## Réponse à Q9 — Interférence fonts root layout

**Question** : le root layout `app/layout.tsx` applique-t-il une font globale qui pourrait interférer avec Cormorant Garamond + Inter ?

**Constat** : le root layout charge 11 fonts via un `<link>` Google Fonts (Cormorant Garamond weights 400,600 + italic 400, Archivo Black, Caveat, DM Sans, Kalam, Libre Baskerville, Manrope, Oswald, Playfair Display, Poppins, Space Grotesk). Ces fonts servent à l'éditeur de contenu du Hub — palette typographique que Judith applique à ses textes.

Le `<body>` a `className="bg-sand text-gray-900 antialiased min-h-screen"` — **aucun `font-family` n'est appliqué**. Tailwind utilise `font-sans` (system-ui sans-serif) par défaut uniquement quand une classe est explicitement appliquée.

**Conclusion** : pas d'interférence. Les fonts root sont dormantes (aucune classe CSS ne les active globalement). Le layout public utilise `next/font/google` avec des CSS variables scopées (`--font-public-serif`, `--font-public-sans`) qui sont consommées par les classes Tailwind `font-public-serif` et `font-public-sans`. Next.js traite les deux chargements indépendamment. Cormorant Garamond se retrouve chargée deux fois selon le segment visité (weights différents), sans conflit ni régression.

**Note** : ne pas toucher aux 11 fonts du root layout — elles sont utilisées activement par l'éditeur de contenu du Hub.

---

## Livrables créés

| # | Livrable | Fichier(s) |
|---|----------|------------|
| L1 | Tokens Tailwind `public-*` | `tailwind.config.ts` (modifié) |
| L2 | Layout public | `app/(public)/layout.tsx` |
| L3 | Homepage placeholder | `app/(public)/page.tsx` |
| L4 | 12 pages placeholder | `app/(public)/{a-propos,services,services/*,blog,faq,ressources,tarifs,contact,reserver}/page.tsx` |

**L5 (CSS utilities) reporté à MW-B3** comme indiqué dans le PROMPT.md — aucun composant n'en a besoin pour l'instant.

---

## Décisions prises

- Namespace `public-*` pour les couleurs (pas `judith-*`) — cohérent avec le PROMPT.md et le plan §4.6.2
- Pas de `globals-public.css` — reporté à MW-B3 quand les composants en auront besoin
- Le wrapper `<div>` dans le layout public override `bg-sand` du root via `bg-public-beige-bg`
