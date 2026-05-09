# Handoff CC — Milestone 1.5 : Suppression définitive depuis le Hub

**Date** : 2026-05-08 (soirée)
**Contexte** : extension du M1 (commit `4e4e2f6` déployé en prod). Le test du workflow review a révélé un gap : on peut dépublier (`published → pending` via `/api/cms/unpublish`) mais on ne peut pas SUPPRIMER définitivement un contenu depuis le Hub. Cela bloque le nettoyage des posts de test (actuellement 2 en pending dans `publicBlog` : `test` et `ping-test-dont-publish`).

## 1. Décisions stratégiques (validées par Benoit)

- **Hard delete** (effacement réel `db.collection().doc().delete()`), PAS soft delete avec `status: 'archived'`
- **Restriction** : autorisé UNIQUEMENT si `status === 'pending'`. Pour supprimer un post `published`, l'utilisateur doit d'abord cliquer "Dépublier" (qui repasse en `pending`), puis "Supprimer". Workflow en deux étapes distinctes pour éviter les accidents.
- **Confirmation forte** : modal qui demande de taper le mot `SUPPRIMER` exactement avant que le bouton de validation ne devienne actif. Élimine les clics accidentels.
- **Hors scope M1.5** : le pipeline images multiples (M2A) et le bridge social (M2B) — décisions UX prises mais implémentation pour les sessions suivantes.

## 2. Scope — 4 actions

### Action 1 — Créer `/api/cms/delete/route.ts`

Reproduire la structure de `/api/cms/unpublish/route.ts` (qui est le pattern le plus proche : POST avec `{ id, type, uid }`, `COLLECTION_MAP` identique, revalidatePath).

Différences clés :
- Au lieu de `update({ status: 'pending', ... })`, faire `delete()` sur le doc
- AVANT le delete, vérifier que `status === 'pending'`. Si autre status, retourner 400 avec message clair :
  ```json
  { "error": "Suppression autorisée uniquement pour les contenus en attente. Dépublier d'abord." }
  ```
- `revalidatePath` toujours appelé après delete (au cas où le doc était quand même apparu via un cache résiduel)


Squelette attendu :

```ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/lib/firebase-admin';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/**
 * POST /api/cms/delete — Supprime DEFINITIVEMENT un contenu (hard delete Firestore).
 *
 * Restriction : autorise uniquement si status === 'pending'.
 * Pour un contenu published, dépublier d'abord (/api/cms/unpublish), puis supprimer.
 *
 * IRREVERSIBLE : aucune restauration possible apres delete.
 */
export async function POST(request: NextRequest) {
  const { id, type } = await request.json() as { id: string; type: string; uid?: string };
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  const collection = COLLECTION_MAP[type];
  if (!collection) return NextResponse.json({ error: 'type invalide' }, { status: 400 });

  const db = getAdminFirestore();
  const docRef = db.collection(collection).doc(id);
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
  }

  const data = snap.data();
  if (data?.status !== 'pending') {
    return NextResponse.json({
      error: 'Suppression autorisée uniquement pour les contenus en attente. Dépublier d\'abord.',
      currentStatus: data?.status,
    }, { status: 400 });
  }

  await docRef.delete();

  // Revalidation par precaution (devrait deja etre out depuis unpublish, mais safety net)
  if (type === 'blog') {
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
  } else if (type === 'faq') {
    revalidatePath('/faq');
  } else if (type === 'ressource') {
    revalidatePath('/ressources');
    revalidatePath(`/ressources/${id}`);
  }

  return NextResponse.json({ success: true, deleted: { id, type } });
}
```

Le `uid` peut être inclus dans le body pour audit (facultatif) mais n'est pas utilisé pour la décision puisqu'on n'a pas de système de permissions multi-user à ce stade.


### Action 2 — Étendre `ContentReviewCard` avec bouton "Supprimer"

**Fichier** : `components/features/cms/ContentReviewCard.tsx`

CC doit d'abord LIRE le composant pour comprendre comment les boutons existants (`onApprove`, `onComment`, `onUnpublish`) sont structurés et stylés. Reproduire exactement le même pattern pour `onDelete`.

**Caractéristiques du nouveau bouton** :
- Texte : "Supprimer"
- Couleur : rouge (Tailwind `bg-red-600 hover:bg-red-700 text-white` ou cohérent avec le reste du thème)
- Icône : `TrashIcon` de `@heroicons/react/24/outline` (cohérent avec le reste de l'UI Hub)
- **Visible UNIQUEMENT si `status === 'pending'`** (jamais sur draft, jamais sur published)
- Position : à droite des autres boutons d'action de la carte (après Approuver / Commenter), séparé visuellement avec une marge un peu plus grande pour éviter les clics accidentels

**Au clic** : ouvre une modal de confirmation forte (Action 2bis ci-dessous), pas une simple `confirm()` browser.

### Action 2bis — Modal de confirmation forte

Créer un nouveau composant `components/features/cms/DeleteConfirmModal.tsx` avec ces caractéristiques :

- Affiche le titre du contenu à supprimer
- Texte d'avertissement : *"Cette action est irréversible. Le contenu sera définitivement supprimé de la base de données et ne pourra pas être restauré."*
- Champ texte : *"Pour confirmer, tape le mot SUPPRIMER ci-dessous"*
- Bouton "Confirmer la suppression" :
  - **Désactivé** (grisé, `disabled={true}`) tant que la valeur du champ texte n'est pas exactement `SUPPRIMER` (case-sensitive, sans espaces avant/après — utiliser `.trim() === 'SUPPRIMER'`)
  - **Actif** (rouge cliquable) seulement quand la frappe est correcte
- Bouton "Annuler" toujours visible et fonctionnel

Style : modal centrée à l'écran avec backdrop semi-transparent, fermeture par Escape ou clic backdrop ou bouton Annuler. Reproduire le pattern des autres modals du Hub (s'il y en a — sinon, modal simple Tailwind avec `fixed inset-0 z-50 ...`).


### Action 3 — Étendre `app/(app)/contenu/page.tsx` avec `handleDelete`

Ajouter une fonction `handleDelete` cohérente avec les autres handlers (`handleApprove`, `handleComment`, `handleUnpublish`).

Particularité : le `handleDelete` ne fait PAS la confirmation lui-même (la modal s'en charge). Il prend juste `(id, type)` et fait l'appel API. La modal appelle `handleDelete` quand l'utilisateur valide.

```ts
const handleDelete = async (id: string, type: string) => {
  const res = await fetch('/api/cms/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type, uid: user?.uid }),
  });
  if (!res.ok) {
    const data = await res.json();
    alert(`Erreur : ${data.error || 'Suppression échouée'}`);
    return;
  }
  refresh();
};
```

Passer `handleDelete` en prop au `ContentReviewCard` via `onDelete={handleDelete}`.

### Action 4 — Update `CLAUDE.md`

Documenter le workflow trash dans la section "Workflow contenu unifié" (ajoutée en M1) :

```markdown
**Workflow trash (M1.5, mai 2026)** :

Cycle complet du contenu, du draft à la suppression :

  draft (markdown source ou Tiptap save)
     ↓ inject.mjs ou Hub Tiptap publish
  pending (visible dans Hub /contenu)
     ↓ /api/cms/approve (bouton Approuver)
  published (live sur le site public, ISR active)
     ↓ /api/cms/unpublish (bouton Dépublier)
  pending (re-visible dans /contenu, re-approuvable en 1 clic)
     ↓ /api/cms/delete (bouton Supprimer + confirmation forte "SUPPRIMER")
  [destruction irréversible du doc Firestore]

Restriction `delete` : autorisé uniquement depuis `status === 'pending'`. Pour
supprimer un live post, il faut d'abord cliquer "Dépublier" (qui repasse en
pending), puis "Supprimer". Workflow en 2 étapes pour éviter les accidents.

Confirmation forte : modal qui demande de taper le mot SUPPRIMER avant que
le bouton de validation ne devienne actif.
```



## 3. Test E2E avant commit

CC ne peut pas tester en browser, mais doit valider la cohérence du code :

1. Compilation TypeScript clean (`npm run build`)
2. Le bouton Supprimer n'apparaît que si `status === 'pending'` (vérifier la condition dans le JSX)
3. Le bouton de validation modal est `disabled` tant que SUPPRIMER n'est pas tapé exactement
4. L'appel API passe bien `{ id, type, uid }` dans le body
5. Gestion d'erreur (404 / 400 / 500) affiche un message à l'utilisateur, pas un crash

Benoit fera le test E2E réel post-déploiement Vercel :
- Hub `/contenu` → filtre Type=Blog, Statut=En attente
- Voir `ping-test-dont-publish` (créé par Claude via curl en validation API)
- Cliquer "Supprimer" → modal apparaît
- Taper `SUPPRIMER` exactement → bouton devient actif
- "Confirmer la suppression" → post disparaît
- Vérifier Firestore Console que `publicBlog/ping-test-dont-publish` n'existe plus
- Idem pour `test` (à dépublier d'abord puis supprimer)

## 4. Build + commit + push

### Build check (CRITIQUE)

```bash
cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
npm run build
```

### Commit ciblé

Stager UNIQUEMENT les fichiers du M1.5 (5 fichiers attendus : 1 nouveau route, 1 nouveau composant modal, 2 modifs UI, 1 doc) :

```bash
git add app/api/cms/delete/route.ts \
        components/features/cms/ContentReviewCard.tsx \
        components/features/cms/DeleteConfirmModal.tsx \
        "app/(app)/contenu/page.tsx" \
        CLAUDE.md
```

Vérifier le staged :

```bash
git status --short
git diff --cached --stat
```

### Commit message proposé

```
feat(content): hard delete from Hub /contenu (Milestone 1.5)

Closes a gap surfaced during M1 testing : the unpublish endpoint moves
content back to 'pending' but does not actually erase the Firestore
document. With M1 in production, Benoit had two test posts stuck in
publicBlog ('test' and 'ping-test-dont-publish') with no way to remove
them from the Hub.

CHANGES

/api/cms/delete (NEW)
- Hard delete : db.collection().doc().delete() on Firestore
- Restriction : only authorized when status === 'pending'. Returns 400
  with a clear message if the content is published or in any other
  status. To delete a live post, the user must first click 'Unpublish'
  (which reverts to pending), then 'Delete'. Two-step workflow prevents
  accidents.
- Same COLLECTION_MAP as approve / unpublish (blog, faq, ressource)
- revalidatePath called after delete as a safety net

components/features/cms/ContentReviewCard.tsx
- New 'Supprimer' button (red, TrashIcon) visible ONLY if status ===
  'pending'. Hidden on draft and published.
- onDelete prop wired to open the new confirmation modal

components/features/cms/DeleteConfirmModal.tsx (NEW)
- Strong confirmation modal : displays the content title, irreversibility
  warning, and a text field requiring exact 'SUPPRIMER' typed before the
  confirm button becomes active (disabled while text !== 'SUPPRIMER').
- Cancel button always available, Escape key and backdrop click close.

app/(app)/contenu/page.tsx
- New handleDelete function calls /api/cms/delete and refreshes the list
- Passes onDelete to ContentReviewCard
- Error handling : displays alert with the API error message on failure

CLAUDE.md
- Documented the full content lifecycle (draft → pending → published →
  unpublish → pending → delete) under 'Workflow trash (M1.5)'

WHY
- Benoit needs to clean up test posts in Firestore from the Hub UI
  rather than from Firestore Console.
- Hard delete chosen over soft delete (status: 'archived') for
  simplicity : no new status to manage in filters and types, fewer
  zombie docs polluting Firestore over time.
- The two-step workflow (unpublish → delete) and strong typed
  confirmation guard against accidental destruction of live content.

TESTING
- npm run build : clean
- E2E manual test deferred to post-deployment by Benoit
```

### Push

```bash
git push origin main
```

Vercel rebuild ~3-5 min. Vérification post-déploiement par Benoit (cf. test E2E ci-dessus).

## 5. Pièges à éviter

1. **NE PAS afficher le bouton Supprimer sur status `published`** — la condition `status === 'pending'` doit être stricte côté UI ET côté API. Double sécurité.

2. **NE PAS utiliser `confirm()` browser** pour la confirmation — la modal custom avec frappe du mot SUPPRIMER est obligatoire. Le `confirm()` natif accepte trop facilement.

3. **NE PAS toucher aux endpoints existants** (`/api/cms/approve`, `/api/cms/unpublish`, `/api/cms/comment`) — ils marchent et ne doivent pas être modifiés.

4. **NE PAS committer** `lib/animations/*` ni les doublons " 2." (cleanup séparé).

5. **VÉRIFIER `npm run build`** avant push.

6. **Vérification stricte côté API** : si quelqu'un appelle `/api/cms/delete` directement sur un doc `published`, le doit rejeter avec 400. Tester ce cas dans le code (le check `status === 'pending'` après `snap.exists`).

## 6. Aperçu M2A et M2B (POUR INFO — pas pour aujourd'hui)

### M2A — Pipeline images multiples (~3-4h, prochaine session dédiée)

Décisions UX validées par Benoit le 8 mai :
- U1 : 4 propositions par défaut
- U2 : variations BG + lineart ensemble
- U3 : génération à l'injection markdown (et au Tiptap publish)
- U4 : Firebase Storage avec URLs sauvées dans le doc
- U5 : story générée à partir de la même combo BG+lineart que la cover (donc 4 covers + 4 stories par article = 8 images)
- U6 : éditeur d'images manuel conservé en fallback ("Créer une image custom")

Travail : module `lib/cover-generator/variations.ts` qui génère N propositions, branchement dans `inject.mjs` et `/api/blog/publish`, UI grille de propositions dans le ContentReviewCard, bouton "Choisir cette image" sur chaque tuile, fallback éditeur custom.

### M2B — Bridge contenu → social (~3-4h, après M2A)

- Refactor `useBlogSequence` : URL externe → ContentRef (type+slug)
- Modifier `/api/cms/approve` pour accepter `createSocialSequence: boolean`
- Default checkbox cochée pour blog, décochée pour ressources/FAQ
- Création de 4 calendarSlots J+0/J+1/J+3/J+7 liés via sequenceId
- Génération de 4 captions sur mesure via Groq/Claude (avec fallback templates)
- Refactor `storyImageGenerator` slug interne (M3 fusionné dans M2B)

## 7. Récap actions M1.5

```
[ ] Lire le handoff entièrement
[ ] Lire ContentReviewCard.tsx pour comprendre le pattern existant
[ ] Action 1 — Créer /api/cms/delete/route.ts
[ ] Action 2 — Étendre ContentReviewCard avec bouton Supprimer (rouge, conditionné à pending)
[ ] Action 2bis — Créer DeleteConfirmModal.tsx (frappe SUPPRIMER)
[ ] Action 3 — handleDelete dans /contenu page.tsx + onDelete prop
[ ] Action 4 — Update CLAUDE.md workflow trash
[ ] npm run build (CRITIQUE)
[ ] git add ciblé (5 fichiers)
[ ] git status --short et git diff --cached --stat (vérification visuelle)
[ ] git commit avec message proposé
[ ] git push origin main
[ ] Confirmer SHA + push à Benoit
```

Bonne session !
