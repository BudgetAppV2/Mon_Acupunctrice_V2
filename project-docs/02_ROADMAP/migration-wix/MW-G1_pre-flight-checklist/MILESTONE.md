# Milestone MW-G1 : Pré-flight checklist

**Type** : Launch
**Vague** : 7
**Priorité** : Critical
**Temps estimé Claude Code** : 2-3h
**Dépendances** : Tout le reste (MW-A* à MW-F*)
**Status** : 🔴 Not started

---

## Objectif

Effectuer une vérification exhaustive et systématique de tout le site avant le switch DNS — Lighthouse, schema.org, responsive, liens cassés, meta tags, accessibilité, contenu — et produire un rapport pass/fail avec les corrections à appliquer.

---

## Contexte minimal

C'est le dernier checkpoint avant la mise en production. Tous les milestones précédents sont complétés, le site est fonctionnel en staging sur `mon-acupunctrice-v2.vercel.app`. Ce milestone ne crée rien de nouveau — il vérifie tout ce qui existe et corrige les problèmes trouvés.

---

## Livrables

- [ ] **Rapport pré-flight** — document structuré avec résultats pass/fail pour chaque vérification, issues trouvées, et corrections appliquées
- [ ] **Corrections appliquées** — tous les problèmes bloquants (fail) sont corrigés dans la branche
- [ ] **Capture Lighthouse** — scores pour chaque page principale (homepage, services, blog, FAQ, tarifs, reserver, contact, a-propos)

---

## Approche technique

**Checklist exhaustive** (dans cet ordre) :

### 1. Performance (Lighthouse)
- [ ] Homepage : Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- [ ] Chaque page service (×4) : mêmes seuils
- [ ] Page /blog et /blog/[slug] (1 article)
- [ ] Page /faq et /faq/[category] (1 catégorie)
- [ ] Page /tarifs, /reserver, /contact, /a-propos
- [ ] LCP < 2.5s sur mobile pour chaque page

### 2. SEO technique
- [ ] `sitemap.xml` accessible et valide (toutes les URLs présentes)
- [ ] `robots.txt` accessible avec `Sitemap:` directive
- [ ] Chaque page a un `<title>` unique
- [ ] Chaque page a une `<meta name="description">` unique et < 160 caractères
- [ ] Chaque page a un H1 unique
- [ ] OG tags présents (og:title, og:description, og:image) sur chaque page
- [ ] Canonical URL configurée sur chaque page
- [ ] Pas de pages orphelines (toutes accessibles depuis la navigation)

### 3. Schema.org
- [ ] `Person` (Judith) validé via validator.schema.org
- [ ] `MedicalClinic` (La Source en Soi) validé
- [ ] `Service` (×4 piliers) validé
- [ ] `FAQPage` (pages FAQ) validé
- [ ] `BlogPosting` (articles) validé — au moins 2 articles testés
- [ ] `BreadcrumbList` présent sur les pages avec breadcrumb

### 4. Responsive
- [ ] Chaque page testée à 375px (mobile) — navigation, contenu, CTAs visibles
- [ ] Chaque page testée à 768px (tablet) — transitions fluides
- [ ] Chaque page testée à 1024px (desktop) — layout complet
- [ ] Header hamburger fonctionne sur mobile
- [ ] CTA sticky visible sur mobile
- [ ] Pas de scroll horizontal accidentel

### 5. Liens et navigation
- [ ] Tous les liens internes fonctionnent (pas de 404)
- [ ] Liens vers Go Rendez-Vous fonctionne et ouvre dans un nouvel onglet
- [ ] Liens vers Google Maps La Source en Soi fonctionne
- [ ] Liens vers les réseaux sociaux fonctionnent
- [ ] Breadcrumbs fonctionnent sur toutes les pages de contenu
- [ ] Navigation header complète et cohérente

### 6. Contenu
- [ ] La Source en Soi mentionnée sur toutes les pages de conversion
- [ ] Badge 4,9/5 affiché là où prévu (homepage, services, /reserver)
- [ ] Vouvoiement respecté partout (pas de tutoiement accidentel)
- [ ] Pas de contenu placeholder ou "Lorem ipsum" restant
- [ ] Pas de `console.log` en production
- [ ] Pas de TODO/FIXME dans le code déployé
- [ ] Noms propres corrects : "Judith Dufour-Savard" (avec trait d'union), "La Source en Soi"

### 7. Accessibilité
- [ ] Contraste WCAG AA sur tous les textes
- [ ] Alt text sur toutes les images
- [ ] Navigation clavier fonctionnelle (Tab, Enter, Escape)
- [ ] Focus states visibles
- [ ] Accordéons FAQ accessibles (ARIA)
- [ ] Skip link "Aller au contenu"

### 8. Redirections
- [ ] Matrice de redirections 301 (MW-A1) implémentée dans `next.config.ts` ou `vercel.json`
- [ ] Chaque ancienne URL Wix redirige vers la bonne nouvelle URL
- [ ] Le backlink `lasourceensoi.com/equipe/judith-dufour-savard/` sera préservé (redirection ou même URL)

### 9. Analytics
- [ ] Script Plausible chargé dans le layout public
- [ ] Script Plausible NON chargé dans le Hub admin
- [ ] Events `cta_click` et `reservation_click` configurés

### 10. Firestore
- [ ] Rules déployées — lecture publique `status == 'published'` fonctionne
- [ ] Rules déployées — lecture publique `status == 'draft'` bloquée
- [ ] Indexes déployés et fonctionnels
- [ ] Données de production présentes (11 articles, 6+ FAQ, pages services)

---

## Fichiers impactés

```
📄 NEW (artefacts produits) :
- MW-G1_pre-flight-checklist/artefacts/rapport-preflight.md
- MW-G1_pre-flight-checklist/artefacts/lighthouse-scores.md

✏️ MODIFY (corrections) :
- Tout fichier où un problème est trouvé
```

---

## Definition of Done

- [ ] Toutes les vérifications de la checklist sont pass (ou justifiées comme non-bloquant)
- [ ] Lighthouse ≥ 95 sur les 4 catégories pour la homepage et au moins 4 autres pages
- [ ] Schema.org validé pour Person, MedicalClinic, Service, FAQPage, BlogPosting
- [ ] Zéro lien cassé
- [ ] Zéro contenu placeholder restant
- [ ] Le rapport pré-flight est complet et lisible
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

Voir la checklist ci-dessus — chaque point est un test.

---

## Contraintes

- Ne pas modifier le contenu éditorial (textes de Judith) — seulement les problèmes techniques
- Ne pas ajouter de features — seulement corriger les problèmes trouvés
- Si un problème nécessite un changement architectural significatif, le documenter comme issue pour un milestone de correction séparé plutôt que de le corriger ici
- Mobile-first — tester sur mobile en premier

---

## Références

- Tous les milestones précédents (MW-A1 à MW-F3)
- Plan stratégique §9.4 (KPIs à tracker)
- CLAUDE.md migration — toutes les sections d'invariants
- MW-A1 (matrice de redirections 301)

---

## Notes de planification

- Ce milestone doit être exécuté sur l'URL staging Vercel (`mon-acupunctrice-v2.vercel.app`), pas en local, pour tester les conditions réelles de production.
- Prévoir 2-3h : 1h de tests, 1-2h de corrections.
- Si les scores Lighthouse sont trop bas, les corrections les plus courantes sont : images non optimisées, CSS inutilisé, fonts trop lourdes, render-blocking scripts.
- Point à valider avec Benoit : est-ce que les redirections 301 doivent être actives dès le déploiement staging, ou uniquement au moment du switch DNS ?
