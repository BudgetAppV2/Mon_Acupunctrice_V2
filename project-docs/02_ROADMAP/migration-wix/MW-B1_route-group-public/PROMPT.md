# MW-B1 — Route group `(public)/` + layout + fonts + tokens v4

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir exécuter sans poser de question.

---

## Contexte

On migre le site public de Judith Dufour-Savard (`acupuncturejudith.ca`) depuis Wix vers une section publique du Hub V2 (ce repo). Pattern : route group `(public)/` ajouté au même niveau que `(app)/` et `(auth)/`, **zéro modification du code Hub existant**. Ce milestone pose le squelette technique — pas de composants UI, pas de contenu, juste les fondations : route group, layout dédié, fonts v4, tokens Tailwind, et 15 pages placeholder pour valider le routing.

Après ce milestone : `localhost:3000/` affiche un placeholder site public avec les tokens v4 visibles, et `localhost:3000/calendrier` (Hub admin) fonctionne toujours sans régression.

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind CSS, Server Components par défaut. Node 20+.

---

## Fichiers à lire AVANT de commencer

Dans cet ordre exact. Ne commence à coder qu'après avoir lu les 6.

1. **`docs/migration-wix/CLAUDE.md`** → invariants permanents de la migration (design system, tokens v4, règles absolues, arborescence cible)
2. **`project-docs/02_ROADMAP/migration-wix/MW-B1_route-group-public/MILESTONE.md`** → le plan détaillé du milestone (livrables, DoD, contraintes, notes de planification)
3. **`app/layout.tsx`** → root layout. **Gotchas critiques** :
   - `<body className="bg-sand text-gray-900 antialiased min-h-screen">` applique `bg-sand` globalement → ton layout public devra overrider via un wrapper div
   - Charge Cormorant Garamond via `<link>` Google Fonts mais avec weights `400, 600` + italic 400 seulement → **incomplet pour la v4 qui demande 400, 500, 600, 700**
   - Ne charge PAS Inter → à ajouter via `next/font/google` dans ton layout public
   - **NE LE MODIFIE PAS** — c'est un invariant
4. **`app/(app)/layout.tsx`** → layout du Hub admin. **Anti-pattern à NE PAS reproduire** dans `(public)/layout.tsx` :
   - Commence par `'use client'` → (public) doit être Server Component
   - Utilise `useAuth()` + redirect `/login` → (public) n'a pas d'auth
   - Monte une `BottomTabBar` → (public) n'en a pas
   - `useEffect`, `useRef`, toast → aucun de ces hooks dans (public)
5. **`tailwind.config.ts`** → config existante. **À étendre, pas à remplacer.** Tokens actuels : `sage: #5C7A5F`, `sand: #F5F1E9`, 6 status colors. Pas de `fontFamily`, `boxShadow`, `spacing`, `borderRadius` custom. Champ libre pour ajouter les tokens `public-*` sans conflit.
6. **`~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`** (chemin absolu hors repo) → source canonique du design system. Lis uniquement les sections `<style>` pour extraire les CSS variables, ombres, et polices. Ignore le markup HTML — on porte en React dans MW-B3/C1, pas maintenant.

---

## Livrable 1 — Extension de `tailwind.config.ts`

**Objectif** : ajouter le namespace `public-*` pour colors, fontFamily et boxShadow, **sans toucher** aux tokens existants (`sage`, `sand`, status colors, keyframes, animation).

**Fichier à modifier** : `tailwind.config.ts`

**Instructions** :
- Ajouter dans `theme.extend.colors` un objet `public` contenant toute la palette v4 ci-dessous
- Ajouter `theme.extend.fontFamily` avec `public-serif` et `public-sans` qui référencent des CSS variables (set par `next/font/google` dans le layout public)
- Ajouter `theme.extend.boxShadow` avec 4 ombres chaudes namespacées
- Conserver **tel quel** : `sage`, `sand`, `status-*`, `keyframes`, `animation`

**Snippet exact à merger dans `theme.extend`** :

```typescript
colors: {
  // ... garder sage, sand, status-* tels quels ...
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
  },
},
fontFamily: {
  'public-serif': ['var(--font-public-serif)', 'Georgia', 'serif'],
  'public-sans': ['var(--font-public-sans)', 'system-ui', 'sans-serif'],
},
boxShadow: {
  'public-sm': '0 1px 2px rgba(44, 42, 38, 0.04), 0 1px 3px rgba(44, 42, 38, 0.06)',
  'public-md': '0 4px 6px rgba(44, 42, 38, 0.05), 0 2px 4px rgba(44, 42, 38, 0.04)',
  'public-lg': '0 10px 15px rgba(44, 42, 38, 0.06), 0 4px 6px rgba(44, 42, 38, 0.04)',
  'public-photo': '0 20px 40px rgba(44, 42, 38, 0.12), 0 8px 16px rgba(44, 42, 38, 0.08)',
},
```

**Validation locale** : après la modif, `bg-public-beige-bg`, `text-public-accent-warm`, `font-public-serif`, `shadow-public-photo` doivent compiler sans warning.

---

## Livrable 2 — Layout public `app/(public)/layout.tsx`

**Objectif** : créer le layout dédié au site public. Server Component pur, fonts via `next/font/google` avec CSS variables, wrapper qui override le `bg-sand` du root body, metadata par défaut pour le site public.

**Fichier à créer** : `app/(public)/layout.tsx`

**Contenu exact** :

```typescript
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

// CSS variables consommées par tailwind.config.ts
// (fontFamily['public-serif'] et fontFamily['public-sans'])
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-public-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Judith Dufour-Savard — Acupunctrice à Montréal',
    template: '%s | Judith Dufour-Savard',
  },
  description:
    'Acupunctrice à Montréal, spécialisée en fertilité, grossesse, pédiatrie et acupuncture sociale. En partenariat avec la clinique La Source en Soi à Rosemont.',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F5F0E8',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${cormorant.variable} ${inter.variable} bg-public-beige-bg text-public-text-dark font-public-sans min-h-screen`}
    >
      {children}
    </div>
  );
}
```

**Points clés (ne pas dévier)** :
- **Pas** de `'use client'` en haut du fichier
- **Pas** d'import de `useAuth`, `useRouter`, `useEffect`, ni aucun hook React
- **Pas** de composants header/footer/BottomTabBar à ce stade (ils viendront en MW-B3)
- Le wrapper `<div>` override `bg-sand` du root body via `bg-public-beige-bg`
- Les deux CSS variables (`--font-public-serif`, `--font-public-sans`) sont injectées via `cormorant.variable` et `inter.variable`, consommées par Tailwind config
- `font-public-sans` appliqué au wrapper → par défaut tout est en Inter, les H1/H2 passeront explicitement en `font-public-serif` dans les composants plus tard
- `themeColor` mis à `#F5F0E8` (beige-bg) — **override volontaire** du root qui était à `#5C7A5F` (sage). Ce metadata est hérité du root et peut être overridé par segment
- `metadata.title.template` permet aux sous-pages de définir un title qui sera suffixé automatiquement

---

## Livrable 3 — Placeholder homepage `app/(public)/page.tsx`

**Objectif** : page `/` qui confirme visuellement que tokens v4 + fonts + layout public fonctionnent. C'est la seule page "riche" de ce milestone — toutes les autres sont des placeholders minimaux.

**Fichier à créer** : `app/(public)/page.tsx`

**Contenu exact** :

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    'Acupunctrice à Montréal. Fertilité, grossesse, pédiatrie, acupuncture sociale. Clinique La Source en Soi à Rosemont.',
};

export default function PublicHomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-public-sans text-sm font-medium uppercase tracking-[0.2em] text-public-accent-warm">
        Site en construction — MW-B1
      </p>
      <h1 className="mt-6 font-public-serif text-5xl font-medium leading-tight text-public-text-dark md:text-6xl">
        Judith Dufour-Savard
      </h1>
      <p className="mt-4 font-public-serif text-2xl italic text-public-text-medium">
        Acupunctrice à Montréal
      </p>
      <p className="mt-10 font-public-sans text-base leading-relaxed text-public-text-medium">
        Cette page est un placeholder technique. Le squelette du route group
        public est en place : tokens v4, fonts Cormorant Garamond + Inter, et
        layout dédié. Les vraies pages arriveront dans les milestones MW-B3
        (composants) puis MW-C1 (homepage portée de la v4).
      </p>
      <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-public-border-subtle bg-public-beige-light px-5 py-3 font-public-sans text-sm text-public-text-medium shadow-public-sm">
        <span className="font-semibold text-public-accent-taupe-dark">
          La Source en Soi
        </span>
        <span aria-hidden="true">·</span>
        <span>4,9 / 5 — 1 200+ avis Google</span>
      </div>
    </main>
  );
}
```

**Points clés** :
- Server Component (pas de `'use client'`)
- **Aucun composant importé** — tout inline pour isoler ce milestone de toute dépendance
- Utilise **10 tokens `public-*` différents** (beige-bg via le layout, beige-light, text-dark, text-medium, accent-warm, accent-taupe-dark, border-subtle, serif, sans, shadow-sm) → validation visuelle en un coup d'œil que tout compile
- Le ClinicBadge inline ici est volontairement **pas un vrai composant** — sa version React arrivera en MW-B3
- Responsive `md:text-6xl` pour vérifier qu'un breakpoint fonctionne

---

## Livrable 4 — 14 pages placeholder vides

**Objectif** : créer toute la structure de dossiers cible avec des `page.tsx` minimaux pour que chaque URL publique répond `200` au lieu de `404`. Les vrais contenus seront écrits dans les milestones MW-C* et MW-D*.

**Fichiers à créer** (14 fichiers) :

```
app/(public)/a-propos/page.tsx
app/(public)/services/page.tsx
app/(public)/services/fertilite/page.tsx
app/(public)/services/grossesse/page.tsx
app/(public)/services/pediatrie/page.tsx
app/(public)/services/acupuncture-sociale/page.tsx
app/(public)/blog/page.tsx
app/(public)/faq/page.tsx
app/(public)/ressources/page.tsx
app/(public)/tarifs/page.tsx
app/(public)/contact/page.tsx
app/(public)/reserver/page.tsx
```

Soit **12 fichiers** dans la liste ci-dessus (j'ai recompté — le MILESTONE.md listait 14 en comptant page.tsx et layout.tsx, mais ici on exclut ceux déjà créés en L2+L3).

**Contenu identique pour les 12** — adapter uniquement le `title` et le `h1` au nom de page :

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos', // ← adapter par page
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-public-sans text-sm font-medium uppercase tracking-[0.2em] text-public-accent-warm">
        Placeholder MW-B1
      </p>
      <h1 className="mt-6 font-public-serif text-4xl font-medium text-public-text-dark">
        À propos {/* ← adapter par page */}
      </h1>
      <p className="mt-4 font-public-sans text-public-text-medium">
        Cette page sera construite dans un milestone ultérieur.
      </p>
    </main>
  );
}
```

**Table de correspondance `title` / `h1` par page** :

| Fichier | title metadata | h1 |
|---|---|---|
| `a-propos/page.tsx` | `À propos` | `À propos` |
| `services/page.tsx` | `Services` | `Services` |
| `services/fertilite/page.tsx` | `Acupuncture fertilité` | `Acupuncture en fertilité` |
| `services/grossesse/page.tsx` | `Acupuncture grossesse` | `Acupuncture en grossesse` |
| `services/pediatrie/page.tsx` | `Acupuncture pédiatrique` | `Acupuncture pédiatrique` |
| `services/acupuncture-sociale/page.tsx` | `Acupuncture sociale` | `Acupuncture sociale` |
| `blog/page.tsx` | `Blog` | `Blog` |
| `faq/page.tsx` | `Questions fréquentes` | `Questions fréquentes` |
| `ressources/page.tsx` | `Ressources` | `Ressources` |
| `tarifs/page.tsx` | `Tarifs` | `Tarifs` |
| `contact/page.tsx` | `Contact` | `Contact` |
| `reserver/page.tsx` | `Réserver une séance` | `Réserver une séance` |

**Points clés** :
- Toutes les pages sont Server Components (pas de `'use client'`)
- Aucune ne doit importer quoi que ce soit d'autre que `Metadata` de `next`
- Le layout public parent s'applique automatiquement à toutes (wrapper beige + fonts)
- Ces fichiers seront **intégralement remplacés** dans les milestones MW-C*, ils sont jetables

---

## Note sur le Livrable 5 (CSS utilities) — reporté

Le `MILESTONE.md` original listait un 5e livrable : `app/(public)/globals-public.css` avec `@apply` pour `.btn-reserver`, `.section-kicker`, `.section-title` et variables CSS custom. **Ce livrable est reporté à MW-B3** (composants partagés de base), parce que :

- Aucun composant de MW-B1 n'utilise ces classes (elles ne seraient testées que 2 milestones plus tard)
- Écrire du CSS non utilisé = dette technique + risque de divergence avec les composants réels
- MW-B3 pourra directement créer ces utilities au moment où `<CtaButton />`, `<SectionHeading />` en auront besoin

**Ne crée pas** `globals-public.css` dans ce milestone. Si le besoin apparaît pendant l'exécution (ex. un `@apply` qu'on ne peut pas exprimer en classes inline), flag-le dans `NOTES.md` et demande avant d'ajouter le fichier.

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/layout.tsx`, `app/globals.css`, `app/(app)/**`, `app/(auth)/**`
- **Ne pas écraser** les tokens `sage` et `sand` dans `tailwind.config.ts` — le namespace `public-*` est obligatoire
- **Ne pas créer** `middleware.ts` — le Hub n'en a pas, on n'en ajoute pas (invariant `docs/migration-wix/CLAUDE.md`)
- **Ne pas ajouter** de framework UI externe (shadcn, Material, Chakra, Radix, daisyUI) — Tailwind + tokens v4 uniquement
- **Ne pas mettre** `'use client'` dans `app/(public)/layout.tsx` ni dans aucune page de ce milestone — tout est Server Component
- **Ne pas charger** de fonts via un `<link>` dans le `<head>` — utiliser `next/font/google` uniquement
- **Ne pas importer** de composants (Header, Footer, CtaButton, ClinicBadge…) — ils n'existent pas encore, c'est MW-B3
- **Ne pas créer** `globals-public.css` (voir note ci-dessus)
- **Ne pas toucher** à `next.config.ts`, `firebase.json`, `firestore.rules`, `firestore.indexes.json` — hors scope
- **Ne pas installer** de nouvelle dépendance npm — tout ce dont tu as besoin (`next/font/google`, Tailwind) est déjà là
- **Pas de `console.log`** dans le code livré
- **Pas d'emojis** dans l'UI (règle générale du repo)

---

## Mobile first (SEO critique)

**Google indexe mobile-first depuis 2019** : le bot Googlebot regarde la version mobile de chaque page pour déterminer le ranking dans les résultats de recherche. Pour ce site, c'est doublement critique parce que la majorité des patientes potentielles de Judith vont cliquer depuis Instagram mobile, Google Maps mobile, ou une recherche Google mobile. Une page qui bug à 375px perd du SEO **même si elle est parfaite en desktop**.

**Règles absolues pour ce milestone** :

- **Designer pour 375px en premier**, élargir ensuite avec `sm:`, `md:`, `lg:`
- **Aucun débordement horizontal** sur la page à 375px — pas de scroll latéral, jamais
- **Typographie lisible sans zoom** à 375px — le H1 de la page `/` doit rentrer sans coupure et sans écraser (`text-5xl` à 375px puis `md:text-6xl` au-delà, comme dans le snippet L3)
- **Pas de `min-width: 768px`** ni de breakpoints qui laissent le mobile en état dégradé ou vide — le mobile est l'état de référence, pas un fallback
- **Padding horizontal suffisant** sur toutes les pages (`px-6` minimum à 375px pour éviter que le texte touche les bords de l'écran)

**Test obligatoire dans la DoD** : ouvrir `localhost:3000/` dans Chrome DevTools, activer le responsive mode, choisir le preset "iPhone SE" (375 × 667). Vérifier :
1. Aucune scrollbar horizontale
2. Le H1 rentre sans être coupé
3. Le badge "La Source en Soi · 4,9/5" ne déborde pas (il peut wrapper sur 2 lignes si nécessaire, mais ne doit pas dépasser la largeur de l'écran)
4. Le kicker en haut reste lisible sans zoom

Répéter pour `/services/fertilite` et `/reserver` (2 placeholders échantillonnés).

---

## Definition of Done

Chaque item doit être vérifiable en < 30 secondes.

- [ ] `npm run build` passe sans erreur ni warning nouveau (baseline = build avant MW-B1)
- [ ] `npm run dev` démarre sans erreur
- [ ] `http://localhost:3000/` affiche la page placeholder L3 avec :
  - [ ] Fond beige clair (`#F5F0E8`)
  - [ ] Kicker `SITE EN CONSTRUCTION — MW-B1` en terracotta (`#B8694A`)
  - [ ] H1 `Judith Dufour-Savard` en Cormorant Garamond visible (sérif élégante, pas Times)
  - [ ] Badge `La Source en Soi · 4,9 / 5 — 1 200+ avis Google` visible dans un rounded-full
- [ ] `http://localhost:3000/services/fertilite` affiche le placeholder minimal L4 sans erreur
- [ ] `http://localhost:3000/services/acupuncture-sociale` idem
- [ ] `http://localhost:3000/reserver` idem
- [ ] **Mobile first** : `/` testé en DevTools responsive mode preset iPhone SE (375×667) — aucune scrollbar horizontale, H1 rentre sans coupure, badge La Source en Soi ne déborde pas
- [ ] **Mobile first** : `/services/fertilite` testé à 375px — placeholder lisible sans zoom, padding horizontal respecté
- [ ] **Mobile first** : `/reserver` testé à 375px — idem
- [ ] `http://localhost:3000/calendrier` **redirige vers `/login` ou affiche le Hub** — pas de régression (test avec un user déjà connecté dans un autre onglet si besoin)
- [ ] `http://localhost:3000/idees` idem (pas de régression Hub)
- [ ] Les onglets HTML (`<title>`) sont corrects : `/` affiche `Judith Dufour-Savard — Acupunctrice à Montréal`, `/a-propos` affiche `À propos | Judith Dufour-Savard`
- [ ] Aucun warning console dans le navigateur (en particulier pas de `Font not loaded` ni `Hydration mismatch`)
- [ ] `git diff` ne montre **aucune ligne modifiée** dans `app/layout.tsx`, `app/(app)/`, `app/(auth)/`
- [ ] `NOTES.md` créé dans `project-docs/02_ROADMAP/migration-wix/MW-B1_route-group-public/` avec :
  - Date d'exécution
  - Résumé 3-5 lignes
  - Points bloquants rencontrés (ou "aucun")
  - Réponse à Q9 (voir section suivante)

---

## Question Q9 à résoudre pendant l'exécution

`DECISIONS_Q1-Q16.md` liste une question ouverte à trancher au début de MW-B1 : **le root layout `app/layout.tsx` applique-t-il une font globale qui pourrait interférer avec Cormorant Garamond + Inter ?**

**Réponse attendue après lecture de `app/layout.tsx`** :

Le root charge 11 fonts via un `<link>` Google Fonts (Cormorant, Archivo Black, Caveat, DM Sans, Kalam, Libre Baskerville, Manrope, Oswald, Playfair, Poppins, Space Grotesk) — **ces fonts servent à l'éditeur de contenu du Hub**, Judith les utilise pour styler ses textes. Le root **n'applique aucune `font-family` par défaut** dans le `<body className="bg-sand text-gray-900 antialiased min-h-screen">`. Tailwind par défaut utilise `font-sans` (sans-serif système) uniquement quand une classe est appliquée.

→ **Conclusion** : pas d'interférence. Les fonts chargées au root sont dormantes (aucune classe ne les active). Le layout public peut utiliser `next/font/google` sans conflit. Documente ce constat dans `NOTES.md` pour référence future.

**Précision importante — ne pas toucher aux fonts du root** : les 11 fonts chargées via `<link>` dans `app/layout.tsx` (Cormorant Garamond, Archivo Black, Caveat, DM Sans, Kalam, Libre Baskerville, Manrope, Oswald, Playfair Display, Poppins, Space Grotesk) sont **utilisées par l'éditeur de contenu du Hub** — elles constituent la palette typographique que Judith peut appliquer à ses textes via l'éditeur. **Ne pas les retirer, ne pas les modifier, ne pas suggérer de nettoyage**. Elles ne polluent pas le site public parce que `next/font/google` dans `(public)/layout.tsx` est scoped au segment — Next.js traite les deux chargements indépendamment. Cormorant Garamond se retrouve donc chargée deux fois dans le navigateur selon le segment visité : weights `400, 600` + italic 400 pour le Hub (via `<link>`), weights `400, 500, 600, 700` + italic pour le site public (via `next/font`). Pas de conflit, pas de régression.

---

## Notes d'exécution (conseils)

- **Ordre recommandé** : L1 (tailwind) → L2 (layout) → L3 (homepage) → L4 (12 placeholders en batch) → build → dev → tests DoD → NOTES.md
- **Après L1**, fais un `npm run dev` rapide pour confirmer que Tailwind ne rejette pas les nouveaux tokens avant de continuer — ça évite de découvrir le problème 3 livrables plus tard
- **Après L2 + L3**, fais un hard refresh navigateur (Cmd+Shift+R) pour forcer le re-téléchargement des fonts — `next/font` met parfois du temps à apparaître en dev
- **Pour les 12 placeholders L4**, écris une petite boucle ou un script de génération si ça t'aide, mais vérifie que chaque fichier est bien présent avec le bon `title` — une faute de frappe dans un chemin = 404 silencieux
- **Si un `localhost:3000/<route>` retourne 404**, vérifie d'abord que le fichier est bien sous `app/(public)/` et pas directement sous `app/` — c'est la gotcha classique du route group
- **Si les fonts ne chargent pas**, vérifie l'ordre : `next/font/google` doit être appelé en haut du layout (pas dans une fonction), et les CSS variables doivent matcher exactement entre `variable: '--font-public-serif'` (dans le layout) et `['var(--font-public-serif)', ...]` (dans tailwind.config.ts)

---

## Commit final attendu

Un seul commit à la fin, sur la branche `feature/site-public-migration` :

```
feat(public): MW-B1 route group (public)/ + layout + fonts + tokens v4
```

Message de commit détaillé (optionnel mais apprécié) :

```
- Ajoute route group app/(public)/ isolé du Hub admin
- Layout public Server Component avec Cormorant Garamond + Inter via next/font
- Étend tailwind.config.ts avec tokens public-* (colors, fontFamily, boxShadow)
- Homepage placeholder / avec 10 tokens v4 pour validation visuelle
- 12 pages placeholder pour arborescence complète (services, blog, faq, etc.)
- Zéro modification du Hub admin existant
- Ref: MW-B1, docs/migration-wix/CLAUDE.md
```

**Pas de merge dans `main`** — Benoit review sur la branche avant de décider.

---

## Références

- Milestone : `project-docs/02_ROADMAP/migration-wix/MW-B1_route-group-public/MILESTONE.md`
- Invariants migration : `docs/migration-wix/CLAUDE.md`
- Décisions validées : `docs/migration-wix/DECISIONS_Q1-Q16.md` (Q6, Q9)
- Plan stratégique : `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md` §4.5, §4.6.2
- Source design canonique : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`
- Skill prompt one-shot : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt généré le 14 avril 2026 par Claude Desktop (architecte). Exécution par Claude Code (implémenteur) sur branche `feature/site-public-migration`.*
