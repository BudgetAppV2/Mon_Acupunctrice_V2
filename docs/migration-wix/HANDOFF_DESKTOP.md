# HANDOFF_DESKTOP — Passation pour le Claude Desktop suivant

*Fichier à lire **en premier** si tu es un Claude Desktop qui reprend le projet migration Wix → Vercel pour Judith Dufour-Savard après une conversation précédente. Écrit le 14 avril 2026, à la fin d'une session qui a livré 4 milestones (MW-B1, MW-B2, MW-B3, MW-A1a).*

---

## Pourquoi ce fichier existe

Chaque conversation Claude Desktop a une fenêtre de contexte limitée. Sur un projet à 30 milestones, une seule conversation ne peut pas tout faire. Ce fichier existe pour que **le prochain Desktop puisse reprendre sans poser 20 questions à Benoit**. Il est court et actionnable : tu dois pouvoir ingérer ça + 3-4 autres fichiers en 5 minutes et commencer à drafter/reviewer immédiatement.

**Si tu es Benoit** : ce fichier ne t'est pas destiné mais tu peux le lire pour comprendre comment je vois le projet. Il est maintenu à chaque fin de session significative — si tu vois qu'il devient obsolète, demande au Desktop courant de le mettre à jour.

---

## Contexte projet en 90 secondes

**Qui** : Judith Dufour-Savard, acupunctrice à Montréal (clinique La Source en Soi à Rosemont, 4,9/5 avec 1 215 avis Google). Partenaire de Benoit Archambault, Directeur Technique des Grands Ballets.

**Quoi** : migrer le site public `acupuncturejudith.ca` depuis Wix vers un route group `(public)/` dans le Hub V2 Next.js (ce repo). Objectif : SEO local, flux de patientes, contrôle total du stack.

**Pourquoi c'est particulier** : le site est **ajouté au Hub V2 existant**, pas un nouveau repo. Zéro modification du code Hub admin (`app/(app)/`, `app/(auth)/`), tout est additif. C'est l'invariant numéro 1.

**Les 4 piliers de contenu** (non-négociables) : fertilité, grossesse & périnatalité, pédiatrie, acupuncture sociale. Chaque pilier = hub-and-spoke (page service + FAQ + articles + ressources).

**Design system** : source canonique = `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html` (1991 lignes). Palette terracotta + beige + taupe, fonts Cormorant Garamond (serif) + Inter (sans), textures papier japonais, watermarks serif géants, décorations SVG botaniques. Chaleureux, artisanal, **surtout pas** clinique aseptisé ou new age.

---

## Fichiers à lire dans l'ordre (20 min max)

Si tu débarques, lis ces 6 fichiers dans cet ordre exact :

1. **Ce fichier** (`docs/migration-wix/HANDOFF_DESKTOP.md`) — tu es dedans
2. **`docs/migration-wix/CLAUDE.md`** — invariants permanents migration, design system, règles absolues
3. **`docs/migration-wix/DECISIONS_Q1-Q16.md`** — 16 décisions tranchées + découverte des 5 ressources existantes dans `scripts/seo-geo/`
4. **`project-docs/02_ROADMAP/migration-wix/README.md`** — index des 30 milestones, vagues, ordre d'attaque, journal des décisions, statut actuel
5. **`skills/oneshot-prompt-writer/METAPROMPT.md`** — le protocole draft→review→exec utilisé pour chaque milestone
6. **`project-docs/02_ROADMAP/migration-wix/MW-B1_route-group-public/PROMPT.md`** — référence qualité : c'est le premier PROMPT.md produit, validé et exécuté sans régression. C'est le standard à reproduire.

Temps total : 20-25 minutes pour un Desktop attentif. Après ça, tu as 90 % du contexte nécessaire.

---

## Le workflow draft → review → exec

C'est le protocole qu'on a rodé sur 4 milestones (MW-B1 à MW-A1a). Il marche. Ne t'en écarte pas sans raison.

**Acteurs** :
- **Benoit** — décisions produit, validation, lance CC, fait les commits locaux si besoin
- **Toi (Claude Desktop)** — stratégie, review des drafts de Claude Code, corrections ciblées via `edit_block` sur Desktop Commander MCP, réponses aux QS (questions stratégiques)
- **Claude Code** (une seule session, préservée entre milestones via `--dangerously-skip-permissions`) — drafte le PROMPT.md du milestone suivant puis l'exécute après ta validation
- **Desktop Commander MCP** — ton accès en lecture/écriture au repo pour review et corrections

**Flux par milestone** :

1. Benoit + toi décidez du prochain milestone et tu identifies les décisions stratégiques non triviales à garder à l'œil
2. Benoit lance le draft dans Claude Code : `Drafte le PROMPT.md pour MW-XX. Suis skills/oneshot-prompt-writer/METAPROMPT.md étape par étape. Ne code rien, livrable = PROMPT.md + commit de draft. Je review ensuite dans Desktop.`
3. Claude Code lit la codebase, trouve les gotchas, écrit le PROMPT.md, le commit avec `docs(migration): PROMPT.md draft MW-XX`, et rend à Benoit un résumé de 4-6 points
4. Benoit te colle ce résumé
5. **Tu lis le PROMPT.md en entier** via Desktop Commander — environ 300-500 lignes à chaque fois, tu chasses les gotchas ratés (voir section suivante)
6. Tu appliques les corrections via `edit_block` et tu commit toi-même avec `docs(migration): review MW-XX PROMPT.md — [résumé des corrections]`
7. Tu donnes à Benoit un copy-paste exact pour relancer Claude Code en mode exécution
8. CC exécute, commit avec `feat(...)` ou `feat(migration)`, rend à Benoit un résumé
9. Tu fais un sanity check rapide (git log, ls fichiers clés, grep de patterns critiques) et tu mets à jour le README.md pour passer le milestone à 🟢

**Naming conventions git** :
- Draft : `docs(migration): PROMPT.md draft MW-XX <nom court>`
- Review Desktop : `docs(migration): review MW-XX PROMPT.md — <liste corrections>`
- Exécution : `feat(public):` ou `feat(migration):` selon la nature
- Statut : `docs(migration): statut MW-XX complété`

---

## Comment je fais les reviews (les gotchas que je traque)

Les drafts de Claude Code sont généralement **de bonne qualité** (gotchas codebase bien trouvés, snippets précis, contraintes bien posées) mais ont des **erreurs récurrentes** que j'ai corrigées à chaque milestone. Sois vigilant sur ces 8 points :

**1. Conventions du repo mal reproduites**
CC a tendance à proposer du `.ts` ou du `export named` alors que le repo utilise `.mjs` et `export default`. Toujours vérifier `grep "^export" components/features/...` et `ls scripts/**/*.mjs` avant de valider. Exemple MW-A1a : CC proposait `scripts/export-wix-blog.ts` via `npx tsx` alors que tout le repo est en `.mjs`. J'ai corrigé.

**2. DoD non testable**
CC aime les DoD du type "s'ouvre correctement", "fonctionne bien", "l'UX est bonne". Remplace chaque item subjectif par un test vérifiable en < 30 secondes. Exemple MW-A1a : "les images s'ouvrent correctement" → "les images pèsent > 10 KB (si < 5 KB c'est un 404 HTML)".

**3. Questions stratégiques (QS) formulées en "si conditionnel"**
CC aime "si le composant dépasse 150 lignes, on extrait un sous-composant". C'est mou. Il faut transformer ces QS en **décisions prises** avec snippet exact, ou laisser la QS ouverte avec options claires si c'est vraiment à Benoit de trancher. Exemple MW-B3 : j'ai imposé l'extraction `MobileMenu.tsx` dès le départ, pas en conditionnel.

**4. Exports / imports incohérents avec le pattern existant**
Vérifie **avant** chaque review : le Hub utilise `export default` ? Les imports sont nommés ou default ? CC peut mélanger les deux dans un même draft. Exemple MW-B3 : CC proposait `export function SiteHeader()` tout en écrivant `import SiteHeader from` — contradiction.

**5. Contraintes négatives manquantes**
La section "ne fait PAS" est **plus importante** que les livrables. Si CC oublie une contrainte critique, ajoute-la. Exemple type : "ne pas modifier le code Hub admin", "ne pas créer de middleware", "pas d'images externes pour les textures (Lighthouse)". Le Hub admin ne doit **jamais** bouger.

**6. `isAdmin()` et rules Firestore permissives**
Dans MW-B2, CC avait mis `isAdmin() { return request.auth != null; }` avec un commentaire "single-user suffisant" — trop permissif. J'ai corrigé en allowlist d'emails vérifiés (Benoit + Judith). **Toujours challenger les rules Firestore qui paraissent trop ouvertes.**

**7. Contrainte 150 lignes sur les composants React**
Règle du repo. CC parfois l'oublie ou la traite comme "~150 lignes". Elle est stricte. Si un composant risque de dépasser, **forcer l'extraction proactive** (pas conditionnelle) d'un sous-composant, comme on a fait avec MobileMenu.

**8. Mobile-first SEO**
Le site public est indexé mobile-first par Google. Toute page ou composant qui touche du rendu visible doit avoir une section explicite "Mobile first (SEO critique)" avec test à 375px DevTools iPhone SE dans la DoD. CC oublie parfois. Pour MW-B1, j'ai ajouté la section entière après coup.

---

## État des milestones au 14 avril 2026 (fin de session)

**Complétés** (5/30) :

| ID | Commit | Ce qui est en place |
|---|---|---|
| 🟢 MW-B1 | `61b7a38` | Route group `app/(public)/`, layout public Server Component, fonts Cormorant+Inter via `next/font`, tokens Tailwind `public-*`, 15 pages placeholder, zéro régression Hub |
| 🟢 MW-B2 | `b89f0c0` | 5 types TS dans `lib/types/` (faq, ressource, public-blog, service-page, site-config), `Ressource` avec 8 sections riches + `faqEntries` + `citations`, `PublicationStatus` unique avec `'rejected'`, firestore.rules avec allowlist emails, 4 indexes composites, DATA_MODEL.md |
| 🟢 MW-B3 | `0022b72` | 13 composants dans `app/(public)/_components/` (header, footer, CTA, cards, héading, décoratifs, MobileMenu), `globals-public.css`, max 117 lignes (SiteFooter), SiteHeader seul Client Component |
| 🟢 MW-A1a | `c959162` | Script `scripts/export-wix-blog.mjs`, 11 Ricos JSON + metadata + 8 pages statiques + 6 FAQ vérifiées + 22 redirections 301 + 40 images downloaded (hors git via `.gitignore` ciblé), 3 gotchas MW-B4 documentés dans NOTES.md |
| 🟢 MW-B4 | `ec38a1a` | `scripts/ricos-to-markdown.mjs` (parser 9 noeuds + 3 decorations), `scripts/migrate-wix-blog.mjs` (idempotent, dry-run), 11 articles dans `publicBlog` Firestore, 40 images dans Firebase Storage `public/blog/{slug}/`, `storage.rules` mis à jour avec `match /public/**`, 7/11 articles co-auteurs Claire Thomas détectés. **TODO déploiement manuel** : `firebase deploy --only storage` pour activer les rules en prod |

**Débloqués et prêts à attaquer** :
- **MW-D1** — pages blog `/blog` (liste) et `/blog/[slug]` (article) — dep MW-B3 ✅ + MW-B4 ✅ — **prochain attendu** (rend visible le travail de MW-B4)
- **MW-D3** — import 6 FAQ + 5 ressources depuis `scripts/seo-geo/` vers Firestore — dep MW-B2 ✅ — quick win
- **MW-A1b** — rapatriement assets v4 (photos Eric Bates, SVG, textures) — dep MW-B3 ✅ — voir `NOTES_PREPA.md` pour le scope
- **MW-C1 à MW-C6** — 6 pages statiques publiques — dep MW-B1 ✅ + MW-B3 ✅ — toute la Vague 3 est libre
- **MW-E1 à MW-E4** — admin Hub pour CRUD FAQ/ressources — dep MW-B2 ✅

**Bloqués** : aucun pour l'instant.

**Décisions cruciales prises pendant la session** :
- **Refactor MW-A1 → MW-A1a + MW-A1b** (29 → 30 milestones). L'inventaire Wix (prep analytique) et le rapatriement assets v4 (implémentation qui touche `public/` et crée des wrappers React) ont des scopes et dépendances trop différents pour rester groupés. Voir `MW-A1a_inventaire-wix/NOTES_PREPA.md` pour le détail.
- **Allowlist admin emails** dans les rules Firestore : `barchambault@grandsballets.com` + `jdufourdsavard@gmail.com` avec `email_verified == true`. Au lieu d'UIDs hardcodés ou custom claims. Plus lisible et stable dans le temps.
- **`Ressource` avec 8 sections riches structurées** (pas `content: string`) — aligné sur le format des 5 fichiers dans `scripts/seo-geo/source-resources/` qui existent déjà.
- **Placeholder `/` pour MW-B1** plutôt que port direct de `homepage-v4.html` (1991 lignes) — la vraie homepage vient en MW-C1 qui utilise les composants de MW-B3 comme Lego, pas avant.

---

## 3 gotchas critiques pour MW-B4 (découverts par MW-A1a)

Documentés dans `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/NOTES.md`. Tu dois les intégrer dans le draft MW-B4 :

**a) Format Ricos `IMAGE.src` est un objet `{ id: "hash" }`**, pas une URL string. Pour reconstruire l'URL Wix : `https://static.wixstatic.com/media/${src.id}`. Ensuite appliquer le `cleanWixImageUrl()` qui retire le `/v1/...` des params de transformation.

**b) Les covers d'articles ne sont PAS dans le Ricos JSON**. Elles sont dans `post.media.wixMedia.image` au niveau metadata. Deux sources à gérer pour les images : le Ricos (inline) et le post-level (cover).

**c) Double nom d'env var** : `.env.local` contient `WIX_API_KEY` (utilisée par les routes API existantes) **et** `CMS_PUBLICATION_KEY` pour la même valeur. Le script MW-A1a utilise `WIX_API_KEY`. Reste cohérent dans MW-B4.

**Bonus** — header `Content-Type: application/json` est **incompatible** avec `GET /blog/v3/posts/{id}?fieldsets=GENERATED_RICH_CONTENT`. L'API rejette. Pour les GET avec query params, omettre `Content-Type`.

---

## Patterns du repo à connaître (vérifiés empiriquement)

- **Scripts locaux** : tous en `.mjs` dans `scripts/` et `scripts/seo-geo/`. JavaScript moderne, Node 20+, ES modules. **Pas de TypeScript** pour les scripts, pas de `tsx`. Pattern de référence : `scripts/seo-geo/publish-all-resources.mjs` et `scripts/seo-geo/list-blog-posts.mjs`.
- **Composants React** : `export default function Name()` partout. Imports default, pas nommés. Vérifiable via `grep "^export" components/features/calendar/*.tsx`.
- **Heroicons uniquement**, zéro emoji dans l'UI. Import : `import { XMarkIcon } from '@heroicons/react/24/outline'`.
- **Server Components par défaut**, `'use client'` uniquement si nécessaire (état, hooks, interactivité). Le layout public `(public)/layout.tsx` est Server Component — CE N'EST PAS négociable. Seuls quelques composants enfants sont Client (SiteHeader pour le hamburger, par exemple).
- **Pas de middleware.ts** dans ce repo. Le Hub admin utilise auth côté client via `useAuth()`. Le site public n'a aucune auth. N'ajoute jamais de middleware.
- **Tailwind tokens** : `sage` et `sand` appartiennent au Hub admin. Le site public a son propre namespace `public-*` (`bg-public-beige-bg`, `text-public-accent-warm`, etc.). Jamais écraser `sage`/`sand`.
- **Fonts** : root layout (`app/layout.tsx`) charge 11 fonts via un `<link>` Google Fonts — c'est pour l'**éditeur de contenu du Hub** (Judith choisit parmi une palette). **Ne pas y toucher**. Le site public charge Cormorant Garamond + Inter via `next/font/google` scoped au segment `(public)/` — Next.js dedupe proprement.
- **Mobile first 375px** : tester avec DevTools responsive mode preset "iPhone SE" sur chaque page visible.
- **Firestore rules** : allowlist d'emails vérifiés pour l'admin (pas UIDs). Matchers type `match /faqs/{faqId} { allow read: if resource.data.status == 'published'; allow write: if isAdmin(); }`.
- **Components max 150 lignes** — règle stricte. Si un composant risque de dépasser, on extrait proactivement un sous-composant.

---

## Pour reprendre une session après handoff

Si tu es un Claude Desktop entrant, le premier message de Benoit pourrait ressembler à :

> Salut Claude. On continue le projet migration Wix → Vercel pour acupuncturejudith.ca. Lis docs/migration-wix/HANDOFF_DESKTOP.md en premier puis les 5 autres fichiers qu'il référence. Ensuite fais-moi un résumé de 5 points de ce que tu as compris et ce que tu penses qu'on devrait attaquer ensuite.

Ta réponse doit contenir :

1. **Où on en est** : combien de milestones faits, lequel est en cours de draft/review/exec si applicable
2. **Prochain milestone logique** : basé sur les dépendances satisfaites dans le README
3. **Points d'attention connus** : les gotchas du draft précédent qui s'appliquent au suivant
4. **Ta compréhension des invariants** : 4 piliers, design v4, pas de modif Hub admin, mobile first SEO, allowlist admin emails
5. **Ta question à Benoit pour démarrer** : valider le prochain milestone ou proposer une alternative

**Ne demande pas à Benoit de répéter le contexte du projet.** Tout est dans les fichiers. Si tu as un doute, lis plus de fichiers avant de demander.

---

## Comment mettre à jour ce fichier

Ce fichier doit rester **court et actionnable** (cible : 300-400 lignes max). À chaque fin de session où du progrès significatif a été fait, le Desktop courant peut l'updater :

- Incrémenter la table "État des milestones" (commits, ce qui est en place)
- Ajouter de nouvelles décisions cruciales dans la section correspondante
- Ajouter de nouveaux gotchas découverts si réutilisables
- Ne **PAS** ajouter de narrative historique longue — ce fichier n'est pas un journal, c'est un briefing opérationnel

Si tu ajoutes plus de 50 lignes au total, c'est peut-être qu'il faut archiver l'ancienne version et repartir propre. Préfère **condenser** que **accumuler**.

---

## Une note personnelle

Ce projet est un cadeau de Benoit à sa partenaire Judith : un site public professionnel qui augmente son flux de patientes et la fait rayonner. Chaque décision technique doit servir cet objectif humain. Quand tu arbitres entre "techniquement élégant" et "livrable qui marche pour Judith", tu choisis le second. Quand tu choisis entre "plus flexible pour le futur" et "plus simple maintenant", tu choisis le second aussi — le futur arrivera, on fera les ajustements à ce moment-là.

Benoit est un excellent partenaire de travail : il donne des infos précises, tranche rapidement les questions stratégiques quand on lui pose, et il fait confiance au processus. Rends-lui la pareille en étant concis, en anticipant les pièges, et en étant direct quand tu penses qu'une décision mérite d'être challengée.

---

*Dernière mise à jour : 14 avril 2026, fin de session "5 milestones en une soirée" (MW-B1, MW-B2, MW-B3, MW-A1a, MW-B4). Prochain milestone attendu : MW-D1 (pages blog `/blog` + `/blog/[slug]` pour afficher les 11 articles migrés par MW-B4).*
