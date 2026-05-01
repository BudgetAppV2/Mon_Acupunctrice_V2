# Content Strategy Pipeline — Architecture Technique

**Date** : 16 avril 2026
**Auteur** : Claude Code (Opus) — audit codebase complet
**Ref** : VISION.md (meme dossier)

---

## Legende

- **[EXISTE]** — Fichier deja en production, fonctionne
- **[MODIFIER]** — Fichier existant a modifier
- **[CREER]** — Nouveau fichier a creer
- **[SUPPRIMER]** — A terme, a retirer (dead code Wix)

---

## Module 1 : CMS Blog (MW-E3)

### Etat actuel

Le pipeline blog est 100% couple a Wix :

```
BlogEditor.tsx (TiptapEditor, HTML)
  → htmlToMarkdownText() convertit HTML → markdown
  → POST /api/blog/publish → Wix API v3 (createDraft + publish)
  → POST /api/blog/list   → Wix API v3 (listPosts)
  → GET  /api/blog/stats  → Wix API v3 (posts + metrics)
  → GET  /api/blog/carousel → Wix API v3 (8 derniers, HTML embed)
```

Cote site public, les articles vivent deja dans Firestore `publicBlog` (importes via MW-B4 parser Ricos). Le site public lit via `lib/firestore/public-blog.ts` (getRecentBlogPosts) et `app/(public)/blog/[slug]/page.tsx` (SSG + ISR 1h).

**Le gap** : le BlogEditor publie vers Wix, mais le site public lit Firestore. Il faut router la publication vers Firestore.

### Architecture cible

```
BlogEditor.tsx [MODIFIER]
  → onPublish() appelle usePublishBlog.publish()
    → POST /api/blog/publish [MODIFIER — Firestore au lieu de Wix]
      → Ecrit dans collection `publicBlog` (meme schema PublicBlogPost)
      → Genere le slug (slugify du titre)
      → Status initial : 'published' (ou 'draft' si flag)
      → Genere les FAQ via /api/generate-blog-faq [EXISTE, inchange]
      → Stocke les FAQ dans le document publicBlog (champ faqs[])
    → Retourne { slug, postUrl: '/blog/{slug}' }
  → Le site public se rafraichit via ISR 1h (deja en place)
```

### Fichiers

| Fichier | Action | Detail |
|---------|--------|--------|
| `app/api/blog/publish/route.ts` | MODIFIER | Remplacer Wix API par firebase-admin write Firestore `publicBlog`. Garder la generation FAQ intacte. Ajouter generation du slug, timestamps, status='published'. |
| `app/api/blog/list/route.ts` | MODIFIER | Remplacer Wix API par Firestore query `publicBlog` (firebase-admin). Retourner meme format de reponse pour compatibilite useBlogArticles. |
| `app/api/blog/stats/route.ts` | MODIFIER | A terme remplacer par Plausible. Court terme : retourner les stats Firestore (nombre de posts, pas de views — views viendront de Plausible). |
| `app/api/blog/carousel/route.ts` | SUPPRIMER | Servait pour un embed Wix HTML. Plus necessaire. |
| `lib/hooks/useBlogArticles.ts` | INCHANGE | Appelle /api/blog/list — transparent si on change le backend de list. |
| `lib/hooks/useBlogStats.ts` | INCHANGE | Appelle /api/blog/stats — transparent. |
| `components/features/blog/BlogEditor.tsx` | MODIFIER | Changer le label "Publier sur Wix" → "Publier". Ajouter un toggle draft/published optionnel. Le coverImage upload vers Firebase Storage est deja en place. |
| `components/features/blog/TiptapEditor.tsx` | INCHANGE | Editeur riche fonctionne bien. |
| `lib/utils/ricosConverter.ts` | INCHANGE | `htmlToMarkdownText()` reste utile pour convertir le HTML Tiptap en markdown avant stockage Firestore (le site public rend du markdown via MarkdownRenderer). |

### Schema Firestore (existant — `publicBlog`)

```typescript
// lib/types/public-blog.ts — DEJA DEFINI
interface PublicBlogPost {
  id: string;           // = slug (doc ID)
  title: string;
  slug: string;
  content: string;      // markdown
  excerpt: string;      // 160 chars
  coverImage: string;   // URL Firebase Storage
  author: string;       // "Judith Dufour-Savard"
  category: string;
  tags: string[];
  status: PublicationStatus;  // 'draft' | 'published'
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  wixPostId?: string;   // legacy, optionnel
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}
```

**Champ a ajouter** : `faqs?: { question: string; answer: string }[]` — les 3 FAQ generees par Claude, stockees inline dans le doc blog (comme les faqEntries des ressources). A ajouter au type PublicBlogPost.

### Estimation effort

**4-5 heures CC** — La majorite est du rewiring (Wix → Firestore), pas de la creation. Le schema existe, les composants existent, le site public lit deja Firestore.

---

## Module 2 : CMS FAQ (MW-E1)

### Etat actuel

- 6 FAQ existent dans Firestore `faqs` (importees via MW-D3)
- La page `/faq` les lit via `lib/firestore/public-faq.ts` (getAllPublishedFaqs)
- Le type `FAQ` est defini dans `lib/types/faq.ts`
- **AUCUNE interface admin** pour creer/editer/supprimer des FAQ

### Architecture cible

```
app/(app)/admin/faq/page.tsx [CREER]
  → Liste des FAQ existantes (collection `faqs`)
  → Bouton "Nouvelle FAQ"
  → Click → formulaire inline ou sheet

components/features/admin/FaqForm.tsx [CREER]
  → Champs : question, reponse (textarea avec markdown preview),
    category (select), order (number), relatedServices (multi-select)
  → Bouton "Enregistrer" (draft) ou "Publier"

app/api/admin/faq/route.ts [CREER]
  → POST : creer une FAQ dans Firestore `faqs`
  → PATCH : modifier une FAQ existante
  → DELETE : supprimer (ou passer en 'rejected')
  → Auth required (verifier uid === Benoit)
```

### Fichiers

| Fichier | Action | Detail |
|---------|--------|--------|
| `app/(app)/admin/faq/page.tsx` | CREER | Liste CRUD des FAQ. Client component (Firestore realtime). |
| `components/features/admin/FaqForm.tsx` | CREER | Formulaire FAQ avec preview markdown temps reel. |
| `app/api/admin/faq/route.ts` | CREER | API CRUD Firestore `faqs`. Auth middleware (uid check). |
| `lib/firestore/public-faq.ts` | INCHANGE | Lecture seule, deja ok. |
| `lib/types/faq.ts` | INCHANGE | Type complet, deja ok. |

### Schema Firestore (existant — `faqs`)

```typescript
// lib/types/faq.ts — DEJA DEFINI
interface FAQ {
  id: string;
  question: string;
  reponse: string;          // markdown (200-400 mots)
  category: FaqCategory;    // 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale' | 'seance'
  order: number;
  status: PublicationStatus;
  ctaVariant: CtaVariant;
  relatedServices: string[];
  relatedArticles: string[];
  relatedFaqs: string[];
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}
```

Pas de modification de schema necessaire.

### Estimation effort

**3 heures CC** — CRUD standard avec un formulaire. Le plus long sera le preview markdown inline.

---

## Module 3 : CMS Ressources (MW-E2)

### Etat actuel

- 5 ressources existent dans Firestore `ressources` (importees via MW-D3)
- La page `/ressources/[slug]` les lit via `lib/firestore/public-ressources.ts`
- Le type `Ressource` est defini dans `lib/types/ressource.ts` — c'est le type le plus complexe (7 sections markdown, faqEntries[], citations[])
- **AUCUNE interface admin** pour creer/editer des ressources

### Architecture cible

```
app/(app)/admin/ressources/page.tsx [CREER]
  → Liste des ressources existantes
  → Bouton "Nouvelle ressource"

app/(app)/admin/ressources/[slug]/page.tsx [CREER]
  → Formulaire multi-sections : 7 champs markdown + meta + FAQ + citations
  → Preview temps reel (split-pane ou onglet)

components/features/admin/RessourceForm.tsx [CREER]
  → Formulaire avec tabs/accordion pour les 7 sections
  → Section FAQ : ajout/suppression de questions (faqEntries[])
  → Section citations : ajout/suppression (citations[])
  → Preview markdown pour chaque section

app/api/admin/ressources/route.ts [CREER]
  → POST : creer une ressource dans Firestore `ressources`
  → PATCH : modifier une ressource existante
  → DELETE : supprimer ou rejeter
  → Auth required
```

### Fichiers

| Fichier | Action | Detail |
|---------|--------|--------|
| `app/(app)/admin/ressources/page.tsx` | CREER | Liste des ressources avec status badges. |
| `app/(app)/admin/ressources/[slug]/page.tsx` | CREER | Editeur multi-section. Le plus gros composant du pipeline. |
| `components/features/admin/RessourceForm.tsx` | CREER | Formulaire avec 7 onglets markdown + meta + FAQ + citations. |
| `components/features/admin/MarkdownField.tsx` | CREER | Textarea + preview markdown temps reel. Reutilisable par FaqForm et RessourceForm. |
| `app/api/admin/ressources/route.ts` | CREER | API CRUD Firestore `ressources`. |
| `lib/firestore/public-ressources.ts` | INCHANGE | Lecture seule. |
| `lib/types/ressource.ts` | INCHANGE | Type complet. |

### Schema Firestore (existant — `ressources`)

```typescript
// lib/types/ressource.ts — DEJA DEFINI
interface Ressource {
  id: string;
  title: string;
  slug: string;
  type: RessourceType;           // 'guide' | 'checklist' | 'article-fond' | 'infographie'
  pilier: RessourcePilier;       // 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale' | 'transversal'
  status: PublicationStatus;
  metaTitle: string;
  metaDescription: string;
  heroImageUrl?: string;
  heroImageAlt: string;
  shortAnswer: string;
  introSection: string;          // markdown
  scienceSection: string;        // markdown
  mechanismSection: string;      // markdown
  judithApproach: string;        // markdown
  whatToExpect: string;           // markdown
  protocolSection: string;       // markdown
  testimonial: string;           // markdown
  faqEntries: FaqEntry[];        // { question, answer }[]
  citations: Citation[];         // { authors, title, journal, year, url? }[]
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  relatedResources: string[];
  authorName: string;
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}
```

Pas de modification de schema necessaire.

### Estimation effort

**6-7 heures CC** — Le plus complexe des modules. Formulaire avec 7+ sections markdown, gestion dynamique des faqEntries et citations, preview en direct. Le composant MarkdownField sera reutilisable.

---

## Module 4 : Workflow Review UI (MW-E4)

### Etat actuel

Le champ `status: PublicationStatus` existe sur les 3 types (PublicBlogPost, FAQ, Ressource) avec les valeurs `'draft' | 'pending' | 'published' | 'rejected'`. Mais il n'y a aucune UI pour gerer le workflow. Tout est publie directement.

### Architecture cible

```
components/features/admin/StatusBadge.tsx [CREER]
  → Badge colore selon status (draft=gris, pending=jaune, published=vert, rejected=rouge)

components/features/admin/StatusActions.tsx [CREER]
  → Boutons contextuels : "Publier" (draft→published), "Rejeter", "Depublier"

app/(app)/admin/page.tsx [CREER]
  → Dashboard admin : vue unifiee des contenus draft/pending de toutes collections
  → 3 tabs : Blog / FAQ / Ressources (ou vue globale)
```

### Fichiers

| Fichier | Action | Detail |
|---------|--------|--------|
| `app/(app)/admin/page.tsx` | CREER | Dashboard admin : all content by status |
| `components/features/admin/StatusBadge.tsx` | CREER | Badge reutilisable |
| `components/features/admin/StatusActions.tsx` | CREER | Boutons workflow |
| BottomTabBar/layout | MODIFIER | Ajouter un onglet "Admin" ou un acces depuis Profil |

### Estimation effort

**3 heures CC** — Composants simples si les modules 1/2/3 sont deja implementes.

---

## Module 5 : Blog → Social Pipeline (MW-E5)

### Etat actuel

Le pipeline social est operationnel :

```
ContentItem (collection contentItems)
  → workflowState : idea → planned → ready_to_shoot → shot → editing → ready
  → distributionStatus : draft → scheduled → publishing → published | failed
  → scheduledAt → cron /api/cron/publish (1x/jour midi UTC)
  → Publication : IG (Graph API) + FB (Graph API) + YT (resumable upload)
  → Insights : cron /api/cron/fetch-insights (1x/jour 10h UTC)
```

Le blog n'est PAS connecte au pipeline social. Quand un article est publie, il n'y a aucun lien vers les reseaux sociaux.

### Architecture cible

```
Trigger : POST /api/blog/publish reussit
  → Appelle POST /api/blog/to-social [CREER]
    → Genere une caption via /api/generate-caption (Claude API, EXISTE)
    → Cree un ContentItem dans Firestore `contentItems` :
      - title = titre du blog
      - captionDraft = caption generee
      - category = categorie du blog
      - workflowState = 'ready'
      - distributionStatus = 'draft' (Benoit decide quand publier)
      - notes = "Auto-genere depuis blog: /blog/{slug}"
      - thumbnailUrl = coverImage du blog
    → Le contentItem apparait dans le calendrier Hub
    → Benoit le planifie manuellement ou le publie
```

### Fichiers

| Fichier | Action | Detail |
|---------|--------|--------|
| `app/api/blog/to-social/route.ts` | CREER | Genere un contentItem depuis un blog post. Appelle /api/generate-caption puis ecrit dans Firestore. |
| `app/api/blog/publish/route.ts` | MODIFIER | Apres publication Firestore reussie, appeler /api/blog/to-social en non-bloquant (fire-and-forget). |
| `lib/types/index.ts` | INCHANGE | ContentItem deja complet (tous les champs necessaires). |
| `app/api/cron/publish/route.ts` | INCHANGE | Publiera le contentItem quand il sera schedule. |

### Schema Firestore (existant — `contentItems`)

Pas de nouveau champ necessaire. On reutilise :
- `title` : titre du blog post
- `captionDraft` : caption generee par Claude
- `category` : meme categorie
- `thumbnailUrl` : cover image du blog
- `notes` : reference vers le blog post

### Estimation effort

**2-3 heures CC** — API route + integration dans le flow blog/publish. La generation de caption existe deja.

---

## Module 6 : Analytics Dashboard — Plausible (MW-F3)

### Etat actuel

Les stats actuelles dans le Hub sont :
- **Instagram Insights** : plays, reach, likes, comments, shares, saved — via `lib/hooks/useAnalytics.ts` (Firestore `analytics/{uid}/daily`)
- **Blog stats (Wix)** : views, likes, comments — via `lib/hooks/useBlogStats.ts` (Wix API)
- Dashboard dans `app/(app)/stats/page.tsx` : summary cards + growth chart + publications list + blog section

**Aucune analytics du site public** (acupuncturejudith.ca). Pas de Plausible, pas de Google Analytics.

### Architecture cible

```
Phase A — Plausible script (immediat, ~30 min)
  → Ajouter <script data-domain="acupuncturejudith.ca" src="..."> dans app/(public)/layout.tsx
  → Option 1 : Plausible Cloud (9$/mois, setup immediat)
  → Option 2 : Self-hosted (gratuit, besoin d'un serveur)
  → Les donnees sont consultables sur plausible.io ou le dashboard self-hosted

Phase B — Dashboard dans le Hub (optionnel, mois 2)
  → API Plausible Stats → app/api/site-stats/route.ts [CREER]
  → lib/hooks/useSiteStats.ts [CREER]
  → Section dans app/(app)/stats/page.tsx [MODIFIER] ou page separee
  → Metriques : visiteurs uniques, top pages, sources, conversions /reserver
```

### Fichiers — Phase A (prioritaire)

| Fichier | Action | Detail |
|---------|--------|--------|
| `app/(public)/layout.tsx` | MODIFIER | Ajouter le script Plausible. 3 lignes. |

### Fichiers — Phase B (optionnel)

| Fichier | Action | Detail |
|---------|--------|--------|
| `app/api/site-stats/route.ts` | CREER | Proxy vers Plausible Stats API. Cache 1h. |
| `lib/hooks/useSiteStats.ts` | CREER | Hook client pour fetcher les stats site public. |
| `app/(app)/stats/page.tsx` | MODIFIER | Ajouter une section "Site public" sous la section "Blog". |
| `components/features/stats/SiteStatsCard.tsx` | CREER | Card pour metriques site (visiteurs, top pages). |

### Estimation effort

- **Phase A** : 30 min (une ligne dans layout.tsx + config du domaine Plausible)
- **Phase B** : 3-4 heures (API proxy + hook + UI dans stats page)

---

## Module 7 : Maillage interne dynamique (MW-E6)

### Etat actuel

Le maillage est hardcode dans les pages services et ressources :
- Pages services → "Pour aller plus loin" avec 4 liens hardcodes (ex: `/ressources/acupuncture-fertilite-montreal`)
- Pages ressources → "Autres ressources" via `getRelatedRessources()` (dynamique, trie par pilier)
- Pages blog → aucun cross-linking vers services/ressources

### Architecture cible

```
components/(public)/_components/RelatedContent.tsx [CREER]
  → Server Component
  → Props : pilier, excludeSlugs, type ('ressource' | 'blog' | 'faq')
  → Query Firestore dynamique par pilier
  → Affiche 3-4 cards (RessourceCard ou BlogCard)
  → Remplace les liens hardcodes dans les pages services

app/(public)/blog/[slug]/page.tsx [MODIFIER]
  → Ajouter <RelatedContent> en bas de chaque article blog
  → Lie au pilier de l'article (category → pilier mapping)
```

### Fichiers

| Fichier | Action | Detail |
|---------|--------|--------|
| `app/(public)/_components/RelatedContent.tsx` | CREER | Server Component dynamique cross-collection. |
| `app/(public)/blog/[slug]/page.tsx` | MODIFIER | Ajouter section "Ressources associees" en bas. |
| `app/(public)/services/*/page.tsx` (4 pages) | MODIFIER | Remplacer "Pour aller plus loin" hardcode par RelatedContent dynamique. |

### Estimation effort

**2-3 heures CC** — Composant unique reutilisable + modifications mineures dans 5 pages.

---

## Dependances entre modules

```
Module 6A (Plausible script)  ← aucune dependance, peut etre fait IMMEDIATEMENT
    |
Module 1 (CMS Blog)           ← aucune dependance, peut etre fait IMMEDIATEMENT
    |
    ├─→ Module 5 (Blog→Social) ← depend de Module 1 (publish vers Firestore)
    |
Module 2 (CMS FAQ)            ← aucune dependance
    |
Module 3 (CMS Ressources)     ← partage MarkdownField avec Module 2 (faire 2 avant 3)
    |
Module 4 (Workflow Review)     ← depend de Modules 1+2+3 (doit avoir du contenu a reviewer)
    |
Module 7 (Maillage dynamique) ← depend de Modules 1+2+3 (doit avoir du contenu dynamique a afficher)
    |
Module 6B (Dashboard Hub)     ← depend de Module 6A (Plausible doit etre en place)
```

---

## Ordre d'execution recommande

### Sprint 1 — Immediat (semaine 1)

| # | Module | Effort | Justification |
|---|--------|--------|---------------|
| 1 | **MW-F3a** Plausible script | 30 min | Mesurer des le jour 1, zero risque, 3 lignes de code |
| 2 | **MW-E3** CMS Blog → Firestore | 4-5h | Debloque la capacite de publier des articles via le Hub |

### Sprint 2 — CMS complet (semaine 2)

| # | Module | Effort | Justification |
|---|--------|--------|---------------|
| 3 | **MW-E1** CMS FAQ | 3h | Plus simple, cree MarkdownField reutilisable |
| 4 | **MW-E2** CMS Ressources | 6-7h | Le plus complexe, reutilise MarkdownField |
| 5 | **MW-E4** Workflow Review UI | 3h | Unifie le dashboard admin |

### Sprint 3 — Automatisation (semaine 3-4)

| # | Module | Effort | Justification |
|---|--------|--------|---------------|
| 6 | **MW-E5** Blog → Social | 2-3h | Automatise la creation de posts sociaux |
| 7 | **MW-E6** Maillage dynamique | 2-3h | Remplace les liens hardcodes |
| 8 | **MW-F3b** Analytics Dashboard | 3-4h | Plausible aura accumule assez de donnees |

### Total estime : ~24-29 heures CC

---

## Risques et decisions a prendre

### R1 : Double-publication Wix + Firestore (transition)

Pendant la migration, faut-il continuer a publier sur Wix en parallele ?
- **Option A** : Couper Wix immediatement (MW-E3 remplace tout)
- **Option B** : Dual-write pendant 2 semaines, puis couper Wix
- **Recommande** : Option A — le site Wix va etre deprecie, les 11 articles Wix sont deja importes dans Firestore. Pas de raison de maintenir le double.

### R2 : Auth admin

Actuellement, le Hub utilise Firebase Auth (Google Sign-In). Il n'y a pas de concept de "role admin". Options :
- **Option A** : Hardcoder le UID de Benoit dans les API routes admin (simple, suffisant pour 1 utilisateur)
- **Option B** : Ajouter un champ `role: 'admin'` dans la collection `users`
- **Recommande** : Option A — c'est un outil pour Benoit seul. YAGNI.

### R3 : Plausible Cloud vs Self-hosted

- **Cloud** (9$/mois) : setup 5 min, dashboard inclus, pas de maintenance
- **Self-hosted** (gratuit) : besoin d'un serveur (Vercel ne peut pas l'heberger), maintenance Docker
- **Recommande** : Cloud pour le lancement, migrer self-hosted plus tard si les couts deviennent un enjeu.

### R4 : Editeur markdown vs Tiptap

Les CMS FAQ et Ressources utilisent du markdown (stocke en Firestore, rendu par MarkdownRenderer). Options pour l'editeur admin :
- **Option A** : Textarea brute avec preview split-pane (simple, pas de dependance)
- **Option B** : Tiptap (deja installe) avec export markdown (riche, mais convertir HTML→MD est fragile)
- **Recommande** : Option A — textarea + preview. Le markdown est du texte simple, pas besoin de WYSIWYG. Benoit est a l'aise avec le markdown.

---

## Navigation admin — BottomTabBar

L'onglet Inspiration existant pourrait etre remplace ou cohabiter :

```
Actuel :   Idees | Calendrier | Inspiration | Profil
Option A : Idees | Calendrier | Admin       | Profil    (remplace Inspiration)
Option B : Idees | Calendrier | Inspiration | Profil    (Admin accessible depuis Profil)
```

**Recommande** : Option B — acceder a l'admin depuis Profil (un lien "Gerer le site public"). L'Inspiration est utile pour Judith.

---

*Document genere le 16 avril 2026. A mettre a jour apres validation Desktop.*
