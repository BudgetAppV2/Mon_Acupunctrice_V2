# MW-B2 — Schémas TypeScript + Firestore rules + indexes pour les 5 collections publiques

**One-shot prompt pour Claude Code.** Lis tout avant de commencer. Tu dois pouvoir exécuter sans poser de question.

---

## Contexte

On pose les fondations data de la migration Wix → Vercel : 5 nouvelles collections Firestore (`faqs`, `ressources`, `publicBlog`, `servicePages`, `siteConfig`) avec un workflow de publication `draft → pending → published → rejected` (amendement A2, décision Q11). MW-B1 a créé le route group public et les tokens Tailwind. Ce milestone est 100 % backend/types — zéro UI, zéro rendu.

Après ce milestone : les interfaces TypeScript compilent, les Firestore rules sont déployables, les indexes sont prêts, et `DATA_MODEL.md` documente les 5 nouvelles collections.

---

## Stack

Next.js 15 App Router, TypeScript strict, Firebase Firestore (client SDK `firebase/firestore` + Admin SDK `firebase-admin/firestore`).

---

## Fichiers à lire AVANT de commencer

Dans cet ordre exact. Ne commence à coder qu'après avoir lu les 8.

1. **`lib/types/index.ts`** → types existants du Hub. **Gotchas critiques** :
   - Ligne 1 : `import type { Timestamp } from 'firebase/firestore'` — c'est le pattern d'import Timestamp à reproduire dans les nouveaux fichiers
   - Toutes les interfaces sont `export interface`, pas juste `interface` — respecter cette convention
   - `ContentCategory` utilise `'fertilite' | 'grossesse' | 'bien_etre' | 'mtc' | 'autre'` — les catégories FAQ publiques sont **différentes** (`'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale' | 'seance'`). Ne pas confondre ni fusionner les deux enums.

2. **`firestore.rules`** → rules existantes. **Gotcha critique** :
   - Le fichier **ne définit PAS** de fonction `isAdmin()`. Les rules existantes utilisent `request.auth.uid == resource.data.userId` car chaque document Hub appartient à un user.
   - Les collections publiques n'ont pas de `userId` — elles sont gérées par les admins (Judith + Benoit) uniquement.
   - **Tu dois définir `isAdmin()`** comme fonction helper en haut du bloc `match /databases/{database}/documents`, avec le snippet exact fourni en Livrable 2 : allowlist d'emails vérifiés (`barchambault@grandsballets.com` + `jdufourdsavard@gmail.com`). **Ne pas improviser** — copie-colle le snippet L2 tel quel.

3. **`firestore.indexes.json`** → format des indexes existants. **Gotcha** :
   - Format JSON avec `collectionGroup`, `queryScope: "COLLECTION"`, et `fields` array
   - Tous les indexes existants sont sur `contentItems` et `calendarSlots`
   - Les nouveaux indexes (sur `faqs`, `ressources`, `publicBlog`) s'ajoutent dans le même array `indexes`
   - **Attention au formatting** : vérifier la virgule avant le dernier `]` de `indexes`

4. **`project-docs/03_TECH/DATA_MODEL.md`** → documentation des collections existantes. Tu dois y **ajouter** les 5 nouvelles collections en suivant le même format (header + interface TypeScript + notes).

5. **`docs/migration-wix/DECISIONS_Q1-Q16.md`** → **2 décisions impactent directement ce milestone** :
   - **Q11** : le status `'rejected'` est ajouté (pas juste draft/pending/published). Champs additionnels : `rejectionReason?: string`, `rejectedAt?: Timestamp`, `rejectedBy?: string`
   - **Section "Découverte majeure"** : les 5 ressources existantes dans `source-resources/` ont des champs structurés riches (`shortAnswer`, `introSection`, `scienceSection`, `mechanismSection`, `judithApproach`, `whatToExpect`, `protocolSection`, `testimonial`, `faqJson`, `relatedGuides`). Le type `Ressource` doit refléter cette structure, pas un simple `content: string`.

6. **`scripts/seo-geo/publish-all-resources.mjs`** (lignes 43-68) → les constantes `RICH_TEXT_FIELDS`, `PLAIN_TEXT_FIELDS`, `DATE_FIELDS` qui définissent la structure réelle des ressources. C'est la source de vérité pour les champs du type `Ressource`.

7. **`scripts/seo-geo/source-resources/01-acupuncture-fertilite-montreal.md`** (premières 50 lignes) → exemple concret de la structure `### CHAMP: xxx` pour comprendre les champs.

8. **`lib/firebase-admin.ts`** → pattern Admin SDK existant. Les imports de scripts (MW-D1, MW-D3) utiliseront `getAdminFirestore()` pour écrire dans les nouvelles collections. Pas de modification à faire ici — juste comprendre le pattern.

---

## Livrable 1 — 5 fichiers de types TypeScript

**Objectif** : créer un fichier par collection dans `lib/types/`, avec `export interface` et `export type` exportés.

**Fichiers à créer** :

### `lib/types/faq.ts`

```typescript
import type { Timestamp } from 'firebase/firestore';

export type FaqCategory =
  | 'fertilite'
  | 'grossesse'
  | 'pediatrie'
  | 'acupuncture-sociale'
  | 'seance';

export type PublicationStatus = 'draft' | 'pending' | 'published' | 'rejected';

export type CtaVariant = 'reserver' | 'contact' | 'tarifs';

export interface FAQ {
  id: string;
  question: string;
  reponse: string; // markdown
  category: FaqCategory;
  order: number;
  status: PublicationStatus;
  ctaVariant: CtaVariant;
  relatedServices: string[]; // slugs : 'fertilite', 'grossesse', etc.
  relatedArticles: string[]; // slugs d'articles publicBlog
  relatedFaqs: string[]; // IDs d'autres documents faqs
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  // Champs rejet (Q11)
  rejectionReason?: string;
  rejectedAt?: Timestamp;
  rejectedBy?: string;
}
```

### `lib/types/ressource.ts`

```typescript
import type { Timestamp } from 'firebase/firestore';
import type { PublicationStatus } from './faq';

export type RessourcePilier =
  | 'fertilite'
  | 'grossesse'
  | 'pediatrie'
  | 'acupuncture-sociale'
  | 'transversal';

export type RessourceType = 'guide' | 'checklist' | 'article-fond' | 'infographie';

export interface Citation {
  authors: string;
  title: string;
  journal: string;
  year: number;
  url?: string; // lien PubMed ou DOI
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface Ressource {
  id: string;
  title: string;
  slug: string;
  type: RessourceType;
  pilier: RessourcePilier;
  status: PublicationStatus;

  // Champs meta SEO
  metaTitle: string;
  metaDescription: string;
  heroImageUrl?: string; // URL Firebase Storage, optionnel au lancement
  heroImageAlt: string;  // obligatoire pour SEO/accessibilité

  // Sections riches (markdown) — structure alignée sur source-resources/*.md
  shortAnswer: string;
  introSection: string;
  scienceSection: string;
  mechanismSection: string;
  judithApproach: string;
  whatToExpect: string;
  protocolSection: string;
  testimonial: string;

  // FAQ embarquée pour schema.org FAQPage par ressource
  faqEntries: FaqEntry[];

  // Citations scientifiques (amendement A1)
  citations: Citation[];

  // Relations (maillage MW-D6)
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  relatedResources: string[]; // slugs d'autres ressources

  // Meta
  authorName: string;
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;

  // Champs rejet (Q11)
  rejectionReason?: string;
  rejectedAt?: Timestamp;
  rejectedBy?: string;
}
```

### `lib/types/public-blog.ts`

```typescript
import type { Timestamp } from 'firebase/firestore';
import type { PublicationStatus } from './faq';

export interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // markdown (converti depuis Ricos en MW-B4)
  excerpt: string;
  coverImage: string;
  author: string; // "Judith Dufour-Savard" ou "Judith Dufour-Savard et Claire Thomas"
  category: string;
  tags: string[];
  status: PublicationStatus;
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  wixPostId?: string; // référence double publication (amendement A3)
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  // Champs rejet (Q11)
  rejectionReason?: string;
  rejectedAt?: Timestamp;
  rejectedBy?: string;
}
```

### `lib/types/service-page.ts`

```typescript
import type { Timestamp } from 'firebase/firestore';
import type { PublicationStatus } from './faq';

export type ServiceSlug = 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale';

export interface ServicePage {
  id: string;
  slug: ServiceSlug;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  content: string; // markdown — contenu court du hub (extrait de la ressource correspondante)
  status: PublicationStatus;
  updatedAt: Timestamp;
}
```

### `lib/types/site-config.ts`

```typescript
import type { Timestamp } from 'firebase/firestore';

export interface SiteConfig {
  id: string; // 'general', 'nap', 'social', 'testimonials', 'contentRefresh'
  data: Record<string, unknown>;
  updatedAt: Timestamp;
}
```

**Points clés** :
- `PublicationStatus` est défini UNE SEULE FOIS dans `faq.ts` et réexporté/importé par les autres fichiers — pas de duplication
- Le status inclut `'rejected'` (décision Q11)
- Le type `Ressource` a des champs structurés riches (pas `content: string`) pour matcher `source-resources/*.md`
- `faqEntries: FaqEntry[]` dans `Ressource` (pas `faqJson: string`) — le parsing JSON se fait dans le script d'import MW-D3, Firestore stocke l'array typé
- `SiteConfig.data` est `Record<string, unknown>` car chaque document config a une structure différente — pas de typage fort ici, ça viendrait plus tard si besoin
- `ServicePage` ne porte PAS les champs riches (pas de `scienceSection`, etc.) — le contenu court du hub est dans `content: string` (markdown). Les sections riches restent dans la collection `ressources`.

---

## Livrable 2 — Mise à jour de `firestore.rules`

**Objectif** : ajouter les rules pour les 5 nouvelles collections. Lecture publique conditionnelle au `status == 'published'` sauf `siteConfig` (public sans condition). Écriture admin seulement.

**Fichier à modifier** : `firestore.rules`

**Contenu à ajouter** — insérer AVANT le `}` final (fermeture de `match /databases/{database}/documents`) :

```
    // --- Site public (migration Wix → Vercel) ---

    // Helper admin pour les collections publiques.
    //
    // Mécanisme : allowlist d'emails vérifiés. Les deux admins sont
    // Benoit (Directeur Technique qui opère le Hub) et Judith
    // (acupunctrice, autrice du contenu). Pour ajouter un admin,
    // ajouter son email dans la liste ci-dessous et redéployer les
    // rules avec `firebase deploy --only firestore:rules`.
    //
    // Prérequis : l'admin doit s'être connecté au moins une fois via
    // Google Sign-In avec un compte dont l'email est vérifié (automatique
    // pour les comptes Google).
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email in [
          'barchambault@grandsballets.com',
          'jdufourdsavard@gmail.com'
        ];
    }

    match /faqs/{faqId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
    match /ressources/{resId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
    match /publicBlog/{postId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
    match /servicePages/{pageId} {
      allow read: if resource.data.status == 'published';
      allow write: if isAdmin();
    }
    match /siteConfig/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }
```

**Points clés** :
- `isAdmin()` utilise une **allowlist d'emails vérifiés** — seuls `barchambault@grandsballets.com` et `jdufourdsavard@gmail.com` peuvent écrire dans les collections publiques. Pour ajouter un admin, modifier la liste dans `firestore.rules` et redéployer.
- L'email doit être `email_verified == true` — c'est automatiquement vrai pour les comptes Google Sign-In, mais la vérification protège contre un éventuel provider non vérifié
- Les 4 collections avec `status` bloquent la lecture si `status != 'published'` — les brouillons et contenus rejetés ne sont pas exposés au site public
- `siteConfig` est public en lecture sans condition — elle contient des données non sensibles (NAP, liens sociaux)
- Le commentaire `--- Site public ---` sépare visuellement les rules Hub des rules public pour maintenabilité
- Les rules existantes (`contentItems`, `users`, `calendarSlots`, `blogSequences`) ne sont **pas modifiées**
- L'admin SDK (`firebase-admin`) bypass les rules — les scripts d'import (MW-D1, MW-D3) ne sont pas affectés

---

## Livrable 3 — Ajout d'indexes dans `firestore.indexes.json`

**Objectif** : ajouter les indexes composites nécessaires pour les queries du site public.

**Fichier à modifier** : `firestore.indexes.json`

**Indexes à ajouter** dans l'array `indexes` (avant le `]` final) :

```json
    ,{
      "collectionGroup": "faqs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "ressources",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "pilier", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "publicBlog",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "publicBlog",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    }
```

**Points clés** :
- Pas d'index pour `servicePages` (seulement 4 documents, query simple par `slug`)
- Pas d'index pour `siteConfig` (lookup par document ID)
- Tous les indexes incluent `status` en premier champ — les queries publiques filtrent toujours `status == 'published'` d'abord
- Le `faqs` index utilise `order ASC` (pas `publishedAt DESC`) car les FAQ sont triées par ordre d'affichage, pas par date

---

## Livrable 4 — Mise à jour de `project-docs/03_TECH/DATA_MODEL.md`

**Objectif** : documenter les 5 nouvelles collections en suivant le format existant du document.

**Fichier à modifier** : `project-docs/03_TECH/DATA_MODEL.md`

**Contenu à ajouter** à la fin du document (avant la section "Règles de validation" si elle existe, sinon à la fin) :

Ajouter une section par collection avec :
1. Header `## Collection : <nom>`
2. Le bloc TypeScript de l'interface (copié depuis les fichiers L1)
3. Notes d'usage (quelles pages/milestones utilisent cette collection)

Ajouter aussi à la section "Index Firestore requis" les nouveaux indexes.

Ajouter à la section "Firestore Security Rules" les nouvelles rules (ou une référence au fichier `firestore.rules`).

**Format** — suivre exactement le pattern de la section `Collection : contentItems` existante : header, interface en bloc de code, notes sous l'interface. Pas de prose excessive.

---

## Contraintes (ce qu'on ne fait PAS)

- **Ne pas modifier** `lib/types/index.ts` — les nouveaux types vivent dans leurs propres fichiers
- **Ne pas modifier** les rules existantes pour `contentItems`, `users`, `calendarSlots`, `blogSequences`
- **Ne pas modifier** les indexes existants dans `firestore.indexes.json`
- **Ne pas modifier** `app/layout.tsx`, `app/(app)/`, `app/(auth)/`, ni aucun fichier UI
- **Ne pas modifier** `tailwind.config.ts`, `next.config.ts`, `package.json`
- **Ne pas créer** de fichier dans `app/` — ce milestone est purement types/config/docs
- **Ne pas installer** de nouvelle dépendance npm
- **Ne pas** créer de code d'accès Firestore (hooks, helpers, queries) — c'est le travail des milestones E1/E2/D
- **Ne pas** créer de sous-collections — tout est flat (`faqs/{id}`, `ressources/{id}`, etc.)
- **Ne pas** stocker les citations comme sous-collection — c'est un array dans le document `Ressource`
- **Ne pas** dupliquer `PublicationStatus` dans chaque fichier — l'importer depuis `./faq`
- **Ne JAMAIS stocker de données sensibles dans `siteConfig`** (pas de tokens, pas d'UIDs, pas d'emails privés, pas de clés API) — la collection est en lecture publique sans authentification. Uniquement des données non sensibles : NAP, liens sociaux, textes de footer, last run timestamps des crons. Ajouter un commentaire JSDoc au-dessus de l'interface `SiteConfig` pour rappeler cette règle.
- **Pas de `console.log`** dans le code livré
- **Pas d'emojis** dans l'UI (règle générale du repo)

---

## Definition of Done

Chaque item doit être vérifiable en < 30 secondes.

- [ ] `npm run build` passe sans erreur ni warning nouveau
- [ ] 5 fichiers créés dans `lib/types/` : `faq.ts`, `ressource.ts`, `public-blog.ts`, `service-page.ts`, `site-config.ts`
- [ ] `npm run build` compile tous les nouveaux types sans erreur (le build TypeScript valide toute la chaîne, pas besoin de `tsc --noEmit` par fichier)
- [ ] `PublicationStatus` est exporté de `faq.ts` et importé (pas dupliqué) dans `ressource.ts`, `public-blog.ts`, `service-page.ts`
- [ ] `Ressource` contient les 8 champs rich text (`shortAnswer`, `introSection`, `scienceSection`, `mechanismSection`, `judithApproach`, `whatToExpect`, `protocolSection`, `testimonial`) — pas un simple `content: string`
- [ ] `Ressource` contient `faqEntries: FaqEntry[]` (array typé, pas string JSON)
- [ ] Tous les types avec `status` incluent `'rejected'` et les 3 champs optionnels Q11 (`rejectionReason?`, `rejectedAt?`, `rejectedBy?`)
- [ ] `firestore.rules` modifié — contient `function isAdmin()` et les 5 blocs `match` pour les nouvelles collections
- [ ] `firestore.rules` : les rules existantes (contentItems, users, etc.) sont **inchangées** — vérifiable avec `git diff firestore.rules` qui ne montre que des ajouts
- [ ] `firestore.indexes.json` modifié — 4 nouveaux indexes ajoutés (faqs, ressources, publicBlog ×2)
- [ ] `firestore.indexes.json` : JSON valide (pas de trailing comma, brackets fermés) — vérifiable avec `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8'))"`
- [ ] `DATA_MODEL.md` mis à jour avec les 5 nouvelles collections documentées
- [ ] `git diff` ne montre **aucune modification** dans `lib/types/index.ts`, `app/`, `tailwind.config.ts`
- [ ] `NOTES.md` créé dans `project-docs/02_ROADMAP/migration-wix/MW-B2_firestore-schemas-rules/` avec : date, résumé 3-5 lignes, points bloquants, note sur `isAdmin()` (UID vs `auth != null`)

---

## Notes d'exécution (conseils)

- **Ordre recommandé** : L1 (types) → L2 (rules) → L3 (indexes) → L4 (DATA_MODEL.md) → build → validation JSON indexes → NOTES.md
- **Après L1**, fais un `npm run build` rapide pour confirmer que les types compilent avant de toucher aux rules — les erreurs d'import circulaire ou de mauvais chemin sont plus faciles à debug à ce stade
- **Pour L2**, copie-colle le bloc rules exact du snippet ci-dessus — ne réécris pas à la main, le risque de faute de syntaxe est élevé
- **Pour L3**, vérifie la validité JSON après modification : `node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json','utf8')); console.log('JSON OK')"` — un JSON cassé = un deploy Firebase qui échoue silencieusement
- **Pour `isAdmin()`** : cherche d'abord si un UID Judith est hardcodé quelque part dans le code (grep `uid`, `userId`, `ADMIN_UID`). Si tu trouves, utilise-le. Sinon, `request.auth != null` est le fallback safe pour une app single-user.
- **Les types `Ressource`** sont les plus complexes — prends le temps de vérifier que chaque champ de `RICH_TEXT_FIELDS` et `PLAIN_TEXT_FIELDS` de `publish-all-resources.mjs` a un équivalent dans l'interface

---

## Commit final attendu

Un seul commit à la fin, sur la branche `feature/site-public-migration` :

```
feat(public): MW-B2 schémas TypeScript + Firestore rules + indexes (5 collections)
```

Message de commit détaillé (optionnel mais apprécié) :

```
- 5 interfaces TypeScript : FAQ, Ressource, PublicBlogPost, ServicePage, SiteConfig
- Ressource avec 8 sections riches alignées sur source-resources/*.md
- Workflow status draft/pending/published/rejected (Q11)
- Firestore rules : lecture publique conditionnelle status=='published', écriture admin
- 4 indexes composites (faqs, ressources, publicBlog ×2)
- DATA_MODEL.md mis à jour avec les nouvelles collections
- Zéro modification du Hub admin existant
- Ref: MW-B2, docs/migration-wix/CLAUDE.md
```

**Pas de merge dans `main`** — Benoit review sur la branche avant de décider.

---

## Questions stratégiques — review Desktop (toutes résolues ✅)

### QS1 — Type `Ressource` : champs structurés vs `content: string` (✅ RÉSOLUE lors du review Desktop)

**Décision finale** : **champs structurés conservés** (8 sections riches + `faqEntries: FaqEntry[]` + `citations: Citation[]`). C'est ce que le draft propose et ce qui est aligné sur `DECISIONS_Q1-Q16.md` + le MW-D3 mis à jour. Le MILESTONE.md original qui disait `content: string` est dépassé sur ce point — ne pas le suivre.

---

### QS2 — Mécanisme d'admin auth pour les rules (✅ RÉSOLUE lors du review Desktop)

**Décision finale** : allowlist d'emails vérifiés (Option B) encodée directement dans les rules. Les deux admins sont `barchambault@grandsballets.com` (Benoit) et `jdufourdsavard@gmail.com` (Judith). Le snippet Livrable 2 a été mis à jour pour refléter ce choix — Claude Code doit le copier-coller tel quel.

**Pourquoi Option B plutôt qu'UIDs hardcodés ou custom claims** :
- Emails plus lisibles en code review qu'un UID opaque
- Email stable dans le temps (l'UID Firebase l'est aussi mais demande un lookup Firebase Console)
- Custom claims auraient demandé un script one-off de setup (`admin.auth().setCustomUserClaims()`) et un relogin — trop de friction pour le gain
- Google Sign-In garantit `email_verified == true` automatiquement pour les comptes Google

**Prérequis côté Firebase Console** (à vérifier par Benoit avant MW-E1, pas maintenant) :
- Judith doit s'être connectée au moins une fois via Google Sign-In avec `jdufourdsavard@gmail.com` pour que son compte Auth existe dans le projet Firebase
- Benoit est déjà connecté avec son compte Grands Ballets (pattern existant du Hub)

**Pour ajouter un admin plus tard** : éditer la liste dans `firestore.rules`, commiter, et `firebase deploy --only firestore:rules`. Pas de migration Firestore nécessaire.

---

## Références

- Milestone : `project-docs/02_ROADMAP/migration-wix/MW-B2_firestore-schemas-rules/MILESTONE.md`
- Invariants migration : `docs/migration-wix/CLAUDE.md`
- Décisions validées : `docs/migration-wix/DECISIONS_Q1-Q16.md` (Q11, découverte ressources)
- Plan stratégique : `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md` §4.5, §5.2, §6.2
- Modèle qualité : `project-docs/02_ROADMAP/migration-wix/MW-B1_route-group-public/PROMPT.md`
- Script de référence : `scripts/seo-geo/publish-all-resources.mjs` (champs RICH_TEXT/PLAIN_TEXT/DATE)
- Skill prompt : `skills/oneshot-prompt-writer/SKILL.md`

---

*Prompt drafté le 14 avril 2026 par Claude Code (Opus). Exécution sur branche `feature/site-public-migration` après review Benoit/Desktop.*
