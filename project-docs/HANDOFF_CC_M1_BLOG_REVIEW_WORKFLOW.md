# Handoff CC — Milestone 1 : Workflow blog uniformisé

**Date** : 2026-05-08
**Contexte** : reprise du travail de robustesse sur le pipeline de contenu (Hub admin) après le Chantier 1 AEO. Diagnostic complet effectué le 6 mai, décisions stratégiques prises ce jour. M1 démarre la séquence en 3 milestones (M1 indépendant, M2 et M3 pour plus tard).

---

## 1. Contexte stratégique

### Le système actuel — 4 sous-systèmes (rappel)

| Sous-système | État avant M1 |
|---|---|
| Posts sociaux IG/FB/YouTube | 🟢 Mature (cron `publish` quotidien) |
| Ressources & FAQ (CMS public) | 🟢 Solide (workflow `pending → published` via Hub `/contenu`) |
| **Blog public** | 🟡 **Maillon faible — bypass review** |
| Bridge contenu → social | 🔴 Orphelin (M2) |

### Décisions stratégiques arbitrées (8 mai)

| # | Question | Décision |
|---|---|---|
| Q1 | Workflow blog | **(b) Review** — `pending → published` comme ressources/FAQ |
| Q2 | Bridge contenu → social | **(c) Opt-in** — checkbox au moment du publish/approve, default coché pour blog, default décoché pour ressources/FAQ |
| Q3 | Source du blog | **(c) Les deux** — Tiptap (Hub) + markdown via `inject.mjs` |
| Q4 | Bridge ressources/FAQ | **(b) Toutes** — bridge disponible pour tout type, contrôlé par checkbox |
| Q5 | Format séquence | **(a) Unique** — J+0/J+1/J+3/J+7 pour tous types |
| Q6 | Captions auto | **(c) LLM avec fallback** — Groq/Claude génère 4 captions sur mesure, fallback sur templates statiques si appel LLM échoue |

---

## 2. Scope du Milestone 1 (UNIQUEMENT)

**Objectif** : faire passer le blog par le workflow `pending → published` comme les ressources et FAQ. Permettre l'injection batch de blog posts en markdown via `inject.mjs`.

**Ce qui est PAS dans M1** (pour info, à faire en M2/M3) :
- ❌ Bridge auto vers calendarSlots / posts sociaux (M2)
- ❌ Captions LLM (M2)
- ❌ Migration `useBlogSequence` URL → slug interne (M3)
- ❌ Toute UI sociale / story preview

M1 livre **uniquement** le workflow review unifié. Les 3 milestones sont indépendants et déployables un par un.

---

## 3. État actuel des fichiers concernés

### `app/api/blog/publish/route.ts` (89 lignes)

Le route POST publie directement avec `status: 'published'` (ligne ~65) et set `publishedAt: serverTimestamp()` (ligne ~73). C'est le bypass à corriger.

**Côté positif** : le reste de la structure (slug, FAQ generation, htmlToMarkdownText, ctaUrl, revalidatePath) est propre — on garde tout ça. Le seul changement structurel est `status` et `publishedAt`.

### `app/api/cms/approve/route.ts` (42 lignes)

**Déjà câblé pour blog** :

```ts
const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};
```

Le route gère déjà la transition `pending → published` pour `type: 'blog'`, set `publishedAt`, `reviewedAt`, `reviewedBy`, et appelle `revalidatePath('/blog')` + `revalidatePath('/blog/${id}')`. Aucune modification nécessaire ici. ✅

### Hub `/contenu` (à vérifier par CC)

D'après le diagnostic du 6 mai, le Hub `/contenu` liste les contenus pending de toutes les collections via `/api/cms/list`. À vérifier :
- L'API `/api/cms/list` inclut-elle `publicBlog` ?
- Le composant `ContentReviewCard` rend-il correctement un blog post ?

Si oui → rien à faire. Si non → étendre la liste (probablement ajouter `'blog'` dans le filtre côté API et côté UI).

### `content/scripts/inject.mjs` (à vérifier par CC)

Doit supporter une collection `publicBlog` cible. Si actuellement limité à `ressources` et `faqs`, l'étendre pour accepter aussi `blog`/`publicBlog`. Format markdown attendu :

```markdown
---
title: "Titre de l'article"
slug: "titre-de-larticle"
category: "Acupuncture"
coverImage: "https://..."
status: "pending"
faqs:
  - question: "Q1"
    answer: "R1"
---

Le contenu markdown de l'article ici. **Gras**, *italique*, etc.

# Sous-titres

Etc.
```

À l'injection, créer le doc dans `publicBlog` avec `status: 'pending'`, prêt à être approuvé via `/api/cms/approve`.


## 4. Changements précis à effectuer

### Action 1 — Modifier `/api/blog/publish/route.ts`

Remplacer la création du document Firestore pour qu'elle parte en `pending` au lieu de `published`.

**Diff conceptuel** :

```diff
    await docRef.set({
      title,
      slug,
      content: contentWithCta,
      excerpt,
      coverImage: coverImageUrl || '',
      author: 'Judith Dufour-Savard',
      category: category || 'Acupuncture',
      tags: [],
-     status: 'published',
+     status: 'pending',
      relatedServices: [],
      relatedFaqs: [],
      relatedArticles: [],
      faqs: faqs || [],
-     publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
+     // publishedAt sera set par /api/cms/approve quand Judith approuve
+     // reviewedAt et reviewedBy idem
    });

-    // Revalidate ISR pages
-    revalidatePath('/blog');
-    revalidatePath(`/blog/${slug}`);

    return NextResponse.json({
      success: true,
      postId: slug,
-     postUrl: `/blog/${slug}`,
+     postUrl: `/blog/${slug}`,
+     status: 'pending',
+     reviewUrl: `/contenu`,  // Hub URL pour approuver
    });
```

**Pourquoi retirer `revalidatePath`** : on ne revalide plus à la création (le contenu est `pending`, pas encore live). La revalidation sera déclenchée par `/api/cms/approve` (qui le fait déjà — vérifié dans le route).

### Action 2 — Vérifier Hub `/contenu` inclut le blog

CC doit ouvrir et inspecter :
1. `app/api/cms/list/route.ts` (ou équivalent) — vérifier que la liste des contenus pending inclut bien `publicBlog`. Si elle filtre actuellement par type (`faq` ou `ressource` seulement), ajouter `blog`.
2. Le composant qui affiche la liste dans Hub `/contenu` — vérifier que les blog posts pending apparaissent bien avec un badge `BLOG`. Si filtre type-spécifique, l'étendre.

**Si tout est déjà câblé pour blog** : aucune modification nécessaire. Documenter dans le commit.

### Action 3 — Étendre `content/scripts/inject.mjs` pour `publicBlog`

CC doit ouvrir `content/scripts/inject.mjs` et :
1. Identifier comment les collections `ressources` et `faqs` sont gérées
2. Ajouter le support de `publicBlog` avec le même pattern (parsing du frontmatter YAML, extraction du contenu markdown, injection en `pending`)
3. Convention de path : les fichiers blog en markdown sont dans `content/blog/<slug>.md` (créer le dossier au besoin)

**Champs frontmatter attendus** pour un blog en markdown :

```yaml
---
title: string (requis)
slug: string (optionnel — généré depuis title si absent)
category: string (default "Acupuncture")
coverImage: string (URL Firebase Storage, optionnel)
excerpt: string (optionnel — généré depuis les 160 premiers chars sinon)
faqs: array (optionnel)
---
```

Le statut est forcé à `pending` à l'injection (pas dans le frontmatter).

**Tester** : créer un fichier `content/blog/test-injection.md` minimal (titre + 2 paragraphes), lancer `node content/scripts/inject.mjs content/blog/test-injection.md --dry-run`, puis sans `--dry-run`, puis vérifier dans Hub `/contenu` que le post apparaît en pending.

### Action 4 — Mettre à jour `CLAUDE.md` (workflow doc)

CLAUDE.md a un section sur le workflow de contenu. Mettre à jour pour documenter le nouveau pattern unifié :

```markdown
**Workflow contenu unifié (depuis M1, mai 2026)** :

Les 3 types de contenus publics (blog, ressources, FAQ) suivent maintenant
le même cycle :

1. **Création** :
   - Blog : Hub `/blogue` (Tiptap) → `/api/blog/publish` → status `pending`
   - Blog batch : `node content/scripts/inject.mjs content/blog/<slug>.md`
   - Ressources : `node content/scripts/inject.mjs content/ressources/<slug>.md`
   - FAQ : Hub `/contenu/faq/new` → status `pending`

2. **Review** : Hub `/contenu` liste tous les pending de toutes collections.
   Judith approuve via bouton → `/api/cms/approve` → status `published` +
   `revalidatePath` ISR.

3. **Bridge social (M2 — à venir)** : checkbox "créer aussi la séquence
   sociale" au moment de l'approbation (default coché pour blog, décoché
   pour ressources/FAQ). Crée 4 calendarSlots J+0/J+1/J+3/J+7. Le cron
   `/api/cron/publish` les sortira ensuite.
```

### Action 5 — Test manuel end-to-end

Avant de pousser, CC doit tester le workflow complet :

1. Créer un blog post minimal via Hub `/blogue` Tiptap
2. Vérifier dans Firestore (ou via API) que `status: 'pending'`
3. Vérifier dans Hub `/contenu` que le post apparaît en pending
4. Cliquer "Approuver"
5. Vérifier que `status: 'published'` + `publishedAt` set
6. Ouvrir `/blog` côté public et vérifier que le post apparaît
7. Ouvrir `/blog/<slug>` et vérifier que la page rend correctement

Idem en alternative pour l'injection markdown :

1. Créer `content/blog/test-m1.md` avec frontmatter minimal
2. `node content/scripts/inject.mjs content/blog/test-m1.md`
3. Vérifier en pending dans Hub
4. Approuver
5. Vérifier en live

Si tout marche → commit + push. Si quoi que ce soit casse → rollback et debug.


## 5. Build check + commit + push

### Build check (CRITIQUE)

```bash
cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
npm run build
```

Doit passer sans erreur TypeScript.

### Commit ciblé

Stager UNIQUEMENT les fichiers du M1 :

```bash
# Fichiers obligatoires
git add app/api/blog/publish/route.ts
git add CLAUDE.md

# Si étendu (selon ce que CC découvre)
git add content/scripts/inject.mjs
git add app/api/cms/list/route.ts        # si modifié
git add components/features/cms/<...>     # si UI étendue

# Si dossier nouveau
git add content/blog/.gitkeep             # placeholder pour le dossier
```

**NE PAS COMMITTER** :
- `lib/animations/*` (WIP non lié de Benoit)
- Doublons " 2." (cleanup séparé)
- Fichiers de test temporaires (`content/blog/test-*.md` doivent être supprimés avant commit)
- `project-docs/HANDOFF_CC_*.md` et `AUDIT_BRIEF_FOR_CODEX.md` et `PROMPT_CC_UNPUBLISH.md` (déjà untracked, restent tels quels)

Vérifier le staged :

```bash
git status --short
git diff --cached --stat
```

### Commit message proposé

```
feat(content): unified review workflow for blog (Milestone 1)

Aligns blog publication with the same pending → published review workflow
already used for ressources and FAQ. Closes the inconsistency identified
in the May 6 pipeline audit where /api/blog/publish was bypassing review
and going straight to status 'published'.

CHANGES

/api/blog/publish/route.ts
- status now defaults to 'pending' instead of 'published'
- publishedAt timestamp removed (set later by /api/cms/approve)
- revalidatePath calls removed (revalidation now happens at approve time,
  consistent with how ressources/FAQ behave)
- Response includes status: 'pending' and reviewUrl: '/contenu' so the
  caller (BlogEditor in Hub) can redirect Judith to the review queue

/api/cms/approve/route.ts
- No change needed — already supported type 'blog' via COLLECTION_MAP.
  This was the half of the system that was already wired correctly.

content/scripts/inject.mjs
- Extended to support 'publicBlog' collection alongside ressources/faqs
- New convention: content/blog/<slug>.md for batch markdown injection
- Frontmatter schema documented in handoff
- Injected docs always start with status 'pending'

Hub /contenu
- [VERIFY OR DOCUMENT] : the listing API and review card already
  supported blog posts, so no UI change was needed / minor extension
  was required (depending on CC findings)

CLAUDE.md
- Documented the new unified workflow for the 3 content types
- Marked M2 (social bridge) and M3 (storyImageGenerator slug migration)
  as upcoming work

WHY
- Cohérence : the 3 content types (blog, ressources, FAQ) now share the
  same review workflow. Judith reviews everything in one place (Hub
  /contenu) before content goes live.
- Foundation for M2 : the bridge from approved content to social
  calendarSlots will hook into /api/cms/approve, so we needed the blog
  to flow through that endpoint first.
- Batch injection enabled : Benoit can now push 5-10 blog posts in
  markdown via inject.mjs and Judith reviews them in the Hub at her
  pace, instead of one-by-one Tiptap entry.

DECISIONS REFERENCED
Based on the strategic Q1-Q6 arbitrated by Benoit on May 8 :
- Q1 = (b) Review workflow
- Q3 = (c) Both Tiptap + markdown injection
(Other decisions Q2/Q4/Q5/Q6 are scope of M2)

TESTING
End-to-end manual test passed :
- Tiptap creation → pending in Firestore → visible in /contenu → approve
  → published → live on /blog/<slug>
- Markdown injection → pending → visible in /contenu → approve → live
- npm run build : clean
```

### Push

```bash
git push origin main
```

Vercel rebuild ~3-5 min. Vérification post-déploiement :

1. Hub `/blogue` accessible et fonctionnel
2. Créer un post de test en prod, vérifier qu'il part bien en `pending`
3. Hub `/contenu` montre le post pending
4. Approuver, vérifier qu'il devient live sur `/blog/<slug>`
5. Supprimer le post de test (via Firestore console ou retire script)

---

## 6. Pièges à éviter

1. **NE PAS toucher aux autres fichiers du pipeline social** (`useBlogSequence`, `storyImageGenerator`, `cron/publish`, `CreateSequenceSheet`). C'est M2 et M3.

2. **NE PAS modifier les fichiers `lib/animations/*`** — WIP non lié de Benoit.

3. **NE PAS committer les fichiers de test temporaires** (`content/blog/test-*.md`) — les supprimer avant commit.

4. **VÉRIFIER que `/api/cms/list` retourne bien les blog posts pending** avant de finaliser. Si l'API filtre actuellement par type et exclut blog, c'est à étendre. Sans ça, Judith ne verra pas les posts pending dans le Hub.

5. **Préserver le comportement actuel des ressources et FAQ** — toute modification à `inject.mjs` doit être additive, pas changer le comportement existant. Tester avec une ressource markdown existante après modification pour confirmer.

6. **`htmlToMarkdownText` reste utilisé pour les posts Tiptap** — c'est ce qui convertit le HTML Tiptap en markdown stocké en base. Pour les posts injectés via markdown, le contenu est déjà en markdown et ne passe pas par cette conversion. Vérifier que le rendu côté `/blog/<slug>` fonctionne dans les deux cas.

---

## 7. Aperçu M2 et M3 (POUR INFO — ne pas exécuter aujourd'hui)

### M2 — Bridge contenu → social (~3-4h, prochaine session)

Une fois M1 stable :

- Refactorer `useBlogSequence` pour partir de `(contentType, slug)` au lieu d'URL externe
- Modifier `/api/cms/approve` pour accepter `createSocialSequence: boolean` (default `true` si type='blog', `false` sinon)
- Si checkbox cochée : créer 4 calendarSlots (J+0/J+1/J+3/J+7) liés au content via `sequenceId`
- Ajouter un appel LLM (Groq ou Claude) au moment de la création des slots pour générer 4 captions sur mesure (avec fallback templates)
- UI : checkbox dans le composant `ContentReviewCard` quand on approuve
- Tests : approuver un blog → vérifier 4 slots créés → cron les sort

### M3 — Migration `storyImageGenerator` slug interne (~1h, après M2)

- Aujourd'hui le générateur prend `(url, title)` externes
- Le faire prendre `(contentType, slug, title)` et générer une URL interne canonique `acupuncturejudith.ca/{type}/{slug}`
- Garantit que les stories pointent vers le contenu interne (et pas vers Wix legacy)

---

## 8. Récap actions M1

```
[ ] Lire le handoff entièrement
[ ] Vérifier l'état actuel des fichiers concernés
[ ] Action 1 — Modifier /api/blog/publish/route.ts (status pending)
[ ] Action 2 — Vérifier ou étendre Hub /contenu pour blog posts
[ ] Action 3 — Étendre inject.mjs pour publicBlog
[ ] Action 4 — Update CLAUDE.md workflow doc
[ ] Action 5 — Test manuel end-to-end (Tiptap path + markdown path)
[ ] npm run build (CRITIQUE)
[ ] Cleanup fichiers de test temporaires
[ ] git add ciblé
[ ] git commit avec message proposé
[ ] git push origin main
[ ] Vérification post-déploiement Vercel
```

Bonne session !
