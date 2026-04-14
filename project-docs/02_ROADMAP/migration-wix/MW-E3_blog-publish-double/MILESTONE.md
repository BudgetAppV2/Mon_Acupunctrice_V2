# Milestone MW-E3 : Extension publication blog — double push Wix + Firestore

**Type** : Admin
**Vague** : 5
**Priorité** : Medium
**Temps estimé Claude Code** : 1-2h
**Dépendances** : MW-B2
**Status** : 🔴 Not started

---

## Objectif

Étendre la route API `/api/blog/publish/` existante pour qu'elle crée aussi une entrée dans `publicBlog` Firestore à chaque publication, permettant la double publication Wix + futur site Vercel pendant la période de transition.

---

## Contexte minimal

Le Hub publie déjà des articles vers Wix via `app/api/blog/publish/`. L'amendement A3 demande que chaque publication crée simultanément une entrée dans `publicBlog` Firestore avec `status: 'published'`. Pendant la transition, chaque nouvel article apparaît sur les deux plateformes. Post-lancement, on désactive le push Wix (simple flag).

---

## Livrables

- [ ] **Extension de `app/api/blog/publish/route.ts`** (ou la Cloud Function correspondante) — ajout de l'écriture Firestore en plus du push Wix
- [ ] **Flag de transition** — variable d'environnement ou config Firestore (`siteConfig/blogPublish`) qui contrôle si le push Wix est actif ou non
- [ ] **Fallback** — si l'écriture Firestore échoue, le push Wix réussit quand même (pas de régression)

---

## Approche technique

**Extension de la route** :
1. Identifier la route API ou Cloud Function qui publie vers Wix
2. Après le push Wix réussi, construire un document `PublicBlogPost` (schéma MW-B2) avec les données de l'article
3. Écrire dans `publicBlog/{slug}` avec `status: 'published'` et `wixPostId` rempli
4. Logger le succès/échec de l'écriture Firestore

**Flag de transition** :
- `ENABLE_WIX_PUBLISH=true` dans `.env.local` (ou document `siteConfig/blogPublish` dans Firestore)
- Quand on fait le switch DNS (MW-G2), on passe à `false` pour arrêter le push Wix
- Le push Firestore reste toujours actif

**Gestion d'erreur** :
- Le push Wix est le primary — il ne doit jamais être cassé par l'ajout Firestore
- L'écriture Firestore est en `try/catch` avec logging — si elle échoue, l'article est quand même publié sur Wix

---

## Fichiers impactés

```
✏️ MODIFY (fichiers existants) :
- app/api/blog/publish/route.ts (ou le fichier correspondant dans app/api/)
  — ajout de l'écriture Firestore après le push Wix
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Publier un article via le Hub crée une entrée dans `publicBlog` Firestore
- [ ] Le push Wix continue de fonctionner normalement (pas de régression)
- [ ] Le document Firestore créé a les bons champs (titre, slug, contenu, author, status, wixPostId)
- [ ] Si l'écriture Firestore échoue, le push Wix réussit quand même
- [ ] Le flag `ENABLE_WIX_PUBLISH` est documenté
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Integration** : publier un article de test via le Hub → vérifier dans Firestore ET sur Wix
- **Régression** : la publication vers Wix fonctionne exactement comme avant
- **Fallback** : simuler une erreur Firestore (mauvais credentials ou collection inexistante) et vérifier que Wix reçoit quand même l'article

---

## Contraintes

- Ne PAS casser la publication Wix existante — c'est le site en production de Judith
- L'écriture Firestore est un ajout, pas un remplacement
- Le contenu est envoyé tel quel dans Firestore — pas de parsing Ricos ici (l'article est déjà en format markdown/HTML dans le Hub)
- Mobile-first n'est pas pertinent (c'est une route API)

---

## Références

- Amendement A3 (double publication blog)
- MW-B2 (schéma `PublicBlogPost` avec champ `wixPostId`)
- Route API existante : `app/api/blog/publish/` ou la Cloud Function référencée
- `lib/firebase-admin.ts` (pour l'écriture Firestore côté serveur)

---

## Notes de planification

- Ce milestone est court (1-2h) car c'est une extension d'une route existante, pas une création.
- Il faut d'abord lire le code de `app/api/blog/publish/` pour comprendre le format des données envoyées et comment elles sont structurées.
- Le contenu envoyé au moment de la publication peut être en format différent du Ricos JSON (peut-être du HTML ou du markdown). Adapter la construction du document `PublicBlogPost` en conséquence.
- Point à valider avec Benoit : est-ce que le push Wix se fait via la route API Next.js ou via une Cloud Function Firebase ? Le code à modifier dépend de la réponse.
