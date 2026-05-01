# Milestone MW-B1 : Route group `(public)/` + layout public + fonts + tokens v4

**Type** : Infra
**Vague** : 1
**Priorité** : Critical
**Temps estimé Claude Code** : 2-3h
**Dépendances** : Aucune
**Status** : 🔴 Not started

---

## Objectif

Créer le squelette technique du site public dans le repo Hub V2 — route group `(public)/`, layout dédié avec Cormorant Garamond + Inter, design tokens v4 namespacés dans Tailwind, et page d'accueil placeholder — sans modifier le code du Hub admin existant.

---

## Contexte minimal

Le Hub V2 utilise deux route groups : `(app)/` (routes protégées) et `(auth)/` (login). L'auth est 100 % client-side via `useAuth()` dans `(app)/layout.tsx`, sans middleware. Ajouter un route group `(public)/` au même niveau est le pattern standard App Router — zéro risque de régression (plan §4.5).

---

## Livrables

- [ ] **Route group `app/(public)/`** avec `layout.tsx` public — inclut les fonts Cormorant Garamond + Inter via `next/font/google`, metadata de base, structure HTML sémantique
- [ ] **Design tokens v4 dans `tailwind.config.ts`** — namespace `public-*` pour toute la palette v4 (beige-bg, accent-taupe, accent-warm, text-dark, etc.), sans écraser les tokens `sage`/`sand` existants du Hub admin
- [ ] **CSS utilities publiques** dans `app/(public)/globals-public.css` — `@apply` pour patterns récurrents (`.btn-reserver`, `.section-kicker`, `.section-title`) et variables CSS custom
- [ ] **Page placeholder `app/(public)/page.tsx`** — Server Component statique avec un H1 "Site en construction" et les tokens v4 appliqués, confirmant que le layout public fonctionne
- [ ] **Structure de dossiers vide** pour toutes les futures pages (`a-propos/`, `services/`, `blog/`, `faq/`, `ressources/`, `tarifs/`, `contact/`, `reserver/`)

---

## Approche technique

**Layout public** (`app/(public)/layout.tsx`) :
- Import des fonts via `next/font/google` : `Cormorant_Garamond` (weights 400, 500, 600, 700) + `Inter` (weights 400, 500, 600)
- Pas de `<BottomTabBar />`, pas d'auth check, pas de PWA manifest — c'est un site vitrine
- Slot pour header et footer (composants vides/placeholder pour l'instant — portés en MW-B3)
- Metadata de base : `title`, `description`, `viewport`, `robots`

**Tokens Tailwind** :
Étendre `tailwind.config.ts` avec un objet `public` dans `colors` :

```typescript
public: {
  'beige-bg': '#F5F0E8',
  'beige-light': '#FAF6EF',
  'beige-dark': '#EDE4D3',
  'beige-warm': '#E8DFD0',
  'taupe-section': '#D5CDBF',
  'text-dark': '#2C2A26',
  'text-medium': '#5C5852',
  'text-light': '#8A857C',
  'accent-taupe': '#8A9A7B',
  'accent-taupe-dark': '#6F8566',
  'accent-taupe-light': '#A8B59C',
  'accent-warm': '#B8694A',
  'accent-warm-soft': '#C47A58',
  'border-subtle': '#E5DFD2',
}
```

Usage : `bg-public-beige-bg`, `text-public-accent-warm`, etc.

**Espacements et rayons** : ajouter dans `extend.borderRadius` et `extend.spacing` les valeurs de la v4 (§4.6.2), namespacées si nécessaire.

**Ombres** : ajouter `shadow-public-sm`, `shadow-public-md`, `shadow-public-lg`, `shadow-public-photo` avec les valeurs chaudes de la v4.

**CSS utilities** : fichier séparé importé dans le layout public pour éviter de polluer le CSS du Hub admin.

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/layout.tsx
- app/(public)/page.tsx (placeholder)
- app/(public)/globals-public.css
- app/(public)/a-propos/page.tsx (placeholder vide)
- app/(public)/services/page.tsx (placeholder vide)
- app/(public)/services/fertilite/page.tsx (placeholder vide)
- app/(public)/services/grossesse/page.tsx (placeholder vide)
- app/(public)/services/pediatrie/page.tsx (placeholder vide)
- app/(public)/services/acupuncture-sociale/page.tsx (placeholder vide)
- app/(public)/blog/page.tsx (placeholder vide)
- app/(public)/faq/page.tsx (placeholder vide)
- app/(public)/ressources/page.tsx (placeholder vide)
- app/(public)/tarifs/page.tsx (placeholder vide)
- app/(public)/contact/page.tsx (placeholder vide)
- app/(public)/reserver/page.tsx (placeholder vide)

✏️ MODIFY (fichiers existants) :
- tailwind.config.ts (ajout tokens public-*)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Naviguer vers `localhost:3000/` affiche la page placeholder du site public (pas la page du Hub)
- [ ] Naviguer vers `localhost:3000/services/fertilite` affiche un placeholder sans erreur
- [ ] Les tokens Tailwind `public-*` sont utilisables : `bg-public-beige-bg` compile correctement
- [ ] Le Hub admin (`/calendrier`, `/idees`, etc.) fonctionne sans régression
- [ ] Les fonts Cormorant Garamond et Inter sont chargées dans le layout public
- [ ] Les fonts du Hub admin (si différentes) ne sont pas affectées
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : vérifier que la page placeholder affiche les tokens v4 (fond beige, texte dark, accent taupe)
- **Visual** : vérifier 375px et 1024px
- **Régression** : naviguer vers `/calendrier` (Hub admin) — doit fonctionner normalement
- **Build** : `npm run build` sans warnings liés aux fonts ou tokens

---

## Contraintes

- Ne pas modifier `app/(app)/layout.tsx` ni aucun fichier dans `(app)/` ou `(auth)/`
- Ne pas renommer ou écraser les tokens `sage` et `sand` existants — namespace `public-*` obligatoire
- Ne pas créer de `middleware.ts` — le Hub n'en a pas, on n'en ajoute pas (invariant CLAUDE.md migration)
- Ne pas utiliser de framework UI externe — Tailwind + tokens v4 uniquement
- Les pages placeholder doivent être des Server Components statiques simples (export default + H1)
- Pas de composants UI dans ce milestone — juste le squelette technique

---

## Références

- Plan stratégique §4.5 (architecture technique — cohabitation Hub V2)
- Plan stratégique §4.6.2 (design tokens v4)
- CLAUDE.md migration — section "Design system (homepage-v4 comme source canonique)"
- Maquette v4 : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`
- `tailwind.config.ts` existant (pour vérifier les tokens actuels)
- `app/layout.tsx` existant (root layout du repo)

---

## Notes de planification

- La question du root layout est critique : `app/layout.tsx` est le root layout partagé (PWA, fonts globales, etc.). Le layout public `(public)/layout.tsx` est un layout intermédiaire sous le root. Vérifier que les fonts du root n'interfèrent pas avec Cormorant Garamond + Inter.
- Les pages placeholder sont temporaires — elles seront remplacées par les vrais composants dans les milestones C et D. Utiliser un simple `export default function Page() { return <h1>Page en construction</h1> }`.
- La structure de la homepage v4 contient aussi des variables CSS custom (`--beige-bg`, etc.). Décision : les porter en Tailwind config plutôt qu'en CSS variables, pour rester cohérent avec le pattern du repo.
- Gotcha potentiel : si le root layout applique une classe CSS globale (ex. `font-sans`), elle pourrait écraser les fonts du layout public. Vérifier et overrider si nécessaire via `className` dans le layout public.
