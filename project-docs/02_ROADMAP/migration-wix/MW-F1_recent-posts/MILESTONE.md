# Milestone MW-F1 : Composant `<RecentPosts />` dynamique

**Type** : Automation
**Vague** : 6
**Priorité** : Medium
**Temps estimé Claude Code** : 2-3h
**Dépendances** : MW-C1
**Status** : 🔴 Not started

---

## Objectif

Remplacer la card Instagram statique de la homepage par un composant dynamique `<RecentPosts />` qui affiche automatiquement les 3-5 derniers posts publiés via le Hub, tous canaux confondus (Reels Instagram, posts Facebook, Shorts YouTube).

---

## Contexte minimal

L'amendement A4 demande un composant dynamique sur la homepage qui montre l'activité sociale récente de Judith. La source de données est la collection `contentItems` du Hub (déjà en production), filtrée sur `distributionStatus === 'published'`. Pas besoin de copie dans `siteConfig` — un Server Component qui query directement Firestore suffit.

---

## Livrables

- [ ] **Composant `<RecentPosts />`** — Server Component qui affiche les 3-5 derniers posts publiés avec : thumbnail/cover, titre, plateforme (badge IG/FB/YT), date
- [ ] **Intégration homepage** — remplacement du placeholder statique dans la section Blog/Social de MW-C1
- [ ] **Revalidation ISR** — le composant est revalidé via le cron quotidien (MW-F2) pour rester à jour

---

## Approche technique

**Query Firestore** :
```typescript
// Server Component — query directe
const recentPosts = await getDocs(
  query(
    collection(db, 'contentItems'),
    where('distributionStatus', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(5)
  )
);
```

**Composant** (`app/(public)/_components/RecentPosts.tsx`) :
- Server Component (pas de `'use client'`)
- Query via `firebase-admin` (côté serveur, pas le SDK client)
- Pour chaque post : card avec thumbnail (cover image si dispo), titre, badge plateforme (Instagram, Facebook, YouTube), date relative ("il y a 3 jours")
- Lien vers le post sur la plateforme d'origine (URL Instagram, Facebook, YouTube)
- Design cohérent avec les tokens v4, grid responsive

**Intégration** :
- Dans `app/(public)/page.tsx` (homepage), remplacer le placeholder de la section Blog/Social par `<RecentPosts />`
- Le composant gère l'état "aucun post récent" gracieusement (ne rien afficher ou afficher un message discret)

**Revalidation** :
- Le composant est statiquement rendu au build et revalidé par le cron ISR (MW-F2)
- ISR via `revalidateTag('recent-posts')` ou `revalidatePath('/')` depuis le cron

**Firestore index requis** :
- `contentItems` : `distributionStatus ASC, publishedAt DESC` — vérifier si cet index existe déjà (il pourrait exister via les indexes existants du Hub)

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/_components/RecentPosts.tsx

✏️ MODIFY (fichiers existants) :
- app/(public)/page.tsx (remplacer placeholder par <RecentPosts />)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] La homepage affiche les 3-5 derniers posts publiés via le Hub
- [ ] Les badges de plateforme (IG, FB, YT) s'affichent correctement
- [ ] Les liens vers les posts d'origine fonctionnent
- [ ] Le composant gère gracieusement l'état "aucun post récent"
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px (cards empilées) et 1024px (grille)
- **Données** : vérifier que les posts affichés correspondent aux derniers publiés dans Firestore
- **Edge case** : vérifier le comportement quand `contentItems` n'a aucun post publié

---

## Contraintes

- Ne pas modifier la collection `contentItems` ni ses types — lecture seule
- Server Component obligatoire (pas de `'use client'` — le composant est statique avec ISR)
- Utiliser `firebase-admin` pour la query côté serveur, pas le SDK client
- Ne pas créer de copie des données dans `siteConfig` — query directe
- Design tokens v4 (`public-*`)
- Mobile-first 375px
- Pas d'emojis

---

## Références

- Amendement A4 (cards social media dynamiques)
- MW-C1 (homepage — placeholder à remplacer)
- MW-F2 (cron ISR pour la revalidation)
- `lib/types/index.ts` (type `ContentItem` existant avec `distributionStatus`, `publishedAt`)
- `firestore.indexes.json` existant (vérifier l'index `distributionStatus + publishedAt`)

---

## Notes de planification

- Vérifier que l'index Firestore `contentItems: distributionStatus ASC, publishedAt DESC` existe. Si non, l'ajouter dans `firestore.indexes.json`.
- Les thumbnails des posts dépendent du type de contenu : les Reels/Shorts ont une cover image dans `coverUrl`, les posts texte n'ont peut-être pas de visuel. Gérer les deux cas.
- Point à valider avec Benoit : est-ce que les posts doivent afficher le contenu de la caption (texte) ou juste le visuel + titre ?
