# Milestone MW-E2 : Admin Hub CRUD Ressources

**Type** : Admin
**Vague** : 5
**Priorité** : High
**Temps estimé Claude Code** : 3-4h
**Dépendances** : MW-B2
**Status** : 🔴 Not started

---

## Objectif

Créer l'interface admin dans le Hub pour que Judith puisse créer, modifier et publier des ressources depuis `(app)/site-public/ressources/`, avec le même workflow `draft → pending → published` que les FAQ.

---

## Contexte minimal

Les ressources sont le contenu long et référentiel (guides, checklists, articles de fond) qui renforce l'autorité SEO. L'admin ressources suit le même pattern que l'admin FAQ (MW-E1) mais avec des champs additionnels : type de ressource, pilier, citations scientifiques, image de couverture.

---

## Livrables

- [ ] **Page liste `app/(app)/site-public/ressources/page.tsx`** — liste des ressources avec filtrage par pilier, type et statut
- [ ] **Page création/édition `app/(app)/site-public/ressources/[id]/page.tsx`** — formulaire CRUD avec tous les champs du schéma `Ressource` (MW-B2), incluant un éditeur de citations scientifiques
- [ ] **Hook `useRessourceAdmin`** — CRUD Firestore pour la collection `ressources`
- [ ] **Gestion des citations** — interface pour ajouter/modifier/supprimer des citations scientifiques (auteurs, titre, journal, année, URL PubMed)

---

## Approche technique

**Pattern identique à MW-E1** (page liste + page édition + hook CRUD), adapté aux champs spécifiques de `Ressource` :

**Champs du formulaire** :
- Titre (input texte)
- Slug (auto-généré depuis le titre, éditable)
- Type (select : guide, checklist, article-fond, infographie)
- Pilier (select : fertilite, grossesse, pediatrie, acupuncture-sociale, transversal)
- Contenu (textarea markdown)
- Extrait (textarea courte)
- Image de couverture (upload ou URL)
- Citations scientifiques (liste dynamique avec formulaire inline : auteurs, titre, journal, année, URL)
- Relations (services liés, FAQ liées, articles liés)
- Statut (draft, pending, published)

**Gestion des citations** :
- Bouton "Ajouter une citation" qui ajoute une ligne de formulaire
- Champs par citation : Auteurs (texte), Titre (texte), Journal (texte), Année (number), URL (texte optionnel)
- Bouton "Supprimer" par citation
- Les citations sont stockées comme array dans le document Firestore (pas de sous-collection)

**Design** : tokens Hub (`sage`, `sand`), cohérent avec MW-E1.

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(app)/site-public/ressources/page.tsx
- app/(app)/site-public/ressources/[id]/page.tsx
- lib/hooks/useRessourceAdmin.ts
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Créer une ressource avec 2 citations scientifiques fonctionne
- [ ] Modifier et supprimer une ressource fonctionne
- [ ] Le workflow draft → pending → published fonctionne
- [ ] Les citations sont correctement stockées dans Firestore (array de Citation)
- [ ] Le Hub admin existant fonctionne sans régression
- [ ] Chaque composant < 150 lignes
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Fonctionnel** : CRUD ressource complet avec citations
- **Workflow** : changement de statut → vérifier dans Firestore
- **Régression** : Hub admin existant fonctionne normalement
- **Visual** : 375px — formulaire utilisable sur mobile

---

## Contraintes

- Design Hub (`sage`, `sand`), pas design public
- Protégé par l'auth client-side existante
- Les citations doivent être réelles et vérifiables — l'interface ne valide pas le contenu mais doit encourager la rigueur (labels clairs : "Auteurs", "Journal scientifique", "Année de publication", "Lien PubMed / DOI")
- Mobile-first 375px
- Pas d'emojis
- Composants < 150 lignes

---

## Références

- Amendement A1 (citations scientifiques dans les ressources)
- Amendement A2 (workflow draft/pending/published)
- MW-B2 (schéma `Ressource` avec type `Citation`)
- Plan stratégique §6 (plan ressources)
- MW-E1 (pattern admin FAQ à réutiliser)

---

## Notes de planification

- Ce milestone suit le même pattern que MW-E1. Beaucoup de code peut être partagé (composants de liste, composants de formulaire, pattern de hook CRUD). Envisager d'extraire un composant `<AdminListPage />` et `<AdminFormPage />` réutilisables.
- L'upload d'image de couverture peut être simple au lancement : input URL vers Firebase Storage (les images sont uploadées manuellement). Un upload drag-and-drop serait un bonus post-MVP.
- Point à valider avec Benoit : est-ce que Judith va réellement éditer des citations scientifiques elle-même, ou est-ce que Benoit/Claude les prépare ? Ça influence le niveau de polish de l'interface citations.
