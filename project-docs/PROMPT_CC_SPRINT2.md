# Mission CC : Sprint 2 — CMS FAQ + Ressources + Workflow Validation Judith

## ⚠️ Contexte de branche
Tu es sur `feature/site-public-migration`.
Le Sprint 1 (Plausible + Blog→Firestore) doit être terminé avant de commencer.

## Lire d'abord
- `CLAUDE.md` (racine)
- `project-docs/02_ROADMAP/content-strategy/ARCHITECTURE.md` — sections MW-E1, MW-E2, MW-E4
- `lib/types/` — PublicBlog, FAQ, Ressource (types existants avec PublicationStatus)
- `lib/firestore/` — helpers existants (public-blog.ts, public-faq.ts, public-ressources.ts)

## Décisions prises (ne pas remettre en question)
- R2 : Auth admin = hardcoder UID Benoit
- R4 : Éditeur = textarea markdown + preview (PAS Tiptap)
- Le workflow de validation est le MÊME pour les 3 types de contenu (blog, FAQ, ressources)

---

## PARTIE 1 — Composants réutilisables (à créer en premier)

### 1A. MarkdownField — composant d'édition markdown

Créer `components/features/cms/MarkdownField.tsx`

Un composant simple :
- Textarea à gauche, preview markdown rendu à droite (split view)
- Ou toggle entre "Éditer" et "Prévisualiser"
- Utilise une lib markdown→HTML simple (ex: `marked` ou `react-markdown`)
- Props : `value`, `onChange`, `label`, `placeholder`, `rows`
- Pas besoin de toolbar rich text — c'est du markdown brut

### 1B. StatusBadge — indicateur de statut

Créer `components/features/cms/StatusBadge.tsx`

- 3 statuts : `draft` (gris), `pending` (jaune/orange), `published` (vert)
- Simple badge coloré avec texte
- Props : `status: PublicationStatus`

### 1C. ContentReviewCard — carte de contenu pour la liste

Créer `components/features/cms/ContentReviewCard.tsx`

Pour la page de validation Judith et la liste admin. Affiche :
- Titre du contenu
- Type (badge : Ressource / Blog / FAQ)
- StatusBadge
- Date de création / dernière modification
- Résumé (3-5 lignes, tronqué)
- Lien vers l'édition (pour Benoit) ou la validation (pour Judith)

---

## PARTIE 2 — MW-E4 : Workflow de validation Judith

### Page "Contenu du site" dans le Hub

Créer `app/(app)/contenu/page.tsx`

C'est la page centrale qui liste TOUT le contenu du site (blog + FAQ + ressources) avec filtres et workflow.

**Vue Benoit (admin)** :
- Liste tous les contenus, tous types confondus
- Filtres : par type (Blog / FAQ / Ressource), par statut (draft / pending / published)
- Bouton "Nouveau" → choix du type → redirige vers le formulaire de création
- Pour chaque contenu : éditer, soumettre à validation, publier directement
- Voir les commentaires de Judith

**Vue Judith (validation)** :
- Liste seulement les contenus en statut `pending`
- Pour chaque contenu : titre, type, résumé (3-5 lignes), date
- Clic → preview du contenu complet (rendu markdown)
- Deux boutons : "Approuver" / "Commenter"
- Si approuvé → statut passe à `published`, revalidation ISR
- Si commenté → champ texte libre, sauvegardé dans Firestore, statut reste `pending`

**Champs Firestore à ajouter** (sur les 3 types) :
```typescript
// Ajouter dans les types existants
reviewComment?: string;      // commentaire de Judith
reviewedAt?: Date;           // date de la review
reviewedBy?: string;         // UID du reviewer
submittedAt?: Date;          // date de soumission pour review
```

**API routes nécessaires** :
- `app/api/cms/list/route.ts` — liste tous les contenus (blog + faq + ressources) avec filtres
- `app/api/cms/approve/route.ts` — approuve un contenu (status → published + revalidate ISR)
- `app/api/cms/comment/route.ts` — ajoute un commentaire de review
- `app/api/cms/submit/route.ts` — soumet pour validation (status → pending)

**Revalidation ISR** :
Quand un contenu est approuvé, appeler `revalidatePath()` pour les pages concernées :
- Blog : `revalidatePath('/blog')` + `revalidatePath('/blog/[slug]')`
- FAQ : `revalidatePath('/faq')`
- Ressource : `revalidatePath('/ressources')` + `revalidatePath('/ressources/[slug]')`

### Navigation Hub

Ajouter "Contenu du site" dans la sidebar du Hub :
- Icône : DocumentTextIcon ou NewspaperIcon
- Position : après les onglets existants du Hub
- Badge count : nombre de contenus en statut `pending` (pour que Judith voie qu'il y a du contenu à valider)

---

## PARTIE 3 — MW-E1 : CMS FAQ

### Page création/édition FAQ

Créer `app/(app)/contenu/faq/page.tsx` (liste des FAQ)
Créer `app/(app)/contenu/faq/new/page.tsx` (créer une FAQ)
Créer `app/(app)/contenu/faq/[id]/page.tsx` (éditer une FAQ)

**Formulaire FAQ** — champs :
- `question` : input text (obligatoire)
- `answer` : MarkdownField (obligatoire)
- `category` : select parmi les catégories existantes (fertilite, grossesse, pediatrie, sociale, general)
- `order` : number (ordre d'affichage dans la catégorie)
- `status` : sélecteur (draft / pending / published) — par défaut draft

**API routes** :
- `app/api/cms/faq/route.ts` — GET (list) + POST (create)
- `app/api/cms/faq/[id]/route.ts` — GET (one) + PUT (update) + DELETE

**Écriture Firestore** :
```typescript
// Collection: faqs
{
  question: string,
  answer: string,           // markdown
  category: string,
  order: number,
  status: PublicationStatus, // 'draft' | 'pending' | 'published'
  createdAt: Timestamp,
  updatedAt: Timestamp,
  submittedAt?: Timestamp,
  reviewComment?: string,
  reviewedAt?: Timestamp,
}
```

Le type `FAQ` existe déjà dans `lib/types/faq.ts` — l'étendre si nécessaire (ajouter les champs review).

---

## PARTIE 4 — MW-E2 : CMS Ressources

### Page création/édition Ressource

Créer `app/(app)/contenu/ressources/page.tsx` (liste)
Créer `app/(app)/contenu/ressources/new/page.tsx` (créer)
Créer `app/(app)/contenu/ressources/[id]/page.tsx` (éditer)

**Formulaire Ressource** — c'est le plus complexe. Champs :

```
Informations de base :
- title : input text
- slug : input text (auto-généré depuis le titre, éditable)
- metaDescription : textarea (155 chars max)
- pillar : select (fertilite, grossesse, pediatrie, sociale, sante-mentale, general)
- status : select (draft / pending / published)
- heroImage : input text (URL de l'image)

Contenu principal :
- introSection : MarkdownField (introduction, ~300 mots)
- scienceSection : MarkdownField (ce que la science dit, ~500 mots)
- approcheSection : MarkdownField (mon approche, ~300 mots)
- faqSection : MarkdownField (questions fréquentes inline, ~300 mots)

Citations scientifiques :
- citations[] : tableau dynamique, chaque entrée a :
  - authors : input text
  - title : input text
  - journal : input text
  - year : input text
  - pmid : input text (lien PubMed)
  - summary : textarea (résumé en 1-2 phrases)

FAQ associées :
- faqEntries[] : tableau dynamique, chaque entrée a :
  - question : input text
  - answer : MarkdownField

Relations :
- relatedServices : multi-select (fertilite, grossesse, pediatrie, sociale)
- relatedArticles : multi-select (slugs des articles blog existants)
```

**Interface** :
- Formulaire en sections dépliables (accordéon) pour ne pas surcharger visuellement
- Bouton "Ajouter une citation" / "Ajouter une FAQ" pour les tableaux dynamiques
- Preview du contenu rendu (comme il apparaîtra sur le site) dans un panneau à droite ou un onglet "Prévisualiser"

**API routes** :
- `app/api/cms/ressources/route.ts` — GET (list) + POST (create)
- `app/api/cms/ressources/[id]/route.ts` — GET (one) + PUT (update) + DELETE

Le type `Ressource` existe déjà dans `lib/types/ressource.ts` — l'étendre si nécessaire.

---

## PARTIE 5 — Blog CMS amélioré

Le Sprint 1 a connecté le BlogEditor existant à Firestore. Dans ce sprint, ajouter :
- L'intégration avec le workflow review (statut draft/pending/published)
- Un lien depuis la page "Contenu du site" vers le BlogEditor existant
- Le StatusBadge dans la liste des articles

Pas besoin de recréer le BlogEditor — juste l'intégrer dans le nouveau flux.

---

## Résumé des fichiers à créer

### Composants réutilisables
- `components/features/cms/MarkdownField.tsx`
- `components/features/cms/StatusBadge.tsx`
- `components/features/cms/ContentReviewCard.tsx`

### Pages admin
- `app/(app)/contenu/page.tsx` — dashboard contenu (liste + filtres + validation)
- `app/(app)/contenu/faq/page.tsx` — liste FAQ
- `app/(app)/contenu/faq/new/page.tsx` — créer FAQ
- `app/(app)/contenu/faq/[id]/page.tsx` — éditer FAQ
- `app/(app)/contenu/ressources/page.tsx` — liste ressources
- `app/(app)/contenu/ressources/new/page.tsx` — créer ressource
- `app/(app)/contenu/ressources/[id]/page.tsx` — éditer ressource

### API routes
- `app/api/cms/list/route.ts` — liste unifiée tous types
- `app/api/cms/approve/route.ts` — approuver un contenu
- `app/api/cms/comment/route.ts` — commenter un contenu
- `app/api/cms/submit/route.ts` — soumettre pour validation
- `app/api/cms/faq/route.ts` — CRUD FAQ
- `app/api/cms/faq/[id]/route.ts` — CRUD FAQ par ID
- `app/api/cms/ressources/route.ts` — CRUD Ressources
- `app/api/cms/ressources/[id]/route.ts` — CRUD Ressources par ID

### Modifications existantes
- Sidebar Hub : ajouter "Contenu du site" avec badge count pending
- Types FAQ et Ressource : ajouter champs review (reviewComment, reviewedAt, submittedAt)

---

## Vérifications

- [ ] Page "Contenu du site" accessible dans le Hub
- [ ] Badge count "pending" visible dans la sidebar
- [ ] Créer une FAQ via le formulaire → vérifier dans Firestore
- [ ] Créer une Ressource via le formulaire → vérifier dans Firestore
- [ ] Soumettre un contenu pour validation → statut passe à "pending"
- [ ] Approuver un contenu → statut passe à "published" + revalidate ISR
- [ ] Commenter un contenu → commentaire visible, statut reste "pending"
- [ ] MarkdownField : le preview affiche le markdown rendu correctement
- [ ] Le BlogEditor existant est accessible depuis la page "Contenu du site"
- [ ] Build OK

## Commit
"feat(hub): MW-E1/E2/E4 — CMS FAQ + Ressources + Workflow validation

Nouveau système CMS dans le Hub avec workflow de validation :
- MarkdownField, StatusBadge, ContentReviewCard (composants réutilisables)
- Page 'Contenu du site' : liste unifiée blog/FAQ/ressources avec filtres
- CMS FAQ : CRUD complet avec MarkdownField
- CMS Ressources : formulaire multi-section avec citations et FAQ associées
- Workflow : draft → pending → published avec commentaires Judith
- Revalidation ISR automatique à l'approbation
- Badge count pending dans la sidebar Hub"

