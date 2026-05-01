# Milestone MW-C4 : Page `/tarifs` optimisée SEO

**Type** : UI
**Vague** : 3
**Priorité** : High
**Temps estimé Claude Code** : 2-3h
**Dépendances** : MW-B1, MW-B3
**Status** : 🔴 Not started

---

## Objectif

Créer la page `/tarifs` qui cible la requête SEO "combien coûte l'acupuncture Montréal" et explique le modèle de tarification solidaire de Judith avec pédagogie et douceur, sans barrière psychologique.

---

## Contexte minimal

Les requêtes "combien coûte" sont transactionnelles directes (plan §3.2) — la personne est en fin de parcours et cherche le prix avant de réserver. La page tarifs est un point stratégique du funnel. Le modèle solidaire de Judith (le/la patient·e choisit son tarif) est un différenciateur majeur mais peut créer de la confusion — la page doit expliquer sans gêne et normaliser le choix.

---

## Livrables

- [ ] **Page `app/(public)/tarifs/page.tsx`** — Server Component avec : explication du modèle solidaire, échelle de tarifs, FAQ courtes, CTA vers `/reserver`
- [ ] **Metadata SEO** optimisée pour "combien coûte acupuncture Montréal / Rosemont / tarif solidaire"
- [ ] **Schema.org** — `Service` avec `priceRange` ou `offers`

---

## Approche technique

**Sections de la page** :

1. **H1** — "Tarifs — Acupuncture à tarification solidaire à Rosemont"
2. **Introduction** — explication du modèle solidaire en "je" de Judith : pourquoi, comment, pour qui. Ton empathique, pas de gêne. Référence au positionnement d'accessibilité (plan §2.1, pilier acupuncture sociale)
3. **Échelle de tarifs** — présentation claire de la fourchette **35 $ à 50 $ par séance** avec message "Vous choisissez le montant qui vous convient, selon votre capacité". Design soigné, pas un tableau clinique. **Important** : pas de palier rigide, c'est une vraie fourchette où la personne choisit librement.
4. **Section "Comment choisir votre tarif"** — 3-4 points courts pour normaliser, sans pallier rigide : "Si vous avez un revenu confortable, choisissez plutôt 50 $...", "Si vous êtes étudiant·e, en situation précaire, ou que le coût est un frein réel, choisissez 35 $ — c'est exactement pour ça que la fourchette existe...", "Pour tout ce qui est entre les deux, faites-vous confiance". Déstigmatisation explicite — insister sur le fait que choisir 35 $ est **normal**, pas un aveu de pauvreté.
5. **Ce que comprend une séance** — 3-4 points (durée, consultation, traitement, suivi)
6. **Assurances** — mention des assurances privées qui couvrent l'acupuncture (avec numéro d'ordre professionnel de Judith)
7. **CTA** — "Réserver une séance" → `/reserver`

**Contenu** : le texte sera rédigé en respectant le ton du guide de ton (MW-A3). Les informations tarifaires exactes sont **confirmées : fourchette 35 à 50 $** (voir `docs/migration-wix/DECISIONS_Q1-Q16.md` Q1).

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/tarifs/page.tsx
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] La page affiche les tarifs de manière claire et pédagogique
- [ ] Le modèle solidaire est expliqué sans gêne ni condescendance
- [ ] La page mentionne La Source en Soi
- [ ] CTA vers `/reserver` présent
- [ ] Lighthouse 95+ sur la page
- [ ] Schema.org validé
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px et 1024px
- **SEO** : meta tags (title incluant "tarifs" et "Montréal"), schema.org
- **Contenu** : vérifier que le ton est chaleureux et non stigmatisant

---

## Contraintes

- Ne pas modifier le code du Hub admin
- **Tarifs confirmés : 35 $ à 50 $** (14 avril 2026). Fourchette continue, pas de palier rigide.
- Le tarif Lumino (70-90 $) est le tarif standard du marché — peut être mentionné en comparaison pour montrer l'accessibilité, mais ne pas le mettre en avant au détriment du tarif solidaire
- Vouvoiement + "je" de Judith
- Mobile-first 375px
- Pas d'emojis

---

## Références

- Plan stratégique §3.2 (keywords "combien coûte"), §9.1 (CTA page tarifs)
- CLAUDE.md migration — positionnement acupuncture sociale
- Scouting R4 (Lumino Health : tarif 70-90 $ affiché)
- MW-B3 (`<SectionHeading />`, `<CtaButton />`, `<ClinicBadge />`)

---

## Notes de planification

- **Tarifs : RÉSOLU** — fourchette 35-50 $ confirmée par Benoit le 14 avril 2026. Voir `docs/migration-wix/DECISIONS_Q1-Q16.md` Q1.
- Point à valider : est-ce que Judith a un numéro de membre de l'Ordre des acupuncteurs à afficher pour les remboursements d'assurance ? (probablement dans l'inventaire MW-A1)
- Le wording de la section "Comment choisir votre tarif" est délicat — doit normaliser sans culpabiliser ni infantiliser. Référence : le check-list proposé dans le plan §6.3 ("Comment choisir votre tarif sur l'échelle solidaire").
- La fourchette **35-50 $ est significativement plus accessible** que le marché standard (70-90 $ chez Lumino). C'est un argument SEO/positionnement fort — peut être mentionné dans la meta description : "Acupuncture à Montréal à tarif accessible (35-50 $), spécialisée fertilité et grossesse à la clinique La Source en Soi".
