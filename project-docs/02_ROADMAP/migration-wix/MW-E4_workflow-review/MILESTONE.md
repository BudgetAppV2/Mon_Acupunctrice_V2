# Milestone MW-E4 : UI de review — brouillons → pending → publié

**Type** : Admin
**Vague** : 5
**Priorité** : Medium
**Temps estimé Claude Code** : 2-3h
**Dépendances** : MW-E1, MW-E2
**Status** : 🔴 Not started

---

## Objectif

Créer une vue de review centralisée dans le Hub à `(app)/site-public/review/` qui agrège tous les contenus en `draft` et `pending` (FAQ, ressources, articles blog) pour que Judith puisse les valider ou rejeter d'un seul endroit.

---

## Contexte minimal

L'amendement A2 définit un workflow de publication avec 3 états. MW-E1 et MW-E2 permettent de gérer les FAQ et ressources individuellement. Ce milestone crée une vue transversale qui donne à Judith une vision d'ensemble de tout ce qui attend sa validation — surtout utile quand le cron de rafraîchissement (MW-F2) produit du contenu automatiquement en `draft`.

---

## Livrables

- [ ] **Page `app/(app)/site-public/review/page.tsx`** — dashboard de review avec 3 onglets : "Brouillons" (draft), "En review" (pending), "Récemment publié" (published récents)
- [ ] **Composant `<ReviewCard />`** — card unifiée pour afficher FAQ, ressource ou article avec : type (badge), titre, extrait, date de création, actions (Éditer, Valider, Rejeter, Publier)
- [ ] **Actions en lot** — possibilité de publier ou rejeter plusieurs contenus à la fois

---

## Approche technique

**Page review** :
- Client Component (interactions onglets, actions)
- Query Firestore sur 3 collections : `faqs`, `ressources`, `publicBlog` — filtrées par `status != 'published'` (ou par status spécifique selon l'onglet)
- Agrégation côté client des résultats des 3 queries
- 3 onglets ou sections :
  - **Brouillons** : `status == 'draft'` — contenu généré par le cron, pas encore vu par Judith
  - **En review** : `status == 'pending'` — contenu vu par Judith, en attente de publication
  - **Récemment publié** : `status == 'published'` + `publishedAt` dans les 7 derniers jours — pour suivi

**`<ReviewCard />`** :
- Badge type : "FAQ" (bleu), "Ressource" (violet), "Article" (vert)
- Badge catégorie/pilier
- Titre et extrait (premiers 100 caractères)
- Date de création
- Actions :
  - **Éditer** → redirige vers la page d'édition (`/site-public/faqs/[id]` ou `/site-public/ressources/[id]`)
  - **Valider** → passe de `draft` à `pending`
  - **Publier** → passe à `published` avec `publishedAt = now`
  - **Rejeter** → supprime ou passe à un état archivé

**Actions en lot** :
- Checkboxes sur chaque card
- Boutons en haut : "Publier la sélection", "Rejeter la sélection"
- Confirmation avant action destructive (rejet)

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(app)/site-public/review/page.tsx
- app/(app)/site-public/_components/ReviewCard.tsx
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] La page review affiche les contenus draft et pending des 3 collections
- [ ] Les onglets filtrent correctement par statut
- [ ] Valider un brouillon le passe en `pending` dans Firestore
- [ ] Publier un contenu le passe en `published` avec `publishedAt`
- [ ] Les actions en lot fonctionnent (sélection + publication groupée)
- [ ] Le Hub admin existant fonctionne sans régression
- [ ] Le design utilise les tokens Hub (`sage`, `sand`)
- [ ] Composants < 150 lignes
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Fonctionnel** : créer un brouillon FAQ (MW-E1) → vérifier qu'il apparaît dans la page review → le valider → le publier → vérifier qu'il apparaît sur le site public
- **Lot** : sélectionner 2 brouillons → publier en lot → vérifier dans Firestore
- **Régression** : Hub admin existant fonctionne normalement
- **Visual** : 375px — la page review est utilisable sur mobile

---

## Contraintes

- Design Hub (`sage`, `sand`)
- L'action "Rejeter" ne supprime pas définitivement — elle passe en `draft` avec un flag ou supprime selon la préférence de Benoit
- L'interface doit être utilisable par un non-développeur (Judith)
- Mobile-first 375px
- Pas d'emojis
- Composants < 150 lignes

---

## Références

- Amendement A2 (workflow draft/pending/published)
- MW-E1 (admin FAQ), MW-E2 (admin ressources)
- MW-F2 (cron qui produit du contenu en draft — la raison d'être de cette vue review)

---

## Notes de planification

- Cette page est surtout utile quand le cron MW-F2 est actif (production automatique de FAQ/ressources). Avant ça, les FAQ et ressources sont créées manuellement via MW-E1/E2. La page review peut donc être considérée comme un nice-to-have au lancement strict, mais elle est nécessaire pour le workflow complet.
- Les 3 queries Firestore (une par collection) pourraient être coûteuses si les collections sont volumineuses. Au lancement, le volume est faible (~20 FAQ, 2-3 ressources, 11 articles), donc pas de problème.
- Point à valider avec Benoit : est-ce que "Rejeter" = supprimer définitivement ou = remettre en draft ? Supprimer est plus simple mais risqué si Judith rejette par erreur.


---

## Décisions 14 avril 2026 (post-reverse-planning)

**Q11 — "Rejeter" un contenu = supprimer ou remettre en draft ?** → **Remettre en draft, jamais de delete hard**.

**Impact sur le schéma Firestore** (à ajuster avec MW-B2) : ajouter 3 champs aux collections `faqs`, `ressources`, `publicBlog`, `servicePages` :

```typescript
status: 'draft' | 'pending' | 'published' | 'rejected'  // ajout de 'rejected'
rejectionReason?: string   // raison du rejet (obligatoire si status === 'rejected')
rejectedAt?: Timestamp
rejectedBy?: string        // 'judith' | 'benoit' ou UID
```

**Comportement** :
- Un contenu "rejeté" **reste dans Firestore** avec status = 'rejected'
- L'admin Hub affiche un badge "Rejeté" rouge + la raison
- L'éditeur peut corriger et repasser en draft → pending → published
- Les Firestore rules : lecture publique **uniquement** si `status === 'published'`. Les contenus rejetés ne sont pas exposés au site public.

**UI** dans l'admin review :
- Filtres : Brouillons | En review | Publiés | **Rejetés** | Tout
- Bouton "Rejeter" ouvre un modal qui demande la raison (obligatoire, min 10 caractères)
- Bouton "Remettre en draft" disponible sur les contenus rejetés

**Référence** : `docs/migration-wix/DECISIONS_Q1-Q16.md`
