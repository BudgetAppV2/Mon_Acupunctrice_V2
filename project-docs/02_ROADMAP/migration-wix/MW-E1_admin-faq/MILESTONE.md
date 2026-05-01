# Milestone MW-E1 : Admin Hub CRUD FAQ

**Type** : Admin
**Vague** : 5
**Priorité** : High
**Temps estimé Claude Code** : 3-4h
**Dépendances** : MW-B2
**Status** : 🔴 Not started

---

## Objectif

Créer l'interface admin dans le Hub pour que Judith puisse créer, modifier, supprimer et publier des FAQ depuis `(app)/site-public/faqs/`, avec le workflow `draft → pending → published`.

---

## Contexte minimal

L'amendement A2 définit un workflow de publication programmatique : le contenu peut être créé par le cron Claude (en `draft`), reviewé par Judith (en `pending`), puis publié (`published`). L'admin FAQ est la première interface de ce workflow dans le Hub. Elle cohabite avec les routes `(app)/` existantes sans les modifier.

---

## Livrables

- [ ] **Page liste `app/(app)/site-public/faqs/page.tsx`** — liste des FAQ avec filtrage par catégorie et statut, compteurs par état, tri par date
- [ ] **Page création/édition `app/(app)/site-public/faqs/[id]/page.tsx`** — formulaire CRUD avec : question, réponse (textarea markdown), catégorie, ordre, relations (services liés, articles liés, FAQ liées), CTA variant, statut
- [ ] **Hook `useFaqAdmin`** — CRUD Firestore pour la collection `faqs` (create, update, delete, updateStatus)
- [ ] **Navigation** — ajout du lien "Site public" dans le menu du Hub (sans casser la nav existante)

---

## Approche technique

**Page liste** :
- Client Component (interactions filtrage/tri)
- Query Firestore `faqs` sans filtre de status (admin voit tout : draft, pending, published)
- Badges colorés par statut : draft (gris), pending (jaune), published (vert)
- Actions par FAQ : Éditer, Supprimer (avec confirmation), Changer le statut
- Filtres : catégorie (dropdown 5 options), statut (dropdown 3 options)

**Page édition** :
- Client Component
- Formulaire avec les champs du schéma MW-B2 :
  - Question (input texte)
  - Réponse (textarea markdown avec preview basique)
  - Catégorie (select : fertilite, grossesse, pediatrie, acupuncture-sociale, seance)
  - Ordre (number input)
  - CTA variant (select : reserver, contact, tarifs)
  - Statut (select : draft, pending, published)
  - Relations (multiselect ou tags pour services/articles/FAQ liés)
- Mode création (`/site-public/faqs/new`) et mode édition (`/site-public/faqs/[id]`)
- Boutons : Sauvegarder brouillon, Mettre en review, Publier, Supprimer

**Hook `useFaqAdmin`** :
```typescript
function useFaqAdmin() {
  return {
    faqs: FAQ[],
    loading: boolean,
    createFaq: (data: Partial<FAQ>) => Promise<string>,
    updateFaq: (id: string, data: Partial<FAQ>) => Promise<void>,
    deleteFaq: (id: string) => Promise<void>,
    updateStatus: (id: string, status: FAQ['status']) => Promise<void>,
  }
}
```

**Design** : utiliser les tokens du Hub admin (`sage`, `sand`) — PAS les tokens `public-*` de la v4. L'admin est dans l'espace `(app)/` et doit être cohérent avec le reste du Hub.

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(app)/site-public/faqs/page.tsx
- app/(app)/site-public/faqs/[id]/page.tsx
- lib/hooks/useFaqAdmin.ts

✏️ MODIFY (fichiers existants) :
- app/(app)/layout.tsx ou composant de navigation (ajout lien "Site public")
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Naviguer vers `/site-public/faqs` affiche la liste des FAQ (requiert auth)
- [ ] Créer une FAQ en draft fonctionne — vérifiable dans la console Firebase
- [ ] Modifier une FAQ existante fonctionne (question, réponse, catégorie)
- [ ] Changer le statut draft → pending → published fonctionne
- [ ] Supprimer une FAQ demande confirmation et supprime bien le document
- [ ] Le Hub admin existant (calendrier, idées, etc.) fonctionne sans régression
- [ ] Le design utilise les tokens Hub (`sage`, `sand`), pas les tokens publics
- [ ] Chaque composant < 150 lignes
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Fonctionnel** : créer, éditer, supprimer une FAQ — vérifier dans Firestore
- **Workflow** : changer le statut draft → pending → published → vérifier que la FAQ apparaît sur le site public
- **Régression** : les pages calendrier, idées, profil, stats fonctionnent normalement
- **Visual** : 375px — formulaire utilisable sur mobile

---

## Contraintes

- Ne pas modifier les composants du Hub admin existants (sauf l'ajout minimal du lien de navigation)
- Design Hub (`sage`, `sand`), pas design public (`public-*`)
- L'admin CRUD est protégé par l'auth existante (`useAuth()`) — seul Judith y accède
- Le formulaire doit être utilisable par un non-développeur (Judith) — labels clairs, pas de jargon technique
- Ne pas créer de middleware d'auth — l'auth client-side existante suffit
- Mobile-first 375px
- Pas d'emojis — Heroicons uniquement

---

## Références

- Amendement A2 (workflow draft/pending/published)
- MW-B2 (schéma FAQ)
- Plan stratégique §5 (plan FAQ)
- CLAUDE.md racine — section "Architecture actuelle critique" pour comprendre les patterns du Hub admin
- `lib/hooks/` existants (useCalendar, useContentItems, etc.) pour le pattern de hooks

---

## Notes de planification

- La route `(app)/site-public/` est un nouveau sous-arbre dans le Hub admin. Il pourrait accueillir aussi l'admin ressources (MW-E2), le blog publish (MW-E3) et le workflow review (MW-E4).
- Le textarea markdown est simple — pas besoin d'un éditeur WYSIWYG au lancement. Un textarea avec preview côte à côte serait un bonus mais pas obligatoire.
- Les champs relationnels (relatedServices, relatedArticles, relatedFaqs) sont compliqués à implémenter en UI (multiselect avec recherche). Au MVP, un simple input texte avec slugs séparés par virgule peut suffire. L'UX sera améliorée si nécessaire.
- Point à valider avec Benoit : où exactement placer le lien "Site public" dans la nav du Hub ? Nouvel onglet dans la BottomTabBar, ou dans le menu Profil ?
