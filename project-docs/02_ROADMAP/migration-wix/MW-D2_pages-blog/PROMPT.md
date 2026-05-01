# MW-D2 — Pages blog publiques `/blog` (liste) + `/blog/[slug]` (article)

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir executer sans poser de question.

---

## Contexte

MW-B4 a migre les 11 articles de blog Wix dans `publicBlog` Firestore avec 40 images dans Firebase Storage. MW-B3 a cree les composants du design system (SiteHeader, SiteFooter, CtaButton, SectionHeading, etc.) integres dans le layout public. Ce milestone cree les 2 pages du blog public : la liste des articles et la page article individuelle avec rendu markdown, couverture, auteur, date, meta tags dynamiques, et schema.org BlogPosting.

Apres ce milestone : `/blog` affiche les 11 articles tries par date, `/blog/acupuncture-nausees-grossesse` rend un article complet avec markdown style en Cormorant Garamond / Inter, et le Hub admin fonctionne toujours sans regression.

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind CSS, Firebase Admin SDK (`firebase-admin/firestore`), `react-markdown` + `remark-gfm` (a installer — seule nouvelle dependance autorisee). Server Components, SSG + ISR.

---

## Fichiers a lire AVANT de commencer

Dans cet ordre exact. Ne commence a coder qu'apres avoir lu les 9.

1. **`project-docs/02_ROADMAP/migration-wix/MW-B4_parser-ricos-import/artefacts/migration-report.md`** → resume des 11 articles migres : slugs exacts, nombre de lignes markdown, auteur (co-ecrit ou Judith seule), statut. **Gotcha critique** : 3 slugs contiennent des accents (`l-acupuncture-sociale-...-communauté`, `préparation-accouchement-...`, `bébé-siège-acupuncture`). Ces slugs sont les document IDs Firestore — les URLs `/blog/[slug]` contiendront ces accents (les navigateurs les percent-encodent automatiquement). Ne pas tenter de normaliser en ASCII — utiliser les slugs tels quels.

2. **`lib/types/public-blog.ts`** (MW-B2) → schema `PublicBlogPost` avec tous les champs : `title`, `slug`, `content` (markdown), `excerpt`, `coverImage` (URL Firebase Storage), `author`, `category`, `tags`, `status`, `publishedAt`, `wixPostId`, etc. Les `related*` sont vides au lancement.

3. **`lib/firebase-admin.ts`** → `getAdminFirestore()` pour les queries server-side (SSG/ISR). **Gotcha critique** : cette fonction retourne une instance Firestore Admin qui bypass les security rules — parfait pour SSG, mais requiert `FIREBASE_SERVICE_ACCOUNT` en env var. L'import se fait via `import { getAdminFirestore } from '@/lib/firebase-admin'`.

4. **`app/(public)/layout.tsx`** → le layout public integre deja SiteHeader + SiteFooter. Les pages blog n'ont PAS besoin de les re-importer — elles sont heritees. Le layout applique aussi les fonts Cormorant Garamond + Inter via CSS variables.

5. **`app/(public)/_components/CtaButton.tsx`** → composant CTA a utiliser en fin d'article ("Reserver une seance"). Import : `import CtaButton from '../_components/CtaButton'` (ou `@/app/(public)/_components/CtaButton` en absolu).

6. **`app/(public)/_components/SectionHeading.tsx`** → composant pour le titre de la page liste blog. Pas utilise dans la page article (H1 custom pour le titre d'article).

7. **`app/(public)/blog/page.tsx`** → placeholder actuel (MW-B1) a REMPLACER integralement.

8. **`docs/migration-wix/CLAUDE.md`** → invariants : La Source en Soi dans toutes les pages, vouvoiement, generateMetadata, mobile-first 375px, pas de framework UI externe.

9. **`project-docs/02_ROADMAP/migration-wix/MW-D2_pages-blog/MILESTONE.md`** → plan detaille, DoD, contraintes.

---

## Livrable 0a — Installation `react-markdown` + `remark-gfm`

**Commande** :

```bash
npm install react-markdown remark-gfm
```

**Justification** : `react-markdown` est le standard React pour rendre du markdown en JSX. ~45 KB gzip, zero dependance lourde. `remark-gfm` ajoute le support des tables et strikethrough (GitHub Flavored Markdown) — 3 KB supplementaires. Pas besoin de `rehype-raw` ni `rehype-sanitize` car le markdown genere par notre parser (MW-B4) est propre et ne contient pas de HTML inline arbitraire.

**Alternative rejetee** : `marked` + `DOMPurify` demande `dangerouslySetInnerHTML` cote React — incompatible avec Server Components (qui ne supportent pas les refs DOM pour DOMPurify).

---

## Livrable 0b — Modification de `next.config.mjs` (ajouté en review Desktop)

**Objectif** : autoriser `next/image` à optimiser les images Firebase Storage. Sans ce livrable, les pages blog crashent au rendu avec `Error: Invalid src prop on next/image, hostname "firebasestorage.googleapis.com" is not configured`.

**Fichier à modifier** : `next.config.mjs` (note : `.mjs`, pas `.ts`)

**Structure actuelle** (vérifiée par Desktop) : utilise `withPWAInit` en wrapper, l'objet `nextConfig` a une section `async headers()` pour COOP/COEP sur `/editeur/*`. **Pas de section `images`** — à créer.

**Modification exacte** : ajouter la section `images` dans l'objet `nextConfig`, **avant** `async headers()` :

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**',
      },
    ],
  },
  async headers() {
    // ... existant inchangé
  },
}
```

**Points clés** :
- **Ne pas toucher** à `withPWAInit` en haut du fichier ni à `runtimeCaching`
- **Ne pas toucher** à la section `async headers()` existante (COOP/COEP pour `/editeur/*`)
- Le `pathname: '/v0/b/**'` restreint l'autorisation au pattern d'URL Firebase Storage — pas de wildcard sur tout le hostname
- `remotePatterns` est la nouvelle API Next.js 13+, pas `domains` (deprecated)

**Test** : après modification, `npm run build` doit passer sans warning nouveau.

---

## Livrable 1 — Composant `MarkdownRenderer` (`app/(public)/_components/MarkdownRenderer.tsx`)

**Objectif** : composant Server Component qui rend du markdown avec les styles v4 (headings Cormorant Garamond, body Inter, images responsive, liens accent-taupe).

**Fichier a creer** : `app/(public)/_components/MarkdownRenderer.tsx`

```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface MarkdownRendererProps {
  content: string;
}
```

**Composants custom pour ReactMarkdown** (via la prop `components`) :

| Element | Style | Notes |
|---|---|---|
| `h1` | `font-public-serif text-[34px] md:text-[42px] font-medium leading-tight text-public-text-dark mt-12 mb-4` | Peu utilise (le H1 est le titre de l'article, hors markdown) |
| `h2` | `font-public-serif text-[28px] md:text-[34px] font-medium leading-tight text-public-text-dark mt-10 mb-4` | Sections principales |
| `h3` | `font-public-serif text-[22px] md:text-[26px] font-semibold text-public-text-dark mt-8 mb-3` | Sous-sections |
| `p` | `text-[17px] leading-[1.75] text-public-text-medium mb-6` | Body text (Inter via heritance) |
| `a` | `text-public-accent-taupe-dark underline underline-offset-4 decoration-1 hover:text-public-accent-taupe transition-colors` | Liens |
| `ul` | `list-disc pl-6 mb-6 space-y-2 text-[17px] text-public-text-medium` | Listes |
| `li` | `leading-[1.65]` | Items |
| `blockquote` | `border-l-4 border-public-accent-warm pl-6 my-6 italic text-public-text-medium` | Citations |
| `strong` | `font-semibold text-public-text-dark` | Bold |
| `em` | `italic` | Italic |
| `img` | Composant `next/image` | Voir ci-dessous |

**Images markdown** : les `![alt](url)` dans le markdown contiennent des URLs Firebase Storage (`firebasestorage.googleapis.com/...`). On utilise `next/image` avec le `remotePatterns` configuré en L0b. Les images markdown n'ont pas de `width`/`height` natif — on utilise `fill` avec un container à ratio fixe :

```typescript
// Dans la map components de ReactMarkdown
img: ({ src, alt }) => {
  if (!src || typeof src !== 'string') return null;
  return (
    <span className="block relative w-full aspect-[16/9] my-8 rounded-xl overflow-hidden">
      <Image
        src={src}
        alt={alt || ''}
        fill
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover"
      />
    </span>
  );
},
```

**Pourquoi `fill` + container à ratio** : les images markdown n'ont pas de dimensions dans la source. `next/image` exige soit `width`/`height`, soit `fill` + un parent positionné. Le ratio `16/9` est un compromis raisonnable pour des images de blog (ajustable si besoin via CSS dans la prop `className` du container). L'`object-cover` gère le cas où l'image originale n'est pas exactement 16:9.

**Le composant doit rester < 80 lignes** — c'est principalement une map de composants React passee a `<ReactMarkdown>`.

---

## Livrable 2 — Page liste `/blog` (`app/(public)/blog/page.tsx`)

**Objectif** : remplacer le placeholder MW-B1 par la liste des 11 articles publies, tries par date DESC, avec cover + titre + extrait + auteur + date.

**Fichier a modifier** : `app/(public)/blog/page.tsx` (remplacer integralement)

**Architecture** :
- Server Component (pas de `'use client'`)
- Query Firestore via `getAdminFirestore()` :
  ```typescript
  const db = getAdminFirestore();
  const snapshot = await db.collection('publicBlog')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .get();
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  ```
- ISR avec `export const revalidate = 3600` (1h — le cron MW-F2 peut aussi forcer la revalidation)

**Layout de la page** :
- `<SectionHeading kicker="BLOG" title="Articles" subtitle="..." />`
- Grille : `grid grid-cols-1 md:grid-cols-2 gap-8`
- Chaque card est un `<Link href={/blog/${post.slug}}>` avec :
  - Cover image : `<Image>` dans un container à ratio vidéo :
    ```tsx
    <div className="relative aspect-video w-full overflow-hidden rounded-t-[14px]">
      <Image
        src={post.coverImage}
        alt={post.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    ```
  - Titre : `font-public-serif text-xl font-semibold text-public-text-dark leading-tight`
  - Category badge : `text-[11px] font-semibold tracking-[1.5px] uppercase text-public-accent-taupe-dark`
  - Extrait : `text-[15px] text-public-text-medium leading-relaxed line-clamp-3`
  - Auteur + date : `text-[13px] text-public-text-light`
  - Date formatee : `new Date(publishedAt).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })`
- Card styling : `border border-public-border-subtle rounded-[14px] overflow-hidden hover:shadow-public-md transition-shadow group`

**`generateMetadata`** :
```typescript
export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles sur l\'acupuncture : fertilite, grossesse, pediatrie, acupuncture sociale. Par Judith Dufour-Savard, acupunctrice a Montreal.',
};
```

**Gotcha `publishedAt`** : le champ est un Firestore `Timestamp`, pas un `Date` ni un string. Pour l'afficher, utiliser `post.publishedAt?.toDate()` ou `new Date(post.publishedAt._seconds * 1000)`. Verifier empiriquement lequel fonctionne cote Admin SDK (`.toDate()` est la methode standard des Timestamp Firestore).

---

## Livrable 3 — Page article `/blog/[slug]` (`app/(public)/blog/[slug]/page.tsx`)

**Objectif** : page article individuelle avec cover pleine largeur, titre H1, auteur, date, contenu markdown rendu, CTA final.

**Fichier a creer** : `app/(public)/blog/[slug]/page.tsx`

**Architecture** :
- Server Component
- `generateStaticParams` pour SSG :
  ```typescript
  export async function generateStaticParams() {
    const db = getAdminFirestore();
    const snapshot = await db.collection('publicBlog')
      .where('status', '==', 'published')
      .select('slug')
      .get();
    return snapshot.docs.map(doc => ({ slug: doc.data().slug }));
  }
  ```
- ISR : `export const revalidate = 3600`
- Fetch article par slug :
  ```typescript
  const db = getAdminFirestore();
  const doc = await db.collection('publicBlog').doc(slug).get();
  if (!doc.exists) notFound();
  const post = { id: doc.id, ...doc.data() };
  ```

**Layout de la page article** :

1. **Cover image** pleine largeur avec `next/image` + `priority` pour optimiser le LCP :
   ```tsx
   <div className="max-w-4xl mx-auto px-5 md:px-8 pt-8">
     <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
       <Image
         src={post.coverImage}
         alt={post.title}
         fill
         sizes="(max-width: 896px) 100vw, 896px"
         priority
         className="object-cover"
       />
     </div>
   </div>
   ```
   Le flag `priority` demande à Next.js de précharger cette image (hint LCP) — c'est l'image principale above-the-fold de l'article.
2. **Meta bloc** sous la cover :
   - Category badge
   - H1 titre : `font-public-serif text-[34px] md:text-[46px] font-medium leading-[1.15] text-public-text-dark`
   - Auteur + date : `text-[15px] text-public-text-light` — "Par {author} — {date formatee}"
3. **Contenu markdown** : `<MarkdownRenderer content={post.content} />` dans un container `max-w-3xl mx-auto px-5 md:px-8`
4. **CTA final** : `<CtaButton variant="primary" size="lg">Reserver une seance</CtaButton>` centre, apres le contenu
5. **Navigation** : lien retour `<Link href="/blog">Retour aux articles</Link>` en haut ou en bas

**`generateMetadata`** dynamique :
```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = getAdminFirestore();
  const doc = await db.collection('publicBlog').doc(slug).get();
  if (!doc.exists) return { title: 'Article non trouve' };
  const post = doc.data();
  return {
    title: post.title,
    description: post.excerpt?.slice(0, 160) || '',
    openGraph: {
      title: post.title,
      description: post.excerpt?.slice(0, 160) || '',
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toDate?.()?.toISOString(),
    },
  };
}
```

**Gotcha Next.js 15** : `params` est maintenant une `Promise` dans App Router — il faut `await params` avant d'utiliser `params.slug`. Si tu oublies, tu auras un `TypeError: Cannot read properties of undefined (reading 'slug')`.

**Schema.org BlogPosting** (JSON-LD dans la page) :
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      author: { '@type': 'Person', name: post.author },
      datePublished: post.publishedAt?.toDate?.()?.toISOString(),
      image: post.coverImage || undefined,
      publisher: {
        '@type': 'Person',
        name: 'Judith Dufour-Savard',
      },
      description: post.excerpt,
    }),
  }}
/>
```

---

## Livrable 4 — not-found page (`app/(public)/blog/[slug]/not-found.tsx`)

**Objectif** : page 404 pour les slugs inexistants.

**Fichier a creer** : `app/(public)/blog/[slug]/not-found.tsx`

```typescript
import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 md:px-8 py-24 text-center">
      <h1 className="font-public-serif text-4xl font-medium text-public-text-dark mb-4">
        Article non trouve
      </h1>
      <p className="text-public-text-medium mb-8">
        L'article que vous cherchez n'existe pas ou a ete deplace.
      </p>
      <Link
        href="/blog"
        className="text-public-accent-taupe-dark underline underline-offset-4"
      >
        Retour aux articles
      </Link>
    </main>
  );
}
```

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`
- **Ne modifier `next.config.mjs` QUE** pour l'ajout du bloc `images.remotePatterns` documenté en L0b — zéro autre modification (pas toucher à `withPWAInit`, `runtimeCaching`, ou `async headers()`)
- **Ne pas modifier** `lib/firebase-admin.ts` — l'importer tel quel
- **Ne pas** ajouter de section "Articles lies" — c'est MW-D6 (maillage interne)
- **Ne pas** ajouter de breadcrumb visible — c'est MW-D6 aussi (ou un milestone ulterieur)
- **Seule nouvelle dependance autorisee** : `react-markdown` + `remark-gfm`
- **Ne pas** utiliser `dangerouslySetInnerHTML` pour le rendu markdown — utiliser `react-markdown` (Server Component compatible)
- **Ne pas** alterer le contenu des articles — rendu fidele du markdown
- Composants < 150 lignes
- Mobile-first 375px
- Pas d'emojis dans l'UI
- `export default` pour tous les composants/pages (coherent avec le Hub)

---

## Mobile first (SEO critique)

- **Page liste** : grille 1 colonne mobile, 2 colonnes a `md:` (768px)
- **Page article** : cover pleine largeur, padding horizontal `px-5` minimum
- **Markdown** : images `w-full`, pas de scroll horizontal
- **Titre article H1** : `text-[34px]` mobile, `md:text-[46px]` desktop
- **Cards blog** : pas de hauteur fixe, `line-clamp-3` sur les extraits pour uniformiser
- **Aucun debordement horizontal** a 375px

**Test DoD** : DevTools iPhone SE (375 x 667) sur `/blog` et `/blog/acupuncture-nausees-grossesse` :
1. Cards blog en colonne unique, lisibles sans zoom
2. Article : titre rentre sans coupure, images ne debordent pas, markdown lisible

---

## Definition of Done

Chaque item doit etre verifiable en < 30 secondes.

- [ ] `npm install react-markdown remark-gfm` termine sans erreur
- [ ] `npm run build` passe sans erreur
- [ ] 4 fichiers crees/modifies : `MarkdownRenderer.tsx`, `blog/page.tsx` (remplace), `blog/[slug]/page.tsx`, `blog/[slug]/not-found.tsx`
- [ ] `localhost:3000/blog` affiche 11 articles tries par date desc avec covers, titres, extraits
- [ ] `localhost:3000/blog/acupuncture-nausees-grossesse` affiche l'article complet avec : cover image, titre H1 en Cormorant Garamond, auteur "Judith Dufour-Savard et Claire Thomas", date, markdown rendu (headings, paragraphes, listes, images, liens, blockquotes)
- [ ] `localhost:3000/blog/slug-inexistant` affiche la page 404 "Article non trouve"
- [ ] Le markdown contient des headings en `font-public-serif` et du body en `font-public-sans` (herite)
- [ ] Les images inline dans le markdown sont rendues via `<Image>` de `next/image` (vérifier dans le DOM : présence de `<img srcset="..." sizes="..." />` généré par Next). Si les storage rules ne sont pas encore déployées, les URLs retourneront 403 — c'est attendu, le code doit être correct quand même
- [ ] La cover image de la page article utilise `priority` pour le LCP
- [ ] `next.config.mjs` contient la section `images.remotePatterns` avec `firebasestorage.googleapis.com` (vérifiable avec `grep -A 5 remotePatterns next.config.mjs`)
- [ ] `git diff next.config.mjs` montre **uniquement** l'ajout du bloc `images` — pas d'autre modification
- [ ] `git diff` ne montre **aucune modification** dans `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts`
- [ ] Le H1 de l'article n'est PAS dans le markdown `content` — c'est un element JSX separe au-dessus
- [ ] La page article a un CTA "Reserver une seance" en fin d'article
- [ ] Les articles co-ecrits affichent "Par Judith Dufour-Savard et Claire Thomas"
- [ ] `<title>` de `/blog` = "Blog | Judith Dufour-Savard"
- [ ] `<title>` de `/blog/acupuncture-nausees-grossesse` = titre de l'article + suffixe
- [ ] Schema.org `BlogPosting` present dans le HTML source de la page article (verifiable via View Source)
- [ ] **Mobile 375px** : aucun scroll horizontal sur `/blog` et `/blog/acupuncture-nausees-grossesse`
- [ ] `localhost:3000/calendrier` fonctionne sans regression (Hub admin)
- [ ] `git diff` ne montre **aucune modification** dans `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, `tailwind.config.ts` (`next.config.mjs` est autorisé UNIQUEMENT pour l'ajout documenté en L0b)
- [ ] ISR configure : `export const revalidate = 3600` present dans les 2 pages
- [ ] `NOTES.md` cree avec : date, resume, qualite du rendu markdown, gotchas rencontres

---

## Notes d'execution (conseils)

- **Ordre recommande** : L0 (npm install) → L1 (MarkdownRenderer) → L2 (page liste) → L3 (page article) → L4 (not-found) → build → dev → tests DoD → NOTES.md
- **Tester le MarkdownRenderer isolement d'abord** : apres L1, modifier temporairement la page placeholder pour afficher `<MarkdownRenderer content="## Test\n\nParagraphe **bold** et *italic*.\n\n- Item 1\n- Item 2" />` et verifier visuellement
- **Firestore Timestamp** : le champ `publishedAt` retourne un Timestamp Firestore en Admin SDK. La methode `.toDate()` le convertit en `Date` JavaScript. Si ca ne marche pas, essayer `new Date(publishedAt.seconds * 1000)` ou `new Date(publishedAt._seconds * 1000)`.
- **Images Firebase Storage 403** : si Benoit n'a pas encore deploye `firebase deploy --only storage`, les images retourneront 403 en navigation anonyme (les storage rules ne sont pas encore actives). C'est attendu — le code est correct, les images s'afficheront apres deploiement. En dev local, si l'env var `FIREBASE_SERVICE_ACCOUNT` est configuree, la query Firestore fonctionne mais les images dans le navigateur non.
- **Slugs avec accents** : les 3 slugs accentues sont des document IDs Firestore valides. `db.collection('publicBlog').doc('bébé-siège-acupuncture').get()` fonctionne. Les URLs Next.js avec accents fonctionnent aussi (le navigateur percent-encode automatiquement).
- **`params` est une Promise en Next.js 15** : dans `generateMetadata` et le composant page de `[slug]`, utiliser `const { slug } = await params`.

---

## Commit final attendu

Un seul commit a la fin, sur la branche `feature/site-public-migration` :

```
feat(public): MW-D2 pages blog (liste + article + markdown renderer)
```

Message detaille :

```
- Page /blog : liste 11 articles avec covers, tri par date, SSG + ISR
- Page /blog/[slug] : article complet avec markdown rendu, cover, auteur, date
- MarkdownRenderer : react-markdown + remark-gfm, styles v4 Cormorant/Inter
- Schema.org BlogPosting + generateMetadata dynamique
- not-found.tsx pour slugs inexistants
- CTA "Reserver une seance" en fin d'article
- Zero modification du Hub admin existant
- Ref: MW-D2, MW-B4 (publicBlog Firestore), MW-B3 (composants)
```

**Pas de merge dans `main`** — Benoit review sur la branche avant de decider.

---

## Questions strategiques pour review Desktop

### QS1 — `next/image` vs `<img>` natif (✅ RÉSOLUE — INVERSÉE en review Desktop)

**Décision finale** : **utiliser `next/image`** + ajouter le `remotePatterns` dans `next.config.mjs`. Le draft initial proposait l'inverse (`<img>` natif) — cette reco a été inversée en review Desktop.

**Raisons** :
1. Le site public est **SEO-critique**. `next/image` fournit responsive srcset, lazy loading, conversion WebP/AVIF, CLS prevention, LCP priority — tous impactent Core Web Vitals et le ranking Google.
2. La "contrainte" de ne pas toucher `next.config.mjs` est un **faux compromis** — 5 lignes dans la section `images`, zéro impact Hub admin.
3. **Firebase Storage est déjà référencé** dans `next.config.mjs` via PWA `runtimeCaching`. Ajouter `remotePatterns` pour le même hostname est cohérent.
4. `next.config.mjs` n'a **pas encore** de section `images` (vérifié par Desktop).

**Snippet exact à ajouter** dans `next.config.mjs`, dans l'objet `nextConfig`, avant `async headers()` :

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com',
      pathname: '/v0/b/**',
    },
  ],
},
```

**Ce devient le Livrable 0b** (voir section Livrable 0b ci-dessous). Tous les `<img>` du PROMPT initial ont été remplacés par `<Image>` de `next/image` avec `fill` + container à ratio (pour les images markdown sans dimensions) ou `width`/`height` explicites.

### QS2 — Le H1 de la page `/blog` est-il un heading ou un composant SectionHeading ?

**Contexte** : la page liste peut utiliser `<SectionHeading kicker="BLOG" title="Articles" />` (coherent avec la vitrine MW-B3) ou un H1 simple inline (plus leger).

**Reco par defaut** : `<SectionHeading />` pour la coherence design system. C'est ce que font les autres pages.

---

## References

- Milestone : `project-docs/02_ROADMAP/migration-wix/MW-D2_pages-blog/MILESTONE.md`
- Migration report : `project-docs/02_ROADMAP/migration-wix/MW-B4_parser-ricos-import/artefacts/migration-report.md`
- Schema cible : `lib/types/public-blog.ts`
- Admin SDK : `lib/firebase-admin.ts`
- Composants MW-B3 : `app/(public)/_components/`
- Layout public : `app/(public)/layout.tsx`
- Invariants : `docs/migration-wix/CLAUDE.md`
- Skill : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt drafte le 14 avril 2026 par Claude Code (Opus). Execution sur branche `feature/site-public-migration` apres review Benoit/Desktop.*
