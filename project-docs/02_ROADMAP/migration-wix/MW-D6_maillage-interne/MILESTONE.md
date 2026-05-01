# Milestone MW-D6 : Maillage interne — `<RelatedContent />` + liens contextuels

**Type** : Admin
**Vague** : 4
**Priorité** : High
**Temps estimé Claude Code** : 2-3h
**Dépendances** : MW-D2, MW-D4, MW-D5
**Status** : 🔴 Not started

---

## Objectif

Implémenter le maillage interne automatique entre les pages du site — composant `<RelatedContent />` en bas de chaque page de contenu et composant `<ContextualLink />` pour les liens internes dans le markdown — pour renforcer l'architecture hub-and-spoke et distribuer l'autorité SEO.

---

## Contexte minimal

Le maillage interne est un des leviers SEO les plus sous-estimés et les plus rentables (plan §4.4). Chaque page de contenu doit pointer vers son hub service et vers les contenus liés. Les champs `relatedServices`, `relatedArticles`, `relatedFaqs` dans les schémas Firestore (MW-B2) existent déjà — ce milestone les exploite dans l'UI.

---

## Livrables

- [ ] **Composant `<RelatedContent />`** — section "Contenus liés" en bas de chaque page de contenu (blog, FAQ, ressources), affichant les articles/FAQ/ressources liés depuis les champs Firestore
- [ ] **Composant `<ContextualLink />`** — helper pour insérer des liens internes avec ancres SEO-friendly dans le markdown rendu
- [ ] **Intégration** dans les pages blog (`/blog/[slug]`), FAQ (`/faq/[category]`), et ressources (`/ressources/[slug]`)
- [ ] **Population des champs relationnels** — script ou mise à jour manuelle pour relier les contenus existants entre eux

---

## Approche technique

**`<RelatedContent />`** (`app/(public)/_components/RelatedContent.tsx`) :
- Props : `relatedServices: string[]`, `relatedArticles: string[]`, `relatedFaqs: string[]`
- Query Firestore pour résoudre les slugs en titres/URLs
- Affichage en 3 sections optionnelles : "Services liés", "Articles liés", "Questions fréquentes liées"
- Chaque lien avec ancre descriptive (pas "cliquez ici" — plan §4.4.3)
- Server Component (queries côté serveur)

**`<ContextualLink />`** :
- Un composant React qui remplace les patterns `[lien:slug]` ou `[[slug|texte]]` dans le markdown rendu par des liens internes Next.js avec `<Link href>`.
- Alternative : enrichir le renderer markdown (MW-D2) avec un plugin qui détecte les liens internes et les convertit en `<Link>`.

**Intégration** :
- Page article (`/blog/[slug]`) : ajouter `<RelatedContent />` en bas, alimenté par les champs de l'article
- Page FAQ catégorie (`/faq/[category]`) : ajouter une section "Articles de blog liés" en bas de la page
- Page ressource (`/ressources/[slug]`) : ajouter `<RelatedContent />` en bas

**Population des relations** :
Script one-shot ou mise à jour via la console Firebase qui :
1. Lie chaque FAQ fertilité au service `/services/fertilite`
2. Lie les articles blog aux services correspondants
3. Lie les FAQ entre elles quand complémentaires
4. Respecte la règle : pas plus de 1-2 liens cross-pilier (plan §4.4.3)

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/_components/RelatedContent.tsx
- app/(public)/_components/ContextualLink.tsx
- scripts/populate-relations.ts (optionnel)

✏️ MODIFY (fichiers existants) :
- app/(public)/blog/[slug]/page.tsx (ajouter <RelatedContent />)
- app/(public)/faq/[category]/page.tsx (ajouter section articles liés)
- app/(public)/ressources/[slug]/page.tsx (ajouter <RelatedContent />)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Les pages blog affichent une section "Contenus liés" avec au moins 1 lien vers un service
- [ ] Les pages FAQ affichent des liens vers les articles de blog liés
- [ ] Les ancres des liens sont descriptives (pas "cliquez ici")
- [ ] Les liens internes utilisent le composant `<Link>` de Next.js (pas de `<a>` externes)
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px et 1024px — section RelatedContent sur une page article
- **Navigation** : les liens internes mènent bien aux bonnes pages
- **SEO** : les ancres sont descriptives, pas de liens en doublon sur la même page

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Pas plus de 3-8 liens sortants contextuels par page (plan §4.4.3)
- Pas plus de 1-2 liens cross-pilier par article
- Les liens externes (`rel="noopener"`) sont OK pour les citations scientifiques
- Mobile-first 375px
- Composants < 150 lignes

---

## Références

- Plan stratégique §4.4 (stratégie maillage interne complète), §4.4.1 (hub-and-spoke), §4.4.2 (types de liens), §4.4.3 (règles de linking), §4.4.4 (implémentation technique)
- MW-B2 (champs relationnels dans les schémas)
- MW-D2, MW-D4, MW-D5 (pages à enrichir)

---

## Notes de planification

- La population des relations est le travail le plus fastidieux — avec seulement 6 FAQ et 11 articles, c'est faisable manuellement. Quand le volume augmente, l'admin Hub (MW-E1/E2) permettra de gérer les relations.
- Le script de vérification du graphe de liens (page orpheline, liens cassés) mentionné dans le plan §4.4.4 est post-MVP — ne pas le faire dans ce milestone.
- Point à valider avec Benoit : est-ce que les relations entre contenus doivent être bidirectionnelles (si A → B, alors B → A) ou unidirectionnelles ?
