# Milestone MW-D2 : Pages `/blog` (liste) + `/blog/[slug]` (article)

**Type** : UI
**Vague** : 4
**Priorité** : High
**Temps estimé Claude Code** : 2-4h
**Dépendances** : MW-B3, MW-D1
**Status** : 🔴 Not started

---

## Objectif

Créer les pages du blog public — liste des articles avec tri par date et page article individuelle avec rendu markdown, auteur, date, image de couverture, et CTAs.

---

## Contexte minimal

MW-D1 a importé les 11 articles de blog dans `publicBlog` Firestore. Ce milestone construit les pages qui affichent ces articles. Le blog est un spoke important dans l'architecture hub-and-spoke (plan §4.4.1) — chaque article pointe vers le hub service de son pilier.

---

## Livrables

- [ ] **Page `app/(public)/blog/page.tsx`** — liste des articles publiés, triés par date DESC, avec card par article (cover, titre, extrait, auteur, date)
- [ ] **Page `app/(public)/blog/[slug]/page.tsx`** — article individuel avec rendu markdown, image de couverture, auteur, date de publication, CTAs
- [ ] **Renderer markdown** — composant ou utilitaire qui convertit le markdown en HTML stylé avec les tokens v4
- [ ] **Metadata dynamique** via `generateMetadata` — title, description, OG image par article
- [ ] **Schema.org** `BlogPosting` par article

---

## Approche technique

**Page liste** (`/blog/page.tsx`) :
- Server Component qui query `publicBlog` Firestore, `status == 'published'`, `orderBy publishedAt DESC`
- Grille de cards (1 colonne mobile, 2 colonnes desktop)
- Chaque card : image de couverture via `next/image`, titre en Cormorant Garamond, extrait, auteur, date formatée
- SSG + ISR (`revalidate` via le cron quotidien MW-F2)

**Page article** (`/blog/[slug]/page.tsx`) :
- Server Component qui query `publicBlog/{slug}`
- `generateStaticParams` pour SSG de tous les articles existants
- Layout article : image couverture pleine largeur, titre H1, auteur + date, contenu markdown rendu en HTML
- Sidebar ou fin d'article : CTA "Réserver une séance", lien vers page service du pilier correspondant
- Breadcrumb : Accueil > Blog > [Titre article]

**Renderer markdown** :
- Utiliser `react-markdown` (ou équivalent léger) pour le rendu
- Styler avec les tokens v4 : headings en Cormorant Garamond, body en Inter, liens en `accent-taupe`
- Support des images inline, listes, citations, code (si présent)

**Schema.org BlogPosting** :
```json
{
  "@type": "BlogPosting",
  "headline": "...",
  "author": { "@type": "Person", "name": "Judith Dufour-Savard" },
  "datePublished": "...",
  "image": "...",
  "publisher": { "@type": "Person", "name": "Judith Dufour-Savard" }
}
```

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/blog/page.tsx
- app/(public)/blog/[slug]/page.tsx
- lib/utils/markdown-renderer.tsx (ou composant dédié)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] La page `/blog` affiche les 11 articles triés par date
- [ ] Cliquer sur un article mène à `/blog/[slug]` avec le contenu complet
- [ ] Le markdown est rendu correctement (titres, paragraphes, listes, images, liens)
- [ ] Les articles co-écrits avec Claire Thomas créditent les deux auteurs
- [ ] Lighthouse 95+ sur les pages blog
- [ ] Schema.org `BlogPosting` validé sur au moins 2 articles
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px et 1024px — page liste et page article
- **SEO** : meta tags dynamiques par article, schema.org BlogPosting, breadcrumb
- **Contenu** : ouvrir 2-3 articles et vérifier que le rendu markdown est fidèle au contenu original
- **Navigation** : liens breadcrumb, lien retour vers la liste, CTA vers `/reserver`

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Le contenu des articles ne doit pas être altéré — rendu fidèle du markdown importé en MW-D1
- `react-markdown` (ou alternative) est la seule dépendance externe autorisée pour le rendu — justifier le choix
- Composants < 150 lignes
- Mobile-first 375px
- Pas d'emojis

---

## Références

- Plan stratégique §4.4 (maillage interne — articles comme spokes), §9.1 (CTAs blog)
- MW-D1 (données `publicBlog` dans Firestore)
- MW-B3 (`<SectionHeading />`, `<CtaButton />`)

---

## Notes de planification

- La section "Articles liés" en bas de chaque article sera ajoutée en MW-D6 (maillage interne). Pour l'instant, pas de section "Articles liés".
- Les articles co-écrits avec Claire Thomas doivent afficher "Par Judith Dufour-Savard et Claire Thomas" — pas seulement Judith.
- La dépendance `react-markdown` est légère et bien maintenue. Alternative : `marked` + `DOMPurify` pour un rendu plus contrôlé.
- Le renderer markdown doit gérer les images inline avec `next/image` pour l'optimisation automatique.
