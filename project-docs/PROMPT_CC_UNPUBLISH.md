# Mission CC : Bouton « Retirer du site » + fix filtres CMS

## Contexte

Tu es sur la branche `feature/site-public-migration`. Cette mission combine deux corrections sur le CMS du Hub :

1. **Bouton « Retirer du site »** : ajouter le moyen de retirer un contenu publié depuis l'UI (alternative au terminal `node content/scripts/retire.mjs`). Le contenu retiré passe en `pending` (pas en `draft`) pour qu'il soit ré-approuvable en 1 clic depuis la liste.

2. **Fix bug filtres** : les filtres « Brouillons / En attente / Publiés » ne fonctionnent pas. Cause identifiée : indexes Firestore composites manquants. La requête `where('status','==',X) + orderBy('updatedAt','desc')` plante avec FAILED_PRECONDITION et l'erreur est masquée silencieusement côté client.

## Lire d'abord

- `CLAUDE.md` (racine)
- `app/api/cms/approve/route.ts` — modèle pour l'API unpublish
- `app/api/cms/submit/route.ts` — modèle pour le passage en `pending`
- `app/api/cms/list/route.ts` — API à rendre robuste (try/catch + Promise.allSettled)
- `app/(app)/contenu/page.tsx` — page liste où ajouter le bouton et qui affiche déjà Approuver/Commenter pour les pending
- `app/(app)/contenu/ressources/[id]/page.tsx` et `app/(app)/contenu/faq/[id]/page.tsx` — formulaires d'édition où ajouter le bouton dans le footer
- `firestore.indexes.json` — fichier à compléter avec 3 nouveaux indexes
- `content/scripts/retire.mjs` — référence (qui sera mis à jour aussi pour rester cohérent)

## Décisions prises (ne pas remettre en question)

- **unpublish met `status: 'pending'`**, PAS `'draft'`. Raison : un contenu publié qu'on retire a déjà été validé par Judith — il va dans la file d'attente pour réapprobation 1-clic, pas dans les brouillons.
- **`publishedAt` est préservé** : ce champ reste tel quel pour la traçabilité historique (date de première publication).
- **`reviewComment` est vidé** lors d'un unpublish (cohérent avec ce que fait `submit/route.ts`).
- **`submittedAt` n'est PAS touché** : il représente la dernière soumission explicite par Benoit, pas une mise en attente côté Judith.
- **Sémantique « Retirer » ≠ « Supprimer »** : Retirer = `status: 'pending'` (réversible, réapparait dans En attente). Supprimer = `DELETE` Firestore (icône Trash, irrécupérable). Couleur du bouton : gris/neutre, pas rouge.
- **Index Firestore composite** : ajouter `(status ASC, updatedAt DESC)` pour les 3 collections (publicBlog, faqs, ressources). Les indexes existants utilisent `publishedAt` ou `order` comme tri secondaire — ne pas les remplacer, juste en ajouter 3 nouveaux.
- **`Promise.allSettled`** au lieu de `Promise.all` dans `/api/cms/list` : si une collection plante (index manquant, perms, etc.), les autres continuent de fonctionner et l'erreur est loggée serveur.

---

## PARTIE 1 — API unpublish

Créer `app/api/cms/unpublish/route.ts` :

```ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/**
 * POST /api/cms/unpublish — Retire un contenu du site public.
 * status passe à 'pending' pour qu'il soit ré-approuvable en 1 clic depuis la liste.
 * publishedAt est préservé (traçabilité historique).
 */
export async function POST(request: NextRequest) {
  const { id, type, uid } = await request.json() as { id: string; type: string; uid: string };
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  const collection = COLLECTION_MAP[type];
  if (!collection) return NextResponse.json({ error: 'type invalide' }, { status: 400 });

  const db = getAdminFirestore();
  await db.collection(collection).doc(id).update({
    status: 'pending',
    updatedAt: FieldValue.serverTimestamp(),
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: uid || '',
    reviewComment: '', // clear le commentaire précédent (cohérent avec submit/route.ts)
    // NOTE : publishedAt et submittedAt ne sont PAS touchés.
  });

  // Revalidate ISR — les pages de détail retourneront 404 (souhaité).
  if (type === 'blog') {
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
  } else if (type === 'faq') {
    revalidatePath('/faq');
  } else if (type === 'ressource') {
    revalidatePath('/ressources');
    revalidatePath(`/ressources/${id}`);
  }

  return NextResponse.json({ success: true });
}
```

---

## PARTIE 2 — Bouton dans la page liste

Modifier `app/(app)/contenu/page.tsx` :

### 2a. Ajouter le handler

À côté de `handleApprove` et `handleComment` :

```ts
const handleUnpublish = async (id: string, type: string) => {
  if (!confirm('Retirer ce contenu du site public ?\n\nIl repassera en « En attente » et pourra être réapprouvé en 1 clic.')) return;
  await fetch('/api/cms/unpublish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type, uid: user?.uid }),
  });
  refresh();
};
```

### 2b. Ajouter le bouton sous les cards `published`

Le bloc actuel affiche Approuver/Commenter pour `pending`. Ajouter un bloc parallèle pour `published` (juste après) :

```tsx
{item.status === 'pending' && (
  <div className="flex gap-2 mt-1 ml-4">
    <button onClick={() => handleApprove(item.id, item.type)}
      className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
      Approuver
    </button>
    <button onClick={() => handleComment(item.id, item.type)}
      className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
      Commenter
    </button>
  </div>
)}
{item.status === 'published' && (
  <div className="flex gap-2 mt-1 ml-4">
    <button onClick={() => handleUnpublish(item.id, item.type)}
      className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md hover:bg-gray-200">
      Retirer du site
    </button>
  </div>
)}
```

---

## PARTIE 3 — Bouton dans les pages d'édition

### 3a. `app/(app)/contenu/ressources/[id]/page.tsx`

Ajouter le handler après `handleSubmit` :

```ts
const handleUnpublish = async () => {
  if (!confirm('Retirer cette ressource du site public ?\n\nElle repassera en « En attente » et pourra être réapprouvée en 1 clic.')) return;
  await fetch('/api/cms/unpublish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type: 'ressource' }),
  });
  router.push('/contenu');
};
```

Modifier le footer pour ajouter le bouton quand `status === 'published'` :

```tsx
<div className="flex gap-2">
  <button onClick={handleSave} disabled={saving}
    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-sage text-white">
    {saving ? 'Enregistrement...' : 'Enregistrer'}
  </button>
  {status === 'draft' && (
    <button onClick={handleSubmit}
      className="flex-1 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-white">
      Soumettre a Judith
    </button>
  )}
  {status === 'published' && (
    <button onClick={handleUnpublish}
      className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300">
      Retirer du site
    </button>
  )}
</div>
```

### 3b. `app/(app)/contenu/faq/[id]/page.tsx`

Identique mais avec `type: 'faq'` et confirmation adaptée (« Retirer cette FAQ du site public ? »).

---

## PARTIE 4 — Fix filtres : ajouter les indexes composites

Modifier `firestore.indexes.json` pour ajouter 3 nouveaux indexes (NE PAS supprimer les existants) :

```json
{
  "collectionGroup": "publicBlog",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "updatedAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "faqs",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "updatedAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "ressources",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "updatedAt", "order": "DESCENDING" }
  ]
}
```

**Insertion** : ajouter ces 3 entrées dans le tableau `indexes` (après les indexes existants, avant la fermeture). Vérifier que la virgule de séparation est bien placée.

**Déploiement** (à faire par Benoit après le commit) :
```bash
firebase deploy --only firestore:indexes
```

Le déploiement prend 1-5 minutes selon la quantité de docs. Pendant ce temps, les filtres restent cassés. Après, ils fonctionnent.

---

## PARTIE 5 — Robustesse de l'API list

Modifier `app/api/cms/list/route.ts` pour utiliser `Promise.allSettled` et logger les erreurs serveur :

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

/** GET /api/cms/list — Liste unifiee blog + FAQ + ressources avec filtres */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get('type');
  const statusFilter = searchParams.get('status');

  const db = getAdminFirestore();
  const items: Record<string, unknown>[] = [];

  const collections = typeFilter
    ? [{ name: typeFilter === 'blog' ? 'publicBlog' : typeFilter === 'faq' ? 'faqs' : 'ressources', type: typeFilter }]
    : [
        { name: 'publicBlog', type: 'blog' },
        { name: 'faqs', type: 'faq' },
        { name: 'ressources', type: 'ressource' },
      ];

  // Promise.allSettled : si une collection plante, les autres continuent
  const results = await Promise.allSettled(
    collections.map(async ({ name, type }) => {
      let query = db.collection(name).orderBy('updatedAt', 'desc').limit(100);
      if (statusFilter) {
        query = db.collection(name).where('status', '==', statusFilter).orderBy('updatedAt', 'desc').limit(100);
      }
      const snap = await query.get();
      return { name, type, docs: snap.docs };
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { type, docs } = result.value;
      docs.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          type,
          title: d.title || d.question || '',
          status: d.status || 'draft',
          excerpt: d.excerpt || d.reponse?.slice(0, 120) || d.shortAnswer?.slice(0, 120) || '',
          updatedAt: d.updatedAt?.toDate?.()?.toISOString() || null,
          reviewComment: d.reviewComment || null,
        });
      });
    } else {
      // Logger l'erreur serveur sans casser le reste de la réponse
      console.error('[cms/list] Collection query failed:', result.reason);
    }
  }

  // Sort by updatedAt desc across all types
  items.sort((a, b) => {
    const da = a.updatedAt as string || '';
    const db2 = b.updatedAt as string || '';
    return db2.localeCompare(da);
  });

  return NextResponse.json({ items });
}
```

**Bénéfice** : si pour une raison quelconque (index pas encore déployé, perms manquantes, doc corrompu) une collection plante, les 2 autres continuent de s'afficher. L'erreur apparaît dans les logs Vercel/Firebase au lieu d'une page blanche.

---

## PARTIE 6 — Cohérence avec retire.mjs (optionnel mais recommandé)

Le script `content/scripts/retire.mjs` met actuellement `status: 'draft'` par défaut. Pour rester cohérent avec la nouvelle logique UI, le modifier pour mettre `status: 'pending'` par défaut, et permettre `--draft` comme flag explicite si on veut vraiment archiver.

Modifier la signature et la branche par défaut :

```js
// Dans content/scripts/retire.mjs
const shouldDelete = args.includes('--delete');
const shouldDraft = args.includes('--draft'); // nouveau flag pour archiver vraiment
const collection = args[0];
const slug = args[1];

// Plus bas, dans le else :
} else {
  const newStatus = shouldDraft ? 'draft' : 'pending';
  await docRef.update({ status: newStatus, updatedAt: new Date() });
  console.log(`📦 ${collection}/${slug} ${shouldDraft ? 'archivé (draft)' : 'retiré (pending)'}`);
}
```

Et le message d'aide :
```js
console.log('Usage: node content/scripts/retire.mjs <collection> <slug> [--draft|--delete]');
console.log('  par défaut : passe en pending (réapprouvable depuis le Hub)');
console.log('  --draft : passe en draft (archivé, réapparaît dans Brouillons)');
console.log('  --delete : supprime le document');
```

Cette modification est mineure mais elle évite que l'UI et le terminal aient des comportements divergents.

---

## Résumé des fichiers

### Créés
- `app/api/cms/unpublish/route.ts`

### Modifiés
- `app/(app)/contenu/page.tsx` (handler + bouton sous cards published)
- `app/(app)/contenu/ressources/[id]/page.tsx` (handler + bouton dans le footer)
- `app/(app)/contenu/faq/[id]/page.tsx` (handler + bouton dans le footer)
- `app/api/cms/list/route.ts` (Promise.allSettled + logging d'erreur)
- `firestore.indexes.json` (3 nouveaux indexes composites)
- `content/scripts/retire.mjs` (default status → pending, flag --draft pour archiver)

---

## Vérifications

**Bouton unpublish** :
- [ ] L'API `/api/cms/unpublish` répond 200 sur un POST valide
- [ ] L'API rejette les types invalides (400)
- [ ] Le bouton apparaît UNIQUEMENT pour `published` (pas draft, pas pending)
- [ ] Confirmation native demandée
- [ ] Après unpublish, le contenu est en `status: 'pending'` dans Firestore
- [ ] `publishedAt` est intact (vérifier avec un doc qui l'avait déjà)
- [ ] `reviewComment` est vidé
- [ ] Le contenu réapparaît dans le filtre « En attente » avec les boutons Approuver/Commenter
- [ ] Cliquer Approuver depuis là le republie en 1 clic

**Fix filtres** :
- [ ] `firebase deploy --only firestore:indexes` se termine sans erreur (à faire par Benoit)
- [ ] Filtre « Brouillons » affiche bien les drafts (et seulement eux)
- [ ] Filtre « En attente » affiche bien les pending
- [ ] Filtre « Publiés » affiche bien les published
- [ ] Combinaison type + statut fonctionne (ex: « Ressources » + « Publiés »)
- [ ] Si on supprime un index dans Firebase Console pour tester la robustesse, l'API ne crashe pas (Promise.allSettled fait son job)

**Build** :
- [ ] `npm run build` OK
- [ ] `npx tsc --noEmit` OK

---

## Test manuel end-to-end (à faire après le commit ET le déploiement des indexes)

1. Aller dans `/contenu`, vérifier que tous les filtres fonctionnent
2. Filtrer par « Publiés », trouver une ressource publiée
3. Cliquer « Retirer du site », confirmer
4. Vérifier qu'elle disparaît du filtre « Publiés » et apparaît dans « En attente »
5. Cliquer « Approuver » sur la card → elle revient dans « Publiés »
6. Vérifier dans Firestore que `publishedAt` n'a pas changé entre le retrait et la réapprobation

---

## Commit

```
feat(hub): bouton "Retirer du site" + fix filtres CMS

Bouton de retrait :
- Nouvelle API /api/cms/unpublish (status → pending + revalidate ISR)
- Bouton "Retirer du site" sur la page liste (sous cards published)
- Bouton "Retirer du site" dans le footer des pages d'édition FAQ et ressources
- Préserve publishedAt pour traçabilité, vide reviewComment
- Le contenu retiré repasse en pending pour ré-approbation 1-clic
- Cohérence avec retire.mjs (default → pending, --draft pour archiver)

Fix filtres :
- 3 indexes Firestore composites manquants (publicBlog, faqs, ressources)
  sur (status ASC, updatedAt DESC)
- API /api/cms/list utilise Promise.allSettled + log serveur
  pour ne pas crasher si une collection plante
- Déployer les indexes : firebase deploy --only firestore:indexes
```
