# Milestone MW-B2 : Schémas Firestore + rules + indexes

**Type** : Infra
**Vague** : 1
**Priorité** : Critical
**Temps estimé Claude Code** : 2-3h
**Dépendances** : Aucune
**Status** : 🔴 Not started

---

## Objectif

Définir les schémas TypeScript, les Firestore security rules et les indexes pour les 5 nouvelles collections publiques (`faqs`, `ressources`, `publicBlog`, `servicePages`, `siteConfig`), avec le workflow `status: draft/pending/published` (amendement A2).

---

## Contexte minimal

Le Hub V2 utilise déjà Firestore avec les collections `contentItems`, `users`, `calendarSlots`, `blogSequences`, `analytics`. Les nouvelles collections sont 100 % additives — aucun conflit. La lecture publique est conditionnelle au statut `published` (amendement A2), l'écriture est réservée à l'admin Judith via `isAdmin()`.

---

## Livrables

- [ ] **Interfaces TypeScript** dans `lib/types/` — un fichier par collection (`faq.ts`, `ressource.ts`, `public-blog.ts`, `service-page.ts`, `site-config.ts`)
- [ ] **Firestore security rules** mises à jour dans `firestore.rules` — lecture publique conditionnelle au `status == 'published'`, écriture admin
- [ ] **Firestore indexes** ajoutés dans `firestore.indexes.json` — indexes composites pour les requêtes de listing/filtrage
- [ ] **Documentation du data model** dans `project-docs/03_TECH/DATA_MODEL.md` — ajout des nouvelles collections

---

## Approche technique

**Interfaces TypeScript** :

```typescript
// lib/types/faq.ts
interface FAQ {
  id: string;
  question: string;
  reponse: string; // markdown
  category: 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale' | 'seance';
  order: number;
  status: 'draft' | 'pending' | 'published';
  relatedServices: string[]; // slugs des pages services
  relatedArticles: string[]; // slugs d'articles blog
  relatedFaqs: string[]; // IDs d'autres FAQ
  ctaVariant: 'reserver' | 'contact' | 'tarifs';
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

// lib/types/ressource.ts
interface Ressource {
  id: string;
  title: string;
  slug: string;
  type: 'guide' | 'checklist' | 'article-fond' | 'infographie';
  pilier: 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale' | 'transversal';
  content: string; // markdown
  excerpt: string;
  status: 'draft' | 'pending' | 'published';
  coverImage?: string;
  citations: Citation[]; // références scientifiques (amendement A1)
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

interface Citation {
  authors: string;
  title: string;
  journal: string;
  year: number;
  url?: string; // lien PubMed ou DOI
}

// lib/types/public-blog.ts
interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // markdown (converti depuis Ricos)
  excerpt: string;
  coverImage: string;
  author: string; // "Judith Dufour-Savard" ou "Judith Dufour-Savard et Claire Thomas"
  category: string;
  tags: string[];
  status: 'draft' | 'pending' | 'published';
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  wixPostId?: string; // référence pour la double publication (amendement A3)
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

// lib/types/service-page.ts
interface ServicePage {
  id: string;
  slug: 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale';
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  content: string; // markdown
  status: 'draft' | 'pending' | 'published';
  updatedAt: Timestamp;
}

// lib/types/site-config.ts
interface SiteConfig {
  id: string; // 'general', 'nap', 'social', 'testimonials'
  data: Record<string, unknown>;
  updatedAt: Timestamp;
}
```

**Firestore security rules** — ajout dans le fichier existant :

```
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

**Indexes composites** (à ajouter dans `firestore.indexes.json`) :
- `faqs` : `category ASC, order ASC` (filtré par status en code)
- `faqs` : `status ASC, category ASC, order ASC`
- `ressources` : `status ASC, pilier ASC, publishedAt DESC`
- `publicBlog` : `status ASC, publishedAt DESC`
- `publicBlog` : `status ASC, category ASC, publishedAt DESC`

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- lib/types/faq.ts
- lib/types/ressource.ts
- lib/types/public-blog.ts
- lib/types/service-page.ts
- lib/types/site-config.ts

✏️ MODIFY (fichiers existants) :
- firestore.rules (ajout rules nouvelles collections)
- firestore.indexes.json (ajout indexes composites)
- project-docs/03_TECH/DATA_MODEL.md (documentation)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Les 5 interfaces TypeScript compilent sans erreur avec `strict: true`
- [ ] `firestore.rules` déployable (pas d'erreur de syntaxe — vérifiable avec `firebase emulators:start` si disponible)
- [ ] Les indexes dans `firestore.indexes.json` sont syntaxiquement valides
- [ ] `DATA_MODEL.md` documente les 5 nouvelles collections avec leurs champs
- [ ] Les rules bloquent la lecture des documents `status !== 'published'` (sauf `siteConfig` qui est public sans condition)
- [ ] La fonction `isAdmin()` existante dans `firestore.rules` fonctionne pour les nouvelles collections
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Unit** : compilation TypeScript des interfaces (vérification que les types sont cohérents entre eux)
- **Integration** : si Firebase Emulator est disponible, tester que les rules bloquent la lecture d'un document `status: 'draft'` et autorisent `status: 'published'`
- **Validation** : vérifier la syntaxe des indexes avec `firebase deploy --only firestore:indexes --dry-run` (si CLI Firebase installée)

---

## Contraintes

- Ne pas modifier les collections existantes (`contentItems`, `users`, etc.) ni leurs rules
- Ne pas modifier le code du Hub admin
- Les types doivent importer `Timestamp` depuis `firebase/firestore` (côté client) — pas depuis `firebase-admin`
- Le champ `status` est obligatoire sur toutes les collections publiques sauf `siteConfig` (amendement A2)
- Les slugs des categories FAQ doivent correspondre exactement aux slugs des routes : `fertilite`, `grossesse`, `pediatrie`, `acupuncture-sociale`, `seance`
- `siteConfig` est public en lecture sans condition de statut — elle contient des données non sensibles (NAP, liens sociaux, textes globaux)

---

## Références

- Plan stratégique §4.5 (schéma Firestore), §5.2 (structure FAQ), §6.2 (types de ressources)
- Amendement A2 (workflow draft/pending/published)
- Amendement A1 (citations scientifiques dans les ressources)
- CLAUDE.md migration — section "Firestore collections nouvelles"
- `firestore.rules` existant (pour la fonction `isAdmin()` et le pattern des rules)
- `firestore.indexes.json` existant (pour le format)
- `project-docs/03_TECH/DATA_MODEL.md` existant (pour le format de documentation)

---

## Notes de planification

- Le type `Citation` dans `Ressource` est une sous-structure — pas une sous-collection Firestore. Stocker les citations comme array dans le document ressource (pas de jointure, pas de limite de volume problématique car max 5-10 citations par ressource).
- La catégorie FAQ `seance` est transversale (pas un pilier) — elle couvre les questions logistiques ("combien ça coûte", "comment se passe une séance", etc.). C'est cohérent avec le plan §5.3.
- Le champ `wixPostId` dans `PublicBlogPost` est nécessaire pour la double publication (amendement A3) — il permet de relier un article Firestore à son équivalent Wix pendant la période de transition.
- Point à valider avec Benoit : est-ce que `siteConfig` a besoin de documents pré-peuplés au déploiement, ou est-ce que les composants gèrent les valeurs par défaut ?
