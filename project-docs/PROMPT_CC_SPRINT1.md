# Mission CC : Sprint 1 — Plausible Analytics + Blog CMS → Firestore

## ⚠️ Contexte de branche
Tu es sur `feature/site-public-migration`. Le site public n'est PAS encore live.

## Lire d'abord
- `CLAUDE.md` (racine) — point d'entrée
- `project-docs/02_ROADMAP/content-strategy/ARCHITECTURE.md` — sections MW-F3a et MW-E3

---

## MILESTONE MW-F3a — Plausible Analytics (30 min)

### Objectif
Ajouter le script Plausible Analytics dans le layout public pour tracker les visiteurs dès le switch DNS.

### Ce qu'il faut faire

1. Dans `app/(public)/layout.tsx`, ajouter le script Plausible dans le `<head>` :
```tsx
<Script
  async
  src="https://plausible.io/js/pa-aZzfsJ6lLBfrRf7qnpB1w.js"
  strategy="afterInteractive"
/>
<Script id="plausible-init" strategy="afterInteractive">
  {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
</Script>
```
Importer `Script` de `next/script`.
NOTE : Ne PAS utiliser `data-domain` — le domaine est encodé dans l'URL du script (`pa-aZzfsJ6lLBfrRf7qnpB1w`).

2. Ajouter les goal events pour tracker les conversions :
- `Réservation Rosemont` — clic sur CTA GRV La Source en Soi
- `Réservation Repentigny` — clic sur CTA GRV Eden Yoga
- `Contact téléphone` — clic sur le lien tel:
- `Contact courriel` — clic sur le lien mailto:

Pour les goals, utiliser la méthode Plausible standard :
```tsx
// Exemple dans le onClick d'un CTA
if (typeof window !== 'undefined' && window.plausible) {
  window.plausible('Réservation Rosemont');
}
```

3. Ajouter la déclaration de type pour `window.plausible` :
```tsx
// dans un fichier de types, ex: lib/types/plausible.d.ts
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}
```

4. **NE PAS** ajouter Plausible sur les pages admin du Hub (`app/(app)/`), seulement sur le site public.

### Vérifications
- [ ] Script Plausible dans le layout public uniquement
- [ ] Type déclaré pour window.plausible
- [ ] Build OK

---

## MILESTONE MW-E3 — Blog Publish → Firestore (4-5h)

### Objectif
Rerouter le pipeline de publication de blog pour écrire dans Firestore `publicBlog` au lieu de l'API Wix. C'est le bottleneck principal : tant que blog/publish pointe vers Wix, on ne peut pas publier de nouveaux articles sur le nouveau site.

### Lire d'abord
- `project-docs/02_ROADMAP/content-strategy/ARCHITECTURE.md` — section MW-E3 détaillée
- `app/api/blog/publish/route.ts` — le code actuel (100% couplé à Wix)
- `app/api/blog/list/route.ts` — liste les articles (actuellement via Wix)
- `app/api/blog/stats/route.ts` — stats (actuellement via Wix)
- `lib/firestore/public-blog.ts` — le helper serveur EXISTANT pour lire depuis Firestore
- `lib/types/public-blog.ts` — le type PublicBlog EXISTANT avec PublicationStatus
- `components/features/blog/BlogEditor.tsx` — l'éditeur TiptapEditor existant

### Ce qui existe déjà
- Type `PublicBlog` avec workflow `PublicationStatus` (draft/pending/published)
- Helper `getPublicBlog()` et `getPublicBlogs()` dans `lib/firestore/public-blog.ts`
- Collection Firestore `publicBlog` avec 11 articles importés
- Le site public lit DÉJÀ depuis cette collection (ISR 1h)
- Le generate-blog-faq API (Claude) fonctionne et sera réutilisé tel quel

### Ce qu'il faut faire

#### 1. Rerouter `app/api/blog/publish/route.ts`
Actuellement : crée un brouillon Wix, puis publie via l'API Wix v3.
Nouveau : écrire directement dans Firestore `publicBlog`.

Le flow doit devenir :
1. Recevoir le contenu du BlogEditor (titre, contenu HTML, catégorie, image, slug, FAQ)
2. Convertir le HTML en markdown (ou garder le HTML selon le format de `publicBlog`)
3. Écrire dans Firestore `publicBlog` avec status `published` (ou `draft` si demandé)
4. Déclencher un revalidate ISR pour que la page soit mise à jour

```typescript
// Pseudo-code
import { adminDb } from '@/lib/firebase-admin';

const docRef = adminDb.collection('publicBlog').doc(slug);
await docRef.set({
  title,
  slug,
  content, // HTML ou markdown
  excerpt,
  category,
  coverImage,
  faqEntries, // les 3 FAQ générées par generate-blog-faq
  status: 'published',
  publishedAt: new Date(),
  updatedAt: new Date(),
  author: 'Judith Dufour-Savard',
  // Schema.org sera généré côté page
});

// Revalidate ISR
revalidatePath('/blog');
revalidatePath(`/blog/${slug}`);
```

#### 2. Rerouter `app/api/blog/list/route.ts`
Actuellement : fetch Wix API pour lister les articles.
Nouveau : query Firestore `publicBlog` collection.

```typescript
const snapshot = await adminDb.collection('publicBlog')
  .orderBy('publishedAt', 'desc')
  .get();
const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### 3. Adapter `app/api/blog/stats/route.ts`
Actuellement : stats via Wix.
Nouveau : compter les documents dans Firestore par status.

#### 4. Adapter le BlogEditor si nécessaire
Le BlogEditor utilise actuellement `ctaUrl` (déjà corrigé via rdvUrl.ts).
Vérifier que le flow "Publier" appelle la nouvelle route et non l'ancienne.

#### 5. Nettoyer les imports Wix
Retirer les dépendances et imports liés à l'API Wix dans les routes blog :
- `@wix/sdk`
- `@wix/blog`
- Tokens/credentials Wix
- Fonctions helper Wix

NE PAS supprimer les variables d'environnement Wix (elles sont peut-être utilisées ailleurs dans le Hub).

### Vérifications
- [ ] `blog/publish` écrit dans Firestore `publicBlog` (pas Wix)
- [ ] `blog/list` lit depuis Firestore `publicBlog` (pas Wix)
- [ ] `blog/stats` compte depuis Firestore (pas Wix)
- [ ] Le BlogEditor dans le Hub publie correctement
- [ ] Un article publié apparaît sur le site public (tester avec ISR ou revalidate)
- [ ] Les FAQ générées par generate-blog-faq sont incluses dans le document Firestore
- [ ] Build OK
- [ ] Aucune régression sur les 11 articles existants

### Commit
Faire UN commit propre :
"feat(hub): MW-E3 blog publish → Firestore (coupe Wix)

Reroute le pipeline blog du Hub vers Firestore publicBlog :
- blog/publish : écrit dans Firestore au lieu de Wix API v3
- blog/list : lit depuis Firestore au lieu de Wix
- blog/stats : compte depuis Firestore
- Nettoyage imports Wix des routes blog
- Revalidation ISR automatique après publication
- Les 11 articles existants ne sont pas affectés"

